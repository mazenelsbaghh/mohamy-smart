# Research: Unify Workflow Architecture

## Decision 1: Frontend-Only Unification (Backend Deferred)

**Decision**: Unify all 7 frontend workflow pages to use Gen 3 patterns while keeping SmartAnalysis and PreparingStatementOfClaims backend services as-is.

**Rationale**: SmartAnalysis backend has 4+ dedicated tables (FactAnalysis, Defense, FinalPrayer, AiJob), 2,354 lines of code, per-defense N:1 AI sub-calls, CRUD endpoints, PDF generation, and chat features. Migrating it to WorkflowServiceBase would:
- Require collapsing 4+ tables into a single entity with JSON step outputs
- Break the per-defense analysis pattern (step 3 runs N AI calls)
- Require rewriting all 12 controller endpoints from caseId-based to workflowId-based
- Risk data loss during migration of existing cases
- Take 3-4 weeks minimum

The frontend can achieve the same UX consistency by:
- Using adapter patterns that map caseId-based responses to the same Redux state shape
- Using `useWorkflowSnapshotLoader` with a custom fetch function for SmartAnalysis
- Using DB WorkflowSnapshots for version history instead of localStorage

**Alternatives considered**:
- Full backend migration (rejected: 3-4 weeks, high risk)
- Hybrid: migrate SmartAnalysis to WorkflowServiceBase but keep custom endpoints (rejected: still breaks per-defense pattern)
- Do nothing (rejected: 7 P1/P2 bugs remain)

## Decision 2: SmartAnalysis Adapter Pattern

**Decision**: Extend `useWorkflowSnapshotLoader` to accept a custom `fetchSnapshot` function alongside the standard `restoreSnapshot` action, so SmartAnalysis can load snapshots from DB without needing a WorkflowServiceBase-backed API.

**Rationale**: SmartAnalysis already has workflow snapshots stored in the `WorkflowSnapshots` table (created by `createSnapshotInDb()` in CaseAnalysis.tsx). The hook just needs to know how to fetch them, which is a standard GET to `/WorkflowSnapshots/{id}`.

**Alternatives considered**:
- Inline snapshot loading per page (current approach — rejected: code duplication)
- New dedicated hook (rejected: adds complexity; extending existing hook is sufficient)

## Decision 3: Defense-Memo Facts Hook Migration

**Decision**: Migrate DefenseMemoPage from inline `parseCaseFacts` + `useState` to `useWorkflowFacts` hook.

**Rationale**: `useWorkflowFacts` persists fact selections in localStorage and provides API-backed fact adding. DefenseMemoPage currently loses fact selections on refresh.

**Alternatives considered**:
- Keep inline (rejected: inconsistent UX, loses data on refresh)

## Decision 4: SmartAnalysis Redux Slice Enhancement

**Decision**: Add `isReadOnly`, `snapshotLabel`, and `createdAt` fields to the `smartAnalysisSlice` to match the shape provided by `createWorkflowSlice`, enabling `versionLabel` support and snapshot mode.

**Rationale**: The `createWorkflowSlice` factory already provides these fields for Gen 3 workflows. SmartAnalysis uses a hand-written slice that lacks them. Adding these fields makes the slice compatible with shared components like `CaseHeaderBanner` and `useWorkflowSnapshotLoader`.

**Alternatives considered**:
- Migrate smartAnalysisSlice to use `createWorkflowSlice` factory (rejected: would require thunk signature changes that assume WorkflowServiceBase backend routing)
- Keep separate (rejected: prevents using shared hooks)

## Decision 5: DefenseMemoPage Step Number Alignment

**Decision**: Keep `stepNumber: active + 1` pattern in DefenseMemoPage but add `active > 0` guard on auto-save, matching the effective behavior of Gen 3 pages.

**Rationale**: DefenseMemoPage outputs are keyed 1-5 (matching the 5 tab steps). The `active` state is 0-4 (tab indices). This means `outputs[active + 1]` correctly maps tab index to output key. Changing to `outputs[active]` would require renumbering all outputs and updating the backend, which is high-risk with no UX benefit.

**Alternatives considered**:
- Renumber outputs to 0-4 (rejected: requires backend + frontend changes, breaks existing data)
- Switch to `outputs[active]` pattern (rejected: same reason)
