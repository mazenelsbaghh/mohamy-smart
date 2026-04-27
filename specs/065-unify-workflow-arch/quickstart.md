# Quickstart: Unify Workflow Architecture

## Prerequisites

- Node 22+ and npm 11+
- Backend running on `http://localhost:8976`
- Lawyer Dashboard dev server: `cd apps/lawyer-dashboard && npm run dev`

## Testing the Changes

### 1. Resume Correctness (P1)

```bash
# Start lawyer dashboard
cd apps/lawyer-dashboard && npm run dev

# In browser:
# 1. Open a case with an in-progress defense-memo workflow (outputs at step 3-4)
# 2. Navigate to Case Analysis tab
# 3. Click "استكمال النسخة الحالية" on the defense-memo row
# 4. Verify: lands on step 3 (الطلبات), NOT step 4 (المذكرة النهائية)
# 5. Repeat for all 7 workflow types
```

### 2. Snapshot Viewing (P2)

```bash
# 1. Start a new workflow, complete at least 2 steps
# 2. Click "بدء واحدة جديدة" to abandon and create a snapshot
# 3. Go to case history tab
# 4. Click the snapshot version
# 5. Verify: version label shows "نسخة سابقة — مذكرة دفاع"
# 6. Verify: all tabs are read-only
```

### 3. State Cleanup (P2)

```bash
# 1. Open a workflow with saved data
# 2. Navigate to a different case
# 3. Navigate back to the first case
# 4. Verify: no stale data from previous visit
```

### 4. Type Checking

```bash
cd apps/lawyer-dashboard
npx tsc -b
```

### 5. Linting

```bash
cd apps/lawyer-dashboard
npm run lint
```

## Rollback

All changes are on branch `065-unify-workflow-arch`. If issues arise, switch back to the previous branch. No database migrations involved.
