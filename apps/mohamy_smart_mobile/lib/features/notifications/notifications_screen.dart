import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/state_view.dart';
import '../cases/case_details_screen.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: appState,
      builder: (context, _) {
        final notifications = appState.notifications;
        final unreadCount = appState.unreadNotificationCount;

        return Scaffold(
          key: const Key('notifications_screen'),
          appBar: AppBar(
            title: const Text('الإشعارات'),
            actions: <Widget>[
              IconButton(
                tooltip: 'تحديث الإشعارات',
                onPressed: appState.fetchLiveData,
                icon: const Icon(Icons.refresh_rounded),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: <Widget>[
              _NotificationsSummary(unreadCount: unreadCount),
              const SizedBox(height: 14),
              if (appState.appLoadState.isLoading && notifications.isEmpty)
                const MohamyStateView(
                  state: ScreenStateInfo(status: ScreenLoadStatus.loading),
                )
              else if (notifications.isEmpty)
                MohamyStateView(
                  state: const ScreenStateInfo(
                    status: ScreenLoadStatus.empty,
                    message:
                        'لا توجد إشعارات حالياً. سنعرض هنا نتائج الذكاء الاصطناعي، الجلسات، وحالة المستندات.',
                    retryLabel: 'تحديث',
                  ),
                  icon: Icons.notifications_none_rounded,
                  onAction: appState.fetchLiveData,
                )
              else
                ...notifications.map(
                  (notification) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _NotificationTile(
                      notification: notification,
                      onTap: () => _openNotification(context, notification),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _openNotification(
    BuildContext context,
    NotificationItem notification,
  ) async {
    try {
      await appState.markNotificationRead(notification.id);
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('تعذر تحديث حالة الإشعار. حاول مرة أخرى.'),
          ),
        );
      }
      return;
    }

    if (!context.mounted) {
      return;
    }

    if (notification.destinationType == 'case' &&
        notification.destinationId != null) {
      final matches = appState.cases.where(
        (legalCase) => legalCase.id == notification.destinationId,
      );
      if (matches.isNotEmpty) {
        await Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) =>
                CaseDetailsScreen(appState: appState, legalCase: matches.first),
          ),
        );
        return;
      }
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('تم تعليم "${notification.title}" كمقروء.')),
    );
  }
}

class _NotificationsSummary extends StatelessWidget {
  const _NotificationsSummary({required this.unreadCount});

  final int unreadCount;

  @override
  Widget build(BuildContext context) {
    final tokens = Theme.of(context).extension<MohamyThemeTokens>()!;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: tokens.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: tokens.border),
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.notifications_active_outlined,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  unreadCount == 0
                      ? 'كل الإشعارات مقروءة'
                      : '$unreadCount إشعارات غير مقروءة',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  'تنبيهات القضايا والمستندات والذكاء الاصطناعي في مكان واحد.',
                  style: TextStyle(
                    color: tokens.muted,
                    fontSize: 12.5,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.notification, required this.onTap});

  final NotificationItem notification;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final tokens = Theme.of(context).extension<MohamyThemeTokens>()!;
    final color = _categoryColor(notification.category);

    return Material(
      color: tokens.surface,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        key: Key('notification_tile_${notification.id}'),
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: notification.isRead
                  ? tokens.border
                  : color.withValues(alpha: 0.34),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Icon(
                  _categoryIcon(notification.category),
                  color: color,
                  size: 21,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            notification.title,
                            style: TextStyle(
                              fontWeight: notification.isRead
                                  ? FontWeight.w700
                                  : FontWeight.w900,
                              height: 1.25,
                            ),
                          ),
                        ),
                        if (!notification.isRead) ...<Widget>[
                          const SizedBox(width: 8),
                          Container(
                            width: 8,
                            height: 8,
                            margin: const EdgeInsets.only(top: 6),
                            decoration: const BoxDecoration(
                              color: AppColors.danger,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      notification.body,
                      style: TextStyle(
                        color: tokens.muted,
                        fontSize: 12.5,
                        height: 1.45,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: <Widget>[
                        _MetaPill(label: notification.category.label),
                        _MetaPill(label: _formatDate(notification.createdAt)),
                        if (notification.destinationType != null)
                          const _MetaPill(label: 'مرتبط بسجل'),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MetaPill extends StatelessWidget {
  const _MetaPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final tokens = Theme.of(context).extension<MohamyThemeTokens>()!;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: tokens.muted,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

IconData _categoryIcon(NotificationCategory category) {
  switch (category) {
    case NotificationCategory.aiJob:
      return Icons.auto_awesome_rounded;
    case NotificationCategory.agenda:
      return Icons.event_available_outlined;
    case NotificationCategory.document:
      return Icons.description_outlined;
    case NotificationCategory.subscription:
      return Icons.workspace_premium_outlined;
    case NotificationCategory.system:
      return Icons.info_outline_rounded;
  }
}

Color _categoryColor(NotificationCategory category) {
  switch (category) {
    case NotificationCategory.aiJob:
      return AppColors.primary;
    case NotificationCategory.agenda:
      return AppColors.success;
    case NotificationCategory.document:
      return const Color(0xFF2563EB);
    case NotificationCategory.subscription:
      return const Color(0xFF7C3AED);
    case NotificationCategory.system:
      return AppColors.lightMuted;
  }
}

String _formatDate(DateTime date) {
  final local = date.toLocal();
  final day = local.day.toString().padLeft(2, '0');
  final month = local.month.toString().padLeft(2, '0');
  final hour = local.hour.toString().padLeft(2, '0');
  final minute = local.minute.toString().padLeft(2, '0');
  return '$day/$month $hour:$minute';
}
