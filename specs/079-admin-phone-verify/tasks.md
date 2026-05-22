# Tasks: Admin Phone Verification Override

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/079-admin-phone-verify/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No separate test-first tasks were requested. Existing backend/admin checks will be run during validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing feature boundary and avoid broad setup churn.

- [x] T001 Verify the existing admin lawyer detail boundary in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminLawyersController.cs` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the durable audit model and shared DTO contract needed by all stories.

- [x] T002 Add `ManualPhoneVerificationAudit` entity with target user, admin actor, phone number, and reason fields in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/ManualPhoneVerificationAudit.cs`
- [x] T003 Register `ManualPhoneVerificationAudits` DbSet and EF mapping with user/admin relationships and length limits in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastructure/Persistence/AppDbContext.cs`
- [x] T004 Create EF Core migration for `ManualPhoneVerificationAudits` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastructure/Migrations/`
- [x] T005 Add request/summary DTOs for manual phone verification in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Lawyers/AdminLawyerDetailDto.cs`
- [x] T006 Add service contract methods for manual phone verification in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAdminLawyerService.cs`

**Checkpoint**: Foundation ready. User story implementation can begin.

---

## Phase 3: User Story 1 - Verify a User Phone Manually (Priority: P1) MVP

**Goal**: Admin can manually verify an unverified phone from the lawyer detail page after entering a reason.

**Independent Test**: Open an unverified lawyer, submit a reason, confirm the phone becomes verified and the action is no longer available.

### Implementation for User Story 1

- [x] T007 [US1] Inject `IUserContextProvider` into `AdminLawyerService` for actor identification in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminLawyerService.cs`
- [x] T008 [US1] Implement `VerifyPhoneManuallyAsync` validation and transactional user/audit update in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminLawyerService.cs` (depends on T002, T005, T006, T007)
- [x] T009 [US1] Add `PATCH /api/v1/lawyers/{id}/phone-verification` action in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminLawyersController.cs` (depends on T008)
- [x] T010 [US1] Add `verifyLawyerPhoneManually` async thunk calling `PATCH /lawyers/{id}/phone-verification` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/lawyers/thunk/verifyLawyerPhoneManually.ts`
- [x] T011 [US1] Add manual phone verification pending/success/error handling to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/lawyers/lawyersSlice.ts` (depends on T010)
- [x] T012 [US1] Add manual phone verification types to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/lawyers/thunk/fetchLawyers.ts` (depends on T005)
- [x] T013 [US1] Add an Arabic inline verification panel with reason textarea, confirm button, loading state, disabled already-verified state, and validation message in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx` (depends on T010, T011, T012)

**Checkpoint**: User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Preserve an Audit Trail (Priority: P2)

**Goal**: Admin can see the latest manual verification audit details after the action and on reload.

**Independent Test**: Verify a phone manually, reload the lawyer detail page, and confirm actor, timestamp, phone, and reason are visible.

### Implementation for User Story 2

- [x] T014 [US2] Query latest manual phone verification audit in `GetLawyerDetailAsync` and map it into the detail DTO in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminLawyerService.cs` (depends on T002, T005)
- [x] T015 [US2] Return latest manual verification audit summary from `VerifyPhoneManuallyAsync` response in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminLawyerService.cs` (depends on T008, T014)
- [x] T016 [US2] Render the latest manual phone verification audit details in Arabic in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx` (depends on T012, T014, T015)

**Checkpoint**: User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Reject Unauthorized Overrides (Priority: P3)

**Goal**: Unauthorized users cannot manually verify phone numbers.

**Independent Test**: Attempt the request without an admin session and confirm the backend rejects it without changing the user.

### Implementation for User Story 3

- [x] T017 [US3] Confirm the new phone verification controller action remains under `[Authorize(Roles = "Admin")]` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminLawyersController.cs`
- [x] T018 [US3] Add service-level admin actor guard using `IUserContextProvider` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminLawyerService.cs` (depends on T007)
- [x] T019 [US3] Ensure the admin UI exposes the verification panel only inside the existing protected lawyer detail route in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/router/AppRouter.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx`

**Checkpoint**: All user stories should now be independently functional.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validate behavior, update documentation, and keep generated artifacts synchronized.

- [x] T020 Update quickstart validation notes for the implemented admin flow in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/079-admin-phone-verify/quickstart.md`
- [x] T021 Run backend build/tests for the changed backend projects from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/`
- [x] T022 Run admin dashboard lint/build checks from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/`
- [x] T023 Mark completed tasks in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/079-admin-phone-verify/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on Foundational and reuses the audit created by US1.
- **User Story 3 (Phase 5)**: Depends on Foundational and shares the same service/controller boundary.
- **Polish**: Depends on completed user stories.

### User Story Dependencies

- **US1**: MVP, can ship after Foundation.
- **US2**: Uses the audit table from Foundation and the response shape from US1.
- **US3**: Strengthens the same endpoint and route boundary used by US1.

### Parallel Opportunities

- T002 and T005 can be drafted in parallel because they touch different layers.
- T010 and T012 can be drafted in parallel after backend contract shape is known.
- T014 and T016 must be sequential because UI display depends on the detail DTO shape.

## Implementation Strategy

### MVP First

1. Complete T001-T006.
2. Complete T007-T013.
3. Validate an admin can manually verify an unverified phone with a reason.

### Incremental Delivery

1. Add durable audit visibility with T014-T016.
2. Confirm authorization boundaries with T017-T019.
3. Run validation and update tasks with T020-T023.
