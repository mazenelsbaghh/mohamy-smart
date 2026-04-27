# Feature Specification: Implement AiJobWorker Cases

**Feature Branch**: `029-ai-jobs-worker`
**Created**: 2026-04-10
**Status**: Draft
**Input**: User description: "Implement AiJobWorker cases for Admin Complaint, Legal Warning, Ruling Analysis, and Exec Request"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Process Legal Warning Jobs (Priority: P1)
As a system relying on asynchronous AI queue processing, I need the worker to handle the Legal Warning analysis steps automatically behind the scenes.
**Why this priority**: Required for the user to proceed with Legal Warnings.
**Independent Test**: Can be fully tested by submitting a Legal Warning payload via UI and observing the successful status update in the UI through SignalR updates from the backend worker.

**Acceptance Scenarios**:
1. **Given** a job triggered for `LegalWarningClassification`, **When** picked up by `AiJobWorker`, **Then** the worker delegates it to `ILegalWarningService.ClassifyAsync()` and returns results.
2. **Given** a job for `LegalWarningBodyDraft`, **When** picked up by the worker, **Then** it delegates to `ILegalWarningService.DraftLegalWarningBodyAsync()`.
3. **Given** a job for `LegalWarningAssembly`, **When** picked up by the worker, **Then** it delegates to `ILegalWarningService.AssembleLegalWarningAsync()`.

---

### User Story 2 - Process Admin Complaint Jobs (Priority: P1)
As a system, I need the worker to properly parse and invoke the backend `AdminComplaint` AI generation logic.
**Why this priority**: Required for the Admin Complaint workflow to function without failing.
**Independent Test**: Can be independently tested using the `Admin Complaint` UI to trigger a classification job.

**Acceptance Scenarios**:
1. **Given** an AI Job request for any of the 5 `AdminComplaint` steps, **When** processed by the queue, **Then** the job routes to the corresponding methods inside `IAdminComplaintService` and succeeds.

---

### User Story 3 - Process Ruling Analysis Jobs (Priority: P1)
As a system, I need the `AiJobWorker` to execute the 4 distinct Ruling Analysis sub-jobs.
**Why this priority**: Ruling Analysis heavily relies on large AI prompts and background threading is critical for usability.
**Independent Test**: Submitting a Ruling Analysis job and checking that no 500 error or "Not Implemented" exception is thrown.

**Acceptance Scenarios**:
1. **Given** a Ruling Analysis step job, **When** processed by `AiJobWorker`, **Then** it correctly maps the input DTO and executes the corresponding `IRulingAnalysisService` method.

---

### User Story 4 - Process Exec Request Jobs (Priority: P2)
As a system, I need execution request workflows mapped into the worker.
**Why this priority**: It is the last of the four newly integrated UI layouts.
**Independent Test**: Independent UI integration testing passing for Exec Request.

**Acceptance Scenarios**:
1. **Given** an Exec Request step job, **When** processed by `AiJobWorker`, **Then** it executes the `IExecRequestService` appropriately and updates the job context.

### Edge Cases

- What happens if the payload DTO from the frontend is missing a property required by the underlying service? The worker should catch the exception, mark the job as `Failed`, and persist the error message.
- How does the system handle an unregistered `StepType`? It should throw a standard `NotImplementedException` which causes a recorded failure status.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST route all `LegalWarning` step enumeration payloads to the existing `ILegalWarningService`.
- **FR-002**: System MUST route all `AdminComplaint` step enumeration payloads to the existing `IAdminComplaintService`.
- **FR-003**: System MUST route all `RulingAnalysis` step enumeration payloads to the existing `IRulingAnalysisService`.
- **FR-004**: System MUST route all `ExecRequest` step payloads to the existing `IExecRequestService`.
- **FR-005**: All executed actions MUST deserialize the `InputJson` dynamically depending on the current Job `StepType`.
- **FR-006**: The worker MUST supply the standard contextual parameter injections (e.g. `CancellationToken`) into the destination service interfaces.

### Key Entities

- **AiJob**: The queue database object containing `Id`, `StepType`, `InputJson`, and `ResultJson`.
- **AiJobWorker**: Background processor that identifies `StepType`s and delegates work.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of jobs initiated from the Lawsuit UI sub-pages trigger a Completed or Failed handled state without causing backend hard crashes related to unimplemented switch blocks.
- **SC-002**: All 14 new step types successfully finish their job processing mapping within 2 seconds of queue pickup time.

## Assumptions

- We assume that `IAdminComplaintService`, `ILegalWarningService`, `IRulingAnalysisService`, and `IExecRequestService` already encapsulate completely operational code.
- We assume that the Frontend models perfectly match the backend API DTO definitions being deserialized via `System.Text.Json` properties mapped.
