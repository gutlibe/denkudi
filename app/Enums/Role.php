<?php

namespace App\Enums;

enum Role: string
{
    case Student = 'student';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Student => 'Student',
            self::Admin => 'Admin',
        };
    }

    public static function options(): array
    {
        return array_reduce(self::cases(), fn ($carry, $role) => [
            ...$carry,
            $role->value => $role->label(),
        ], []);
    }
}
