# Tasks: Environment Variable Strategy

**Input**: Design documents from `/specs/013-environment-config/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated test tasks are included. The feature spec does not require TDD, and this feature is primarily implemented through tracked configuration files and documentation. Each user story instead includes an independent manual verification checkpoint.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Every task below includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the shared documentation surface and missing tracked files that the rest of the feature will rely on

- [x] T001 Create the central environment reference document in `docs/environment-reference.md`
- [x] T002 Update the introduction and prerequisites in `docs/setup-guide.md` to describe the repository-wide environment-file strategy
- [x] T003 Create the missing tracked landing template in `mohamy-smart-landing/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Normalize shared ownership and baseline configuration rules before editing story-specific profiles

**⚠️ CRITICAL**: No user story work should begin until this phase is complete

- [x] T004 Update the ignore-policy comments in `.gitignore` to explicitly document ignored real-value files for Docker, frontend apps, and backend local settings
- [x] T005 Update placeholder sections and descriptions in `mohamy-smart-backend/Lawyer/appsettings.example.json` so backend-owned keys match the current environment strategy
- [x] T006 Update `docs/environment-reference.md` with the canonical variable groups, file ownership boundaries, and naming rules defined by the feature contract
- [x] T007 Update the header usage comments in `docker-compose.yml` and `docker-compose.prod.yml` so they point to the tracked example files and ignored real-value copies

**Checkpoint**: Repository ownership rules and baseline environment surfaces are clear enough to implement local and production stories without ambiguity

---

## Phase 3: User Story 1 - Prepare local setup safely (Priority: P1) 🎯 MVP

**Goal**: Give developers one clear, tracked local setup path that keeps real secrets out of version control

**Independent Test**: Starting from the repository only, a developer can identify which local files to copy, which local keys are required vs optional, and which values must remain private

### Implementation for User Story 1

- [x] T008 [US1] Rewrite the local shared template in `.env.docker.example` to group keys by category and label required vs optional local values clearly
- [x] T009 [P] [US1] Rewrite `mohamy-smart-lawyer-dashboard/.env.example` so it documents only local/public frontend values and copy guidance for the lawyer dashboard
- [x] T010 [P] [US1] Rewrite `mohamy-smart-admin-dashboard/.env.example` so it documents only local/public frontend values and copy guidance for the admin dashboard
- [x] T011 [P] [US1] Rewrite `mohamy-smart-landing/.env.example` so it documents only local/public frontend values and copy guidance for the landing app
- [x] T012 [US1] Update the local-development section in `docs/setup-guide.md` to use `.env.docker.example`, `mohamy-smart-lawyer-dashboard/.env.example`, `mohamy-smart-admin-dashboard/.env.example`, and `mohamy-smart-landing/.env.example`
- [x] T013 [US1] Add a local profile matrix to `docs/environment-reference.md` listing each local key, its owning file, its consumer, and whether it is required or optional
- [x] T014 [US1] Perform a local-profile consistency pass across `.env.docker.example`, `docker-compose.yml`, `mohamy-smart-lawyer-dashboard/.env.example`, `mohamy-smart-admin-dashboard/.env.example`, `mohamy-smart-landing/.env.example`, `docs/setup-guide.md`, and `docs/environment-reference.md`

**Checkpoint**: Local setup is fully documented, tracked templates exist for every application surface, and developers can distinguish secrets from safe placeholders

---

## Phase 4: User Story 2 - Prepare production deployment consistently (Priority: P2)

**Goal**: Give deployment operators one clear, tracked production template and matching deployment guidance

**Independent Test**: An operator can prepare a production configuration set by reading the tracked production template and documentation without needing undocumented keys

### Implementation for User Story 2

- [x] T015 [US2] Rewrite the production shared template in `.env.docker.prod.example` to separate required production secrets, required public URLs, optional monitoring values, and optional port overrides
- [x] T016 [P] [US2] Update `docker-compose.prod.yml` so every build arg, env-file reference, and comment matches the final keys documented in `.env.docker.prod.example`
- [x] T017 [P] [US2] Update backend example placeholders in `mohamy-smart-backend/Lawyer/appsettings.example.json` so backend-owned production settings map cleanly to the documented environment-variable names
- [x] T018 [US2] Update the production-preparation section in `docs/setup-guide.md` to use `.env.docker.prod.example` and include callback, CORS, and domain-alignment checks
- [x] T019 [US2] Add a production profile matrix to `docs/environment-reference.md` listing each production key, whether it is secret or public, which service consumes it, and whether it is required or optional
- [x] T020 [US2] Perform a production-profile consistency pass across `.env.docker.prod.example`, `docker-compose.prod.yml`, `mohamy-smart-backend/Lawyer/appsettings.example.json`, `docs/setup-guide.md`, and `docs/environment-reference.md`

**Checkpoint**: Production deployment inputs are explicit, documented, and aligned with the actual compose/build surfaces

---

## Phase 5: User Story 3 - Keep environment requirements aligned across teams (Priority: P3)

