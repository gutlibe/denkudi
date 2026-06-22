<?php

namespace App\Models;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property ElectionType $type
 * @property string $scope
 * @property string|null $description
 * @property ElectionStatus $status
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property int|null $created_by
 * @property Carbon|null $paused_at
 * @property string|null $pause_reason
 * @property int $quarantine_count
 * @property Carbon|null $resumed_at
 * @property int|null $resumed_by
 * @property bool $results_released
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read User|null $createdBy
 * @property-read Collection<int, Position> $positions
 * @property-read Collection<int, Candidate> $candidates
 */
class Election extends Model
{
    use SoftDeletes;

    protected $table = 'evote_elections';

    protected $fillable = [
        'title',
        'slug',
        'type',
        'scope',
        'description',
        'status',
        'starts_at',
        'ends_at',
        'created_by',
        'paused_at',
        'pause_reason',
        'quarantine_count',
        'resumed_at',
        'resumed_by',
        'results_released',
    ];

    protected function casts(): array
    {
        return [
            'type' => ElectionType::class,
            'status' => ElectionStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'paused_at' => 'datetime',
            'resumed_at' => 'datetime',
            'quarantine_count' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<Position, $this>
     */
    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }

    /**
     * @return HasMany<Candidate, $this>
     */
    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }

    public function isActive(): bool
    {
        if ($this->status !== ElectionStatus::Active) {
            return false;
        }

        if (! $this->starts_at || ! $this->ends_at) {
            return false;
        }

        $now = now();

        return $this->starts_at <= $now && $this->ends_at >= $now;
    }

    public function isClosed(): bool
    {
        return $this->status === ElectionStatus::Closed;
    }

    public function isPaused(): bool
    {
        return $this->status === ElectionStatus::PausedForReview;
    }
}
