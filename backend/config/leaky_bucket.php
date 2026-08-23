<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Leaky-bucket auth rate limits
    |--------------------------------------------------------------------------
    |
    | capacity       = max request units the bucket can hold
    | period_seconds = time for a full bucket to drain (steady leak rate)
    | Sustained rate ≈ capacity / period_seconds
    |
    | Login: 10 / minute
    | OTP:   5 / 30 minutes
    |
    */

    'login' => [
        'capacity' => 10,
        'period_seconds' => 60,
        'message' => 'Too many login attempts',
    ],

    'otp' => [
        'capacity' => 5,
        'period_seconds' => 30 * 60,
        'message' => 'Too many OTP requests. Limit is 5 every 30 minutes',
    ],

    'otp_verify' => [
        'capacity' => 5,
        'period_seconds' => 30 * 60,
        'message' => 'Too many OTP verification attempts. Limit is 5 every 30 minutes',
    ],

];
