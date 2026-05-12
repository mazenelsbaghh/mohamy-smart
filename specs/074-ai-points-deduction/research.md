# Research: AI Points Deduction

**Branch**: `074-ai-points-deduction`  
**Date**: 2026-05-12

## Decision: Charge After Usable AI Result, Not Before Execution

**Decision**: AI points are deducted only after the backend marks an AI request as completed with usable output accepted by the product. Submit-time logic checks that the user has enough points and may reserve/hold points if implemented, but the final consumed count changes only on successful completion.

**Rationale**: The user explicitly requires that errors do not consume points. Current `CheckAiQuotaAttribute` and `SubscriptionService.UseAiRequestAsync` can deduct before the AI result is known, which is incompatible with failed/no-charge behavior. Completion-time charging also aligns with workflow validation: malformed, rejected, conflicted, cancelled, stale, or failed jobs should not cost the user.

**Alternatives considered**:

- **Deduct before execution and refund on failure**: Works if every failure path is perfectly captured, but creates user-visible balance flicker and higher risk when Hangfire retries, process crashes, or cancellation happens.
- **Deduct on submission without refund**: Rejected because it violates the specification.
- **Make all retries free**: Rejected because successful retries produce new AI value and the user requested confirmation before retry charges.

## Decision: Use Idempotent Point Transactions Tied To AI Request Attempts

**Decision**: Every chargeable AI request attempt has a stable accounting identity tied to `AiJob.Id`, action type, retry/re-run intent, and workflow context. A unique transaction record prevents duplicate charges when the same completion is observed more than once.

**Rationale**: The system already has duplicate-risk paths: double-click prevention in the frontend, active-job uniqueness in `AiJobs`, browser refresh, SignalR repeat delivery, Hangfire retry, and resume flow. A persisted unique transaction key is the strongest guard because it survives process restarts and repeated completion events.

**Alternatives considered**:

- **Frontend-only double-click prevention**: Rejected because refresh, SignalR, and background job retries are server-side concerns.
- **Only checking `AiJob.Status == Completed`**: Rejected because a completed job can be processed or reported multiple times.
- **Using `AiUsageRecord` alone without a transaction type/status**: Insufficient for failed no-charge attempts, restored holds, support history, and idempotency.

## Decision: Extend Existing Usage/Subscription Model Instead Of Creating A Separate Wallet System

**Decision**: Keep `LawyerSubscription.UsedAiRequests` and `Subscription.AiRequestsLimit` as the canonical subscription quota for this release, and extend accounting records so they can represent charges, no-charge failures, holds, and restorations. Treat one point as one AI request unless future pricing requires per-action weights.

**Rationale**: The current product already exposes "رصيد الاستفسارات" and tracks `UsedAiRequests`. Reusing the existing subscription model minimizes scope and keeps admin reports compatible while adding the missing correctness guarantees.

**Alternatives considered**:

- **New independent wallet balance**: More flexible but larger scope; it would require plan migration, billing behavior changes, and new admin management screens.
- **Token-cost-based charging**: More precise for provider cost, but the product currently sells request limits, not token credits.
- **One static global limit without history**: Rejected because the spec requires usage history and disputed charge traceability.

## Decision: Backend Enforces Retry/Re-run Charge Rules, Frontend Presents Confirmation

**Decision**: The lawyer dashboard must show Arabic confirmation before retry, regenerate, re-run, or start-over AI actions. The backend must still validate intent metadata and point availability for repeated chargeable requests before queuing them.

**Rationale**: UX confirmation prevents accidental charges, but server enforcement is required because clients can be stale, bypassed, or fail to refresh balance. The confirmation also needs live cost and balance data to avoid submitting after the balance becomes insufficient.

**Alternatives considered**:

- **Frontend-only confirmation**: Rejected because it cannot enforce business rules.
- **Backend-only rejection without confirmation UI**: Rejected because it would surprise users and fail the usability requirement.
- **Confirmation for all initial AI actions**: Not required by the spec. Initial actions should show cost, while repeated actions require explicit confirmation.

## Decision: Failure, Conflict, Cancel, Stale, And Validation-Rejected Outcomes Are No-Charge

**Decision**: No points are deducted for statuses or outcomes where the user does not receive usable AI output: failed, timed out, cancelled, conflicted, stale ignored, insufficient points, provider errors, malformed output, validation rejection, and user-declined confirmation.

**Rationale**: These outcomes do not produce user value. They also map directly to existing `AiJobStatus.Failed`, `Conflict`, error messages, stale-run handling, and validation failure behavior.

**Alternatives considered**:

- **Charge provider failures because provider cost may exist**: Rejected because the business requirement is user-value-based charging.
- **Charge stale completions if the model ran**: Rejected because stale output is intentionally ignored and not useful to the active run.
- **Charge conflicts to discourage retries**: Rejected because conflicts are system state issues and should remain recoverable.

## Decision: Add Point Metadata To AI Job Status Payloads

**Decision**: AI job status responses and SignalR payloads should include charge metadata: action cost, charge state, charged amount, no-charge reason, and current balance summary where available.

**Rationale**: The existing UI hydrates and resumes jobs through AI job status. Adding charge metadata to the same lifecycle avoids extra polling and makes refresh/retry behavior easier to keep correct.

**Alternatives considered**:

- **Separate balance polling after every job event**: Works but adds more race conditions and UI latency.
- **Only update subscription page balance**: Rejected because users need feedback in the AI workflow where the charge happens.
- **Only toast messages without payload state**: Rejected because refresh/resume screens also need durable charge status.

## Decision: Admin Reporting Uses The Same Ledger

**Decision**: AI usage reporting should read from the same point transaction/usage records used for charging, distinguishing successful charges from failed no-charge attempts and restored holds.

**Rationale**: Support needs traceability for disputed charges. Existing admin AI usage reports can remain provider/cost oriented but should include point outcome fields once available.

**Alternatives considered**:

- **Separate support-only audit table**: More duplication and potential mismatch.
- **No admin/reporting changes**: Rejected by the spec's history requirement.
