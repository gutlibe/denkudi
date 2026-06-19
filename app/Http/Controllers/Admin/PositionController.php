<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function store(Request $request, Election $election): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'max_selections' => ['required', 'integer', 'min:1', 'max:10'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $election->positions()->create($request->only(['title', 'max_selections', 'sort_order']));

        return back()->with('toast', ['type' => 'success', 'message' => 'Position added.']);
    }

    public function update(Request $request, Election $election, Position $position): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'max_selections' => ['required', 'integer', 'min:1', 'max:10'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $position->update($request->only(['title', 'max_selections', 'sort_order']));

        return back()->with('toast', ['type' => 'success', 'message' => 'Position updated.']);
    }

    public function destroy(Election $election, Position $position): RedirectResponse
    {
        $position->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Position deleted.']);
    }
}
