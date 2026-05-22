import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mohamy_smart_mobile/app/app_state.dart';
import 'package:mohamy_smart_mobile/app/mohamy_mobile_app.dart';
import 'fake_api_service.dart';
import 'fake_signalr_service.dart';

void main() {
  testWidgets('add case form shows required Arabic validation', (tester) async {
    tester.view.physicalSize = const Size(430, 1200);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final appState = AppState(
      apiService: FakeApiService(),
      signalRService: FakeSignalRService(),
    );
    appState.completeOnboarding();
    await appState.login('lawyer@mohamy-smart.com', 'demo1234');
    appState.setSelectedTab(1);

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
