# Data Model: AI Points Deduction

**Branch**: `074-ai-points-deduction`  
**Date**: 2026-05-12

## Overview

This feature extends existing AI job, usage, and subscription data so every chargeable AI action has a durable accounting trail. The model keeps subscription request limits as the user-facing "points" balance and adds idempotent records for charged, failed no-charge, held, and restored outcomes.

## Entities

### AI Action

Represents a configured AI capability that may consume points.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `actionKey` | string | Yes | Stable key, usually based on `AiStepType` or other AI action identifier |
| `stepType` | AiStepType | Yes for job-backed actions | Existing enum for workflow/chat/OCR jobs |
| `displayNameAr` | string | Yes | Arabic user-facing action name |
| `pointCost` | int | Yes | Default 1 for current request-based plans |
| `isChargeable` | bool | Yes | Explicit false for free actions |
| `workflowType` | string? | No | Workflow identifier when relevant |
| `requiresConfirmationOnRepeat` | bool | Yes | True for retry, regenerate, re-run, start-over |

**Validation Rules**:

- `pointCost` must be greater than or equal to 0.
- `isChargeable = false` requires `pointCost = 0`.
- Every user-triggered AI action must resolve to exactly one `AI Action` configuration.

### Point Balance

Represents the user's available AI request points through the active subscription.

**Existing source**:

- `LawyerSubscription.UsedAiRequests`
- `Subscription.AiRequestsLimit`

**Derived Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `limit` | int | Yes | From active subscription plan |
| `used` | int | Yes | Charged successful requests |
| `held` | int | Optional | If hold/reserve is implemented |
| `available` | int | Yes | `limit - used - held` or `limit - used` when no hold is implemented |
| `subscriptionActive` | bool | Yes | False when absent or expired |

**Validation Rules**:

- `used` must never exceed `limit` through successful charge flows.
- Insufficient points must block before the AI request is queued.
- Expired subscriptions must be deactivated before availability is returned.

### AI Request

Represents a submitted AI attempt, backed by existing `AiJob`.

**Existing Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | Guid | Yes | Stable request/accounting identity |
| `caseId` | Guid | Yes | Existing case context |
| `stepType` | AiStepType | Yes | Existing AI step |
| `status` | AiJobStatus | Yes | Queued, Processing, Completed, Failed, Conflict |
| `runId` | string? | No | Workflow run identity |
| `workflowType` | string? | No | Workflow identifier |
| `stepNumber` | int? | No | Workflow stage |
| `resultJson` | string? | No | Present on completed usable output |
| `errorCode` | string? | No | Failure/conflict/stale reason |

**New Accounting Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `pointCost` | int | Yes | Cost resolved at submit time |
| `chargeState` | enum | Yes | Pending, Held, Charged, NoCharge, Restored |
| `chargedPoints` | int | Yes | 0 until charged; equals `pointCost` after charge |
| `chargeReason` | string? | No | Arabic/status-safe reason for no-charge or restoration |
| `chargedAt` | DateTime? | No | Set once when points are consumed |
| `isRepeatAttempt` | bool | Yes | True for retry/regenerate/re-run/start-over |
| `repeatKind` | enum? | No | RetryAfterFailure, RegenerateAfterSuccess, StartOver |
| `confirmationAcceptedAt` | DateTime? | Required for repeat attempts | Proof that user accepted the charge warning |

**Validation Rules**:

- A chargeable repeat attempt cannot be queued unless `confirmationAcceptedAt` is present.
- `Charged` requires `status = Completed`, usable output, and exactly one successful point transaction.
- `NoCharge` is required for failed, cancelled, conflicted, stale, malformed, blocked, or validation-rejected attempts.
- `chargedPoints` must be 0 unless `chargeState = Charged`.

### Point Transaction

