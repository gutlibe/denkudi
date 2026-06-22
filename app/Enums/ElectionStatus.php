<?php

namespace App\Enums;

enum ElectionStatus: string
{
    case Draft = 'draft';
    case Scheduled = 'scheduled';
    case Active = 'active';
    case PausedForReview = 'paused_for_review';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Scheduled => 'Scheduled',
            self::Active => 'Active',
            self::PausedForReview => 'Paused for Review',
            self::Closed => 'Closed',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return array_reduce(self::cases(), fn ($carry, $status) => [
            ...$carry,
            $status->value => $status->label(),
        ], []);
    }
}
