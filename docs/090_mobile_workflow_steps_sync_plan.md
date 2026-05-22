# Plan - Mobile Workflow Steps and Outputs Sync

Synchronize the workflow step names, descriptions, and mock output structures in the Flutter mobile application (`mohamy_smart_mobile`) to match the web application's (`lawyer-dashboard`) configurations exactly.

## Proposed Changes

### Component: Flutter Mobile Application (mohamy_smart_mobile)

#### [MODIFY] [demo_legal_repository.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/core/data/demo_legal_repository.dart)
- Update `workflowSteps` map step titles for all 7 workflows to match web definitions:
  - **`defense-memo`**: `التحليل القانوني`, `الدفوع`, `الطلبات`, `المذكرة النهائية`.
  - **`preparing-statement-of-claims`**: `نوع الدعوى`, `الأطراف`, `الموضوع`, `الوقائع`, `الأساس القانوني`, `الطلبات`, `الصحيفة`.
  - **`appeal-brief`**: `بيانات الحكم`, `تحليل الأسباب`, `أوجه الطعن`, `الطلبات`, `السند القانوني`, `صحيفة الاستئناف`.
  - **`admin-complaint`**: `بيانات الجهة والأساس`, `سرد الوقائع`, `تحليل المخالفات`, `صياغة الطلبات`, `الشكوى النهائية`.
  - **`ruling-analysis`**: `منطوق الحكم`, `أسباب الحكم`, `تقييم العيوب`, `خلاصة الطعن`.
  - **`legal-warning`**: `تصنيف الإنذار`, `صياغة المتن`, `الإنذار النهائي`.
  - **`exec-request`**: `تصنيف الطلب`, `صياغة المبررات`, `الطلب النهائي`.
- Enrich `getMockOutputs` fields to include missing web fields:
  - **`preparing-statement-of-claims`**: Add `subjectFullText` to step 3.
  - **`admin-complaint`**: Add `legalBasis` to step 1; add `keyFacts` to step 2; add `legalRef` to step 3 `violations`.
  - **`ruling-analysis`**: Add `severity` to step 3 `defects`; add `appealStrength` and `recommendedGrounds` to step 4.
  - **`legal-warning`**: Add `type` to step 1 `legalBasis`.
  - **`exec-request`**: Add `legalBasis` and `urgencyLevel` to step 1.
- Update `mockSnapshots` (the hardcoded initial snapshots) to match these step indexes and output formats.

#### [MODIFY] [ai_workflow_screens.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/ai_workflows/ai_workflow_screens.dart)
- Update `_getFieldLabel` key mapper to support new fields:
  - `subjectFullText` -> `تفاصيل موضوع النزاع`
  - `severity` -> `مدى جسامة العيب/الثغرة`
  - `appealStrength` -> `قوة فرصة قبول الطعن`
  - `recommendedGrounds` -> `أوجه الطعن الموصى بها`
  - `urgencyLevel` -> `درجة استعجال الطلب`
  - `type` -> `نوع السند/الأساس`

## Verification Plan

### Automated Tests
- Run `flutter analyze` inside `apps/mohamy_smart_mobile` to verify that all code compiles.
- Run `flutter test` to ensure existing assertions pass.

### Manual Verification
- Launch the workflow runner on mobile, navigate through the steps, and verify that titles, count, and field inputs match the web dashboard exactly.
