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
        borderRadius: BorderRadius.circular(30),
        child: InkWell(
          onTap: () => _open(context),
          borderRadius: BorderRadius.circular(30),
          child: Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(30),
            ),
            child: const Icon(
              Icons.chat_bubble_rounded,
              color: Colors.white,
              size: 26,
            ),
          ),
        ),
      ),
    );
  }
}
