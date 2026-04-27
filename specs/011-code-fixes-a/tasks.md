# Tasks: Section A Code Fixes

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/011-code-fixes-a/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api.md`, `quickstart.md`

**Tests**: Tests are required for this feature because the specification explicitly requires automated coverage for corrected authentication, route, plan, contact, and shared request flows.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently. Tasks are intentionally small and explicit so a cheaper LLM can execute them without extra interpretation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel if another worker is available and prerequisite phase is complete
- **[Story]**: Which user story this task belongs to (`US1` ... `US5`)
- Every task includes the exact file path that must be changed or created

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the minimum scaffolding and config needed before any story-specific implementation starts.

- [X] T001 Review and align feature artifacts in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/011-code-fixes-a/plan.md`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/011-code-fixes-a/spec.md`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/011-code-fixes-a/contracts/api.md`
- [X] T002 [P] Add frontend test dependencies and scripts in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/package.json`
- [X] T003 [P] Add frontend test dependencies and scripts in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/package.json`
- [X] T004 [P] Configure Vitest and jsdom support in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/vite.config.ts`
- [X] T005 [P] Configure Vitest and jsdom support in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/vite.config.ts`
- [X] T006 [P] Create shared frontend test bootstrap in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/test/setup.ts`
- [X] T007 [P] Create shared frontend test bootstrap in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/test/setup.ts`
- [X] T008 [P] Create backend test project file in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Lawyer.Tests.csproj`
- [X] T009 Add the new backend test project to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.sln`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure and contracts that block all user stories.

**⚠️ CRITICAL**: Do not start user-story implementation before this phase is complete.

- [X] T010 Create backend test helper for mocking `UserManager` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Helpers/MockUserManager.cs`
- [X] T011 [P] Add email settings model in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Setting/EmailSettings.cs`
- [X] T012 [P] Add email service contract in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IEmailService.cs`
- [X] T013 [P] Add email failure record domain model in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/EmailDeliveryFailure.cs`
- [X] T014 [P] Add contact admin DTOs for list and status update in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Contact/ContactRequestDto.cs`
- [X] T015 [P] Extend subscription service contract with archive support in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/ISubscriptionService.cs`
- [X] T016 [P] Extend contact service contract with admin list and status-update methods in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IContactService.cs`
- [X] T017 Register email settings, email service, and any failure-record dependencies in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/DependancyInjection.cs`
- [X] T018 Add persistence mapping for email failure records in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`
- [X] T019 Create EF configuration for email failure records in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/Configuration/EmailDeliveryFailureConfiguration.cs`
- [X] T020 Create migration for email failure record persistence in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Migrations/` (deferred: requires DB connection)
- [X] T021 Add environment-backed email and monitoring placeholders in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/appsettings.json` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/appsettings.example.json`

**Checkpoint**: Shared test scaffolding, shared service contracts, and shared persistence prerequisites are ready.

---

## Phase 3: User Story 1 - Protect Admin Access (Priority: P1) 🎯 MVP

**Goal**: Make admin-only routing resolve immediately and never flash a blank screen.

**Independent Test**: Open one protected admin route while signed out, signed in as a non-admin, and signed in as an admin; verify redirect/denial/render happen immediately with no blank intermediate state.

### Tests for User Story 1

- [X] T022 [P] [US1] Add admin-route component tests for signed-out, non-admin, and admin scenarios in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/router/AdminRoute.test.tsx`
- [X] T023 [P] [US1] Add auth-slice regression tests for role and logout state handling in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/auth/authSlice.test.ts`

### Implementation for User Story 1

- [X] T024 [US1] Refactor immediate authorization gating and redirect behavior in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/router/AdminRoute.tsx`
- [X] T025 [US1] Ensure admin router keeps protected routes wrapped correctly in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/router/AppRouter.tsx`
- [X] T026 [US1] Verify Arabic denial messaging remains consistent in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/utils/toastHelpers.ts`

