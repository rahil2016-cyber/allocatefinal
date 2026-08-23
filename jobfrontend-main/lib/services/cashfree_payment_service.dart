import 'dart:async';

import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfwebcheckoutpayment.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfsession/cfsession.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpaymentgateway/cfpaymentgatewayservice.dart';
import 'package:flutter_cashfree_pg_sdk/utils/cfenums.dart';
import 'package:flutter_cashfree_pg_sdk/utils/cfexceptions.dart';

/// Runs Cashfree Web Checkout (Flutter SDK) then confirms with our backend.
///
/// Secrets stay on the server; [orderData] must come from create-order APIs and include
/// `merchant_order_id`, `order_id`, `payment_session_id`, `environment`.
class CashfreePaymentService {
  CashfreePaymentService._();
  static final CashfreePaymentService instance = CashfreePaymentService._();

  final CFPaymentGatewayService _gateway = CFPaymentGatewayService();

  Future<Map<String, dynamic>> checkoutAndConfirm({
    required Map<String, dynamic> orderData,
    required Future<Map<String, dynamic>> Function(String merchantOrderId)
        confirmStatus,
  }) async {
    final merchantOrderId =
        orderData['merchant_order_id']?.toString().trim() ?? '';
    final orderId = orderData['order_id']?.toString().trim().isNotEmpty == true
        ? orderData['order_id'].toString().trim()
        : merchantOrderId;
    final paymentSessionId =
        orderData['payment_session_id']?.toString().trim() ?? '';
    final envRaw = (orderData['environment']?.toString().trim().isNotEmpty ?? false)
        ? orderData['environment'].toString().trim().toLowerCase()
        : 'sandbox';

    if (merchantOrderId.isEmpty || paymentSessionId.isEmpty || orderId.isEmpty) {
      throw Exception('Invalid Cashfree order response from server.');
    }

    final environment = envRaw == 'production'
        ? CFEnvironment.PRODUCTION
        : CFEnvironment.SANDBOX;

    final completer = Completer<void>();
    String? sdkError;

    _gateway.setCallback(
      (String verifiedOrderId) {
        if (!completer.isCompleted) completer.complete();
      },
      (errorResponse, String failedOrderId) {
        sdkError = errorResponse.getMessage() ??
            errorResponse.getCode() ??
            'Payment failed';
        if (!completer.isCompleted) completer.complete();
      },
    );

    try {
      final session = CFSessionBuilder()
          .setEnvironment(environment)
          .setOrderId(orderId)
          .setPaymentSessionId(paymentSessionId)
          .build();

      final checkout =
          CFWebCheckoutPaymentBuilder().setSession(session).build();
      _gateway.doPayment(checkout);
    } on CFException catch (e) {
      throw Exception(e.message.isNotEmpty ? e.message : 'Cashfree checkout failed to start.');
    }

    await completer.future.timeout(
      const Duration(minutes: 15),
      onTimeout: () {
        throw Exception('Payment timed out. Please try again.');
      },
    );

    // Always ask backend (Get Order API) — SDK success is not final authority.
    final confirmed = await confirmStatus(merchantOrderId);
    final paymentStatus = confirmed['payment_status']?.toString() ?? '';

    if (paymentStatus == 'successful') {
      return confirmed;
    }

    if (paymentStatus == 'pending') {
      throw Exception(
        'Payment is still pending. Please wait a moment and check purchase history.',
      );
    }

    if (sdkError != null && sdkError!.isNotEmpty) {
      throw Exception('Payment not completed ($sdkError).');
    }

    throw Exception(
      confirmed['message']?.toString() ??
          'Payment was cancelled or incomplete.',
    );
  }
}
