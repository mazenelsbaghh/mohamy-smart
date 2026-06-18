# Research: SignalR Push Notifications for AI Job Status

## Decision 1: SignalR Notification Coverage Gaps

### Decision
Add `NotifyJobFailedAsync` calls in 4 backend locations where job status changes but no SignalR notification is sent.

### Rationale
The subagent research identified exactly 4 gaps in `AiJobService.cs` and `AiJobWorker.cs` where the job status transitions but no SignalR notification fires. These are the only places preventing full push-based updates.

### Alternatives Considered
- **Add a new notification type**: Unnecessary — existing `NotifyJobFailedAsync` covers all failure/conflict scenarios
- **Add middleware to intercept SaveChanges**: Over-engineered for 4 simple additions
- **Database triggers**: Too complex and couples DB to SignalR

### Files Affected
1. `AiJobService.cs` L277 — `IgnoreStaleCompletionAsync`: add `await _notifications.NotifyJobFailedAsync(job);`
2. `AiJobService.cs` L296 — `MarkConflictAsync`: add `await _notifications.NotifyJobFailedAsync(job);`
3. `AiJobService.cs` L321-323 — `CleanupStuckJobsAsync`: add notification loop after `SaveChangesAsync`
4. `AiJobWorker.cs` L639 — `MarkJobIgnoredAsStaleAsync`: add `await _notifications.NotifyJobCompletedAsync(job);`

---

## Decision 2: Frontend Reconnection Strategy

### Decision
Add `onreconnected` handler that re-invokes `JoinCase` and dispatches a one-time `thunkGetAllAiJobs` fetch. Also add post-`JoinCase` reconciliation fetch.

### Rationale
The current code uses `withAutomaticReconnect()` but has NO `onreconnected` handler — after reconnection, the client never re-joins the case group. This means all events during the disconnection AND after reconnection are lost.

### Alternatives Considered
- **Custom reconnect with exponential backoff**: `withAutomaticReconnect()` already handles this
- **Server-side reconnection detection**: More complex, client-side is sufficient
- **WebSocket keepalive pings**: Already built into SignalR

### Files Affected
- `useAiJobSignalR.ts` — add `connection.onreconnected()` handler + post-JoinCase fetch

---

## Decision 3: Fallback Polling Strategy

### Decision
Change the `setInterval` from 10,000ms to 300,000ms (5 minutes). Activate ONLY when SignalR is non-functional.

### Rationale
User explicitly requested 5-minute fallback interval. The polling should only activate when SignalR fails entirely, not as a regular reconciliation mechanism.

### Alternatives Considered
- **Remove polling entirely**: Too risky — if SignalR dies, user would need manual refresh
- **120-second polling**: User explicitly chose 5 minutes
- **Adaptive polling**: Over-engineered for this use case

### Files Affected
- `useAiJobSignalR.ts` — change interval to 300,000ms + add SignalR state tracking

---

## Decision 4: SignalR Connection State Tracking

### Decision
Add a `signalrConnected` ref to track whether SignalR is currently functional. Use this to conditionally activate fallback polling.

### Rationale
Currently there's no way to distinguish between "SignalR is working fine" (no polling needed) and "SignalR failed" (polling needed). A simple boolean ref solves this.

### Files Affected
- `useAiJobSignalR.ts` — add `signalrConnectedRef` boolean
