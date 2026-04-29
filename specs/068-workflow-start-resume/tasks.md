# Tasks: Reliable Workflow Start and Resume

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/068-workflow-start-resume/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Path Base**: All paths below are relative to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart`

**Tests**: Included because the specification defines mandatory independent tests for every story and the feature protects legal workflow correctness.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently after the foundational phase.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared type/test scaffolding for the workflow lifecycle implementation.

- [X] T001 Create workflow lifecycle backend test fixture helpers for active-run seeding in `mohamy-smart-backend/Lawyer.Tests/Services/WorkflowLifecycleTestFixture.cs`
- [X] T002 [P] Create frontend workflow test fixture helpers for hydrated route, Redux store, and fake job events in `apps/lawyer-dashboard/src/test/workflowTestUtils.tsx`
- [X] T003 [P] Add shared workflow lifecycle TypeScript type placeholders for run status, stage status, request status, and conflict code in `apps/lawyer-dashboard/src/types/workflowLifecycle.ts`
- [X] T004 [P] Add backend lifecycle DTO placeholders for run summary, stage summary, active request, transition request, and conflict response in `mohamy-smart-backend/Lawyer.Application/Dtos/Workflows/WorkflowLifecycleDtos.cs`
- [X] T005 [P] Add lifecycle verification checklist links to the feature quickstart in `specs/068-workflow-start-resume/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared run identity, request identity, and state contracts that every story depends on.

**Critical**: No user-story implementation should start until these tasks are complete.

- [X] T006 Add active-run identity fields `RunId`, `WorkflowType`, `StepNumber`, `StartedAt`, `CompletedAt`, and `ErrorCode` to `mohamy-smart-backend/Lawyer.Core/Models/AiJob.cs`
- [X] T007 Add `Conflict` or equivalent recoverable status to AI job status handling in `mohamy-smart-backend/Lawyer.Core/Enum/AiJobStatus.cs`
- [X] T008 Add workflow run identity, intended current stage, last completed stage, and conflict metadata to shared workflow state in `mohamy-smart-backend/Lawyer.Core/Models/WorkflowBase.cs`
- [X] T009 [P] Add lifecycle columns and indexes for `AiJobs` and shared workflow tables in `mohamy-smart-backend/Lawyer.Infrastructure/Migrations/20260429070000_AddWorkflowRunLifecycle.cs`
- [X] T010 Update EF model snapshot for lifecycle columns and indexes in `mohamy-smart-backend/Lawyer.Infrastructure/Migrations/AppDbContextModelSnapshot.cs` (depends on T006, T008, T009)
- [X] T011 Configure lifecycle fields and indexes in `mohamy-smart-backend/Lawyer.Infrastructure/Persistence/AppDbContext.cs` (depends on T006, T008)
- [X] T012 Expand AI job submit/status DTOs with `runId`, `workflowType`, `stepNumber`, `errorCode`, and conflict message fields in `mohamy-smart-backend/Lawyer.Application/Dtos/AiJobs/SubmitAiJobDto.cs` and `mohamy-smart-backend/Lawyer.Application/Dtos/AiJobs/AiJobStatusDto.cs`
- [X] T013 Define shared lifecycle service contract methods for start, resume, start-new, submit-stage, advance-stage, and conflict recovery in `mohamy-smart-backend/Lawyer.Application/IServices/IWorkflowServiceBase.cs`
- [X] T014 Define run-scoped AI job service methods for submit, lookup active job, ignore stale completion, and mark conflict in `mohamy-smart-backend/Lawyer.Application/IServices/IAiJobService.cs`
- [X] T015 Implement run-scoped duplicate prevention and stale completion checks in `mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs` (depends on T006, T012, T014)
- [X] T016 Add run identity to workflow invocation context used by background workers in `mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowInvocationContext.cs`
- [X] T017 Update workflow step request base shape to require `runId`, `stepNumber`, and `workflowType` in `mohamy-smart-backend/Lawyer.Application/Services/Workflows/RunWorkflowStepRequest.cs` (depends on T016)
- [X] T018 Update shared workflow DTO output to expose `runId`, `currentAccessibleStep`, `lastCompletedStep`, `activeRequest`, and `stageConflicts` in `mohamy-smart-backend/Lawyer.Application/Dtos/Workflows/WorkflowDto.cs`
- [X] T019 Add frontend lifecycle fields to the shared workflow slice state and reducers in `apps/lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts`
- [X] T020 Add lifecycle request/response typing to shared workflow thunks in `apps/lawyer-dashboard/src/redux/shared/createWorkflowThunks.ts`
- [X] T021 Add run-scoped AI job status typing and stale-event guards to `apps/lawyer-dashboard/src/redux/aiJobs/aiJobsSlice.ts`
- [X] T022 Update AI job submit thunk payload to include `runId`, `workflowType`, and `stepNumber` in `apps/lawyer-dashboard/src/redux/aiJobs/thunk/thunkSubmitAiJob.ts`
- [X] T023 Update AI job listing thunk to query active jobs by `caseId`, `workflowType`, and `runId` in `apps/lawyer-dashboard/src/redux/aiJobs/thunk/thunkGetAllAiJobs.ts`
- [X] T024 Add lifecycle-aware loader props for run id, stage number, recoverable conflict, and retry state in `apps/lawyer-dashboard/src/components/skeleton/SmartAnalysisLoader.tsx`

