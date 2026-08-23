<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeekerPackagePurchase extends Model
{
    protected $fillable = [
        'user_id',
        'seeker_package_id',
        'package_key',
        'title',
        'kind',
        'price_inr',
        'duration_days',
        'applications_granted',
        'resume_builds_granted',
        'resume_template_id',
        'resume_template_title',
        'activated_at',
        'expires_at',
        'payment_status',
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'merchant_order_id',
        'cashfree_order_id',
        'cashfree_payment_id',
        'cashfree_payment_session_id',
        'phonepe_merchant_order_id',
        'phonepe_order_id',
        'phonepe_transaction_id',
    ];

    protected function casts(): array
    {
        return [
            'activated_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /** Our checkout order id (Cashfree order_id); falls back to legacy PhonePe column. */
    public function resolvedMerchantOrderId(): ?string
    {
        $id = $this->merchant_order_id ?: $this->phonepe_merchant_order_id;

        return $id !== null && $id !== '' ? (string) $id : null;
    }

    public function resolvedPaymentId(): ?string
    {
        $id = $this->cashfree_payment_id ?: $this->phonepe_transaction_id;

        return $id !== null && $id !== '' ? (string) $id : null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function seekerPackage(): BelongsTo
    {
        return $this->belongsTo(SeekerPackage::class);
    }

    /**
     * Activate the package purchase and credit the seeker profile.
     *
     * @param  string|null  $transactionId  Cashfree payment id (or legacy gateway id)
     * @param  string|null  $gatewayOrderId Cashfree cf_order_id (or legacy gateway order id)
     */
    public function activate(?string $transactionId = null, ?string $gatewayOrderId = null): bool
    {
        if ($this->payment_status === 'successful') {
            return true;
        }

        $activatedAt = now();
        $expiresAt = $activatedAt->copy()->addDays(max(0, (int) $this->duration_days));

        $this->update([
            'payment_status' => 'successful',
            'cashfree_payment_id' => $transactionId ?? $this->cashfree_payment_id,
            'cashfree_order_id' => $gatewayOrderId ?? $this->cashfree_order_id,
            'phonepe_transaction_id' => $transactionId ?? $this->phonepe_transaction_id,
            'phonepe_order_id' => $gatewayOrderId ?? $this->phonepe_order_id,
            'activated_at' => $activatedAt,
            'expires_at' => $expiresAt,
        ]);

        $profile = $this->user->jobSeekerProfile;
        if (!$profile) {
            $profile = JobSeekerProfile::create([
                'user_id' => $this->user_id,
            ]);
        }

        $profile->package_key = $this->package_key;
        $profile->package_activated_at = $activatedAt;
        $profile->package_expires_at = $expiresAt;

        switch ($this->kind) {
            case 'resume':
                $profile->resume_builds_remaining = (int) $this->resume_builds_granted;
                $profile->resume_credits_expires_at = $expiresAt;
                $profile->resume_package_key = $this->package_key;
                // Force a fresh template pick for the new plan limits (4 / 8 / 13).
                $profile->selected_template_ids = [];
                break;
            case 'combo':
                $profile->applications_remaining = (int) $this->applications_granted;
                $profile->resume_builds_remaining = (int) $this->resume_builds_granted;
                $profile->job_credits_expires_at = $expiresAt;
                $profile->resume_credits_expires_at = $expiresAt;
                $profile->job_package_key = $this->package_key;
                $profile->resume_package_key = $this->package_key;
                $profile->selected_template_ids = [];
                break;
            case 'job_applications':
            default:
                $profile->applications_remaining = (int) $this->applications_granted;
                $profile->job_credits_expires_at = $expiresAt;
                $profile->job_package_key = $this->package_key;
                break;
        }

        $profile->save();

        return true;
    }
}
