# Data Model: Workflow Tabs & Step Navigation

**Branch**: `066-fix-workflow-tabs-nav` | **Date**: 2026-04-28

## New Entities

### UseWorkflowOrchestratorConfig

Configuration object passed to `useWorkflowOrchestrator` by each workflow page.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sliceSelector` | `(state: RootState) => TypedWorkflowState<TOutputs>` | Yes | Selector for the workflow's Redux slice |
| `thunks` | `IWorkflowThunks` | Yes | Thunk actions from `createWorkflowThunks` |
| `restoreSnapshot` | `ActionCreator` | Yes | Redux action to restore a snapshot |
| `resetWorkflow` | `ActionCreator` | Yes | Redux action to reset the slice |
| `workflowPrefix` | `string` | Yes | Prefix for facts localStorage key |
| `maxSteps` | `number` | Yes | Total workflow steps (0-indexed: 0 to maxSteps) |
| `steps` | `StepMeta[]` | Yes | Step labels and icons for tab bar |
| `isCaseIdBased` | `boolean` | No | `true` for DefenseMemo/StatementOfClaims |
| `abandonThunk` | `AsyncThunk` | No | Required only for caseId-based workflows |
| `stepNumberMapFn` | `(active: number) => number \| null` | No | Custom step-to-output-key mapping (DefenseMemo) |
| `computeMaxStepAllowed` | `(outputs: TOutputs, jobs: AiJobs) => number` | No | Override default maxStepAllowed computation |

### StepMeta

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Step identifier |
| `label` | `string` | Arabic label shown in tab |
| `icon` | `ReactNode` | Icon shown in tab |

### UseWorkflowOrchestratorReturn

Return value from `useWorkflowOrchestrator`.

| Field | Type | Description |
|-------|------|-------------|
| `active` | `number` | Current active step (0-based) |
| `setActive` | `(step: number) => void` | Set active step |
| `nextStep` | `() => void` | Advance to next step |
| `prevStep` | `() => void` | Go back one step |
| `maxStepAllowed` | `number` | Furthest navigable step |
| `caseId` | `string \| undefined` | Current case ID |
| `workflowId` | `number \| null` | Current workflow ID |
| `isFreshRun` | `boolean` | Whether this is a fresh start |
| `isReadOnly` | `boolean` | Whether viewing a snapshot |
| `snapshotModeRef` | `MutableRefObject<boolean>` | Snapshot mode flag |
| `workflowState` | `TypedWorkflowState<TOutputs>` | Full workflow Redux state |
| `singleCase` | `TCase \| null` | Case data for banner |
| `caseFacts` | `string[]` | All case facts |
| `setCaseFacts` | `Dispatch<SetStateAction<string[]>>` | Update case facts |
| `selectedFacts` | `string[]` | Selected fact indices |
| `setSelectedFacts` | `Dispatch<SetStateAction<string[]>>` | Update selected facts |
| `handleManualSave` | `() => Promise<void>` | Trigger manual save |
| `isLoading` | `boolean` | Whether workflow is loading (for SmartAnalysisLoader) |
| `tabsClassNames` | `Record<string, string>` | Shared tab styling |

## State Transitions

### Workflow Page Lifecycle

```
[Page Mount]
    │
    ├── snapshot? ──→ [Load Snapshot] ──→ [Restore & Set Active] ──→ [Ready (ReadOnly)]
    │
    ├── fresh=1? ──→ [Reset AI Jobs] ──→ [Start New Workflow] ──→ [Redirect to ?workflowId=X]
    │                                                            or [Navigate same URL]
    │
    └── default ──→ [Get Workflow]
                        │
                        ├── found ──→ [Hydrate State] ──→ [Auto-Resume to maxStepAllowed]
                        │
                        └── not found ──→ [Start New Workflow] ──→ [Hydrate State]

[Ready]
    │
    ├── Tab Click ──→ step <= max(active, maxStepAllowed)? ──→ [Set Active] ──→ [Render Step]
    │                                                          └── [Ignore] (tab disabled)
    │
    ├── AI Job Completes ──→ [Update maxStepAllowed] ──→ [Auto-Resume if first load]
    │
    ├── Step Output Changes ──→ [Auto-Save (debounced)]
    │
    └── Unmount ──→ [Reset Slice]
```

### Step Navigation Guard

```
Tab Click(stepIndex)
    │
    ├── stepIndex <= active ──→ ALLOW (going backward)
    │
    ├── stepIndex <= maxStepAllowed ──→ ALLOW (going forward to reached step)
    │
    └── stepIndex > maxStepAllowed ──→ DENY (tab disabled)
```

## Validation Rules

- `maxSteps` must match the actual number of rendered steps (steps.length - 1 since 0-indexed with facts review)
- `workflowPrefix` must be unique per workflow to prevent localStorage key collisions
- `stepNumberMapFn` must return `null` for step 0 (facts review is never auto-saved)
- `computeMaxStepAllowed` must return a value between 0 and `maxSteps`
- `isLoading` is `true` when `loadingState.isFetchingWorkflow || !workflowId` (for caseId-based: `!caseId`)
