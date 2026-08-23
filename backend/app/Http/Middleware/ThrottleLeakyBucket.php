<?php

namespace App\Http\Middleware;

use App\Services\RateLimiting\LeakyBucketRateLimiter;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Named leaky-bucket throttle: middleware alias `leaky:{policy}`.
 *
 * Policies are defined in config/leaky_bucket.php.
 * Each request is checked against IP and identifier buckets (when present).
 */
class ThrottleLeakyBucket
{
    public function __construct(
        private readonly LeakyBucketRateLimiter $limiter,
    ) {}

    public function handle(Request $request, Closure $next, string $policy = 'login'): Response
    {
        $config = config("leaky_bucket.{$policy}");
        if (! is_array($config)) {
            abort(500, "Unknown leaky bucket policy [{$policy}].");
        }

        $capacity = (float) ($config['capacity'] ?? 10);
        $period = (int) ($config['period_seconds'] ?? 60);
        $message = (string) ($config['message'] ?? 'Too many requests. Please wait and try again.');

        $keys = $this->bucketKeys($request, $policy);
        $worstRetry = 0;
        $remaining = $capacity;

        // Phase 1: check all buckets without consuming (avoids partial debit).
        foreach ($keys as $key) {
            $result = $this->limiter->check($key, $capacity, $period);
            $remaining = min($remaining, $result['remaining']);
            if (! $result['allowed']) {
                $worstRetry = max($worstRetry, $result['retry_after']);
            }
        }

        if ($worstRetry > 0) {
            return $this->tooManyAttempts($message, $capacity, $worstRetry, max(0, (int) floor($remaining)));
        }

        // Phase 2: consume on every key.
        foreach ($keys as $key) {
            $result = $this->limiter->hit($key, $capacity, $period);
            $remaining = min($remaining, $result['remaining']);
            if (! $result['allowed']) {
                // Rare race — treat as limited.
                return $this->tooManyAttempts(
                    $message,
                    $capacity,
                    max(1, $result['retry_after']),
                    max(0, (int) floor($result['remaining'])),
                );
            }
        }

        /** @var Response $response */
        $response = $next($request);

        return $this->addHeaders($response, $capacity, max(0, (int) floor($remaining)), 0);
    }

    /**
     * @return list<string>
     */
    private function bucketKeys(Request $request, string $policy): array
    {
        $ip = $request->ip() ?: 'unknown';
        $keys = ["{$policy}|ip|{$ip}"];

        $identifier = $this->identifier($request);
        if ($identifier !== null) {
            $keys[] = "{$policy}|id|{$identifier}";
        }

        return $keys;
    }

    private function identifier(Request $request): ?string
    {
        $raw = (string) (
            $request->input('identifier')
            ?? $request->input('phone')
            ?? $request->input('email')
            ?? $request->input('username')
            ?? ''
        );

        $raw = trim($raw);
        if ($raw === '') {
            return null;
        }

        if (strlen($raw) > 64) {
            return 'tok:'.substr(hash('sha256', $raw), 0, 32);
        }

        $normalized = strtolower(preg_replace('/\s+/', '', $raw) ?? '');

        return $normalized !== '' ? $normalized : null;
    }

    private function tooManyAttempts(
        string $message,
        float $limit,
        int $retryAfter,
        int $remaining,
    ): Response {
        $minutes = (int) ceil($retryAfter / 60);
        $friendlyWait = $retryAfter < 60
            ? "{$retryAfter} seconds"
            : ($minutes === 1 ? '1 minute' : "{$minutes} minutes");

        $response = response()->json([
            'success' => false,
            'message' => rtrim($message, '.').'. Try again in '.$friendlyWait.'.',
            'data' => [
                'retry_after_seconds' => $retryAfter,
                'limit' => (int) $limit,
            ],
        ], 429);

        return $this->addHeaders($response, $limit, $remaining, $retryAfter);
    }

    private function addHeaders(
        Response $response,
        float $limit,
        int $remaining,
        int $retryAfter,
    ): Response {
        $response->headers->set('X-RateLimit-Limit', (string) (int) $limit);
        $response->headers->set('X-RateLimit-Remaining', (string) max(0, $remaining));
        if ($retryAfter > 0) {
            $response->headers->set('Retry-After', (string) $retryAfter);
            $response->headers->set('X-RateLimit-Reset', (string) (time() + $retryAfter));
        }

        return $response;
    }
}
