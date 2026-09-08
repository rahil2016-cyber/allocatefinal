import 'package:flutter/material.dart';
import '../screens/common/ai_chat_screen.dart';
import '../utils/app_colors.dart';
import 'ai_bot_avatar.dart';

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
        elevation: 6,
        shadowColor: AppColors.primary.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(28),
        child: InkWell(
          onTap: () => _open(context),
          borderRadius: BorderRadius.circular(28),
          child: Container(
            padding: const EdgeInsets.fromLTRB(10, 8, 14, 8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF6366F1),
                  Color(0xFF0EA5E9),
                  Color(0xFF8B5CF6),
                ],
              ),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const AiBotAvatar(size: 32),
                const SizedBox(width: 8),
                const Text(
                  'Ask AI',
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
