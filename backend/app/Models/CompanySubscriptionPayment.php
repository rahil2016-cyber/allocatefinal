<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanySubscriptionPayment extends Model
{
    /**
     * This table may be deployed without Laravel timestamps on some hosts.
     * Disable auto timestamps to avoid INSERT errors for `updated_at`.
     */
    public $timestamps = false;

    protected $fillable = [
        'company_id',
        'company_subscription_package_id',
        'cycle_number',
        'coupon_code_used',
        'amount_inr',
        'is_free',
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
        'purchased_at',
    ];

    protected function casts(): array
    {
        return [
            'purchased_at' => 'datetime',
        ];
    }

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

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(CompanySubscriptionPackage::class, 'company_subscription_package_id');
    }
}

