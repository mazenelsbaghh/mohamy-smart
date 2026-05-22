import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mohamy_smart_mobile/app/app_state.dart';
import 'package:mohamy_smart_mobile/core/models/legal_models.dart';
import 'package:mohamy_smart_mobile/core/theme/app_theme.dart';
import 'package:mohamy_smart_mobile/features/documents/ocr_review_screen.dart';

import 'fake_api_service.dart';
import 'fake_signalr_service.dart';

void main() {
  testWidgets('OCR review pre-fills generated case facts and parties', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(430, 1200);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final appState = AppState(
      apiService: FakeApiService(),
      signalRService: FakeSignalRService(),
    );
    const extractedText =
        'إقرار توريد بين شركة النور ومؤسسة العمار بقيمة ١٥٠,٠٠٠ ريال أمام المحكمة التجارية بالرياض.';

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        builder: (context, child) => Directionality(
          textDirection: TextDirection.rtl,
          child: child ?? const SizedBox.shrink(),
        ),
        home: OcrReviewScreen(
          appState: appState,
          extractedText: extractedText,
          document: const LegalDocument(
            id: 'doc-test',
            title: 'عقد توريد',
            type: 'PDF',
            dateLabel: '2026-05-22',
            status: DocumentStatus.ready,
            isAiReady: true,
          ),
        ),
      ),
    );

    await tester.ensureVisible(
      find.byKey(const Key('ai_generate_case_button')),
    );
    await tester.tap(find.byKey(const Key('ai_generate_case_button')));
    await tester.pumpAndSettle();

    expect(find.text('إضافة قضية'), findsOneWidget);

    final factsField = tester.widget<TextFormField>(
      find.byKey(const Key('facts_field')),
    );
    final adversaryField = tester.widget<TextFormField>(
      find.byKey(const Key('adversary_field')),
    );
    final claimsField = tester.widget<TextFormField>(
      find.byKey(const Key('legal_claims_field')),
    );

    expect(factsField.controller?.text, contains('إقرار توريد'));
    expect(adversaryField.controller?.text, 'مؤسسة العمار للمقاولات');
    expect(claimsField.controller?.text, contains('إلزام الخصم'));
  });
}
