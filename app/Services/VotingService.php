<?php

namespace App\Services;

use App\Enums\ElectionStatus;
use App\Exceptions\ElectionPausedException;
use App\Models\AdminAuditLog;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Position;
use App\Models\Vote;
use App\Models\VoterParticipation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class VotingService
{
    /**
     * Total quarantined votes threshold before pausing the election.
     */
    private const QUARANTINE_HALT_THRESHOLD = 20;

    /**
     * Submit a student's ballot for an election.
     *
     * The integrity check (getLatestValidVote) runs BEFORE the ballot
     * transaction so that any quarantine or election-pause writes are
     * truly independent — a subsequent rollback of the ballot attempt
     * cannot undo a detected quarantine or pause. A guard assertion
     * warns if an outer transaction is already active (which would
     * defeat that guarantee).
     *
     * Once a clean predecessor hash is obtained the ballot is written
     * inside a single DB::transaction(). The election row is re-fetched
     * with lockForUpdate() inside the transaction to serialise chain-head
     * access, preventing two concurrent voters from linking to the same
     * predecessor.
     *
     * @param  array<int, array{position_id: int|string, candidate_id: int|string}>  $ballot
     * @return array{receipt: string, count: int}
     *
     * @throws ElectionPausedException
     * @throws \RuntimeException
     */
    public function castBallot(Election $election, string $studentId, array $ballot): array
    {
        if (DB::transactionLevel() > 0) {
            throw new \RuntimeException(
                'castBallot called inside an active transaction — durability would be compromised.'
            );
        }

        $hashedId = $this->hashStudentId($studentId);

        // ── Pre-flight checks (fast, no transaction needed) ──────────

        if ($election->isPaused()) {
            throw new ElectionPausedException(
                'This election is currently paused for an integrity review.'
            );
        }

        if (! $election->isActive()) {
            throw new \RuntimeException('This election is not currently active.');
        }

        if ($this->hasVoted($election, $studentId)) {
            throw new \RuntimeException('You have already voted in this election.');
        }

        if (empty($ballot)) {
            throw new \RuntimeException('Ballot cannot be empty.');
        }

        // Validate ballot structure: each entry must have position_id and candidate_id
        foreach ($ballot as $i => $selection) {
            if (empty($selection['position_id']) || empty($selection['candidate_id'])) {
                throw new \RuntimeException("Ballot entry {$i} is missing position_id or candidate_id.");
            }
        }

        // Enforce max_selections: group by position and check against limits.
        // Also verify every election position is covered at least once.
        $positions = Position::where('election_id', $election->id)->get()->keyBy('id');

        if ($positions->isEmpty()) {
            throw new \RuntimeException('This election has no positions configured.');
        }

        $selectionsByPosition = [];
        foreach ($ballot as $selection) {
            $pid = $selection['position_id'];
            $selectionsByPosition[$pid][] = $selection;
        }

        // Reject any ballot entry whose position_id does not belong to this
        // election — prevents silent acceptance of stale/foreign positions.
        foreach ($selectionsByPosition as $pid => $selections) {
            if (! isset($positions[$pid])) {
                throw new \RuntimeException('Ballot contains a position that does not belong to this election.');
            }
        }

        foreach ($positions as $pos) {
            $selected = $selectionsByPosition[$pos->id] ?? [];

            if (empty($selected)) {
                throw new \RuntimeException("No selection made for position: {$pos->title}.");
            }

            if (count($selected) > $pos->max_selections) {
                throw new \RuntimeException(
                    "Too many selections for {$pos->title} (max {$pos->max_selections})."
                );
            }

            // No duplicate candidate within the same position
            $candidateIds = array_column($selected, 'candidate_id');
            if (count($candidateIds) !== count(array_unique($candidateIds))) {
                throw new \RuntimeException("Duplicate candidate selection in position: {$pos->title}.");
            }
        }

        // ── Integrity scan (OUTSIDE the ballot transaction) ──────────
        // Walking back through history to quarantine old tampered rows
        // and check the pause threshold is about auditing the past —
        // correct to decouple from the ballot write for durability.
        // The chain-head hash itself is read inside the transaction
        // after the lock, so concurrent voters see a consistent head.

        $this->getLatestValidVote($election);

        // ── Ballot writes (single transaction) ───────────────────────

        return DB::transaction(function () use ($election, $hashedId, $ballot) {
            // Re-fetch with a lock so the read of the chain head and
            // the write of new votes happen together — no two voters
            // can read the same head and fork the chain.
            $_election = Election::where('id', $election->id)->lockForUpdate()->firstOrFail();

            if (! $_election->isActive()) {
                throw new \RuntimeException('This election is no longer active.');
            }

            // Re-read the chain head NOW, under the lock, so it reflects
            // anything another voter committed while we were waiting.
            $lastVote = Vote::where('election_id', $_election->id)
                ->where('status', 'valid')
                ->orderBy('id', 'desc')
                ->first();

            $previousHash = $lastVote
                ? $lastVote->current_hash
                : $this->computeHash('GENESIS_BLOCK', 0, '');

            // Re-check participation inside the transaction with the lock held.
            // The DB-level unique constraint is the hardware-backed safety net.
            if (VoterParticipation::where('election_id', $_election->id)
                ->where('hashed_student_id', $hashedId)->exists()) {
                throw new \RuntimeException('You have already voted in this election.');
            }

            $receipt = $this->generateReceipt();
            $chain = $previousHash;
            $votesCast = 0;

            foreach ($ballot as $selection) {
                $candidate = Candidate::where('id', $selection['candidate_id'])
                    ->where('election_id', $_election->id)
                    ->where('position_id', $selection['position_id'])->first();

                if (! $candidate) {
                    throw new \RuntimeException('Invalid candidate selection.');
                }

                $chain = $this->computeHash($receipt, $candidate->id, $chain);

                Vote::create([
                    'election_id' => $_election->id,
                    'position_id' => $selection['position_id'],
                    'candidate_id' => $selection['candidate_id'],
                    'receipt_token' => $receipt,
                    'previous_hash' => $previousHash,
                    'current_hash' => $chain,
                    'status' => 'valid',
                ]);

                $previousHash = $chain;
                $votesCast++;
            }

            VoterParticipation::create([
                'election_id' => $_election->id,
                'hashed_student_id' => $hashedId,
                'voted_at' => now(),
            ]);

            return ['receipt' => $receipt, 'count' => $votesCast];
        });
    }

    /**
     * Fetch the last valid vote, verifying cross-row chain linkage.
     *
     * Two checks are performed on each candidate row:
     *   1. Self-consistency — does the row hash to its own current_hash?
     *   2. Cross-row linkage — does previous_hash match the actual
     *      preceding valid row's current_hash?
     *
     * Failing rows are quarantined immediately (no transaction wrapper —
     * the single UPDATE is atomic on its own, and the caller ensures this
     * runs outside any rollback-prone scope). The election's
     * `quarantine_count` column is atomically incremented on each
     * quarantine and re-read from the database every loop iteration, so
     * the threshold is enforced system-wide even under concurrent calls.
     * When the counter reaches the threshold the election is paused and
     * the counter is reset to zero on the next `resumeElection()`.
     *
     * Called OUTSIDE the ballot transaction so quarantine and pause
     * writes are independent — a later ballot rollback cannot undo them.
     *
     * @throws ElectionPausedException
     */
    private function getLatestValidVote(Election $election): ?Vote
    {
        while (true) {
            // Read the live, atomic quarantine counter each iteration so
            // that concurrent calls observe each other's increments and
            // the threshold is enforced system-wide, not per-call.
            $currentQuarantineCount = (int) ($election->fresh()->quarantine_count ?? 0);

            if ($currentQuarantineCount >= self::QUARANTINE_HALT_THRESHOLD) {
                $this->pauseElection($election, $currentQuarantineCount);

                throw new ElectionPausedException(
                    'Voting is temporarily unavailable for this election. Please try again later.'
                );
            }

            $lastVote = Vote::where('election_id', $election->id)
                ->where('status', 'valid')
                ->orderBy('id', 'desc')
                ->first();

            if (! $lastVote) {
                return null;
            }

            // 1. Self-consistency
            $expected = $this->computeHash(
                $lastVote->receipt_token,
                $lastVote->candidate_id,
                $lastVote->previous_hash
            );

            if ($expected === $lastVote->current_hash) {
                // 2. Cross-row linkage
                $predecessor = Vote::where('election_id', $election->id)
                    ->where('status', 'valid')
                    ->where('id', '<', $lastVote->id)
                    ->orderBy('id', 'desc')
                    ->first();

                if ($predecessor && $lastVote->previous_hash !== $predecessor->current_hash) {
                    $this->quarantineRow($lastVote, $election, $currentQuarantineCount + 1);

                    continue;
                }

                return $lastVote;
            }

            $this->quarantineRow($lastVote, $election, $currentQuarantineCount + 1);
        }
    }

    /**
     * Quarantine a tampered vote row.
     *
     * This runs outside any transaction that could roll back — the
     * single UPDATE is atomic. No DB::transaction() wrapper is used
     * because the method is called from outside the ballot transaction
     * by design, and wrapping it would create a savepoint (not a
     * durable commit) if an outer transaction were active.
     */
    private function quarantineRow(Vote $vote, Election $election, int $count): void
    {
        if (DB::transactionLevel() > 0) {
            throw new \RuntimeException(
                'quarantineRow called inside an active transaction — durability would be compromised.'
            );
        }

        $affected = Vote::where('id', $vote->id)->where('status', 'valid')->update(['status' => 'quarantined']);

        if ($affected) {
            $election->increment('quarantine_count');
        }

        Log::critical('Vote tampering detected and quarantined.', [
            'vote_id' => $vote->id,
            'election_id' => $election->id,
            'total_quarantined' => $count,
            'already_quarantined' => $affected === 0,
        ]);
    }

    /**
     * Pause an election and record the reason.
     *
     * No DB::transaction() wrapper — the UPDATE is a single atomic
     * statement and this runs outside any rollback-prone scope.
     */
    private function pauseElection(Election $election, int $count): void
    {
        if (DB::transactionLevel() > 0) {
            throw new \RuntimeException(
                'pauseElection called inside an active transaction — durability would be compromised.'
            );
        }

        $election->update([
            'status' => ElectionStatus::PausedForReview,
            'paused_at' => now(),
            'pause_reason' => "Halted: {$count} total tampered votes detected.",
        ]);

        Log::critical('Election paused for integrity review.', [
            'election_id' => $election->id,
            'total_tampered' => $count,
        ]);
    }

    /**
     * Resume a paused election after administrator review.
     *
     * Resets the quarantine counter so that getLatestValidVote does not
     * immediately re-pause on the next ballot (which would read the stale
     * count of previously-reviewed quarantined votes).
     */
    public function resumeElection(Election $election, int $adminId): void
    {
        DB::transaction(function () use ($election, $adminId) {
            $election->update([
                'status' => ElectionStatus::Active,
                'quarantine_count' => 0,
                'resumed_at' => now(),
                'resumed_by' => $adminId,
            ]);

            AdminAuditLog::create([
                'admin_id' => $adminId,
                'action' => 'election_resumed',
                'description' => "Election \"{$election->title}\" resumed after integrity review.",
                'metadata' => [
                    'election_id' => $election->id,
                    'previous_status' => ElectionStatus::PausedForReview->value,
                    'pause_reason' => $election->pause_reason,
                ],
                'ip_address' => request()->ip(),
                'created_at' => now(),
            ]);
        });
    }

    /**
     * Look up a receipt token and return the associated ballot.
     *
     * @return array<int, array{position: string, candidate: string, status: string}>|null
     */
    public function verifyReceipt(string $receiptToken): ?array
    {
        $votes = Vote::with(['candidate', 'position'])
            ->where('receipt_token', $receiptToken)->get();

        if ($votes->isEmpty()) {
            return null;
        }

        return $votes->map(fn (Vote $vote) => [
            'position' => $vote->position->title,
            'candidate' => $vote->candidate->name,
            'status' => $vote->status,
        ])->toArray();
    }

    /**
     * Verify the hash chain for an entire election.
     *
     * Checks both cross-row linkage and self-consistency on every valid
     * vote. Each vote is counted at most once as "broken" regardless of
     * how many individual checks it fails.
     *
     * @return array{valid: bool, total: int, broken: int, quarantined: int, details: array<int, array{vote_id: int, failures: array<int, string>}>}
     */
    public function verifyChain(Election $election): array
    {
        $votes = Vote::where('election_id', $election->id)
            ->where('status', 'valid')
            ->orderBy('id')
            ->get();

        $quarantined = Vote::where('election_id', $election->id)
            ->where('status', 'quarantined')
            ->count();

        if ($votes->isEmpty()) {
            return [
                'valid' => true,
                'total' => 0,
                'broken' => 0,
                'quarantined' => $quarantined,
                'details' => [],
            ];
        }

        $brokenVotes = [];
        $previous = null;

        foreach ($votes as $vote) {
            $failures = [];

            if ($previous && $vote->previous_hash !== $previous->current_hash) {
                $failures[] = 'chain_link';
            }

            $expected = $this->computeHash(
                $vote->receipt_token,
                $vote->candidate_id,
                $vote->previous_hash
            );

            if ($expected !== $vote->current_hash) {
                $failures[] = 'self_consistency';
            }

            if (! empty($failures)) {
                $brokenVotes[] = [
                    'vote_id' => $vote->id,
                    'failures' => $failures,
                ];
            }

            $previous = $vote;
        }

        return [
            'valid' => empty($brokenVotes),
            'total' => $votes->count(),
            'broken' => count($brokenVotes),
            'quarantined' => $quarantined,
            'details' => $brokenVotes,
        ];
    }

    /**
     * Verify the hash chain integrity of a single vote.
     *
     * Checks self-consistency (does the row hash to its own current_hash?)
     * and cross-row linkage (does previous_hash match the actual preceding
     * valid row's current_hash?).
     *
     * @return array{valid: bool, failures: array<int, string>}
     */
    public function verifyVoteIntegrity(Vote $vote): array
    {
        $failures = [];

        $expected = $this->computeHash(
            $vote->receipt_token,
            $vote->candidate_id,
            $vote->previous_hash
        );

        if ($expected !== $vote->current_hash) {
            $failures[] = 'self_consistency';
        }

        $predecessor = Vote::where('election_id', $vote->election_id)
            ->where('status', 'valid')
            ->where('id', '<', $vote->id)
            ->orderBy('id', 'desc')
            ->first();

        if ($predecessor && $vote->previous_hash !== $predecessor->current_hash) {
            $failures[] = 'chain_link';
        }

        return [
            'valid' => empty($failures),
            'failures' => $failures,
        ];
    }

    /**
     * Check whether a student has already voted in a given election.
     */
    public function hasVoted(Election $election, string $studentId): bool
    {
        return VoterParticipation::where('election_id', $election->id)
            ->where('hashed_student_id', $this->hashStudentId($studentId))->exists();
    }

    /**
     * Return the total number of voters for an election.
     */
    public function turnout(Election $election): int
    {
        return VoterParticipation::where('election_id', $election->id)->count();
    }

    /**
     * Hash a student ID with HMAC-SHA256 using the application key.
     */
    private function hashStudentId(string $studentId): string
    {
        return hash_hmac('sha256', $studentId, config('app.key'));
    }

    /**
     * Generate a formatted receipt token (e.g. HTU-A9B4-M2PZ).
     */
    private function generateReceipt(): string
    {
        return sprintf(
            'HTU-%s-%s-%s',
            strtoupper(Str::random(4)),
            strtoupper(Str::random(4)),
            strtoupper(Str::random(4))
        );
    }

    /**
     * Produce an HMAC-SHA256 hash linking a vote to its predecessor.
     *
     * Uses the application key so that only the server can construct
     * valid hashes. An attacker with raw database access cannot forge a
     * vote and recompute the hash to match without the key.
     */
    private function computeHash(string $receipt, int $candidateId, string $previousHash): string
    {
        return hash_hmac('sha256', $receipt.$candidateId.$previousHash, config('app.key'));
    }
}