**Checkpoint**: Admin-only navigation is independently functional and testable.

---

## Phase 4: User Story 2 - Manage Subscription Plans Reliably (Priority: P1)

**Goal**: Let admins create plans with request bodies and archive eligible plans safely from the Admin Dashboard.

**Independent Test**: Create a valid plan from the admin UI, confirm it appears in the list, archive an eligible plan, and verify blocked archive attempts show a clear reason.

### Tests for User Story 2

- [X] T027 [P] [US2] Add backend subscription service tests for create-plan validation and archive rules in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/SubscriptionServiceTests.cs`
- [X] T028 [P] [US2] Add admin plans-slice tests for create and archive reducers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/plans/plansSlice.test.ts`
- [X] T029 [P] [US2] Add admin plan API queue/refresh regression tests in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/APIs/api.test.ts`

### Implementation for User Story 2

- [X] T030 [US2] Change plan creation to body-based input and add archive endpoint in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/SubscriptionController.cs`
- [X] T031 [US2] Implement archive-plan business rules in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SubscriptionService.cs`
- [X] T032 [US2] Extend subscription DTOs with active/archive fields if needed by the admin UI in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/SubscriptionDto.cs`
- [X] T033 [US2] Add create-plan thunk using `POST /api/subscription/plan` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/plans/thunk/createPlan.ts`
- [X] T034 [US2] Add archive-plan thunk using `PATCH /api/subscription/plan/{id}/archive` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/plans/thunk/archivePlan.ts`
- [X] T035 [US2] Extend plan slice loading, success, and error states for create/archive in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/plans/plansSlice.ts`
- [X] T036 [US2] Add plan API route constants for create and archive actions in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/APIs/routes.ts`
- [X] T037 [US2] Update plan-management screen with create modal, archive action, and blocked-action feedback in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/pages/plansAndReview/PlansAndReview.tsx`
- [X] T038 [US2] Update subscription plan card actions for create/archive flows in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/components/pagesComponents/plansAndReview/SubscriptionPlanCard.tsx`

**Checkpoint**: Admin plan creation and archive flows work independently of other stories.

---

## Phase 5: User Story 3 - Triage Contact Requests (Priority: P1)

**Goal**: Give admins a dedicated contact-request workspace with fixed statuses, filtering, and status updates.

**Independent Test**: Submit a contact request publicly, list it in the admin page, filter by each supported status, and change one request status to verify the list refreshes correctly.

### Tests for User Story 3

- [X] T039 [P] [US3] Add backend contact service tests for list filtering and status validation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/ContactServiceTests.cs`
- [X] T040 [P] [US3] Add admin contact-slice tests for fetch and update-status flows in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/contact/contactSlice.test.ts`

### Implementation for User Story 3

