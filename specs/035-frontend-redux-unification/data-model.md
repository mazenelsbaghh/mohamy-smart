# Data Models

## 1. Unified Workflow State Model

The base state for any unified workflow slice ensures identical progression behavior across the frontend.

```typescript
export interface BaseWorkflowState {
  workflowId: number | null;
  currentStep: number;
  status: WorkflowStatus; // e.g., NotStarted, InProgress, Completed, Abandoned
  
  // Normalized Async State Mapping
  loadingState: {
    isStarting: boolean;
    isGetting: boolean;
    isRunningStep: boolean;
    isSavingStep: boolean;
  };
  errorState: {
    startError: string | null;
    getError: string | null;
    runError: string | null;
    saveError: string | null;
  };
}
```

## 2. Generic Workflow State Model

Combines the base workflow state with dynamically typed step output fields.

```typescript
export type TypedWorkflowState<TStepOutputs> = BaseWorkflowState & {
  outputs: TStepOutputs; 
};
```

*Example Type Instance:*

```typescript
export type RulingAnalysisState = TypedWorkflowState<{
    1?: TVerdictAnalysis;
    2?: TReasonsAnalysis;
    3?: TDefectsEvaluation;
    4?: TAppealViability;
}>;
```