**Checkpoint**: Foundation ready. All workflow stories can now use the same run identity, active request shape, and frontend lifecycle state.

---

## Phase 3: User Story 1 - Start New Cleanly (Priority: P1) - MVP

**Goal**: "Start new" opens a clean active run at stage 1 and excludes older outputs, older active requests, and older tab access.

**Independent Test**: Complete or partially complete a workflow, choose start new for the same case, refresh immediately, and verify only the new run appears at stage 1.

### Tests for User Story 1

- [X] T025 [P] [US1] Add backend test that start-new creates a newer active run and marks prior run historical in `mohamy-smart-backend/Lawyer.Tests/Services/WorkflowLifecycleServiceTests.cs`
- [X] T026 [P] [US1] Add backend test that old AI job completion does not update a newer active run in `mohamy-smart-backend/Lawyer.Tests/Services/AiJobServiceTests.cs`
- [X] T027 [P] [US1] Add frontend reducer test that `startNew.fulfilled` clears old outputs, old active jobs, and unlocked future tabs in `apps/lawyer-dashboard/src/redux/shared/__tests__/createWorkflowSlice.lifecycle.test.ts`
- [X] T028 [P] [US1] Add frontend orchestrator test that `fresh=1` starts at step 1 after refresh in `apps/lawyer-dashboard/src/hooks/__tests__/useWorkflowOrchestrator.lifecycle.test.tsx`

### Implementation for User Story 1

- [X] T029 [US1] Implement start-new run creation and previous-run archival in `mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T013, T018)
- [X] T030 [US1] Implement legacy preparing-statement cleanup so abandoned/new runs delete old active facts, parties, subjects, requests, legal basis, and lawsuit type outputs in `mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs` (depends on T029)
- [X] T031 [US1] Add start-new controller action for shared workflow endpoints in `mohamy-smart-backend/Lawyer/Controllers/WorkflowSnapshotsController.cs` (depends on T029)
- [X] T032 [US1] Add start-new endpoint for preparing statement of claims in `mohamy-smart-backend/Lawyer/Controllers/PreparingStatementOfClaimsController.cs` (depends on T030)
- [X] T033 [US1] Wire start-new API thunk with `mode=startNew` and returned `runId` in `apps/lawyer-dashboard/src/redux/shared/createWorkflowThunks.ts` (depends on T020)
- [X] T034 [US1] Update document selection start-new click handling to route with fresh intent and no stale snapshot id in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/DocumentSelection.tsx` (depends on T033)
- [X] T035 [US1] Update workflow orchestrator fresh-session bootstrap to prefer the returned new `runId` over cached summary data in `apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts` (depends on T033)
- [X] T036 [US1] Reset selected facts and per-stage local transient state on start-new in `apps/lawyer-dashboard/src/hooks/useWorkflowFacts.ts` (depends on T035)
- [X] T037 [US1] Apply start-new clean-run behavior to preparing statement page tab gating in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` (depends on T035)
- [X] T038 [US1] Apply start-new clean-run behavior to defense memo page tab gating in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx` (depends on T035)
- [X] T039 [US1] Apply start-new clean-run behavior to appeal, ruling, warning, execution, and complaint page bootstraps in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx`, `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx`, and `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/LegalWarningPage.tsx` (depends on T035)
- [X] T040 [US1] Apply start-new clean-run behavior to execution and administrative complaint page bootstraps in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/ExecRequestPage.tsx` and `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage.tsx` (depends on T035)

