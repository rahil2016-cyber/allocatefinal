<?php

namespace Tests\Unit;

use App\Services\RateLimiting\LeakyBucketRateLimiter;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class LeakyBucketRateLimiterTest extends TestCase
{
    private LeakyBucketRateLimiter $limiter;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->limiter = new LeakyBucketRateLimiter(Cache::store('array'));
    }

    public function test_login_allows_ten_then_blocks(): void
    {
        $key = 'login|test|'.uniqid('', true);

        for ($i = 0; $i < 10; $i++) {
            $result = $this->limiter->attempt($key, capacity: 10, periodSeconds: 60);
            $this->assertTrue($result['allowed'], "request {$i} should be allowed");
        }

        $blocked = $this->limiter->attempt($key, capacity: 10, periodSeconds: 60);
        $this->assertFalse($blocked['allowed']);
        $this->assertGreaterThan(0, $blocked['retry_after']);
    }

    public function test_otp_allows_five_per_thirty_minutes(): void
    {
        $key = 'otp|test|'.uniqid('', true);

        for ($i = 0; $i < 5; $i++) {
            $result = $this->limiter->attempt($key, capacity: 5, periodSeconds: 1800);
            $this->assertTrue($result['allowed'], "otp {$i} should be allowed");
        }

        $blocked = $this->limiter->attempt($key, capacity: 5, periodSeconds: 1800);
        $this->assertFalse($blocked['allowed']);
        // Full bucket needs ~6 minutes for 1 slot at 5/1800 per second ≈ 360s
        $this->assertGreaterThanOrEqual(300, $blocked['retry_after']);
    }

    public function test_check_does_not_consume(): void
    {
        $key = 'peek|'.uniqid('', true);

        for ($i = 0; $i < 10; $i++) {
            $peek = $this->limiter->check($key, capacity: 3, periodSeconds: 60);
            $this->assertTrue($peek['allowed']);
        }

        $hit = $this->limiter->hit($key, capacity: 3, periodSeconds: 60);
        $this->assertTrue($hit['allowed']);
        $this->assertLessThan(3, $hit['remaining']);
    }
}