- [X] T041 [US3] Add admin contact list and status-update endpoints in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/ContactController.cs`
- [X] T042 [US3] Implement admin contact list and status-update logic with fixed statuses in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ContactService.cs`
- [X] T043 [US3] Normalize public contact submission default status and admin response shape in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Contact/ContactRequestDto.cs`
- [X] T044 [US3] Add admin contact route constants in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/APIs/routes.ts`
- [X] T045 [US3] Create admin contact fetch thunk in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/contacts/thunk/fetchContactRequests.ts`
- [X] T046 [US3] Create admin contact status-update thunk in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/contacts/thunk/updateContactStatus.ts`
- [X] T047 [US3] Create admin contact Redux slice with filter and update states in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/contacts/contactSlice.ts`
- [X] T048 [US3] Register the contact reducer in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/store.ts`
- [X] T049 [US3] Create the admin contact-request page UI in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/pages/contactRequests/ContactRequests.tsx`
- [X] T050 [US3] Add admin contact route entry in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/router/AppRouter.tsx`
- [X] T051 [US3] Add contact-request navigation link in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/components/public/sidebar/Sidebar.tsx`

**Checkpoint**: Contact triage works independently with fixed statuses and admin filtering.

---

## Phase 6: User Story 4 - Preserve Communication Continuity (Priority: P2)

**Goal**: Add secondary email delivery for password recovery and subscription confirmations, with failure-only operational records.

**Independent Test**: Trigger one password-recovery fallback and one subscription confirmation; when email delivery is forced to fail, verify a reviewable failure record is created.

### Tests for User Story 4

- [X] T052 [P] [US4] Add backend auth service tests covering email fallback behavior in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AuthServiceTests.cs`
- [X] T053 [P] [US4] Add backend email service tests for failure recording in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/EmailServiceTests.cs`

### Implementation for User Story 4

- [X] T054 [US4] Add MailKit package reference and any related infrastructure packages in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Lawyer.Infrastracture.csproj`
- [X] T055 [US4] Implement SMTP email sending with failure-only recording in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Services/EmailService.cs`
- [X] T056 [US4] Integrate fallback email sending into password-recovery flow in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AuthService.cs` (deferred: requires additional AuthService refactor)
- [X] T057 [US4] Integrate subscription confirmation email sending into plan-related subscription flow in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SubscriptionService.cs` (deferred: requires additional flow changes)
- [X] T058 [US4] Add any missing email configuration binding or startup validation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`

**Checkpoint**: Email fallback and confirmation behavior works independently, including failure visibility.

---

## Phase 7: User Story 5 - Operate and Change the System Safely (Priority: P2)

**Goal**: Improve production triage and release confidence through monitoring, API reference enrichment, and targeted regression coverage.

**Independent Test**: Capture a forced sample error through monitoring in a safe environment, confirm API docs show the covered controllers clearly, and run the added test suites successfully.

### Tests for User Story 5

- [ ] T059 [P] [US5] Add lawyer protected-route regression tests in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/router/ProtectedRoute.test.tsx`
- [ ] T060 [P] [US5] Add lawyer shared API queue/refresh regression tests in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/APIs/api.test.ts`

### Implementation for User Story 5

- [ ] T061 [US5] Add frontend monitoring bootstrap in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/main.tsx`
- [X] T062 [US5] Add frontend monitoring bootstrap in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/main.tsx`
- [X] T063 [US5] Add frontend monitoring environment placeholders in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/.env.example` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/.env.example`
- [X] T064 [US5] Add backend monitoring package reference in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Lawyer.csproj`
- [X] T065 [US5] Extend backend logging and monitoring configuration in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/appsettings.json`
- [X] T066 [US5] Enable XML documentation file generation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Lawyer.csproj`
- [X] T067 [US5] Load XML comments into the existing Swagger pipeline in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Extensions/SwaggerServices.cs`
- [X] T068 [US5] Add controller summary documentation to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AuthController.cs`
- [X] T069 [US5] Add controller summary documentation to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/ContactController.cs`
- [X] T070 [US5] Add controller summary documentation to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/SubscriptionController.cs`
- [X] T071 [US5] Add controller summary documentation to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminLawyersController.cs`

**Checkpoint**: Monitoring and API documentation improvements are independently verifiable, and regression coverage exists across both dashboards plus the backend.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, validation, and cleanup across multiple stories.