**Checkpoint**: Start-new is usable as the MVP path and can be verified without implementing resume, conflict recovery, or advanced refresh behavior.

---

## Phase 4: User Story 2 - Resume Current Version Reliably (Priority: P1)

**Goal**: Resume opens the latest active run at the intended current stage with completed stages reviewable and future stages locked.

**Independent Test**: Complete stage 1, leave the workflow, resume current version, and confirm stage 2 is shown while later stages stay locked.

### Tests for User Story 2

- [X] T041 [P] [US2] Add backend test that resume returns latest active run, current accessible step, completed outputs, and locked future stages in `mohamy-smart-backend/Lawyer.Tests/Services/WorkflowLifecycleServiceTests.cs`
- [X] T042 [P] [US2] Add frontend orchestrator test that resume hydrates the saved stage instead of applying stale cached tabs in `apps/lawyer-dashboard/src/hooks/__tests__/useWorkflowOrchestrator.lifecycle.test.tsx`
- [X] T043 [P] [US2] Add frontend AI jobs slice test that resume keeps active queued or processing request attached to the same run in `apps/lawyer-dashboard/src/redux/aiJobs/__tests__/aiJobsSlice.lifecycle.test.ts`

### Implementation for User Story 2

- [X] T044 [US2] Implement resume-current service method that returns the latest active run or a safe first-stage run when none exists in `mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T029)
- [X] T045 [US2] Add resume-current controller action for shared workflows in `mohamy-smart-backend/Lawyer/Controllers/WorkflowSnapshotsController.cs` (depends on T044)
- [X] T046 [US2] Add resume-current endpoint for preparing statement of claims summary in `mohamy-smart-backend/Lawyer/Controllers/PreparingStatementOfClaimsController.cs` (depends on T030, T044)
- [X] T047 [US2] Implement resume-current thunk that preserves returned outputs and active request metadata in `apps/lawyer-dashboard/src/redux/shared/createWorkflowThunks.ts` (depends on T020, T044)
- [X] T048 [US2] Update workflow slice hydration to set `currentAccessibleStep` from backend state and never infer it from output presence alone in `apps/lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts` (depends on T047)
- [X] T049 [US2] Wire document selection resume-current action to call resume API and navigate without `fresh=1` in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/DocumentSelection.tsx` (depends on T047)
- [X] T050 [US2] Update workflow orchestrator resume bootstrap to show saved current stage and completed earlier outputs only for the active run in `apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts` (depends on T047, T048)
- [X] T051 [US2] Apply resume-current hydration to preparing statement of claims stage data in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` (depends on T050)
- [X] T052 [US2] Apply resume-current hydration to defense memo, appeal, and ruling pages in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx`, `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx`, and `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx` (depends on T050)
- [X] T053 [US2] Apply resume-current hydration to legal warning, execution request, and admin complaint pages in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/LegalWarningPage.tsx`, `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/ExecRequestPage.tsx`, and `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage.tsx` (depends on T050)

**Checkpoint**: Resume current version works independently for a saved run and does not depend on start-new UI behavior beyond shared foundation.

---

## Phase 5: User Story 3 - Stage Tabs Stay Locked Until User Action (Priority: P1)

**Goal**: Completing a stage makes that stage reviewable but does not open the next stage until the user presses the visible transition button.

**Independent Test**: Complete any stage, confirm the next tab is disabled, press the transition button, and confirm the next tab opens.

### Tests for User Story 3

- [X] T054 [P] [US3] Add backend test that saving generated output updates `lastCompletedStep` without changing `currentAccessibleStep` in `mohamy-smart-backend/Lawyer.Tests/Services/WorkflowLifecycleServiceTests.cs`
- [X] T055 [P] [US3] Add backend test that advance-stage moves `currentAccessibleStep` only when requested stage is completed for the active run in `mohamy-smart-backend/Lawyer.Tests/Services/WorkflowLifecycleServiceTests.cs`
- [X] T056 [P] [US3] Add frontend step bar test that future tabs remain disabled after output completion until advance succeeds in `apps/lawyer-dashboard/src/components/analysisWorkflow/__tests__/WorkflowStepBar.lifecycle.test.tsx`
- [X] T057 [P] [US3] Add orchestrator test that repeated transition clicks produce one advance request in `apps/lawyer-dashboard/src/hooks/__tests__/useWorkflowOrchestrator.lifecycle.test.tsx`

### Implementation for User Story 3

- [X] T058 [US3] Remove automatic `CurrentStep = stepNumber + 1` advancement from step output save behavior in `mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T054)
- [X] T059 [US3] Implement advance-stage service method that validates active run, completed current stage, and next-stage bounds in `mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T055, T058)
- [X] T060 [US3] Add advance-stage controller action for shared workflow pages in `mohamy-smart-backend/Lawyer/Controllers/WorkflowSnapshotsController.cs` (depends on T059)
- [X] T061 [US3] Add advance-stage endpoint for preparing statement of claims in `mohamy-smart-backend/Lawyer/Controllers/PreparingStatementOfClaimsController.cs` (depends on T059)
- [X] T062 [US3] Add advance-stage thunk and pending guard in `apps/lawyer-dashboard/src/redux/shared/createWorkflowThunks.ts` (depends on T060, T061)
- [X] T063 [US3] Update workflow slice reducers so output completion sets `lastCompletedStep` and advance success sets `currentAccessibleStep` in `apps/lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts` (depends on T062)
- [X] T064 [US3] Update workflow orchestrator tab guard to block future-stage clicks unless `step <= currentAccessibleStep` or the step has an active request in the active run in `apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts` (depends on T063)
- [X] T065 [US3] Update step bar disabled, selected, and completed state rendering from lifecycle fields in `apps/lawyer-dashboard/src/components/analysisWorkflow/WorkflowStepBar.tsx` (depends on T063)
- [X] T066 [US3] Wire all preparing statement transition buttons to `advanceStage` instead of direct tab mutation in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/preparingStatementOfClaims/PreparingStatementOfClaims.tsx` (depends on T064)
- [X] T067 [US3] Wire defense memo, appeal, and ruling transition buttons to `advanceStage` in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx`, `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx`, and `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/rulingAnalysis/RulingAnalysisPage.tsx` (depends on T064)
- [X] T068 [US3] Wire legal warning, execution request, and admin complaint transition buttons to `advanceStage` in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/legalWarning/LegalWarningPage.tsx`, `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/execRequest/ExecRequestPage.tsx`, and `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/adminComplaint/AdminComplaintPage.tsx` (depends on T064)

