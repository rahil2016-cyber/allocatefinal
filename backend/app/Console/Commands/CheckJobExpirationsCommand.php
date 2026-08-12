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

        // 1. Send warning notification to employers whose jobs expire in 3 days (27 to 28 days after published_at or deadline in 3 days)
        $expiringSoonJobs = JobPost::query()
            ->where('status', JobPostStatus::Published)
            ->with(['company.user'])
            ->where(function ($q) {
                $q->whereBetween('published_at', [now()->subDays(28), now()->subDays(27)])
                  ->orWhereBetween('application_deadline_at', [now()->addDays(2), now()->addDays(3)]);
            })
            ->get();

        $warnCount = 0;
        foreach ($expiringSoonJobs as $job) {
            $employerUser = $job->company?->user;
            if ($employerUser) {
                $notifier->jobExpiringSoon($employerUser, $job->title, $job->id, 3);
                $warnCount++;
            }
        }
        $this->info("Sent expiration warnings for {$warnCount} job(s).");

        // 2. Find jobs that reached 30 days or past application_deadline_at and mark as Closed + notify employer
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

        $this->info("Successfully closed and notified employers for {$expiredCount} expired job(s).");
        Log::info("[CheckJobExpirationsCommand] Warned {$warnCount} job(s), expired & closed {$expiredCount} job(s).");

        return 0;
    }
}
