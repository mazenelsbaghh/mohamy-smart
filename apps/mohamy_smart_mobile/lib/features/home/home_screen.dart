import 'dart:ui';
import 'package:flutter/material.dart';

import '../../app/app_state.dart';
import '../../core/models/legal_models.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/legal_cards.dart';
import '../../core/widgets/user_tie_avatar.dart';
import '../cases/add_case_screen.dart';
import '../cases/case_details_screen.dart';
import '../documents/documents_screen.dart';
import '../notifications/notifications_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({required this.appState, super.key});

  final AppState appState;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final headerBgColor = isDark
        ? AppColors.darkSurface.withValues(alpha: 0.85)
        : AppColors.lightSurface.withValues(alpha: 0.85);
    final textMuted = isDark ? AppColors.darkMuted : AppColors.lightMuted;
    final borderThemeColor = isDark
        ? AppColors.darkBorder
        : AppColors.lightBorder;

    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => AddCaseScreen(appState: appState),
            ),
          );
        },
        shape: const CircleBorder(),
        elevation: 0,
        backgroundColor: Colors.transparent,
        child: Container(
          width: 56,
          height: 56,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.mainGradient,
            boxShadow: <BoxShadow>[
              BoxShadow(
                color: Color(0x4DEF950A),
                blurRadius: 24,
                offset: Offset(0, 12),
              ),
            ],
          ),
          child: const Icon(Icons.add, color: Colors.white, size: 28),
        ),
      ),
      floatingActionButtonLocation: const OffsetStartFloatLocation(),
      body: Stack(
        children: <Widget>[
          // Scrollable Content
          Positioned.fill(
            child: ListView(
              padding: EdgeInsets.only(
                top: 80 + MediaQuery.of(context).padding.top,
                bottom: 100,
              ),
              children: <Widget>[
                // Quick Actions Row
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: <Widget>[
                      _buildQuickAction(
                        context,
                        icon: Icons.gavel,
                        label: 'قضية جديدة',
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) => AddCaseScreen(appState: appState),
                            ),
                          );
                        },
                      ),
                      _buildQuickAction(
                        context,
                        icon: Icons.person_add_alt_1_outlined,
                        label: 'موكل جديد',
                        onTap: () {
                          appState.setSelectedTab(2);
                        },
                      ),
                      _buildQuickAction(
                        context,
                        icon: Icons.upload_file_outlined,
                        label: 'رفع مستند',
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) =>
                                  DocumentsScreen(appState: appState),
                            ),
                          );
                        },
                      ),
                      _buildQuickAction(
                        context,
                        icon: Icons.calendar_today_outlined,
                        label: 'الأجندة',
                        onTap: () {
                          appState.setSelectedTab(3);
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Stats Cards Section (Horizontal scroll)
                SizedBox(
                  height: 125,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: <Widget>[
                      _buildStatCard(
                        context,
                        icon: Icons.balance,
                        iconColor: const Color(0xFFD97706),
                        iconBgColor: const Color(0x1AD97706),
                        count: appState.cases.length.toString(),
                        label: 'إجمالي القضايا',
                      ),
                      const SizedBox(width: 12),
                      _buildStatCard(
                        context,
                        icon: Icons.task_alt,
                        iconColor: const Color(0xFF34BF49),
                        iconBgColor: const Color(0x1A34BF49),
                        count: appState.cases
                            .where((c) => c.status == CaseStatus.active)
                            .length
                            .toString(),
                        label: 'القضايا النشطة',
                      ),
                      const SizedBox(width: 12),
                      _buildStatCard(
                        context,
                        icon: Icons.groups_outlined,
                        iconColor: const Color(0xFF8B5CF6),
                        iconBgColor: const Color(0x1A8B5CF6),
                        count: appState.clients.length.toString(),
                        label: 'الموكلين',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // Today's Appointments
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      Text(
                        'مواعيد اليوم',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      InkWell(
                        onTap: () => appState.setSelectedTab(3),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Text(
                            'عرض الكل',
                            style: TextStyle(
                              fontFamily: 'Tajawal',
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _buildTodayAppointment(context, isDark, textMuted),
                ),
                const SizedBox(height: 28),

                // Recent Cases
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      Text(
                        'القضايا الأخيرة',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      InkWell(
                        onTap: () => appState.setSelectedTab(1),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Text(
                            'عرض الكل',
                            style: TextStyle(
                              fontFamily: 'Tajawal',
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                ...appState.cases
                    .take(2)
                    .map(
                      (caseItem) => Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 6,
                        ),
                        child: CaseCard(
                          legalCase: caseItem,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute<void>(
                                builder: (_) => CaseDetailsScreen(
                                  appState: appState,
                                  legalCase: caseItem,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
              ],
            ),
          ),
          // Fixed TopAppBar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: ClipRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                child: Container(
                  height: 64.0 + MediaQuery.of(context).padding.top,
                  padding: EdgeInsets.only(
                    top: MediaQuery.of(context).padding.top,
                    left: 20,
                    right: 20,
                  ),
                  decoration: BoxDecoration(
                    color: headerBgColor,
                    border: Border(
                      bottom: BorderSide(color: borderThemeColor, width: 1),
                    ),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: const Color(
                          0xFF885200,
                        ).withValues(alpha: isDark ? 0.02 : 0.04),
                        blurRadius: 32,
                        offset: const Offset(0, 12),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      // Right side (Notifications + Title)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Stack(
                            clipBehavior: Clip.none,
                            children: <Widget>[
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: isDark
                                      ? AppColors.darkAccentSoft
                                      : AppColors.lightAccentSoft,
                                ),
                                child: IconButton(
                                  key: const Key('home_notifications_button'),
                                  icon: const Icon(
                                    Icons.notifications_none_rounded,
                                    color: AppColors.primary,
                                    size: 20,
                                  ),
                                  onPressed: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute<void>(
                                        builder: (_) => NotificationsScreen(
                                          appState: appState,
                                        ),
                                      ),
                                    );
                                  },
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                ),
                              ),
                              if (appState.unreadNotificationCount > 0)
                                Positioned(
                                  top: 2,
                                  right: 2,
                                  child: Container(
                                    width: 8,
                                    height: 8,
                                    decoration: BoxDecoration(
                                      color: AppColors.danger,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: isDark
                                            ? const Color(0xFF1D1D1D)
                                            : Colors.white,
                                        width: 1.5,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(width: 12),
                          ShaderMask(
                            shaderCallback: (bounds) =>
                                AppColors.mainGradient.createShader(
                                  Rect.fromLTWH(
                                    0,
                                    0,
                                    bounds.width,
                                    bounds.height,
                                  ),
                                ),
                            child: const Text(
                              'محامي سمارت',
                              style: TextStyle(
                                fontFamily: 'Tajawal',
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: 0,
                              ),
                            ),
                          ),
                        ],
                      ),
                      // Left side (Profile & Greeting)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          // Avatar (first child in RTL Row, so it goes to the right of the Column)
                          const UserTieAvatar(size: 38),
                          const SizedBox(width: 10),
                          // Column (second child in RTL Row, so it goes to the left of the Avatar)
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: <Widget>[
                              Text(
                                'سيادة المستشار 💼',
                                style: TextStyle(
                                  fontFamily: 'Tajawal',
                                  fontSize: 11,
                                  color: textMuted,
                                  height: 1.1,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'أ/ ${appState.profile.displayName.split(" ").first}',
                                style: TextStyle(
                                  fontFamily: 'Tajawal',
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: isDark
                                      ? Colors.white
                                      : AppColors.primary,
                                  height: 1.1,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAction(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(999),
          child: Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1D1D1D) : Colors.white,
              shape: BoxShape.circle,
              boxShadow: const <BoxShadow>[
                BoxShadow(
                  color: Color(0x0A885200),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: const Color(0xFFEF950A), size: 24),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontFamily: 'Tajawal',
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white70 : const Color(0xFF534434),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required IconData icon,
    required Color iconColor,
    required Color iconBgColor,
    required String count,
    required String label,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: 140,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x0A885200),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: (isDark ? const Color(0xFF1D1D1D) : Colors.white)
                  .withValues(alpha: 0.7),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.1)
                    : const Color(0xFFD9C3AE).withValues(alpha: 0.15),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: iconBgColor,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: iconColor, size: 18),
                ),
                const Spacer(),
                Text(
                  count,
                  style: TextStyle(
                    fontFamily: 'Tajawal',
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : const Color(0xFF1B1B1B),
                    height: 1.1,
                  ),
                ),
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: 'Tajawal',
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: isDark ? Colors.white70 : const Color(0xFF534434),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTodayAppointment(
    BuildContext context,
    bool isDark,
    Color textMuted,
  ) {
    if (appState.agenda.isEmpty) {
      return Container(
        height: 90,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1D1D1D) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.1)
                : const Color(0xFFD9C3AE).withValues(alpha: 0.1),
            width: 1,
          ),
          boxShadow: const <BoxShadow>[
            BoxShadow(
              color: Color(0x0A885200),
              blurRadius: 24,
              offset: Offset(0, 8),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Row(
          children: <Widget>[
            Container(width: 6, color: textMuted.withValues(alpha: 0.4)),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'لا توجد مواعيد اليوم',
                    style: const TextStyle(
                      fontFamily: 'Tajawal',
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Color(
                        0xFF1B1B1B,
                      ), // Fallback, but text theme handles this mostly
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'يومك خالي من الجلسات والاجتماعات المجدولة.',
                    style: TextStyle(
                      fontFamily: 'Tajawal',
                      fontSize: 12,
                      color: textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    final appointment = appState.agenda.first;
    final matchingCase = appState.cases.firstWhere(
      (c) => c.id == appointment.caseId,
      orElse: () => const LegalCase(
        id: '',
        caseNumber: '',
        title: '',
        clientId: '',
        clientName: 'غير محدد',
        court: '',
        caseType: '',
        status: CaseStatus.active,
        facts: [],
        documentIds: [],
        readiness: CaseReadiness(
          hasDocuments: false,
          hasFacts: false,
          hasEnoughPoints: false,
        ),
      ),
    );
    final clientName = matchingCase.clientName.isNotEmpty
        ? matchingCase.clientName
        : 'غير محدد';

    // format time starting at startsAt
    final time = appointment.startsAt;
    final hour = time.hour > 12
        ? time.hour - 12
        : (time.hour == 0 ? 12 : time.hour);
    final period = time.hour >= 12 ? 'PM' : 'AM';
    final minute = time.minute.toString().padLeft(2, '0');
    final timeStr = '${hour.toString().padLeft(2, '0')}:$minute $period';

    return Container(
      height: 90,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1D1D1D) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark
              ? Colors.white.withValues(alpha: 0.1)
              : const Color(0xFFD9C3AE).withValues(alpha: 0.1),
          width: 1,
        ),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x0A885200),
            blurRadius: 24,
            offset: Offset(0, 8),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Row(
        children: <Widget>[
          // Right strip of primary color
          Container(width: 6, color: AppColors.primary),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  appointment.title,
                  style: TextStyle(
                    fontFamily: 'Tajawal',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : const Color(0xFF1B1B1B),
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: <Widget>[
                    Icon(Icons.schedule, size: 14, color: textMuted),
                    const SizedBox(width: 4),
                    Text(
                      timeStr,
                      style: TextStyle(
                        fontFamily: 'Tajawal',
                        fontSize: 12,
                        color: textMuted,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Icon(Icons.person_outline, size: 14, color: textMuted),
                    const SizedBox(width: 4),
                    Text(
                      'موكل: $clientName',
                      style: TextStyle(
                        fontFamily: 'Tajawal',
                        fontSize: 12,
                        color: textMuted,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF242424) : const Color(0xFFF0EEE7),
              shape: BoxShape.circle,
            ),
            child: IconButton(
              onPressed: () {
                appState.setSelectedTab(3);
              },
              icon: const Icon(
                Icons.chevron_left,
                color: AppColors.primary,
                size: 20,
              ),
              padding: EdgeInsets.zero,
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
    );
  }
}
