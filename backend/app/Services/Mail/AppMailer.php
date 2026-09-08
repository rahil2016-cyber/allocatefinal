<?php

namespace App\Services\Mail;

use App\Models\User;
use App\Support\Identifier;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AppMailer
{
    public function send(string $email, Mailable $mailable): bool
    {
        if ($email === '' || Identifier::isSyntheticEmail($email)) {
            Log::debug('[Mail] Skipped — no real email on account', [
                'email' => $email,
                'mailable' => $mailable::class,
            ]);

            return false;
        }

        try {
            Mail::to($email)->send($mailable);
            Log::info('[Mail] Sent', ['email' => $email, 'mailable' => $mailable::class]);

            return true;
        } catch (\Throwable $e) {
            Log::warning('[Mail] Send failed', [
                'email' => $email,
                'mailable' => $mailable::class,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function sendToUser(?User $user, Mailable $mailable): bool
    {
        if ($user === null || $user->email === null || $user->email === '') {
            return false;
        }

        return $this->send($user->email, $mailable);
    }
}
