<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ElectionStatus;
use App\Enums\VoteStatus;
use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Election;
use App\Models\User;
use App\Models\Vote;
use App\Models\VoterParticipation;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalStudents = User::where('role', 'student')->count();
        $totalValidVotes = Vote::where('status', VoteStatus::Valid)->count();
        $totalQuarantined = Vote::where('status', VoteStatus::Quarantined)->count();
        $totalVotes = $totalValidVotes + $totalQuarantined;

        $today = now()->toDateString();
        $votersToday = VoterParticipation::whereDate('voted_at', $today)->count();

        $electionStats = [
            'draft' => Election::where('status', ElectionStatus::Draft)->count(),
            'scheduled' => Election::where('status', ElectionStatus::Scheduled)->count(),
            'active' => Election::where('status', ElectionStatus::Active)->count(),
            'paused' => Election::where('status', ElectionStatus::PausedForReview)->count(),
            'closed' => Election::where('status', ElectionStatus::Closed)->count(),
        ];

        $activeElections = Election::where('status', ElectionStatus::Active)
            ->withCount(['positions'])
            ->orderBy('starts_at', 'desc')
            ->take(4)
            ->get()
            ->map(fn ($election) => [
                'id' => $election->id,
                'title' => $election->title,
                'type' => $election->type->label(),
                'scope' => $election->scope,
                'position_count' => $election->positions_count,
                'vote_count' => Vote::where('election_id', $election->id)->where('status', VoteStatus::Valid)->count(),
                'voter_count' => VoterParticipation::where('election_id', $election->id)->count(),
                'turnout_pct' => $totalStudents > 0
                    ? round((VoterParticipation::where('election_id', $election->id)->count() / $totalStudents) * 100, 1)
                    : 0,
                'quarantined' => $election->quarantine_count,
            ]);

        $activity = VoterParticipation::select(
            DB::raw('DATE(voted_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('voted_at', '>=', now()->subDays(90))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date' => $r->date,
                'votes' => (int) $r->count,
            ]);

        $recentLogs = AdminAuditLog::with('admin')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'admin' => $log->admin?->first_name.' '.$log->admin?->last_name,
                'action' => $log->action,
                'description' => $log->description,
                'created_at' => $log->created_at->toISOString(),
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_elections' => Election::count(),
                'active_elections' => $electionStats['active'],
                'paused_elections' => $electionStats['paused'],
                'total_students' => $totalStudents,
                'total_valid_votes' => $totalValidVotes,
                'total_quarantined' => $totalQuarantined,
                'total_votes' => $totalVotes,
                'voters_today' => $votersToday,
                'turnout_pct' => $totalStudents > 0
                    ? round(($totalVotes / max($totalStudents, 1)) * 100, 1)
                    : 0,
                'chain_health' => $totalVotes > 0
                    ? round((($totalVotes - $totalQuarantined) / $totalVotes) * 100, 1)
                    : 100,
            ],
            'election_distribution' => $electionStats,
            'active_elections' => $activeElections,
            'activity' => $activity,
            'recent_logs' => $recentLogs,
        ]);
    }
}
