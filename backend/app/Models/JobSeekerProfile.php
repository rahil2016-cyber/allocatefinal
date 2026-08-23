<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobSeekerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'headline',
        'bio',
        'skills',
        'education',
        'experience_years',
        'expected_salary_min',
        'expected_salary_max',
        'currency',
        'city',
        'country',
        'state',
        'district',
        'industry_type',
        'date_of_birth',
        'gender',
        'portfolio_url',
        'internships',
        'projects',
        'achievements',
        'resume_document',
        'hometown',
        'residing_in_india',
        'highest_qualification',
        'work_experience',
        'languages_known',
        'certifications_structured',
        'academic_achievements',
        'awards_honors',
        'competitive_exam_results',
        'resume_url',
        'profile_photo_url',
        'primary_resume_draft_id',
        'package_key',
        'job_package_key',
        'resume_package_key',
        'applications_remaining',
        'resume_builds_remaining',
        'package_activated_at',
        'package_expires_at',
        'job_credits_expires_at',
        'resume_credits_expires_at',
        'total_time_spent_seconds',
        'last_app_activity_at',
        'onboarded',
        'job_roles',
        'is_experienced',
        'current_company',
        'current_role',
        'preferred_locations',
        'willing_to_relocate',
        'employment_preferences',
        'expected_salary',
        'onboarding_step',
        'current_status',
        'selected_template_ids',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'skills' => 'array',
            'education' => 'array',
            'internships' => 'array',
            'projects' => 'array',
            'achievements' => 'array',
            'resume_document' => 'array',
            'residing_in_india' => 'boolean',
            'work_experience' => 'array',
            'languages_known' => 'array',
            'certifications_structured' => 'array',
            'academic_achievements' => 'array',
            'awards_honors' => 'array',
            'competitive_exam_results' => 'array',
            'onboarded' => 'boolean',
            'job_roles' => 'array',
            'is_experienced' => 'boolean',
            'preferred_locations' => 'array',
            'willing_to_relocate' => 'boolean',
            'employment_preferences' => 'array',
            'selected_template_ids' => 'array',
            'onboarding_step' => 'integer',
            'package_activated_at' => 'datetime',
            'package_expires_at' => 'datetime',
            'job_credits_expires_at' => 'datetime',
            'resume_credits_expires_at' => 'datetime',
            'last_app_activity_at' => 'datetime',
        ];
    }

    /** Active resume plan key, or null if none / expired. */
    public function activeResumePackageKey(): ?string
    {
        $key = $this->resume_package_key;
        if (! is_string($key) || $key === '') {
            $fallback = $this->package_key;
            $key = is_string($fallback) && $fallback !== '' ? $fallback : null;
        }

        if (! in_array($key, ['basic_resume', 'premium_resume', 'professional_resume'], true)) {
            return null;
        }

        $expires = $this->resume_credits_expires_at ?? $this->package_expires_at;
        if ($expires === null || $expires->isPast()) {
            return null;
        }

        return $key;
    }

    public function hasActiveResumePackage(): bool
    {
        return $this->activeResumePackageKey() !== null;
    }

    /** How many templates the seeker may unlock under their active plan (0 if none). */
    public function allowedTemplateCount(): int
    {
        return match ($this->activeResumePackageKey()) {
            'professional_resume' => 13,
            'premium_resume' => 8,
            'basic_resume' => 4,
            default => 0,
        };
    }

    /** Templates the user explicitly selected (capped to plan limit). Empty = none unlocked. */
    public function unlockedTemplateIds(): array
    {
        $allowed = $this->allowedTemplateCount();
        if ($allowed < 1) {
            return [];
        }

        $selected = $this->selected_template_ids;
        if (! is_array($selected) || $selected === []) {
            return [];
        }

        $ids = array_values(array_unique(array_map(
            static fn ($id) => (string) $id,
            $selected
        )));

        // Stale list from a higher plan — force a fresh selection.
        if (count($ids) > $allowed) {
            return [];
        }

        return $ids;
    }

    public function isTemplateUnlocked(string $templateKey): bool
    {
        return in_array($templateKey, $this->unlockedTemplateIds(), true);
    }

    public function canApply(): bool
    {
        return true;
    }

    /** Resume / AI / PDF credits: not expired and at least one build left. */
    public function canBuildResume(): bool
    {
        if ($this->resume_builds_remaining === null || $this->resume_builds_remaining < 1) {
            return false;
        }
        if ($this->resume_credits_expires_at === null) {
            return false;
        }

        return $this->resume_credits_expires_at->isFuture();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Resume shown to employers (with profile link / applications). */
    public function primaryResumeDraft(): BelongsTo
    {
        return $this->belongsTo(ResumeDraft::class, 'primary_resume_draft_id');
    }
}
