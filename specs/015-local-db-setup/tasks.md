# Tasks: Local Database Setup

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/`
**Prerequisites**: [plan.md](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/plan.md), [spec.md](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/spec.md), [research.md](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/research.md), [data-model.md](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/data-model.md), [quickstart.md](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/quickstart.md), [local-db-operations.md](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/contracts/local-db-operations.md)

**Tests**: No new automated tests are required by the feature spec. Validation is done through explicit operational smoke flows and documentation consistency checks.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently by a lower-cost LLM without extra repo exploration.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because the task edits a different file and does not depend on unfinished work in the same phase
- **[Story]**: Maps the task to a specific user story from the feature spec (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path and a concrete action

## Phase 1: Setup (Shared Context)

**Purpose**: Create the shared documentation anchors and task-ready surfaces that later story work will fill in.

- [X] T001 Create a dedicated `Local Database` section and subsection anchors in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`
- [X] T002 [P] Create a dedicated local database reference subsection in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/environment-reference.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Normalize the core local DB contract across Docker, Make, and backend seeding before user-story work starts.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T003 Update the SQL Server service comments and volume notes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml` to make the persistence boundary explicit
- [X] T004 [P] Update command descriptions and cleanup messaging for local DB persistence in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [X] T005 [P] Refactor baseline role and starter account definitions into one idempotent seeding flow in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/DataSeed.cs`
- [X] T006 Update the seeding block to call the refactored idempotent flow without adding automatic migrations in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`

**Checkpoint**: Docker volume semantics, Makefile command wording, and backend seeding behavior now describe the same local DB contract.

---

## Phase 3: User Story 1 - Preserve Local Data Between Sessions (Priority: P1) 🎯 MVP

**Goal**: Make routine shutdown and restart preserve the same local DB state while keeping destructive reset behavior clearly separate.

**Independent Test**: Start the local stack, create or confirm representative records, run `make down`, run `make dev`, and verify the same records still exist. Then run `make nuke`, restart, and verify the old records are gone.

### Implementation for User Story 1

- [X] T007 [US1] Tighten the persistence and reset wording for `make down`, `make clean`, and `make nuke` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`
- [X] T008 [P] [US1] Add a local DB persistence and destructive-reset reference entry to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/environment-reference.md`
- [X] T009 [US1] Update the local DB persistence and destructive-reset invariants in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/quickstart.md`
- [X] T010 [US1] Update the local DB lifecycle rows for routine shutdown and destructive reset in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/contracts/local-db-operations.md`

**Checkpoint**: User Story 1 is complete when persistence after routine restart and data removal after explicit reset are both documented consistently and match the actual command surface.

---

## Phase 4: User Story 2 - Initialize the Local Database Predictably (Priority: P2)

**Goal**: Make first-run local DB setup explicit, manual for migrations, and safe for repeated backend startups.

**Independent Test**: Start from a fresh local DB, run `make dev`, run `make migrate`, confirm the backend starts successfully with the baseline admin and lawyer accounts, then restart and confirm no duplicate roles or users are created.

### Implementation for User Story 2

- [X] T011 [US2] Update the database workflow help text for `make migrate` and related first-run guidance in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [X] T012 [P] [US2] Make starter account emails, passwords, and roles easier to audit and keep duplicate-safe in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/DataSeed.cs`
- [X] T013 [US2] Clarify the startup seeding intent and failure logging without introducing migration execution in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`
- [X] T014 [US2] Add a first-run local DB setup flow with explicit `make migrate` sequencing to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`
- [X] T015 [P] [US2] Add starter-account and migration-step reference notes to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/environment-reference.md`
- [X] T016 [US2] Sync the first-run initialization steps and repeat-start expectations in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/quickstart.md`

**Checkpoint**: User Story 2 is complete when a fresh local environment can be initialized by a documented manual migration step and repeated startups keep the seeded baseline stable.

---

## Phase 5: User Story 3 - Access the Local Database from Outside the Workspace (Priority: P3)

**Goal**: Document a host-side SQL client workflow that reaches the same local DB instance used by the app stack.

**Independent Test**: Start the local stack, open an external SQL client, connect with `localhost,1433`, database `Lawyer`, user `sa`, and the password from `.env.docker`, then verify the visible records match the running local app environment.

