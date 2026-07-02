<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $election_id
 * @property int $position_id
 * @property string $name
 * @property string|null $photo_url
 * @property string|null $manifesto
 * @property string|null $department
 * @property-read Election|null $election
 * @property-read Position|null $position
 */
class Candidate extends Model
{
    protected $table = 'evote_candidates';

    protected $fillable = [
        'election_id',
        'position_id',
        'name',
        'photo_url',
        'manifesto',
        'department',
    ];

    /**
     * @return BelongsTo<Election, $this>
     */
    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    /**
     * @return BelongsTo<Position, $this>
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    /**
     * @return HasMany<Vote, $this>
     */
    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }
}
