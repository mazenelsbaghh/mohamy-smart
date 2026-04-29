# Data Model: Workflow Architecture Audit & Unification

**Feature**: 067-workflow-audit-unify
**Date**: 2026-04-28

## Entities

### 1. StepMeta (Extended)

The step definition type used in workflow constants and consumed by all workflow pages.

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Unique step identifier (e.g., `"facts"`, `"legal-analysis"`, `"defenses"`) |
| label | `string` | Arabic display label (e.g., `"مراجعة الوقائع"`) |
| icon | `React.ComponentType` | HeroUI/custom icon component |

**Defined in**: `workflowConstants.ts` (7 new constants: `DEFENSE_MEMO_STEP_DEFS`, `STATEMENT_OF_CLAIMS_STEP_DEFS`, `APPEAL_BRIEF_STEP_DEFS`, `ADMIN_COMPLAINT_STEP_DEFS`, `RULING_ANALYSIS_STEP_DEFS`, `LEGAL_WARNING_STEP_DEFS`, `EXEC_REQUEST_STEP_DEFS`)

**Validation**: Each array length MUST match `WORKFLOW_CATALOG[id].totalSteps`. Step 0 is always facts review.

### 2. UseWorkflowOrchestratorConfig (Extended)

Extended config interface for the orchestrator hook.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| (existing 12 params) | ... | ... | See current interface |
| `onJobCompleted` | `(jobKey: string, job: AiJob, outputs: Record<number, unknown>, dispatch: Dispatch) => void` | No | Called when any AI job completes; enables per-item cache hydration |
| `onStepSave` | `(stepNumber: number, payload: unknown, dispatch: Dispatch) => Promise<void>` | No | Called after a step is saved; enables imperative side-saves |
| `onError` | `(error: unknown, context: string) => void` | No | Called on operation failure; enables toast notifications |
| `computeAutoResumeTarget` | `(outputs: Record<number, unknown>, jobs: Record<string, AiJob>) => number` | No | Custom auto-resume target logic distinct from maxStepAllowed |

### 3. DraftWorkflowState (Shared Type)

Moved from local definitions in CaseAnalysis.tsx and CaseSummary.tsx to shared types.

| Field | Type | Description |
|-------|------|-------------|
| workflowId | `string \| null` | Current workflow instance ID |
| caseId | `string \| null` | Case this workflow belongs to |
| outputs | `Record<number, unknown>` | Step outputs keyed by step number |
| loadingState | `string` | Current loading status |
| errorState | `string \| null` | Error message if any |
| lastSavedAt | `string \| null` | Timestamp of last save |
| createdAt | `string \| null` | Workflow creation timestamp |
| isReadOnly | `boolean` | Whether viewing in read-only mode |
| snapshotLabel | `string \| null` | Label if viewing a snapshot |

**Defined in**: `workflowTypes.ts` (alongside existing `BaseWorkflowState`)

### 4. WorkflowUtils (Shared Module)

New module `redux/shared/workflowUtils.ts` containing:

| Function | Signature | Description |
|----------|-----------|-------------|
| `isWorkflowCompleted` | `(outputs: Record<number, unknown>, workflowKey: string) => boolean` | Checks if workflow has output at its final step (derived from `WORKFLOW_CATALOG.totalSteps`) |
| `getDraftWorkflows` | `(states: Record<string, DraftWorkflowState>) => Array<{key, state, isSaved}>` | Filters and maps workflow states to detect drafts |
| `getWorkflowThunks` | `() => Record<string, IWorkflowThunks>` | Returns the canonical route → thunk mapping |
| `buildWorkflowHref` | `(route: string, workflowId: string \| null) => string` | Builds navigation URL with correct query params based on workflow type |

### 5. UnifiedStepShell (New Component)

Composed component combining AnalysisStepShell + AnalysisStageLayout.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isLoading | `boolean` | Yes | Show loading skeleton |
| hasFailed | `boolean` | Yes | Show error state |
| errorMessage | `string \| null` | No | Error message text |
| onRetry | `() => void` | No | Retry callback |
| loadingTitle | `string` | No | Skeleton title |
| loadingSubtitle | `string` | No | Skeleton subtitle |
| steps | `string[]` | No | Step names for skeleton |
| currentStepIndex | `number` | No | Active step for skeleton |
| title | `string` | No | Content layout title |
| actions | `ReactNode` | No | Title bar actions |
| sidebar | `ReactNode` | No | Sidebar content |
| children | `ReactNode` | Yes | Main content |

**Also exports** (re-exported from AnalysisStageLayout):
- `AnalysisStageSectionCard`
- `AnalysisStageSidebarCard`
- `AnalysisStageActionButton`
- `AnalysisStageDocumentCard`
- `AnalysisStageBanner`
- `AnalysisStageListItem`
- `AnalysisStageNumberedList`

**Defined in**: `components/analysisWorkflow/UnifiedStepShell.tsx`

### 6. WorkflowStepMap (for StatementOfClaims normalization)

| Job Key | Step Index |
|---------|-----------|
| `StatementCaseType` | 1 |
| `StatementParties` | 2 |
| `StatementSubjects` | 3 |
| `StatementFacts` | 4 |
| `StatementLegalBasis` | 5 |
| `StatementRequests` | 6 |
| `StatementFinal` | 7 |

Replaces the custom `STATEMENT_COMPUTE_MAX_STEP` function.

## State Transitions

### Workflow Orchestrator Step Navigation

```
┌─────────┐     nextStep()     ┌─────────┐     nextStep()     ┌──────────┐
│ Step 0  │ ─────────────────→ │ Step 1  │ ─────────────────→ │ Step N   │
│ (Facts) │                    │ (AI)    │                    │ (Final)  │
└─────────┘                    └─────────┘                    └──────────┘
     ↑                              │                               │
     │ prevStep()                   │ AI completes                  │
     │                              │ → auto-advance                │ status =
     └──────────────────────────────┘                               │ "Completed"
                                    │                               │
                                    │ onJobCompleted? ──→ DefenseMemo
                                    │   per-defense cache hydration │
                                    └───────────────────────────────┘
```

### isReadOnly Reset (BUG-002 Fix)

```
User views snapshot (isReadOnly: true)
  → Clicks "بدء واحدة جديدة"
    → startWorkflow.fulfilled dispatched
      → isReadOnly MUST be set to false  ← FIX POINT
    → New workflow page opens in edit mode
```

### Tab Navigation (BUG-001 Fix)

```
User on CaseAnalysis tab
  → Clicks "نسخة سابقة"
    → navigate('/cases/:id', { state: { activeTab: 'history' } })
      → CaseDetails watches location.state.activeTab  ← FIX POINT
        → setActiveTab('history')
        → History tab renders
```

## Validation Rules

- `StepMeta` arrays: length MUST equal `WORKFLOW_CATALOG[id].totalSteps`
- `isWorkflowCompleted`: MUST check `outputs[totalSteps]` is truthy
- `buildWorkflowHref`: non-versioned workflows (defense-memo, preparing-statement-of-claims) MUST NOT include `?workflowId` param
- `UnifiedStepShell`: MUST render loading state when `isLoading=true` regardless of other props
- `UnifiedStepShell`: MUST render error state when `hasFailed=true` and `isLoading=false`
- `UnifiedStepShell`: MUST render children only when `isLoading=false` and `hasFailed=false`
