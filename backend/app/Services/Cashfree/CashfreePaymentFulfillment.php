<?php

namespace App\Services\Cashfree;

use App\Mail\CompanySubscriptionSuccessMail;
use App\Mail\JobSeekerPaymentSuccessMail;
use App\Models\CompanySubscriptionPayment;
use App\Models\JobSeekerProfile;
use App\Models\SeekerPackagePurchase;
use App\Support\Identifier;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CashfreePaymentFulfillment
{
    public function __construct(
        protected CashfreeClient $cashfree,
    ) {}

    /**
     * @return array{status: string, purchase: SeekerPackagePurchase|null, profile: JobSeekerProfile|null, message: string}
     */
    public function confirmSeekerPurchase(string $merchantOrderId): array
    {
        $purchase = $this->findSeekerPurchase($merchantOrderId);

        if (! $purchase) {
            return [
                'status' => 'not_found',
                'purchase' => null,
                'profile' => null,
                'message' => 'Order not found.',
            ];
        }

        if ($purchase->payment_status === 'successful') {
            return [
                'status' => 'successful',
                'purchase' => $purchase,
                'profile' => $purchase->user?->jobSeekerProfile?->fresh(),
                'message' => 'Payment already verified and package active.',
            ];
        }

        $order = $this->cashfree->getOrder($merchantOrderId);
        $paymentId = $this->cashfree->extractPaymentId($order);
        $cfOrderId = isset($order['cf_order_id']) ? (string) $order['cf_order_id'] : $purchase->cashfree_order_id;

        if ($this->cashfree->isOrderPaid($order)) {
            $this->fulfillSeekerPurchase($purchase, $paymentId, $cfOrderId);

            return [
                'status' => 'successful',
                'purchase' => $purchase->fresh(),
                'profile' => $purchase->user?->jobSeekerProfile?->fresh(),
                'message' => 'Payment verified and package activated successfully.',
            ];
        }

        if ($this->cashfree->isOrderFailed($order)) {
            $purchase->update([
                'payment_status' => 'failed',
                'cashfree_order_id' => $cfOrderId,
                'cashfree_payment_id' => $paymentId,
                'phonepe_order_id' => $cfOrderId,
                'phonepe_transaction_id' => $paymentId,
            ]);

            return [
                'status' => 'failed',
                'purchase' => $purchase->fresh(),
                'profile' => null,
                'message' => 'Payment failed.',
            ];
        }

        return [
            'status' => 'pending',
            'purchase' => $purchase,
            'profile' => null,
            'message' => 'Payment is still pending.',
        ];
    }

    /**
     * @return array{status: string, payment: CompanySubscriptionPayment|null, message: string}
     */
    public function confirmCompanyPayment(string $merchantOrderId, ?int $companyId = null): array
    {
        $payment = $this->findCompanyPayment($merchantOrderId, $companyId);

        if (! $payment) {
            return [
                'status' => 'not_found',
                'payment' => null,
                'message' => 'Order not found.',
            ];
        }

        if ($payment->payment_status === 'successful') {
            return [
                'status' => 'successful',
                'payment' => $payment,
                'message' => 'Payment already verified.',
            ];
        }

        $order = $this->cashfree->getOrder($merchantOrderId);
        $paymentId = $this->cashfree->extractPaymentId($order);
        $cfOrderId = isset($order['cf_order_id']) ? (string) $order['cf_order_id'] : $payment->cashfree_order_id;

        if ($this->cashfree->isOrderPaid($order)) {
            $this->fulfillCompanyPayment($payment, $paymentId, $cfOrderId);

            return [
                'status' => 'successful',
                'payment' => $payment->fresh(),
                'message' => 'Payment verified successfully.',
            ];
        }

        if ($this->cashfree->isOrderFailed($order)) {
            $payment->update([
                'payment_status' => 'failed',
                'cashfree_order_id' => $cfOrderId,
                'cashfree_payment_id' => $paymentId,
                'phonepe_order_id' => $cfOrderId,
                'phonepe_transaction_id' => $paymentId,
            ]);

            return [
                'status' => 'failed',
                'payment' => $payment->fresh(),
                'message' => 'Payment failed.',
            ];
        }

        return [
            'status' => 'pending',
            'payment' => $payment,
            'message' => 'Payment is still pending.',
        ];
    }

    public function fulfillSeekerPurchase(
        SeekerPackagePurchase $purchase,
        ?string $paymentId,
        ?string $cfOrderId = null,
    ): void {
        if ($purchase->payment_status === 'successful') {
            return;
        }

        if ($purchase->kind === 'resume_pdf') {
            DB::transaction(function () use ($purchase, $paymentId, $cfOrderId): void {
                $locked = SeekerPackagePurchase::query()->lockForUpdate()->find($purchase->id);
                if (! $locked || $locked->payment_status === 'successful') {
                    return;
                }

                $profile = JobSeekerProfile::query()
                    ->where('user_id', $locked->user_id)
                    ->lockForUpdate()
                    ->first();

                if ($profile && (int) $profile->resume_builds_remaining > 0) {
                    $profile->decrement('resume_builds_remaining');
                }

                $now = now();
                $locked->update([
                    'payment_status' => 'successful',
                    'cashfree_order_id' => $cfOrderId ?? $locked->cashfree_order_id,
                    'cashfree_payment_id' => $paymentId,
                    'phonepe_order_id' => $cfOrderId ?? $locked->phonepe_order_id,
                    'phonepe_transaction_id' => $paymentId,
                    'activated_at' => $now,
                    'expires_at' => $now,
                ]);
            });

            $purchase->refresh();

            return;
        }

        $purchase->activate($paymentId ?? 'cashfree', $cfOrderId);
        $this->sendSeekerSuccessMail($purchase->fresh());
    }

    public function fulfillCompanyPayment(
        CompanySubscriptionPayment $payment,
        ?string $paymentId,
        ?string $cfOrderId = null,
    ): void {
        if ($payment->payment_status === 'successful') {
            return;
        }

        $payment->update([
            'payment_status' => 'successful',
            'cashfree_order_id' => $cfOrderId ?? $payment->cashfree_order_id,
            'cashfree_payment_id' => $paymentId,
            'phonepe_order_id' => $cfOrderId ?? $payment->phonepe_order_id,
            'phonepe_transaction_id' => $paymentId,
            'purchased_at' => now(),
        ]);

        try {
            $user = $payment->company?->user;
            if ($user && $user->email && ! Identifier::isSyntheticEmail($user->email)) {
                Mail::to($user->email)->send(new CompanySubscriptionSuccessMail($payment->fresh()));
            }
        } catch (\Throwable $e) {
            Log::warning('[Cashfree] Failed to send company subscription email: '.$e->getMessage());
        }
    }

    public function markSeekerFailed(string $merchantOrderId, ?string $paymentId = null): void
    {
        SeekerPackagePurchase::query()
            ->where(function ($q) use ($merchantOrderId): void {
                $q->where('merchant_order_id', $merchantOrderId)
                    ->orWhere('phonepe_merchant_order_id', $merchantOrderId);
            })
            ->where('payment_status', '!=', 'successful')
            ->update([
                'payment_status' => 'failed',
                'cashfree_payment_id' => $paymentId,
                'phonepe_transaction_id' => $paymentId,
            ]);
    }

    public function markCompanyFailed(string $merchantOrderId, ?string $paymentId = null): void
    {
        CompanySubscriptionPayment::query()
            ->where(function ($q) use ($merchantOrderId): void {
                $q->where('merchant_order_id', $merchantOrderId)
                    ->orWhere('phonepe_merchant_order_id', $merchantOrderId);
            })
            ->where('payment_status', '!=', 'successful')
            ->update([
                'payment_status' => 'failed',
                'cashfree_payment_id' => $paymentId,
                'phonepe_transaction_id' => $paymentId,
            ]);
    }

    public function findSeekerPurchase(string $merchantOrderId): ?SeekerPackagePurchase
    {
        return SeekerPackagePurchase::query()
            ->where(function ($q) use ($merchantOrderId): void {
                $q->where('merchant_order_id', $merchantOrderId)
                    ->orWhere('phonepe_merchant_order_id', $merchantOrderId);
            })
            ->first();
    }

    public function findCompanyPayment(string $merchantOrderId, ?int $companyId = null): ?CompanySubscriptionPayment
    {
        $query = CompanySubscriptionPayment::query()
            ->where(function ($q) use ($merchantOrderId): void {
                $q->where('merchant_order_id', $merchantOrderId)
                    ->orWhere('phonepe_merchant_order_id', $merchantOrderId);
            });

        if ($companyId !== null) {
            $query->where('company_id', $companyId);
        }

        return $query->first();
    }

    protected function sendSeekerSuccessMail(SeekerPackagePurchase $purchase): void
    {
        try {
            $user = $purchase->user;
            if ($user && $user->email && ! Identifier::isSyntheticEmail($user->email)) {
                Mail::to($user->email)->send(new JobSeekerPaymentSuccessMail($purchase));
            }
        } catch (\Throwable $e) {
            Log::warning('[Cashfree] Failed to send seeker payment email: '.$e->getMessage());
        }
    }
}
