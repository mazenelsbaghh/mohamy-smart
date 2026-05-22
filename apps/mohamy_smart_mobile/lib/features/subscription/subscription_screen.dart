import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';

class SubscriptionScreen extends StatelessWidget {
  const SubscriptionScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    final plan = appState.subscription;
    return Scaffold(
      appBar: AppBar(title: const Text('الاشتراك والنقاط')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text('رصيد الذكاء الاصطناعي'),
                const SizedBox(height: 8),
                Text(
                  '${plan.aiPoints} نقطة متبقية',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text('خطتك الحالية: ${plan.name}'),
                Text('تاريخ التجديد: ${plan.renewalDate}'),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: () {},
                  child: const Text('ترقية الخطة'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'سجل الاستخدام',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                ...plan.usageEntries.map(
                  (entry) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(entry.title),
                    subtitle: Text(entry.dateLabel),
                    trailing: Text(
                      '${entry.points}',
                      style: TextStyle(
                        color: entry.points < 0
                            ? AppColors.danger
                            : AppColors.success,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(onPressed: () {}, child: const Text('شراء نقاط')),
        ],
      ),
    );
  }
}