**Goal**: Make the tracked templates and docs stay synchronized when teams add or rename configuration keys later

**Independent Test**: A maintainer can review the final documentation and determine exactly which file owns each environment key and which files must be updated when a shared key changes

### Implementation for User Story 3

- [x] T021 [US3] Add a “source of truth by file” section to `docs/environment-reference.md` covering `.env.docker.example`, `.env.docker.prod.example`, `mohamy-smart-backend/Lawyer/appsettings.example.json`, `mohamy-smart-lawyer-dashboard/.env.example`, `mohamy-smart-admin-dashboard/.env.example`, and `mohamy-smart-landing/.env.example`
- [x] T022 [US3] Update `docs/setup-guide.md` so it references `docs/environment-reference.md` as the maintained source of truth instead of duplicating per-key guidance
- [x] T023 [US3] Add a cross-file change checklist to `docs/environment-reference.md` naming every file that must be updated when a shared environment key is added, renamed, or removed
- [x] T024 [US3] Perform a final repository consistency pass across `.env.docker.example`, `.env.docker.prod.example`, `mohamy-smart-backend/Lawyer/appsettings.example.json`, `mohamy-smart-lawyer-dashboard/.env.example`, `mohamy-smart-admin-dashboard/.env.example`, `mohamy-smart-landing/.env.example`, `docs/setup-guide.md`, and `docs/environment-reference.md`

**Checkpoint**: Future maintainers can update environment keys without guessing ownership or missing a dependent file

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation across all user stories

- [x] T025 [P] Run a tracked-secret placeholder audit across `.env.docker.example`, `.env.docker.prod.example`, `mohamy-smart-backend/Lawyer/appsettings.example.json`, `mohamy-smart-lawyer-dashboard/.env.example`, `mohamy-smart-admin-dashboard/.env.example`, `mohamy-smart-landing/.env.example`, `docs/setup-guide.md`, and `docs/environment-reference.md`
- [x] T026 Run a final documentation validation pass in `docs/setup-guide.md` and `docs/environment-reference.md` to remove stale file names, stale copy commands, and stale port/domain references

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies and can start immediately
- **Phase 2: Foundational**: Depends on Phase 1 and blocks all story work
- **Phase 3: US1**: Depends on Phase 2 and is the MVP
- **Phase 4: US2**: Depends on Phase 2 and can start after the foundation is ready
- **Phase 5: US3**: Depends on US1 and US2 because alignment work must reflect the final local and production surfaces
- **Phase 6: Polish**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories after Foundational
- **US2 (P2)**: No dependency on US1 after Foundational, but both stories should agree on shared naming
- **US3 (P3)**: Depends on the final outputs of US1 and US2

### Within Each User Story

- Rewrite the owning template files first
- Update the operator/developer documentation next
- End with the consistency pass for that story
- Do not start the final consistency pass for a story until all earlier tasks in that story are complete

### Parallel Opportunities

- **US1**: T009, T010, and T011 can run in parallel because each task edits a different app-level `.env.example` file
- **US2**: T016 and T017 can run in parallel because one edits compose wiring and the other edits backend example placeholders
- **Polish**: T025 can run independently before T026 because the audit output feeds into the final doc cleanup

---

## Parallel Example: User Story 1

```bash
Task: "Rewrite mohamy-smart-lawyer-dashboard/.env.example so it documents only local/public frontend values and copy guidance for the lawyer dashboard"
Task: "Rewrite mohamy-smart-admin-dashboard/.env.example so it documents only local/public frontend values and copy guidance for the admin dashboard"
Task: "Rewrite mohamy-smart-landing/.env.example so it documents only local/public frontend values and copy guidance for the landing app"
```

---

## Parallel Example: User Story 2

```bash
Task: "Update docker-compose.prod.yml so every build arg, env-file reference, and comment matches the final keys documented in .env.docker.prod.example"
Task: "Update backend example placeholders in mohamy-smart-backend/Lawyer/appsettings.example.json so backend-owned production settings map cleanly to the documented environment-variable names"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate local onboarding using only tracked templates and docs

### Incremental Delivery

1. Finish Setup + Foundational once
2. Deliver US1 for local onboarding
3. Deliver US2 for production preparation
4. Deliver US3 for long-term maintainability
5. Finish with repository-wide audit and cleanup

### Low-Cost LLM Execution Notes

- Prefer one task per commit whenever possible
- Complete tasks in strict ID order unless the task is marked `[P]`
- Do not merge or reinterpret tasks; each task names the file that must change
- When a task says “consistency pass,” compare only the files named in that task and fix mismatches immediately

---

## Notes

- Total tasks: 26
- Tasks for US1: 7
- Tasks for US2: 6
- Tasks for US3: 4
- Setup + Foundational tasks: 7
- Polish tasks: 2
- MVP scope: Phase 1 + Phase 2 + Phase 3 (through T014)
- Format validation: All tasks follow the required checklist format with checkbox, task ID, optional `[P]`, required `[US#]` labels for story tasks, and exact file paths
