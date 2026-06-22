<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evote_voter_participation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained('evote_elections')->cascadeOnDelete();
            $table->string('hashed_student_id', 64);
            $table->timestamp('voted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evote_voter_participation');
    }
};
