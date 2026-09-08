<?php

namespace Tests\Unit;

use App\Services\AiChat\AiChatContextService;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

class AiChatLocationMatchTest extends TestCase
{
    private function invokeFuzzy(string $needle, string $haystack): bool
    {
        $service = new AiChatContextService;
        $method = new ReflectionMethod(AiChatContextService::class, 'fuzzyPlaceMatches');
        $method->setAccessible(true);

        return $method->invoke($service, $needle, $haystack);
    }

    public function test_matches_common_davangere_spelling_variants(): void
    {
        $this->assertTrue($this->invokeFuzzy('Davanagere', 'Davangere, Karnataka'));
        $this->assertTrue($this->invokeFuzzy('Davangere', 'Davanagere, Karnataka'));
        $this->assertTrue($this->invokeFuzzy('Davanager', 'Davangere, Karnataka'));
        $this->assertTrue($this->invokeFuzzy('Davangre', 'Davangere, Karnataka'));
    }

    public function test_does_not_match_unrelated_city(): void
    {
        $this->assertFalse($this->invokeFuzzy('Davangere', 'Bengaluru, Karnataka'));
        $this->assertFalse($this->invokeFuzzy('Mumbai', 'Davangere, Karnataka'));
    }
}
