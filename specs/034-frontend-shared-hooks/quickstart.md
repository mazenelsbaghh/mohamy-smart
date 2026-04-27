# Admin/Lawyer Dashboards — Frontend Shared Component Workflows
## Quickstart Guide

This phase introduces an easier way to scaffold new workflow tracking steps across the React frontend.

### To build a new Step Component

1. Identify the AI Step properties (Step Number, Step Type constant).
2. Wire up the `useAnalysisStep` hook.
3. Wrap your UI return with `<AnalysisStepShell>`.

**Example Pattern:**

```tsx
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../hooks/storeHooks';
import { useAnalysisStep } from '../../../../hooks/useAnalysisStep';
import { AnalysisStepShell } from '../../../../components/analysisWorkflow/AnalysisStepShell';
import { hydrateMyStepResult } from '../../../../redux/myFeatureSlice';

export const MyNewStepComponent = () => {
    const { caseId } = useParams();
    const dispatch = useAppDispatch();
    const { workflowId } = useAppSelector(state => state.myFeature);
    
    // 1. Hook into the AI Workflow lifecycle
    const { isLoading, hasFailed, errorMessage, retry, result } = useAnalysisStep({
        caseId: caseId as string,
        workflowId,
        stepNumber: 1,
        stepType: 'MyFeatureStepType',
        autoSubmit: true,
        parseResult: (json) => JSON.parse(json),
        onHydrate: (parsed) => dispatch(hydrateMyStepResult(parsed)),
    });

    // 2. Wrap your specific UI in the Shell
    return (
        <AnalysisStepShell 
            isLoading={isLoading} 
            hasFailed={hasFailed} 
            errorMessage={errorMessage} 
            onRetry={retry}
        >
            <div className="flex flex-col space-y-4">
                <h3 className="text-xl font-tajawal text-gray-800">تفاصيل النتيجة</h3>
                {/* Use the `result` object to map out your component UI */}
            </div>
        </AnalysisStepShell>
    );
};
```

Using this pattern eliminates the need to directly import or subscribe to `SignalR`, checking error bounds recursively, or writing placeholder skeleton loaders on every single file.
