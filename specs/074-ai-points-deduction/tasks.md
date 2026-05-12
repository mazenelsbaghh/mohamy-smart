# Tasks: AI Points Deduction

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/074-ai-points-deduction/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated test tasks are not included because the feature specification did not request TDD or explicit automated test creation. Manual/command validation is included in the final phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on incomplete tasks.
- **[Story]**: User story label from the feature specification.
- Every task names exact target file paths.

## Phase 1: Setup (Shared Scaffolding)

**Purpose**: Create the shared source files that later tasks will fill with point-accounting contracts and UI helpers.

- [X] T001 Create backend AI points DTO folder and `AiPointBalanceDto`, `AiChargeMetadataDto`, and `AiPointTransactionDto` records in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/AiPoints/AiPointDtos.cs
- [X] T002 [P] Create backend AI point enums `AiChargeState`, `AiRepeatIntent`, `AiPointTransactionType`, and `AiPointReasonCode` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Enum/AiPointAccountingEnums.cs
- [X] T003 [P] Create frontend AI point type definitions matching the API contract in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/aiJobs/aiPointTypes.ts
- [X] T004 [P] Create empty shared AI point UI component exports in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/aiPoints/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add persistence, service contracts, and shared API status shape required by all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Add `AiPointTransaction` domain model with lawyer, subscription, AI job, case, workflow, transaction type, points, balances, reason, Arabic message, and timestamp fields in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/AiPointTransaction.cs
- [X] T006 Update `AiJob` with `PointCost`, `ChargeState`, `ChargedPoints`, `ChargeReason`, `ChargedAt`, `IsRepeatAttempt`, `RepeatIntent`, and `ConfirmationAcceptedAt` fields in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/AiJob.cs
- [X] T007 Add `DbSet<AiPointTransaction>` and configure indexes, max lengths, relationship to `AiJob`, and unique successful charge constraint in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastructure/Persistence/AppDbContext.cs (depends on T005, T006)
- [X] T008 Add EF Core migration `AddAiPointAccounting` for `AiPointTransactions` and new `AiJobs` accounting columns in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastructure/Migrations/20260512155257_AddAiPointAccounting.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastructure/Migrations/20260512155257_AddAiPointAccounting.Designer.cs (depends on T007)
- [X] T009 Define `IAiPointAccountingService` methods for cost resolution, balance summary, availability validation, charge success, mark no-charge, restore hold, and history retrieval in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAiPointAccountingService.cs
- [X] T010 Implement `AiPointAccountingService` skeleton with constructor dependencies and method signatures returning `Result<T>` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs (depends on T009)
- [X] T011 Register `IAiPointAccountingService` in dependency injection in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs (depends on T010)
- [X] T012 Extend `SubmitAiJobDto` with `RepeatIntent` and `ConfirmationAcceptedAt` while preserving existing fields in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/AiJobs/SubmitAiJobDto.cs
- [X] T013 Extend `AiJobStatusDto` with `AiChargeMetadataDto Charge` so API and SignalR status payloads carry point state in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/AiJobs/AiJobStatusDto.cs (depends on T001)
- [X] T014 Update frontend `AiJob` and `thunkSubmitAiJob` argument types to include `charge`, `repeatIntent`, and `confirmationAcceptedAt` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/aiJobs/aiJobsSlice.ts and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/aiJobs/thunk/thunkSubmitAiJob.ts (depends on T003)

**Checkpoint**: Persistence, DTOs, and shared type shapes are ready for story implementation.

---

## Phase 3: User Story 1 - Charge Successful AI Requests (Priority: P1) MVP

**Goal**: Every successful chargeable AI request deducts the correct points exactly once.

**Independent Test**: Run a chargeable AI action with enough points, wait for completion, refresh the page, and confirm the balance decreases by the displayed cost exactly once.

### Implementation for User Story 1

