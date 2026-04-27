# Tasks: Implement AiJobWorker Cases

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/029-ai-jobs-worker/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Add backend xUnit coverage for worker routing because the feature changes queue execution behavior across 14 `AiStepType` values.

**Organization**: Tasks are grouped by user story so each workflow family can be implemented and verified independently after the shared worker helpers are in place.

---

## Phase 1: Setup

**Purpose**: Prepare the worker file and a reusable test harness for the new routing cases.

- [X] T001 Create shared worker test fixture helpers for seeding `AiJob`, `AdminComplaintWorkflow`, `LegalWarningWorkflow`, `RulingAnalysisWorkflow`, `ExecRequestWorkflow`, and mocked `Result<object>` responses in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/AiJobWorkerTestFixture.cs`
- [X] T002 Add the required DTO/service `using` directives and constructor fields for `IAdminComplaintService`, `ILegalWarningService`, `IRulingAnalysisService`, and `IExecRequestService` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs`

**Checkpoint**: The test project has a reusable worker fixture, and `AiJobWorker` is ready to accept the four new domain services.

---

## Phase 2: Foundational

**Purpose**: Add the shared worker infrastructure that every new workflow family depends on.

**⚠️ CRITICAL**: No user story work should start until these helpers exist because every new step type uses them.

- [X] T003 Add shared workflow-resolution helpers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` that load the latest workflow row by `job.CaseId` from `AdminComplaintWorkflows`, `LegalWarningWorkflows`, `RulingAnalysisWorkflows`, and `ExecRequestWorkflows` and return the `workflowId` plus `lawyerId`
- [X] T004 Add `AiStepType` to workflow-step-number mapping helpers for all 14 new enum values in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs`
- [X] T005 Add a shared worker execution helper in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` that wraps `Run*StepRequest { Input = inputJson }`, validates `Result<object>.Succeeded`, and serializes `result.Data` into `ResultJson`

**Checkpoint**: `AiJobWorker` can resolve workflow context from the database and has one common path for proxying queued steps into the domain services.

---

## Phase 3: User Story 1 - Process Legal Warning Jobs (Priority: P1) 🎯 MVP

**Goal**: Route queued legal warning steps to `ILegalWarningService.RunStepAsync` using the correct workflow row, lawyer id, and step number.

**Independent Test**: Submit queued `LegalWarningClassification`, `LegalWarningBodyDraft`, and `LegalWarningAssembly` jobs for a case that already has a `LegalWarningWorkflow`; each job reaches `Completed` or `Failed` without `NotImplementedException`.

### Implementation for User Story 1

- [X] T006 [P] [US1] Add xUnit coverage for `LegalWarningClassification`, `LegalWarningBodyDraft`, and `LegalWarningAssembly` worker routing in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/LegalWarningAiJobWorkerTests.cs`
- [X] T007 [US1] Implement `LegalWarningClassification`, `LegalWarningBodyDraft`, and `LegalWarningAssembly` cases in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` by resolving the latest `LegalWarningWorkflow`, mapping steps `1..3`, and calling `ILegalWarningService.RunStepAsync(...)` (depends on T003, T004, T005)
- [X] T008 [US1] Add missing-workflow and failed-service-result assertions for legal warning jobs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/LegalWarningAiJobWorkerTests.cs` so queued jobs persist `Failed` status and `ErrorMessage` correctly (depends on T006, T007)

**Checkpoint**: Legal warning queue jobs are fully routable and independently verifiable.

---

## Phase 4: User Story 2 - Process Admin Complaint Jobs (Priority: P1)

**Goal**: Route all five admin complaint step types through the worker into `IAdminComplaintService.RunStepAsync`.

**Independent Test**: Submit queued jobs for `AdminComplaintClassification`, `AdminComplaintFacts`, `AdminComplaintViolation`, `AdminComplaintRequests`, and `AdminComplaintAssembly`; the worker calls the admin complaint service with step numbers `1..5` and updates the queued job state.

### Implementation for User Story 2

