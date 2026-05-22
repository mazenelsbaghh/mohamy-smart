# Plan - Mobile Cases and Workflow Redesign

Redesign the Cases list, Case details, Workflow selection, and Workflow runner screens in the Flutter mobile application (`mohamy_smart_mobile`) to align perfectly with the mockups and design assets in `stitch_mohamy_smart_design_system 2`.

## Proposed Changes

### Component: Flutter Mobile Application (mohamy_smart_mobile)

#### [MODIFY] [demo_legal_repository.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/core/data/demo_legal_repository.dart)
- Add a fourth mock case (`case-4`) representing "دعوى التزوير في محررات رسمية - شركة النور" matching the case number, court, adversary, facts, and documents from the standard mockups.

#### [MODIFY] [cases_screen.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/cases/cases_screen.dart)
- Redesign the Cases list layout matching `cases_list_standard/code.html`:
  - Search and filter icons on the top bar in RTL.
  - Add the stats box showing Total (إجمالي), Active (نشطة), and Completed (منتهية) cases count.
  - Implement horizontal scrollable filter chips with gold-gradient active state.
  - Style the case list card with a custom status badge, case number, court details, client details, and a footer displaying "عرض التفاصيل" and update time.
  - Relocate the FAB to the bottom-left of the screen (`left-6`) with a gold gradient container.

#### [MODIFY] [case_details_screen.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/cases/case_details_screen.dart)
- Redesign the Case Details layout matching `case_details_standard/code.html`:
  - Implement a sticky top app bar.
  - Add a Bento-style Hero Card with a light orange gradient containing status badge, case title, "ابدأ التحليل الذكي" action button, and a gavel background illustration overlay.
  - Add custom horizontal tabs with a gold indicator line for switching between "التفاصيل" (Details), "التحليل الذكي" (AI Analysis), and "الملخص" (Summary).
  - Structure the details tab to show the information grid (low-surface containers), a highlighted Facts container with a warm yellow background and scrollable facts, and an AI Recommendation banner.

#### [MODIFY] [ai_workflow_screens.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/ai_workflows/ai_workflow_screens.dart)
- Redesign `AiWorkflowHubScreen` matching `workflow_selection_light_mode/code.html`:
  - Show the current case context card.
  - Show the list of 7 available workflows (from Catalog) with custom active icons, step counts, titles, descriptions, and chevron navigation actions.
- Redesign `AiWorkflowRunnerScreen` matching `ai_workflow_light_mode/code.html`:
  - Display the step stepper (1 to 4) using custom circle indicators (completed checkmark, active count, inactive state).
  - Embed the generated legal text for each step of the defense memo or workflow.
  - Highlight key legal recommendations using a lightbulb badge at the bottom of the card.
  - Implement a sticky bottom action bar with Outlined "السابق" (Previous) and Gradient "التالي" (Next) buttons, alongside the lawyer's profile/avatar details.

## Verification Plan

### Automated Tests
- Run `flutter test` inside `apps/mohamy_smart_mobile` to verify that all code compiles and widget/navigation assertions pass.

### Manual Verification
- Visual inspection on Chrome web build using the dev server.
