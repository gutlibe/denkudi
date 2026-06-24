<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect('/dashboard')
        : Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('elections/{election}/vote', [DashboardController::class, 'vote'])->name('elections.vote');
    Route::get('elections/{election}/ballot-data', [DashboardController::class, 'ballotData'])->name('elections.ballot-data');
    Route::post('elections/{election}/vote', [DashboardController::class, 'submitVote'])
        ->middleware('throttle:10,1')
        ->name('elections.vote.submit');
    Route::get('verify', [DashboardController::class, 'verify'])->name('verify');
    Route::get('elections/{election}/results', [DashboardController::class, 'results'])->name('elections.results');
});

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
