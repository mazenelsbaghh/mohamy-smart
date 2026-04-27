---
description: "Task list for Admin Analytics Dashboard"
---

# Tasks: Admin Analytics Dashboard

**Input**: Design documents from `/specs/056-admin-analytics/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend feature folder structure in `mohamy-smart-backend/Lawyer.Application/DTOs/Analytics/` and `mohamy-smart-backend/Lawyer.Application/Interfaces/`
- [x] T002 Create frontend feature folder structure in `mohamy-smart-admin-dashboard/src/features/analytics/` and `mohamy-smart-admin-dashboard/src/pages/analytics/components/`
- [x] T003 [P] Install recharts library via npm in `mohamy-smart-admin-dashboard/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T004 Define `IAnalyticsRepository` interface in `mohamy-smart-backend/Lawyer.Core/Interfaces/IAnalyticsRepository.cs`
- [x] T005 Define `IAnalyticsService` interface in `mohamy-smart-backend/Lawyer.Application/Interfaces/IAnalyticsService.cs`
- [x] T006 Implement empty `AnalyticsController` protected by Admin role in `mohamy-smart-backend/Lawyer/Controllers/AnalyticsController.cs`
- [x] T007 [P] Create initial Redux setup for analytics in `mohamy-smart-admin-dashboard/src/features/analytics/analyticsSlice.ts`
- [x] T008 [P] Register the `/analytics` route with `AdminRoute` wrapper in `mohamy-smart-admin-dashboard/src/App.tsx`
- [x] T009 Create shell `AnalyticsDashboard` container component in `mohamy-smart-admin-dashboard/src/pages/analytics/AnalyticsDashboard.tsx`

**Checkpoint**: Foundation ready - basic dashboard route works and backend controller is secured.

---

## Phase 3: User Story 1 - Financial Health Monitoring (Priority: P1) 🎯 MVP

**Goal**: View detailed financial metrics (MRR, Total Revenue, Refunds, ARPU).

**Independent Test**: Can be fully tested by verifying the financial KPI cards load and display correct aggregated DB data.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create `FinancialMetricsDto` in `mohamy-smart-backend/Lawyer.Application/DTOs/Analytics/FinancialMetricsDto.cs`
- [x] T011 [US1] Implement financial aggregations in `mohamy-smart-backend/Lawyer.Infrastructure/Repositories/AnalyticsRepository.cs`
- [x] T012 [US1] Implement financial service logic in `mohamy-smart-backend/Lawyer.Application/Services/AnalyticsService.cs`
- [x] T013 [US1] Implement `GET /api/analytics/financial` endpoint in `mohamy-smart-backend/Lawyer/Controllers/AnalyticsController.cs`
- [x] T014 [US1] Wire API client method `getFinancialMetrics` in `mohamy-smart-admin-dashboard/src/features/analytics/analyticsService.ts`
- [x] T015 [US1] Implement Redux thunk and state handling for financial metrics in `mohamy-smart-admin-dashboard/src/features/analytics/analyticsSlice.ts`
- [x] T016 [US1] Create `FinancialKPIs` UI component using HeroUI cards in `mohamy-smart-admin-dashboard/src/pages/analytics/components/FinancialKPIs.tsx`
- [x] T017 [US1] Wire `FinancialKPIs` component into `AnalyticsDashboard.tsx`

**Checkpoint**: At this point, User Story 1 is functional, showing MRR and Revenue.

---

## Phase 4: User Story 2 - Subscription Lifecycle Tracking (Priority: P1)

**Goal**: Track the lifecycle of user subscriptions (new, one-month churners, renewals, upgrades, refunds).

**Independent Test**: Can be fully tested by validating the subscription flow table and categorization logic.

### Implementation for User Story 2

