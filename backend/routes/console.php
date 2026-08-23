<?php

use App\Console\Commands\NotifySubscriptionExpiry;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(NotifySubscriptionExpiry::class)->dailyAt('09:00');

if (class_exists(\App\Console\Commands\CheckJobExpirationsCommand::class)) {
    Schedule::command(\App\Console\Commands\CheckJobExpirationsCommand::class)->dailyAt('09:30');
}
