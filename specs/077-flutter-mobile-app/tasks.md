# Tasks: Mohamy Smart Mobile App

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/077-flutter-mobile-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/mobile-ui-contract.md, quickstart.md

**Tests**: Tests are required because the user explicitly requested automated tests and validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Flutter app under apps and configure baseline tooling.

- [X] T001 Create Flutter project scaffold in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/
- [X] T002 Update Flutter dependencies and app metadata in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/pubspec.yaml
- [X] T003 Configure Flutter lint rules in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/analysis_options.yaml
- [X] T004 Verify repository ignore patterns cover Flutter build outputs in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/.gitignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared app architecture, models, demo repository, theme, and reusable widgets.

- [X] T005 Create app state controller for auth, theme, tab navigation, and case search in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/app/app_state.dart
- [X] T006 [P] Add legal domain models for profile, cases, clients, agenda, documents, workflows, and subscriptions in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/models/legal_models.dart
- [X] T007 [P] Add deterministic demo legal repository data in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/data/demo_legal_repository.dart
- [X] T008 [P] Add Mohamy Smart light/dark theme tokens in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/theme/app_theme.dart
- [X] T009 [P] Add shared card, section, empty-state, and legal list widgets in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/core/widgets/
- [X] T010 Wire Material app root with RTL locale, theme mode, and auth gate in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/app/mohamy_mobile_app.dart
- [X] T011 Replace generated app entrypoint with MohamyMobileApp bootstrapping in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/main.dart

---

## Phase 3: User Story 1 - Open and Navigate the Mobile App (Priority: P1) MVP

**Goal**: Launch, authenticate, use app shell navigation, and switch theme.

**Independent Test**: Launch app, skip onboarding, login with non-empty credentials, navigate bottom tabs, and toggle dark mode.

### Tests for User Story 1

- [X] T012 [P] [US1] Add widget test for onboarding, login, bottom navigation, and theme toggle in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/test/app_navigation_test.dart

### Implementation for User Story 1

- [X] T013 [US1] Implement onboarding, login, sign-up, forgot password, and OTP auth screens in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/auth/auth_screens.dart
- [X] T014 [US1] Implement bottom-navigation app shell and More menu routing in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/shell/app_shell.dart
- [X] T015 [US1] Implement settings/profile screen with dark mode toggle and logout action in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/settings/settings_screen.dart

---

## Phase 4: User Story 2 - Review Daily Legal Work (Priority: P1)

**Goal**: Display the daily dashboard with AI points, next action, sessions, active cases, and recent AI activity.

**Independent Test**: Authenticated user lands on Home and can see dashboard sections and deep-link cards.

### Implementation for User Story 2

- [X] T016 [US2] Implement home dashboard sections and quick actions in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/home/home_screen.dart

---

## Phase 5: User Story 3 - Manage Cases and Case Details (Priority: P1)

**Goal**: Browse/search cases, add a case with validation, and inspect case details.

**Independent Test**: Search filters case cards, add-case validation blocks empty submit, and case details tabs render.

### Tests for User Story 3

- [X] T017 [P] [US3] Add widget test for case search matching and no-results state in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/test/case_search_test.dart
- [X] T018 [P] [US3] Add widget test for add-case required Arabic validation in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/test/add_case_validation_test.dart

### Implementation for User Story 3

- [X] T019 [US3] Implement cases list search, filters, and add button in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/cases/cases_screen.dart
- [X] T020 [US3] Implement add case form with required Arabic validation in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/cases/add_case_screen.dart
- [X] T021 [US3] Implement case details summary, facts, documents, sessions, and AI tabs in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/cases/case_details_screen.dart

---

## Phase 6: User Story 4 - Manage Clients, Agenda, and Documents (Priority: P2)

**Goal**: Provide clients, agenda, and document library screens.

**Independent Test**: Open each screen from More or bottom navigation and inspect linked records/states.

### Implementation for User Story 4

- [X] T022 [US4] Implement clients list and client details screen in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/clients/clients_screen.dart
- [X] T023 [US4] Implement agenda date strip and grouped session cards in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/agenda/agenda_screen.dart
- [X] T024 [US4] Implement document library with upload and processing states in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/documents/documents_screen.dart

---

## Phase 7: User Story 5 - Run AI Legal Workflows and Track Points (Priority: P2)

**Goal**: Provide AI workflow hub/runner, chat assistant, and subscription/points screens.

**Independent Test**: Open AI workflow, see readiness/point states, run demo progress, and open subscription/points.

### Implementation for User Story 5

- [X] T025 [US5] Implement AI workflow hub and runner screens in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/ai_workflows/ai_workflow_screens.dart
- [X] T026 [US5] Implement legal assistant chat screen with prompt chips and composer in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/chat/chat_screen.dart
- [X] T027 [US5] Implement subscription and AI points screen in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/subscription/subscription_screen.dart

---

## Phase 8: User Story 6 - Configure Account and System States (Priority: P3)

**Goal**: Complete supporting screens and reusable system-state coverage.

**Independent Test**: Open More menu, legal library placeholder sections, settings, and reusable state examples.

### Implementation for User Story 6

- [X] T028 [US6] Implement legal library, contracts, process-server, and system-state support screens in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib/features/more/more_screens.dart

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Format, analyze, test, and document validation.

- [X] T029 Run Dart formatter for /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/lib and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile/test
- [X] T030 Run flutter analyze in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile and fix all reported issues
- [X] T031 Run flutter test in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile and fix all failing tests
- [X] T032 Update implementation notes in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/077-flutter-mobile-app/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
- **Polish (Phase 9)**: Depends on implemented stories.

### User Story Dependencies

- **US1**: Depends on Foundational.
- **US2**: Depends on US1 shell and Foundational data.
- **US3**: Depends on Foundational and shell navigation.
- **US4**: Depends on Foundational data and shell routing.
- **US5**: Depends on case data, AI points data, and shell routing.
- **US6**: Depends on shell routing and shared system-state widgets.

### Parallel Opportunities

- T006, T007, T008, and T009 can run in parallel after project scaffold exists.
- T017 and T018 can run in parallel because they cover separate tests.
- T022, T023, and T024 can run in parallel after shared widgets are ready.
- T025, T026, and T027 can run in parallel after shared data models are ready.

## Implementation Strategy

1. Complete setup and foundational architecture.
2. Implement US1 to make the app launchable and navigable.
3. Implement US2 and US3 as the MVP legal workflow base.
4. Implement US4/US5 supporting modules.
5. Implement US6 support screens.
6. Run formatter, analyzer, and tests until clean.

