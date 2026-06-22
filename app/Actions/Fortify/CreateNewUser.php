<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $email = $input['student_id'].'@htu.edu.gh';

        return User::create([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'student_id' => $input['student_id'],
            'email' => $email,
            'password' => Hash::make($input['password']),
            'role' => Role::Student,
            'email_verified_at' => now(),
        ]);
    }
}
