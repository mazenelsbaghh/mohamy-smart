import 'package:flutter/material.dart';

import '../models/legal_models.dart';
import '../theme/app_theme.dart';

class MohamyStateView extends StatelessWidget {
  const MohamyStateView({
    required this.state,
    super.key,
    this.icon,
    this.title,
    this.message,
    this.actionLabel,
    this.onAction,
    this.compact = false,
  });

  final ScreenStateInfo state;
  final IconData? icon;
  final String? title;
  final String? message;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    if (state.status == ScreenLoadStatus.loading) {
      return _StateSkeleton(compact: compact);
    }

    final tokens = Theme.of(context).extension<MohamyThemeTokens>()!;
    final visual = _visualFor(state.status);
    final effectiveTitle = title ?? state.status.label;
    final effectiveMessage = message ?? state.message ?? visual.message;
    final effectiveAction = actionLabel ?? state.retryLabel;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(compact ? 14 : 20),
      decoration: BoxDecoration(
        color: tokens.surface,
        borderRadius: BorderRadius.circular(compact ? 18 : 24),
        border: Border.all(color: tokens.border),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Container(
            width: compact ? 40 : 52,
            height: compact ? 40 : 52,
            decoration: BoxDecoration(
              color: visual.color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(
              icon ?? visual.icon,
              color: visual.color,
              size: compact ? 20 : 26,
            ),
          ),
          SizedBox(height: compact ? 10 : 14),
          Text(
            effectiveTitle,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
              fontSize: compact ? 14 : null,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            effectiveMessage,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: tokens.muted,
              fontSize: compact ? 12 : 14,
              height: 1.45,
            ),
          ),
          if (effectiveAction != null && onAction != null) ...<Widget>[
            SizedBox(height: compact ? 12 : 16),
            FilledButton.icon(
              onPressed: onAction,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: Text(effectiveAction),
            ),
          ],
        ],
      ),
    );
  }
}

class _StateSkeleton extends StatelessWidget {
  const _StateSkeleton({required this.compact});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    final tokens = Theme.of(context).extension<MohamyThemeTokens>()!;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(compact ? 14 : 20),
      decoration: BoxDecoration(
        color: tokens.surface,
        borderRadius: BorderRadius.circular(compact ? 18 : 24),
        border: Border.all(color: tokens.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _SkeletonBar(width: 120, height: compact ? 12 : 14),
          const SizedBox(height: 12),
          _SkeletonBar(width: double.infinity, height: compact ? 10 : 12),
          const SizedBox(height: 8),
          _SkeletonBar(
            width: MediaQuery.of(context).size.width * 0.45,
            height: compact ? 10 : 12,
          ),
        ],
      ),
    );
  }
}

class _SkeletonBar extends StatelessWidget {
  const _SkeletonBar({required this.width, required this.height});

  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: (isDark ? Colors.white : AppColors.lightTitle).withValues(
          alpha: 0.08,
        ),
        borderRadius: BorderRadius.circular(999),
      ),
    );
  }
}

class _StateVisual {
  const _StateVisual({
    required this.icon,
    required this.color,
    required this.message,
  });

  final IconData icon;
  final Color color;
  final String message;
}

_StateVisual _visualFor(ScreenLoadStatus status) {
  switch (status) {
    case ScreenLoadStatus.empty:
      return const _StateVisual(
        icon: Icons.inbox_outlined,
        color: AppColors.primary,
        message:
            'لا توجد بيانات هنا بعد. ابدأ بالإجراء المتاح لإكمال هذا الجزء.',
      );
    case ScreenLoadStatus.partial:
      return const _StateVisual(
        icon: Icons.sync_problem_rounded,
        color: AppColors.primary,
        message:
            'تم تحميل جزء من البيانات فقط. يمكنك المتابعة أو إعادة المحاولة.',
      );
    case ScreenLoadStatus.offline:
      return const _StateVisual(
        icon: Icons.wifi_off_rounded,
        color: AppColors.danger,
        message: 'الاتصال غير متاح حالياً. تحقق من الشبكة ثم حاول مرة أخرى.',
      );
    case ScreenLoadStatus.error:
      return const _StateVisual(
        icon: Icons.error_outline_rounded,
        color: AppColors.danger,
        message: 'تعذر تنفيذ الطلب. حاول مرة أخرى أو راجع البيانات المدخلة.',
      );
    case ScreenLoadStatus.idle:
    case ScreenLoadStatus.ready:
    case ScreenLoadStatus.loading:
      return const _StateVisual(
        icon: Icons.check_circle_outline_rounded,
        color: AppColors.success,
        message: 'البيانات جاهزة.',
      );
  }
}
