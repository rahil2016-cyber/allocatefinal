import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Colorful robot mascot for the JobAllocate AI assistant.
class AiBotAvatar extends StatelessWidget {
  const AiBotAvatar({
    super.key,
    this.size = 40,
    this.withGradientBackground = true,
  });

  final double size;
  final bool withGradientBackground;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _ColorfulBotPainter(
          withGradientBackground: withGradientBackground,
        ),
      ),
    );
  }
}

class _ColorfulBotPainter extends CustomPainter {
  _ColorfulBotPainter({required this.withGradientBackground});

  final bool withGradientBackground;

  static const _violet = Color(0xFF7C3AED);
  static const _cyan = Color(0xFF06B6D4);
  static const _pink = Color(0xFFEC4899);
  static const _amber = Color(0xFFF59E0B);
  static const _emerald = Color(0xFF10B981);
  static const _indigo = Color(0xFF4F46E5);
  static const _sky = Color(0xFF38BDF8);

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final center = Offset(w / 2, h / 2);
    final radius = w / 2;

    if (withGradientBackground) {
      final bgRect = Rect.fromCircle(center: center, radius: radius);
      canvas.drawCircle(
        center,
        radius,
        Paint()
          ..shader = const SweepGradient(
            colors: [_violet, _cyan, _pink, _amber, _violet],
            transform: GradientRotation(-math.pi / 2),
          ).createShader(bgRect),
      );

      canvas.drawCircle(
        center,
        radius * 0.88,
        Paint()
          ..shader = const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF6366F1), Color(0xFF0EA5E9), Color(0xFF8B5CF6)],
          ).createShader(bgRect),
      );

      canvas.drawCircle(
        center,
        radius * 0.96,
        Paint()
          ..color = Colors.white.withValues(alpha: 0.35)
          ..style = PaintingStyle.stroke
          ..strokeWidth = w * 0.035,
      );
    }

    // Side ear lights
    final earR = w * 0.09;
    canvas.drawCircle(
      Offset(center.dx - w * 0.36, center.dy + h * 0.02),
      earR,
      Paint()..color = _amber,
    );
    canvas.drawCircle(
      Offset(center.dx + w * 0.36, center.dy + h * 0.02),
      earR,
      Paint()..color = _pink,
    );

    // Head
    final headW = w * 0.58;
    final headH = h * 0.5;
    final headCenter = Offset(center.dx, center.dy + h * 0.05);
    final headRect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: headCenter, width: headW, height: headH),
      Radius.circular(w * 0.15),
    );

    canvas.drawRRect(
      headRect,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFFFFFFF), Color(0xFFE0F2FE)],
        ).createShader(headRect.outerRect),
    );

    canvas.drawRRect(
      headRect,
      Paint()
        ..color = _sky.withValues(alpha: 0.45)
        ..style = PaintingStyle.stroke
        ..strokeWidth = w * 0.028,
    );

    // Antenna
    final stem = Paint()
      ..color = _violet
      ..strokeWidth = w * 0.045
      ..strokeCap = StrokeCap.round;
    final stemTop = Offset(center.dx, headRect.top - h * 0.02);
    final stemBase = Offset(center.dx, headRect.top - h * 0.16);
    canvas.drawLine(stemBase, stemTop, stem);
    canvas.drawCircle(stemBase, w * 0.065, Paint()..color = _amber);
    canvas.drawCircle(
      stemBase,
      w * 0.035,
      Paint()..color = Colors.white.withValues(alpha: 0.7),
    );

    // Eyes — different colors for a playful look
    final eyeY = headCenter.dy - headH * 0.06;
    final eyeOffset = headW * 0.21;
    final eyeR = w * 0.062;

    _drawEye(canvas, Offset(center.dx - eyeOffset, eyeY), eyeR, _cyan, _indigo);
    _drawEye(canvas, Offset(center.dx + eyeOffset, eyeY), eyeR, _pink, _violet);

    // Smile
    final smilePaint = Paint()
      ..color = _emerald
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.038
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCenter(
        center: Offset(center.dx, headCenter.dy + headH * 0.18),
        width: headW * 0.36,
        height: h * 0.11,
      ),
      0.2,
      2.7,
      false,
      smilePaint,
    );

    // Cheeks
    final cheekR = w * 0.045;
    canvas.drawCircle(
      Offset(center.dx - headW * 0.32, headCenter.dy + headH * 0.1),
      cheekR,
      Paint()..color = _pink.withValues(alpha: 0.55),
    );
    canvas.drawCircle(
      Offset(center.dx + headW * 0.32, headCenter.dy + headH * 0.1),
      cheekR,
      Paint()..color = _pink.withValues(alpha: 0.55),
    );

    // Forehead panel
    final panelRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(center.dx, headRect.top + headH * 0.22),
        width: headW * 0.42,
        height: headH * 0.14,
      ),
      Radius.circular(w * 0.04),
    );
    canvas.drawRRect(
      panelRect,
      Paint()
        ..shader = const LinearGradient(
          colors: [_sky, _violet],
        ).createShader(panelRect.outerRect),
    );
  }

  void _drawEye(
    Canvas canvas,
    Offset center,
    double radius,
    Color outer,
    Color inner,
  ) {
    canvas.drawCircle(center, radius, Paint()..color = outer);
    canvas.drawCircle(
      center,
      radius * 0.55,
      Paint()..color = inner,
    );
    canvas.drawCircle(
      Offset(center.dx + radius * 0.22, center.dy - radius * 0.22),
      radius * 0.28,
      Paint()..color = Colors.white,
    );
  }

  @override
  bool shouldRepaint(covariant _ColorfulBotPainter oldDelegate) {
    return oldDelegate.withGradientBackground != withGradientBackground;
  }
}
