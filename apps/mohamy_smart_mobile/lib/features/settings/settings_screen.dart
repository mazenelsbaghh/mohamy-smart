import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    final profile = appState.profile;
    return Scaffold(
      appBar: AppBar(title: const Text('الإعدادات')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          AppCard(
            child: Row(
              children: <Widget>[
                CircleAvatar(
                  backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                  child: Text(profile.displayName.substring(0, 1)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        profile.displayName,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w900),
                      ),
                      Text('رقم الترخيص: ${profile.licenseNumber}'),
                    ],
                  ),
                ),
                TextButton(onPressed: () {}, child: const Text('تعديل')),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              children: <Widget>[
                _SettingsTile(
                  icon: Icons.business_outlined,
                  title: 'بيانات المكتب',
                  subtitle: profile.firmName,
                ),
                _SettingsTile(
                  icon: Icons.lock_outline,
                  title: 'تغيير كلمة المرور',
                  subtitle: 'تحديث بيانات الأمان',
                ),
                SwitchListTile(
                  key: const Key('theme_toggle'),
                  contentPadding: EdgeInsets.zero,
                  value: appState.isDarkMode,
                  onChanged: appState.setDarkMode,
                  title: const Text('الوضع الداكن'),
                  secondary: const Icon(Icons.dark_mode_outlined),
                ),
                _SettingsTile(
                  icon: Icons.support_agent_outlined,
                  title: 'الدعم والمساعدة',
                  subtitle: 'تواصل مع فريق محامي سمارت',
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: appState.logout,
            icon: const Icon(Icons.logout, color: AppColors.danger),
            label: const Text(
              'تسجيل الخروج',
              style: TextStyle(color: AppColors.danger),
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_left),
    );
  }
}
