# Quickstart: Persistent AI Job State

**Branch**: `017-persist-ai-job-state`  
**Date**: 2026-04-08

This guide gets the feature running locally from scratch for both backend and frontend development.

---

## Prerequisites

- Docker running (`make dev` already works — see project root Makefile)
- Backend on port 8976, Lawyer Dashboard on port 5078

---

## Backend Setup

### 1. Install Hangfire packages

In `mohamy-smart-backend/Lawyer/`:
```bash
dotnet add package Hangfire.AspNetCore
dotnet add package Hangfire.SqlServer
```

In `mohamy-smart-backend/Lawyer.Application/`:
```bash
dotnet add package Hangfire.Core
```

### 2. Install SignalR (already in ASP.NET Core — no package needed)

SignalR is part of `Microsoft.AspNetCore.App`. No additional package required.

### 3. Apply EF Core migration

After adding the `AiJob` entity and updating `ApplicationDbContext`:

```bash
cd mohamy-smart-backend
dotnet ef migrations add AddAiJobsTable --project Lawyer.Infrastructure --startup-project Lawyer
make db-migrate   # or: dotnet ef database update --project Lawyer.Infrastructure --startup-project Lawyer
```

### 4. Configure Hangfire in Program.cs

```csharp
// In Lawyer/Program.cs — add after existing services

builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfireServer();

// Add SignalR
builder.Services.AddSignalR();

// ↓ Register new services
builder.Services.AddScoped<IAiJobService, AiJobService>();
builder.Services.AddScoped<IAiJobDispatcher, AiJobDispatcher>();
```

```csharp
// In Lawyer/Program.cs — in the app pipeline (after app.UseAuthorization())

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAdminAuthFilter() }
});

app.MapHub<AiJobHub>("/hubs/ai-jobs");
```

### 5. Verify Hangfire dashboard

Navigate to `http://localhost:8976/hangfire` — you should see the Hangfire dashboard. It requires an Admin JWT (controlled by `HangfireAdminAuthFilter`).

---

## Frontend Setup

### 1. Install SignalR client

```bash
cd mohamy-smart-lawyer-dashboard
npm install @microsoft/signalr
```

### 2. Environment variable check

`.env.local` should already have:
```
VITE_API_BASE_URL=http://localhost:8976/api
```

The SignalR hub URL is derived by stripping `/api`:
```typescript
const hubUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '') + '/hubs/ai-jobs';
```

### 3. Add aiJobsSlice to the Redux store

In `src/redux/store.ts`, add the new reducer:
```typescript
import aiJobsReducer from './aiJobs/aiJobsSlice';

// In configureStore reducers:
aiJobs: aiJobsReducer,
```

---

## Testing the Feature End-to-End

1. Open a case in the Lawyer Dashboard (`http://localhost:5078/cases/{id}`)
2. Navigate to the Smart Analysis tab
3. Click "تحليل الوقائع" (Fact Analysis) — the frontend submits `POST /cases/{id}/ai-jobs` with `stepType: "FactAnalysis"`
4. Observe the UI shows "جاري المعالجة..." (Processing)
5. **Refresh the page** — the UI should still show "جاري المعالجة..." without re-submitting
6. Wait for Hangfire to complete the job — the result appears automatically via SignalR push
7. **Refresh again** — the result is immediately shown (restored from `GET /cases/{id}/ai-jobs`)

---

## Hangfire Job Processing Verification

Check the Hangfire dashboard at `http://localhost:8976/hangfire`:
- **Enqueued**: Jobs waiting to be picked up
- **Processing**: Jobs currently running
- **Succeeded**: Completed jobs (result saved to DB)
- **Failed**: Jobs that exhausted retries (user sees retry button)
