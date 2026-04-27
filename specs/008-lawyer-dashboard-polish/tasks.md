# Tasks: Lawyer Dashboard Fixes and Polish

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/008-lawyer-dashboard-polish/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: The feature spec does not require TDD or new automated tests, so this task list focuses on implementation and manual verification steps that a smaller LLM can execute deterministically.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its dependencies are complete
- **[Story]**: Maps the task to a specific user story from `spec.md`
- Every task includes the exact file path to edit or create

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared types, route helpers, and feature folders before any story-specific work.

- [x] T001 Create shared frontend API route constants in `mohamy-smart-lawyer-dashboard/src/APIs/routes.ts`
- [x] T002 Create shared feature type definitions for profile, payment, documents, contracts, and chat in `mohamy-smart-lawyer-dashboard/src/types/types.ts`
- [x] T003 [P] Create backend DTO files `mohamy-smart-backend/Lawyer.Application/Dtos/Account/ProfileDto.cs`, `mohamy-smart-backend/Lawyer.Application/Dtos/Documents/DocumentRecordDto.cs`, `mohamy-smart-backend/Lawyer.Application/Dtos/Contracts/LegalContractDto.cs`, and `mohamy-smart-backend/Lawyer.Application/Dtos/SmartAnalysis/ChatDto.cs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add cross-cutting infrastructure required by all user stories.

**⚠️ CRITICAL**: Do not start user story work until these tasks are complete.

- [x] T004 Extend backend service contracts in `mohamy-smart-backend/Lawyer.Application/IServices/IAccountService.cs`, `mohamy-smart-backend/Lawyer.Application/IServices/ISmartAnalysisService.cs`, and create `mohamy-smart-backend/Lawyer.Application/IServices/IDocumentWorkspaceService.cs` plus `mohamy-smart-backend/Lawyer.Application/IServices/ILegalContractService.cs`
- [x] T005 [P] Create backend service implementations `mohamy-smart-backend/Lawyer.Application/Services/DocumentWorkspaceService.cs` and `mohamy-smart-backend/Lawyer.Application/Services/LegalContractService.cs`
- [x] T006 [P] Register the new backend services in `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`
- [x] T007 Create shared frontend async-state helpers for loading, empty, unsupported, and error rendering in `mohamy-smart-lawyer-dashboard/src/components/ui/states/AsyncState.tsx`
- [x] T008 [P] Create a dedicated settings Redux module in `mohamy-smart-lawyer-dashboard/src/redux/settings/settingsSlice.ts` and register it in `mohamy-smart-lawyer-dashboard/src/redux/store.ts`

**Checkpoint**: Shared contracts and state infrastructure are ready. User story implementation can now proceed.

---

## Phase 3: User Story 1 - Stay Signed In Reliably (Priority: P1) 🎯 MVP

**Goal**: Prevent refresh-token infinite loops and make concurrent protected requests recover once or log out cleanly.

**Independent Test**: Expire the access token during normal dashboard use and verify one successful refresh replays pending requests once, while a failed refresh signs the user out once and redirects to `/auth/login`.

### Implementation for User Story 1

- [x] T009 [US1] Refactor token helper functions and request metadata typing in `mohamy-smart-lawyer-dashboard/src/APIs/api.ts`
- [x] T010 [US1] Implement single-flight refresh queue logic and refresh-endpoint exclusion in `mohamy-smart-lawyer-dashboard/src/APIs/api.ts`
- [x] T011 [US1] Align logout behavior to clear all persisted auth state in `mohamy-smart-lawyer-dashboard/src/redux/auth/authSlice.ts`
- [x] T012 [US1] Update route protection fallback behavior to respect the new logout flow in `mohamy-smart-lawyer-dashboard/src/router/ProtectedRoute.tsx`

**Checkpoint**: Session expiry handling is stable and independently testable.

---

## Phase 4: User Story 2 - Manage Profile, Subscription, and Payment (Priority: P1)

**Goal**: Let lawyers load and update profile data, change passwords, view subscription state, and complete payment-first subscription actions from settings.

**Independent Test**: Open Settings, load profile and subscription data, submit a valid profile update, submit a password change, initiate a subscription payment, and verify the visible plan status refreshes correctly.

### Implementation for User Story 2

- [x] T013 [P] [US2] Add profile request and response DTOs plus mapping helpers in `mohamy-smart-backend/Lawyer.Application/Dtos/Account/ProfileDto.cs`
- [x] T014 [US2] Implement authenticated self-profile read and update methods in `mohamy-smart-backend/Lawyer.Application/Services/AccountService.cs`
- [x] T015 [US2] Expose `GET /api/account/profile` and `PUT /api/account/profile` in `mohamy-smart-backend/Lawyer/Controllers/AccountController.cs`
- [x] T016 [US2] Normalize payment-initiation and payment-status response fields for the lawyer dashboard in `mohamy-smart-backend/Lawyer/Controllers/PaymentController.cs` and `mohamy-smart-backend/Lawyer.Application/Services/PaymobService.cs`
- [x] T017 [P] [US2] Create settings thunks in `mohamy-smart-lawyer-dashboard/src/redux/settings/thunk/thunkGetProfile.ts`, `mohamy-smart-lawyer-dashboard/src/redux/settings/thunk/thunkUpdateProfile.ts`, and `mohamy-smart-lawyer-dashboard/src/redux/settings/thunk/thunkChangePassword.ts`
- [x] T018 [US2] Add settings reducer cases, loading flags, and form error state in `mohamy-smart-lawyer-dashboard/src/redux/settings/settingsSlice.ts`
- [x] T019 [P] [US2] Create settings form schemas in `mohamy-smart-lawyer-dashboard/src/validations/profileSchema.ts` and `mohamy-smart-lawyer-dashboard/src/validations/changePasswordSchema.ts`
- [x] T020 [US2] Replace read-only profile placeholders with API-backed editable form fields in `mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/ProfileComponent.tsx`
- [x] T021 [US2] Wire the change-password form to API-backed validation and submission in `mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/ChangePassword.tsx`
- [x] T022 [US2] Load settings tab data from the new settings slice in `mohamy-smart-lawyer-dashboard/src/pages/settings/Settings.tsx`
- [x] T023 [US2] Replace direct subscription upgrade calls with payment-initiation flow in `mohamy-smart-lawyer-dashboard/src/redux/subscription/thunk/thunkAddSubscriptionPlan.ts`
- [x] T024 [P] [US2] Create payment polling thunks in `mohamy-smart-lawyer-dashboard/src/redux/subscription/thunk/thunkGetPaymentStatus.ts` and `mohamy-smart-lawyer-dashboard/src/redux/subscription/thunk/thunkGetPaymentHistory.ts`
- [x] T025 [US2] Extend payment and subscription state handling in `mohamy-smart-lawyer-dashboard/src/redux/subscription/subscriptionSlice.ts`
- [x] T026 [US2] Update payment method selection and pending-state copy in `mohamy-smart-lawyer-dashboard/src/components/payment/PaymentModal.tsx`
- [x] T027 [US2] Connect plan selection, payment redirect/polling, and refreshed lawyer-plan UI in `mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/Subscription.tsx`

**Checkpoint**: Settings, password, subscription, and payment flows are fully usable without relying on static placeholders.

---

## Phase 5: User Story 3 - Use Dashboard Workspaces Without Dead Ends (Priority: P2)

**Goal**: Replace mock or incomplete documents, legal contracts, and chat pages with API-backed pages that always show clear resolved states.

**Independent Test**: Open Documents, Legal Contracts, and Chat under success, empty, unsupported, and service-failure conditions and verify each page remains usable and explicit.

### Implementation for User Story 3

- [ ] T028 [P] [US3] Create document and legal-contract DTOs and result envelopes in `mohamy-smart-backend/Lawyer.Application/Dtos/Documents/DocumentRecordDto.cs` and `mohamy-smart-backend/Lawyer.Application/Dtos/Contracts/LegalContractDto.cs`
- [ ] T029 [US3] Implement lawyer document workspace queries in `mohamy-smart-backend/Lawyer.Application/Services/DocumentWorkspaceService.cs`
- [ ] T030 [US3] Implement lawyer legal-contract workspace queries, including unsupported-state behavior, in `mohamy-smart-backend/Lawyer.Application/Services/LegalContractService.cs`
- [ ] T031 [US3] Add `DocumentsController` and `LegalContractsController` in `mohamy-smart-backend/Lawyer/Controllers/DocumentsController.cs` and `mohamy-smart-backend/Lawyer/Controllers/LegalContractsController.cs`
- [ ] T032 [US3] Add conversational chat DTOs and service methods in `mohamy-smart-backend/Lawyer.Application/Dtos/SmartAnalysis/ChatDto.cs` and `mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`
- [ ] T033 [US3] Expose `POST /api/smartanalysis/chat` in `mohamy-smart-backend/Lawyer/Controllers/SmartAnalysisController.cs`
- [ ] T034 [P] [US3] Create workspace Redux modules `mohamy-smart-lawyer-dashboard/src/redux/documents/documentsSlice.ts`, `mohamy-smart-lawyer-dashboard/src/redux/legalContracts/legalContractsSlice.ts`, and `mohamy-smart-lawyer-dashboard/src/redux/chat/chatSlice.ts`
- [ ] T035 [P] [US3] Create workspace thunks `mohamy-smart-lawyer-dashboard/src/redux/documents/thunk/thunkGetDocuments.ts`, `mohamy-smart-lawyer-dashboard/src/redux/legalContracts/thunk/thunkGetLegalContracts.ts`, and `mohamy-smart-lawyer-dashboard/src/redux/chat/thunk/thunkSendChatMessage.ts`
- [ ] T036 [US3] Register the new workspace reducers in `mohamy-smart-lawyer-dashboard/src/redux/store.ts`
- [ ] T037 [US3] Refactor the documents page to load persisted records and resolved UI states in `mohamy-smart-lawyer-dashboard/src/pages/Documents/Documents.tsx`
- [ ] T038 [US3] Add resolved-state styling for the documents page in `mohamy-smart-lawyer-dashboard/src/pages/Documents/Documents.css`
- [ ] T039 [US3] Replace static legal-contract table data with API-backed success/empty/unsupported states in `mohamy-smart-lawyer-dashboard/src/pages/legalContracts/LegalContracts.tsx`
- [ ] T040 [US3] Add legal-contract page styling for empty and unsupported states in `mohamy-smart-lawyer-dashboard/src/pages/legalContracts/LegalContracts.css`
- [ ] T041 [US3] Guard contract details navigation against unsupported or missing data in `mohamy-smart-lawyer-dashboard/src/pages/legalContracts/ContractDetails.tsx`
- [ ] T042 [US3] Replace local echo chat behavior with API-backed conversation state in `mohamy-smart-lawyer-dashboard/src/pages/chat/Chat.tsx`
- [ ] T043 [US3] Add loading, unavailable, and assistant-response styling in `mohamy-smart-lawyer-dashboard/src/pages/chat/Chat.css`

**Checkpoint**: Documents, legal contracts, and chat are all independently functional with explicit user-facing states.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish Arabic-first UX details, remove broken placeholders, and verify the complete phase.

- [ ] T044 [P] Replace remaining hardcoded placeholder text and raw debug output in `mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/ProfileComponent.tsx`, `mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/Subscription.tsx`, and `mohamy-smart-lawyer-dashboard/src/pages/chat/Chat.tsx`
- [ ] T045 Add consistent Arabic success, empty, unsupported, and error toast messages in `mohamy-smart-lawyer-dashboard/src/utils/toastHelpers.ts` and any newly created workspace components
- [ ] T046 Run the Phase 7 verification flow from `specs/008-lawyer-dashboard-polish/quickstart.md` and record any required follow-up fixes in `specs/008-lawyer-dashboard-polish/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** has no dependencies and starts immediately.
- **Phase 2: Foundational** depends on Phase 1 and blocks all user stories.
- **Phase 3: US1** depends on Phase 2 and should be the MVP starting point.
- **Phase 4: US2** depends on Phase 2 and can begin after US1 or in parallel once the team is confident in the new auth foundation.
- **Phase 5: US3** depends on Phase 2 and can start after the shared DTO/service registration work is complete.
- **Phase 6: Polish** depends on the completion of the desired user stories.

