<?php

namespace App\Http\Controllers\Admin;

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
        // Vote activity for last 30 days
        $activity = VoterParticipation::select(
                DB::raw('DATE(voted_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('voted_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date' => $r->date,
                'votes' => (int) $r->count,
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_elections' => Election::count(),
                'active_elections' => Election::where('status', 'active')->count(),
                'total_voters' => User::where('role', 'student')->count(),
                'total_votes' => Vote::where('status', 'valid')->count(),
                'paused_elections' => Election::where('status', 'paused_for_review')->count(),
            ],
            'activity' => $activity,
            'recent_logs' => AdminAuditLog::with('admin')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'admin' => $log->admin?->first_name . ' ' . $log->admin?->last_name,
                    'action' => $log->action,
                    'description' => $log->description,
                    'created_at' => $log->created_at->toISOString(),
                ]),
        ]);
    }
}