- [X] T009 [P] [US2] Add xUnit coverage for all five `AdminComplaint*` worker cases in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/AdminComplaintAiJobWorkerTests.cs`
- [X] T010 [US2] Implement `AdminComplaintClassification`, `AdminComplaintFacts`, `AdminComplaintViolation`, `AdminComplaintRequests`, and `AdminComplaintAssembly` cases in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` using the latest `AdminComplaintWorkflow`, step numbers `1..5`, and `RunComplaintStepRequest` (depends on T003, T004, T005)
- [X] T011 [US2] Add failed-workflow-resolution and failed-result assertions for admin complaint queue jobs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/AdminComplaintAiJobWorkerTests.cs` (depends on T009, T010)

**Checkpoint**: Admin complaint queue jobs are independently functional.

---

## Phase 5: User Story 3 - Process Ruling Analysis Jobs (Priority: P1)

**Goal**: Route the four ruling analysis steps through `AiJobWorker` without falling back to `NotImplementedException`.

**Independent Test**: Submit queued `RulingAnalysisOperative`, `RulingAnalysisReasoning`, `RulingAnalysisDefectEvaluation`, and `RulingAnalysisFeasibilityReport` jobs and confirm the worker proxies them to `IRulingAnalysisService.RunStepAsync` with the correct step number and preserves job status updates.

### Implementation for User Story 3

- [X] T012 [P] [US3] Add xUnit coverage for all four `RulingAnalysis*` worker cases in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/RulingAnalysisAiJobWorkerTests.cs`
- [X] T013 [US3] Implement `RulingAnalysisOperative`, `RulingAnalysisReasoning`, `RulingAnalysisDefectEvaluation`, and `RulingAnalysisFeasibilityReport` cases in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` using the latest `RulingAnalysisWorkflow`, step numbers `1..4`, and `RunRulingStepRequest` (depends on T003, T004, T005)
- [X] T014 [US3] Add missing-workflow and failed-result assertions for ruling analysis queue jobs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/RulingAnalysisAiJobWorkerTests.cs` (depends on T012, T013)

**Checkpoint**: Ruling analysis queue jobs are independently functional.

---

## Phase 6: User Story 4 - Process Exec Request Jobs (Priority: P2)

**Goal**: Route exec request queue jobs into `IExecRequestService.RunStepAsync` with the correct workflow and step number.

**Independent Test**: Submit queued `ExecRequestClassification`, `ExecRequestDrafting`, and `ExecRequestAssembly` jobs for a case with an `ExecRequestWorkflow`; each job completes or fails cleanly and never throws because the step is unimplemented.

### Implementation for User Story 4

- [X] T015 [P] [US4] Add xUnit coverage for `ExecRequestClassification`, `ExecRequestDrafting`, and `ExecRequestAssembly` worker routing in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/ExecRequestAiJobWorkerTests.cs`
- [X] T016 [US4] Implement `ExecRequestClassification`, `ExecRequestDrafting`, and `ExecRequestAssembly` cases in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` using the latest `ExecRequestWorkflow`, step numbers `1..3`, and `RunExecStepRequest` (depends on T003, T004, T005)
- [X] T017 [US4] Add missing-workflow and failed-result assertions for exec request queue jobs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/ExecRequestAiJobWorkerTests.cs` (depends on T015, T016)

**Checkpoint**: Exec request queue jobs are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Lock down regression coverage and update the manual validation notes.

- [X] T018 [P] Add regression tests for unsupported `AiStepType` handling and `ProcessAsync` failed-status persistence in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/AiJobWorkerErrorHandlingTests.cs` (depends on T007, T010, T013, T016)
- [X] T019 [P] Update the manual validation checklist for Legal Warning, Admin Complaint, Ruling Analysis, and Exec Request queue processing in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/029-ai-jobs-worker/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2.
- **Phase 5 (US3)**: Depends on Phase 2.
- **Phase 6 (US4)**: Depends on Phase 2.
- **Phase 7 (Polish)**: Depends on all targeted user stories being complete.

### User Story Dependencies

