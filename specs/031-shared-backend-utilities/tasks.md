---
description: "Task list for Phase 1: Shared Backend Utilities implementation"
---

# Tasks: Phase 1: Shared Backend Utilities

**Input**: Design documents from `/specs/031-shared-backend-utilities/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

There is no complex setup since we are refactoring existing services inside an established project hierarchy.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Create `AnalysisHelpers.cs` structural skeleton in `mohamy-smart-backend/Lawyer.Application/Common/AnalysisHelpers.cs`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Unified JSON Cleaning and Validation (Priority: P1) 🎯 MVP

**Goal**: Extract and reuse all JSON parsing, validation, and deserialization helper logic across analytical services.

**Independent Test**: Can be fully tested by verifying that all 6 existing AI workflow pipelines cleanly deserialize JSON outputs without compilation failures.

### Implementation for User Story 1

- [x] T002 [US1] Add `CleanJsonResponse`, `IsValidJson`, `TryExtractJsonPayload`, and `DeserializeOutput` methods to `mohamy-smart-backend/Lawyer.Application/Common/AnalysisHelpers.cs` (depends on T001)
- [x] T003 [P] [US1] Replace local `CleanJsonResponse` usages with `AnalysisHelpers` in `mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`
- [x] T004 [P] [US1] Replace local `CleanJsonResponse` usages with `AnalysisHelpers` in `mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`
- [x] T005 [P] [US1] Replace local JSON handling methods with `AnalysisHelpers` in `mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs`
- [x] T006 [P] [US1] Replace local JSON handling methods with `AnalysisHelpers` in `mohamy-smart-backend/Lawyer.Application/Services/AdminComplaintService.cs`
- [x] T007 [P] [US1] Replace local JSON handling methods with `AnalysisHelpers` in `mohamy-smart-backend/Lawyer.Application/Services/LegalWarningService.cs`
- [x] T008 [P] [US1] Replace local JSON handling methods with `AnalysisHelpers` in `mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Uniform Case Context Construction (Priority: P2)

**Goal**: Standardize case context text generation across all LLM pipelines to feed identical core variables.

**Independent Test**: Test generated prompts in the dev environment to ensure they correctly contain complete case facts and titles.

### Implementation for User Story 2

- [x] T009 [US2] Add `BuildCaseContext` string formatting method to `mohamy-smart-backend/Lawyer.Application/Common/AnalysisHelpers.cs`
- [x] T010 [P] [US2] Delete local `BuildCaseContext` block and use helper in `mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`
- [x] T011 [P] [US2] Delete local context builder and use helper in `mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`
- [x] T012 [P] [US2] Delete local context builder and use helper in `mohamy-smart-backend/Lawyer.Application/Services/RulingAnalysisService.cs`
- [x] T013 [P] [US2] Delete local context builder and use helper in `mohamy-smart-backend/Lawyer.Application/Services/AdminComplaintService.cs`
- [x] T014 [P] [US2] Delete local context builder and use helper in `mohamy-smart-backend/Lawyer.Application/Services/LegalWarningService.cs`
- [x] T015 [P] [US2] Delete local context builder and use helper in `mohamy-smart-backend/Lawyer.Application/Services/ExecRequestService.cs`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T016 Validate .NET backend project builds completely without missing references in `mohamy-smart-backend` using `dotnet build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2). Integrates with US1 code passively but can be added independently.

### Within Each User Story

- Helper methods should be created before refactoring usage in specific domain services.

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All service component usages marked [P] (T003-T008, T010-T015) can be refactored concurrently once the helper method exists.

---

## Parallel Example: User Story 1

```bash
# Refactor multiple services to rely on extracting JSON at once
Task: "Replace local CleanJsonResponse usages with AnalysisHelpers in SmartAnalysisService"
Task: "Replace local CleanJsonResponse usages with AnalysisHelpers in LegalWarningService"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2: Structural backbone
2. Complete Phase 3: User Story 1
3. **STOP and VALIDATE**: Verify backend cleanly deserializes without the local duplicated blocks.
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Verify backend compiles and endpoints don't crash
3. Add User Story 2 → Verify backend still has complete case context outputs using the single consolidated pipeline.
