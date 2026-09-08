<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Services\AiChat\AiChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class AiChatController extends Controller
{
    use ApiResponses;

    public function chat(Request $request, AiChatService $chat): JsonResponse
    {
        $maxLen = (int) config('ai_chat.max_message_length', 2000);

        $validated = $request->validate([
            'message' => ['required', 'string', 'min:1', 'max:'.$maxLen],
            'conversation_id' => ['nullable', 'string', 'uuid'],
            'job_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = $request->user();
        $message = trim($validated['message']);

        if ($message === '') {
            return $this->fail('Message cannot be empty.', null, 422);
        }

        try {
            $result = $chat->handleMessage(
                $user,
                $message,
                $validated['conversation_id'] ?? null,
                isset($validated['job_id']) ? (int) $validated['job_id'] : null,
            );
        } catch (RuntimeException $e) {
            Log::warning('[AiChat] Provider error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            $friendly = match (true) {
                str_contains($e->getMessage(), 'not configured') => 'AI assistant is not available right now.',
                str_contains($e->getMessage(), 'rate limit') => 'Too many AI requests. Please wait and try again.',
                default => "Sorry, I'm having trouble connecting right now. Please try again.",
            };

            return $this->fail($friendly, null, 503);
        } catch (\Throwable $e) {
            Log::error('[AiChat] Request failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'exception' => $e::class,
            ]);
            report($e);

            return $this->fail("Sorry, I'm having trouble connecting right now. Please try again.", null, 503);
        }

        $conversation = $result['conversation'];

        return $this->ok([
            'message' => $result['reply'],
            'conversation_id' => $conversation->uuid,
            'jobs' => $result['jobs'],
        ]);
    }

    public function show(Request $request, string $conversationId, AiChatService $chat): JsonResponse
    {
        $conversation = $chat->getConversationForUser($request->user(), $conversationId);

        if ($conversation === null) {
            return $this->fail('Conversation not found.', null, 404);
        }

        $columns = ['role', 'message', 'created_at'];
        if (Schema::hasColumn('ai_messages', 'metadata')) {
            $columns[] = 'metadata';
        }

        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->get($columns)
            ->map(fn ($m) => [
                'role' => $m->role,
                'message' => $m->message,
                'jobs' => (is_array($m->metadata ?? null) ? ($m->metadata['jobs'] ?? []) : []),
                'created_at' => $m->created_at?->toIso8601String(),
            ]);

        return $this->ok([
            'conversation_id' => $conversation->uuid,
            'title' => $conversation->title,
            'messages' => $messages,
        ]);
    }
}
