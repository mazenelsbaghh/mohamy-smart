# Quickstart: Frontend Unification + Auto-save Complete

**Branch**: `046-frontend-unification-autosave`
**Date**: 2026-04-14

## Prerequisites

1. Phase 1 (Backend Unification — branch `045-backend-unification`) must be merged
2. Lawyer Dashboard dev server running on port 5078
3. Backend API running on port 8976
4. SQL Server running (Docker) on port 1433

## Setup

```bash
# 1. Switch to feature branch
git checkout 046-frontend-unification-autosave

# 2. Install dependencies (if any new ones added)
cd mohamy-smart-lawyer-dashboard && npm install

# 3. Start dev server
npm run dev
```

## Development Workflow

### Migrating a Legacy Step Component

The migration follows a consistent pattern. Use any existing unified step (e.g., `AppealStep1JudgmentData.tsx`) as reference.

**Before** (legacy pattern):
```tsx
// Direct Redux dispatch, ad-hoc loading states, custom CSS
const dispatch = useAppDispatch();
const [isLoading, setIsLoading] = useState(false);
// ... manual API calls, custom error handling
```

**After** (unified pattern):
```tsx
import { useAnalysisStep } from '@/hooks/useAnalysisStep';
import AnalysisStepShell from '@/components/analysisWorkflow/AnalysisStepShell';

const { isLoading, result, submit, retry, hasFailed, errorMessage } = useAnalysisStep({
  caseId,
  stepType: 'DefenseFactAnalysis',  // AiStepType enum value
  onHydrate: (parsed) => dispatch(hydrateStep({ stepNumber: 1, result: parsed })),
});

return (
  <AnalysisStepShell isLoading={isLoading} hasFailed={hasFailed} errorMessage={errorMessage} onRetry={retry}>
    {/* Step-specific content using result */}
  </AnalysisStepShell>
);
```

### Wiring Auto-save into a Workflow Page

```tsx
import { useWorkflowAutoSave } from '@/hooks/useWorkflowAutoSave';

// In the workflow page component:
const { debouncedSave, flush, cancel } = useWorkflowAutoSave({
  delay: 1500,
  onSave: async (payload) => {
    await dispatch(workflowThunks.saveDraftStep({
      workflowId: workflow.workflowId!,
      stepNumber: workflow.currentStep,
      payload,
    })).unwrap();
  },
});

// Trigger auto-save on step output changes:
useEffect(() => {
  if (currentStepOutput) {
    debouncedSave(currentStepOutput);
  }
}, [currentStepOutput, debouncedSave]);

// Flush on manual save:
const handleManualSave = async () => {
  cancel();  // Cancel pending debounce
  await flush();
  // ... or dispatch saveEditedStep
};
```

## Verification Checklist

After each step component migration:

- [ ] Component renders correctly with AI output data
- [ ] Loading state shows unified spinner animation
- [ ] Error state shows retry button
- [ ] Step locking works (can't access future steps)
- [ ] Auto-save fires after 1.5s of inactivity
- [ ] Save button shows "تم الحفظ تلقائياً" on success
- [ ] Save button shows "فشل الحفظ" on failure
- [ ] Manual save and auto-save don't conflict
- [ ] Dark mode styling is correct
- [ ] RTL layout is preserved
- [ ] `npm run build` succeeds with no TypeScript errors

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/hooks/useAnalysisStep.ts` | AI step submission + SignalR tracking hook |
| `src/hooks/useWorkflowAutoSave.ts` | Auto-save with debounce + mutual-exclusion |
| `src/components/analysisWorkflow/AnalysisStepShell.tsx` | Unified step UI wrapper |
| `src/components/analysisWorkflow/AnalysisStageLayout.tsx` | Workflow page layout |
| `src/redux/shared/createWorkflowSlice.ts` | Redux slice factory |
| `src/redux/shared/createWorkflowThunks.ts` | Thunks factory |
| `src/redux/shared/workflowTypes.ts` | All step output type definitions |
