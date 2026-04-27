# Tasks: Docker Setup

**Input**: Design documents from `/specs/012-docker-setup/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No separate automated test-writing tasks are included because the feature specification did not request TDD. Validation tasks use build, compose-config, and smoke-run checks from `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Tasks are intentionally granular so a lower-cost LLM can execute them with minimal inference.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the documentation and configuration scaffolding that every implementation task will rely on.

- [x] T001 Create the feature task plan in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/012-docker-setup/tasks.md`
- [x] T002 [P] Create local Docker env template in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.env.docker.example`
- [x] T003 [P] Create production Docker env template in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.env.docker.prod.example`
- [x] T004 [P] Review `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.gitignore` and add an explicit comment block for `.env.docker` and `.env.docker.prod` handling if it is missing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and application configuration that must be correct before any user story can be completed.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create the shared local orchestration file in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml`
- [x] T006 Create the production-oriented orchestration file in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml`
- [x] T007 [P] Create the backend multi-stage container build in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Dockerfile`
- [x] T008 [P] Create the lawyer dashboard multi-stage container build in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/Dockerfile`
- [x] T009 [P] Create the admin dashboard multi-stage container build in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/Dockerfile`
- [x] T010 [P] Create the landing app multi-stage container build in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/Dockerfile`
- [x] T011 [P] Create the lawyer dashboard static runtime server config in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/nginx.conf`
- [x] T012 [P] Create the admin dashboard static runtime server config in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/nginx.conf`
- [x] T013 [P] Create the landing app static runtime server config in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/nginx.conf`
- [x] T014 Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/vite.config.ts` to bind Vite to `0.0.0.0` and support Docker-friendly watch and HMR settings
- [x] T015 Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/vite.config.ts` to add Docker-friendly watch and HMR settings while preserving the canonical port
- [x] T016 Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Lawyer.csproj` so required runtime assets are copied into publish output inside the backend container
- [x] T017 Run `docker compose config` against `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml` and fix any schema or interpolation errors in the touched infrastructure files
- [x] T018 Run `docker compose -f /Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml config` and fix any schema or interpolation errors in the touched infrastructure files

**Checkpoint**: Compose files, Dockerfiles, nginx configs, env templates, and container reachability prerequisites are ready.

---

## Phase 3: User Story 1 - Start the Full Local Workspace Quickly (Priority: P1) 🎯 MVP

**Goal**: Deliver a local Docker workspace that starts SQL Server, backend, lawyer dashboard, admin dashboard, and landing app together on the canonical local ports.

**Independent Test**: Create `.env.docker`, run the local compose stack, wait for startup, and verify `localhost:1433`, `localhost:8976`, `localhost:5078`, `localhost:5079`, and `localhost:3000` are all reachable with the expected local wiring.

### Implementation for User Story 1

- [x] T019 [US1] Add the `sqlserver` service, named database volume, and healthcheck to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml`
- [x] T020 [US1] Add the `backend` service, local env-file loading, canonical port mapping, and dependency on SQL readiness to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml`
- [x] T021 [US1] Add the `lawyer-dashboard` service, local API base URL wiring, source mounts, and node_modules volume to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml`
- [x] T022 [US1] Add the `admin-dashboard` service, local API base URL wiring, source mounts, and node_modules volume to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml`
- [x] T023 [US1] Add the `landing` service, local API base URL wiring, source mounts, and canonical port mapping to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml`
- [x] T024 [US1] Add the shared local Docker network definition to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml`
- [x] T025 [US1] Fill `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.env.docker.example` with every required local Docker variable referenced by `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml`
- [x] T026 [US1] Build the local backend image from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Dockerfile` and fix any missing publish assets or build-stage issues
- [x] T027 [US1] Build the three local frontend images from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/Dockerfile`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/Dockerfile`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/Dockerfile` and fix any missing dependency, build-context, or start-command issues
- [x] T028 [US1] Perform the local smoke run from `quickstart.md` against `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml` and update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/012-docker-setup/quickstart.md` if any validation step needs clearer wording

**Checkpoint**: The local stack is fully runnable and independently testable as the MVP slice.

---

## Phase 4: User Story 2 - Rebuild and Ship a Production Package Predictably (Priority: P2)

**Goal**: Deliver a production-oriented Docker packaging flow for backend and all three web apps with environment-driven runtime configuration.

**Independent Test**: Create `.env.docker.prod`, build the production-oriented compose stack, and verify the backend plus all three web surfaces run from built images without development-only behavior.

### Implementation for User Story 2

- [x] T029 [US2] Add the production `backend` service, env-file loading, runtime URL variables, and production restart policy to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml`
- [x] T030 [US2] Add the production `lawyer-dashboard` service and its build-time API URL argument wiring to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml`
- [x] T031 [US2] Add the production `admin-dashboard` service and its build-time API URL argument wiring to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml`
- [x] T032 [US2] Add the production `landing` service and its build-time API URL argument wiring to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml`
- [x] T033 [US2] Add the production database-target option, backend log volume, and shared production network definition to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml`
- [x] T034 [US2] Fill `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/.env.docker.prod.example` with every production-oriented variable referenced by `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml`
- [x] T035 [US2] Review `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/nginx.conf` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/nginx.conf` so SPA route refreshes resolve correctly in production
- [x] T036 [US2] Review `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/nginx.conf` so exported landing routes resolve correctly in production
- [x] T037 [US2] Build the production-oriented backend and frontend images from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml` and fix any runtime-stage or build-arg issues in the touched Dockerfiles and compose file
- [x] T038 [US2] Perform the production-oriented smoke run from `quickstart.md` against `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml` and update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/012-docker-setup/quickstart.md` if the release-validation steps need clarification

