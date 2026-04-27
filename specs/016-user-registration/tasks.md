# Tasks: User Registration Fields

**Input**: Design documents from `/specs/016-user-registration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are excluded as they were not explicitly requested, though manual testing via the API and UI is assumed.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure. Since the project and architecture are already defined, setup tasks verify the workspace.

- [x] T001 Verify backend configuration and local Docker database connection string in `.env.docker`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Implement EF Core Entity fields for User (MobileNumber, Governorate, FullName, AgreedToTerms) in `mohamy-smart-backend/Lawyer.Core/Entities/User.cs` or equivalent identity domain class.
- [x] T003 Generate EF Core migration for the new Entity fields inside `mohamy-smart-backend/` using `dotnet ef migrations add AddUserRegistrationFields --project Lawyer.Infrastracture --startup-project Lawyer`.

**Checkpoint**: Foundation ready - Database schema and core domain models can accommodate new fields.

---

## Phase 3: User Story 1 - Basic Registration Submission (Priority: P1) 🎯 MVP

**Goal**: Implement the core registration mechanism allowing Arabic-speaking users to submit their credentials via the newly added fields.
**Independent Test**: Send a mock POST request to `/api/auth/register` with valid input; expect newly created DB row. Check endpoint with mismatched password; expect 400.

### Implementation for User Story 1

- [x] T004 [P] [US1] Create `RegisterDto` housing all the registration form fields in `mohamy-smart-backend/Lawyer.Application/DTOs/Auth/RegisterDto.cs`.
- [x] T005 [P] [US1] Implement user creation logic and uniqueness validation (`!AnyAsync(Email) && !AnyAsync(MobileNumber)`) inside `mohamy-smart-backend/Lawyer.Application/Services/AuthService.cs` (or equivalent registration service).
- [x] T006 [US1] Expose public generic endpoint `POST /api/auth/register` inside `mohamy-smart-backend/Lawyer/Controllers/AuthController.cs`.
- [x] T007 [P] [US1] Create client-side Zod validation schema in `mohamy-smart-landing/src/lib/validations/registerSchema.ts` enforcing Arabic error messages and required checks.
- [x] T008 [US1] Create React Hook Form UI Component for the Registration form with Tailwind CSS and RTL Arabic layout in `mohamy-smart-landing/src/components/auth/RegisterForm.tsx`.
- [x] T009 [US1] Connect `RegisterForm.tsx` to the new backend API using Axios, handling 400 validation errors and 409 conflict errors via `react-hot-toast`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T010 [P] Update `docs/environment-reference.md` or similar README documentation regarding local registration setup and authentication token locations.
- [x] T011 Run `make db-migrate` equivalent or Docker Compose startup to ensure all Docker local DB setup is accurate and the backend runs cleanly without crashes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2). No dependencies on other stories since it handles the core authentication.

### Within Each User Story

- Models before services (Entity -> Auth Service)
- Services before endpoints (Auth Service -> Auth Controller)
- Core backend implementation before frontend integration (API -> UI)

### Parallel Opportunities

- DTO creation (`T004`), schema creation (`T007`), and Service logic (`T005`) can be scaffolded by different LLM calls or devs simultaneously inside User Story 1.

---

## Parallel Example: User Story 1

```bash
# Launch generic schema creation along with DTO definition.
Task: "T004 [P] [US1] Create RegisterDto housing all the registration form fields"
Task: "T007 [P] [US1] Create client-side Zod validation schema"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Registration locally using Docker.
5. Deploy/preview.
