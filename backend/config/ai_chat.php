<?php

return [

    /*
    |--------------------------------------------------------------------------
    | JobAllocate AI Chat Assistant
    |--------------------------------------------------------------------------
    |
    | API key is server-side only — never expose to Flutter clients.
    | Uses OpenAI-compatible chat completions (OpenAI, OpenRouter, etc.).
    |
    */

    'api_key' => (($k = env('AI_API_KEY')) !== null && trim((string) $k) !== '') ? trim((string) $k) : null,

    'model' => env('AI_MODEL', 'gpt-4o-mini'),

    'chat_completions_url' => env(
        'AI_CHAT_COMPLETIONS_URL',
        'https://api.openai.com/v1/chat/completions'
    ),

    'max_tokens' => (int) env('AI_MAX_TOKENS', 1024),

    'timeout' => (int) env('AI_TIMEOUT', 60),

    'rate_limit' => (int) env('AI_CHAT_RATE_LIMIT', 20),

    'max_message_length' => (int) env('AI_MAX_MESSAGE_LENGTH', 2000),

    'max_history_messages' => (int) env('AI_MAX_HISTORY_MESSAGES', 12),

    'max_context_chars' => (int) env('AI_MAX_CONTEXT_CHARS', 8000),

];
