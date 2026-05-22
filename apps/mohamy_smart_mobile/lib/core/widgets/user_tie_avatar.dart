import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class UserTieAvatar extends StatelessWidget {
  const UserTieAvatar({
    this.size = 38.0,
    this.backgroundColor,
    this.iconColor = Colors.white,
    super.key,
  });

  final double size;
  final Color? backgroundColor;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = backgroundColor ?? AppColors.primary;
    final ringColor = isDark ? const Color(0xFF1D1D1D) : Colors.white;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: bg,
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: const Color(0xFF885200).withValues(alpha: isDark ? 0.05 : 0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color: ringColor,
          width: 2,
        ),
      ),
      child: ClipOval(
        child: CustomPaint(
          size: Size(size, size),
          painter: UserTiePainter(color: iconColor),
        ),
      ),
    );
  }
}

class UserTiePainter extends CustomPainter {
  const UserTiePainter({required this.color});
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final w = size.width;
    final h = size.height;

    // Draw Head: A circle centered horizontally, near the top
    final double headRadius = w * 0.22;
    final Offset headCenter = Offset(w / 2, h * 0.28);
    canvas.drawCircle(headCenter, headRadius, paint);

    // Draw Body with V-neck collar and a tie hanging down
    final path = Path();
    
    // Start at bottom left of shoulders
    path.moveTo(w * 0.15, h * 0.95);
    
    // Left shoulder line curving up to neck
    path.quadraticBezierTo(
      w * 0.25,
      h * 0.55,
      w * 0.38,
      h * 0.58,
    );
    
    // Left side of V-neck collar
    path.lineTo(w * 0.44, h * 0.68);
    
    // Tie knot top-left
    path.lineTo(w * 0.47, h * 0.65);
    // Tie knot bottom-left
    path.lineTo(w * 0.46, h * 0.72);
    // Tie tip
    path.lineTo(w * 0.5, h * 0.92);
    // Tie knot bottom-right
    path.lineTo(w * 0.54, h * 0.72);
    // Tie knot top-right
    path.lineTo(w * 0.53, h * 0.65);
    
    // Right side of V-neck collar
    path.lineTo(w * 0.62, h * 0.58);
    
    // Right shoulder line curving down
    path.quadraticBezierTo(
      w * 0.75,
      h * 0.55,
      w * 0.85,
      h * 0.95,
    );
    
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant UserTiePainter oldDelegate) => oldDelegate.color != color;
}
