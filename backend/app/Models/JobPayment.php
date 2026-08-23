<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobPayment extends Model
{
    protected $fillable = [
        'company_id',
        'amount_inr',
        'status',
        'cashfree_order_id',
        'cashfree_payment_id',
        'cashfree_payment_session_id',
    ];
}
