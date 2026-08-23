<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Cashfree\CashfreeClient;
use App\Services\Cashfree\CashfreePaymentFulfillment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CashfreeWebhookController extends Controller
{
    public function __construct(
        protected CashfreeClient $cashfree,
        protected CashfreePaymentFulfillment $fulfillment,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();
        $signature = $request->header('x-webhook-signature');
        $timestamp = $request->header('x-webhook-timestamp');

        try {
            if (! $this->cashfree->verifyWebhookSignature($signature, $rawBody, $timestamp)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized webhook.',
                ], 401);
            }
        } catch (\Throwable $e) {
            Log::warning('[CashfreeWebhook] Signature check error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized webhook.',
            ], 401);
        }

        $type = (string) ($request->input('type') ?? $request->input('event') ?? '');
        $data = $request->input('data');
        if (! is_array($data)) {
            $data = [];
        }

        $order = is_array($data['order'] ?? null) ? $data['order'] : [];
        $payment = is_array($data['payment'] ?? null) ? $data['payment'] : [];

        $merchantOrderId = (string) (
            $order['order_id']
            ?? $payment['order_id']
            ?? $data['order_id']
            ?? $request->input('orderId')
            ?? ''
        );
        if ($merchantOrderId === '') {
            return response()->json([
                'success' => true,
                'message' => 'Webhook ignored (no order_id).',
            ], 200);
        }

        $paymentId = null;
        foreach (['cf_payment_id', 'payment_id'] as $key) {
            if (! empty($payment[$key])) {
                $paymentId = (string) $payment[$key];
                break;
            }
        }

        $cfOrderId = isset($order['cf_order_id']) ? (string) $order['cf_order_id'] : null;

        $successTypes = [
            'PAYMENT_SUCCESS_WEBHOOK',
            'PAYMENT_SUCCESS',
            'ORDER_PAID',
        ];
        $failedTypes = [
            'PAYMENT_FAILED_WEBHOOK',
            'PAYMENT_FAILED',
            'PAYMENT_USER_DROPPED_WEBHOOK',
        ];

        try {
            if (in_array($type, $successTypes, true) || str_contains(strtoupper($type), 'SUCCESS')) {
                $seeker = $this->fulfillment->findSeekerPurchase($merchantOrderId);
                if ($seeker) {
                    $this->fulfillment->fulfillSeekerPurchase($seeker, $paymentId, $cfOrderId);

                    return response()->json([
                        'success' => true,
                        'message' => 'Webhook processed and purchase activated.',
                    ], 200);
                }

                $companyPayment = $this->fulfillment->findCompanyPayment($merchantOrderId);
                if ($companyPayment) {
                    $this->fulfillment->fulfillCompanyPayment($companyPayment, $paymentId, $cfOrderId);

                    return response()->json([
                        'success' => true,
                        'message' => 'Webhook processed and company subscription activated.',
                    ], 200);
                }
            }

            if (in_array($type, $failedTypes, true) || str_contains(strtoupper($type), 'FAILED')) {
                $this->fulfillment->markSeekerFailed($merchantOrderId, $paymentId);
                $this->fulfillment->markCompanyFailed($merchantOrderId, $paymentId);

                return response()->json([
                    'success' => true,
                    'message' => 'Webhook processed (payment failed).',
                ], 200);
            }

            return response()->json([
                'success' => true,
                'message' => 'Webhook event ignored.',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('[CashfreeWebhook] '.$e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Webhook processing error: '.$e->getMessage(),
            ], 500);
        }
    }
}