- [X] T015 [US1] Implement action cost resolution returning default cost `1` for chargeable `AiStepType` values and `0` for explicitly free actions in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs (depends on T010)
- [X] T016 [US1] Implement active subscription balance summary using `LawyerSubscription.UsedAiRequests` and `Subscription.AiRequestsLimit` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs (depends on T015)
- [X] T017 [US1] Implement submit-time point availability validation and Arabic insufficient-points `Result` responses in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs (depends on T016)
- [X] T018 [US1] Inject `IAiPointAccountingService` into `AiJobService` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs (depends on T011)
- [X] T019 [US1] Update `AiJobService.SubmitAsync` to validate available points before queueing and persist `PointCost`, `ChargeState = Pending`, and repeat metadata on new or reset jobs in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs (depends on T017, T018)
- [X] T020 [US1] Implement idempotent successful charge transaction that increments `LawyerSubscription.UsedAiRequests` once per completed `AiJob.Id` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs (depends on T017)
- [X] T021 [US1] Inject `IAiPointAccountingService` into `AiJobWorker` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs (depends on T011)
- [X] T022 [US1] Call successful charge after `ExecuteStepAsync` returns usable output and before notifying completion in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs (depends on T020, T021)
- [X] T023 [US1] Update `AiJobService.ToDto` to map charge metadata and current balance into `AiJobStatusDto.Charge` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs (depends on T013, T020)
- [X] T024 [US1] Update `AiJobNotificationService.ToPayload` to include charge metadata from `AiJobStatusDto`-equivalent fields in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Services/AiJobNotificationService.cs (depends on T023)
- [X] T025 [US1] Update `useAiJobSignalR` to accept and store charge metadata from job events without dropping existing run filtering in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/hooks/useAiJobSignalR.ts (depends on T014, T024)
- [X] T026 [US1] Add `AiPointCostBadge` component showing chargeable action cost and pending-charge note in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/aiPoints/AiPointCostBadge.tsx (depends on T003)
- [X] T027 [US1] Wire `AiPointCostBadge` into `AnalysisStepShell` for chargeable AI steps without changing layout height during loading in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/analysisWorkflow/AnalysisStepShell.tsx (depends on T026)
- [X] T028 [US1] Update `useAnalysisStep` return value with `charge` and `pointCost` so pages using the hook can display successful charge state in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/hooks/useAnalysisStep.ts (depends on T014)

**Checkpoint**: User Story 1 is functional and independently testable.

---

## Phase 4: User Story 2 - Do Not Charge Failed AI Work (Priority: P1)

**Goal**: Failed, timed-out, conflicted, cancelled, stale, or invalid AI attempts never consume points and show a clear no-charge state.

**Independent Test**: Force major AI failure states and confirm the point balance is unchanged and the UI says no points were deducted.

### Implementation for User Story 2

- [X] T029 [US2] Implement `MarkNoChargeAsync` transaction creation for failed, timeout, cancelled, conflict, stale, invalid output, and blocked outcomes in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs (depends on T020)
- [X] T030 [US2] Update `AiJobWorker.PersistJobFailureAsync` to mark failed jobs as no-charge before `NotifyJobFailedAsync` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs (depends on T029)
- [X] T031 [US2] Update `AiJobWorker.PersistJobConflictAsync` to mark conflict jobs as no-charge with Arabic conflict reason in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs (depends on T029)
- [X] T032 [US2] Update `AiJobService.CancelAsync` to mark cancelled jobs as no-charge before failed notification in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs (depends on T029)
- [X] T033 [US2] Update stale-run handling to mark ignored stale jobs as no-charge instead of chargeable completion in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs (depends on T029)
- [X] T034 [US2] Update `CleanupStuckJobsAsync` to mark stuck queued/processing jobs as no-charge timeout outcomes in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs (depends on T029)
- [X] T035 [US2] Add `AiPointChargeStatus` component for `NoCharge`, `Charged`, `Restored`, and `Pending` Arabic messages in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/aiPoints/AiPointChargeStatus.tsx (depends on T003)
- [X] T036 [US2] Wire `AiPointChargeStatus` into `AnalysisStepShell` near existing error/result status so failed AI steps show no-charge feedback in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/analysisWorkflow/AnalysisStepShell.tsx (depends on T035)
- [X] T037 [US2] Update `aiJobsSlice` fulfilled handlers to preserve no-charge metadata on failed, conflict, cancel, and SignalR-upserted jobs in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/aiJobs/aiJobsSlice.ts (depends on T014)

