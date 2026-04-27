---
description: "Task list template for feature implementation"
---

# Tasks: Immediate Security Fixes (Phase 0)

**Input**: Design documents from `/specs/051-immediate-security-fixes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Ensure `.env.docker`, `.env.docker.prod`, `appsettings.Development.json`, and `**/.env.local` are explicitly excluded in `/.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Purge `mohamy-smart-backend/appsettings.Development.json` from git history using `git filter-repo --path mohamy-smart-backend/appsettings.Development.json --invert-paths`
- [x] T003 Purge `/.env.docker` and `/.env.docker.prod` from git history using `git filter-repo --path .env.docker --path .env.docker.prod --invert-paths`
- [x] T004 Purge dashboard local environment files from git history using `git filter-repo --path mohamy-smart-lawyer-dashboard/.env.local --path mohamy-smart-admin-dashboard/.env.local --invert-paths`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure System Configuration and Credential Rotation (Priority: P1) 🎯 MVP

**Goal**: All compromised credentials are rotated and securely stored in a Secret Manager, stopping active security leaks immediately.

**Independent Test**: Can be fully tested by verifying that old credentials no longer work, the application successfully authenticates with new credentials from the Secret Manager, and `.env.docker` is no longer tracked in the repository.

### Implementation for User Story 1

- [x] T005 [P] [US1] Scrub `mohamy-smart-backend/appsettings.json` and replace any real keys (OpenAI, Gemini, Vision, Paymob, JWT, SMTP, SMS) with `TODO_` placeholders
- [x] T006 [P] [US1] Scrub `/.env.docker.example` and replace any accidentally committed real keys with `TODO_` placeholders
- [x] T007 [P] [US1] Scrub `mohamy-smart-lawyer-dashboard/.env.example` and replace any real keys with `TODO_` placeholders
- [x] T008 [P] [US1] Scrub `mohamy-smart-admin-dashboard/.env.example` and replace any real keys with `TODO_` placeholders

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T009 Document the rotation requirement and environment variable structure updates in `/specs/051-immediate-security-fixes/quickstart.md`
- [x] T010 Verify application starts successfully by running `make dev` with the new, clean `.env.docker`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tasks in US1 are purely file modifications and can be executed in parallel

---

## Parallel Example: User Story 1

```bash
# Scrub configurations in parallel:
Task: "Scrub mohamy-smart-backend/appsettings.json and replace any real keys..."
Task: "Scrub /.env.docker.example and replace any accidentally committed real keys..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready
