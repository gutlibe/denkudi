<?php

namespace App\Console\Commands;

use App\Enums\ElectionStatus;
use App\Models\AdminAuditLog;
use App\Models\Election;
use Illuminate\Console\Command;

class CloseExpiredElections extends Command
{
    protected $signature = 'elections:close-expired';

    protected $description = 'Close elections whose end date has passed.';

    public function handle(): int
    {
        $expired = Election::where('status', ElectionStatus::Active->value)
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', now())
            ->get();

        if ($expired->isEmpty()) {
            $this->info('No expired elections to close.');

            return self::SUCCESS;
        }

        foreach ($expired as $election) {
            $election->update(['status' => ElectionStatus::Closed]);

            AdminAuditLog::create([
                'admin_id' => null,
                'action' => 'election_auto_closed',
                'description' => "Election \"{$election->title}\" automatically closed (end date passed).",
                'metadata' => [
                    'election_id' => $election->id,
                    'ends_at' => $election->ends_at,
                ],
                'created_at' => now(),
            ]);

            $this->info("Closed: {$election->title}");
        }

        return self::SUCCESS;
    }
}
