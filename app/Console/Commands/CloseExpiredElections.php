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
        $expired = Election::whereIn('status', [
            ElectionStatus::Active->value,
            ElectionStatus::Scheduled->value,
            ElectionStatus::PausedForReview->value,
        ])
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', now())
            ->get();

        if ($expired->isEmpty()) {
            $this->info('No expired elections to close.');

            return self::SUCCESS;
        }

        foreach ($expired as $election) {
            $fromStatus = $election->status;
            $election->update(['status' => ElectionStatus::Closed]);

            AdminAuditLog::create([
                'admin_id' => null,
                'action' => 'election_auto_closed',
                'description' => "Election \"{$election->title}\" automatically closed (end date passed).",
                'metadata' => [
                    'election_id' => $election->id,
                    'previous_status' => $fromStatus,
                    'ends_at' => $election->ends_at,
                ],
                'created_at' => now(),
            ]);

            $this->info("Closed ({$fromStatus} -> closed): {$election->title}");
        }

        $this->info(count($expired).' election(s) closed.');

        return self::SUCCESS;
}
