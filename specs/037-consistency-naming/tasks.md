# Execution Tasks: Consistency & Naming Fixes

**Feature Branch:** `037-consistency-naming`
**Generated:** 2026-04-11

## Phase 1: Setup

*(No project initialization tasks needed for this architectural refactoring.)*

## Phase 2: Foundational

*(No foundational blockers identified. All consistency improvements map to independent architectural user stories.)*

## Phase 3: User Story 1 - Centralized Security Validation
**Goal:** Create and adopt a single explicit application-level service to securely validate lawyer ownership of cases across all components.
**Independent Test:** Accessing an analytical process via `AdminComplaintController` utilizing an invalid lawyer ID returns a structured 403 response managed by the new singleton.

- [ ] T001 [US1] Create validation interface `ICaseAccessValidator.cs` defining `ValidateAsync` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/ICaseAccessValidator.cs`
- [ ] T002 [US1] Implement `CaseAccessValidator` using `IUnitOfWork` inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/CaseAccessValidator.cs` (depends on T001)
- [ ] T003 [US1] Register `ICaseAccessValidator` dependency injection inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs` (or standard DependencyInjection configuration file) (depends on T002)
- [ ] T004 [US1] Replace direct repository validation in `StartWorkflowBaseAsync`, `RunStepBaseAsync`, and `SaveEditedStepAsync` with injected `_caseAccessValidator` inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T003)
- [ ] T005 [P] [US1] Refactor direct case authorization checks with `_caseAccessValidator` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs` (depends on T003)

## Phase 4: User Story 2 - Uniform Error Communication & Architecture
**Goal:** Standardize controllers to solely use `IUnitOfWork` for data, and the `ApiExceptionResponse` mechanism for consistent frontend HTTP consumption.
**Independent Test:** Invoking a bad API state in `AdminComplaintController` issues identical nested `succeeded`, `data`, and `message` payloads matching `Result<T>`.

- [ ] T006 [P] [US2] Update `AdminComplaintController` ensuring structural mapping explicitly handles error results consistently natively in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminComplaintController.cs`
- [ ] T007 [P] [US2] Ensure all underlying DB context usage relies purely on analytical abstractions via `IUnitOfWork` and not generic raw contexts in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/SmartAnalysisController.cs`

## Phase 5: User Story 3 - Universal Workflow Cancellation
**Goal:** Expose the pre-existing base `AbandonWorkflowAsync` logic natively via controller endpoints across all modules.
**Independent Test:** Completing a POST request to `/api/RulingAnalysis/abandon/1` successfully transitions its workflow database status state to `Abandoned`.

- [ ] T008 [P] [US3] Implement `POST /abandon/{id}` endpoint calling base service abandon logic natively inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminComplaintController.cs`
- [ ] T009 [P] [US3] Implement `POST /abandon/{id}` endpoint calling base service abandon logic natively inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AppealBriefController.cs`
- [ ] T010 [P] [US3] Implement `POST /abandon/{id}` endpoint calling base service abandon logic natively inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/ExecRequestController.cs`
- [ ] T011 [P] [US3] Implement `POST /abandon/{id}` endpoint calling base service abandon logic natively inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/LegalWarningController.cs`
- [ ] T012 [P] [US3] Implement `POST /abandon/{id}` endpoint calling base service abandon logic natively inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/PreparingStatementOfClaimsController.cs`
- [ ] T013 [P] [US3] Implement `POST /abandon/{id}` endpoint calling base service abandon logic natively inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/RulingAnalysisController.cs`
- [ ] T014 [P] [US3] Implement `POST /abandon/{id}` endpoint calling explicit abandon logic mechanism natively inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/SmartAnalysisController.cs`

## Phase 6: User Story 4 - Codebase Standardization (Frontend Documentation)
**Goal:** Increase contextual understanding of data handoffs between components for upcoming developers.
**Independent Test:** Reviewing the raw codebase files reveals clear explanation linking the features natively without reliance on external specs.

- [ ] T015 [US4] Add technical documentation comments clarifying analytical mapping structures and state handoffs natively inside `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/cases/subPagesCases/analysis/defenseMemoPage/DefenseMemoPage.tsx`

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T016 Run backend build validation command via `dotnet build` within the backend directory.
- [ ] T017 Execute a local test compilation pass ensuring no breaking backend injection configurations in local development.

---

## Dependencies

- Phase 3 (US1) is strictly sequential between steps T001 → T002 → T003. Once T003 registers the new validation class, replacing its actual usage via T004 & T005 may occur simultaneously across the differing logic layers in a safe manner.

## Implementation Strategy

**Minimum Viable Product (MVP)**
- Execute and merge Phase 3 (`ICaseAccessValidator` abstraction). Establishing the centralized role-based authorization baseline resolves the highest priority architectural vulnerability without interrupting existing workflow logic patterns.

**Parallel Execution Guidelines**
- Tasks T006 to T014 map independently to fully disparate backend analytical api controllers. This grants significant flexibility enabling an automated agent to implement them entirely in parallel or synchronously depending upon batch request capabilities.
- The UI mapping documentation update (T015) can occur purely out of sequence without blocking structural backend features.
