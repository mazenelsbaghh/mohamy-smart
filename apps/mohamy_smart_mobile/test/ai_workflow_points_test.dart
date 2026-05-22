import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mohamy_smart_mobile/core/models/legal_models.dart';
import 'package:mohamy_smart_mobile/core/theme/app_theme.dart';
import 'package:mohamy_smart_mobile/features/ai_workflows/ai_workflow_screens.dart';

void main() {
  testWidgets('workflow readiness banner flags insufficient points', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        home: Scaffold(
          body: Directionality(
            textDirection: TextDirection.rtl,
            child: WorkflowReadinessBanner(
              legalCase: const LegalCase(
                id: 'case-low-points',
                caseNumber: '١٢٣ / ٢٠٢٦',
                title: 'قضية تجارية',
                clientId: 'client-1',
                clientName: 'شركة النور',
                court: 'المحكمة التجارية',
                caseType: 'تجاري',
                status: CaseStatus.active,
                facts: ['واقعة تعاقدية مثبتة'],
                documentIds: [],
                readiness: CaseReadiness(
                  hasDocuments: false,
                  hasFacts: true,
                  hasEnoughPoints: false,
                ),
              ),
              documents: const [],
              availablePoints: 10,
              pointCost: 120,
            ),
          ),
        ),
      ),
    );

    expect(find.byKey(const Key('workflow_readiness_banner')), findsOneWidget);
    expect(find.text('النقاط غير كافية'), findsOneWidget);
    expect(find.byKey(const Key('workflow_points_status')), findsOneWidget);
    expect(find.text('10 / 120 نقطة'), findsOneWidget);
  });
}
