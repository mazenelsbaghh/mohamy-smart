# Slice Factory Contracts

## 1. `createWorkflowSlice` API

### Interface `WorkflowSliceConfig<TStepOutputs>`

```typescript
export interface WorkflowSliceConfig<TStepOutputs> {
    /** The standard Redux toolkit slice name */
    name: string;
    
    /** Initial step output data */
    initialOutputs: TStepOutputs;
    
    /** The standard thunks to bind loading states to */
    thunks: IWorkflowThunks;
    
    /** Specific handlers to bind SignalR or manual hydration payloads to standard state outputs */
    stepHydrators: {
        [stepNumber: number]: (
            state: Draft<TypedWorkflowState<TStepOutputs>>, 
            result: unknown
        ) => void;
    };
}
```

### Signature
```typescript
function createWorkflowSlice<TStepOutputs>(config: WorkflowSliceConfig<TStepOutputs>): Slice<TypedWorkflowState<TStepOutputs>>
```

## 2. `createWorkflowThunks` API

### Interface `IWorkflowThunks`
```typescript
export interface IWorkflowThunks {
  startWorkflow: AsyncThunk<IWorkflowDto, { caseId: string }, any>;
  getWorkflow: AsyncThunk<IWorkflowDto, { caseId: string }, any>;
  runStep: AsyncThunk<void, { caseId: string; stepNumber: number; input?: string }, any>;
  saveEditedStep: AsyncThunk<void, { caseId: string; stepNumber: number; parsedOutput: any }, any>;
}
```

### Signature
```typescript
function createWorkflowThunks(apiControllerName: string): IWorkflowThunks
```
