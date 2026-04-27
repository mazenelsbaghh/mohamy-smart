# Tasks: Phase A Remaining Code Fixes

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/010-remaining-code-fixes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: The feature specification does not require TDD or new automated tests, so this task list focuses on implementation and manual verification steps that a smaller LLM can execute deterministically.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after dependencies are complete and when the listed files do not overlap
- **[Story]**: Maps the task to the relevant user story from `spec.md`
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared route constants, types, and slice registration needed by multiple stories.

- [X] T001 Create shared admin API route constants in `mohamy-smart-admin-dashboard/src/APIs/routes.ts`
- [X] T002 Create shared admin dashboard feature types in `mohamy-smart-admin-dashboard/src/types/index.ts`
- [X] T003 [P] Register a new settings reducer slot in `mohamy-smart-admin-dashboard/src/redux/store.ts`
- [X] T004 [P] Create typed Redux hooks in `mohamy-smart-admin-dashboard/src/hooks/reduxHooks.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add cross-cutting infrastructure required before user-story work can proceed cleanly.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T005 Create the admin settings Redux slice in `mohamy-smart-admin-dashboard/src/redux/settings/settingsSlice.ts`
- [X] T006 [P] Create admin settings thunk `fetchAdminProfile` in `mohamy-smart-admin-dashboard/src/redux/settings/thunk/fetchAdminProfile.ts`
- [X] T007 [P] Create admin settings thunk `updateAdminProfile` in `mohamy-smart-admin-dashboard/src/redux/settings/thunk/updateAdminProfile.ts`
- [X] T008 [P] Create admin settings thunk `changeAdminPassword` in `mohamy-smart-admin-dashboard/src/redux/settings/thunk/changeAdminPassword.ts`
- [X] T009 Create admin settings validation schemas in `mohamy-smart-admin-dashboard/src/validations/settingsSchema.ts`
- [X] T010 [P] Create shared `ErrorBoundary` component in `mohamy-smart-admin-dashboard/src/components/ErrorBoundary.tsx`
- [X] T011 [P] Create shared `ErrorBoundary` component in `mohamy-smart-lawyer-dashboard/src/components/ErrorBoundary.tsx`

**Checkpoint**: Shared admin settings state and dashboard resilience components are ready. User story implementation can begin.

---

## Phase 3: User Story 1 - Safe Local Workspace Setup (Priority: P1) 🎯 MVP

**Goal**: Ensure local dashboards always target the local backend and are reachable from the intended runtime environment.

**Independent Test**: Start the admin and lawyer dashboards locally and confirm both use `http://localhost:8976/api` and are reachable on their canonical ports without extra host configuration.

### Implementation for User Story 1

- [X] T012 [US1] Create local environment file in `mohamy-smart-admin-dashboard/.env.local`
- [X] T013 [US1] Create local environment file in `mohamy-smart-lawyer-dashboard/.env.local`
- [X] T014 [P] [US1] Update Vite server host binding in `mohamy-smart-admin-dashboard/vite.config.ts`
- [X] T015 [P] [US1] Update Vite server host binding in `mohamy-smart-lawyer-dashboard/vite.config.ts`
- [X] T016 [US1] Remove scaffolded weather controller from `mohamy-smart-backend/Lawyer/Controllers/WeatherForecastController.cs`
- [X] T017 [US1] Remove scaffolded weather model from `mohamy-smart-backend/Lawyer/WeatherForecast.cs`

**Checkpoint**: Local startup safety is complete and independently testable.

---

## Phase 4: User Story 2 - Admin Account Settings Management (Priority: P1)

**Goal**: Replace hardcoded settings data with API-backed profile and password management for authenticated administrators.

**Independent Test**: Sign in as an administrator, open settings, load real profile data, save a valid profile update, and change the password successfully with visible Arabic feedback.

### Implementation for User Story 2

- [X] T018 [P] [US2] Add settings response and form types to `mohamy-smart-admin-dashboard/src/types/index.ts`
- [X] T019 [US2] Implement extraReducers and error-reset logic in `mohamy-smart-admin-dashboard/src/redux/settings/settingsSlice.ts`
- [X] T020 [US2] Export and wire admin settings thunk paths from `mohamy-smart-admin-dashboard/src/redux/settings/thunk/fetchAdminProfile.ts`, `mohamy-smart-admin-dashboard/src/redux/settings/thunk/updateAdminProfile.ts`, and `mohamy-smart-admin-dashboard/src/redux/settings/thunk/changeAdminPassword.ts`
- [X] T021 [US2] Replace hardcoded settings content with API-backed form state in `mohamy-smart-admin-dashboard/src/pages/settings/Settings.tsx`
- [X] T022 [US2] Add Arabic loading, validation, and submission feedback helpers to `mohamy-smart-admin-dashboard/src/utils/toastHelpers.ts`

