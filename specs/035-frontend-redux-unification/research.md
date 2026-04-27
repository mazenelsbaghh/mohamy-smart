# Technical Research: Generic Redux Slices and Type Saftey

**Date**: 2026-04-11
**Feature**: Frontend Redux Unification

## 1. Strongly Typed Generic Workflows in Redux Toolkit

### Unknown:
How to construct a generic Redux Toolkit `createSlice` factory that preserves strict typing for varying output steps across different AI workflows?

### Decision:
Implement `createWorkflowSlice<TStepOutputs>` which accepts generic typed steps.

### Rationale:
Redux Toolkit strongly pushes developers toward statically defined slices. Using generic interfaces bounded by a record map `Record<number, unknown>` allows a single slice builder to infer the state structure correctly.
Specifically, `TStepOutputs` will be a type like `{ 1: Step1Type, 2: Step2Type }`.
The generic factory will merge the `BaseWorkflowState` (loading, error, workflowId, currentStep) with the specific outputs tree.

### Alternatives considered:
- Keeping standard slices but using high-order reducer generators. Rejected because the boilerplate across four different directories would barely shrink.
- Storing all step output raw `any` or stringified JSON at the global level. Rejected due to the loss of frontend Type Safety which Zod scaling depends on.

## 2. Unifying AI vs. Legacy API Calling (Thunks)

### Unknown:
How to handle the standard `startWorkflow`, `runStep`, and `saveStep` asynchronous actions without copying HTTP boilerplate between slices?

### Decision:
Create a `createWorkflowThunks` factory function that takes a base API route (e.g., `'AdminComplaint'`) and returns a set of `createAsyncThunk` functions.

### Rationale:
Our backend uses unified routing contracts (e.g., `/api/[Controller]/[Action]`), implemented on generic workflow bases. Creating standard frontend thunks mapping to those backend paths ensures zero duplication of Axios calls.

### Alternatives considered:
- RTK Query. Too heavy of a paradigm shift when standard Axios and Thunks are explicitly requested by the current tech stack.
