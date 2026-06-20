<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Election;
use App\Services\VotingService;
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

        $elections = $query->get()
            ->map(fn (Election $election) => [
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
            'elections' => $elections,
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
        if ($election->isActive()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot edit an election while voting is active.',
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
        $election->update(['results_released' => ! $election->results_released]);

        $action = $election->results_released ? 'released' : 'withdrawn';

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'results_' . $action,
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

    public function updateStatus(Request $request, Election $election): RedirectResponse
    {
        $validTransitions = [
            ElectionStatus::Draft->value => [ElectionStatus::Scheduled->value],
            ElectionStatus::Scheduled->value => [ElectionStatus::Active->value],
            ElectionStatus::Active->value => [ElectionStatus::Closed->value],
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

    public function audit(Election $election, VotingService $voting): \Inertia\Response
    {
        $result = $voting->verifyChain($election);

        $votes = \App\Models\Vote::where('election_id', $election->id)
            ->orderBy('id')
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'position' => $v->position?->title ?? '—',
                'candidate' => $v->candidate?->name ?? '—',
                'receipt_token' => $v->receipt_token,
                'previous_hash' => substr($v->previous_hash, 0, 16) . '...',
                'current_hash' => substr($v->current_hash, 0, 16) . '...',
                'status' => $v->status,
            ]);

        return \Inertia::render('admin/elections/audit', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status->value,
            ],
            'chain' => $result,
            'votes' => $votes,
        ]);
    }
}
