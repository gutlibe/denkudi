<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evote_voter_participation', function (Blueprint $table) {
            $table->unique(['election_id', 'hashed_student_id'], 'unique_voter_per_election');
        });
    }

    public function down(): void
    {
        Schema::table('evote_voter_participation', function (Blueprint $table) {
            $table->dropUnique('unique_voter_per_election');
        });
    }
};
