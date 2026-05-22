import 'dart:ui';
import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/theme/app_theme.dart';
import '../agenda/agenda_screen.dart';
import '../cases/cases_screen.dart';
import '../clients/clients_screen.dart';
import '../home/home_screen.dart';
import '../more/more_screens.dart';

class AppShell extends StatelessWidget {
  const AppShell({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    final screens = <Widget>[
      HomeScreen(appState: appState),
      CasesScreen(appState: appState),
      ClientsScreen(appState: appState),
      AgendaScreen(appState: appState),
      MoreScreen(appState: appState),
    ];

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final navBgColor = (isDark ? AppColors.darkSurface : AppColors.lightSurface).withValues(alpha: 0.85);
    final borderThemeColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    return Scaffold(
      extendBody: true,
      body: screens[appState.selectedTab],
      bottomNavigationBar: ClipRRect(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            height: 86,
            decoration: BoxDecoration(
              color: navBgColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
              border: Border(
                top: BorderSide(
                  color: borderThemeColor,
                  width: 1,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: <Widget>[
                _buildNavItem(
                  context,
                  index: 0,
                  key: const Key('nav_home'),
                  icon: Icons.home_outlined,
                  selectedIcon: Icons.home,
                  label: 'الرئيسية',
                ),
                _buildNavItem(
                  context,
                  index: 1,
                  key: const Key('nav_cases'),
                  icon: Icons.gavel_outlined,
                  selectedIcon: Icons.gavel,
                  label: 'القضايا',
                ),
                _buildNavItem(
                  context,
                  index: 2,
                  key: const Key('nav_clients'),
                  icon: Icons.people_outline,
                  selectedIcon: Icons.people,
                  label: 'الموكلين',
                ),
                _buildNavItem(
                  context,
                  index: 3,
                  key: const Key('nav_agenda'),
                  icon: Icons.event_note_outlined,
                  selectedIcon: Icons.event_note,
                  label: 'الأجندة',
                ),
                _buildNavItem(
                  context,
                  index: 4,
                  key: const Key('nav_more'),
                  icon: Icons.settings_outlined,
                  selectedIcon: Icons.settings,
                  label: 'الإعدادات',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required int index,
    required Key key,
    required IconData icon,
    required IconData selectedIcon,
    required String label,
  }) {
    final isSelected = appState.selectedTab == index;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final Color activeColor = AppColors.primary;
    final Color inactiveColor = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final Color activeBgColor = isDark ? AppColors.darkAccentSoft : AppColors.lightAccentSoft;

    return InkWell(
      key: key,
      onTap: () => appState.setSelectedTab(index),
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? activeBgColor : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Icon(
              isSelected ? selectedIcon : icon,
              color: isSelected ? activeColor : inactiveColor,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Tajawal',
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? activeColor : inactiveColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
