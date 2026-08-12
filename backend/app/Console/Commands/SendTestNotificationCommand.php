<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\NotificationSender;
use Illuminate\Console\Command;

class SendTestNotificationCommand extends Command
{
    protected $signature = 'notification:test {user_id? : Optional user ID}';

    protected $description = 'Send a test push & in-app notification to a user';

    public function handle(NotificationSender $notifier): int
    {
        $userId = $this->argument('user_id');

        if ($userId) {
            $user = User::find($userId);
        } else {
            $user = User::where('role', 'job_seeker')->latest('id')->first();
        }

        if (! $user) {
            $this->error('No suitable user found.');
            return 1;
        }

        $this->info("Sending test notification to User #{$user->id} ({$user->name} / {$user->email} / {$user->phone})...");

        $notifier->newJobMatch(
            $user,
            'Senior Software Engineer',
            1,
            'TechCorp Solutions',
            'Bengaluru'
        );

        $this->info("✅ Test notification sent successfully!");
        return 0;
    }
}