**Checkpoint**: User Stories 1 and 2 are functional and independently testable.

---

## Phase 5: User Story 3 - Confirm Retry Or Re-run Charges (Priority: P1)

**Goal**: Retry, regenerate, re-run, and start-over actions cannot submit a new chargeable request until the lawyer accepts a clear Arabic charge confirmation.

**Independent Test**: Open every repeated AI action, decline once to confirm no request starts, then accept and confirm a successful repeated request charges once.

### Implementation for User Story 3

- [X] T038 [US3] Add backend validation that repeat attempts with `RepeatIntent` require `ConfirmationAcceptedAt` before queueing in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs (depends on T012, T019)
- [X] T039 [US3] Update `AiJobsController.Retry` to require retry intent metadata and return Arabic confirmation-required errors from service validation in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AiJobsController.cs (depends on T038)
- [X] T040 [US3] Extend frontend `thunkSubmitAiJob` to send `repeatIntent` and `confirmationAcceptedAt` in the POST body and include them in the in-flight duplicate key in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/aiJobs/thunk/thunkSubmitAiJob.ts (depends on T014)
- [X] T041 [US3] Add `AiPointConfirmDialog` with Arabic retry and regenerate copy, cost display, balance display, confirm, cancel, and submitting states in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/aiPoints/AiPointConfirmDialog.tsx (depends on T003)
- [X] T042 [US3] Export `AiPointConfirmDialog`, `AiPointCostBadge`, and `AiPointChargeStatus` from /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/aiPoints/index.ts (depends on T026, T035, T041)
- [X] T043 [US3] Update `useAnalysisStep.retry` to open confirmation before dispatching retry and submit `RetryAfterFailure` only after acceptance in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/hooks/useAnalysisStep.ts (depends on T040, T041)
- [X] T044 [US3] Add repeat confirmation props to `AnalysisStepShell` so step components can request retry/regenerate confirmation through the shared shell in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/analysisWorkflow/AnalysisStepShell.tsx (depends on T042, T043)
- [X] T045 [US3] Wire regenerate/re-run confirmation for defense memo final draft actions in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/steps/FinalNote.tsx (depends on T044)
- [X] T046 [US3] Wire retry confirmation for workflow pages using shared `UnifiedStepShell` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/analysisWorkflow/UnifiedStepShell.tsx (depends on T044)

**Checkpoint**: User Stories 1, 2, and 3 are functional and independently testable.

---

## Phase 6: User Story 4 - Block AI Requests With Insufficient Points (Priority: P2)

**Goal**: AI actions are blocked before queueing when the lawyer does not have enough available points.

**Independent Test**: Use a lawyer with zero available points, attempt an AI action, and confirm no job queues and no points are deducted.

### Implementation for User Story 4

