<?php

namespace App\Models;

use App\Enums\VoteStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $election_id
 * @property int $position_id
 * @property int $candidate_id
 * @property string $receipt_token
 * @property string|null $previous_hash
 * @property string $current_hash
 * @property VoteStatus $status
 * @property-read Election|null $election
 * @property-read Position|null $position
 * @property-read Candidate|null $candidate
 */
class Vote extends Model
{
    protected $table = 'evote_votes';

    public $timestamps = false;

    protected $fillable = [
        'election_id',
        'position_id',
        'candidate_id',
        'receipt_token',
        'previous_hash',
        'current_hash',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => VoteStatus::class,
        ];
    }

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
     * @return BelongsTo<Candidate, $this>
     */
    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }
}
