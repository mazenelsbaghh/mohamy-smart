# Tasks: Sessions and Actions Agenda

**Input**: Design documents from `/specs/019-sessions-agenda/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are optional but recommended.
**Organization**: Tasks are grouped by underlying infrastructure and individual user stories.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create `mohamy-smart-lawyer-dashboard/src/pages/agenda/` directory to hold new UI components
- [x] T002 [P] Create `mohamy-smart-backend/Lawyer.Core/Entities/Agenda/` directory to house new agenda entities

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create `Lawyer.Core/Entities/Agenda/AgendaItem.cs` base class
- [x] T004 Create `Lawyer.Core/Entities/Agenda/SessionAgendaItem.cs` and `ActionAgendaItem.cs` deriving from base class
- [x] T005 Update `Lawyer.Infrastructure/Data/ApplicationDbContext.cs` configured for EF Core TPH discriminator mapping
- [x] T006 Generate EF migration `UpdateToAgendaItems` via `make db-migrate` equivalent
- [x] T007 Initialize Redux Toolkit API endpoints in `mohamy-smart-lawyer-dashboard/src/store/api/agendaApi.ts`

**Checkpoint**: Foundation ready - Database is ready to store sessions and actions. UI api is capable of calling endpoints.

---

## Phase 3: User Story 1 - Registering a Court Session (Priority: P1) 🎯 MVP

**Goal**: Lawyers accurately record court sessions, including reasons for postponement from the previous session using dropdowns.
**Independent Test**: Ensure a new session can be fully saved and fetched accurately with its postponement reason.

### Implementation for User Story 1

- [x] T008 [US1] Build `AgendaService` in `mohamy-smart-backend/Lawyer.Application/Services/AgendaService.cs` specifically to handle Session object processing
- [x] T009 [US1] Build `AgendaController` in `mohamy-smart-backend/Lawyer/Controllers/AgendaController.cs` exposing `POST /api/Agenda` and `GET /api/Agenda/case/{caseId}`
- [x] T010 [P] [US1] Create frontend types mapping for Sessions in `mohamy-smart-lawyer-dashboard/src/types/agenda.ts`
- [x] T011 [US1] Create Zod schemas for Session forms with required conditional `postponementReason` in `mohamy-smart-lawyer-dashboard/src/pages/agenda/validations.ts`
- [x] T012 [US1] Build `SessionAgendaForm.tsx` inside `mohamy-smart-lawyer-dashboard/src/pages/agenda/components/` using `@heroui/react` Selects
- [x] T013 [US1] Build generic `AgendaList.tsx` inside `mohamy-smart-lawyer-dashboard/src/pages/agenda/components/` capable of listing sessions
- [x] T014 [US1] Replace older "Tasks" dashboard with `AgendaList` inside `mohamy-smart-lawyer-dashboard/src/pages/agenda/AgendaPage.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Registering an Action (Inspection or Execution) (Priority: P2)

**Goal**: Lawyers record specific external actions related to the case (Inspections/Executions).
**Independent Test**: Ensure the agenda view dynamically switches to Action form and displays action details sequentially alongside sessions.

### Implementation for User Story 2

- [x] T015 [US2] Update `AgendaService.cs` to correctly instantiate `ActionAgendaItem` payloads
- [x] T016 [P] [US2] Update frontend types in `mohamy-smart-lawyer-dashboard/src/types/agenda.ts` to include Action discriminator shape
- [x] T017 [P] [US2] Augment Zod schemas in `validations.ts` to include discriminated payload paths for Action payloads
- [x] T018 [US2] Build `ActionAgendaForm.tsx` utilizing `@heroui/react` Select components
- [x] T019 [US2] Update `AgendaList.tsx` component to parse both Session and Action DTOs appropriately for display
- [x] T020 [US2] Integrate `ActionAgendaForm.tsx` creation flow into the `AgendaPage` form wrapper

**Checkpoint**: At this point, User Stories 1 AND 2 should both work interchangeably depending on user type selection.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T021 [P] Rename all hardcoded locale tags representing "Tasks" in frontend configurations to "Sessions and Actions" System-wide.
- [x] T022 Clean up remaining controller operations or frontend references from the deprecated tasks system.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Sequential in priority order (P1 → P2 → P3) or parallelized per developer assignment
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2).
- **User Story 2 (P2)**: Can start after Foundational (Phase 2). Relies somewhat on `AgendaController` existing from US1.

### Parallel Opportunities

- Entities creation `T003` & `T004` can happen in parallel.
- Frontend interface declaration `T010` can happen parallel to backend service implementation.
- T016, T017 can be run parallel to T015.
