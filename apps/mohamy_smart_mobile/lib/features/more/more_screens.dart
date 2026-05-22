import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/empty_state.dart';
import '../clients/clients_screen.dart';
import '../documents/documents_screen.dart';
import '../settings/settings_screen.dart';
import '../subscription/subscription_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    final items = <_MoreItem>[
      _MoreItem(
        icon: Icons.people_outline,
        title: 'العملاء',
        builder: (_) => ClientsScreen(appState: appState),
      ),
      _MoreItem(
        icon: Icons.description_outlined,
        title: 'المستندات',
        builder: (_) => DocumentsScreen(appState: appState),
      ),
      _MoreItem(
        icon: Icons.menu_book_outlined,
        title: 'المكتبة القانونية',
        builder: (_) => const LegalLibraryScreen(),
      ),
      _MoreItem(
        icon: Icons.edit_document,
        title: 'العقود القانونية',
        builder: (_) => const LegalContractsScreen(),
      ),
      _MoreItem(
        icon: Icons.local_shipping_outlined,
        title: 'أوراق المحضرين',
        builder: (_) => const ProcessServerScreen(),
      ),
      _MoreItem(
        icon: Icons.auto_awesome,
        title: 'الاشتراك والنقاط',
        builder: (_) => SubscriptionScreen(appState: appState),
      ),
      _MoreItem(
        icon: Icons.settings_outlined,
        title: 'الإعدادات',
        builder: (_) => SettingsScreen(appState: appState),
      ),
      _MoreItem(
        icon: Icons.info_outline,
        title: 'حالات النظام',
        builder: (_) => const SystemStatesScreen(),
      ),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: <Widget>[
        Text(
          'المزيد',
          style: Theme.of(
            context,
          ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 14),
        ...items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: AppCard(
              onTap: () => Navigator.of(
                context,
              ).push(MaterialPageRoute<void>(builder: item.builder)),
              child: Row(
                children: <Widget>[
                  Icon(item.icon, color: AppColors.primary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      item.title,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ),
                  const Icon(Icons.chevron_left),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class LegalLibraryScreen extends StatelessWidget {
  const LegalLibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return _SimpleListScreen(
      title: 'المكتبة القانونية',
      items: const <String>[
        'حاسبة المواريث',
        'حاسبة الرسوم القضائية',
        'الوكالات',
        'اللوائح الداخلية',
      ],
    );
  }
}

class LegalContractsScreen extends StatelessWidget {
  const LegalContractsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return _SimpleListScreen(
      title: 'العقود القانونية',
      items: const <String>[
        'عقد خدمات قانونية',
        'عقد وكالة تجارية',
        'اتفاقية تسوية',
      ],
    );
  }
}

class ProcessServerScreen extends StatelessWidget {
  const ProcessServerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return _SimpleListScreen(
      title: 'أوراق المحضرين',
      items: const <String>[
        'إعلان شركة النخبة - قيد التسليم',
        'إنذار أحمد السالم - تم التسليم',
      ],
    );
  }
}

class SystemStatesScreen extends StatelessWidget {
  const SystemStatesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('حالات النظام')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const <Widget>[
          EmptyState(
            icon: Icons.inbox_outlined,
            title: 'لا توجد بيانات بعد',
            message: 'أضف أول عنصر للبدء.',
            actionLabel: 'إضافة',
          ),
          SizedBox(height: 12),
          EmptyState(
            icon: Icons.wifi_off_outlined,
            title: 'لا يوجد اتصال بالإنترنت',
            message: 'تحقق من الشبكة ثم حاول مرة أخرى.',
            actionLabel: 'إعادة المحاولة',
          ),
          SizedBox(height: 12),
          EmptyState(
            icon: Icons.auto_awesome,
            title: 'الرصيد غير كاف',
            message: 'اشتر نقاطا إضافية لتشغيل هذا الإجراء.',
            actionLabel: 'شراء نقاط',
          ),
        ],
      ),
    );
  }
}

class _SimpleListScreen extends StatelessWidget {
  const _SimpleListScreen({required this.title, required this.items});

  final String title;
  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: items
            .map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: AppCard(
                  child: Row(
                    children: <Widget>[
                      const Icon(Icons.check_circle_outline),
                      const SizedBox(width: 12),
                      Expanded(child: Text(item)),
                      const Icon(Icons.chevron_left),
                    ],
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _MoreItem {
  const _MoreItem({
    required this.icon,
    required this.title,
    required this.builder,
  });

  final IconData icon;
  final String title;
  final WidgetBuilder builder;
}
