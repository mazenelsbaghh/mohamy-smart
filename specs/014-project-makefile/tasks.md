# Tasks: Project Operations Command Surface

**Input**: Design documents from `/specs/014-project-makefile/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/command-surface.md, quickstart.md

**Tests**: The feature specification does not require TDD-first automated tests. This task list includes executable command-validation tasks instead of new test-suite tasks so implementation remains straightforward for a lower-cost LLM.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation. Because most implementation work touches the same root `Makefile`, this plan intentionally minimizes parallel tasks to reduce merge conflicts and execution ambiguity.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2, US3)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the root operational surface and align documentation targets before feature work begins.

- [x] T001 Create the initial root command scaffold with shared variables, `.DEFAULT_GOAL`, and `.PHONY` sections in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T002 Add repository-specific command constants for Compose files, env files, backend path, dashboard paths, and SQL container name in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T003 [P] Add the final command names, prerequisites, and expected outputs to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/014-project-makefile/contracts/command-surface.md` so implementation has a normative reference

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the reusable command helpers and safety rules that all user stories depend on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T004 Implement the `help` target and self-documenting target descriptions in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T005 Implement reusable shell guards that fail fast when `.env.docker` or `.env.docker.prod` is missing in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T006 Implement reusable success-message helpers for canonical local endpoints and stack status output in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T007 Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/014-project-makefile/quickstart.md` so the setup and daily-flow sections reference the same env files and command categories defined in the Makefile

**Checkpoint**: Root command helpers, help output, env guards, and shared messaging are ready.

---

## Phase 3: User Story 1 - Start and stop the development stack consistently (Priority: P1) 🎯 MVP

**Goal**: Give developers one reliable entry point for starting, inspecting, rebuilding, logging, and stopping the full local stack, plus production-oriented lifecycle control.

**Independent Test**: From the repository root, a developer can run help, start the development stack, see canonical endpoints, inspect status/logs, stop it safely, and run the production-oriented lifecycle commands with missing-env validation.

### Implementation for User Story 1

- [x] T008 [US1] Implement the `dev` target that starts the full local stack and prints canonical endpoints in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T009 [US1] Implement the `down`, `logs`, `ps`, and `build` development lifecycle targets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T010 [US1] Implement the `prod`, `prod-down`, `prod-logs`, and `prod-build` production-oriented lifecycle targets with `.env.docker.prod` validation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T011 [P] [US1] Update the daily development and production workflow guidance to match the lifecycle targets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`
- [x] T012 [US1] Validate User Story 1 by executing the documented lifecycle commands and recording any command or message adjustments back into `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`

**Checkpoint**: User Story 1 is independently functional from the repository root.

---

## Phase 4: User Story 2 - Operate specific services and database workflows (Priority: P2)

**Goal**: Let maintainers run focused service targets and database commands without building raw Docker or EF Core commands manually.

**Independent Test**: A maintainer can start backend-only or single-surface workflows, open the SQL shell, apply migrations, and create a migration with a required name from the root command surface.

### Implementation for User Story 2

