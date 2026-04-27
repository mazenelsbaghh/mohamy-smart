# Scaffold an AI Workflow (Redux)

This guide shows how to scaffold state management for a new AI Workflow (e.g., "SmartContractAnalysis") using the unified slice builders.

## 1. Create the Types

Define the outputs expected from the various steps.

```typescript
// src/types/smartContractAnalysis.ts
export type TContractIdentification = { /* fields */ };
export type TRiskAssessment = { /* fields */ };
```

## 2. Generate the Thunks

In your slice file, construct the Thunks matching the backend controller. 
*Assuming the controller is `SmartContractController`.*

```typescript
// src/redux/smartContract/smartContractSlice.ts
import { createWorkflowThunks } from '../shared/createWorkflowThunks';

const smartContractThunks = createWorkflowThunks('SmartContract');
export { smartContractThunks };
```

## 3. Generate the Unified Slice

Pass your step typings and the generated thunks to `createWorkflowSlice`.

```typescript
// src/redux/smartContract/smartContractSlice.ts
import { createWorkflowSlice } from '../shared/createWorkflowSlice';

export const smartContractSlice = createWorkflowSlice<{
    1?: TContractIdentification;
    2?: TRiskAssessment;
}>({
    name: 'smartContract',
    initialOutputs: { 1: undefined, 2: undefined },
    thunks: smartContractThunks,
    stepHydrators: {
        1: (state, result) => { state.outputs[1] = result as TContractIdentification; },
        2: (state, result) => { state.outputs[2] = result as TRiskAssessment; },
    }
});

export const { hydrateStep } = smartContractSlice.actions; // provided automatically by the factory
export default smartContractSlice.reducer;
```

## 4. Hook into Store

Bind the reducer in the main store initialization file just like any regular Redux slice! You no longer need separate `FooSlice.ts` and `FooAiSlice.ts` pairs.