### Implementation for User Story 3

- [X] T017 [US3] Add host-side SQL client connection instructions for `localhost,1433` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`
- [X] T018 [P] [US3] Add an external local DB access reference using `MSSQL_SA_PASSWORD` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/environment-reference.md`
- [X] T019 [US3] Align the `db-shell` help and error wording with the documented local DB access workflow in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`
- [X] T020 [US3] Sync the external connection validation steps in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/quickstart.md`
- [X] T021 [US3] Update the host-side external inspection row and invariants in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/contracts/local-db-operations.md`

**Checkpoint**: User Story 3 is complete when the repo documents exactly how to connect from an external SQL client and that guidance uses the same host, port, DB name, and password source as the actual local runtime.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency pass and smoke validation across all stories.

- [X] T022 [P] Run a wording consistency pass for local DB lifecycle terms across `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/Makefile`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/environment-reference.md`
- [X] T023 Run the full local DB smoke sequence from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/quickstart.md` and capture any final fixes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md`
- [X] T024 [P] Apply any final quickstart or contract wording fixes discovered during validation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/quickstart.md` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/015-local-db-setup/contracts/local-db-operations.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies, can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all story work.
- **Phase 3 (US1)**: Depends on Phase 2 completion.
- **Phase 4 (US2)**: Depends on Phase 2 completion; can begin after US1 if a single implementer is working sequentially.
- **Phase 5 (US3)**: Depends on Phase 2 completion; safest after US2 because it reuses the final first-run/local access wording.
- **Phase 6 (Polish)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories once foundational work is done.
- **US2 (P2)**: No hard dependency on US1 behavior, but shares the same command/document surfaces.
- **US3 (P3)**: Depends on the final local command and initialization wording being stable.

### Within Each User Story

- Update the primary operational or code contract first.
- Update supporting docs second.
- Sync feature quickstart and contract artifacts last.
- Validate the story independently before moving to the next phase.

## Parallel Opportunities

- **Setup**: `T001` and `T002` can run in parallel.
- **Foundational**: `T004` and `T005` can run in parallel after `T003` starts the shared contract wording.
- **US1**: `T008` can run in parallel with `T007`; `T009` and `T010` follow after the shared wording settles.
- **US2**: `T012` and `T015` can run in parallel; `T013`, `T014`, and `T016` follow after the seeding behavior is finalized.
- **US3**: `T018` can run in parallel with `T017`; `T019`, `T020`, and `T021` follow after the external-access wording is finalized.
- **Polish**: `T022` and `T024` can run in parallel once the smoke run in `T023` identifies any remaining gaps.

## Parallel Example: User Story 2

```bash
Task: "Make starter account emails, passwords, and roles easier to audit and keep duplicate-safe in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/DataSeed.cs"
Task: "Add starter-account and migration-step reference notes to /Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/environment-reference.md"
```

## Parallel Example: User Story 3

```bash
Task: "Add host-side SQL client connection instructions for localhost,1433 to /Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/setup-guide.md"
Task: "Add an external local DB access reference using MSSQL_SA_PASSWORD to /Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/environment-reference.md"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3 (US1).
4. Run the US1 independent test before touching later stories.

### Incremental Delivery

1. Finish Setup + Foundational to lock the local DB contract.
2. Deliver US1 to make persistence/reset behavior trustworthy.
3. Deliver US2 to make fresh setup and seeded access predictable.
4. Deliver US3 to make external inspection reliable.
5. Finish with Phase 6 validation and wording cleanup.

### Low-Cost LLM Execution Notes

- Prefer completing one task at a time in task ID order.
- Do not combine unrelated file edits into one task.
- Re-read the target file before editing if the previous task touched it.
- Treat `Makefile`, `docker-compose.yml`, and backend seeding files as source-of-truth files; docs should follow them.

## Notes

- All tasks follow the required checklist format: checkbox, task ID, optional `[P]`, optional `[US#]`, concrete action, exact file path.
- There are no automated-test tasks because the feature spec did not require TDD or new automated coverage for this work.
- The suggested MVP scope is **User Story 1** after Setup and Foundational phases.