### User Story Dependencies

- **US1** has no dependency on other user stories and is the recommended MVP.
- **US2** does not require US3, but it benefits from the stable auth behavior delivered in US1.
- **US3** does not require US2, but it benefits from the shared async-state infrastructure from Phase 2.

### Within Each User Story

- Backend DTO and contract changes come before service implementations.
- Backend services come before controller endpoints.
- Frontend thunks and slices come before page integration.
- Page styling and polish come after functional state handling is in place.

---

## Parallel Opportunities

- T003 can run in parallel with T001 and T002.
- T005, T006, T007, and T008 can run in parallel after T004 if separate developers are available.
- In US2, T017 and T019 can run in parallel after T013-T016 are defined.
- In US3, T034 and T035 can run in parallel after T028-T033 are clear.
- In US3, T038, T040, and T043 can run in parallel after their corresponding functional page tasks begin.

---

## Parallel Example: User Story 2

```bash
# After backend profile/payment contracts are clear, launch the frontend plumbing in parallel:
Task: "Create settings thunks in mohamy-smart-lawyer-dashboard/src/redux/settings/thunk/thunkGetProfile.ts, mohamy-smart-lawyer-dashboard/src/redux/settings/thunk/thunkUpdateProfile.ts, and mohamy-smart-lawyer-dashboard/src/redux/settings/thunk/thunkChangePassword.ts"
Task: "Create settings form schemas in mohamy-smart-lawyer-dashboard/src/validations/profileSchema.ts and mohamy-smart-lawyer-dashboard/src/validations/changePasswordSchema.ts"
Task: "Create payment polling thunks in mohamy-smart-lawyer-dashboard/src/redux/subscription/thunk/thunkGetPaymentStatus.ts and mohamy-smart-lawyer-dashboard/src/redux/subscription/thunk/thunkGetPaymentHistory.ts"
```

