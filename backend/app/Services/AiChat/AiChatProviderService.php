<?php

namespace App\Services\AiChat;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class AiChatProviderService
{
    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    public function chat(array $messages): string
    {
        $apiKey = config('ai_chat.api_key');
        if ($apiKey === null || $apiKey === '') {
            throw new RuntimeException('AI chat is not configured.');
        }

        $url = (string) config('ai_chat.chat_completions_url');
        $model = (string) config('ai_chat.model', 'gpt-4o-mini');
        $timeout = (int) config('ai_chat.timeout', 60);
        $maxTokens = (int) config('ai_chat.max_tokens', 1024);

        $started = microtime(true);

        $response = Http::timeout($timeout)
            ->withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post($url, [
                'model' => $model,
                'messages' => $messages,
                'max_tokens' => $maxTokens,
                'temperature' => 0.4,
            ]);

        $latencyMs = (int) round((microtime(true) - $started) * 1000);

        if (! $response->successful()) {
            $body = $response->json();
            $detail = is_array($body)
                ? (data_get($body, 'error.message') ?? data_get($body, 'error') ?? 'provider error')
                : 'provider error';

            Log::warning('AI chat provider error', [
                'status' => $response->status(),
                'latency_ms' => $latencyMs,
                'detail' => is_string($detail) ? mb_substr($detail, 0, 200) : 'non-string error',
            ]);

            $status = $response->status();
            if ($status === 429) {
                throw new RuntimeException('AI service rate limit reached. Please try again later.');
            }
            if ($status === 402 || $status === 403) {
                throw new RuntimeException('AI service is temporarily unavailable.');
            }

            throw new RuntimeException('AI service error.');
        }

        $text = data_get($response->json(), 'choices.0.message.content');
        if (! is_string($text) || trim($text) === '') {
            Log::warning('AI chat empty response', ['latency_ms' => $latencyMs]);
            throw new RuntimeException('AI returned an empty response.');
        }

        Log::info('AI chat success', [
            'latency_ms' => $latencyMs,
            'model' => $model,
        ]);

        return trim($text);
    }
}
