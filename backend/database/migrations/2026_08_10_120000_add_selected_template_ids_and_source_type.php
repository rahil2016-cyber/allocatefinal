<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('job_seeker_profiles', 'selected_template_ids')) {
                $table->json('selected_template_ids')->nullable()->after('primary_resume_draft_id');
            }
        });

        Schema::table('resume_drafts', function (Blueprint $table) {
            if (! Schema::hasColumn('resume_drafts', 'source_type')) {
                $table->string('source_type', 32)->default('template')->after('template_id');
            }
            if (! Schema::hasColumn('resume_drafts', 'file_url')) {
                $table->string('file_url', 500)->nullable()->after('source_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('job_seeker_profiles', 'selected_template_ids')) {
                $table->dropColumn('selected_template_ids');
            }
        });

        Schema::table('resume_drafts', function (Blueprint $table) {
            if (Schema::hasColumn('resume_drafts', 'source_type')) {
                $table->dropColumn('source_type');
            }
            if (Schema::hasColumn('resume_drafts', 'file_url')) {
                $table->dropColumn('file_url');
            }
        });
    }
};