**Checkpoint**: Admin settings work with the real profile/password contracts and no longer rely on placeholders.

---

## Phase 5: User Story 3 - Operational Inbox for Users (Priority: P2)

**Goal**: Provide persisted in-app notification retrieval and management for the authenticated account.

**Independent Test**: Use an authenticated account with seeded notifications, load the list, mark one as read, mark all as read, and delete one item while preserving ownership rules.

### Implementation for User Story 3

- [X] T023 [P] [US3] Add notification DTOs in `mohamy-smart-backend/Lawyer.Application/Dtos/Notification/NotificationDto.cs`
- [X] T024 [P] [US3] Create notification service interface in `mohamy-smart-backend/Lawyer.Application/IServices/INotificationService.cs`
- [X] T025 [US3] Normalize the `Notification` domain model in `mohamy-smart-backend/Lawyer.Core/Models/Notification.cs`
- [X] T026 [US3] Register notifications in persistence context `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`
- [X] T027 [US3] Implement notification service logic in `mohamy-smart-backend/Lawyer.Application/Services/NotificationService.cs`
- [X] T028 [US3] Expose notification endpoints in `mohamy-smart-backend/Lawyer/Controllers/NotificationController.cs`
- [X] T029 [US3] Add a notification persistence migration in `mohamy-smart-backend/Lawyer.Infrastracture/Migrations/`
- [X] T030 [P] [US3] Create admin notification thunks in `mohamy-smart-admin-dashboard/src/redux/notifications/thunk/fetchNotifications.ts`, `mohamy-smart-admin-dashboard/src/redux/notifications/thunk/markNotificationRead.ts`, `mohamy-smart-admin-dashboard/src/redux/notifications/thunk/markAllNotificationsRead.ts`, and `mohamy-smart-admin-dashboard/src/redux/notifications/thunk/deleteNotification.ts`
- [X] T031 [US3] Implement notification reducer cases in `mohamy-smart-admin-dashboard/src/redux/notifications/notificationsSlice.ts`
- [X] T032 [US3] Replace placeholder notifications UI with API-backed states in `mohamy-smart-admin-dashboard/src/pages/notifications/Notifications.tsx`

**Checkpoint**: Notification retrieval and management are fully functional and independently testable.

---

## Phase 6: User Story 4 - Contact Requests Reach the Business (Priority: P2)

**Goal**: Turn the disabled landing-page contact form into a validated, persisted submission flow.

**Independent Test**: Submit a valid contact request from the landing page and verify a success message is shown and a durable record is created for later business review.

### Implementation for User Story 4

