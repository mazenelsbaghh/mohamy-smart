# Quickstart: Phase 0 — Stabilize & Patch

**Branch**: `044-stabilize-patch`
**Date**: 2026-04-14

## Prerequisites

- Node.js 22+ and npm installed
- .NET 9 SDK installed
- Docker Desktop running (for SQL Server)
- Branch `044-stabilize-patch` checked out

## Setup

```bash
# 1. Start local environment (SQL Server + all services)
make dev

# 2. Apply any pending database migrations
make db-migrate

# 3. Verify backend compiles
cd mohamy-smart-backend
dotnet build
cd ..

# 4. Verify frontend compiles
cd mohamy-smart-lawyer-dashboard
npm install
npm run build
cd ..
```

## Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `mohamy-smart-lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts` | Add `isSaving` guard, fix unmount cleanup, add error handling | 🔴 P1 |
| `mohamy-smart-lawyer-dashboard/src/pages/auth/ForgotPassword.tsx` | Replace form with unavailability notice | 🟡 P3 |
| `mohamy-smart-lawyer-dashboard/src/pages/tasks/TasksPage.tsx` | Remove 2 `console.log` statements (lines 37, 66) | 🟡 P2 |
| `mohamy-smart-lawyer-dashboard/src/components/forms/AddNewContractsForm.tsx` | Remove 1 `console.log` (line 20) | 🟡 P2 |

## Files NOT to Modify (Research Clarification)

| File | Reason |
|------|--------|
| `AppealBriefService.cs` | Already extends `WorkflowServiceBase` with `ICaseAccessValidator` — CRIT-02 resolved |
| `rulingAnalysisAiSlice.ts` | NOT dead code — actively used by 5 components. Defer to future phase |

## Verification

```bash
# After all changes, verify:

# 1. Backend builds
cd mohamy-smart-backend && dotnet build && cd ..

# 2. Frontend builds
cd mohamy-smart-lawyer-dashboard && npm run build && cd ..

# 3. No console.log in production code
grep -r "console.log" mohamy-smart-lawyer-dashboard/src --include="*.tsx" --include="*.ts" \
  --exclude-dir="node_modules" --exclude-dir="__tests__"

# 4. Git status clean
git status
```

## Key Decisions from Research

1. **AppealBrief security**: Already fixed. Verify only.
2. **Legacy Redux slice**: Keep it — actively used. Not dead code.
3. **Auto-save failures**: Fail silently, retry on next debounce.
4. **Multi-tab saves**: Last-write-wins, no cross-tab protection.
5. **ForgotPassword**: Frontend-only unavailability notice.