- [X] T047 [US4] Add `GetCurrentBalanceAsync(Guid lawyerId, CancellationToken ct)` to `IAiPointAccountingService` returning `AiPointBalanceDto` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAiPointAccountingService.cs (depends on T009)
- [X] T048 [US4] Implement `GetCurrentBalanceAsync` using the active lawyer subscription with expiry handling in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs (depends on T047)
- [X] T049 [US4] Add lawyer-facing `GET /api/v1/subscription/ai-points/balance` endpoint returning `AiPointBalanceDto` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/SubscriptionController.cs (depends on T048)
- [X] T050 [US4] Add `thunkGetAiPointBalance` for the lawyer balance endpoint in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/subscription/thunk/thunkGetAiPointBalance.ts (depends on T049)
- [X] T051 [US4] Extend subscription Redux state with AI point balance, loading, and error fields in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/subscription/subscriptionSlice.ts (depends on T050)
- [X] T052 [US4] Add `AiPointBalancePill` component showing available/limit and insufficient state in Arabic in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/aiPoints/AiPointBalancePill.tsx (depends on T051)
- [X] T053 [US4] Wire insufficient-points API errors from `thunkSubmitAiJob` into Arabic toast/error text without setting the step as processing in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/hooks/useAnalysisStep.ts (depends on T040, T051)
- [X] T054 [US4] Render `AiPointBalancePill` on the subscription settings page so lawyers can see remaining AI points in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/settings/subPagesSettings/Subscription.tsx (depends on T052)

**Checkpoint**: User Story 4 is functional and independently testable without changing previous story behavior.

---

## Phase 7: User Story 5 - Show Clear Point History (Priority: P2)

**Goal**: Lawyers/admins can trace successful charges, failed no-charge attempts, and restorations for disputed AI usage.

**Independent Test**: Complete successful, failed, retried, and declined AI actions, then confirm history shows charge/no-charge/restoration outcomes with action, time, amount, and reason.

### Implementation for User Story 5

- [X] T055 [US5] Implement point transaction history query with filters by lawyer, date range, case, workflow, and transaction type in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs (depends on T029)
- [X] T056 [US5] Add point history method declaration to `IAiPointAccountingService` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAiPointAccountingService.cs (depends on T055)
- [X] T057 [US5] Add lawyer-facing `GET /api/v1/subscription/ai-points/history` endpoint in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/SubscriptionController.cs (depends on T056)
- [X] T058 [US5] Extend admin AI usage summary DTOs with point transaction totals for charged, no-charge, and restored outcomes in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/AiUsageReport/AiUsageSummaryDto.cs (depends on T055)
- [X] T059 [US5] Update `AiUsageReportService` to include point transaction totals in admin summary results without breaking existing provider cost metrics in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiUsageReportService.cs (depends on T058)
- [X] T060 [US5] Add `thunkGetAiPointHistory` for lawyer point transaction history in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/subscription/thunk/thunkGetAiPointHistory.ts (depends on T057)
- [X] T061 [US5] Add point history list state to subscription slice in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/subscription/subscriptionSlice.ts (depends on T060)
- [X] T062 [US5] Add `AiPointHistoryList` component showing time, action, transaction type, points, balance after, and Arabic reason in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/aiPoints/AiPointHistoryList.tsx (depends on T061)
- [X] T063 [US5] Render `AiPointHistoryList` in subscription settings below current plan details in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/pages/settings/subPagesSettings/Subscription.tsx (depends on T062)
- [X] T064 [US5] Update admin AI usage page summary cards to display charged and no-charge point totals in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/aiUsage/AiUsage.tsx (depends on T059)

**Checkpoint**: User Story 5 is functional and independently testable.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Remove obsolete pre-charge paths, validate end-to-end behavior, and document the final verification.

