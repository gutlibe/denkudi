<?php

namespace App\Http\Controllers;

use App\Exceptions\ElectionPausedException;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Position;
use App\Models\Vote;
use App\Services\VotingService;
use Illuminate\Http\JsonResponse;
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
                'voter_count' => $voting->turnout($election),
                'total_voters' => \App\Models\User::count(),
            ]);

        $now = now();

        $active = $elections->filter(fn ($e) => $e['is_active'])->values();
        $upcoming = $elections->where('status', 'scheduled')->values();
        $past = $elections->filter(function ($e) use ($now) {
            if ($e['status'] === 'closed') {
                return true;
            }

            // Show elections that ended but haven't been formally closed yet,
            // plus paused elections that are past their end date.
            if (($e['status'] === 'active' || $e['status'] === 'paused_for_review') && $e['ends_at']) {
                return $e['ends_at'] < $now->toISOString();
            }

            return false;
        })->values();

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

        if (! $election->isActive()) {
            abort(403, 'This election is not currently active.');
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
                        'photo_url' => $c->photo_url ? asset('storage/'.$c->photo_url) : null,
                    ]),
                ]),
            ],
            'alreadyVoted' => false,
        ]);
    }

    /**
     * Return ballot data as JSON for the inline voting sheet on the dashboard.
     * Validates the user is a student, election is active, and they haven't voted yet.
     */
    public function ballotData(Election $election, Request $request, VotingService $voting): JsonResponse
    {
        $user = $request->user();

        if (! $election->isActive()) {
            abort(403, 'This election is not currently active.');
        }

        if ($voting->hasVoted($election, $user->student_id)) {
            return response()->json(['alreadyVoted' => true]);
        }

        $election->load(['positions' => fn ($q) => $q->orderBy('sort_order'), 'positions.candidates']);

        return response()->json([
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
                    'photo_url' => $c->photo_url ? asset('storage/'.$c->photo_url) : null,
                ]),
            ]),
        ]);
    }

    public function submitVote(Election $election, Request $request, VotingService $voting): Response|RedirectResponse
    {
        $user = $request->user();

        $ballot = $request->input('ballot', []);

        if (! is_array($ballot)) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Invalid ballot format.']);
        }

        try {
            $result = $voting->castBallot($election, $user->student_id, $ballot);

            return Inertia::render('elections/ballot', [
                'election' => ['id' => $election->id, 'title' => $election->title],
                'alreadyVoted' => true,
                'receipt' => $result['receipt'],
            ])->with('toast', ['type' => 'success', 'message' => 'Vote submitted successfully.']);
        } catch (ElectionPausedException $e) {
            return Inertia::render('elections/ballot', [
                'election' => ['id' => $election->id, 'title' => $election->title],
                'alreadyVoted' => false,
            ])->with('toast', ['type' => 'error', 'message' => $e->getMessage()]);
        } catch (\RuntimeException $e) {
            return back()->with('toast', ['type' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function verify(Request $request, VotingService $voting): Response
    {
        $token = $request->query('token');
        $result = null;

        if ($token) {
            $details = $voting->verifyReceipt($token);

            if ($details === null) {
                $result = ['found' => false];
            } else {
                $election = Vote::where('receipt_token', $token)->first()?->election;
                $statuses = array_column($details, 'status');
                $hasQuarantined = in_array('quarantined', $statuses, true);
                $overallStatus = $hasQuarantined ? 'quarantined' : 'valid';

                $result = [
                    'found' => true,
                    'election' => $election->title ?? 'Unknown election',
                    'positions' => count(array_unique(array_column($details, 'position'))),
                    'total_votes' => count($details),
                    'status' => $overallStatus,
                    'details' => $details,
                ];
            }
        }

        return Inertia::render('verify', [
            'result' => $result,
            'token' => $token,
        ]);
    }

    public function results(Election $election): Response
    {
        $positions = [];

        if ($election->results_released) {
            $positions = $election->positions()
                ->with(['candidates'])
                ->orderBy('sort_order')
                ->get()
                ->map(function (Position $position) {
                    $candidates = $position->candidates->map(function (Candidate $candidate) {
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
                        ];
                    });

                    $total = $candidates->sum('vote_count');

                    return [
                        'id' => $position->id,
                        'title' => $position->title,
                        'total_votes' => $total,
                        'candidates' => $candidates->map(fn ($c) => [
                            'id' => $c['id'],
                            'name' => $c['name'],
                            'department' => $c['department'],
                            'photo_url' => $c['photo_url'],
                            'vote_count' => $c['vote_count'],
                            'percentage' => $total > 0 ? round(($c['vote_count'] / $total) * 100, 1) : 0,
                        ])->sortByDesc('vote_count')->values(),
                    ];
                });
        }

        return Inertia::render('elections/results', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status->value,
                'results_released' => $election->results_released,
            ],
            'positions' => $positions,
        ]);
    }
}
