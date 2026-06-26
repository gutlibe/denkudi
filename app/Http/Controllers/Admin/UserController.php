<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::orderBy('created_at', 'desc')
            ->when($request->filled('search'), fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                    ->orWhere('last_name', 'like', "%{$request->search}%")
                    ->orWhere('student_id', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->paginate(20)
            ->through(fn ($user) => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'student_id' => $user->student_id,
                'email' => $user->email,
                'role' => $user->role->value,
                'role_label' => $user->role->label(),
                'created_at' => $user->created_at->toISOString(),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => Inertia::merge(fn () => $users->items()),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
                'total' => $users->total(),
            ],
            'filters' => [
                'search' => $request->input('search', ''),
            ],
            'roles' => Role::options(),
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'role' => ['required', Rule::enum(Role::class)],
        ]);

        $oldRole = $user->role->label();
        $user->update(['role' => $request->input('role')]);
        $newRole = $user->fresh()->role->label();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'user_role_changed',
            'description' => "User \"{$user->first_name} {$user->last_name}\" role changed from {$oldRole} to {$newRole}.",
            'metadata' => ['user_id' => $user->id, 'from' => $oldRole, 'to' => $newRole],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => "{$user->first_name} {$user->last_name} role changed from {$oldRole} to {$newRole}.",
        ]);
    }
}
