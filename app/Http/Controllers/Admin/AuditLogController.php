<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AdminAuditLog::with('admin')->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('description', 'like', "%{$search}%")
                ->orWhere('action', 'like', "%{$search}%")
                ->orWhere('ip_address', 'like', "%{$search}%");
        }

        $logs = $query->paginate(50)
            ->through(fn ($log) => [
                'id' => $log->id,
                'admin' => $log->admin?->first_name.' '.$log->admin?->last_name,
                'action' => $log->action,
                'description' => $log->description,
                'metadata' => $log->metadata,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->toISOString(),
            ]);

        return Inertia::render('admin/audit-logs/index', [
            'logs' => Inertia::merge(fn () => $logs->items()),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
