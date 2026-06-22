<?php

namespace App\Enums;

enum ElectionType: string
{
    case StudentBody = 'student_body';
    case Departmental = 'departmental';
    case Referendum = 'referendum';
    case Special = 'special';

    public function label(): string
    {
        return match ($this) {
            self::StudentBody => 'Student Body',
            self::Departmental => 'Departmental',
            self::Referendum => 'Referendum',
            self::Special => 'Special',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return array_reduce(self::cases(), fn ($carry, $type) => [
            ...$carry,
            $type->value => $type->label(),
        ], []);
    }
}
