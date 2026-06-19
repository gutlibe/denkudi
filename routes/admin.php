<?php

use App\Http\Controllers\Admin\ElectionController;
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
    });
