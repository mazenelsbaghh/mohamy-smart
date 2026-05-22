# Tasks: Mobile Web Parity

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/078-mobile-web-parity/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include focused Flutter tests for routing, state widgets, OCR review, and AI point readiness where the task changes observable behavior.

**Organization**: Tasks are grouped by user story so the highest-value mobile parity slices can be implemented and verified independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the minimum dependency and shared primitives needed for production-like mobile parity.

- [X] T001 Add file picker dependency for real mobile document selection in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/pubspec.yaml`
- [X] T002 Add reusable screen loading state enums and notification models in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/models/legal_models.dart`
- [X] T003 [P] Add reusable loading/empty/error/offline state widget in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/widgets/state_view.dart`
- [X] T004 [P] Add mobile parity API methods for auth recovery, case details, agenda mutation, document status, contracts, process papers, and notifications in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/services/api_service.dart`
- [X] T005 [P] Update fake mobile API responses for new state, document, and notification methods in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/test/fake_api_service.dart`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Make shared state honest about loading, partial API failures, notifications, and production unavailable flows before user stories build on it.

- [X] T006 Add app-wide load state, last refresh timestamp, notification list, and API gap tracking in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/app/app_state.dart`
- [X] T007 Wire `fetchLiveData` partial failure reporting and notification loading in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/app/app_state.dart` (depends on T004, T006)
- [X] T008 Add state-view widget coverage for loading/error/offline/empty variants in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/test/state_view_test.dart` (depends on T003)

**Checkpoint**: Foundation ready. User-story work can now use shared states and API-gap reporting.

---

## Phase 3: User Story 1 - Complete Mobile Practice Workspace (Priority: P1) MVP

**Goal**: A lawyer can sign in, navigate major web-equivalent destinations, inspect case/client/agenda context, and see useful states instead of blank screens.

**Independent Test**: Authenticate with fake API, navigate Home, Cases, Clients, Agenda, More, Notifications, and open Case Details without blank or broken routes.

### Tests for User Story 1

- [X] T009 [P] [US1] Add navigation test for notifications and More parity destinations in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/test/app_navigation_test.dart` (depends on T005, T006)

### Implementation for User Story 1

- [X] T010 [US1] Add Notifications destination and unread count entry to More/Home navigation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/more/more_screens.dart` (depends on T006)
- [X] T011 [US1] Create notifications list screen with read/unread state and deep-link placeholders in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/notifications/notifications_screen.dart` (depends on T002, T006)
- [X] T012 [US1] Update home dashboard header notification action to open the notifications screen in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/home/home_screen.dart` (depends on T011)
- [X] T013 [US1] Expand add-case input fields for facts, adversary, and legal claims in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/models/legal_models.dart` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/cases/add_case_screen.dart`
- [X] T014 [US1] Await case creation, show saving/error state, and preserve form input on failure in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/cases/add_case_screen.dart` (depends on T013)
- [X] T015 [US1] Update mobile case creation payload to send facts, adversary, and legal claims in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/app/app_state.dart` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/services/api_service.dart` (depends on T013)
- [X] T016 [US1] Replace plain empty text in Case Details summary with reusable empty-state actions for documents and agenda in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/cases/case_details_screen.dart` (depends on T003)

**Checkpoint**: User Story 1 should work independently with real navigation and richer case creation.

---

## Phase 4: User Story 2 - Document Capture and OCR to Case (Priority: P1)

**Goal**: Documents use an actual user-selected file instead of silent dummy bytes, and OCR review can feed richer case creation.

**Independent Test**: Opening Documents shows upload states; cancelling file selection is handled; OCR review pre-fills extracted text and can route into Add Case with extracted fields.

### Tests for User Story 2

