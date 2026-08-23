<?php

namespace App\Http\Controllers\Api\V1\JobSeeker;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Models\SeekerPackage;
use App\Models\SeekerPackagePurchase;
use App\Services\Cashfree\CashfreeClient;
use App\Services\Cashfree\CashfreePaymentFulfillment;
use App\Support\Identifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class JobSeekerPaymentController extends Controller
{
    use ApiResponses;

    public function __construct(
        protected CashfreeClient $cashfree,
        protected CashfreePaymentFulfillment $fulfillment,
    ) {}

    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_key' => ['required', 'string', 'max:64'],
        ]);

        $user = $request->user();
        $pkg = SeekerPackage::query()
            ->where('key', $validated['package_key'])
            ->where('is_active', true)
            ->first();

        if (! $pkg) {
            return $this->fail('Package not found or inactive.', null, 404);
        }

        if ($pkg->kind !== 'resume') {
            return $this->fail('Only resume plans are supported.', null, 422);
        }

        try {
            $amountInr = (float) $pkg->price_inr;
            $merchantOrderId = $this->makeMerchantOrderId('SKR');

            $order = $this->cashfree->createOrder(
                $merchantOrderId,
                $amountInr,
                [
                    'customer_id' => (string) $user->id,
                    'customer_phone' => $user->phone ?? $user->mobile ?? null,
                    'customer_email' => Identifier::isSyntheticEmail((string) ($user->email ?? ''))
                        ? null
                        : ($user->email ?? null),
                    'customer_name' => $user->name ?? null,
                ],
                $pkg->title,
                [
                    'kind' => 'seeker_package',
                    'package_key' => (string) $pkg->key,
                ],
            );

            SeekerPackagePurchase::query()->create([
                'user_id' => $user->id,
                'seeker_package_id' => $pkg->id,
                'package_key' => $pkg->key,
                'title' => $pkg->title,
                'kind' => $pkg->kind,
                'price_inr' => $pkg->price_inr,
                'duration_days' => $pkg->duration_days,
                'applications_granted' => (int) $pkg->applications_included,
                'resume_builds_granted' => (int) $pkg->resume_builds_included,
                'payment_status' => 'pending',
                'merchant_order_id' => $merchantOrderId,
                'cashfree_order_id' => $order['cf_order_id'] ?? $order['order_id'],
                'cashfree_payment_session_id' => $order['payment_session_id'],
                // Dual-write for older history/lookup code paths.
                'phonepe_merchant_order_id' => $merchantOrderId,
                'phonepe_order_id' => $order['cf_order_id'] ?? $order['order_id'],
                'activated_at' => null,
                'expires_at' => null,
            ]);

            return $this->ok([
                'merchant_order_id' => $merchantOrderId,
                'order_id' => $order['order_id'],
                'payment_session_id' => $order['payment_session_id'],
                'environment' => $this->cashfree->sdkEnvironment(),
                'amount' => (int) round($amountInr * 100),
                'amount_inr' => $amountInr,
                'currency' => 'INR',
                'package_key' => $pkg->key,
                'package_title' => $pkg->title,
            ], 'Cashfree order created successfully.');
        } catch (\Throwable $e) {
            Log::error('Cashfree seeker order creation failed: '.$e->getMessage(), ['exception' => $e]);

            return $this->fail('Cashfree order creation failed: '.$e->getMessage(), null, 500);
        }
    }

    public function confirmStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'merchant_order_id' => ['required', 'string', 'max:64'],
        ]);

        $user = $request->user();
        $purchase = $this->fulfillment->findSeekerPurchase($validated['merchant_order_id']);

        if (! $purchase || (int) $purchase->user_id !== (int) $user->id) {
            return $this->fail('Order not found.', null, 404);
        }

        try {
            $result = $this->fulfillment->confirmSeekerPurchase($validated['merchant_order_id']);
        } catch (\Throwable $e) {
            return $this->fail('Verification error: '.$e->getMessage(), null, 500);
        }

        if ($result['status'] === 'not_found') {
            return $this->fail($result['message'], null, 404);
        }

        if ($result['status'] === 'failed') {
            return $this->fail($result['message'], [
                'payment_status' => 'failed',
                'merchant_order_id' => $validated['merchant_order_id'],
            ], 400);
        }

        if ($result['status'] === 'pending') {
            return $this->ok([
                'payment_status' => 'pending',
                'merchant_order_id' => $validated['merchant_order_id'],
            ], $result['message']);
        }

        $payload = [
            'payment_status' => 'successful',
            'merchant_order_id' => $validated['merchant_order_id'],
            'purchase_id' => $result['purchase']?->id,
            'profile' => $result['profile'],
        ];

        if ($result['purchase']?->kind === 'resume_pdf') {
            $payload['price_inr'] = $result['purchase']->price_inr;
            $payload['resume_template_id'] = $result['purchase']->resume_template_id;
            $payload['resume_template_title'] = $result['purchase']->resume_template_title;
        }

        return $this->ok($payload, $result['message']);
    }

    protected function makeMerchantOrderId(string $prefix): string
    {
        return substr($prefix.'_'.Str::upper(Str::random(8)).'_'.time(), 0, 63);
    }
}
