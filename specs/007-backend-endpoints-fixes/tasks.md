---

description: "Task list for Phase 6 Backend Missing Endpoints"
---

# Tasks: Phase 6 — Backend: Missing Endpoints & Fixes

**Input**: Design documents from `/specs/007-backend-endpoints-fixes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md

**Tests**: Postman/Independent tests are defined; explicit unit tests were not strictly mandated but are advised as part of standard .NET practices if coverage is required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project validation and basic structure review.

- [x] T001 Verify standard .NET 6+ Web API structure and EF Core configurations exist under `src/Lawyer/` and `src/Lawyer.Infrastructure/`.
- [x] T002 Verify `[Authorize]` middleware is enabled inside `src/Lawyer/Program.cs` or `Startup.cs`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core DTO models initialization before user stories consume them.

- [x] T003 Create `LawyerAnalyticsDto.cs` located in `src/Lawyer.Application/DTOs/Analytics/LawyerAnalyticsDto.cs`
- [x] T004 [P] Create `SubscriptionAnalyticsDto.cs` located in `src/Lawyer.Application/DTOs/Analytics/SubscriptionAnalyticsDto.cs`
- [x] T005 [P] Create Response Wrappers or general report DTOs for `LawyersReportResponse` in `src/Lawyer.Application/DTOs/Analytics/`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Lawyers & Subscriptions Analytical Reports (Priority: P1) 🎯 MVP

**Goal**: An administrator checks the transaction ledger and lawyer aggregates. The backend API accurately returns the required metrics.

**Independent Test**: Perform a `GET /api/reports/lawyers` or `GET /api/reports/subscriptions` using Postman using an Admin JWT.

### Implementation for User Story 1

- [x] T006 [US1] Create `IAnalyticsService.cs` interface in `src/Lawyer.Application/Interfaces/IAnalyticsService.cs` mapping the two report functionalities.
- [x] T007 [US1] Implement `AnalyticsService.cs` in `src/Lawyer.Application/Services/AnalyticsService.cs` pulling real-time LINQ aggregates from EF Core DbContext.
- [x] T008 [US1] Register `IAnalyticsService` to dependency injection container inside `src/Lawyer/Program.cs` (or standard module).
- [x] T009 [US1] Create `AdminReportsController.cs` in `src/Lawyer/Controllers/AdminReportsController.cs` marked with `[Authorize(Roles = "Admin")]`.
- [x] T010 [US1] Implement `GET /api/reports/lawyers` action endpoint in `AdminReportsController`.
- [x] T011 [US1] Implement `GET /api/reports/subscriptions` action endpoint in `AdminReportsController`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently via Postman.

---

## Phase 4: User Story 2 - Lawyer Active Status Management (Priority: P2)

**Goal**: Admins can suspend/unsuspend a lawyer without resetting their entire entity payload. 

**Independent Test**: Execute a `PATCH /api/lawyers/{id}/status` with `{"isActive": false}`. Follow-up `GET` verifies changes.

### Implementation for User Story 2

- [x] T012 [P] [US2] Update `Lawyer.cs` in `src/Lawyer.Core/Entities/Lawyer.cs` ensuring `isActive` is explicitly defined and capable of simple boolean flips.
- [x] T013 [US2] Create DTO `UpdateLawyerStatusRequest.cs` in `src/Lawyer.Application/DTOs/Lawyers/UpdateLawyerStatusRequest.cs`.
- [x] T014 [US2] Extend existing Layer/Admin management service (e.g. `ILawyerManagementService` or `IAdminLawyerService`) in `src/Lawyer.Application/Interfaces/` with a `UpdateStatusAsync(id, isActive)` method.
- [x] T015 [US2] Implement the status update logic inside the corresponding service in `src/Lawyer.Application/Services/`, performing a discrete EF Core update to toggle `isActive` without overwriting unrelated data.
- [x] T016 [US2] Create or update `AdminLawyersController.cs` in `src/Lawyer/Controllers/AdminLawyersController.cs` marked with `[Authorize(Roles = "Admin")]`.
- [x] T017 [US2] Expose `PATCH /api/lawyers/{id}/status` HTTP endpoint inside `AdminLawyersController`.

**Checkpoint**: Admin can toggle active statuses for lawyers.

---

## Phase 5: User Story 3 - Subscription Plans Mutable Endpoints (Priority: P3)

**Goal**: Administrator can mutate future price points and plan attributes globally.

**Independent Test**: Use Postman to `PUT /api/plans/{id}`. `GET` should reflect modified price.

### Implementation for User Story 3

- [x] T018 [P] [US3] Review `Plan.cs` in `src/Lawyer.Core/Entities/Plan.cs` ensuring its fields are logically configured as mutable row variants.
- [x] T019 [P] [US3] Create DTO `UpdatePlanRequest.cs` in `src/Lawyer.Application/DTOs/Plans/UpdatePlanRequest.cs` establishing parameters `Price`, `Name`, etc.
- [x] T020 [US3] Create or extend `IPlanService.cs` in `src/Lawyer.Application/Interfaces/IPlanService.cs` adding `UpdatePlanAsync(id, request)`.
- [x] T021 [US3] Implement `UpdatePlanAsync` directly inside `src/Lawyer.Application/Services/PlanService.cs` managing standard database persistence via EF repository.
- [x] T022 [US3] Create or extend `AdminPlansController.cs` in `src/Lawyer/Controllers/AdminPlansController.cs` mapped with strictly `[Authorize(Roles = "Admin")]`.
- [x] T023 [US3] Add `PUT /api/plans/{id}` API route implementation that connects to `PlanService`.

**Checkpoint**: Modifications to Plans flow synchronously through EF into SQL Server.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and Post-phase safety checks

- [x] T024 Add validation checks (e.g. FluentValidation or DataAnnotations) for `UpdatePlanRequest` ensuring Price > 0 inside `src/Lawyer.Application`.
- [ ] T025 Execute E2E frontend verification.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Must run first.
- **Foundational (Phase 2)**: Immediate dependency.
- **User Stories (Phase 3+)**: Setup and foundation blocking US1. Afterward US1, US2, and US3 are effectively independent controllers/services meaning they can be worked on sequentially or completely in parallel.

### User Story Dependencies

- **User Story 1 (P1)**: Independent API reporting. Can be tackled by 1 developer.
- **User Story 2 (P2)**: Independent API mutation. Can be tackled concurrently.
- **User Story 3 (P3)**: Independent API mutation. Can be tackled concurrently.

### Parallel Opportunities

- DTO creation (`T003`, `T004`, `T005`) are fully parallel.
- Entities adjustments (`T012` and `T018`) exist in different data domains.
- If staffing allows, one AI agent or developer can implement `AdminReportsController` while another implements `AdminPlansController`.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational DTO phase.
2. Complete US1.
3. Independently verify `GET` endpoints with Admin JWT tokens using Postman mapped to Database records.

### Incremental Delivery

1. Integrate US1 (Reports) for the homepage and reports views.
2. Integrate US2 (Suspend toggles) directly into the UI Lawyer directory tables.
3. Integrate US3 (Plan mutability) behind the UI form editors.
