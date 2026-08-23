<?php

namespace Tests\Feature;

use App\Models\SeekerPackage;
use App\Models\SeekerPackagePurchase;
use App\Models\User;
use App\Services\Cashfree\CashfreeClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class JobSeekerPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.cashfree.app_id' => 'test_app_id',
            'services.cashfree.secret_key' => 'test_secret_key',
            'services.cashfree.env' => 'sandbox',
            'services.cashfree.api_version' => '2023-08-01',
        ]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_create_order_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/job-seeker/payments/create-order', [
            'package_key' => 'basic_resume',
        ]);

        $response->assertStatus(401);
    }

    public function test_create_order_fails_with_invalid_package(): void
    {
        $user = User::factory()->create(['role' => 'job_seeker']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/job-seeker/payments/create-order', [
            'package_key' => 'invalid_package_key',
        ]);

        $response->assertStatus(404);
    }

    public function test_create_order_succeeds_and_creates_pending_purchase(): void
    {
        $user = User::factory()->create(['role' => 'job_seeker']);
        Sanctum::actingAs($user);

        SeekerPackage::create([
            'key' => 'basic_resume',
            'title' => 'Basic Resume',
            'description' => 'Test',
            'kind' => 'resume',
            'price_inr' => 99,
            'duration_days' => 30,
            'applications_included' => 0,
            'resume_builds_included' => 5,
            'is_active' => true,
        ]);

        $mock = Mockery::mock(CashfreeClient::class);
        $mock->shouldReceive('createOrder')
            ->once()
            ->andReturn([
                'order_id' => 'SKR_TEST_ORDER',
                'payment_session_id' => 'session_abc',
                'order_status' => 'ACTIVE',
                'cf_order_id' => 'CF_123',
            ]);
        $mock->shouldReceive('sdkEnvironment')->andReturn('sandbox');
        $this->app->instance(CashfreeClient::class, $mock);

        $response = $this->postJson('/api/v1/job-seeker/payments/create-order', [
            'package_key' => 'basic_resume',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.payment_session_id', 'session_abc')
            ->assertJsonPath('data.amount', 9900)
            ->assertJsonPath('data.environment', 'sandbox');

        $merchantOrderId = $response->json('data.merchant_order_id');
        $this->assertNotEmpty($merchantOrderId);

        $this->assertDatabaseHas('seeker_package_purchases', [
            'user_id' => $user->id,
            'package_key' => 'basic_resume',
            'payment_status' => 'pending',
            'merchant_order_id' => $merchantOrderId,
            'phonepe_merchant_order_id' => $merchantOrderId,
            'cashfree_payment_session_id' => 'session_abc',
            'activated_at' => null,
            'expires_at' => null,
        ]);
    }

    public function test_confirm_status_succeeds_and_activates_credits(): void
    {
        $user = User::factory()->create(['role' => 'job_seeker']);
        Sanctum::actingAs($user);

        $pkg = SeekerPackage::create([
            'key' => 'basic_resume',
            'title' => 'Basic Resume',
            'description' => 'Test',
            'kind' => 'resume',
            'price_inr' => 99,
            'duration_days' => 30,
            'applications_included' => 0,
            'resume_builds_included' => 5,
            'is_active' => true,
        ]);

        $purchase = SeekerPackagePurchase::create([
            'user_id' => $user->id,
            'seeker_package_id' => $pkg->id,
            'package_key' => $pkg->key,
            'title' => $pkg->title,
            'kind' => $pkg->kind,
            'price_inr' => $pkg->price_inr,
            'duration_days' => $pkg->duration_days,
            'applications_granted' => 0,
            'resume_builds_granted' => 5,
            'payment_status' => 'pending',
            'merchant_order_id' => 'SKR_TEST_123',
            'phonepe_merchant_order_id' => 'SKR_TEST_123',
            'cashfree_order_id' => 'CF_test',
            'activated_at' => null,
            'expires_at' => null,
        ]);

        $mock = Mockery::mock(CashfreeClient::class);
        $mock->shouldReceive('getOrder')
            ->once()
            ->with('SKR_TEST_123')
            ->andReturn([
                'order_id' => 'SKR_TEST_123',
                'cf_order_id' => 'CF_test',
                'order_status' => 'PAID',
                'cf_payment_id' => 'TXN_999',
            ]);
        $mock->shouldReceive('extractPaymentId')->andReturn('TXN_999');
        $mock->shouldReceive('isOrderPaid')->andReturn(true);
        $mock->shouldReceive('isOrderFailed')->andReturn(false);
        $this->app->instance(CashfreeClient::class, $mock);

        $response = $this->postJson('/api/v1/job-seeker/payments/confirm-status', [
            'merchant_order_id' => 'SKR_TEST_123',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.payment_status', 'successful');

        $this->assertDatabaseHas('seeker_package_purchases', [
            'id' => $purchase->id,
            'payment_status' => 'successful',
            'cashfree_payment_id' => 'TXN_999',
        ]);

        $this->assertDatabaseHas('job_seeker_profiles', [
            'user_id' => $user->id,
            'resume_builds_remaining' => 5,
            'resume_package_key' => 'basic_resume',
        ]);
    }

    public function test_confirm_status_failed_updates_payment_status(): void
    {
        $user = User::factory()->create(['role' => 'job_seeker']);
        Sanctum::actingAs($user);

        $pkg = SeekerPackage::create([
            'key' => 'basic_resume',
            'title' => 'Basic Resume',
            'description' => 'Test',
            'kind' => 'resume',
            'price_inr' => 99,
            'duration_days' => 30,
            'applications_included' => 0,
            'resume_builds_included' => 5,
            'is_active' => true,
        ]);

        $purchase = SeekerPackagePurchase::create([
            'user_id' => $user->id,
            'seeker_package_id' => $pkg->id,
            'package_key' => $pkg->key,
            'title' => $pkg->title,
            'kind' => $pkg->kind,
            'price_inr' => $pkg->price_inr,
            'duration_days' => $pkg->duration_days,
            'applications_granted' => 0,
            'resume_builds_granted' => 5,
            'payment_status' => 'pending',
            'merchant_order_id' => 'SKR_FAIL_123',
            'phonepe_merchant_order_id' => 'SKR_FAIL_123',
            'activated_at' => null,
            'expires_at' => null,
        ]);

        $mock = Mockery::mock(CashfreeClient::class);
        $mock->shouldReceive('getOrder')
            ->once()
            ->andReturn([
                'order_id' => 'SKR_FAIL_123',
                'order_status' => 'EXPIRED',
            ]);
        $mock->shouldReceive('extractPaymentId')->andReturn(null);
        $mock->shouldReceive('isOrderPaid')->andReturn(false);
        $mock->shouldReceive('isOrderFailed')->andReturn(true);
        $this->app->instance(CashfreeClient::class, $mock);

        $response = $this->postJson('/api/v1/job-seeker/payments/confirm-status', [
            'merchant_order_id' => 'SKR_FAIL_123',
        ]);

        $response->assertStatus(400);

        $this->assertDatabaseHas('seeker_package_purchases', [
            'id' => $purchase->id,
            'payment_status' => 'failed',
        ]);
    }

    public function test_webhook_fails_without_signature(): void
    {
        $response = $this->postJson('/api/v1/payments/webhook', [
            'type' => 'PAYMENT_SUCCESS_WEBHOOK',
        ]);

        $response->assertStatus(401);
    }

    public function test_webhook_processes_success_event_and_activates_package(): void
    {
        $user = User::factory()->create(['role' => 'job_seeker']);

        $pkg = SeekerPackage::create([
            'key' => 'basic_resume',
            'title' => 'Basic Resume',
            'description' => 'Test',
            'kind' => 'resume',
            'price_inr' => 99,
            'duration_days' => 30,
            'applications_included' => 0,
            'resume_builds_included' => 5,
            'is_active' => true,
        ]);

        $purchase = SeekerPackagePurchase::create([
            'user_id' => $user->id,
            'seeker_package_id' => $pkg->id,
            'package_key' => $pkg->key,
            'title' => $pkg->title,
            'kind' => $pkg->kind,
            'price_inr' => $pkg->price_inr,
            'duration_days' => $pkg->duration_days,
            'applications_granted' => 0,
            'resume_builds_granted' => 5,
            'payment_status' => 'pending',
            'merchant_order_id' => 'SKR_WEBHOOK_123',
            'phonepe_merchant_order_id' => 'SKR_WEBHOOK_123',
            'activated_at' => null,
            'expires_at' => null,
        ]);

        $rawBody = json_encode([
            'type' => 'PAYMENT_SUCCESS_WEBHOOK',
            'data' => [
                'order' => [
                    'order_id' => 'SKR_WEBHOOK_123',
                    'cf_order_id' => 'CF_webhook',
                ],
                'payment' => [
                    'cf_payment_id' => 'TXN_WEBHOOK_1',
                ],
            ],
        ], JSON_THROW_ON_ERROR);

        $timestamp = (string) (int) (microtime(true) * 1000);
        $signature = base64_encode(hash_hmac('sha256', $timestamp.$rawBody, 'test_secret_key', true));

        $response = $this->call(
            'POST',
            '/api/v1/payments/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_WEBHOOK_SIGNATURE' => $signature,
                'HTTP_X_WEBHOOK_TIMESTAMP' => $timestamp,
            ],
            $rawBody,
        );

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('seeker_package_purchases', [
            'id' => $purchase->id,
            'payment_status' => 'successful',
            'cashfree_payment_id' => 'TXN_WEBHOOK_1',
        ]);

        $this->assertDatabaseHas('job_seeker_profiles', [
            'user_id' => $user->id,
            'resume_builds_remaining' => 5,
            'resume_package_key' => 'basic_resume',
        ]);
    }
}
