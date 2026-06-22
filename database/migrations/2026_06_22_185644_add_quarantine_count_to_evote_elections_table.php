<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evote_elections', function (Blueprint $table) {
            $table->unsignedInteger('quarantine_count')->default(0)->after('pause_reason');
        });
    }

    public function down(): void
    {
        Schema::table('evote_elections', function (Blueprint $table) {
            $table->dropColumn('quarantine_count');
        });
    }
};
