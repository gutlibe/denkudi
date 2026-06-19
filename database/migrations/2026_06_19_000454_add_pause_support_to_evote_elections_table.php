<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evote_elections', function (Blueprint $table) {
            $table->string('status')->default('draft')->change()->comment('draft, active, paused_for_review, closed');
            $table->timestamp('paused_at')->nullable();
            $table->string('pause_reason')->nullable();
            $table->timestamp('resumed_at')->nullable();
            $table->foreignId('resumed_by')->nullable()->constrained('users');
        });
    }

    public function down(): void
    {
        Schema::table('evote_elections', function (Blueprint $table) {
            $table->string('status')->default('draft')->change();
            $table->dropConstrainedForeignId('resumed_by');
            $table->dropColumn(['paused_at', 'pause_reason', 'resumed_at']);
        });
    }
};
