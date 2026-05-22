import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mohamy_smart_mobile/app/app_state.dart';
import 'package:mohamy_smart_mobile/app/mohamy_mobile_app.dart';
import 'fake_api_service.dart';
import 'fake_signalr_service.dart';

void main() {
  testWidgets('case search filters matching records and shows no-results', (
    tester,
  ) async {
    final appState = AppState(
      apiService: FakeApiService(),
      signalRService: FakeSignalRService(),
    );
    appState.completeOnboarding();
    await appState.login('lawyer@mohamy-smart.com', 'demo1234');
    appState.setSelectedTab(1);

    await tester.pumpWidget(MohamyMobileApp(appState: appState));
    await tester.pumpAndSettle();

    expect(find.text('مطالبة مالية ضد مؤسسة توريد'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.search));
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const Key('case_search_field')), 'أحمد');
    await tester.pumpAndSettle();
    expect(find.text('مطالبة مالية ضد مؤسسة توريد'), findsOneWidget);
    expect(find.text('طلب تنفيذ سند لأمر'), findsOneWidget);

    await tester.enterText(
      find.byKey(const Key('case_search_field')),
      'لا توجد قضية بهذا الاسم',
    );
    await tester.pumpAndSettle();
    expect(find.text('لا توجد نتائج مطابقة'), findsOneWidget);
  });
}
