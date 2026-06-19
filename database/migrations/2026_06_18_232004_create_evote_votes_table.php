<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evote_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained('evote_elections')->cascadeOnDelete();
            $table->foreignId('position_id')->constrained('evote_positions')->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('evote_candidates')->cascadeOnDelete();
            $table->string('receipt_token', 64);
            $table->string('previous_hash', 64)->nullable();
            $table->string('current_hash', 64);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evote_votes');
    }
};
