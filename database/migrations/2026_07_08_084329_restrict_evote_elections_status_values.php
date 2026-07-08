<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Restore a DB-level constraint on `status`. The column was changed to a
     * plain string in the pause-support migration, so nothing outside the
     * app layer prevented an invalid value being written — and its own
     * comment omitted `scheduled` entirely. Only MySQL supports altering the
     * column to an ENUM in place; other drivers (e.g. sqlite in tests) don't
     * support this ALTER syntax and are left as-is, since the app-level enum
     * cast already guards them there.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE evote_elections MODIFY status ENUM('draft', 'scheduled', 'active', 'paused_for_review', 'closed') NOT NULL DEFAULT 'draft'");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE evote_elections MODIFY status VARCHAR(255) NOT NULL DEFAULT 'draft'");
    }
};
