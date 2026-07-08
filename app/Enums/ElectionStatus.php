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

    /**
     * The set of statuses this status may transition to.
     *
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Draft => [self::Scheduled],
            self::Scheduled => [self::Active, self::Draft],
            self::Active => [self::Closed, self::Draft],
            self::PausedForReview => [self::Active],
            self::Closed => [self::Active],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    /**
     * Serializable transition map (value => allowed next values) for the frontend.
     *
     * @return array<string, array<int, string>>
     */
    public static function transitionMap(): array
    {
        return array_reduce(self::cases(), fn ($carry, $status) => [
            ...$carry,
            $status->value => array_map(fn (self $s) => $s->value, $status->allowedTransitions()),
        ], []);
    }
}
