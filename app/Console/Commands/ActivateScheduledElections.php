<?php

namespace App\Console\Commands;

use App\Enums\ElectionStatus;
use App\Models\AdminAuditLog;
use App\Models\Election;
use Illuminate\Console\Command;

class ActivateScheduledElections extends Command
{
    protected $signature = 'elections:activate-scheduled';

    protected $description = 'Activate scheduled elections whose start date has arrived.';

    public function handle(): int
    {
        $due = Election::where('status', ElectionStatus::Scheduled->value)
            ->whereNotNull('starts_at')
            ->where('starts_at', '<=', now())
            ->get();

        if ($due->isEmpty()) {
            $this->info('No scheduled elections to activate.');

            return self::SUCCESS;
        }

        foreach ($due as $election) {
            $election->update(['status' => ElectionStatus::Active]);

            AdminAuditLog::create([
                'admin_id' => null,
                'action' => 'election_auto_activated',
                'description' => "Election \"{$election->title}\" automatically activated (start date reached).",
                'metadata' => [
                    'election_id' => $election->id,
                    'previous_status' => ElectionStatus::Scheduled->value,
                    'starts_at' => $election->starts_at,
                ],
                'created_at' => now(),
            ]);

            $this->info("Activated (scheduled -> active): {$election->title}");
        }

        $this->info(count($due).' election(s) activated.');

        return self::SUCCESS;
    }
}
