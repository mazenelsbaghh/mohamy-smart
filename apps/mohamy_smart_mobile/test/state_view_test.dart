import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mohamy_smart_mobile/core/models/legal_models.dart';
import 'package:mohamy_smart_mobile/core/theme/app_theme.dart';
import 'package:mohamy_smart_mobile/core/widgets/state_view.dart';

void main() {
  Widget harness(Widget child) {
    return MaterialApp(
      theme: AppTheme.light(),
      home: Scaffold(
        body: Center(
          child: Padding(padding: const EdgeInsets.all(24), child: child),
        ),
      ),
    );
  }

  testWidgets('renders loading skeleton without state copy', (tester) async {
    await tester.pumpWidget(
      harness(
        const MohamyStateView(
          key: Key('state_loading'),
          state: ScreenStateInfo(status: ScreenLoadStatus.loading),
        ),
      ),
    );

    expect(find.byKey(const Key('state_loading')), findsOneWidget);
    expect(find.text(ScreenLoadStatus.loading.label), findsNothing);
  });

  testWidgets('renders empty state copy', (tester) async {
    await tester.pumpWidget(
      harness(
        const MohamyStateView(
          state: ScreenStateInfo(status: ScreenLoadStatus.empty),
        ),
      ),
    );

    expect(find.text('لا توجد بيانات'), findsOneWidget);
    expect(find.textContaining('لا توجد بيانات هنا بعد'), findsOneWidget);
  });

  testWidgets('renders error state with retry action', (tester) async {
    var retryCount = 0;

    await tester.pumpWidget(
      harness(
        MohamyStateView(
          state: const ScreenStateInfo(
            status: ScreenLoadStatus.error,
            message: 'فشل تحميل البيانات',
            retryLabel: 'إعادة المحاولة',
          ),
          onAction: () => retryCount++,
        ),
      ),
    );

    expect(find.text('تعذر التحميل'), findsOneWidget);
    expect(find.text('فشل تحميل البيانات'), findsOneWidget);

    await tester.tap(find.text('إعادة المحاولة'));
    expect(retryCount, 1);
  });

  testWidgets('renders offline state copy', (tester) async {
    await tester.pumpWidget(
      harness(
        const MohamyStateView(
          state: ScreenStateInfo(status: ScreenLoadStatus.offline),
        ),
      ),
    );

    expect(find.text('غير متصل'), findsOneWidget);
    expect(find.textContaining('الاتصال غير متاح'), findsOneWidget);
  });
}