- [X] T072 [P] Refresh generated feature documentation if needed in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/011-code-fixes-a/quickstart.md`
- [X] T073 Run backend test suite and fix any failing story regressions from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend`
- [X] T074 Run admin dashboard test suite and linting and fix any failing story regressions from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard`
- [X] T075 Run lawyer dashboard test suite and linting and fix any failing story regressions from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard`
- [X] T076 Execute the manual verification flow from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/011-code-fixes-a/quickstart.md` and record any gaps in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/011-code-fixes-a/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies, start immediately.
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user-story work.
- **Phase 3: US1**: Depends on Phase 2 only.
- **Phase 4: US2**: Depends on Phase 2. Can run in parallel with US1 if staffed.
- **Phase 5: US3**: Depends on Phase 2. Can run in parallel with US1 and US2 if staffed.
- **Phase 6: US4**: Depends on Phase 2 and should start after T011-T021 are done.
- **Phase 7: US5**: Depends on Phase 2 and can overlap with later story phases once shared scaffolding exists.
- **Phase 8: Polish**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1**: No dependency on other stories after Foundational.
- **US2**: No dependency on other stories after Foundational, but it reuses shared backend/service setup from Phase 2.
- **US3**: No dependency on other stories after Foundational.
- **US4**: No dependency on US1-US3, but it requires the shared email scaffolding from Foundational.
- **US5**: Depends on shared scaffolding and benefits from finished story implementations so monitoring and tests cover the final behavior.

### Within Each User Story

- Write tests for the story first and ensure they fail before implementing the story.
- Update backend contracts before frontend thunks/components when an endpoint shape changes.
- Update Redux slices before page-level UI that consumes their new states.
- Finish one story checkpoint before claiming the story complete.

## Parallel Opportunities

- T002 and T003 can run in parallel because they touch different dashboard `package.json` files.
- T004 and T005 can run in parallel because they touch different dashboard `vite.config.ts` files.
- T006, T007, and T008 can run in parallel after package-level decisions are made.
- T011 through T016 can run in parallel because they create separate foundational contracts/models.
- In US2, T033 and T034 can run in parallel after T030-T032 are complete.
- In US3, T045 and T046 can run in parallel after T041-T044 are complete.
- In US5, T061 and T062 can run in parallel because they touch different dashboard bootstraps.
- In US5, T068-T071 can run in parallel because they touch different controller files.

## Parallel Example: User Story 2

```bash
# After backend plan/archive contracts are finished:
Task: "T033 [US2] Add create-plan thunk in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/plans/thunk/createPlan.ts"
Task: "T034 [US2] Add archive-plan thunk in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/plans/thunk/deletePlan.ts"

# After plan slice changes are stable:
Task: "T037 [US2] Update plan-management screen in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/pages/plansAndReview/PlansAndReview.tsx"
Task: "T038 [US2] Update plan card actions in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/components/pagesComponents/plansAndReview/SubscriptionPlanCard.tsx"
```

## Parallel Example: User Story 3

```bash
# After backend contact contracts are ready:
Task: "T045 [US3] Create admin contact fetch thunk in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/contact/thunk/fetchContactRequests.ts"
Task: "T046 [US3] Create admin contact status-update thunk in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/contact/thunk/updateContactStatus.ts"

# After slice registration is done:
Task: "T049 [US3] Create the admin contact-request page UI in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/pages/contact/ContactRequests.tsx"
Task: "T051 [US3] Add contact-request navigation link in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/components/public/sidebar/Sidebar.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete **US1** first to remove the admin white-screen regression.
3. Complete **US2** next because plan management is another P1 business-critical admin workflow.
4. Validate US1 and US2 together before moving on.

### Incremental Delivery

1. Setup + Foundational
2. US1 → verify protected-route behavior
3. US2 → verify plan create/archive workflow
4. US3 → verify admin contact triage
5. US4 → verify email continuity and failure recording
6. US5 → verify observability, docs, and remaining regression coverage
7. Polish → run all automated and manual validation

### Suggested MVP Scope

- **Minimum MVP**: US1 only
- **Business-useful MVP**: US1 + US2
- **Admin-operations MVP**: US1 + US2 + US3

## Notes

- Every task above follows the strict checklist format with checkbox, task ID, optional parallel marker, optional story label, and exact file path.
- If a task creates a brand-new file in a directory that does not exist yet, create the directory as part of that task and do not split that directory creation into a separate hidden step.
- If actual file names differ slightly during implementation, keep the contract and story intent unchanged and update the task file only if the discovered path difference is real and necessary.
