<?php

namespace App\Services\RateLimiting;

use Illuminate\Contracts\Cache\Repository as CacheRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Production leaky-bucket rate limiter (cache-backed).
 *
 * Water ("level") drains at a constant rate. Each accepted request adds 1 unit.
 * When level would exceed capacity, the request is rejected and Retry-After is
 * derived from how long until enough water has leaked.
 */
class LeakyBucketRateLimiter
{
    private const STATE_TTL_PADDING_SECONDS = 3600;

    public function __construct(
        private readonly ?CacheRepository $cache = null,
    ) {}

    private function store(): CacheRepository
    {
        return $this->cache ?? Cache::store();
    }

    /**
     * Peek whether a request would be allowed (updates drained level only).
     *
     * @return array{allowed: bool, remaining: float, retry_after: int, limit: float, level: float}
     */
    public function check(
        string $key,
        float $capacity,
        int $periodSeconds,
        float $cost = 1.0,
    ): array {
        return $this->run($key, $capacity, $periodSeconds, $cost, consume: false);
    }

    /**
     * Consume capacity for an allowed request.
     *
     * @return array{allowed: bool, remaining: float, retry_after: int, limit: float, level: float}
     */
    public function hit(
        string $key,
        float $capacity,
        int $periodSeconds,
        float $cost = 1.0,
    ): array {
        return $this->run($key, $capacity, $periodSeconds, $cost, consume: true);
    }

    /**
     * Check + consume in one step (single-key use).
     *
     * @return array{allowed: bool, remaining: float, retry_after: int, limit: float, level: float}
     */
    public function attempt(
        string $key,
        float $capacity,
        int $periodSeconds,
        float $cost = 1.0,
    ): array {
        return $this->run($key, $capacity, $periodSeconds, $cost, consume: true);
    }

    /**
     * @return array{allowed: bool, remaining: float, retry_after: int, limit: float, level: float}
     */
    private function run(
        string $key,
        float $capacity,
        int $periodSeconds,
        float $cost,
        bool $consume,
    ): array {
        $capacity = max(1.0, $capacity);
        $periodSeconds = max(1, $periodSeconds);
        $leakRate = $capacity / $periodSeconds;
        $cacheKey = $this->cacheKey($key);
        $lockKey = $cacheKey.':lock';

        $runner = function () use ($cacheKey, $capacity, $leakRate, $periodSeconds, $cost, $consume): array {
            return $this->runUnlocked($cacheKey, $capacity, $leakRate, $periodSeconds, $cost, $consume);
        };

        try {
            $lock = $this->store()->lock($lockKey, 5);

            return $lock->block(3, $runner);
        } catch (\Throwable $e) {
            Log::debug('leaky_bucket.lock_fallback', ['key' => $key, 'error' => $e->getMessage()]);

            return $runner();
        }
    }

    /**
     * @return array{allowed: bool, remaining: float, retry_after: int, limit: float, level: float}
     */
    private function runUnlocked(
        string $cacheKey,
        float $capacity,
        float $leakRate,
        int $periodSeconds,
        float $cost,
        bool $consume,
    ): array {
        $now = microtime(true);
        $state = $this->store()->get($cacheKey, [
            'level' => 0.0,
            'updated_at' => $now,
        ]);

        $level = (float) ($state['level'] ?? 0);
        $updatedAt = (float) ($state['updated_at'] ?? $now);
        $elapsed = max(0.0, $now - $updatedAt);
        $level = max(0.0, $level - ($elapsed * $leakRate));

        $wouldExceed = ($level + $cost) > $capacity + 1e-9;

        if ($wouldExceed) {
            $overflow = ($level + $cost) - $capacity;
            $retryAfter = (int) max(1, (int) ceil($overflow / $leakRate));

            $this->store()->put($cacheKey, [
                'level' => $level,
                'updated_at' => $now,
            ], $periodSeconds + self::STATE_TTL_PADDING_SECONDS);

            return [
                'allowed' => false,
                'remaining' => max(0.0, $capacity - $level),
                'retry_after' => $retryAfter,
                'limit' => $capacity,
                'level' => $level,
            ];
        }

        if ($consume) {
            $level += $cost;
        }

        $this->store()->put($cacheKey, [
            'level' => $level,
            'updated_at' => $now,
        ], $periodSeconds + self::STATE_TTL_PADDING_SECONDS);

        return [
            'allowed' => true,
            'remaining' => max(0.0, $capacity - $level),
            'retry_after' => 0,
            'limit' => $capacity,
            'level' => $level,
        ];
    }

    public function clear(string $key): void
    {
        $this->store()->forget($this->cacheKey($key));
    }

    private function cacheKey(string $key): string
    {
        return 'leaky_bucket:'.sha1($key);
    }
}
