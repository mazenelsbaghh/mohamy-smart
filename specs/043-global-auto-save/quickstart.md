# Developer Quickstart: Global Auto-save

## Frontend Integration
When implementing a new workflow stage that requires user input:

1. Use the shared `useWorkflowAutoSave` hook from `/hooks/useWorkflowAutoSave.ts`.
2. Connect your component's state (e.g. `localText`) to the `debouncedSave` method from the hook.
3. Access `isAutoSaving` from the slice's `loadingState` to display the "Saving..." indicator.
4. Render the localized formatting of the saved time (e.g. `lastSavedAt` string from Redux or component local state).

Example:
```tsx
const [lastSaved, setLastSaved] = useState('');
const { debouncedSave } = useWorkflowAutoSave({
    delay: 2000,
    onSave: async (payload) => {
        setLastSaved(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
        await dispatch(adminComplaintThunks.saveDraftStep({
            workflowId: caseId,
            stepNumber: 2,
            payload: { ...existingPayload, text: payload }
        })).unwrap();
    }
});

const handleInput = (e) => {
    setLocalText(e.target.value);
    debouncedSave(e.target.value);
};
```

## Backend Integration
When creating a new workflow backend service inheriting from `IWorkflowServiceBase`:

1. Each workflow service must expose a `SaveDraftAsync` endpoint on its respective Controller.
2. The logic inside `SaveDraftAsync` should utilize `WorkflowServiceBase.SaveDraftAsync` or implement custom raw JSON assignment without triggering `Hangfire` or `AI` work.
3. Ensure the lawyer has security clearance over the specific case via `ICaseAccessValidator`.

## Validation & Testing Workflow

To thoroughly test the Global Auto-Save feature, follow this flow:

### 1. Resume Flow and Tab-Close Recovery
- Open the dashboard and navigate to a case analysis final assembly step (e.g., "Appeal Brief").
- Begin making textual edits. Notice the component triggers the 2000ms debounce.
- Wait for the "جارِ الحفظ..." status, then wait for "آخر حفظ {time}".
- Forcibly close the browser tab or hit the Refresh button (Cmd/Ctrl + R).
- Open the same case workflow again.
- **Verification:** The exact textual modifications you made should immediately hydrate back into the final draft surface.

### 2. Auto-Save Timestamps
- Observe the timestamp generated right after typing finishes (e.g., "آخر حفظ 05:30 م").
- **Verification:** The time should correctly match local Arabia region `ar-EG` standard locale timestamps. Wait a few minutes, type another key, and verify the timestamp incrementally updates.
