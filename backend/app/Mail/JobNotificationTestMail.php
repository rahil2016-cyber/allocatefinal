<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Test mailable for `php artisan mail:test`. */
class JobNotificationTestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name', 'JobAllocate').' — Test job notification email',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.test_notification',
        );
    }
}
