<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $admin_id
 * @property string $action
 * @property string $description
 * @property array<string, mixed>|null $metadata
 * @property string|null $ip_address
 * @property Carbon $created_at
 * @property-read User|null $admin
 */
class AdminAuditLog extends Model
{
    protected $table = 'evote_admin_audit_logs';

    public $timestamps = false;

    protected $fillable = [
        'admin_id',
        'action',
        'description',
        'metadata',
        'ip_address',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
