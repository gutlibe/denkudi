<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evote_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained('evote_elections')->cascadeOnDelete();
            $table->string('title');
            $table->integer('max_selections')->default(1);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evote_positions');
    }
};
