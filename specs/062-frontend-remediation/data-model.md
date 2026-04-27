# Data Model: Frontend Remediation — Phases 2–5

**Branch**: `062-frontend-remediation` | **Date**: 2026-04-23

> **Note**: This feature does NOT introduce new database entities or schema changes. The data model below describes the **frontend state shapes** (Redux slices, component props, shared types) that will be modified or created.

---

## Entities Modified in Frontend State

### E-01: Admin Redux — Reports Slice State

**Current state shape** (problematic):
```
{
  isLoading: boolean,          // SHARED across 4 thunks — race condition
  lawyersReport: TLawyersReport | null,
  subscriptionsReport: TSubscriptionsReport | null,
  revenueReport: TRevenueReport | null,
  accountMessagingAudit: TAccountMessagingAudit | null,
  error: string | null
}
```

**Target state shape**:
```
{
  isLoadingLawyersReport: boolean,
  isLoadingSubscriptionsReport: boolean,
  isLoadingRevenueReport: boolean,
  isLoadingAccountMessaging: boolean,
  lawyersReport: TLawyersReport | null,
  subscriptionsReport: TSubscriptionsReport | null,
  revenueReport: TRevenueReport | null,
  accountMessagingAudit: TAccountMessagingAudit | null,
  error: string | null
}
```

**Validation rules**: Each loading flag is set by its corresponding thunk only (pending→true, fulfilled/rejected→false).

---

### E-02: Admin Redux — AI Usage Slice State

**Current state shape** (problematic):
```
{
  isLoading: boolean,          // SHARED across 4 thunks — race condition
  summary: AiUsageSummary | null,
  modelUsage: ModelUsage[] | [],
  lawyerUsage: LawyerUsage[] | [],
  lawyerUsageDetail: LawyerUsageDetail | null,
  error: string | null
}
```

**Target state shape**:
```
{
  isLoadingSummary: boolean,
  isLoadingModels: boolean,
  isLoadingLawyers: boolean,
  isLoadingLawyerDetail: boolean,
  summary: AiUsageSummary | null,
  modelUsage: ModelUsage[] | [],
  lawyerUsage: LawyerUsage[] | [],
  lawyerUsageDetail: LawyerUsageDetail | null,
  error: string | null
}
```

---

### E-03: Admin Redux — Subscriptions Slice (New Thunks)

**New thunks to add**:
- `fetchSubscriptionById(id: string)` — fetches single subscription details
- `fetchReviews()` — fetches reviews list
- `updateReviewStatus({ id, status })` — approve/reject review
- `fetchSubscriptionsChartData()` — fetches chart data

**New state fields**:
```
{
  subscriptionDetail: Subscription | null,
  isLoadingDetail: boolean,
  detailError: string | null,
  
  reviews: Review[],
  isLoadingReviews: boolean,
  reviewsError: string | null,
  
  chartData: ChartDataPoint[],
  isLoadingChart: boolean,
  chartError: string | null
}
```

---

### E-04: Shared Types — NotificationItem.type

**Current**:
```
interface NotificationItem {
  type: string;   // TOO BROAD
  ...
}
```

**Target**:
```
interface NotificationItem {
  type: 'info' | 'warning' | 'error' | 'success';
  ...
}
```

---

### E-05: Shared Types — Branded ISO Date

**New type to add**:
```
type ISODateString = string & { __brand: "ISODate" }
```

Used for date fields across shared-types to prevent accidental string assignment.

---

### E-06: Shared Types — TClient.email Alignment

**Current**: `TProfile` has `email: string` (required). Some app-local `TClient` types have `email: string | null` (nullable).

**Target**: Align all client-like types to use `email: string | null` consistently, matching the backend's nullable email field behavior.

---

### E-07: Shared Validations — Unified Regex

**Current phone regex**: `/^01[0125][0-9]{8}$/` (Egyptian mobile only)

**Target**: Accept both local and international formats:
```
/^(01[0125][0-9]{8}|\+20[0125][0-9]{9})$/
```

**Current password regex**: Defined in `shared-validations/common.ts` — will remain but be upgraded to Zod v4 API.

---

### E-08: Lawyer Redux — Cases Slice (Bug Fix)

**Bug**: `setPageNumber` action dispatched without `dispatch()` wrapper.

**Fix**: `onChange={(page) => dispatch(setPageNumber(page))}`

**Related**: Add `searchQuery` parameter to `thunkGetAllCases` for server-side filtering.

---

### E-09: Lawyer Hook — useWorkflowAutoSave

**Current**: `isSaving` tracked via `useRef` — changes don't trigger re-renders.

**Target**: `isSaving` tracked via `useState` — reactive for UI consumers.

---

### E-10: Landing Page — Pricing Plan Model

**Current**: 3 plans defined inline in `PricingPlans.tsx`. Professional plan features are copy-paste of basic plan.

**Target**: Professional plan has distinct features:
- Basic: "إدارة حتى 50 قضية", "مساعد ذكي أساسي", "دعم فني عبر البريد", "تقارير أساسية"
- Professional: Differentiated feature set (content TBD during implementation — at minimum distinct from basic)

---

## No Schema Changes

This feature modifies only:
- Frontend Redux state shapes (additive changes — new loading flags, new data fields)
- Shared TypeScript type definitions (narrower types, branded types)
- Zod validation schemas (API upgrade, regex update)

No database migrations. No backend API contract changes. No new backend endpoints.
