<?php

namespace App\Console\Commands;

use App\Enums\JobPostStatus;
use App\Models\JobPost;
use App\Services\NotificationSender;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckJobExpirationsCommand extends Command
{
    protected $signature = 'jobs:check-expirations';

    protected $description = 'Check published job posts for 1-month expiration, send warning & expired notifications to employers';

    public function handle(NotificationSender $notifier): int
    {
        $this->info('Checking job post expirations...');

        // 1. Send warning notification 7 days before expiry
        $jobs7Days = JobPost::query()
            ->where('status', JobPostStatus::Published)
            ->with(['company.user'])
            ->where(function ($q) {
                $q->whereBetween('published_at', [now()->subDays(24), now()->subDays(23)])
                  ->orWhereBetween('application_deadline_at', [now()->addDays(6)->addHours(12), now()->addDays(7)->addHours(12)]);
            })
            ->get();

        $warn7Count = 0;
        foreach ($jobs7Days as $job) {
            $employerUser = $job->company?->user;
            if ($employerUser) {
                $notifier->jobExpiringSoon($employerUser, $job->title, $job->id, 7);
                $warn7Count++;
            }
        }

        // 2. Send warning notification 2 days before expiry
        $jobs2Days = JobPost::query()
            ->where('status', JobPostStatus::Published)
            ->with(['company.user'])
            ->where(function ($q) {
                $q->whereBetween('published_at', [now()->subDays(29), now()->subDays(28)])
                  ->orWhereBetween('application_deadline_at', [now()->addDays(1)->addHours(12), now()->addDays(2)->addHours(12)]);
            })
            ->get();

        $warn2Count = 0;
        foreach ($jobs2Days as $job) {
            $employerUser = $job->company?->user;
            if ($employerUser) {
                $notifier->jobExpiringSoon($employerUser, $job->title, $job->id, 2);
                $warn2Count++;
            }
        }

        // 3. Find jobs that reached 30 days or past application_deadline_at and mark as Closed + notify employer
        $expiredJobs = JobPost::query()
            ->where('status', JobPostStatus::Published)
            ->with(['company.user'])
            ->where(function ($q) {
                $q->where('published_at', '<=', now()->subDays(30))
                  ->orWhere('application_deadline_at', '<=', now());
            })
            ->get();

        $expiredCount = 0;
        foreach ($expiredJobs as $job) {
            $job->update([
                'status' => JobPostStatus::Closed->value,
                'updated_at' => now(),
            ]);

            $employerUser = $job->company?->user;
            if ($employerUser) {
                $notifier->jobExpired($employerUser, $job->title, $job->id);
            }
            $expiredCount++;
        }

        $this->info("Expirations check completed: 7-day warnings: {$warn7Count}, 2-day warnings: {$warn2Count}, expired & closed: {$expiredCount}.");
        Log::info("[CheckJobExpirationsCommand] 7-day warnings: {$warn7Count}, 2-day warnings: {$warn2Count}, expired & closed: {$expiredCount}.");

        return 0;
    }
}
