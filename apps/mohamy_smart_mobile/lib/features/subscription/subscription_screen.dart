import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/state_view.dart';

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
          if (appState.hasApiGaps) ...<Widget>[
            MohamyStateView(
              compact: true,
              state: ScreenStateInfo(
                status: ScreenLoadStatus.partial,
                message:
                    'بيانات الاشتراك قد تكون جزئية بسبب تعذر تحديث: ${appState.apiGaps.join('، ')}',
                lastUpdatedAt: appState.lastDataRefreshAt,
                retryLabel: 'تحديث',
              ),
              onAction: appState.fetchLiveData,
            ),
            const SizedBox(height: 12),
          ],
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
                Text(
                  'تاريخ التجديد: ${plan.renewalDate.isEmpty ? 'غير محدد' : plan.renewalDate}',
                ),
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
                if (plan.usageEntries.isEmpty)
                  const MohamyStateView(
                    compact: true,
                    icon: Icons.receipt_long_outlined,
                    title: 'لا يوجد سجل استخدام',
                    state: ScreenStateInfo(
                      status: ScreenLoadStatus.empty,
                      message:
                          'سيظهر هنا خصم النقاط وشحنها بعد تشغيل مسارات الذكاء الاصطناعي أو شراء نقاط.',
                    ),
                  )
                else
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