**Checkpoint**: Tabs follow the explicit transition rule and no stage opens only because output exists.

---

## Phase 6: User Story 4 - Refresh During Active Work (Priority: P2)

**Goal**: Refresh during queued or processing work restores the same run, stage, and loader without submitting duplicate work.

**Independent Test**: Start a long-running stage request, refresh before completion, and confirm the loader returns within 3 seconds and the final output appears once.

### Tests for User Story 4

- [X] T069 [P] [US4] Add backend test that active queued or processing job is returned by run-scoped lookup after refresh in `mohamy-smart-backend/Lawyer.Tests/Services/AiJobServiceTests.cs`
- [X] T070 [P] [US4] Add frontend orchestrator test that refresh hydrates loader state and does not call submit when an active job exists in `apps/lawyer-dashboard/src/hooks/__tests__/useWorkflowOrchestrator.lifecycle.test.tsx`
- [X] T071 [P] [US4] Add SignalR hook test that completion event updates only matching `runId` and `stepNumber` in `apps/lawyer-dashboard/src/hooks/__tests__/useAiJobSignalR.lifecycle.test.tsx`

### Implementation for User Story 4

- [X] T072 [US4] Implement run-scoped active job lookup endpoint behavior in `mohamy-smart-backend/Lawyer/Controllers/AiJobsController.cs` (depends on T015)
- [X] T073 [US4] Include run id and step number in AI job SignalR notifications in `mohamy-smart-backend/Lawyer/Services/AiJobNotificationService.cs` (depends on T012)
- [X] T074 [US4] Update AI job worker completion serialization to include active run identity and reject stale run completions in `mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` (depends on T015, T016)
- [X] T075 [US4] Update AI job listing thunk to reload active queued or processing jobs on workflow page mount in `apps/lawyer-dashboard/src/redux/aiJobs/thunk/thunkGetAllAiJobs.ts` (depends on T023, T072)
- [X] T076 [US4] Update workflow orchestrator mount flow to show loader when active job exists and skip automatic duplicate submit in `apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts` (depends on T075)
- [X] T077 [US4] Update SignalR hook to ignore events whose `runId`, `workflowType`, or `stepNumber` do not match the active page in `apps/lawyer-dashboard/src/hooks/useAiJobSignalR.ts` (depends on T073)
- [X] T078 [US4] Update loader component copy and retry area for queued, processing, completed-after-refresh, and failed-after-refresh states in `apps/lawyer-dashboard/src/components/skeleton/SmartAnalysisLoader.tsx` (depends on T024, T076)
- [X] T079 [US4] Persist selected facts needed for active run recovery with `runId` scoping in `apps/lawyer-dashboard/src/hooks/useWorkflowFacts.ts` (depends on T076)
- [X] T080 [US4] Serialize auto-save and manual save while a stage request is pending to avoid refresh-time duplicate writes in `apps/lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts` (depends on T076)

