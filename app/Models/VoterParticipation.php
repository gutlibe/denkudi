<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $election_id
 * @property string $hashed_student_id
 * @property Carbon $voted_at
 * @property-read Election|null $election
 */
class VoterParticipation extends Model
{
    protected $table = 'evote_voter_participation';

    public $timestamps = false;

    protected $fillable = [
        'election_id',
        'hashed_student_id',
        'voted_at',
    ];

    protected function casts(): array
    {
        return [
            'voted_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Election, $this>
     */
    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }
}
