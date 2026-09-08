<?php

namespace App\Console\Commands;

use App\Mail\JobNotificationTestMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestEmailCommand extends Command
{
    protected $signature = 'mail:test {email : Recipient email address}';

    protected $description = 'Send a test job-notification email (SMTP). OTP uses Firebase SMS, not email.';

    public function handle(): int
    {
        $email = trim((string) $this->argument('email'));

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address.');

            return self::FAILURE;
        }

        $mailer = (string) config('mail.default');
        $this->info("Mailer: {$mailer}");
        $this->info('Host: '.config('mail.mailers.smtp.host'));
        $this->info('Port: '.config('mail.mailers.smtp.port'));
        $this->info('From: '.config('mail.from.address'));

        try {
            Mail::to($email)->send(new JobNotificationTestMail());
            $this->info("Test job-notification email sent to {$email}.");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Failed to send: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