- [X] T033 [P] [US4] Add contact request DTOs in `mohamy-smart-backend/Lawyer.Application/Dtos/Contact/ContactRequestDto.cs`
- [X] T034 [P] [US4] Create contact service interface in `mohamy-smart-backend/Lawyer.Application/IServices/IContactService.cs`
- [X] T035 [US4] Create or normalize the contact domain model in `mohamy-smart-backend/Lawyer.Core/Models/ContactRequest.cs`
- [X] T036 [US4] Register contact requests in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`
- [X] T037 [US4] Implement contact submission service in `mohamy-smart-backend/Lawyer.Application/Services/ContactService.cs`
- [X] T038 [US4] Expose the public contact submit endpoint in `mohamy-smart-backend/Lawyer/Controllers/ContactController.cs`
- [X] T039 [US4] Add a contact-request persistence migration in `mohamy-smart-backend/Lawyer.Infrastracture/Migrations/`
- [X] T040 [US4] Replace the disabled form with validated submission logic in `mohamy-smart-landing/src/components/ui/forms/ContactForm.tsx`

**Checkpoint**: Landing-page contact submissions are accepted, validated, and persisted.

---

## Phase 7: User Story 5 - Resilient Dashboard Navigation (Priority: P3)

**Goal**: Ensure dashboard crashes and unknown admin routes resolve to visible recovery screens instead of blank or broken pages.

**Independent Test**: Force a rendering error in each dashboard and navigate to an unknown admin route; verify fallback recovery and 404 behavior are visible and usable.

### Implementation for User Story 5

- [X] T041 [US5] Wrap the admin router with `ErrorBoundary` in `mohamy-smart-admin-dashboard/src/App.tsx`
- [X] T042 [US5] Wrap the lawyer router with `ErrorBoundary` in `mohamy-smart-lawyer-dashboard/src/App.tsx`
- [X] T043 [P] [US5] Create the admin 404 page in `mohamy-smart-admin-dashboard/src/pages/NotFoundPage.tsx`
- [X] T044 [US5] Add the admin fallback route to `mohamy-smart-admin-dashboard/src/router/AppRouter.tsx`

**Checkpoint**: Runtime failures and unknown admin routes no longer leave users on blank screens.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finish shared registration, dependency injection, and manual validation across the whole feature.

- [X] T045 Update backend dependency injection registration in `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`
- [X] T046 [P] Update admin app entry wiring for the new hooks/types if needed in `mohamy-smart-admin-dashboard/src/main.tsx`
- [X] T047 [P] Update quickstart verification notes with any implementation-specific follow-up in `specs/010-remaining-code-fixes/quickstart.md`
- [X] T048 Run the validation flow from `specs/010-remaining-code-fixes/quickstart.md` and record implementation notes in `specs/010-remaining-code-fixes/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 and is the recommended MVP starting point.
- **User Story 2 (Phase 4)**: Depends on Phase 2 and can begin after Phase 3 or in parallel once shared settings state is ready.
- **User Story 3 (Phase 5)**: Depends on Phase 2 and backend DI completion in Phase 8 before final verification.
- **User Story 4 (Phase 6)**: Depends on Phase 2 and backend DI completion in Phase 8 before final verification.
- **User Story 5 (Phase 7)**: Depends on Phase 2 and can run in parallel with later stories because it touches separate resilience files.
- **Polish (Phase 8)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories and should be delivered first.
- **User Story 2 (P1)**: Independent from US1 functionally, but benefits from the shared setup and validation work completed earlier.
- **User Story 3 (P2)**: Independent from US2 at the contract level; it relies only on the shared setup/foundational phase.
- **User Story 4 (P2)**: Independent from US2 and US3 beyond shared backend registration patterns.
- **User Story 5 (P3)**: Independent from the business-data stories and can be implemented once the shared `ErrorBoundary` components exist.

### Within Each User Story

- Shared types and slice scaffolding come before page integration.
- Backend DTOs and interfaces come before service implementations.
- Services come before controllers and migrations.
- Frontend thunks come before slice reducers.
- Page wiring comes after data flow and validation are in place.

### Parallel Opportunities

- T003 and T004 can run in parallel after T001 and T002.
- T006, T007, T008, T010, and T011 can run in parallel in Phase 2.
- In US1, T014 and T015 can run in parallel after T012 and T013.
- In US3, T023 and T024 can run in parallel before the service implementation, and T030 can begin once the API routes/constants are stable.
- In US4, T033 and T034 can run in parallel before the service implementation.
- In US5, T043 can run in parallel with T041 and T042.

---

## Parallel Example: User Story 3

```bash
# Backend notification scaffolding in parallel:
Task: "Add notification DTOs in mohamy-smart-backend/Lawyer.Application/Dtos/Notification/NotificationDto.cs"
Task: "Create notification service interface in mohamy-smart-backend/Lawyer.Application/IServices/INotificationService.cs"

# Frontend notification thunks after route constants are ready:
Task: "Create admin notification thunks in mohamy-smart-admin-dashboard/src/redux/notifications/thunk/fetchNotifications.ts, mohamy-smart-admin-dashboard/src/redux/notifications/thunk/markNotificationRead.ts, mohamy-smart-admin-dashboard/src/redux/notifications/thunk/markAllNotificationsRead.ts, and mohamy-smart-admin-dashboard/src/redux/notifications/thunk/deleteNotification.ts"
```

## Parallel Example: User Story 4

```bash
# Contact backend scaffolding in parallel:
Task: "Add contact request DTOs in mohamy-smart-backend/Lawyer.Application/Dtos/Contact/ContactRequestDto.cs"
Task: "Create contact service interface in mohamy-smart-backend/Lawyer.Application/IServices/IContactService.cs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate local startup safety before moving to data-flow stories.

### Incremental Delivery

1. Deliver US1 to make local development safe and deterministic.
2. Deliver US2 to remove hardcoded admin settings data.
3. Deliver US3 to restore operational notifications.
4. Deliver US4 to unlock real business lead capture.
5. Deliver US5 to finish resilience and routing polish.
6. Finish with Phase 8 validation and documentation updates.

### Cheap-Model Execution Notes

- Complete tasks in order unless a task is marked `[P]`.
- Re-read the exact listed files before editing each task.
- Do not merge multiple task IDs into one large patch.
- Finish each story checkpoint before moving to the next priority.
- Prefer creating the missing files exactly at the paths listed here instead of inventing alternatives.
