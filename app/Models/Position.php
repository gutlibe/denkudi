<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $election_id
 * @property string $title
 * @property int $max_selections
 * @property int|null $sort_order
 * @property-read Election|null $election
 * @property-read Collection<int, Candidate> $candidates
 */
class Position extends Model
{
    protected $table = 'evote_positions';

    protected $fillable = [
        'election_id',
        'title',
        'max_selections',
        'sort_order',
    ];

    /**
     * @return BelongsTo<Election, $this>
     */
    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    /**
     * @return HasMany<Candidate, $this>
     */
    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }
}
