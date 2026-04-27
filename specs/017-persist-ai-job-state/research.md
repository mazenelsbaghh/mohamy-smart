# Research: Persistent AI Job State

**Phase**: 0 — Research  
**Date**: 2026-04-08  
**Branch**: `017-persist-ai-job-state`

---

## Decision 1: Job Queue Technology

**Decision**: Hangfire with SQL Server as backing store  
**Rationale**: The constitution fixes the backend as .NET 9. Bull is a Node.js library — using it would require an additional Node process alongside the .NET backend, violating Principle VII (Docker consistency) by adding an unplanned service. Hangfire is the de-facto standard .NET background job library: it uses the existing SQL Server 2022 container for its schema (no new infrastructure), supports fire-and-forget, recurring, delayed, and continuation jobs, provides a built-in dashboard, and has first-class ASP.NET Core integration.  
**Alternatives considered**:
- **Bull (Node.js)**: Rejected — requires Redis and a Node.js worker process outside the .NET stack. Architecturally wrong for a .NET 9 backend.
- **MassTransit**: Rejected — adds RabbitMQ/Azure Service Bus infrastructure; overkill for this scope.
- **.NET Channels (in-memory)**: Rejected — not durable; jobs are lost on server restart, which is the exact bug we are fixing.
- **Quartz.NET**: Rejected — primarily for scheduled/recurring jobs, not fire-and-forget async dispatch.

---

## Decision 2: Real-Time Job Status Push to Browser

**Decision**: ASP.NET Core SignalR  
**Rationale**: SignalR is built into ASP.NET Core 9, requires zero additional infrastructure (no Redis pub/sub unless scaling horizontally, which is not a current requirement), and supports WebSocket with automatic fallback to long-polling. The Lawyer Dashboard can use the `@microsoft/signalr` npm package (the official JavaScript client). This gives sub-second push latency when a Hangfire job completes.  
**Alternatives considered**:
- **Polling (setInterval)**: Acceptable fallback but wastes bandwidth and introduces 3–10 s lag. Keep as fallback for environments where WebSocket is blocked.
- **Server-Sent Events (SSE)**: One-directional, sufficient for this use case, but SignalR is more idiomatic for .NET and handles reconnect logic automatically.
- **Firebase / Pusher**: External services — rejected (adds cost, external dependency, secrets management overhead).

---

## Decision 3: AI Result Persistence Format

**Decision**: JSON column (`nvarchar(max)`) in the `AiJobs` table — single `ResultJson` column  
**Rationale**: AI results vary significantly per step type (TFactAnalysis has nested arrays; TLawsuitParties is a list; TLawsuitRequests is a flat object). A single JSON column avoids schema explosion (10 separate result tables) while remaining queryable via `JSON_VALUE` / `OPENJSON` if needed. The frontend deserializes from the stored JSON into the same TypeScript types it already uses.  
**Alternatives considered**:
- **Separate result table per AI step**: Rejected — 10+ tables for 10 step types; heavy migration burden; types are frontend-defined DTOs and change frequently.
- **Blob storage (Azure)**: Rejected — over-engineered; result payloads are < 50 KB.

---

## Decision 4: Duplicate Job Prevention

**Decision**: Unique constraint on `(CaseId, StepType)` + idempotency check in `AiJobService.SubmitAsync`  
**Rationale**: Before enqueueing a Hangfire job, `AiJobService` queries for an existing `AiJob` where `CaseId = X AND StepType = Y AND Status IN (Queued, Processing)`. If one exists, it returns the existing job ID without creating a duplicate. The unique constraint at the database level is a safety net. Hangfire's `DisableConcurrentExecution` attribute on the job method prevents two workers from processing the same job simultaneously.  
**Alternatives considered**:
- **Hangfire fingerprint/idempotency keys**: Not natively supported in Hangfire Community; would require custom filter. The service-layer check is simpler and testable.

---

## Decision 5: Job Retry Strategy for Failed AI Calls

**Decision**: Hangfire's built-in automatic retry with exponential backoff (3 attempts: 60 s, 5 min, 1 hour)  
**Rationale**: AI provider calls (OpenAI, Gemini) can transiently fail due to rate limits or network issues. Hangfire's `AutomaticRetry` attribute handles this natively with configurable attempts and delays. After max retries, the job moves to `Failed` state and the `AiJob` record is updated to `Status = Failed` with the error message. The user sees a retry button in the UI which calls the submit endpoint again (creating a new job).  
**Alternatives considered**:
- **Manual retry only**: Leaves transient AI provider failures with no automatic recovery. Rejected.
- **Polly (in-process retry)**: Keeps the HTTP call synchronous; doesn't give durable retry across server restarts. Rejected.

---

## Decision 6: Frontend State Strategy

**Decision**: New `aiJobsSlice` in Redux Toolkit; existing analysis slices (SmartAnalysis, preparingStatementOfClaims) continue to own their result data; job status (queued/processing/completed/failed) lives in `aiJobsSlice`  
**Rationale**: Keeping job metadata separate from result data follows the single-responsibility principle. On page load, `thunkGetAiJobStatus` fetches all job statuses for the case; if a job is `Completed`, its `ResultJson` is also returned and dispatched into the existing slice (e.g., `SmartAnalysis.factAnalysis`). This means existing components that read from `SmartAnalysis` require no changes — they just get populated from the server instead of from a fresh AI call.  
**Alternatives considered**:
- **Merge job status into existing slices**: Rejected — pollutes result-data slices with infrastructure metadata (job ID, Hangfire ID, timestamps).
- **React Query / SWR**: Not in the tech stack; introducing a new data-fetching library requires a constitution amendment.

---

## Decision 7: SignalR Hub Authentication

**Decision**: JWT Bearer token passed as query string to SignalR connection (`accessTokenFactory`)  
**Rationale**: SignalR WebSocket connections cannot send custom headers; the standard ASP.NET Core SignalR pattern is to pass the JWT as `?access_token=<token>` query parameter and configure `JwtBearer` to read from `context.Request.Query["access_token"]` when the path starts with the hub path.  
**Alternatives considered**:
- **Anonymous SignalR hub**: Rejected — violates Principle III (Role-Based Authorization).
- **Cookie-based auth**: Not used in this SPA; JWT is the auth mechanism.

---

## Summary Table

| Question | Decision |
|----------|----------|
| Job queue tech | Hangfire + SQL Server (no Redis, no Node.js) |
| Real-time push | ASP.NET Core SignalR |
| Result storage | JSON column in `AiJobs` table |
| Duplicate prevention | Service-layer check + DB unique constraint |
| Retry on failure | Hangfire AutomaticRetry (3 attempts, exponential backoff) |
| Frontend state | New `aiJobsSlice` + existing analysis slices remain |
| SignalR auth | JWT via `accessTokenFactory` query parameter |
