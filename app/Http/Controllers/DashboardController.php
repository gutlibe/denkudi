<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Services\VotingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, VotingService $voting): Response
    {
        $user = $request->user();

        $elections = Election::with(['positions', 'positions.candidates'])
            ->orderBy('starts_at', 'desc')
            ->get()
            ->map(fn (Election $election) => [
                'id' => $election->id,
                'title' => $election->title,
                'type' => $election->type->value,
                'type_label' => $election->type->label(),
                'status' => $election->status->value,
                'status_label' => $election->status->label(),
                'scope' => $election->scope,
                'description' => $election->description,
                'starts_at' => $election->starts_at?->toISOString(),
                'ends_at' => $election->ends_at?->toISOString(),
                'is_active' => $election->isActive(),
                'has_voted' => $voting->hasVoted($election, $user->student_id),
                'position_count' => $election->positions->count(),
                'candidate_count' => $election->positions->sum(fn ($p) => $p->candidates->count()),
            ]);

        $active = $elections->where('is_active', true)->values();
        $upcoming = $elections->where('status', 'scheduled')->values();
        $past = $elections->where('status', 'closed')->values();

        return Inertia::render('dashboard', [
            'activeElections' => $active,
            'upcomingElections' => $upcoming,
            'pastElections' => $past,
            'userName' => $user->first_name,
        ]);
    }

    public function vote(Election $election, Request $request, VotingService $voting): Response
    {
        $user = $request->user();

        if ($voting->hasVoted($election, $user->student_id)) {
            return Inertia::render('elections/ballot', [
                'election' => ['id' => $election->id, 'title' => $election->title],
                'alreadyVoted' => true,
            ]);
        }

        $election->load(['positions' => fn ($q) => $q->orderBy('sort_order'), 'positions.candidates']);

        return Inertia::render('elections/ballot', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'description' => $election->description,
                'positions' => $election->positions->map(fn ($p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'max_selections' => $p->max_selections,
                    'candidates' => $p->candidates->map(fn ($c) => [
                        'id' => $c->id,
                        'name' => $c->name,
                        'department' => $c->department,
                        'manifesto' => $c->manifesto,
                        'photo_url' => $c->photo_url ? asset('storage/' . $c->photo_url) : null,
                    ]),
                ]),
            ],
            'alreadyVoted' => false,
        ]);
    }

    public function submitVote(Election $election, Request $request, VotingService $voting): Response
    {
        $user = $request->user();

        $ballot = $request->input('ballot', []);

        try {
            $result = $voting->castBallot($election, $user->student_id, $ballot);

            return Inertia::render('elections/ballot', [
                'election' => ['id' => $election->id, 'title' => $election->title],
                'alreadyVoted' => true,
                'receipt' => $result['receipt'],
            ])->with('toast', ['type' => 'success', 'message' => 'Vote submitted successfully.']);
        } catch (\RuntimeException $e) {
            return back()->with('toast', ['type' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