## Parallel Example: User Story 3

```bash
# After the backend workspace contracts are defined, launch Redux scaffolding in parallel:
Task: "Create workspace Redux modules mohamy-smart-lawyer-dashboard/src/redux/documents/documentsSlice.ts, mohamy-smart-lawyer-dashboard/src/redux/legalContracts/legalContractsSlice.ts, and mohamy-smart-lawyer-dashboard/src/redux/chat/chatSlice.ts"
Task: "Create workspace thunks mohamy-smart-lawyer-dashboard/src/redux/documents/thunk/thunkGetDocuments.ts, mohamy-smart-lawyer-dashboard/src/redux/legalContracts/thunk/thunkGetLegalContracts.ts, and mohamy-smart-lawyer-dashboard/src/redux/chat/thunk/thunkSendChatMessage.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) only.
3. Validate token expiry, concurrent request replay, and logout behavior.
4. Ship or demo the auth-stability fix before broader dashboard work.

### Incremental Delivery

1. Deliver US1 to stabilize all later work.
2. Deliver US2 to unlock lawyer self-service and revenue-critical payment behavior.
3. Deliver US3 to remove dead-end workspaces and complete Phase 7.
4. Finish with Phase 6 polish and quickstart verification.

### Cheap-Model Execution Notes

- Complete tasks strictly in order unless a task is marked `[P]`.
- Do not merge multiple task IDs into one large patch.
- Re-read the referenced files before editing each task.
- Prefer creating missing files exactly at the paths named in this document instead of inventing alternatives.
- After each story checkpoint, manually verify the story before moving to the next one.

