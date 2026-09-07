<?php

namespace Tests\Feature;

use App\Models\AiConversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_ai_chat(): void
    {
        $this->postJson('/api/v1/ai/chat', ['message' => 'Hello'])
            ->assertStatus(401);
    }

    public function test_authenticated_seeker_can_chat(): void
    {
        config(['ai_chat.api_key' => 'test-key']);

        Http::fake([
            'api.openai.com/*' => Http::response([
                'choices' => [
                    ['message' => ['content' => 'Hello! How can I help you with JobAllocate?']],
                ],
            ], 200),
        ]);

        $user = User::factory()->create(['role' => 'job_seeker']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/chat', [
            'message' => 'How do I apply for a job?',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.message', 'Hello! How can I help you with JobAllocate?')
            ->assertJsonStructure(['data' => ['conversation_id']]);

        $this->assertDatabaseHas('ai_messages', [
            'role' => 'user',
            'message' => 'How do I apply for a job?',
        ]);
    }

    public function test_authenticated_employer_can_chat(): void
    {
        config(['ai_chat.api_key' => 'test-key']);

        Http::fake([
            '*' => Http::response([
                'choices' => [
                    ['message' => ['content' => 'You can post jobs from your dashboard.']],
                ],
            ], 200),
        ]);

        $user = User::factory()->create(['role' => 'company']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/chat', ['message' => 'How do I post a job?'])
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_user_cannot_access_another_users_conversation(): void
    {
        $owner = User::factory()->create(['role' => 'job_seeker']);
        $other = User::factory()->create(['role' => 'job_seeker']);

        $conversation = AiConversation::query()->create([
            'user_id' => $owner->id,
            'title' => 'Test',
        ]);

        Sanctum::actingAs($other);

        $this->getJson('/api/v1/ai/conversations/'.$conversation->uuid)
            ->assertStatus(404);
    }

    public function test_invalid_message_is_rejected(): void
    {
        $user = User::factory()->create(['role' => 'job_seeker']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/chat', ['message' => ''])
            ->assertStatus(422);

        $this->postJson('/api/v1/ai/chat', [])
            ->assertStatus(422);
    }

    public function test_long_message_is_rejected(): void
    {
        config(['ai_chat.max_message_length' => 100]);

        $user = User::factory()->create(['role' => 'job_seeker']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/chat', [
            'message' => str_repeat('a', 101),
        ])->assertStatus(422);
    }

    public function test_ai_failure_returns_friendly_message(): void
    {
        config(['ai_chat.api_key' => 'test-key']);

        Http::fake([
            '*' => Http::response(['error' => ['message' => 'server error']], 500),
        ]);

        $user = User::factory()->create(['role' => 'job_seeker']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/chat', ['message' => 'Hello'])
            ->assertStatus(503)
            ->assertJsonPath('success', false);
    }

    public function test_conversation_continuity_with_conversation_id(): void
    {
        config(['ai_chat.api_key' => 'test-key']);

        Http::fake([
            '*' => Http::sequence()
                ->push(['choices' => [['message' => ['content' => 'First reply']]]], 200)
                ->push(['choices' => [['message' => ['content' => 'Second reply']]]], 200),
        ]);

        $user = User::factory()->create(['role' => 'job_seeker']);
        Sanctum::actingAs($user);

        $first = $this->postJson('/api/v1/ai/chat', ['message' => 'Hi']);
        $conversationId = $first->json('data.conversation_id');

        $second = $this->postJson('/api/v1/ai/chat', [
            'message' => 'Follow up',
            'conversation_id' => $conversationId,
        ]);

        $second->assertOk()
            ->assertJsonPath('data.conversation_id', $conversationId);

        $this->assertSame(4, \App\Models\AiMessage::query()->count());
    }
}
