# Research: Reliable Workflow Start and Resume

## Decision 1: Use an explicit active workflow run identity

**Decision**: Every workflow page must operate against an active run identity that is stable across refresh. Entity-backed workflows use the persisted workflow id. Case-based legacy workflows must expose equivalent active-run metadata, including workflow type, case id, run creation time, current accessible stage, and status.

**Rationale**: The existing `AiJob` model is keyed by case and step type, which cannot distinguish old results from a newly started run for the same case. Refresh recovery and stale-result isolation require a durable identity or timestamp boundary that all summary, job, and SignalR updates can compare against.

**Alternatives considered**:

- **Frontend-only fresh session flag**: Rejected because refresh loses in-memory state and old backend summaries can still be loaded.
- **Filtering only by job created time**: Useful as a guard but insufficient for workflows with saved step outputs that are not stored in `AiJobs`.
- **Deleting all old data on start-new**: Necessary for some case-based flows, but unsafe as the only strategy because completed historical versions and snapshots must remain reviewable.

## Decision 2: Separate completed stage from user-entered next stage

**Decision**: Treat stage completion and stage advancement as separate lifecycle events. A completed stage becomes reviewable, but the next stage remains locked until the user presses the transition button. The current accessible stage is the source of truth for tab access after refresh.

**Rationale**: Existing behavior frequently infers accessible tabs from existing outputs. That opens the next stage automatically as soon as output is hydrated, which contradicts the desired review flow. Separating completion from advancement preserves intentional user navigation and makes refresh behavior predictable.

**Alternatives considered**:

- **Continue deriving access from highest output**: Rejected because it caused the reported "subject/facts tab is open before I entered it" behavior.
- **Disable all tab clicking**: Rejected because users must review current and previous completed stages.
- **Use frontend-only active state**: Rejected because refresh must preserve the intended current stage.

## Decision 3: Recover active requests through run-scoped job state

**Decision**: Stage requests must be associated with the active run and stage. Refresh should load active queued/processing jobs for that run and show the existing loader. Completed or failed jobs should hydrate only if they belong to the active run.

**Rationale**: Long-running AI requests are normal. The user must be able to refresh without duplicate submission or losing the loading state. Run-scoped jobs also prevent old completions from unlocking or populating a new run.

**Alternatives considered**:

- **Always resubmit after refresh**: Rejected because it duplicates AI work and can create conflicting outputs.
- **Only use SignalR events**: Rejected because refresh needs an initial fetch/poll fallback.
- **Ignore completed jobs after refresh**: Rejected because users expect completed results to appear without manual retry.

## Decision 4: Treat exhausted concurrency retries as recoverable stage conflicts

**Decision**: If a stage request fails because optimistic concurrency retries are exhausted, mark that stage request as a recoverable conflict. The UI stays on the affected stage, keeps future stages locked, and offers reload/retry after the latest safe state is reconciled.

**Rationale**: Polly/provider retries can be correct, but a final `DbUpdateConcurrencyException` means the workflow changed while the request was running. Automatically applying the result or resubmitting risks overwriting newer user-visible output.

**Alternatives considered**:

- **Throw generic failure**: Rejected because it hides the recovery path and may invite duplicate submissions.
- **Automatically retry a new job indefinitely**: Rejected because conflicts may be caused by user edits or another tab and should require user intent.
- **Force full workflow reset**: Rejected because only the affected stage may need recovery.

## Decision 5: Centralize lifecycle behavior in shared workflow layers

**Decision**: Implement lifecycle logic in `WorkflowServiceBase`, workflow summary/start-new services, `AiJobService`/`AiJobWorker`, `createWorkflowSlice`, `useWorkflowOrchestrator`, `useAiJobSignalR`, and `useWorkflowAutoSave`. Workflow pages supply configuration only.

**Rationale**: The issue can appear in any workflow step. Duplicating fixes in individual pages will produce inconsistent behavior and miss future workflows.

**Alternatives considered**:

- **Patch only preparing statement of claims**: Rejected because the same tab, refresh, and conflict issues exist across workflow families.
- **Introduce a separate orchestration layer unrelated to existing hooks**: Rejected because the constitution requires convergence on the unified workflow architecture.

## Decision 6: Serialize manual save, auto-save, stage transition, and job completion writes

**Decision**: User-visible stage saves, auto-save flushes, transition clicks, and job completion hydration must be serialized or guarded so that only the latest safe write can affect workflow state.

**Rationale**: The constitution already flags auto-save race guards as a TODO. The reported conflict log shows a real collision between workflow writes. The feature must prevent duplicate transitions and keep conflict recovery deterministic.

**Alternatives considered**:

- **Rely only on database RowVersion**: Rejected because RowVersion detects conflicts but does not provide a good user recovery experience by itself.
- **Disable auto-save globally during AI jobs**: Rejected because users still need draft persistence in final/manual-edit stages.
