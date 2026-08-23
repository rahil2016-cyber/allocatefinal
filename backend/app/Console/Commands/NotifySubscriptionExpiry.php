<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Services\NotificationSender;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * Run daily (via scheduler) to notify employers whose subscription
 * is expiring soon, or just expired.
 *
 * artisan notify:subscription-expiry
 */
class NotifySubscriptionExpiry extends Command
{
    protected $signature = 'notify:subscription-expiry';

    protected $description = 'Send push notifications to employers whose premium subscription is about to expire.';

    public function __construct(private NotificationSender $sender)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        // Remind at 7 / 3 / 1 days left, and once on expiry day.
        $warningDays = [7, 3, 1, 0];

        $companies = Company::with(['owner', 'subscriptionPayments'])->get();

        $notified = 0;
        foreach ($companies as $company) {
            $expiresAt = $company->subscriptionExpiresAt();
            if ($expiresAt === null || $company->owner === null) {
                continue;
            }

            $daysLeft = (int) Carbon::today()->diffInDays($expiresAt->copy()->startOfDay(), false);

            if (! in_array($daysLeft, $warningDays, true)) {
                continue;
            }

            if ($daysLeft === 0) {
                $this->sender->subscriptionExpired($company->owner);
            } else {
                $this->sender->subscriptionExpiringSoon($company->owner, $daysLeft);
            }
            $notified++;
        }

        $this->info("Subscription expiry notifications sent: {$notified}");

        return self::SUCCESS;
    }
}
