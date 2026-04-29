# Data Model: Reliable Workflow Start and Resume

## Workflow Run

Represents the active or historical run of one workflow type for one case.

### Fields

- `runId`: Stable identifier for the run. Existing workflow entities use their workflow id; legacy case-based flows must expose an equivalent identifier or timestamp boundary.
- `caseId`: Case being analyzed or drafted.
- `workflowType`: Legal warning, defense memo, preparing statement of claims, appeal brief, ruling analysis, execution request, administrative complaint, or future workflow type.
- `lawyerId`: Owner of the run.
- `status`: `NotStarted`, `InProgress`, `Completed`, `Abandoned`, or `Conflict`.
- `createdAt`: Run creation time used for stale result filtering.
- `updatedAt`: Last state change time.
- `currentAccessibleStep`: Stage the user is currently allowed to enter.
- `lastCompletedStep`: Highest completed stage in this run.
- `isReadOnly`: True for historical snapshots or previous versions.
- `snapshotLabel`: Optional label for read-only historical views.

### Relationships

- Has many `Workflow Stage` records or derived stage states.
- Has many `Stage Request` records.
- May have many `Workflow Snapshot` records.

### Validation Rules

- `currentAccessibleStep` cannot be greater than `lastCompletedStep + 1`.
- `currentAccessibleStep` cannot advance unless the user performs the explicit transition action.
- A non-read-only run must belong to the authenticated lawyer for the case.
- A `Completed` run cannot accept new stage requests unless it is explicitly restarted or edited through an approved path.

### State Transitions

```text
NotStarted -> InProgress
InProgress -> Completed
InProgress -> Conflict
Conflict -> InProgress
InProgress -> Abandoned
Abandoned -> read-only snapshot
Completed -> read-only snapshot
```

## Workflow Stage

Represents a single ordered stage within a workflow run.

### Fields

- `runId`: Parent workflow run.
- `stepNumber`: One-based stage number.
- `label`: Arabic user-visible stage label.
- `status`: `Locked`, `Current`, `Processing`, `Completed`, `Failed`, or `Conflict`.
- `output`: User-visible result for the stage, if completed.
- `inputDigest`: Optional digest of submitted inputs for duplicate prevention and safe recovery.
- `completedAt`: Completion timestamp.
- `enteredAt`: Timestamp for when the user explicitly entered this stage.

### Relationships

- Belongs to `Workflow Run`.
- May have one active `Stage Request`.
- May produce one `Stage Output`.

### Validation Rules

- A stage after `currentAccessibleStep` is locked unless it has a valid active-run processing request for recovery.
- A completed stage does not unlock the next stage by itself.
- Future stages are invalidated or quarantined when an earlier stage is edited or regenerated.

## Stage Request

Represents a background AI request for one stage.

### Fields

- `requestId`: Stable request/job identifier.
- `runId`: Active run association.
- `caseId`: Parent case.
- `workflowType`: Parent workflow type.
- `stepNumber`: Target stage.
- `stepType`: AI stage type.
- `status`: `Queued`, `Processing`, `Completed`, `Failed`, `Cancelled`, or `Conflict`.
- `inputJson`: Submitted stage input, or a digest/reference when full payload storage is not appropriate.
- `resultJson`: Raw or normalized result when completed.
- `errorMessage`: Arabic user-visible error summary.
- `errorCode`: Optional category such as `ConcurrencyConflict`, `ValidationFailure`, `ProviderFailure`, or `UserCancelled`.
- `createdAt`: Request creation time.
- `startedAt`: Processing start time.
- `completedAt`: Completion or failure time.

### Relationships

- Belongs to `Workflow Run`.
- Belongs to `Workflow Stage`.
- Produces `Stage Output` only when completed and still associated with the active run.

### Validation Rules

- Only one queued or processing request is allowed for the same active run and stage.
- A request from an older run cannot update the active run.
- A conflict request requires user-visible recovery and cannot auto-advance the stage.

## Stage Output

Represents user-visible generated or saved content for a stage.

### Fields

- `runId`: Owning active run.
- `stepNumber`: Stage number.
- `payload`: Normalized stage result.
- `sourceRequestId`: Request that produced the output, if generated.
- `createdAt`: Creation time.
- `updatedAt`: Last edit/save time.
- `versionToken`: Optimistic concurrency token or equivalent safe-write marker.

### Relationships

- Belongs to `Workflow Run`.
- Belongs to `Workflow Stage`.
- May come from a `Stage Request`.

### Validation Rules

- Output cannot be applied if its `sourceRequestId` belongs to an older run.
- Output from a conflicted request cannot overwrite newer output.
- Editing an earlier output must lock or invalidate later stages until they are regenerated or reviewed.

## Stage Conflict

Represents a recoverable workflow-stage conflict after automatic retries are exhausted.

### Fields

- `runId`: Affected run.
- `stepNumber`: Affected stage.
- `requestId`: Request that encountered the conflict.
- `message`: Arabic recovery message.
- `detectedAt`: Conflict timestamp.
- `latestSafeStateLoaded`: Whether the latest safe workflow state has been reconciled.
- `availableActions`: `Reload`, `Retry`, or both.

### Validation Rules

- A stage conflict keeps future stages locked.
- Retry is user-initiated only.
- Reload/reconcile must happen before advancing to the next stage.

## Workflow Snapshot

Represents a historical read-only view.

### Fields

- `snapshotId`: Stable snapshot identifier.
- `caseId`: Parent case.
- `workflowType`: Workflow type.
- `outputs`: Captured stage outputs.
- `currentStep`: Stage position at snapshot time.
- `createdAt`: Snapshot creation time.
- `label`: User-visible version label.

### Validation Rules

- Snapshots are read-only.
- Opening a snapshot must not update the active run, stage requests, selected facts, or tab locking for the current version.