- **US1**: Can start immediately after Phase 2 and is the suggested MVP.
- **US2**: Can start after Phase 2 and does not depend on US1.
- **US3**: Can start after Phase 2 and does not depend on US1 or US2.
- **US4**: Can start after Phase 2 and does not depend on earlier stories.

### Within Each User Story

- Add the worker routing tests first.
- Implement the new `AiJobWorker` switch cases and helper usage next.
- Finish by covering missing-workflow and failed-service-result behavior.

### Parallel Opportunities

- T006, T009, T012, and T015 can run in parallel after T001.
- T007, T010, T013, and T016 still share `/Lawyer.Application/Services/AiJobWorker.cs`, so keep them sequential or carefully batched by one owner.
- T008, T011, T014, and T017 can run in parallel after their matching implementation task completes.
- T018 and T019 can run in parallel after the story work is done.

---

## Parallel Example: User Story 1

```bash
# Legal Warning work after foundational helpers land:
Task: "Add xUnit coverage for LegalWarningClassification, LegalWarningBodyDraft, and LegalWarningAssembly worker routing in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/LegalWarningAiJobWorkerTests.cs"
Task: "Implement LegalWarningClassification, LegalWarningBodyDraft, and LegalWarningAssembly cases in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs"
```

---

## Parallel Example: User Story 2

```bash
# Admin Complaint routing and follow-up assertions:
Task: "Add xUnit coverage for all five AdminComplaint* worker cases in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/AdminComplaintAiJobWorkerTests.cs"
Task: "Implement AdminComplaintClassification, AdminComplaintFacts, AdminComplaintViolation, AdminComplaintRequests, and AdminComplaintAssembly cases in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs"
```

---

## Parallel Example: User Story 3

```bash
# Ruling Analysis coverage can be prepared while another developer owns AiJobWorker.cs:
Task: "Add xUnit coverage for all four RulingAnalysis* worker cases in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/RulingAnalysisAiJobWorkerTests.cs"
Task: "Add missing-workflow and failed-result assertions for ruling analysis queue jobs in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/RulingAnalysisAiJobWorkerTests.cs"
```

---

## Parallel Example: User Story 4

```bash
# Exec Request coverage can proceed independently from quickstart documentation:
Task: "Add xUnit coverage for ExecRequestClassification, ExecRequestDrafting, and ExecRequestAssembly worker routing in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiJobWorker/ExecRequestAiJobWorkerTests.cs"
Task: "Update the manual validation checklist for Legal Warning, Admin Complaint, Ruling Analysis, and Exec Request queue processing in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/029-ai-jobs-worker/quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3 for Legal Warning.
4. Validate queued Legal Warning jobs from submission through `Completed` or `Failed`.

### Incremental Delivery

1. Land the shared worker helpers once.
2. Deliver Legal Warning as the first proof that workflow lookup plus `RunStepAsync` proxying works.
3. Add Admin Complaint and Ruling Analysis next because both are P1.
4. Add Exec Request after the P1 flows are stable.
5. Finish with regression coverage and quickstart validation notes.

### Parallel Team Strategy

1. One developer owns `/Lawyer.Application/Services/AiJobWorker.cs`.
2. A second developer prepares story-specific test files under `/Lawyer.Tests/Services/AiJobWorker/`.
3. A third developer can update `/specs/029-ai-jobs-worker/quickstart.md` once the behavior is known.

---

## Notes

- `AiJobWorker` currently has only Smart Analysis and Lawsuit cases, so all 14 new enum values still need explicit switch coverage.
- The shared EF context already exposes `AdminComplaintWorkflows`, `LegalWarningWorkflows`, `RulingAnalysisWorkflows`, and `ExecRequestWorkflows`, which makes a backend-only worker implementation feasible.
- The queued job payload currently carries only `InputJson`, so the worker tasks intentionally reconstruct `workflowId` and `lawyerId` from the latest workflow row by `CaseId`.
- Keep unsupported step handling on the existing `NotImplementedException` path for any enum values outside the implemented set.
