<?php

namespace App\Services;

use App\Exceptions\ElectionPausedException;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Vote;
use App\Models\VoterParticipation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class VotingService
{
    /**
     * Consecutive tampered votes required before pausing the election.
     */
    private const QUARANTINE_HALT_THRESHOLD = 20;

    /**
     * Submit a student's ballot for an election.
     *
     * The integrity check (getLatestValidVote) runs BEFORE the ballot
     * transaction so that any quarantine or election-pause writes are
     * truly independent top-level transactions — a subsequent rollback
     * of the ballot attempt cannot undo a detected quarantine or pause.
     *
     * Once a clean predecessor hash is obtained the ballot is written
     * inside a single DB::transaction(). The election row is re-fetched
     * with lockForUpdate() inside the transaction to serialise chain-head
     * access, preventing two concurrent voters from linking to the same
     * predecessor.
     *
     * @throws ElectionPausedException
     * @throws \RuntimeException
     */
    public function castBallot(Election $election, string $studentId, array $ballot): array
    {
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

        $positionIds = array_column($ballot, 'position_id');
        if (count($positionIds) !== count(array_unique($positionIds))) {
            throw new \RuntimeException('Duplicate position in ballot.');
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
                : hash('sha256', 'GENESIS_BLOCK');

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
     * Two checks are performed on the candidate row:
     *   1. Self-consistency — does the row hash to its own current_hash?
     *   2. Cross-row linkage — does previous_hash match the actual
     *      preceding valid row's current_hash?
     *
     * Failing rows are quarantined in their own committed transaction.
     * If consecutive failures reach the threshold the election is paused.
     *
     * Called OUTSIDE the ballot transaction so quarantine and pause
     * writes are truly independent — a later ballot rollback cannot
     * undo them.
     *
     * @throws ElectionPausedException
     */
    private function getLatestValidVote(Election $election): ?Vote
    {
        $consecutiveTampered = 0;

        while ($consecutiveTampered < self::QUARANTINE_HALT_THRESHOLD) {
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
                    $this->quarantineRow($lastVote, $election, ++$consecutiveTampered);
                    continue;
                }

                return $lastVote;
            }

            $this->quarantineRow($lastVote, $election, ++$consecutiveTampered);
        }

        $this->pauseElection($election, $consecutiveTampered);

        throw new ElectionPausedException(
            'Voting has been paused pending administrator review of a detected integrity issue.'
        );
    }

    /**
     * Quarantine a tampered vote row.
     *
     * Wrapped in its own DB::transaction() so it commits immediately and
     * is durable regardless of what the caller does afterwards.
     */
    private function quarantineRow(Vote $vote, Election $election, int $count): void
    {
        DB::transaction(function () use ($vote, $election, $count) {
            $vote->update(['status' => 'quarantined']);

            Log::critical('Vote tampering detected and quarantined.', [
                'vote_id' => $vote->id,
                'election_id' => $election->id,
                'consecutive_count' => $count,
            ]);
        });
    }

    /**
     * Pause an election and record the reason.
     */
    private function pauseElection(Election $election, int $count): void
    {
        DB::transaction(function () use ($election, $count) {
            $election->update([
                'status' => 'paused_for_review',
                'paused_at' => now(),
                'pause_reason' => "Halted: {$count} consecutive tampered votes detected.",
            ]);

            Log::critical('Election paused for integrity review.', [
                'election_id' => $election->id,
                'consecutive_tampered' => $count,
            ]);
        });
    }

    /**
     * Resume a paused election after administrator review.
     */
    public function resumeElection(Election $election, int $adminId): void
    {
        $election->update([
            'status' => 'active',
            'resumed_at' => now(),
            'resumed_by' => $adminId,
        ]);
    }

    /**
     * Look up a receipt token and return the associated ballot.
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
     * Checks both cross-row linkage and self-consistency on every
     * valid vote. Quarantined rows are counted but skipped.
     *
     * @return array{valid: bool, total: int, broken: int, quarantined: int}
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
            ];
        }

        $broken = 0;
        $previous = null;

        foreach ($votes as $vote) {
            if ($previous && $vote->previous_hash !== $previous->current_hash) {
                $broken++;
            }

            $expected = $this->computeHash(
                $vote->receipt_token,
                $vote->candidate_id,
                $vote->previous_hash
            );

            if ($expected !== $vote->current_hash) {
                $broken++;
            }

            $previous = $vote;
        }

        return [
            'valid' => $broken === 0,
            'total' => $votes->count(),
            'broken' => $broken,
            'quarantined' => $quarantined,
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
     * Produce a SHA-256 hash linking a vote to its predecessor.
     */
    private function computeHash(string $receipt, int $candidateId, string $previousHash): string
    {
        return hash('sha256', $receipt . $candidateId . $previousHash);
    }
}
