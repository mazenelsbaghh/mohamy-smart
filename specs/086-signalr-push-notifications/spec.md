# Feature Specification: SignalR Push Notifications for AI Job Status

**Feature Branch**: `086-signalr-push-notifications`  
**Created**: 2026-06-18  
**Status**: Draft  
**Input**: User description: "Replace AI job polling with SignalR push notifications so the server notifies the frontend instantly when any AI job status changes, eliminating the need for periodic polling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instant AI Job Completion Notification (Priority: P1)

A lawyer starts any AI workflow (Smart Analysis, Defense Memo, Preparing Statement of Claims, Ruling Analysis, Legal Warning, Exec Request, Appeal Brief, Admin Complaint, Legal Contracts, Clarify Facts, or any future workflow). When the AI job completes, fails, or encounters a conflict, the lawyer sees the result update instantly in the UI without any delay, because the server pushes the status change via SignalR the moment it happens. This applies to **all** workflow types that use AI jobs.

**Why this priority**: This is the core value — eliminating the polling delay so the user sees AI results immediately, and reducing server load by removing repetitive HTTP requests.

**Independent Test**: Start an AI job and verify the UI updates within 1 second of job completion, without any polling requests being made.

**Acceptance Scenarios**:

1. **Given** a lawyer has an AI job in "Processing" status, **When** the job completes successfully on the backend, **Then** the lawyer's UI updates to show the result within 1 second without any polling API call.
2. **Given** a lawyer has an AI job in "Processing" status, **When** the job fails on the backend, **Then** the lawyer's UI shows the error state within 1 second via SignalR push.
3. **Given** a lawyer has an AI job in "Processing" status, **When** the job transitions to "Conflict" status, **Then** the lawyer's UI reflects the conflict state within 1 second via SignalR push.

---

### User Story 2 - Stuck Job Timeout Notification (Priority: P1)

When a job is stuck in "Processing" or "Queued" for more than 1 hour, the system's cleanup process marks it as failed. Currently, no SignalR notification is sent, so the lawyer sees a spinner forever. After this change, the lawyer is notified immediately when the stuck job is cleaned up.

**Why this priority**: Without this fix, the lawyer would see an infinite spinner and never know the job timed out — this is a critical user experience issue.

**Independent Test**: Create a stuck job older than 1 hour, trigger the cleanup, and verify the UI updates to show the failure state.

**Acceptance Scenarios**:

1. **Given** a job has been in "Processing" state for more than 1 hour, **When** the cleanup process runs, **Then** the lawyer's UI shows the job as failed with a timeout message via SignalR push.
2. **Given** a job has been in "Queued" state for more than 1 hour, **When** the cleanup process runs, **Then** the lawyer's UI shows the job as failed with a timeout message via SignalR push.

---

### User Story 3 - Automatic Recovery After Connection Loss (Priority: P2)

If the lawyer's internet drops briefly and the SignalR connection is lost and then restored, the system automatically reconnects, rejoins the case group, and fetches any missed updates — so the lawyer never has to manually refresh the page.

**Why this priority**: Connection drops are common on mobile or unstable networks. Without automatic recovery, the lawyer would be stuck with stale data after a reconnection.

**Independent Test**: Simulate a SignalR disconnection and reconnection, verify the UI catches up with any job status changes that occurred during the disconnection.

**Acceptance Scenarios**:

1. **Given** a SignalR connection drops while a job is processing, **When** the connection is restored, **Then** the frontend automatically rejoins the case group and fetches the latest job statuses.
2. **Given** a job completed while the SignalR connection was down, **When** the connection is restored, **Then** the lawyer sees the completed result without manually refreshing.

---

### User Story 4 - Emergency Fallback for Persistent Connection Failure (Priority: P3)

If the SignalR connection fails entirely and cannot be restored, a background safety net polls the server every 5 minutes to catch any missed updates, ensuring the lawyer never has to manually refresh.

