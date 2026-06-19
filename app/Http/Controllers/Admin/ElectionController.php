<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Election;
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
}
