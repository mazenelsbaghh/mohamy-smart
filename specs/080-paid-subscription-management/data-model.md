# Data Model: Paid Subscription Management

## LawyerSubscriptionDto

Represents one lawyer subscription row returned to the admin dashboard.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `lawyerId` | Guid | Yes | Existing lawyer identifier |
| `lawyerName` | string | Yes | Display name from linked application user |
| `planName` | string | Yes | Display plan name |
| `price` | decimal | Yes | Plan monthly/base price used for paid classification |
| `isTrial` | bool | Yes | `true` when plan is free/trial |
| `isPaid` | bool | Yes | `true` when plan price is greater than zero |
| `startDate` | DateTime | Yes | Subscription start date |
| `endDate` | DateTime | Yes | Subscription end date |
| `usedAiRequests` | int | Yes | Usage count |
| `limit` | int | Yes | Plan AI request limit |
| `isActive` | bool | Yes | Existing active flag |

### Validation Rules

- `isPaid` must be `true` only when `price > 0`.
- `isTrial` must be `true` when `price <= 0` or the plan name matches a legacy trial name.
- `isActive` remains independent from `isPaid`; a paid subscription can be inactive.

## SubscriptionsReportDto

Represents aggregate admin subscription metrics.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `totalSubscriptions` | int | Yes | All subscription records |
| `totalActive` | int | Yes | All active subscription records |
| `totalInactive` | int | Yes | All inactive subscription records |
| `totalPaid` | int | Yes | All paid subscription records |
| `activePaid` | int | Yes | Active paid subscription records |
| `totalTrial` | int | Yes | All trial/free subscription records |
| `countPerPlan` | PlanCountDto[] | Yes | Existing plan distribution |
| `totalRevenue` | decimal | Yes | Successful payment sum |
| `churnedSubscriptions` | int | Yes | Inactive subscription count |
| `ledger` | PaginatedList<SubscriptionLedgerDto> | No | Existing payment ledger |

### Validation Rules

- `totalPaid + totalTrial` should equal `totalSubscriptions` for records with loaded plan data.
- `activePaid` must be less than or equal to `totalPaid`.
- Trial records must not increase `totalRevenue`.

## Admin Report Filters

Existing active filter is preserved and combined with subscription type filtering.

| Filter | Values | Behavior |
|--------|--------|----------|
| `isActive` | `true`, `false`, omitted | Filters active/inactive/all subscription records |
| `isPaid` | `true`, `false`, omitted | Filters paid/trial/all subscription records |
