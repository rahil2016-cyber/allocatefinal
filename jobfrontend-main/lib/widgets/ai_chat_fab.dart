import 'package:flutter/material.dart';
import '../screens/common/ai_chat_screen.dart';
import '../utils/app_colors.dart';

/// Floating entry point for the JobAllocate AI assistant.
class AiChatFab extends StatelessWidget {
  const AiChatFab({
    super.key,
    this.bottomOffset = 88,
    this.jobId,
  });

  /// Distance from bottom of screen (above bottom nav / other FABs).
  final double bottomOffset;

  /// Optional job context when opened from a job detail screen.
  final int? jobId;

  void _open(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => AiChatScreen(jobId: jobId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      right: 16,
      bottom: bottomOffset,
      child: Material(
        elevation: 4,
        shadowColor: AppColors.primary.withOpacity(0.35),
        borderRadius: BorderRadius.circular(28),
        child: InkWell(
          onTap: () => _open(context),
          borderRadius: BorderRadius.circular(28),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(28),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 20),
                SizedBox(width: 6),
                Text(
                  'AI',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
