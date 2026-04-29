# Contract: Workflow UI Behavior

This contract defines visible behavior for every multi-stage workflow page.

## Tab Accessibility

| State | Current Stage | Previous Stages | Next Stage | Future Stages |
|-------|---------------|-----------------|------------|---------------|
| Empty run | Stage 0 / selection | N/A | Locked | Locked |
| Stage processing | Processing stage | Reviewable | Locked | Locked |
| Stage completed, not advanced | Completed stage | Reviewable | Locked | Locked |
| User pressed transition | New current stage | Reviewable | Current | Locked |
| Conflict | Affected stage | Reviewable | Locked | Locked |
| Snapshot/read-only | Snapshot current stage | Reviewable | Read-only only if included | Read-only only if included |

## Start Actions

### Start

- Used when no meaningful active workflow exists.
- Opens the first applicable stage.
- Does not load historical outputs.

### Resume Current Version

- Loads current active run.
- Restores `currentAccessibleStep`, completed outputs, active request loader, and conflict state.
- Does not automatically advance to the highest output if the user has not pressed the stage transition button.

### Start New

- Creates a clean active run.
- Keeps old outputs and old jobs out of the active run.
- Survives refresh immediately after the action.

## Loader Recovery

- If a request is queued or processing, the relevant stage shows the same loader after refresh.
- The loader remains until completion or failure is detected.
- Completion hydrates only the matching active-run stage.
- Failure shows the stage-scoped error and retry action.

## Transition Buttons

- Each stage transition button advances exactly one stage.
- The button is disabled while a transition or stage request is already in progress.
- Pressing the button multiple times does not create duplicate transitions.
- A transition requires a valid completed output for the source stage unless the workflow explicitly supports moving without generated output.

## Conflict Recovery

- Concurrency conflict text is shown in Arabic.
- The affected stage remains selected.
- Future tabs remain locked.
- The user may reload latest safe state or explicitly retry.
- Retry creates a new request only after the conflict state has been reconciled or clearly acknowledged.

## Refresh Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Refresh after start-new before first request | Same new run opens with no old outputs |
| Refresh while request queued | Current stage loader appears |
| Refresh while request processing | Current stage loader appears |
| Refresh after request completed | Completed stage output appears; next stage remains locked |
| Refresh after conflict | Affected stage opens with recovery action |
| Refresh snapshot | Snapshot remains read-only and does not affect active run |

## Consistency Requirements

- Header progress, tab selection, sidebar action, and stage content must agree on the same current stage.
- Workflow pages must not infer next-stage access from output presence alone.
- Workflow pages must not hydrate old job results after the active run changes.
- Workflow pages must preserve selected facts or required inputs when refreshing active work.

## Final Endpoint Names

| Endpoint | Method | Path |
|---|---|---|
| Start new run | POST | `/{controller}/{caseId}/start-new` |
| Resume current | GET | `/{controller}/case/{caseId}/resume` |
| Advance stage | POST | `/{controller}/{id}/advance-stage` |
| Recover conflict | POST | `/{controller}/{id}/recover-conflict` |
| Active job by run | GET | `/cases/{caseId}/ai-jobs/active` |

## UI State Names

| State | Source | Description |
|---|---|---|
| `runId` | Backend response | Active run identity, scoped to workflow+case |
| `currentAccessibleStep` | Backend response | Controls tab access, only advanced by explicit transition |
| `lastCompletedStep` | Backend response | Highest step with valid output |
| `activeRequests` | Backend response + SignalR | Active queued/processing jobs for current run |
| `stageConflicts` | Backend response | Conflict metadata when retries exhaust |
| `isReadOnly` | Backend response | True for historical snapshots |
| `isAdvancingStage` | Frontend state | True while advance request is in flight |
