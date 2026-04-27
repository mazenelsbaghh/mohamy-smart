---

description: "Task list template for feature implementation"
---

# Tasks: Generic Workflow Infrastructure

**Input**: Design documents from `/specs/032-generic-workflow-infrastructure/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file path(s) in descriptions
- Keep each task small enough for a low-cost LLM to execute without architectural guesswork
- Prefer one artifact per task; if needed, keep to at most 3 explicit file paths
- Use concrete verbs such as `Add`, `Implement`, `Wire`, `Update`, `Create`, `Validate`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create `Workflows` directory for shared base logic in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/`
- [X] T002 Create unified `AnalysisHelpers` class for shared string manipulation and deserialization in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Common/AnalysisHelpers.cs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Implement `WorkflowBase.cs` abstract domain model mapping context requirements in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/WorkflowBase.cs`
- [X] T004 [P] Implement `WorkflowInvocationContext` wrapper holding workflow metadata in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowInvocationContext.cs`
- [X] T005 Implement `WorkflowServiceBase<TWorkflow, TDto>` handling standard initialization and step processing in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` (depends on T003, T004, T002)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add New AI Analysis Pipeline (Priority: P1) 🎯 MVP

**Goal**: Convert existing specific AI APIs to seamlessly map from the generic inheritance instead of duplicating code.

**Independent Test**: Starting an existing AI analysis (e.g., Ruling Analysis) successfully initiates the pipeline.

### Implementation for User Story 1

- [X] T006 [P] [US1] Update `RulingAnalysisWorkflow` entity to inherit `WorkflowBase` and implement virtual storage sets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/RulingAnalysisWorkflow.cs`
- [X] T007 [P] [US1] Update `LegalWarningWorkflow` entity to inherit `WorkflowBase` and implement virtual storage sets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/LegalWarningWorkflow.cs`
- [X] T008 [P] [US1] Update `AdminComplaintWorkflow` entity to inherit `WorkflowBase` and implement virtual storage sets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/AdminComplaintWorkflow.cs`
- [X] T009 [US1] Refactor `RulingAnalysisService.cs` to eliminate duplicate workflow logic by relying entirely on `WorkflowServiceBase` inheritance in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs` (depends on T005, T006)
- [X] T010 [US1] Refactor `LegalWarningService.cs` to eliminate duplicate workflow logic by relying entirely on `WorkflowServiceBase` inheritance in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalWarningService.cs` (depends on T005, T007)
- [X] T011 [US1] Refactor `AdminComplaintService.cs` to eliminate duplicate workflow logic by relying entirely on `WorkflowServiceBase` inheritance in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminComplaintService.cs` (depends on T005, T008)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Process AI Jobs Reliably (Priority: P2)

**Goal**: Resolve workflows dynamically in the background agent without 5 copies of the exact same algorithm.

**Independent Test**: Polling tasks execute accurately under the unified context resolver without crashing due to duplicate key exceptions.

### Implementation for User Story 2

- [X] T012 [P] [US2] Implement `ResolveLatestWorkflowAsync<TWorkflow>` generic utility method in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs`
- [X] T013 [US2] Transition 5 distinct execution queues in `AiJobWorker.cs` to process exclusively through `ResolveLatestWorkflowAsync` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiJobWorker.cs` (depends on T012)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup obsolete code and verify parsing behavior

- [X] T014 Remove legacy hard-coded prompts and parse validation logic natively from UI API adapters in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AiAnalysisController.cs`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - independently testable

### Parallel Opportunities

- T003 and T004 (Foundational domain classes) can be written simultaneously.
- Entity mappings (T006, T007, T008) can be run concurrently.
- Service refactoring constraints (T009, T010, T011) can be run concurrently.
