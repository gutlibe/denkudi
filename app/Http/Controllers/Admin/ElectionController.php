<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Election;
use App\Models\Vote;
use App\Services\VotingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ElectionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Election::with('createdBy')->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        $elections = $query->paginate(12)
            ->through(fn (Election $election) => [
                'id' => $election->id,
                'title' => $election->title,
                'type' => $election->type->value,
                'type_label' => $election->type->label(),
                'status' => $election->status->value,
                'status_label' => $election->status->label(),
                'scope' => $election->scope,
                'starts_at' => $election->starts_at?->toISOString(),
                'ends_at' => $election->ends_at?->toISOString(),
                'results_released' => $election->results_released,
                'created_by' => $election->createdBy->first_name.' '.$election->createdBy->last_name,
                'created_at' => $election->created_at->toISOString(),
            ]);

        return Inertia::render('admin/elections/index', [
            'elections' => Inertia::merge(fn () => $elections->items()),
            'pagination' => [
                'current_page' => $elections->currentPage(),
                'last_page' => $elections->lastPage(),
                'total' => $elections->total(),
            ],
            'filters' => [
                'status' => $request->input('status', ''),
                'search' => $request->input('search', ''),
            ],
            'statuses' => ElectionStatus::options(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/elections/create', [
            'types' => ElectionType::options(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(ElectionType::class)],
            'scope' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        $validated['slug'] = Str::slug($validated['title']).'-'.Str::random(6);
        $validated['status'] = ElectionStatus::Draft;
        $validated['created_by'] = $request->user()->id;

        $election = Election::create($validated);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'election_created',
            'description' => "Election \"{$election->title}\" created.",
            'metadata' => ['election_id' => $election->id, 'type' => $validated['type']],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.elections.index')
            ->with('toast', ['type' => 'success', 'message' => 'Election created.']);
    }

    public function edit(Election $election): Response
    {
        return Inertia::render('admin/elections/edit', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'type' => $election->type->value,
                'type_label' => $election->type->label(),
                'scope' => $election->scope,
                'description' => $election->description,
                'status' => $election->status->value,
                'status_label' => $election->status->label(),
                'starts_at' => $election->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $election->ends_at?->format('Y-m-d\TH:i'),
            ],
            'types' => ElectionType::options(),
        ]);
    }

    public function manage(Election $election): Response
    {
        $election->load(['positions' => fn ($q) => $q->orderBy('sort_order'), 'positions.candidates']);

        return Inertia::render('admin/elections/manage', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'type' => $election->type->value,
                'status' => $election->status->value,
                'scope' => $election->scope,
                'positions' => $election->positions->map(fn ($p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'max_selections' => $p->max_selections,
                    'sort_order' => $p->sort_order,
                    'candidate_count' => $p->candidates->count(),
                ])->toArray(),
            ],
        ]);
    }

    public function update(Request $request, Election $election): RedirectResponse
    {
        if ($election->isActive() || $election->isClosed()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot edit an election while voting is active or after it has been closed.',
            ]);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(ElectionType::class)],
            'scope' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        $election->update($validated);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'election_updated',
            'description' => "Election \"{$election->title}\" updated.",
            'metadata' => ['election_id' => $election->id],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.elections.index')
            ->with('toast', ['type' => 'success', 'message' => 'Election updated.']);
    }

    public function destroy(Request $request, Election $election): RedirectResponse
    {
        if ($election->isActive()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot delete an election while voting is active. Close it first.',
            ]);
        }

        $title = $election->title;
        $election->delete();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'election_deleted',
            'description' => "Election \"{$title}\" deleted.",
            'metadata' => ['election_id' => $election->id],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.elections.index')
            ->with('toast', ['type' => 'success', 'message' => 'Election deleted.']);
    }

    public function releaseResults(Request $request, Election $election): RedirectResponse
    {
        if (! $election->isClosed()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Results can only be released for closed elections.',
            ]);
        }

        $election->update(['results_released' => ! $election->results_released]);

        $action = $election->results_released ? 'released' : 'withdrawn';

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'results_'.$action,
            'description' => "Results {$action} for election \"{$election->title}\".",
            'metadata' => ['election_id' => $election->id],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => $election->results_released
                ? 'Results published. Students can now view them.'
                : 'Results withdrawn. Students can no longer view them.',
        ]);
    }

    public function updateStatus(Request $request, Election $election, VotingService $voting): RedirectResponse
    {
        $validTransitions = [
            ElectionStatus::Draft->value => [ElectionStatus::Scheduled->value],
            ElectionStatus::Scheduled->value => [ElectionStatus::Active->value],
            ElectionStatus::Active->value => [ElectionStatus::Closed->value],
            ElectionStatus::PausedForReview->value => [ElectionStatus::Active->value],
        ];

        $current = $election->status->value;
        $newStatus = $request->input('status');

        $allowed = $validTransitions[$current] ?? [];

        if (! in_array($newStatus, $allowed)) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => "Cannot transition from {$current} to {$newStatus}.",
            ]);
        }

        // Resuming a paused election requires resetting the quarantine
        // counter and recording a dedicated audit entry — delegate to
        // VotingService::resumeElection() rather than a plain status flip.
        if ($current === ElectionStatus::PausedForReview->value && $newStatus === ElectionStatus::Active->value) {
            $voting->resumeElection($election, $request->user()->id);

            return back()->with('toast', [
                'type' => 'success',
                'message' => 'Election resumed after integrity review.',
            ]);
        }

        $oldStatus = $current;
        $election->update(['status' => $newStatus]);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'election_status_changed',
            'description' => "Election \"{$election->title}\" moved from {$oldStatus} to {$newStatus}.",
            'metadata' => ['election_id' => $election->id, 'from' => $oldStatus, 'to' => $newStatus],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => "Election status updated to {$newStatus}.",
        ]);
    }

    public function audit(Election $election, VotingService $voting, Request $request): Response
    {
        $result = $voting->verifyChain($election);

        $query = Vote::with(['position', 'candidate'])
            ->where('election_id', $election->id)
            ->orderBy('id');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('receipt_token', 'like', "%{$search}%");
        }

        $votes = $query->paginate(20)
            ->through(fn ($v) => [
                'id' => $v->id,
                'position' => $v->position?->title ?: '—',
                'candidate' => $v->candidate?->name ?: '—',
                'previous_hash' => '...'.substr($v->previous_hash, -16),
                'current_hash' => '...'.substr($v->current_hash, -16),
                'receipt' => $v->receipt_token,
                'status' => $v->status,
            ]);

        return Inertia::render('admin/elections/audit', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status->value,
            ],
            'chain' => $result,
            'votes' => Inertia::merge(fn () => $votes->items()),
            'pagination' => [
                'current_page' => $votes->currentPage(),
                'last_page' => $votes->lastPage(),
                'total' => $votes->total(),
            ],
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public function quarantined(Election $election, Request $request): Response
    {
        $query = Vote::with(['position', 'candidate'])
            ->where('election_id', $election->id)
            ->where('status', 'quarantined')
            ->orderBy('id', 'desc');

        $votes = $query->paginate(20)
            ->through(fn ($v) => [
                'id' => $v->id,
                'position' => $v->position?->title ?: '—',
                'candidate' => $v->candidate?->name ?: '—',
                'receipt' => $v->receipt_token,
                'previous_hash' => '...'.substr($v->previous_hash, -16),
                'current_hash' => '...'.substr($v->current_hash, -16),
            ]);

        return Inertia::render('admin/elections/quarantined', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status->value,
                'quarantine_count' => $election->quarantine_count,
            ],
            'votes' => Inertia::merge(fn () => $votes->items()),
            'pagination' => [
                'current_page' => $votes->currentPage(),
                'last_page' => $votes->lastPage(),
                'total' => $votes->total(),
            ],
        ]);
    }

    public function dismissQuarantine(Request $request, Election $election, Vote $vote): RedirectResponse
    {
        if ($vote->election_id !== $election->id) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This vote does not belong to the specified election.',
            ]);
        }

        if ($vote->status !== 'quarantined') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only quarantined votes can be dismissed.',
            ]);
        }

        $vote->update(['status' => 'valid']);
        $election->decrement('quarantine_count');

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'quarantine_dismissed',
            'description' => "Quarantined vote #{$vote->id} dismissed (restored to valid) for election \"{$election->title}\".",
            'metadata' => ['election_id' => $election->id, 'vote_id' => $vote->id],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Vote restored to valid status.',
        ]);
    }

    public function results(Election $election, VotingService $voting): Response|JsonResponse
    {
        $data = [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status->value,
            ],
            'positions' => $this->getResultsData($election),
            'chain' => $voting->verifyChain($election),
            'turnout' => $voting->turnout($election),
        ];

        if (request()->expectsJson()) {
            return response()->json($data);
        }

        return Inertia::render('admin/elections/results', $data);
    }

    public function resultsFullscreen(Election $election, VotingService $voting): Response
    {
        return Inertia::render('admin/elections/results-fullscreen', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status->value,
            ],
            'positions' => $this->getResultsData($election),
            'chain' => $voting->verifyChain($election),
            'turnout' => $voting->turnout($election),
        ]);
    }

    /**
     * @return array<int, array{id: int, title: string, total_votes: int, candidates: array<int, array<string, mixed>>}>
     */
    private function getResultsData(Election $election): array
    {
        $election->load(['positions' => fn ($q) => $q->orderBy('sort_order'), 'positions.candidates']);

        return $election->positions->map(function ($position) {
            $totalForPosition = Vote::where('election_id', $position->election_id)
                ->where('position_id', $position->id)
                ->where('status', 'valid')
                ->count();

            $candidates = $position->candidates->map(function ($candidate) use ($totalForPosition) {
                $count = Vote::where('position_id', $candidate->position_id)
                    ->where('candidate_id', $candidate->id)
                    ->where('status', 'valid')
                    ->count();

                return [
                    'id' => $candidate->id,
                    'name' => $candidate->name,
                    'department' => $candidate->department,
                    'photo_url' => $candidate->photo_url ? asset('storage/'.$candidate->photo_url) : null,
                    'vote_count' => $count,
                    'percentage' => $totalForPosition > 0 ? round(($count / $totalForPosition) * 100, 1) : 0,
                ];
            });

            return [
                'id' => $position->id,
                'title' => $position->title,
                'total_votes' => $totalForPosition,
                'candidates' => $candidates->sortByDesc('vote_count')->values()->toArray(),
            ];
        })->filter(fn ($p) => $p['total_votes'] > 0)->values()->toArray();
    }
}
