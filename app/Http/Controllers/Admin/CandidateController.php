<?php

namespace App\Http\Controllers\Admin;

use App\Enums\VoteStatus;
use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CandidateController extends Controller
{
    public function index(Election $election, Position $position): Response
    {
        $position->load('candidates');

        return Inertia::render('admin/elections/positions/candidates/index', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
            ],
            'position' => [
                'id' => $position->id,
                'title' => $position->title,
                'max_selections' => $position->max_selections,
                'candidates' => $position->candidates->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'department' => $c->department,
                    'manifesto' => $c->manifesto,
                    'photo_url' => $c->photo_url ? asset('storage/'.$c->photo_url) : null,
                ])->toArray(),
            ],
        ]);
    }

    public function store(Request $request, Election $election): RedirectResponse
    {
        if ($election->isLockedForEditing()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot add candidates while the election is active, paused, or closed.',
            ]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'position_id' => ['required', 'exists:evote_positions,id'],
            'department' => ['nullable', 'string', 'max:255'],
            'manifesto' => ['nullable', 'string', 'max:5000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:min_width=100,min_height=100,max_width=4000,max_height=4000'],
        ]);

        $data = $request->only(['name', 'position_id', 'department', 'manifesto']);

        if ($request->hasFile('photo')) {
            $data['photo_url'] = $request->file('photo')->store('candidates', 'public');
        }

        $candidate = $election->candidates()->create($data);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'candidate_created',
            'description' => "Candidate \"{$candidate->name}\" added to election \"{$election->title}\".",
            'metadata' => ['election_id' => $election->id, 'candidate_id' => $candidate->id],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Candidate added.']);
    }

    public function update(Request $request, Election $election, Candidate $candidate): RedirectResponse
    {
        if ($election->isLockedForEditing()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot edit candidates while the election is active, paused, or closed.',
            ]);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'position_id' => ['required', 'exists:evote_positions,id'],
            'department' => ['nullable', 'string', 'max:255'],
            'manifesto' => ['nullable', 'string', 'max:5000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:min_width=100,min_height=100,max_width=4000,max_height=4000'],
        ]);

        $data = $request->only(['name', 'position_id', 'department', 'manifesto']);

        if ($request->hasFile('photo')) {
            if ($candidate->photo_url) {
                Storage::disk('public')->delete($candidate->photo_url);
            }
            $data['photo_url'] = $request->file('photo')->store('candidates', 'public');
        }

        $candidate->update($data);

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'candidate_updated',
            'description' => "Candidate \"{$candidate->name}\" updated in election \"{$election->title}\".",
            'metadata' => ['election_id' => $election->id, 'candidate_id' => $candidate->id],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Candidate updated.']);
    }

    public function destroy(Request $request, Election $election, Candidate $candidate): RedirectResponse
    {
        if ($election->isLockedForEditing()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot delete candidates while the election is active, paused, or closed.',
            ]);
        }

        if ($candidate->votes()->where('status', VoteStatus::Valid)->count() > 0) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot delete candidate with existing votes.',
            ]);
        }

        $name = $candidate->name;
        $candidate->delete();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'candidate_deleted',
            'description' => "Candidate \"{$name}\" removed from election \"{$election->title}\".",
            'metadata' => ['election_id' => $election->id, 'candidate_id' => $candidate->id],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Candidate removed.']);
    }
}
