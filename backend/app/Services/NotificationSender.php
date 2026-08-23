<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

/**
 * High-level notification helper.
 *
 * Handles:
 *  - Persisting an in-app Notification record.
 *  - Dispatching a push via FcmService across all user device tokens.
 */
class NotificationSender
{
    public function __construct(private FcmService $fcm) {}

    // -----------------------------------------------------------------
    // Generic send
    // -----------------------------------------------------------------

    /**
     * Create an in-app notification record and (optionally) send a push.
     */
    public function send(User $user, string $title, string $body, string $type = '', array $fcmData = []): void
    {
        if ($type && ! isset($fcmData['type'])) {
            $fcmData['type'] = $type;
        }

        Notification::create([
            'user_id' => $user->id,
            'title'   => $title,
            'body'    => $body,
            'type'    => $type ?: null,
            'data'    => ! empty($fcmData) ? $fcmData : null,
        ]);

        $tokens = $user->deviceTokens()->pluck('fcm_token')->filter()->values()->all();
        if (! empty($tokens)) {
            $this->fcm->sendToTokens($tokens, $title, $body, $fcmData);
        }
    }

    // -----------------------------------------------------------------
    // Job Seeker notifications
    // -----------------------------------------------------------------

    public function newJobMatch(User $seeker, string $jobTitle, int $jobId, ?string $companyName = null, ?string $location = null): void
    {
        $body = filled($companyName)
            ? "{$companyName} is hiring: {$jobTitle}".(filled($location) ? " in {$location}" : '').'. Tap to view and apply!'
            : "A new job matching your profile is available: {$jobTitle}";

        $this->send(
            $seeker,
            "💼 New Job Alert: {$jobTitle}",
            $body,
            'new_job',
            [
                'type' => 'new_job',
                'job_id' => (string) $jobId,
                'reference_id' => (string) $jobId,
                'referenceId' => (string) $jobId,
            ],
        );
    }

    public function applicationSubmitted(User $seeker, string $jobTitle, string $companyName, int $applicationId): void
    {
        $this->send(
            $seeker,
            '✅ Application Submitted',
            "Your application for '{$jobTitle}' at {$companyName} has been submitted successfully.",
            'application_submitted',
            ['type' => 'application', 'application_id' => (string) $applicationId, 'reference_id' => (string) $applicationId, 'referenceId' => (string) $applicationId],
        );
    }

    public function applicationShortlisted(User $seeker, string $jobTitle, int $applicationId): void
    {
        $this->send(
            $seeker,
            "🎉 You're Shortlisted!",
            "Your application for '{$jobTitle}' has been shortlisted. Check your application for more details.",
            'shortlisted',
            ['type' => 'shortlisted', 'application_id' => (string) $applicationId, 'reference_id' => (string) $applicationId, 'referenceId' => (string) $applicationId],
        );
    }

    public function interviewScheduled(User $seeker, string $jobTitle, int $applicationId): void
    {
        $this->send(
            $seeker,
            '📅 Interview Scheduled',
            "Your interview for '{$jobTitle}' has been scheduled. Tap to view details.",
            'interview',
            ['type' => 'interview', 'application_id' => (string) $applicationId, 'reference_id' => (string) $applicationId, 'referenceId' => (string) $applicationId],
        );
    }

    public function applicationAccepted(User $seeker, string $jobTitle, int $applicationId): void
    {
        $this->send(
            $seeker,
            'Application Accepted 🎉',
            "Congratulations! You have been accepted for '{$jobTitle}'.",
            'accepted',
            ['type' => 'accepted', 'application_id' => (string) $applicationId, 'reference_id' => (string) $applicationId, 'referenceId' => (string) $applicationId],
        );
    }

    public function applicationRejected(User $seeker, string $jobTitle, int $applicationId): void
    {
        $this->send(
            $seeker,
            'Application Status Updated',
            "Your application for '{$jobTitle}' was not selected this time. Keep applying for new opportunities.",
            'rejected',
            ['type' => 'rejected', 'application_id' => (string) $applicationId, 'reference_id' => (string) $applicationId, 'referenceId' => (string) $applicationId],
        );
    }

    // -----------------------------------------------------------------
    // Employer notifications
    // -----------------------------------------------------------------

    public function newApplicationReceived(User $employer, string $jobTitle, int $applicationId): void
    {
        $this->send(
            $employer,
            'New Application Received 📋',
            "A candidate has applied for your job: {$jobTitle}",
            'new_application',
            ['application_id' => (string) $applicationId],
        );
    }

    public function candidateAcceptedInvitation(User $employer, string $candidateName, int $applicationId): void
    {
        $this->send(
            $employer,
            'Candidate Accepted Invitation ✅',
            "{$candidateName} has accepted your interview invitation.",
            'candidate_accepted',
            ['application_id' => (string) $applicationId],
        );
    }

    public function subscriptionExpiringSoon(User $employer, int $daysLeft): void
    {
        $this->send(
            $employer,
            'Subscription expiring soon',
            $daysLeft === 1
                ? 'Your JobAllocate plan expires tomorrow. Renew now to keep posting jobs.'
                : "Your JobAllocate plan expires in {$daysLeft} days. Renew now to keep posting jobs.",
            'subscription_expiring',
            ['type' => 'subscription_expiring', 'days_left' => (string) $daysLeft],
        );
    }

    public function subscriptionExpired(User $employer): void
    {
        $this->send(
            $employer,
            'Subscription expired',
            'Your JobAllocate plan has expired. Renew to continue posting jobs and accessing candidates.',
            'subscription_expiring',
            ['type' => 'subscription_expired'],
        );
    }

    public function paymentSuccessful(User $employer, string $planName, string $amount): void
    {
        $this->send(
            $employer,
            'Payment Successful 💳',
            "Your payment of {$amount} for the {$planName} plan was successful. Enjoy premium access!",
            'payment_success',
        );
    }

    public function jobExpiringSoon(User $employer, string $jobTitle, int $jobId, int $daysLeft = 3): void
    {
        $this->send(
            $employer,
            '⏰ Job Post Expiring Soon',
            "Your job post '{$jobTitle}' will expire in {$daysLeft} day(s). Tap to view or manage your listing.",
            'job_expiring_soon',
            ['type' => 'company_job', 'job_id' => (string) $jobId, 'reference_id' => (string) $jobId],
        );
    }

    public function jobExpired(User $employer, string $jobTitle, int $jobId): void
    {
        $this->send(
            $employer,
            '⌛ Job Post Expired',
            "Your job post '{$jobTitle}' has expired after 1 month. Purchase a plan to repost or create a new listing.",
            'job_expired',
            ['type' => 'company_job', 'job_id' => (string) $jobId, 'reference_id' => (string) $jobId],
        );
    }

    // -----------------------------------------------------------------
    // Admin broadcast
    // -----------------------------------------------------------------

    /**
     * Broadcast to a list of users (used by AdminNotificationController).
     */
    public function broadcast(iterable $users, string $title, string $body, array $fcmData = []): int
    {
        $count = 0;
        foreach ($users as $user) {
            $this->send($user, $title, $body, 'broadcast', $fcmData);
            $count++;
        }

        return $count;
    }
}
