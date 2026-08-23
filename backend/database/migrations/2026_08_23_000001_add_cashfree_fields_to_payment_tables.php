<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seeker_package_purchases', function (Blueprint $table) {
            if (! Schema::hasColumn('seeker_package_purchases', 'merchant_order_id')) {
                $table->string('merchant_order_id', 64)->nullable()->after('payment_status');
                $table->index('merchant_order_id');
            }
            if (! Schema::hasColumn('seeker_package_purchases', 'cashfree_order_id')) {
                $table->string('cashfree_order_id', 128)->nullable()->after('merchant_order_id');
            }
            if (! Schema::hasColumn('seeker_package_purchases', 'cashfree_payment_id')) {
                $table->string('cashfree_payment_id', 128)->nullable()->after('cashfree_order_id');
            }
            if (! Schema::hasColumn('seeker_package_purchases', 'cashfree_payment_session_id')) {
                $table->string('cashfree_payment_session_id', 255)->nullable()->after('cashfree_payment_id');
            }
        });

        Schema::table('company_subscription_payments', function (Blueprint $table) {
            if (! Schema::hasColumn('company_subscription_payments', 'merchant_order_id')) {
                $table->string('merchant_order_id', 64)->nullable()->after('payment_status');
                $table->index('merchant_order_id');
            }
            if (! Schema::hasColumn('company_subscription_payments', 'cashfree_order_id')) {
                $table->string('cashfree_order_id', 128)->nullable()->after('merchant_order_id');
            }
            if (! Schema::hasColumn('company_subscription_payments', 'cashfree_payment_id')) {
                $table->string('cashfree_payment_id', 128)->nullable()->after('cashfree_order_id');
            }
            if (! Schema::hasColumn('company_subscription_payments', 'cashfree_payment_session_id')) {
                $table->string('cashfree_payment_session_id', 255)->nullable()->after('cashfree_payment_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('seeker_package_purchases', function (Blueprint $table) {
            foreach (['merchant_order_id', 'cashfree_order_id', 'cashfree_payment_id', 'cashfree_payment_session_id'] as $col) {
                if (Schema::hasColumn('seeker_package_purchases', $col)) {
                    if ($col === 'merchant_order_id') {
                        $table->dropIndex(['merchant_order_id']);
                    }
                    $table->dropColumn($col);
                }
            }
        });

        Schema::table('company_subscription_payments', function (Blueprint $table) {
            foreach (['merchant_order_id', 'cashfree_order_id', 'cashfree_payment_id', 'cashfree_payment_session_id'] as $col) {
                if (Schema::hasColumn('company_subscription_payments', $col)) {
                    if ($col === 'merchant_order_id') {
                        $table->dropIndex(['merchant_order_id']);
                    }
                    $table->dropColumn($col);
                }
            }
        });
    }
};