- [x] T018 [P] [US2] Create `SubscriptionLifecycleDto` in `mohamy-smart-backend/Lawyer.Application/DTOs/Analytics/SubscriptionLifecycleDto.cs`
- [x] T019 [US2] Implement subscription lifecycle aggregations in `mohamy-smart-backend/Lawyer.Infrastructure/Repositories/AnalyticsRepository.cs`
- [x] T020 [US2] Implement subscription service logic in `mohamy-smart-backend/Lawyer.Application/Services/AnalyticsService.cs`
- [x] T021 [US2] Implement `GET /api/analytics/subscriptions` endpoint in `mohamy-smart-backend/Lawyer/Controllers/AnalyticsController.cs`
- [x] T022 [US2] Wire API client method `getSubscriptionMetrics` in `mohamy-smart-admin-dashboard/src/features/analytics/analyticsService.ts`
- [x] T023 [US2] Implement Redux thunk and state handling for subscriptions in `mohamy-smart-admin-dashboard/src/features/analytics/analyticsSlice.ts`
- [x] T024 [US2] Create `SubscriptionLifecycle` UI component using Recharts in `mohamy-smart-admin-dashboard/src/pages/analytics/components/SubscriptionLifecycle.tsx`
- [x] T025 [US2] Wire `SubscriptionLifecycle` component into `AnalyticsDashboard.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Lawyer Engagement and Usage Tracking (Priority: P2)

**Goal**: Monitor user engagement metrics (DAU, MAU, dormant users, super users) and AI feature adoption.

**Independent Test**: Engagement charts correctly display DAU/MAU and highlight power users.

### Implementation for User Story 3

- [x] T026 [P] [US3] Create `UserEngagementDto` in `mohamy-smart-backend/Lawyer.Application/DTOs/Analytics/UserEngagementDto.cs`
- [x] T027 [US3] Implement DAU/MAU and Power User queries in `mohamy-smart-backend/Lawyer.Infrastructure/Repositories/AnalyticsRepository.cs`
- [x] T028 [US3] Implement engagement service logic in `mohamy-smart-backend/Lawyer.Application/Services/AnalyticsService.cs`
- [x] T029 [US3] Implement `GET /api/analytics/engagement` endpoint in `mohamy-smart-backend/Lawyer/Controllers/AnalyticsController.cs`
- [x] T030 [US3] Wire API client method `getEngagementMetrics` in `mohamy-smart-admin-dashboard/src/features/analytics/analyticsService.ts`
- [x] T031 [US3] Implement Redux thunk and state handling for engagement in `mohamy-smart-admin-dashboard/src/features/analytics/analyticsSlice.ts`
- [x] T032 [US3] Create `UserEngagement` UI component using Recharts line charts in `mohamy-smart-admin-dashboard/src/pages/analytics/components/UserEngagement.tsx`
- [x] T033 [US3] Wire `UserEngagement` component into `AnalyticsDashboard.tsx`

**Checkpoint**: Financial, Subscriptions, and Engagement analytics are all operational.

---

## Phase 6: User Story 4 - Cohort Analysis for User Retention (Priority: P3)

**Goal**: View a cohort analysis of user retention over time.

**Independent Test**: The heatmap correctly displays retention percentages for subsequent months.

### Implementation for User Story 4

- [x] T034 [P] [US4] Create `CohortDataDto` in `mohamy-smart-backend/Lawyer.Application/DTOs/Analytics/CohortDataDto.cs`
- [x] T035 [US4] Implement cohort grouping queries in `mohamy-smart-backend/Lawyer.Infrastructure/Repositories/AnalyticsRepository.cs`
- [x] T036 [US4] Implement cohort matrix assembly in `mohamy-smart-backend/Lawyer.Application/Services/AnalyticsService.cs`
- [x] T037 [US4] Implement `GET /api/analytics/cohorts` endpoint in `mohamy-smart-backend/Lawyer/Controllers/AnalyticsController.cs`
- [x] T038 [US4] Wire API client method `getCohortAnalysis` in `mohamy-smart-admin-dashboard/src/features/analytics/analyticsService.ts`
- [x] T039 [US4] Implement Redux thunk and state handling for cohorts in `mohamy-smart-admin-dashboard/src/features/analytics/analyticsSlice.ts`
- [x] T040 [US4] Create `CohortAnalysis` heatmap UI component in `mohamy-smart-admin-dashboard/src/pages/analytics/components/CohortAnalysis.tsx`
- [x] T041 [US4] Wire `CohortAnalysis` component into `AnalyticsDashboard.tsx`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T042 Refine the CSS layout of `AnalyticsDashboard.tsx` to use a responsive CSS grid matching the Pro Max design system.
- [ ] T043 Add loading skeletons for all widgets while Redux thunks are fetching in `mohamy-smart-admin-dashboard/src/pages/analytics/AnalyticsDashboard.tsx`
- [ ] T044 Verify API caching or optimization indexes in SQL Server for heavy analytics queries in `mohamy-smart-backend/Lawyer.Infrastructure/LawyerDbContext.cs`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Can start after Foundational (Phase 2)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2)
- **User Story 4 (P3)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Different user stories (US1 through US4) can be developed in parallel since they involve separate DTOs, endpoints, and frontend components.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (Dashboard shows financial KPIs)

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 (Financial)
3. Add User Story 2 (Subscriptions)
4. Add User Story 3 (Engagement)
5. Add User Story 4 (Cohorts)
6. Run Phase 7 (Polish) to ensure everything looks cohesive and performs fast.
