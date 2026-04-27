# Data Model: Unify Workflow Architecture

## Entity: smartAnalysisSlice State (Redux Enhancement)

The existing `smartAnalysisSlice` needs additional fields to match the Gen 3 `createWorkflowSlice` output shape. No database schema changes required.

### Current Shape (Gen 1)

```typescript
{
  caseId: string | null;
  workflowId: number | null;
  outputs: Record<number, unknown>;
  loadingState: {
    isLoading: boolean;
    isSavingStep: boolean;
    isAutoSaving: boolean;
    isRunningStep: boolean;
  };
  errorState: {
    loadError: string | null;
    saveError: string | null;
    autoSaveError: string | null;
    runError: string | null;
    hasConcurrencyConflict: boolean;
  };
  lastSavedAt: string | null;
}
```

### Enhanced Shape (Target)

```typescript
{
  caseId: string | null;
  workflowId: number | null;
  outputs: Record<number, unknown>;
  loadingState: { /* same */ };
  errorState: { /* same */ };
  lastSavedAt: string | null;
  currentStep: number | null;        // NEW: tracks active step for snapshot restore
  status: string | null;              // NEW: 'NotStarted' | 'InProgress' | 'Completed' | 'Abandoned'
  isReadOnly: boolean;                // NEW: true when viewing a snapshot
  snapshotLabel: string | null;       // NEW: label for the version banner
  createdAt: string | null;           // NEW: workflow creation timestamp
}
```

### New Actions

| Action | Payload | Purpose |
|--------|---------|---------|
| `restoreWorkflowSnapshot` | `{ outputs, currentStep, lastSavedAt }` | Restore from DB snapshot (used by `useWorkflowSnapshotLoader`) |
| `setReadOnly` | `boolean` | Toggle read-only mode for snapshot viewing |

## Entity: preparingStatementOfClaimsUnifiedSlice State (Redux Enhancement)

Same enhancement pattern as smartAnalysisSlice. Add `isReadOnly`, `snapshotLabel`, `createdAt` fields if not already present.

## Entity: useWorkflowSnapshotLoader Hook Extension

### Current Interface

```typescript
interface SnapshotLoaderConfig {
  snapshotId: string | null | undefined;
  restoreSnapshot: ActionCreator;
  fallbackStep: number;
  onLoaded: (step: number) => void;
}
```

### Extended Interface

```typescript
interface SnapshotLoaderConfig {
  snapshotId: string | null | undefined;
  restoreSnapshot: ActionCreator;
  resetWorkflow: ActionCreator;
  fallbackStep: number;
  onLoaded: (step: number) => void;
  stepMapFn?: (step: number) => number;  // NEW: custom step-to-tab mapping
}
```

The `stepMapFn` allows DefenseMemoPage to pass its custom mapping `{ 1: 1, 2: 2, 3: 2, 4: 3, 5: 4 }` while Gen 3 workflows continue using the default `Math.min(step, fallbackStep)`.

## No Database Schema Changes

All changes are frontend-only. The existing `WorkflowSnapshots` table already stores snapshots for all workflow types including defense-memo (written by `createSnapshotInDb()`).
