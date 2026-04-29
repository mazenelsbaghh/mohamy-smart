# Quickstart: Workflow Architecture Audit & Unification

**Feature**: 067-workflow-audit-unify
**Date**: 2026-04-28

## Prerequisites

- Environment running on canonical ports (`make dev`)
- Backend serving at `http://localhost:8976`
- Lawyer Dashboard serving at `http://localhost:5078`
- A case with data available (e.g., case ID from spec URL)

## Development Workflow

### 1. Run Tests

```bash
cd apps/lawyer-dashboard && npm test && npm run lint
```

### 2. Start Dev Server

```bash
make dev
# or: cd apps/lawyer-dashboard && npm run dev
```

### 3. Test Case URL

```
http://localhost:5078/cases/5bd6a3e3-0032-4ec2-bb2e-08dea41b944d
```

## Verification Checklist (per bug fix)

### BUG-001: Tab navigation fix
1. Go to CaseDetails → Analysis tab
2. Click "نسخة سابقة" button
3. ✅ History tab activates automatically

### BUG-002: isReadOnly reset
1. Open a snapshot in read-only mode
2. Click "بدء واحدة جديدة"
3. ✅ New workflow page is editable (can type/interact)

### BUG-003: DefenseMemoPage migration
1. Start defense-memo workflow → step through all 5 steps
2. ✅ Tab click-guarding works (can't click future steps)
3. ✅ Auto-save fires (AutoSaveButton shows status)
4. ✅ Per-defense analysis cache hydrates step 3

### BUG-004-007: Shared constants & utils
1. Change a step label in `workflowConstants.ts`
2. ✅ Label updates in all 7 workflow pages + CaseAnalysis + CaseSummary

### BUG-008: Unified shell
1. Open AdminComplaint step 1 → ✅ Loading state matches other workflows
2. Open LegalWarning step 1 → ✅ Same loading/error patterns

### BUG-009: DocumentSelection
1. Navigate to DocumentSelection
2. ✅ All 7 workflows listed with correct icons from catalog

### BUG-010: Snapshot count refresh
1. Start new version → abandon creates snapshot
2. Navigate back to CaseDetails
3. ✅ Badge count updated

### BUG-011: SnapshotsHistory navigation
1. Open SnapshotsHistory → click "استكمال" on current version
2. ✅ Correct workflow instance loads (check URL has ?workflowId)

## Key Files to Watch

| File | What to verify |
|------|---------------|
| `useWorkflowOrchestrator.ts` | All 7 pages use it; DefenseMemo callbacks work |
| `workflowConstants.ts` | Step definitions for all 7 workflows |
| `UnifiedStepShell.tsx` | Loading/error/content states consistent |
| `createWorkflowSlice.ts` | `isReadOnly = false` in startWorkflow handler |
| `CaseDetails.tsx` | Tab switching from location.state works |
| `DefenseMemoPage.tsx` | Reduced to ~100 lines using orchestrator |

## No New Dependencies

This feature uses only existing project dependencies. No `npm install` required.
