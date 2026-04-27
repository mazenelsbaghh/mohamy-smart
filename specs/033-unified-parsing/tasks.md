# Tasks: Unified AI Parsing and Schema Validation

**Input**: Design documents from `/specs/033-unified-parsing/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(No pure boilerplate setup tasks required for this backend feature; existing infrastructure will be leveraged).*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Create `RunWorkflowStepRequest` DTO model in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/RunWorkflowStepRequest.cs
- [x] T002 [P] Create typed `StepOutputDtos` representing AI schema structures using `JsonPropertyName` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputDtos.cs
- [x] T003 Implement `StepOutputSchemas` validation mapping helper using `System.Text.Json` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/StepOutputSchemas.cs (depends on T002)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Graceful Validation of AI Responses (Priority: P1) 🎯 MVP

**Goal**: Implement strict C# schema validation for AI analysis responses to guarantee structural integrity for the frontend and isolate malformed payload failures to the service layer.

**Independent Test**: Complete a pipeline step from the frontend or Swagger without an app crash. Deliberately mis-configuring an AI return JSON will gracefully fail the step and not save corrupt text.

### Implementation for User Story 1

- [x] T004 [US1] Update base parsing methods to use `System.Text.Json` instead of `Newtonsoft` in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Common/AnalysisHelpers.cs
- [x] T005 [P] [US1] Wire typed output schemas explicitly into /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/LegalWarningService.cs (depends on T004)
- [x] T006 [P] [US1] Wire typed output schemas explicitly into /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminComplaintService.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs (depends on T004)
- [x] T007 [P] [US1] Wire typed output schemas explicitly into /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs (depends on T004)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. All existing responses correctly match system types.

---

## Phase 4: User Story 2 - Standardized Workflow Execution Inputs (Priority: P2)

**Goal**: Refactor external pipeline execution endpoints to adhere to the standardized `RunWorkflowStepRequest` contract to accelerate future external integrations.

**Independent Test**: Initiating steps on distinct legal endpoints in Swagger with the identical `{caseId, workflowId, stepNumber}` payload correctly instantiates their corresponding AI step.

### Implementation for User Story 2

- [x] T008 [P] [US2] Refactor API endpoint controllers to consume `RunWorkflowStepRequest` inside /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/RulingAnalysisController.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/LegalWarningController.cs
- [x] T009 [P] [US2] Refactor API endpoint controllers to consume `RunWorkflowStepRequest` inside /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminComplaintController.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/ExecRequestController.cs
- [x] T010 [P] [US2] Refactor API endpoint controllers to consume `RunWorkflowStepRequest` inside /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/PreparingStatementOfClaimsController.cs and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/SmartAnalysisController.cs

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T011 [P] Strip all unused `Newtonsoft.Json` usages across all classes inside `Lawyer.Application/Services/` avoiding backward compatibility crashes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel if applicable.
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Minimal dependency on US1 logic completion.

### Within Each User Story

- Models before services (e.g. Models/DTOs in Foundation block Services in US1).
- Services before endpoints (US1 happens before US2 endpoint updates logically, though US2 interface mappings can happen in parallel).
- Core implementation before integration.

### Parallel Opportunities

- Foundational tasks marked [P] can run in parallel (T001 setup and T002 output shapes are independent).
- T005, T006, T007 modifying individual services can occur entirely in parallel.
- T008, T009, T010 modifying controllers can execute in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch integration of specific pipeline services together after T004:
Task: "Wire typed output schemas explicitly into [...]RulingAnalysisService.cs and [...]LegalWarningService.cs"
Task: "Wire typed output schemas explicitly into [...]AdminComplaintService.cs and [...]ExecRequestService.cs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify that AI steps parse securely using `System.Text.Json` without dropping information.
5. Continue to standardizing the controllers for User Story 2.
