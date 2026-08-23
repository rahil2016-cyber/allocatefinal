<?php

namespace App\Http\Controllers\Api\V1\JobSeeker;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Models\SeekerPackage;
use App\Models\SeekerPackagePurchase;
use App\Services\Cashfree\CashfreeClient;
use App\Support\Identifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Paid resume PDF export via Cashfree (sandbox/production).
 */
class ResumePdfPurchaseController extends Controller
{
    use ApiResponses;

    public const PACKAGE_KEY = 'resume_pdf_export_20';

    public function __construct(
        protected CashfreeClient $cashfree,
    ) {}

    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'resume_template_id' => ['required', 'integer', 'min:1'],
            'resume_template_title' => ['required', 'string', 'max:200'],
            'resume_template_key' => ['nullable', 'string', 'max:64'],
        ]);

        $package = SeekerPackage::query()->where('key', self::PACKAGE_KEY)->first();
        if (! $package) {
            return $this->fail('Resume PDF package is not configured.', null, 404);
        }

        $user = $request->user();
        $profile = $user->jobSeekerProfile;

        if (! $profile || ! $profile->canBuildResume()) {
            return $this->fail('Resume download is restricted to users with an active subscription.', null, 403);
        }

        $templateKey = $validated['resume_template_key'] ?? null;
        if (is_string($templateKey) && $templateKey !== '' && ! $profile->isTemplateUnlocked($templateKey)) {
            return $this->fail(
                'This resume template is not unlocked on your plan.',
                null,
                403
            );
        }

        try {
            $price = (float) $package->price_inr;
            $amountInr = max(1.0, $price);
            $merchantOrderId = substr('PDF_'.Str::upper(Str::random(8)).'_'.time(), 0, 63);

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
                'Resume PDF — '.$validated['resume_template_title'],
                [
                    'kind' => 'resume_pdf',
                    'template_id' => (string) $validated['resume_template_id'],
                ],
            );

            SeekerPackagePurchase::query()->create([
                'user_id' => $user->id,
                'seeker_package_id' => $package->id,
                'package_key' => self::PACKAGE_KEY,
                'title' => 'Resume PDF — '.$validated['resume_template_title'],
                'kind' => 'resume_pdf',
                'price_inr' => (int) $package->price_inr,
                'duration_days' => 0,
                'applications_granted' => 0,
                'resume_builds_granted' => 0,
                'payment_status' => 'pending',
                'merchant_order_id' => $merchantOrderId,
                'cashfree_order_id' => $order['cf_order_id'] ?? $order['order_id'],
                'cashfree_payment_session_id' => $order['payment_session_id'],
                'phonepe_merchant_order_id' => $merchantOrderId,
                'phonepe_order_id' => $order['cf_order_id'] ?? $order['order_id'],
                'resume_template_id' => $validated['resume_template_id'],
                'resume_template_title' => $validated['resume_template_title'],
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
                'price_inr' => (int) $package->price_inr,
                'resume_template_id' => $validated['resume_template_id'],
                'resume_template_title' => $validated['resume_template_title'],
            ], 'Cashfree PDF order created successfully.');
        } catch (\Throwable $e) {
            Log::error('Cashfree resume PDF order creation failed: '.$e->getMessage(), ['exception' => $e]);

            return $this->fail('Cashfree order creation failed: '.$e->getMessage(), null, 500);
        }
    }

    /**
     * Legacy alias — kept for older clients; prefers create-order + confirm-status.
     */
    public function purchase(Request $request): JsonResponse
    {
        return $this->createOrder($request);
    }
}