Represents the durable ledger entry for a balance-impacting or no-charge outcome.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | Guid | Yes | Ledger identity |
| `lawyerId` | Guid | Yes | User owner |
| `lawyerSubscriptionId` | Guid | Yes | Active subscription at time of transaction |
| `aiJobId` | Guid? | Required for job-backed actions | Unique charge identity |
| `caseId` | Guid? | No | Case context |
| `workflowType` | string? | No | Workflow context |
| `workflowRunId` | string? | No | Run context |
| `stepType` | AiStepType | Yes | AI action type |
| `transactionType` | enum | Yes | Hold, Charge, Restore, NoCharge |
| `points` | int | Yes | Positive point amount; 0 allowed only for NoCharge |
| `balanceBefore` | int | Yes | Used/request count before transaction |
| `balanceAfter` | int | Yes | Used/request count after transaction |
| `reasonCode` | string | Yes | Success, Failed, Timeout, Cancelled, Conflict, StaleIgnored, InvalidOutput, InsufficientPoints, ConfirmationDeclined |
| `messageAr` | string | Yes | User/support readable Arabic explanation |
| `createdAt` | DateTime | Yes | UTC timestamp |

**Validation Rules**:

- Unique index on successful charge by `aiJobId` and `transactionType = Charge`.
- Restore must reference a prior hold for the same request if hold mode is used.
- NoCharge records must not increase `UsedAiRequests`.

### AI Usage Record

Existing provider usage analytics record.

**Relevant Existing Fields**:

- `LawyerId`
- `CaseId`
- `WorkflowId`
- `WorkflowRunId`
- `WorkflowType`
- `AiStepType`
- `ModelIdentifier`
- `Provider`
- `InputTokens`
- `OutputTokens`
- `TotalTokens`
- `EstimatedCostUsd`
- `CreatedAt`

**Additional Planning Notes**:

- Add optional accounting reference fields if reusing this table for ledger-like reporting is chosen during implementation.
- Provider usage may exist even when no user points are charged, but reports must distinguish provider cost from user charge.

### Retry Confirmation

Represents the user consent needed before repeated chargeable actions.

**Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `actionKey` | string | Yes | Action being repeated |
| `repeatKind` | enum | Yes | RetryAfterFailure, RegenerateAfterSuccess, StartOver |
| `pointCost` | int | Yes | Displayed cost |
| `balanceAvailable` | int | Yes | Displayed available balance |
| `accepted` | bool | Yes | User decision |
| `acceptedAt` | DateTime? | Required when accepted | Sent with backend request for repeat attempts |

**Validation Rules**:

- Declined confirmations must never submit a backend AI request.
- Accepted confirmations must be revalidated against current backend balance before queueing.

## State Transitions

### AI Request Charge Lifecycle

```text
Draft submit
  -> AvailabilityChecked
  -> Queued / Processing
  -> Completed + UsableResult
  -> Charged

Draft submit
  -> AvailabilityChecked
  -> Queued / Processing
  -> Failed | Conflict | Cancelled | Timeout | InvalidOutput | StaleIgnored
  -> NoCharge

Repeat action
  -> ConfirmationShown
  -> Declined
  -> NoRequestSubmitted

Repeat action
  -> ConfirmationShown
  -> Accepted
  -> BackendAvailabilityRechecked
  -> Queued / Processing
  -> Charged or NoCharge
```

## Relationships

- `AI Request` belongs to one lawyer through its case/workflow context.
- `AI Request` may produce one successful `Point Transaction` of type `Charge`.
- `AI Request` may produce one or more audit transactions for hold/restore/no-charge depending on implementation.
- `Point Transaction` belongs to one active `LawyerSubscription`.
- `AI Usage Record` remains provider analytics and may reference the same job/action context as `Point Transaction`.

## Migration Impact

- Add accounting fields to `AiJobs`, or create a dedicated point ledger table plus minimal job references.
- Add unique constraints to prevent duplicate successful charges for the same job.
- Existing completed jobs should default to a neutral legacy/no-ledger state unless backfilled explicitly.
- Existing `UsedAiRequests` values remain as current consumed balance and are not recalculated during migration unless a separate reconciliation task is approved.