**Checkpoint**: Refresh during active work recovers the loader and does not duplicate AI jobs.

---

## Phase 7: User Story 5 - Start and Resume Choices Are Clear (Priority: P2)

**Goal**: Start, resume current version, and start new have distinct visible outcomes and safe labels.

**Independent Test**: Test a case with no progress, a case with current progress, and a case with historical progress; each action opens the defined state.

### Tests for User Story 5

- [X] T081 [P] [US5] Add document selection UI test for no-progress start action creating a first run at stage 1 in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/__tests__/DocumentSelection.lifecycle.test.tsx`
- [X] T082 [P] [US5] Add document selection UI test for resume-current and start-new buttons producing different navigation intents in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/__tests__/DocumentSelection.lifecycle.test.tsx`

### Implementation for User Story 5

- [X] T083 [US5] Add action availability fields `canStart`, `canResumeCurrent`, `canStartNew`, and `currentRunCreatedAt` to workflow summaries in `mohamy-smart-backend/Lawyer.Application/Dtos/Workflows/WorkflowLifecycleDtos.cs`
- [X] T084 [US5] Populate action availability fields in shared workflow summary service responses in `mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T083)
- [X] T085 [US5] Populate action availability fields in preparing statement summary responses in `mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs` (depends on T083)
- [X] T086 [US5] Update document selection cards to show distinct Arabic labels and disabled states for start, resume current version, and start new in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/DocumentSelection.tsx` (depends on T083)
- [X] T087 [US5] Add Arabic error messages for failed start, resume, and start-new actions in `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/DocumentSelection.tsx` (depends on T086)
- [X] T088 [US5] Update workflow header status text to show whether the user is in a current run, new run, or read-only historical snapshot in `apps/lawyer-dashboard/src/components/analysisWorkflow/WorkflowStepBar.tsx` (depends on T086)

**Checkpoint**: The three entry actions are visibly distinct and map to different lifecycle paths.

---

## Phase 8: User Story 6 - Recover From Step Conflicts (Priority: P2)

**Goal**: Exhausted optimistic concurrency conflicts become recoverable stage states without duplicate submission or unsafe tab unlock.

**Independent Test**: Force a stage completion conflict after automatic retries and confirm the same stage remains active with reload/retry actions and locked future stages.

### Tests for User Story 6

