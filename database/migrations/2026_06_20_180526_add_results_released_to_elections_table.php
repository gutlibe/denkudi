<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evote_elections', function (Blueprint $table) {
            $table->boolean('results_released')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('evote_elections', function (Blueprint $table) {
            $table->dropColumn('results_released');
        });
    }
};
