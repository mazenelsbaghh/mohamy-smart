# Contract: Workflow Lifecycle and Stage Requests

This contract describes expected behavior between workflow pages and backend workflow/job services. Exact routes may follow existing controller naming, but the response shape and state semantics must be consistent.

## Start First Run

### Request

```text
Action: Start workflow for case and workflow type
Inputs: caseId, workflowType
```

### Success Response

```json
{
  "runId": "string-or-number",
  "caseId": "guid",
  "workflowType": "string",
  "status": "InProgress",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "currentAccessibleStep": 0,
  "lastCompletedStep": 0,
  "isReadOnly": false,
  "outputs": {}
}
```

### Rules

- Returns an active run for the authenticated lawyer and case.
- Does not hydrate old outputs into the new run.
- May return an existing empty active run only when no previous progress exists.

## Resume Current Version

### Request

```text
Action: Resume current active workflow
Inputs: caseId, workflowType
```

### Success Response

```json
{
  "runId": "string-or-number",
  "caseId": "guid",
  "workflowType": "string",
  "status": "InProgress",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "currentAccessibleStep": 2,
  "lastCompletedStep": 1,
  "activeRequests": [
    {
      "requestId": "guid",
      "stepNumber": 2,
      "stepType": "string",
      "status": "Processing",
      "createdAt": "ISO-8601",
      "startedAt": "ISO-8601"
    }
  ],
  "outputs": {
    "1": {}
  }
}
```

### Rules

- The returned `currentAccessibleStep` controls tab accessibility after refresh.
- Active queued or processing requests must be returned or discoverable for loader recovery.
- Future stages beyond `currentAccessibleStep` stay locked.

## Start New Run

### Request

```text
Action: Start clean new workflow run
Inputs: caseId, workflowType
```

### Success Response

```json
{
  "runId": "string-or-number",
  "caseId": "guid",
  "workflowType": "string",
  "status": "InProgress",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "currentAccessibleStep": 0,
  "lastCompletedStep": 0,
  "activeRequests": [],
  "outputs": {}
}
```

### Rules

- Previous active run state is abandoned, snapshotted, or otherwise excluded from the new active run.
- Old stage requests must not populate or unlock this run.
- Refresh after start-new must reload this new run, not the previous current version.

## Submit Stage Request

### Request

```json
{
  "runId": "string-or-number",
  "caseId": "guid",
  "workflowType": "string",
  "stepNumber": 2,
  "stepType": "string",
  "inputJson": "{}"
}
```

### Success Response

```json
{
  "requestId": "guid",
  "runId": "string-or-number",
  "stepNumber": 2,
  "stepType": "string",
  "status": "Queued",
  "createdAt": "ISO-8601"
}
```

### Rules

- Duplicate queued or processing requests for the same active run and stage are not created.
- A request for an old or read-only run is rejected.
- A request does not advance the next stage by itself.

## Stage Request Completion

### Completion Event/Fetch Shape

```json
{
  "requestId": "guid",
  "runId": "string-or-number",
  "stepNumber": 2,
  "stepType": "string",
  "status": "Completed",
  "resultJson": "{}",
  "completedAt": "ISO-8601"
}
```

### Rules

- The output can hydrate the completed stage only if `runId` matches the active run.
- Completion does not unlock the next stage.
- Completion must not overwrite a newer output or a conflicted stage state.

## Advance Stage

### Request

```json
{
  "runId": "string-or-number",
  "fromStep": 2,
  "toStep": 3
}
```

### Success Response

```json
{
  "runId": "string-or-number",
  "currentAccessibleStep": 3,
  "lastCompletedStep": 2,
  "updatedAt": "ISO-8601"
}
```

### Rules

- This is the normal action that unlocks the next tab.
- It is rejected when the source step has no valid active-run completion.
- Repeated presses while transition is in progress are ignored or return the same state.

## Recover Stage Conflict

### Failure Shape

```json
{
  "requestId": "guid",
  "runId": "string-or-number",
  "stepNumber": 2,
  "status": "Conflict",
  "errorCode": "ConcurrencyConflict",
  "message": "تم تحديث سير العمل أثناء تنفيذ التحليل. يرجى إعادة تحميل الصفحة ثم إعادة المحاولة.",
  "availableActions": ["Reload", "Retry"]
}
```

### Rules

- Future stages remain locked.
- The user remains on or returns to the affected stage.
- No automatic retry is submitted unless the user chooses retry.
- Latest safe state must be loaded before allowing advancement.
