# Data Model: Admin Analytics

## Backend DTOs (Data Transfer Objects)

These DTOs will be returned by the `AnalyticsController` to the Admin Dashboard. They do not necessarily map 1:1 with DB tables, as they are aggregated reporting structures.

### FinancialMetricsDto
- `TotalRevenue`: decimal
- `MonthlyRecurringRevenue`: decimal
- `TotalRefunds`: decimal
- `AverageRevenuePerUser`: decimal

### SubscriptionLifecycleDto
- `TotalNewSubscribers`: int (This month)
- `OneMonthChurners`: int (Subscribed exactly one month ago and did not renew)
- `Renewals`: int
- `Upgrades`: int
- `Refunds`: int

### UserEngagementDto
- `DailyActiveUsers`: int
- `MonthlyActiveUsers`: int
- `DormantUsers`: int (Active subscription but no login > 14 days)
- `PowerUsersCount`: int

### CohortDataDto
- `CohortMonth`: string (e.g., "2026-01")
- `TotalUsers`: int
- `RetentionRates`: Dictionary<string, double> (Key: "Month 1", Value: 85.5)

### LawyerSubscriptionFlowDto
- `LawyerId`: string
- `LawyerName`: string
- `PlanName`: string
- `StartDate`: DateTime
- `IsActive`: bool
- `HasRenewed`: bool
- `HasRefunded`: bool
- `TotalPaid`: decimal

## Entity Framework Dependencies (Existing Entities)
The aggregations will rely on:
- `ApplicationUser` (for Join Date, LastLoginAt)
- `Subscription` (for Plan details, StartDate, EndDate, Status)
- `Payment` (for Revenue, Refunds, MRR calculations)
- `AiJob` / `ActivityLog` (for Power User calculations and AI adoption metrics)