- [X] T065 Remove or bypass pre-execution point decrement from `CheckAiQuotaAttribute` so it no longer consumes points before AI success in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Filters/CheckAiQuotaAttribute.cs (depends on T019, T020)
- [X] T066 Mark `SubscriptionService.UseAiRequestAsync` as legacy pre-charge behavior and route chargeable AI job consumption through `IAiPointAccountingService` only in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SubscriptionService.cs (depends on T065)
- [X] T067 [P] Update AI point API contract notes after implementation decisions in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/074-ai-points-deduction/contracts/ai-points-api-contract.md
- [X] T068 [P] Update AI point UI contract notes after implementation decisions in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/074-ai-points-deduction/contracts/ai-points-ui-contract.md
- [X] T069 Run backend validation command `dotnet test Lawyer.Tests` and record any failures or pass notes in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/074-ai-points-deduction/quickstart.md
- [X] T070 Run lawyer dashboard validation commands `npm test` and `npm run lint` and record any failures or pass notes in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/074-ai-points-deduction/quickstart.md
- [ ] T071 Execute manual quickstart scenarios 1 through 7 and append final validation notes to /Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/074-ai-points-deduction/quickstart.md (depends on T069, T070)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and delivers the MVP charge-on-success path.
- **User Story 2 (Phase 4)**: Depends on User Story 1 because no-charge states reuse charge metadata and ledger identity.
- **User Story 3 (Phase 5)**: Depends on User Story 1 and User Story 2 because retry confirmation submits new chargeable attempts after success/failure states exist.
- **User Story 4 (Phase 6)**: Depends on Foundational and can run after or alongside US2/US3 once submit-time validation exists.
- **User Story 5 (Phase 7)**: Depends on point transactions from US1/US2.
- **Polish**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 Charge Successful AI Requests**: MVP; no dependency on other stories after Foundational.
- **US2 Do Not Charge Failed AI Work**: Depends on US1 ledger and charge metadata.
- **US3 Confirm Retry Or Re-run Charges**: Depends on US1 submit/charge and US2 failure states.
- **US4 Block AI Requests With Insufficient Points**: Depends on Foundational and US1 availability validation.
- **US5 Show Clear Point History**: Depends on US1/US2 transaction records.

### Parallel Opportunities

- T002, T003, and T004 can run in parallel after T001 starts because they touch independent backend/frontend files.
- T005, T006, T009, T012, and T014 can run in parallel after setup because they touch separate model/interface/DTO/frontend type files.
- T026 and T028 can run in parallel once frontend charge types exist.
- T030, T031, T032, T033, and T034 can be split across backend workers after T029 is complete.
- T041 and T043 can be split after T040 because the dialog and hook wiring are separate files.
- T050 and T052 can run in parallel after the balance endpoint contract is stable.
- T060 and T062 can run in parallel after the history endpoint contract is stable.

---

## Parallel Example: User Story 1

```text
Task: "Add AiPointCostBadge component showing chargeable action cost and pending-charge note in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/aiPoints/AiPointCostBadge.tsx"
Task: "Update useAnalysisStep return value with charge and pointCost so pages using the hook can display successful charge state in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/hooks/useAnalysisStep.ts"
```

## Parallel Example: User Story 2

```text
Task: "Update AiJobWorker.PersistJobFailureAsync to mark failed jobs as no-charge before NotifyJobFailedAsync in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs"
Task: "Update AiJobService.CancelAsync to mark cancelled jobs as no-charge before failed notification in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs"
```

## Parallel Example: User Story 5

```text
Task: "Add thunkGetAiPointHistory for lawyer point transaction history in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/redux/subscription/thunk/thunkGetAiPointHistory.ts"
Task: "Add AiPointHistoryList component showing time, action, transaction type, points, balance after, and Arabic reason in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard/src/components/aiPoints/AiPointHistoryList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational persistence, DTO, and service contracts.
3. Complete Phase 3 User Story 1.
4. Stop and validate that successful AI completion charges exactly once after refresh/resume.

### Incremental Delivery

1. Deliver US1 to make successful AI usage chargeable.
2. Deliver US2 to protect users from failed-request charges.
3. Deliver US3 to prevent accidental repeated charges.
4. Deliver US4 to block insufficient-balance requests before queueing.
5. Deliver US5 to make point history auditable.

### Validation Notes

- Use /Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/074-ai-points-deduction/quickstart.md as the scenario checklist.
- Do not remove unrelated existing worktree changes while implementing these tasks.
- Keep Arabic user-facing messages in the lawyer dashboard and backend result messages.
