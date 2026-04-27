---
description: "Task list for Phase 3 Performance and Database Optimization"
---

# Tasks: Phase 3 Performance and Database Optimization

**Input**: Design documents from `/specs/053-phase3-performance-db/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-pagination.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Create PaginatedList DTO model in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Models/PaginatedList.cs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Add RowVersion property with [Timestamp] to WorkflowBase in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Entities/WorkflowBase.cs
- [ ] T003 Update financial Amount fields from float to decimal(18,2) in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Entities/Payment.cs

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Optimized AI Usage Reports (Priority: P1) 🎯 MVP

**Goal**: As an administrator, I want to view AI usage reports quickly without the system loading unnecessary data into memory.

**Independent Test**: Can be fully tested by generating a large amount of AI usage data and verifying that the report endpoint responds within acceptable limits without high RAM consumption.

### Implementation for User Story 1

- [ ] T004 [P] [US1] Add [Index] attributes for optimized querying to AiUsageRecord in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Entities/AiUsageRecord.cs
- [ ] T005 [US1] Refactor AiUsageReportService to use SQL-side IQueryable.GroupBy and AsNoTracking() in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiUsageReportService.cs (depends on T004)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Paginated Data Retrieval (Priority: P1)

**Goal**: As a user or administrator, I want lists of clients and reports to be paginated.

**Independent Test**: Can be fully tested by requesting clients or admin reports and verifying that only a single page of results (and total count) is returned.

### Implementation for User Story 2

- [x] T006 [P] [US2] Add [Index] attributes for pagination sorting/filtering to Client in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Entities/Client.cs
- [x] T007 [US2] Update ClientService endpoints to return PaginatedList<Client> using Skip/Take in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/ClientService.cs (depends on T001, T006)
- [x] T008 [US2] Update AdminReportService queries to use AsNoTracking and return PaginatedList in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminReportService.cs (depends on T001)
- [x] T009 [P] [US2] Update frontend api client for Clients pagination in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/services/ClientService.ts
- [x] T010 [P] [US2] Update frontend api client for Admin Reports pagination in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/services/ReportService.ts
- [x] T011 [US2] Wire HeroUI Pagination component and handle PaginatedList response for Clients list in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/clients/Clients.tsx (depends on T009)
- [x] T012 [US2] Wire Pagination component and handle PaginatedList response for Admin Reports in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/pages/reports/Reports.tsx (depends on T010)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - High-Precision Payment Calculations (Priority: P1)

**Goal**: As a user processing payments, I want the system to calculate financial amounts accurately without floating-point errors.

**Independent Test**: Can be fully tested by executing a payment calculation with edge-case amounts and verifying the exact decimal outputs.

### Implementation for User Story 3

- [x] T013 [P] [US3] Refactor PaymobService calculation logic to strictly use decimal types instead of float in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PaymobService.cs (depends on T003)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Concurrent Workflow Processing (Priority: P1)

**Goal**: As a system handling multiple simultaneous users, I want to ensure that workflow steps update safely even when concurrent requests occur.

**Independent Test**: Can be fully tested by simulating simultaneous requests updating the same workflow step and ensuring only one succeeds.

### Implementation for User Story 4

- [x] T014 [P] [US4] Catch DbUpdateConcurrencyException in WorkflowServiceBase and return Result.Error with HTTP 409 status in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/WorkflowServiceBase.cs (depends on T002)
- [x] T015 [US4] Add error interceptor or reducer logic for 409 Concurrency Conflict to prompt reload in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/workflow/workflowSlice.ts (depends on T014)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T016 Generate EF Core Migration to apply RowVersion, indices, and decimal schema changes by running dotnet ef migrations add Phase3PerformanceDb in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Can start after Foundational (Phase 2)
- **User Story 3 (P1)**: Can start after Foundational (Phase 2)
- **User Story 4 (P1)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- Foundational DB model changes (T002, T003) can be done in parallel.
- US1, US2, US3, US4 backend services can be updated in parallel once models are ready.
- US2 frontend implementations (Lawyer Dashboard vs Admin Dashboard) can be developed in parallel.

---

## Implementation Strategy

### Incremental Delivery

1. Complete Setup + Foundational (DB Model Updates)
2. Add User Story 1 (AiUsage Reports Backend Optimization) → Deploy/Demo
3. Add User Story 3 (Payment Precision) → Deploy/Demo
4. Add User Story 4 (Workflow Concurrency) → Deploy/Demo
5. Add User Story 2 (Client & Report Pagination Front+Back) → Deploy/Demo
