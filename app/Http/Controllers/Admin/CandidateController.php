<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Candidate;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
                    'photo_url' => $c->photo_url ? asset('storage/' . $c->photo_url) : null,
                ])->toArray(),
            ],
        ]);
    }

    public function store(Request $request, Election $election): RedirectResponse
    {
        try {
            Log::info('Candidate store attempt', [
                'election_id' => $election->id,
                'all_data' => $request->all(),
                'has_file' => $request->hasFile('photo'),
            ]);

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
                Log::info('Photo stored', ['path' => $data['photo_url']]);
            }

            $candidate = $election->candidates()->create($data);

            Log::info('Candidate created', ['id' => $candidate->id]);

            return back()->with('toast', ['type' => 'success', 'message' => 'Candidate added.']);
        } catch (\Exception $e) {
            Log::error('Candidate store failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function update(Request $request, Election $election, Candidate $candidate): RedirectResponse
    {
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

        return back()->with('toast', ['type' => 'success', 'message' => 'Candidate updated.']);
    }

    public function destroy(Election $election, Candidate $candidate): RedirectResponse
    {
        $candidate->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Candidate removed.']);
    }
}
