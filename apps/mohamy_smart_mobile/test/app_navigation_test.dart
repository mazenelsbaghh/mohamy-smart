import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mohamy_smart_mobile/app/app_state.dart';
import 'package:mohamy_smart_mobile/app/mohamy_mobile_app.dart';
import 'fake_api_service.dart';
import 'fake_signalr_service.dart';

void main() {
  testWidgets('user can onboard, login, navigate tabs, and toggle dark mode', (
    tester,
  ) async {
    final appState = AppState(
      apiService: FakeApiService(),
      signalRService: FakeSignalRService(),
    );

    await tester.pumpWidget(MohamyMobileApp(appState: appState));
    await tester.pump(const Duration(seconds: 2));
    expect(find.text('أدر قضاياك بذكاء'), findsOneWidget);

    await tester.tap(find.byKey(const Key('skip_onboarding')));
    await tester.pumpAndSettle();
    expect(find.text('تسجيل الدخول'), findsOneWidget);

    await tester.tap(find.byKey(const Key('login_button')));
    await tester.pumpAndSettle();
    expect(find.textContaining('سيادة المستشار'), findsOneWidget);

    await tester.tap(find.byKey(const Key('home_notifications_button')));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('notifications_screen')), findsOneWidget);
    expect(find.text('اكتمل تحليل مذكرة الدفاع'), findsOneWidget);

    Navigator.of(
      tester.element(find.byKey(const Key('notifications_screen'))),
    ).pop();
    await tester.pumpAndSettle();
    expect(find.textContaining('سيادة المستشار'), findsOneWidget);

    await tester.tap(find.byKey(const Key('nav_cases')));
    await tester.pumpAndSettle();
    expect(find.text('القضايا'), findsWidgets);

    await tester.tap(find.byKey(const Key('nav_agenda')));
    await tester.pumpAndSettle();
    expect(find.text('الأجندة'), findsWidgets);

    await tester.tap(find.byKey(const Key('nav_more')));
    await tester.pumpAndSettle();
    expect(
      find.byKey(const ValueKey<String>('more_الإشعارات')),
      findsOneWidget,
    );

    await tester.tap(find.byKey(const ValueKey<String>('more_الإشعارات')));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('notifications_screen')), findsOneWidget);

    Navigator.of(
      tester.element(find.byKey(const Key('notifications_screen'))),
    ).pop();
    await tester.pumpAndSettle();

    final settingsItem = find.byKey(const ValueKey<String>('more_الإعدادات'));
    await Scrollable.ensureVisible(
      tester.element(settingsItem),
      alignment: 0.2,
    );
    await tester.pumpAndSettle();
    await tester.tap(settingsItem);
    await tester.pumpAndSettle();
    expect(find.text('الوضع الداكن'), findsOneWidget);

    await tester.tap(find.byKey(const Key('theme_toggle')));
    await tester.pumpAndSettle();
    expect(appState.isDarkMode, isTrue);
  });
}
