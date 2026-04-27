# Phase 1: Data Model & Contracts

## Internal Types / Entities

This phase focuses exclusively on internal frontend component and hook contracts.

### 1. `UseAnalysisStepOptions`
The input parameter contract for the new `useAnalysisStep` hook.

**Structure (TypeScript)**:
```typescript
export type UseAnalysisStepOptions = {
    caseId: string;
    workflowId: number | null;
    stepNumber: number;
    stepType: AiStepType; // Enum/string union defining the allowed backend AI steps
    autoSubmit?: boolean; // Default false. If true, triggers AI job automatically on mount
    parseResult?: (json: string) => unknown; // Function to format backend JSON
    onHydrate?: (parsed: unknown) => void; // Callback to notify Redux store of the result
};
```

### 2. `UseAnalysisStepReturn`
The state and utility functions returned by the `useAnalysisStep` hook.

**Structure (TypeScript)**:
```typescript
export type UseAnalysisStepReturn = {
    isLoading: boolean; // True while the AI job is resolving or submitting
    isSubmitting: boolean; // Specifically true while the initial API request is flying
    hasFailed: boolean; // True if the API or SignalR job resulted in a failure status
    errorMessage: string | null; // The Arabic localized string detailing the failure
    result: unknown; // The successfully parsed result, if any
    submit: (input?: string) => void; // Manually dispatch submission (e.g., from retry or user action)
    retry: () => void; // Simple convenience wrapper around submit
};
```

### 3. `AnalysisStepShellProps`
The props expected by the UI wrapper component handling layout, loading arrays, and error frames.

**Structure (TypeScript)**:
```typescript
export type AnalysisStepShellProps = {
    isLoading: boolean; 
    hasFailed: boolean;
    errorMessage?: string; // Optional error to show in the failure state
    onRetry?: () => void; // Callback when the user clicks 'Try Again' in the error UI
    children: React.ReactNode; // The core component implementation for that step
};
```

## Contracts / Endpoints
*N/A — No backend REST API endpoints or external system contracts are defined or changed in this module. This is entirely contained in the Frontend.*