- [x] T013 [US2] Implement the `backend`, `lawyer`, `admin`, and `landing` service-scoped startup targets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T014 [US2] Implement the `db-shell` target that opens the local SQL shell using credentials sourced from `.env.docker` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T015 [US2] Implement the `migrate` target that runs existing EF Core migrations from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend` through `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T016 [US2] Implement the `migrate-add` target with required `NAME` validation and corrective error messaging in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T017 [P] [US2] Update the focused-service and database workflow sections to match the implemented targets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/014-project-makefile/quickstart.md`
- [x] T018 [US2] Validate User Story 2 by executing the service-scoped and database commands and folding any discovered command fixes back into `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`

**Checkpoint**: User Story 2 is independently functional for service-specific and database workflows.

---

## Phase 5: User Story 3 - Run quality checks and recover local environments safely (Priority: P3)

**Goal**: Give team members one entry point for tests, safe cleanup, and destructive reset with explicit data-loss confirmation.

**Independent Test**: A team member can run all tests, run each test subset separately, clean non-destructively, and trigger a confirmation-gated destructive cleanup without ambiguous behavior.

### Implementation for User Story 3

- [x] T019 [US3] Implement the `test`, `test-backend`, `test-lawyer`, and `test-admin` targets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T020 [US3] Implement the non-destructive `clean` target in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T021 [US3] Implement the destructive `nuke` target with an explicit confirmation prompt before deleting volumes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [x] T022 [P] [US3] Update the testing and cleanup guidance to match the implemented targets in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`
- [x] T023 [US3] Validate User Story 3 by executing the test and cleanup commands and applying any final command-surface fixes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`

**Checkpoint**: User Story 3 is independently functional for tests and recovery workflows.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency checks across all stories and planning artifacts.

- [x] T024 [P] Sync the final command names and safety rules with `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/014-project-makefile/contracts/command-surface.md`
- [x] T025 [P] Sync the final onboarding and operational guidance with `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/014-project-makefile/quickstart.md`
- [x] T026 Run the end-to-end quickstart validation and document any required wording fixes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: Starts immediately.
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3: User Story 1**: Depends on Phase 2.
- **Phase 4: User Story 2**: Depends on Phase 2.
- **Phase 5: User Story 3**: Depends on Phase 2.
- **Phase 6: Polish**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories once foundational work is done.
- **US2 (P2)**: No product dependency on US1, but should be implemented after foundational work because it reuses the same root command helpers.
- **US3 (P3)**: No product dependency on US1 or US2, but should be implemented after foundational work because it reuses the same root command helpers.

### Within Each User Story

- Implement command targets before documentation sync tasks.
- Run the story validation task after all targets for that story are in place.
- Prefer sequential execution inside each story because most implementation tasks touch `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`.

### Parallel Opportunities

- `T003` can run in parallel with `T001`-`T002` because it updates only the command contract.
- `T011` can run in parallel with late US1 implementation once lifecycle target names are stable because it only updates `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`.
- `T017` can run in parallel with late US2 implementation once service and database target names are stable because it only updates `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/014-project-makefile/quickstart.md`.
- `T022` can run in parallel with late US3 implementation once testing and cleanup target names are stable because it only updates `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`.
- `T024` and `T025` can run in parallel in the polish phase because they touch separate documentation files.

---

## Parallel Example: User Story 1

```bash
# After lifecycle target names are stable, documentation can be updated in parallel:
Task: "Update the daily development and production workflow guidance in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md"
Task: "Implement the prod, prod-down, prod-logs, and prod-build targets in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile"
```

## Parallel Example: User Story 2

```bash
# After database and scoped target names are stable, quickstart can be updated in parallel:
Task: "Implement the migrate and migrate-add targets in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile"
Task: "Update the focused-service and database workflow sections in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/014-project-makefile/quickstart.md"
```

## Parallel Example: User Story 3

```bash
# After test and cleanup target names are stable, docs can be updated in parallel:
Task: "Implement the clean and nuke targets in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile"
Task: "Update the testing and cleanup guidance in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate full-stack lifecycle behavior from the repository root.

### Incremental Delivery

1. Deliver the shared Makefile structure and guards first.
2. Add lifecycle targets and validate MVP behavior.
3. Add service-specific and database workflows.
4. Add testing and cleanup workflows.
5. Finish with contract and quickstart/doc sync.

### Low-Cost LLM Execution Strategy

1. Execute tasks strictly in task-ID order unless a task is explicitly marked `[P]`.
2. Finish each `Makefile` task completely before moving to the next `Makefile` task.
3. Use the validation task at the end of each story as the gate before starting the next story.
4. Avoid batching multiple `Makefile` edits into one step when a task already narrows the target behavior.

---

## Notes

- All tasks follow the required checklist format with IDs, optional `[P]` markers, story labels where required, and exact file paths.
- User stories are independently testable at the command-surface level even though they share a single root `Makefile`.
- Parallel tasks are intentionally limited because this feature centers on one high-conflict file.
