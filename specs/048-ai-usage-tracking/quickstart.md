# Quickstart: AI Usage & Cost Tracking

**Branch**: `048-ai-usage-tracking` | **Date**: 2026-04-16

## Prerequisites

- Local dev environment running (`make dev`)
- Database migrated (`make db-migrate`)

## Setup Steps

### 1. Apply Database Migration

```bash
cd mohamy-smart-backend
dotnet ef migrations add AddAiUsageRecords \
  --project Lawyer.Infrastracture \
  --startup-project Lawyer \
  --context AppDbContext

make db-migrate
```

This creates the `AiUsageRecords` table with indexes on `LawyerId`, `CreatedAt`, `AiStepType`, and `Provider`.

### 2. Verify Backend

```bash
# Start backend
cd mohamy-smart-backend
dotnet run --project Lawyer

# Check Swagger for new endpoints:
# GET  /api/ai-usage/summary
# GET  /api/ai-usage/lawyers
# GET  /api/ai-usage/lawyers/{lawyerId}
# GET  /api/ai-usage/models
```

All endpoints require Admin JWT.

### 3. Test Usage Recording

After the backend is running, make any AI call as a lawyer (e.g., run Smart Analysis). Then check the admin endpoints:

```bash
# Get admin token first, then:
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:8976/api/ai-usage/summary
```

You should see non-zero `totalRequests` and `totalCostUsd`.

### 4. Verify Admin Dashboard

```bash
cd mohamy-smart-admin-dashboard
npm run dev
# Open http://localhost:5079
# Navigate to "تكاليف الذكاء الاصطناعي" in sidebar
```

## Key Files to Verify

| Component | File | What to Check |
|-----------|------|--------------|
| Entity | `Lawyer.Core/Models/AiUsageRecord.cs` | Exists with correct fields |
| Provider | `Lawyer.Application/Services/AI/GeminiProvider.cs` | Returns `AIResponse` with usage |
| Tracking | `Lawyer.Application/Services/AiUsageTrackingService.cs` | Records usage async |
| Reports | `Lawyer.Application/Services/AiUsageReportService.cs` | Aggregation queries work |
| Controller | `Lawyer/Controllers/AiUsageController.cs` | 4 Admin-only endpoints |
| DB | Migration file | `AiUsageRecords` table created |
| Redux | `src/redux/aiUsage/aiUsageSlice.ts` | State + thunks |
| Page | `src/pages/aiUsage/AiUsage.tsx` | Renders stats + chart + table |
| Route | `src/router/AppRouter.tsx` | `/ai-usage` route registered |
| Sidebar | `src/components/public/sidebar/Sidebar.tsx` | Nav link points to `/ai-usage` |

## Rollback

If something goes wrong:

1. **Remove migration**: `dotnet ef migrations remove` (before applying)
2. **Drop table**: `DROP TABLE AiUsageRecords` (after applying, if needed)
3. No data loss risk — usage records are append-only analytics, not operational data.