- [X] T089 [P] [US6] Add backend worker test that `WorkflowConcurrencyException` marks the AI job as recoverable conflict after retries are exhausted in `mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/AiJobWorkerErrorHandlingTests.cs`
- [X] T090 [P] [US6] Add backend workflow test that conflict state keeps `currentAccessibleStep` unchanged and future stages locked in `mohamy-smart-backend/Lawyer.Tests/Services/WorkflowLifecycleServiceTests.cs`
- [X] T091 [P] [US6] Add frontend reducer test that conflict response sets stage conflict and does not unlock the next tab in `apps/lawyer-dashboard/src/redux/shared/__tests__/createWorkflowSlice.lifecycle.test.ts`
- [X] T092 [P] [US6] Add frontend loader test that conflict state shows reload and explicit retry actions without auto-submit in `apps/lawyer-dashboard/src/components/skeleton/__tests__/SmartAnalysisLoader.lifecycle.test.tsx`

### Implementation for User Story 6

- [X] T093 [US6] Convert exhausted `WorkflowConcurrencyException` results into a `WorkflowStageConflict` DTO in `mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` (depends on T007, T012)
- [X] T094 [US6] Persist stage conflict metadata without applying stale output or advancing stages in `mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T093)
- [X] T095 [US6] Add reload-safe conflict recovery endpoint for shared workflows in `mohamy-smart-backend/Lawyer/Controllers/WorkflowSnapshotsController.cs` (depends on T094)
- [X] T096 [US6] Add conflict recovery endpoint for preparing statement of claims in `mohamy-smart-backend/Lawyer/Controllers/PreparingStatementOfClaimsController.cs` (depends on T094)
- [X] T097 [US6] Add conflict status mapping to AI job status responses in `mohamy-smart-backend/Lawyer/Controllers/AiJobsController.cs` (depends on T093)
- [X] T098 [US6] Add conflict reducers and recover-conflict thunk to shared workflow state in `apps/lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts` and `apps/lawyer-dashboard/src/redux/shared/createWorkflowThunks.ts` (depends on T095, T096)
- [X] T099 [US6] Update workflow orchestrator to stop auto-submit when a stage conflict exists and require user retry or reload action in `apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts` (depends on T098)
- [X] T100 [US6] Update AI job SignalR handling to route conflict completion to workflow conflict state instead of failed-generation state in `apps/lawyer-dashboard/src/hooks/useAiJobSignalR.ts` (depends on T097, T098)
- [X] T101 [US6] Add Arabic conflict recovery copy and retry/reload buttons to loader UI in `apps/lawyer-dashboard/src/components/skeleton/SmartAnalysisLoader.tsx` (depends on T099)
- [X] T102 [US6] Keep future workflow tabs disabled while conflict state is active in `apps/lawyer-dashboard/src/components/analysisWorkflow/WorkflowStepBar.tsx` (depends on T098)

**Checkpoint**: Concurrency conflicts are recoverable and cannot unlock or overwrite newer workflow state.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verify all supported workflows, clean up duplication, and document the release checks.

- [X] T103 [P] Add a shared workflow lifecycle mapping table for all supported workflow types in `specs/068-workflow-start-resume/quickstart.md`
- [X] T104 Update lifecycle behavior notes in `contracts/workflow-ui-behavior.md` with final endpoint names and UI state names
- [X] T105 Run backend lifecycle tests and record command/result notes in `specs/068-workflow-start-resume/quickstart.md`
- [X] T106 Run frontend lifecycle tests and record command/result notes in `specs/068-workflow-start-resume/quickstart.md`
- [X] T107 Run `npm run lint` and record any remaining warnings or fixes in `specs/068-workflow-start-resume/quickstart.md`
- [X] T108 Run `npm test` from repository root and record pass/fail summary in `specs/068-workflow-start-resume/quickstart.md`
- [X] T109 Manually verify start-new, resume, tab-locking, refresh loader, and conflict recovery on `http://localhost:5078` and record outcomes in `specs/068-workflow-start-resume/quickstart.md`
- [X] T110 Remove duplicated workflow lifecycle branching from workflow-specific pages after shared orchestration is complete in `apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts`, `apps/lawyer-dashboard/src/redux/shared/createWorkflowSlice.ts`, and `apps/lawyer-dashboard/src/redux/shared/createWorkflowThunks.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks every user story.
- **US1 Start New Cleanly (Phase 3)**: Depends on Foundational. This is the MVP.
- **US2 Resume Current Version (Phase 4)**: Depends on Foundational and can run after or alongside US1 once shared start/resume contracts are stable.
- **US3 Stage Tabs Stay Locked (Phase 5)**: Depends on Foundational and can run after or alongside US1/US2 once lifecycle fields exist.
- **US4 Refresh During Active Work (Phase 6)**: Depends on Foundational and benefits from US1/US2 run bootstrap behavior.
- **US5 Clear Choices (Phase 7)**: Depends on Foundational and can run after US1/US2 action endpoints exist.
- **US6 Conflict Recovery (Phase 8)**: Depends on Foundational and should land before final release validation.
- **Polish (Phase 9)**: Depends on all intended stories.

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2; delivers clean start-new MVP.
- **US2 (P1)**: Independent after Phase 2; shares DTOs/thunks with US1 but tests resume separately.
- **US3 (P1)**: Independent after Phase 2; must be validated before users rely on later-stage tabs.
- **US4 (P2)**: Depends on run-scoped jobs from Phase 2 and can be validated independently with an active request.
- **US5 (P2)**: Depends on action availability metadata but is independently testable from document selection.
- **US6 (P2)**: Depends on job conflict status and workflow conflict metadata from Phase 2.

### Within Each User Story

- Write the story tests before implementation tasks where possible.
- Backend DTO/model changes come before service changes.
- Service changes come before controller endpoints.
- Frontend thunks come before slice hydration.
- Slice hydration comes before hooks.
- Hooks come before page wiring.
- Story checkpoint must pass before relying on that story from later polish tasks.

---

## Parallel Opportunities

- T001-T005 can run in parallel except where a developer wants one test fixture style across frontend and backend.
- T009, T012, T018, T019, T020, T021, T024 can run in parallel after model decisions are clear.
- Test tasks inside each user story are marked `[P]` and can be written together.
- US1, US2, and US3 can be implemented by separate developers after Phase 2, but tasks that edit `useWorkflowOrchestrator.ts` or `createWorkflowSlice.ts` must be sequenced carefully.
- US4 and US6 can be split by backend worker/job service and frontend loader/hook work after Phase 2.

## Parallel Example: User Story 1

```bash
# Backend and frontend tests can be prepared together:
Task T025: Add backend start-new run archival test
Task T026: Add backend stale AI completion test
Task T027: Add frontend slice clean-start test
Task T028: Add frontend orchestrator fresh refresh test
```

## Parallel Example: User Story 3

```bash
# These files are independent until implementation begins:
Task T054: Backend output save does not advance current stage
Task T056: Frontend step bar disabled-state test
Task T057: Frontend repeated transition click test
```

## Parallel Example: User Story 6

```bash
# Conflict tests can be authored in parallel:
Task T089: Worker conflict status test
Task T090: Workflow conflict locking test
Task T091: Shared slice conflict reducer test
Task T092: Loader conflict recovery UI test
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1 Start New Cleanly).
3. Validate that start-new always opens stage 1 with a new run id and no previous output.
4. Stop and demo the clean-run behavior before adding resume and conflict recovery.

### Incremental Delivery

1. Ship US1 for clean start-new behavior.
2. Add US2 so returning users resume the current run safely.
3. Add US3 so completion and advancement are separate user-controlled actions.
4. Add US4 refresh recovery for queued/processing work.
5. Add US5 document selection clarity.
6. Add US6 conflict recovery before production rollout.

### Low-Cost LLM Execution Notes

- Do not infer a stage is open from output content alone; always use `currentAccessibleStep`, `lastCompletedStep`, `activeRequest`, and `runId`.
- Do not submit an AI job on mount if an active job exists for the same `caseId`, `workflowType`, `runId`, and `stepNumber`.
- Do not apply an AI job completion if its `runId` is not the current active run id.
- Do not unlock the next tab on output completion; only `advanceStage` can do that.
- Keep historical snapshots read-only and separate from active-run state.
- Keep Arabic RTL messages consistent with existing workflow copy.
