<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_posts', function (Blueprint $table) {
            $table->dropForeign(['job_payment_id']);
            $table->dropColumn('job_payment_id');
        });

        Schema::dropIfExists('job_payments');
    }

    public function down(): void
    {
        // No down needed as we are reverting
    }
};
