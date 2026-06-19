<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evote_votes', function (Blueprint $table) {
            $table->enum('status', ['valid', 'quarantined'])->default('valid')->after('current_hash');
        });
    }

    public function down(): void
    {
        Schema::table('evote_votes', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
