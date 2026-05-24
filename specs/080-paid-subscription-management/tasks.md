# Tasks: Paid Subscription Management

**Input**: Design documents from `/specs/080-paid-subscription-management/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/admin-subscription-api.md, quickstart.md  
**Target Prompt**: Create the tasks file so that a cheaper LLM model can implement it without problems.

## Phase 1: Setup

**Purpose**: Verify current files and protect existing behavior before implementation.

- [x] T001 Inspect existing admin subscription files and confirm current endpoint paths in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/Subscriptions.tsx`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SubscriptionService.cs`.

---

## Phase 2: Foundational

**Purpose**: Add shared paid/trial contract fields used by all stories.

- [x] T002 Add `Price`, `IsTrial`, and `IsPaid` properties to `LawyerSubscriptionDto` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/SubscriptionDto.cs`.
- [x] T003 Update `GetLawyersPlanAsync` interface signature in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/ISubscriptionService.cs` to accept `bool? isPaid` after `bool? isActive`.
- [x] T004 Update `GetLawyersPlan` action in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/SubscriptionController.cs` to bind `[FromQuery] bool? isPaid` and pass it to the service.

**Checkpoint**: Backend contract can represent paid/trial status and accept the new filter.

---

## Phase 3: User Story 1 - See Paid Subscribers Clearly (Priority: P1)

**Goal**: Admin subscription management answers who is on paid subscriptions, not trials.

**Independent Test**: Open `/subscriptions` with mixed data and confirm latest subscriptions table contains paid rows only by default.

- [x] T005 [US1] Add a private `IsTrialPlan(Subscription plan)` helper in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SubscriptionService.cs` that returns true when `plan.Price <= 0` or name is `"الباقة التجريبية"` or `"Free Trial"`.
- [x] T006 [US1] Update `SubscribeAsync` result mapping in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SubscriptionService.cs` to populate `Price`, `IsTrial`, and `IsPaid`.
- [x] T007 [US1] Update `GetLawyerPlanAsync` result mapping in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SubscriptionService.cs` to populate `Price`, `IsTrial`, and `IsPaid`.
- [x] T008 [US1] Update `GetLawyersPlanAsync` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SubscriptionService.cs` to include `Subscription`, filter by `isPaid` in query using `Subscription.Price > 0`, and map `Price`, `IsTrial`, and `IsPaid`.
- [x] T009 [US1] Extend `TLawyerSubscription` and thunk params in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/subscriptions/thunk/fetchSubscriptionsReport.ts` with `price`, `isTrial`, `isPaid`, and optional `isPaid` request query.
- [x] T010 [US1] Update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/Subscriptions.tsx` to dispatch `fetchSubscriptionsReport({ isPaid: true })`, use title `"آخر الاشتراكات المدفوعة"`, and render trial badge only as defensive fallback when `r.isTrial` is true.

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Separate Paid, Trial, and Total Metrics (Priority: P2)

**Goal**: Admin dashboard metrics separate paid, active paid, trial, inactive, and total subscriptions.

**Independent Test**: Compare dashboard card values against a known mixed dataset.

- [x] T011 [US2] Add `TotalPaid`, `ActivePaid`, and `TotalTrial` integer properties to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/AdminReport/SubscriptionsReportDto.cs`.
- [x] T012 [US2] Update `GetSubscriptionsReportAsync` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminReportService.cs` to compute `totalPaid`, `activePaid`, and `totalTrial` from loaded subscriptions using price and legacy trial-name fallback.
- [x] T013 [US2] Extend `TSubscriptionsReport` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/redux/reports/thunk/fetchSubscriptionsReport.ts` with `totalPaid`, `activePaid`, and `totalTrial`.
- [x] T014 [US2] Update the `StatsCards` props in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/Subscriptions.tsx` so the visible cards show paid subscribers, active paid subscribers, and trial subscribers with Arabic labels.

**Checkpoint**: User Story 2 is functional and testable independently after US1.

---

## Phase 5: User Story 3 - Filter Detailed Reports by Subscription Type (Priority: P3)

**Goal**: Detailed report supports all, paid-only, and trial-only filtering with empty states.

**Independent Test**: Open `/subscriptions/subscription-reports`, switch subscription type filters, and confirm rows update correctly.

- [x] T015 [US3] Add `subscriptionTypeFilter` state in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx` with values `""`, `"paid"`, and `"trial"`.
- [x] T016 [US3] Update the `useEffect` dispatch in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx` to pass both `isActive` and `isPaid` params to `fetchSubscriptionsReport`.
- [x] T017 [US3] Replace plan-name trial detection in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx` with `r.isTrial` and keep the Arabic `"تجريبية"` badge.
- [x] T018 [US3] Add a `FilterSelect` labeled `"نوع الاشتراك"` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx` with options `"الكل"`, `"مدفوعة فقط"`, and `"تجريبية فقط"`.
- [x] T019 [US3] Add an Arabic empty state in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx` that displays `"لا توجد اشتراكات مطابقة للفلاتر الحالية"` when `tableData.length === 0` and `isLoading` is false.

**Checkpoint**: User Story 3 is functional and testable independently after US1.

---

## Phase 6: Polish & Verification

**Purpose**: Validate compile, lint, and UX quality.

- [x] T020 Run `dotnet build mohamy-smart-backend/Lawyer.sln` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart` and fix compile errors in modified backend files.
- [x] T021 Run `npm run lint --workspace=apps/admin-dashboard` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart` and fix lint errors in modified admin dashboard files.
- [x] T022 Run `npm test --workspace=apps/admin-dashboard -- --run` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart` when available and record the result.
- [x] T023 Review modified subscription UI against `impeccable` product rules in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/Subscriptions.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx`: restrained color use, Arabic labels, stable empty state, no nested cards, no decorative motion.

---

## Dependencies & Execution Order

- Phase 1 must complete first.
- Phase 2 blocks all user stories.
- US1 is the MVP and should be implemented before US2 and US3 because it introduces the paid/trial contract.
- US2 depends on US1 only for frontend vocabulary, but backend aggregates are independently additive.
- US3 depends on T009 because it uses the `isPaid` thunk param.
- Polish runs after all selected user stories.

## Parallel Opportunities

- T002, T003, and T004 touch different files but should be reviewed together as one contract change.
- T011 and T013 can be done in parallel after US1 backend contract fields exist.
- T015, T018, and T019 touch the same file and should be sequential despite being UI-only.

## Implementation Strategy

1. Complete Setup and Foundational tasks.
2. Deliver US1 as the MVP: paid-only main subscription list.
3. Add US2 metrics for accurate dashboard cards.
4. Add US3 report filtering and empty state.
5. Run backend build, admin lint/tests, and UI/UX critique.
