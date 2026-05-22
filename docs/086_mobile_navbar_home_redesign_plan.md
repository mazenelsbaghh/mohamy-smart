# Plan - Mobile Navigation Bar & Home Screen Redesign with Makefile

Refine and verify the bottom navigation bar and homepage design in the Flutter mobile application based on `stitch_mohamy_smart_design_system (1)`, fix any compilation/test issues, and add a root Makefile target for Flutter Web on Chrome.

## Proposed Changes

### Component: Root Makefile (Makefile)

#### [MODIFY] [Makefile](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/Makefile)
- Add a new section for **Mobile (Flutter) Workflows**.
- Define `run-web` / `run-chrome` targeting Chrome (`cd apps/mohamy_smart_mobile && flutter run -d chrome`).
- Define `test-mobile` targeting `cd apps/mohamy_smart_mobile && flutter test`.
- Add `test-mobile` to the existing composite `test` target so `make test` runs all backend, dashboard, and mobile tests.

### Component: Flutter Mobile Application (mohamy_smart_mobile)

#### [MODIFY] [home_screen.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/home/home_screen.dart)
- Fix the compiler error: Remove `shadowColor` parameter from the `FloatingActionButton` widget.
- Move the shadow styling into the `BoxDecoration` of the FAB's child `Container` with a 12px vertical offset and 24px blur radius matching the design system (`rgba(239, 149, 10, 0.3)` gradient shadow).

#### [MODIFY] [app_shell.dart](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/mohamy_smart_mobile/lib/features/shell/app_shell.dart)
- Verify alignment with `stitch_mohamy_smart_design_system (1)`. Ensure 5 tabs are properly configured, and visual transition rules apply (no harsh borders, backdrop blur container, custom active amber indicators).

## Verification Plan

### Automated Tests
- Run `flutter test` inside `apps/mohamy_smart_mobile` to verify successful compilation and that all widget/unit tests pass.

### Manual Verification
- Run `make run-chrome` from the root directory to launch the app on Chrome.
- Verify the bottom navigation bar has the correct 5 tabs and active indicator styling.
- Verify the Home page displays all elements (top header with greeting, Quick Actions, scrollable stats, Today's Appointments, and Recent Cases) with no visual lines or overflow issues.