- [X] T017 [P] [US2] Add OCR review prefill test in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/test/ocr_review_test.dart`

### Implementation for User Story 2

- [X] T018 [US2] Replace dummy OCR upload bytes with real file picker selection and cancel handling in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/documents/documents_screen.dart` (depends on T001)
- [X] T019 [US2] Add upload failure and unsupported-file Arabic states using `MohamyStateView` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/documents/documents_screen.dart` (depends on T003, T018)
- [X] T020 [US2] Pass reviewed OCR text into Add Case facts when generating a case from OCR in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/documents/ocr_review_screen.dart` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/cases/add_case_screen.dart` (depends on T013)

**Checkpoint**: User Story 2 removes the production-unsafe dummy upload and improves OCR-to-case continuity.

---

## Phase 5: User Story 3 - Mobile AI Workflow Parity (Priority: P1)

**Goal**: AI workflows communicate readiness, selected case context, point cost, and insufficient-points behavior more clearly before execution.

**Independent Test**: From Case Details or AI Hub, a lawyer can see readiness, point cost, selected facts count, document count, and a confirmation step before running AI.

### Tests for User Story 3

- [X] T021 [P] [US3] Add AI workflow insufficient-points widget test in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/test/ai_workflow_points_test.dart`

### Implementation for User Story 3

- [X] T022 [US3] Add reusable workflow readiness banner in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/ai_workflows/ai_workflow_screens.dart`
- [X] T023 [US3] Require point-cost confirmation before starting a workflow runner in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/ai_workflows/ai_workflow_screens.dart` (depends on T022)
- [X] T024 [US3] Include selected facts and attached documents in AI job input JSON in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/ai_workflows/ai_workflow_screens.dart` (depends on T023)

**Checkpoint**: User Story 3 prevents unclear point deductions and improves workflow input parity with web.

---

## Phase 6: User Story 4 - Legal Tools and Operational Pages (Priority: P2)

**Goal**: Secondary parity sections expose honest API coverage and modern operational states.

**Independent Test**: A lawyer can open contracts, process-server papers, subscription/points, and notifications and see either backend data or a clear unavailable/error state.

### Implementation for User Story 4

- [X] T025 [US4] Add API-gap banners to Legal Contracts and Process Server Papers screens in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/more/more_screens.dart` (depends on T004)
- [X] T026 [US4] Add subscription partial-data and point-history empty states in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/subscription/subscription_screen.dart` (depends on T003)

---

## Phase 7: User Story 5 - Modern Arabic Mobile Experience (Priority: P2)

**Goal**: Apply shared modern product UI hardening to updated screens.

**Independent Test**: Updated screens remain readable in light/dark mode at 390px and do not show nested card or dummy-data anti-patterns.

### Implementation for User Story 5

- [X] T027 [US5] Normalize reusable card tap styling and state spacing in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/widgets/app_card.dart` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/widgets/empty_state.dart`
- [X] T028 [US5] Remove decorative remote social-login image dependency and replace it with local icon treatment in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/auth/auth_screens.dart`

---

## Phase 8: Polish & Validation

**Purpose**: Validate formatting, analyzer, tests, and implementation notes.

- [X] T029 Run Dart formatter for `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/test`
- [X] T030 Run `flutter analyze` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile` and fix reported issues
- [X] T031 Run `flutter test` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile` and fix failing tests
- [X] T032 Update validation notes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/078-mobile-web-parity/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase.
- **Polish (Phase 8)**: Depends on implemented stories.

### User Story Dependencies

- **US1**: Depends on Foundational state/API coverage.
- **US2**: Depends on T001, T003, and richer Add Case input from US1.
- **US3**: Depends on current case/document/workflow state and can be validated after US1.
- **US4**: Depends on API coverage contract methods and shared state views.
- **US5**: Can be applied after the updated screens exist.

### Parallel Opportunities

- T003, T004, and T005 can run in parallel after T001/T002 are understood.
- T009 and T017 can be prepared in parallel because they target separate tests.
- T022 and T025 can be implemented in parallel after shared state widgets are available.

## Implementation Strategy

1. Complete shared state/API/widget foundation.
2. Deliver US1 and validate mobile workspace routing and case creation.
3. Deliver US2 and validate real document selection/OCR-to-case continuity.
4. Deliver US3 and validate AI point/readiness behavior.
5. Deliver US4/US5 hardening.
6. Run formatter, analyzer, and tests.
