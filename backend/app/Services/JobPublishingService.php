<?php

namespace App\Services;

use App\Enums\CompanyVerificationStatus;
use App\Enums\JobPostStatus;
use App\Models\Company;
use App\Models\JobPost;

final class JobPublishingService
{
    public function __construct(
        private readonly PlatformSettingService $settings
    ) {}

    /**
     * New job visibility. When [config joballocate.auto_publish_new_jobs] is true,
     * jobs go live immediately (until admin moderation is enabled).
     * Otherwise: verified companies publish; others stay pending_review.
     */
    public function initialStatusForNewJob(Company $company): array
    {
        if ($this->settings->autoPublishJobs()) {
            return [
                'status' => JobPostStatus::Published,
                'published_at' => now(),
            ];
        }

        if ($company->verification_status === CompanyVerificationStatus::Verified) {
            return [
                'status' => JobPostStatus::Published,
                'published_at' => now(),
            ];
        }

        return [
            'status' => JobPostStatus::PendingReview,
            'published_at' => null,
        ];
    }

    public function publish(JobPost $job): void
    {
        $job->update([
            'status' => JobPostStatus::Published,
            'published_at' => now(),
            'review_note' => null,
        ]);

        $this->notifyMatchingJobSeekers($job);
    }

    public function notifyMatchingJobSeekers(JobPost $job): void
    {
        try {
            $notifier = app(NotificationSender::class);
            $companyName = $job->company?->name ?? 'A top company';

            // Query candidates matching industry_type, job roles, or location
            $matchedUserIds = \App\Models\JobSeekerProfile::query()
                ->where(function ($q) use ($job) {
                    if (filled($job->industry_type)) {
                        $q->orWhere('industry_type', $job->industry_type);
                    }
                    if (filled($job->role)) {
                        $q->orWhereJsonContains('job_roles', $job->role);
                    }
                    if (filled($job->role_category)) {
                        $q->orWhereJsonContains('job_roles', $job->role_category);
                    }
                    if (filled($job->location)) {
                        $q->orWhere('city', 'LIKE', '%' . $job->location . '%')
                          ->orWhere('state', 'LIKE', '%' . $job->location . '%')
                          ->orWhereJsonContains('preferred_locations', $job->location);
                    }
                })
                ->pluck('user_id')
                ->filter()
                ->unique()
                ->all();

            // If matched count is low, include recently active job seekers to ensure broad reach
            if (count($matchedUserIds) < 50) {
                $additionalUserIds = \App\Models\JobSeekerProfile::query()
                    ->latest('updated_at')
                    ->limit(500)
                    ->pluck('user_id')
                    ->filter()
                    ->all();
                $matchedUserIds = array_values(array_unique(array_merge($matchedUserIds, $additionalUserIds)));
            }

            // Fetch active job seeker users (limit up to 500 to prevent notification timeout)
            $users = \App\Models\User::query()
                ->whereIn('id', array_slice($matchedUserIds, 0, 500))
                ->where('role', \App\Enums\UserRole::JobSeeker->value)
                ->get();

            $sentCount = 0;
            foreach ($users as $user) {
                $notifier->newJobMatch($user, $job->title, $job->id, $companyName, $job->location);
                $sentCount++;
            }

            \Illuminate\Support\Facades\Log::info("[JobPublishingService] Sent job match notification for job #{$job->id} '{$job->title}' to {$sentCount} candidate(s).");
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('[JobPublishingService] Failed to send job match notifications: ' . $e->getMessage());
        }
    }

    public function reject(JobPost $job, ?string $note = null): void
    {
        $job->update([
            'status' => JobPostStatus::Rejected,
            'published_at' => null,
            'review_note' => $note,
        ]);
    }

    public function unpublish(JobPost $job, ?string $note = null): void
    {
        $job->update([
            'status' => JobPostStatus::PendingReview,
            'published_at' => null,
            'review_note' => $note,
        ]);
    }
}
