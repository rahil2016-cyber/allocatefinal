import 'package:flutter/material.dart';
import '../services/app_session.dart';
import '../services/biometric_auth_service.dart';
import '../utils/app_colors.dart';

/// Shows the first-time setup prompt after successful normal login if device supports biometric auth.
Future<void> checkAndShowBiometricSetupPrompt(BuildContext context) async {
  try {
    final bio = BiometricAuthService.instance;
    final supported = await bio.isBiometricSupported();
    if (!supported) return;

    final enabled = await bio.isBiometricEnabled();
    if (enabled) return;

    final prompted = await bio.hasBeenPrompted();
    if (prompted) return;

    if (!context.mounted) return;

    final token = AppSession.token;
    final userPayload = AppSession.user;
    if (token == null || token.isEmpty || userPayload == null) return;

    await showModalBottomSheet<void>(
      context: context,
      isDismissible: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.fingerprint_rounded,
                  size: 40,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Login faster next time',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Use Fingerprint, Face ID, or your device security to quickly access JobAllocate.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 28),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () async {
                        await bio.setPrompted(true);
                        if (ctx.mounted) Navigator.pop(ctx);
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        side: const BorderSide(color: AppColors.textHint),
                      ),
                      child: const Text(
                        'Not now',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: () async {
                        Navigator.pop(ctx);
                        final success = await bio.enableBiometric(
                          bearerToken: token,
                          userPayload: userPayload,
                        );
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                success
                                    ? '🔐 Biometric login enabled successfully!'
                                    : 'Biometric setup cancelled or failed.',
                              ),
                              backgroundColor:
                                  success ? AppColors.success : AppColors.textSecondary,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        }
                      },
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Enable',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  } catch (e) {
    debugPrint('Biometric prompt check error: $e');
  }
}
