# Quickstart

**Feature**: Implement AiJobWorker Cases

A very small scope, requiring only code-level modifications in the backend.

No infrastructure, database, or UI environment changes are required for this phase. Simply starting the backend and frontend servers via existing Docker setup (`make dev`) is sufficient.

## Manual Validation Checklist

1. Start the local stack with `make dev`.
2. Open a case that already has each of these workflow rows created at least once:
   - Legal Warning
   - Admin Complaint
   - Ruling Analysis
   - Exec Request
3. Trigger one queued AI job from each workflow and verify the corresponding `AiJob` moves from `Queued` to `Processing` to `Completed` or `Failed` without a `NotImplementedException`.

### Legal Warning

1. Trigger `LegalWarningClassification` and verify the worker uses the most recent `LegalWarningWorkflow` for the case.
2. Trigger `LegalWarningBodyDraft` and verify the completed job returns hydrated JSON to the dashboard.
3. Trigger `LegalWarningAssembly` and verify terminal job status is persisted in `AiJobs`.

### Admin Complaint

1. Trigger `AdminComplaintClassification`.
2. Trigger `AdminComplaintFacts`.
3. Trigger `AdminComplaintViolation`.
4. Trigger `AdminComplaintRequests`.
5. Trigger `AdminComplaintAssembly`.
6. Confirm each step completes through the queue and updates `ResultJson` or `ErrorMessage`.

### Ruling Analysis

1. Trigger `RulingAnalysisOperative`.
2. Trigger `RulingAnalysisReasoning`.
3. Trigger `RulingAnalysisDefectEvaluation`.
4. Trigger `RulingAnalysisFeasibilityReport`.
5. Confirm each step is handled by the worker instead of falling into the default switch branch.

### Exec Request

1. Trigger `ExecRequestClassification`.
2. Trigger `ExecRequestDrafting`.
3. Trigger `ExecRequestAssembly`.
4. Confirm each job reaches a handled terminal state and that failed service responses persist `ErrorMessage`.

### Failure Checks

1. Queue a supported step for a case without a matching workflow row and verify the job is marked `Failed` with a workflow-not-found message.
2. Force one domain service call to fail and verify `AiJob.Status = Failed`, `CompletedAt` is populated, and the failure notification path runs.