**Checkpoint**: Production-oriented packaging is independently buildable and testable.

---

## Phase 5: User Story 3 - Preserve Data and Service Reliability Across Restarts (Priority: P3)

**Goal**: Ensure database persistence, log persistence, health-gated startup, and restart behavior survive routine stop/start and failure scenarios.

**Independent Test**: Start the local stack, create representative data, restart the stack, verify data persists, then validate production-oriented restart and health behavior using the documented quickstart failure scenarios.

### Implementation for User Story 3

- [x] T039 [US3] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml` to confirm the SQL Server named volume survives normal stop/start cycles and is not tied to ephemeral container storage
- [x] T040 [US3] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml` so backend logs are persisted outside the container filesystem for local troubleshooting
- [x] T041 [US3] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml` so dependent services use health-gated startup behavior instead of assuming the database is ready immediately
- [x] T042 [US3] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml` so long-running production-oriented services use the intended automatic restart behavior
- [x] T043 [US3] Validate the local persistence scenario from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/012-docker-setup/quickstart.md` and fix any incorrect volume, dependency, or restart wiring in the touched compose files
- [x] T044 [US3] Validate the failure scenarios from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/012-docker-setup/quickstart.md` and fix any unclear startup errors or missing dependency guards in the touched compose files and env examples

**Checkpoint**: Persistence and restart behavior are independently testable without requiring further story work.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, consistency checks, and implementation cleanup across all user stories.

- [x] T045 [P] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/012-docker-setup/contracts/runtime-configuration-contract.md` if final variable names differ from the design draft
- [x] T046 [P] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/012-docker-setup/contracts/service-topology-contract.md` if final service topology differs from the design draft
- [x] T047 [P] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/012-docker-setup/research.md` if any implemented decision changed during execution
- [x] T048 Run the final verification sequence: `docker compose config`, `docker compose -f docker-compose.prod.yml config`, backend image build, local stack smoke run, and production-oriented smoke run; then record any final doc corrections in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/012-docker-setup/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 only; this is the MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 2; can start after US1 if one model is working sequentially, or after Phase 2 in parallel if capacity exists.
- **User Story 3 (Phase 5)**: Depends on Phases 3 and 4 because persistence and restart validation need the local and production-oriented stacks to exist first.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1**: No dependency on other stories after foundational work is done.
- **US2**: Independent from US1 at the design level, but sequential execution is recommended for a cheaper LLM because it can reuse compose and Dockerfile context safely.
- **US3**: Depends on US1 local stack behavior and US2 production-oriented runtime behavior.

### Within Each User Story

- Create or update the orchestration file entries before trying to run builds.
- Ensure env example files list every referenced variable before smoke validation.
- Build images before runtime smoke checks.
- Fix compose validation errors before container runtime debugging.

### Recommended Execution Order For a Lower-Cost LLM

1. Finish T002-T018 in order.
2. Finish US1 completely through T028 and validate the MVP.
3. Finish US2 completely through T038 and validate production-oriented packaging.
4. Finish US3 completely through T044.
5. Finish polish tasks T045-T048.

---

## Parallel Opportunities

- **Phase 1**: T002, T003, and T004 can run in parallel.
- **Phase 2**: T007-T013 can run in parallel because they touch separate files.
- **US1**: T025 can run in parallel with T019-T024 after the compose file shape is stable; T026 and T027 can run in parallel after the Dockerfiles are written.
- **US2**: T034 can run in parallel with T029-T033 after the production variable list is known; T035 and T036 can run in parallel because they touch different nginx files.
- **Polish**: T045-T047 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# After local compose services are defined:
Task: "Fill /Users/mazenelsbagh/mazen mac/apps/mohamy smart/.env.docker.example with every required local Docker variable referenced by /Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml"

# After all Dockerfiles are created:
Task: "Build the local backend image from /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Dockerfile and fix any missing publish assets or build-stage issues"
Task: "Build the three local frontend images from their Dockerfiles and fix any missing dependency, build-context, or start-command issues in the touched frontend Dockerfiles"
```

---

## Parallel Example: User Story 2

```bash
# After production service definitions are drafted:
Task: "Fill /Users/mazenelsbagh/mazen mac/apps/mohamy smart/.env.docker.prod.example with every production-oriented variable referenced by /Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.prod.yml"

# nginx route handling can be refined in parallel:
Task: "Review /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/nginx.conf and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/nginx.conf so SPA route refreshes resolve correctly in production"
Task: "Review /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/nginx.conf so exported landing routes resolve correctly in production"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3.
4. Stop and validate the full local workspace before touching production-oriented packaging.

### Incremental Delivery

1. Deliver local Docker workspace first.
2. Deliver production-oriented packaging second.
3. Deliver persistence and restart hardening third.
4. Finish with documentation and verification cleanup.

### Low-Cost LLM Strategy

1. Execute tasks strictly in task-ID order unless a `[P]` block is explicitly selected.
2. Avoid combining multiple tasks into one edit when they touch different files.
3. After each task, re-open only the file that was just changed plus the directly dependent file.
4. Run validation tasks exactly where listed instead of postponing all validation to the end.

---

## Notes

- Every task follows the required checklist format with checkbox, ID, and exact file path.
- `[P]` appears only on tasks that can be executed without editing the same file.
- User stories remain independently testable at their phase checkpoints.
- The suggested MVP scope is **User Story 1 only**.
