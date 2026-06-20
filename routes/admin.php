<?php

use App\Http\Controllers\Admin\CandidateController;
use App\Http\Controllers\Admin\ElectionController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', EnsureUserIsAdmin::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::inertia('dashboard', 'admin/dashboard')->name('dashboard');

        Route::resource('elections', ElectionController::class)
            ->except(['show'])
            ->parameter('elections', 'election');

        // Positions nested under elections
        Route::post('elections/{election}/positions', [PositionController::class, 'store'])
            ->name('elections.positions.store');
        Route::put('elections/{election}/positions/{position}', [PositionController::class, 'update'])
            ->name('elections.positions.update');
        Route::delete('elections/{election}/positions/{position}', [PositionController::class, 'destroy'])
            ->name('elections.positions.destroy');

        // Candidates nested under elections
        Route::post('elections/{election}/candidates', [CandidateController::class, 'store'])
            ->name('elections.candidates.store');
        Route::put('elections/{election}/candidates/{candidate}', [CandidateController::class, 'update'])
            ->name('elections.candidates.update');
        Route::delete('elections/{election}/candidates/{candidate}', [CandidateController::class, 'destroy'])
            ->name('elections.candidates.destroy');

        // Election manage page
        Route::get('elections/{election}/manage', [ElectionController::class, 'manage'])
            ->name('elections.manage');

        // Toggle results release
        Route::patch('elections/{election}/release-results', [ElectionController::class, 'releaseResults'])
            ->name('elections.release-results');

        // Position candidate management page
        Route::get('elections/{election}/positions/{position}/candidates', [CandidateController::class, 'index'])
            ->name('elections.positions.candidates');
    });
