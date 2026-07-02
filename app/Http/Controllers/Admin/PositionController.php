<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Election;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function store(Request $request, Election $election): RedirectResponse
    {
        if ($election->isActive()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot add positions while voting is active.',
            ]);
        }

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'max_selections' => ['required', 'integer', 'min:1', 'max:10'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $position = $election->positions()->create($request->only(['title', 'max_selections', 'sort_order']));

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'position_created',
            'description' => "Position \"{$position->title}\" added to election \"{$election->title}\".",
            'metadata' => ['election_id' => $election->id, 'position_id' => $position->id],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Position added.']);
    }

    public function update(Request $request, Election $election, Position $position): RedirectResponse
    {
        if ($election->isActive()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot edit positions while voting is active.',
            ]);
        }

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'max_selections' => ['required', 'integer', 'min:1', 'max:10'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $position->update($request->only(['title', 'max_selections', 'sort_order']));

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'position_updated',
            'description' => "Position \"{$position->title}\" updated in election \"{$election->title}\".",
            'metadata' => ['election_id' => $election->id, 'position_id' => $position->id],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Position updated.']);
    }

    public function destroy(Request $request, Election $election, Position $position): RedirectResponse
    {
        if ($election->isActive()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot delete positions while voting is active.',
            ]);
        }

        if ($position->votes()->where('status', 'valid')->count() > 0) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot delete position with existing votes.',
            ]);
        }

        $title = $position->title;
        $position->delete();

        AdminAuditLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'position_deleted',
            'description' => "Position \"{$title}\" deleted from election \"{$election->title}\".",
            'metadata' => ['election_id' => $election->id, 'position_id' => $position->id],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Position deleted.']);
    }
}
