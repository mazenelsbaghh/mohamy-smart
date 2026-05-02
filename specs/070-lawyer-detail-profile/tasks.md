# Tasks: Lawyer Detail Profile

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/070-lawyer-detail-profile/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/admin-lawyer-detail-api.md, quickstart.md

**Tests**: Include focused backend service coverage because the feature changes an admin data contract. Frontend validation uses type-check, lint, and browser smoke review.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify repository support files before implementation.

- [X] T001 Verify `.gitignore` contains Node and .NET build artifacts in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contract and typing needed before page implementation.

- [X] T002 Add admin lawyer detail response DTOs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Lawyers/AdminLawyerDetailDto.cs`
- [X] T003 Add `GetLawyerDetailAsync(Guid userId, CancellationToken)` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAdminLawyerService.cs`
- [X] T004 Add `TLawyerDetail` and nested detail types while preserving `TUser` list fields in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/lawyers/thunk/fetchLawyers.ts`

**Checkpoint**: Contract and frontend types are ready for story work.

---

## Phase 3: User Story 1 - View a Complete Lawyer Profile (Priority: P1) MVP

**Goal**: Admin sees a complete profile with identity, contact, professional, account, subscription, and activity basics in one coherent page.

**Independent Test**: Open `/lawyers/:id` for an existing lawyer and verify profile header, account data, professional data, subscription summary, and neutral placeholders all render without blank input fields.

### Tests for User Story 1

- [X] T005 [P] [US1] Add service tests for successful detail aggregation and missing lawyer profile errors in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AdminLawyerServiceTests.cs`

### Implementation for User Story 1

- [X] T006 [US1] Implement `GetLawyerDetailAsync` aggregation for user, lawyer, current subscription, base counts, and bounded recent lists in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminLawyerService.cs` (depends on T002, T003, T005)
- [X] T007 [US1] Wire `GET /api/v1/lawyers/{id}` to `IAdminLawyerService.GetLawyerDetailAsync` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminLawyersController.cs` (depends on T006)
- [X] T008 [US1] Update `fetchLawyerById` to return `TLawyerDetail` from `/lawyers/{id}` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/lawyers/thunk/fetchLawyerById.ts` (depends on T004)
- [X] T009 [US1] Update `selectedLawyer` state to store `TLawyerDetail` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/lawyers/lawyersSlice.ts` (depends on T008)
- [X] T010 [US1] Replace disabled-input layout with an RTL profile header, status chips, detail sections, and loading/error/not-found states in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx` (depends on T009)

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Inspect Operational Signals Quickly (Priority: P2)

**Goal**: Admin can scan account health, workload, subscription, reviews, and AI usage through compact visual summaries.

**Independent Test**: Open profiles with active/suspended, subscribed/expired, and no-activity states and verify the summary cards communicate state within seconds.

### Implementation for User Story 2

- [X] T011 [US2] Add operational metric cards for cases, clients, powers of attorney, reviews, AI calls, tokens, and estimated cost in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx` (depends on T010)
- [X] T012 [US2] Add recent cases, subscriptions, reviews, and AI usage sections with Arabic empty states in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx` (depends on T011)
- [X] T013 [US2] Add responsive wrapping and long-text resilience for the lawyer detail grid in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx` (depends on T012)

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Navigate to Related Admin Workflows (Priority: P3)

**Goal**: Admin has clear next steps from the detail profile without losing selected context.

**Independent Test**: From a loaded lawyer detail page, return to the lawyer list and open related AI usage when a lawyer profile ID exists.

### Implementation for User Story 3

- [X] T014 [US3] Add back-to-list and related AI usage actions in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx` (depends on T010)
- [X] T015 [US3] Hide or disable related workflow actions when `lawyerId` is missing in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx` (depends on T014)

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate implementation and finish Spec Kit execution.

- [X] T016 Run focused backend tests for lawyer detail service with `dotnet test /Users/mazenelsbagh/mazen\ mac/apps/mohamy\ smart/mohamy-smart-backend/Lawyer.Tests/Lawyer.Tests.csproj --filter AdminLawyerServiceTests`
- [X] T017 Run admin dashboard type-check with `npm run type-check -w @mohamy/admin-dashboard`
- [X] T018 Run admin dashboard lint with `npm run lint -w @mohamy/admin-dashboard`
- [X] T019 Start or reuse the admin dashboard dev server on port 5079 and smoke-check `/lawyers/:id` visually from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard`
- [X] T020 Mark all completed tasks `[X]` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/070-lawyer-detail-profile/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and delivers the MVP.
- **User Story 2 (Phase 4)**: Depends on User Story 1 page structure.
- **User Story 3 (Phase 5)**: Depends on User Story 1 page structure.
- **Polish (Phase 6)**: Depends on selected stories being implemented.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational.
- **User Story 2 (P2)**: Starts after the profile page shell from US1.
- **User Story 3 (P3)**: Starts after the profile page shell from US1.

### Parallel Opportunities

- T005 can be written while frontend typing tasks are reviewed.
- US2 and US3 page additions can be handled in separate passes after T010.
- Validation tasks T016, T017, and T018 can run independently after implementation.

---

## Parallel Example: User Story 1

```bash
Task: "Add service tests for successful detail aggregation and missing lawyer profile errors in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AdminLawyerServiceTests.cs"
Task: "Update fetchLawyerById to return TLawyerDetail from /lawyers/{id} in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/lawyers/thunk/fetchLawyerById.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete T001-T004.
2. Complete T005-T010.
3. Validate that a lawyer detail page renders complete profile data with placeholders.

### Incremental Delivery

1. Add operational cards and recent activity (US2).
2. Add related workflow actions (US3).
3. Run backend tests, frontend type-check/lint, and browser smoke review.
