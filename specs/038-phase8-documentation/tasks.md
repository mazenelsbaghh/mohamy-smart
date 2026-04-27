---
description: "Task list template for feature implementation"
---

# Tasks: Phase 8 Documentation & Developer Experience

**Input**: Design documents from `/specs/038-phase8-documentation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Create `Workflows` directories in `mohamy-smart-backend/Lawyer.Core/Models/` and `mohamy-smart-backend/Lawyer.Application/Services/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

*(No foundational tasks required for this documentation feature, architecture is already setup)*

---

## Phase 3: User Story 1 - Centralized Pipeline Registry (Priority: P1) 🎯 MVP

**Goal**: Manage all AI workflow pipelines in one centralized registry rather than across multiple distinct backend services.

**Independent Test**: Can verify this works by checking that adding an item to the registry compiles and is correctly formed.

### Implementation for User Story 1

- [X] T002 [P] [US1] Create `PipelineDefinition` entity in `mohamy-smart-backend/Lawyer.Core/Models/Workflows/PipelineDefinition.cs`
- [X] T003 [US1] Implement `PipelineRegistry` returning hardcoded core pipelines in `mohamy-smart-backend/Lawyer.Application/Services/Workflows/PipelineRegistry.cs` (depends on T002)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Dynamic AI Model Configuration (Priority: P2)

**Goal**: AI Model Configuration Service automatically pulls its stage definitions and pipeline metadata from the centralized registry.

**Independent Test**: API endpoint returns dynamically loaded pipeline entries matching the static registry.

### Implementation for User Story 2

- [X] T004 [US2] Update `GetStageDefinitionsAsync` to fetch and map from `PipelineRegistry.GetAll()` in `mohamy-smart-backend/Lawyer.Application/Services/AiModelConfigService.cs`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Standardized Pipeline Mappings (Priority: P3)

**Goal**: Find dedicated mapping documentation that clearly associates each phase's steps with its respective expected prompt templates.

**Independent Test**: Verification of the newly created `mapping.txt` covering 3 key phases.

### Implementation for User Story 3

- [X] T005 [P] [US3] Create developer pipeline mapping documentation in `mohamy-smart-backend/Lawyer/wwwroot/prompts/mapping.txt`

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T006 [P] Inject reference to `mapping.txt` into project README or internal docs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/README.md` (if applies)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A 
- **User Stories (Phase 3+)**: Setup phase completion
  - User stories can proceed generally in order (US1 must precede US2). US3 is independent.
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1).
- **User Story 2 (P2)**: MUST start after User Story 1 (P1) is complete, as it depends on `PipelineRegistry`.
- **User Story 3 (P3)**: Completely independent document task; can be performed in parallel anytime.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- US3 documentation can occur fully in parallel with US1 backend creation.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 3: User Story 1 (Pipeline Registry Setup)
3. **STOP and VALIDATE**: Test backend compiles.

### Incremental Delivery

1. Add User Story 1 (Registry)
2. Add User Story 2 (Linking AI Config Service)
3. Add User Story 3 (Mapping Documentation)
