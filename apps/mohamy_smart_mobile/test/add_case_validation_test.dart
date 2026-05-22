import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mohamy_smart_mobile/app/app_state.dart';
import 'package:mohamy_smart_mobile/app/mohamy_mobile_app.dart';

void main() {
  testWidgets('add case form shows required Arabic validation', (tester) async {
    final appState = AppState()
      ..completeOnboarding()
      ..login('lawyer@mohamy-smart.com', 'demo1234')
      ..setSelectedTab(1);

    await tester.pumpWidget(MohamyMobileApp(appState: appState));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('add_case_button')));
    await tester.pumpAndSettle();
    expect(find.text('إضافة قضية'), findsOneWidget);

    await tester.tap(find.byKey(const Key('save_case_button')));
    await tester.pumpAndSettle();

    expect(find.text('هذا الحقل مطلوب'), findsNWidgets(4));
  });
}
