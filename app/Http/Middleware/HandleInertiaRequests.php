<?php

namespace App\Http\Middleware;

use App\Models\Election;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $pastElections = [];

        if ($user = $request->user()) {
            $now = now();
            $pastElections = Election::query()
                ->where(function ($q) use ($now) {
                    $q->where('status', 'closed')
                        ->orWhere(function ($q) use ($now) {
                            $q->where('ends_at', '<', $now)
                                ->where('status', '!=', 'draft');
                        });
                })
                ->orderBy('ends_at', 'desc')
                ->take(10)
                ->get()
                ->map(fn (Election $e) => [
                    'id' => $e->id,
                    'title' => $e->title,
                    'scope' => $e->scope,
                    'status' => $e->status->value,
                    'ends_at' => $e->ends_at?->toISOString(),
                ])
                ->values();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'admin' => $request->user()?->isAdmin() ?? false,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'pastElections' => $pastElections,
        ];
    }
}