**Why this priority**: This is a rare edge case (complete SignalR failure), but ensures the system is resilient even in worst-case scenarios.

**Independent Test**: Disable SignalR entirely, start a job, and verify the UI eventually catches up within 5 minutes.

**Acceptance Scenarios**:

1. **Given** the SignalR connection has completely failed, **When** a job completes on the backend, **Then** the lawyer's UI updates within 5 minutes via the fallback mechanism.
2. **Given** the SignalR connection is working, **Then** no fallback polling requests are made to the server.

---

### Edge Cases

- What happens when a job status changes between SignalR connection start and case group join? → A one-time reconciliation fetch is made after successfully joining the group.
- What happens when the SignalR connection drops during a "Processing" → "Completed" transition? → The `onreconnected` handler rejoins and fetches missed updates.
- What happens when multiple lawyers are watching the same case? → All connected clients in the case group receive the SignalR notification simultaneously.
- What happens when a "stale" job from a previous workflow run completes? → The backend sends a notification, and the frontend filters it out based on the active run ID.
- What happens when the cleanup process marks multiple stuck jobs as failed at once? → Each job triggers an individual SignalR notification.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST send a SignalR notification for every AI job status change, including: Queued→Processing, Processing→Completed, Processing→Failed, timeout cleanup (stuck→Failed), conflict marking, and stale job handling.
- **FR-002**: System MUST NOT rely on frontend polling as the primary mechanism for job status updates.
- **FR-003**: Frontend MUST automatically reconnect to SignalR and rejoin the case group after a connection drop, then fetch any missed status updates.
- **FR-004**: Frontend MUST perform a one-time reconciliation fetch immediately after successfully joining a case group, to cover the race window between connection start and group join.
- **FR-005**: Frontend MUST implement a 5-minute fallback poll that activates ONLY when SignalR is completely non-functional and active jobs exist.
- **FR-006**: The fallback poll MUST stop when SignalR reconnects successfully or when no active jobs remain.
- **FR-007**: System MUST send SignalR notifications when the stuck-job cleanup process marks jobs as failed (currently missing).
- **FR-008**: System MUST send SignalR notifications when a job is marked as "Conflict" (currently missing).
- **FR-009**: System MUST send SignalR notifications when a stale job completion is ignored (currently missing).

### Key Entities

- **AiJob**: Represents an AI processing job with status (Queued, Processing, Completed, Failed, Conflict), linked to a Case and optionally to a workflow run.
- **AiJobHub**: SignalR hub that manages case-specific groups for real-time notifications.
- **AiJobNotificationService**: Service responsible for broadcasting job status changes to connected clients via SignalR.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: AI job status updates are visible to the user within 1 second of the status change occurring on the backend, under normal network conditions.
- **SC-002**: Server-side polling-related API requests are reduced by at least 95% compared to the current 10-second polling approach.
- **SC-003**: No AI job status change goes unnotified — every transition (complete, fail, timeout, conflict, stale) triggers a real-time notification to connected clients.
- **SC-004**: After a SignalR reconnection, the user sees all missed updates within 2 seconds without manual page refresh.
- **SC-005**: If SignalR is completely unavailable, the user still receives updates within 5 minutes via the fallback mechanism.

## Assumptions

- The existing SignalR infrastructure (hub, connection builder, authentication) is stable and does not need architectural changes.
- The `AiJobNotificationService` interface and its three methods (`NotifyJobStatusChangedAsync`, `NotifyJobCompletedAsync`, `NotifyJobFailedAsync`) are sufficient — no new notification types are needed.
- The Redux state structure (`aiJobs.jobs`) and the workflow orchestrator's reactive consumption pattern do not need changes.
- The SignalR `withAutomaticReconnect()` default retry strategy (0s, 2s, 10s, 30s) is acceptable for reconnection attempts.
- The frontend's `upsertJob` action (used by SignalR event handlers) correctly updates the Redux state for all job status transitions.
- The 5-minute fallback poll interval is acceptable for the edge case where SignalR fails entirely.
