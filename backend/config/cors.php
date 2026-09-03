<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Allowed origins are the production admin panel (www.joballocate.tech),
    | the canonical API host (joballocate.tech), and localhost for development.
    |
    | supports_credentials is false because the Flutter mobile app and admin
    | panel use Bearer token authentication, not cookies/sessions.
    |
    */

    // Apply CORS to all API routes and Sanctum CSRF endpoint.
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Explicit allowed origins — no wildcard so Authorization headers are safe.
    'allowed_origins' => [
        'https://www.joballocate.tech',   // production admin / web frontend
        'https://joballocate.tech',        // canonical API host (same-origin web requests)
        'http://localhost',                // local development
        'http://localhost:3000',           // Next.js dev server
        'http://localhost:8080',           // generic local dev
        'http://127.0.0.1',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Requested-With',
        'X-XSRF-TOKEN',
    ],

    'exposed_headers' => [],

    // Cache preflight for 2 hours to reduce OPTIONS round-trips.
    'max_age' => 7200,

    // false — we use Bearer token auth, not cookie/session credentials.
    'supports_credentials' => false,

];
