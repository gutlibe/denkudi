<?php

namespace App\Models;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Election extends Model
{
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
        'resumed_at',
        'resumed_by',
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
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }

    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        $now = now();

        return $this->starts_at <= $now && $this->ends_at >= $now;
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }

    public function isPaused(): bool
    {
        return $this->status === 'paused_for_review';
    }
}
