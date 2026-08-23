<?php

namespace App\Services\Cashfree;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class CashfreeClient
{
    public function environment(): string
    {
        $env = strtolower((string) config('services.cashfree.env', 'sandbox'));

        return $env === 'production' ? 'production' : 'sandbox';
    }

    /** Value returned to Flutter CFSession (sandbox | production). */
    public function sdkEnvironment(): string
    {
        return $this->environment();
    }

    public function baseUrl(): string
    {
        if ($this->environment() === 'production') {
            return rtrim((string) config('services.cashfree.production_base_url'), '/');
        }

        return rtrim((string) config('services.cashfree.sandbox_base_url'), '/');
    }

    public function appId(): string
    {
        $appId = (string) config('services.cashfree.app_id', '');
        if ($appId === '') {
            throw new RuntimeException('Cashfree App ID is not configured (CASHFREE_APP_ID).');
        }

        return $appId;
    }

    public function secretKey(): string
    {
        $secret = (string) config('services.cashfree.secret_key', '');
        if ($secret === '') {
            throw new RuntimeException('Cashfree Secret Key is not configured (CASHFREE_SECRET_KEY).');
        }

        return $secret;
    }

    public function apiVersion(): string
    {
        return (string) config('services.cashfree.api_version', '2023-08-01');
    }

    /**
     * Create a Cashfree order. Amount is in INR rupees (not paise).
     *
     * @param  array{customer_id: string, customer_phone?: string|null, customer_email?: string|null, customer_name?: string|null}  $customer
     * @param  array<string, string>  $orderTags
     * @return array{order_id: string, payment_session_id: string, order_status: string, cf_order_id?: string|null}
     */
    public function createOrder(
        string $orderId,
        float $amountInr,
        array $customer,
        ?string $orderNote = null,
        array $orderTags = [],
    ): array {
        if ($amountInr < 1) {
            throw new RuntimeException('Cashfree order amount must be at least ₹1.');
        }

        $phone = preg_replace('/\D+/', '', (string) ($customer['customer_phone'] ?? '')) ?: '9999999999';
        if (strlen($phone) > 10) {
            $phone = substr($phone, -10);
        }
        if (strlen($phone) < 10) {
            $phone = str_pad($phone, 10, '9', STR_PAD_LEFT);
        }

        $payload = [
            'order_id' => $orderId,
            'order_amount' => round($amountInr, 2),
            'order_currency' => 'INR',
            'customer_details' => [
                'customer_id' => (string) $customer['customer_id'],
                'customer_phone' => $phone,
            ],
        ];

        if (! empty($customer['customer_email'])) {
            $payload['customer_details']['customer_email'] = (string) $customer['customer_email'];
        }
        if (! empty($customer['customer_name'])) {
            $payload['customer_details']['customer_name'] = (string) $customer['customer_name'];
        }
        if ($orderNote !== null && $orderNote !== '') {
            $payload['order_note'] = substr($orderNote, 0, 200);
        }
        if ($orderTags !== []) {
            $payload['order_tags'] = $orderTags;
        }

        $response = Http::withHeaders($this->authHeaders())
            ->post($this->baseUrl().'/orders', $payload);

        if (! $response->successful()) {
            Log::error('[Cashfree] createOrder failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'order_id' => $orderId,
            ]);
            throw new RuntimeException('Cashfree create order failed: '.$response->body());
        }

        $data = $response->json();
        if (! is_array($data) || empty($data['order_id']) || empty($data['payment_session_id'])) {
            throw new RuntimeException('Cashfree create order returned an invalid response.');
        }

        return [
            'order_id' => (string) $data['order_id'],
            'payment_session_id' => (string) $data['payment_session_id'],
            'order_status' => (string) ($data['order_status'] ?? 'ACTIVE'),
            'cf_order_id' => isset($data['cf_order_id']) ? (string) $data['cf_order_id'] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function getOrder(string $orderId): array
    {
        $response = Http::withHeaders($this->authHeaders())
            ->get($this->baseUrl().'/orders/'.rawurlencode($orderId));

        if (! $response->successful()) {
            Log::error('[Cashfree] getOrder failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'order_id' => $orderId,
            ]);
            throw new RuntimeException('Cashfree get order failed: '.$response->body());
        }

        $data = $response->json();
        if (! is_array($data)) {
            throw new RuntimeException('Cashfree get order returned an invalid response.');
        }

        return $data;
    }

    public function extractPaymentId(array $order): ?string
    {
        foreach (['cf_payment_id', 'payment_id'] as $key) {
            if (! empty($order[$key]) && is_scalar($order[$key])) {
                return (string) $order[$key];
            }
        }

        $payments = $order['payments'] ?? null;
        if (is_array($payments) && isset($payments[0]) && is_array($payments[0])) {
            foreach (['cf_payment_id', 'payment_id'] as $key) {
                if (! empty($payments[0][$key])) {
                    return (string) $payments[0][$key];
                }
            }
        }

        return null;
    }

    public function isOrderPaid(array $order): bool
    {
        $status = strtoupper((string) ($order['order_status'] ?? ''));

        return in_array($status, ['PAID', 'COMPLETED'], true);
    }

    public function isOrderFailed(array $order): bool
    {
        $status = strtoupper((string) ($order['order_status'] ?? ''));

        return in_array($status, ['EXPIRED', 'TERMINATED', 'CANCELLED'], true);
    }

    /**
     * Verify Cashfree webhook HMAC (timestamp + raw body, Base64).
     */
    public function verifyWebhookSignature(?string $signature, string $rawBody, ?string $timestamp): bool
    {
        if ($signature === null || $signature === '' || $timestamp === null || $timestamp === '') {
            return false;
        }

        $signedPayload = $timestamp.$rawBody;
        $expected = base64_encode(hash_hmac('sha256', $signedPayload, $this->secretKey(), true));

        return hash_equals($expected, $signature);
    }

    /**
     * @return array<string, string>
     */
    protected function authHeaders(): array
    {
        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'x-api-version' => $this->apiVersion(),
            'x-client-id' => $this->appId(),
            'x-client-secret' => $this->secretKey(),
        ];
    }
}
