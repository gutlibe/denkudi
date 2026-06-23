<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Fortify;

class RegisterResponseWithToast implements RegisterResponse
{
    public function toResponse($request): RedirectResponse
    {
        return redirect(Fortify::redirects('register', '/dashboard'))
            ->with('toast', [
                'type' => 'success',
                'message' => 'Account created successfully. Welcome!',
            ]);
    }
}
