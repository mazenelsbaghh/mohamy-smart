# Contract: AI Points API

**Feature**: AI Points Deduction  
**Date**: 2026-05-12

## Purpose

Define backend-visible behavior for AI point availability, charging, retry confirmation enforcement, and status reporting. Exact route names may follow existing controller conventions, but the response semantics are mandatory.

## Shared Types

### Point Balance Summary

```json
{
  "limit": 100,
  "used": 12,
  "held": 0,
  "available": 88,
  "subscriptionActive": true,
  "messageAr": "رصيدك الحالي 88 نقطة"
}
```

### Charge Metadata

```json
{
  "pointCost": 1,
  "chargeState": "Pending",
  "chargedPoints": 0,
  "chargeReason": null,
  "chargedAt": null,
  "isRepeatAttempt": false,
  "repeatKind": null,
  "requiresConfirmation": false,
  "balance": {
    "limit": 100,
    "used": 12,
    "held": 0,
    "available": 88,
    "subscriptionActive": true,
    "messageAr": "رصيدك الحالي 88 نقطة"
  }
}
```

Allowed `chargeState` values:

- `Pending`
- `Held`
- `Charged`
- `NoCharge`
- `Restored`

Allowed `repeatKind` values:

- `RetryAfterFailure`
- `RegenerateAfterSuccess`
- `StartOver`

## Submit AI Job

Existing behavior submits a job for a case and AI step. The request must be extended to include repeated-action intent when applicable.

### Request Body

```json
{
  "stepType": "RulingAnalysisReasoning",
  "inputJson": "{\"example\":true}",
  "runId": "run-123",
  "workflowType": "ruling-analysis",
  "stepNumber": 2,
  "repeatIntent": null,
  "confirmationAcceptedAt": null
}
```

For retry/regenerate/re-run/start-over:

```json
{
  "stepType": "RulingAnalysisReasoning",
  "inputJson": "{\"example\":true}",
  "runId": "run-123",
  "workflowType": "ruling-analysis",
  "stepNumber": 2,
  "repeatIntent": "RetryAfterFailure",
  "confirmationAcceptedAt": "2026-05-12T10:30:00Z"
}
```

### Success Response

```json
{
  "succeeded": true,
  "message": "تم إرسال الطلب بنجاح. سيتم خصم النقاط عند اكتمال النتيجة بنجاح.",
  "data": {
    "id": "a6fce83f-8222-4c09-87cf-3d5be4e07f6a",
    "caseId": "7a364c1e-69be-44c0-b1b6-70a3eb0b6df2",
    "stepType": "RulingAnalysisReasoning",
    "status": "Queued",
    "resultJson": null,
    "errorMessage": null,
    "createdAt": "2026-05-12T10:30:01Z",
    "completedAt": null,
    "runId": "run-123",
    "workflowType": "ruling-analysis",
    "stepNumber": 2,
    "errorCode": null,
    "charge": {
      "pointCost": 1,
      "chargeState": "Pending",
      "chargedPoints": 0,
      "chargeReason": null,
      "chargedAt": null,
      "isRepeatAttempt": true,
      "repeatKind": "RetryAfterFailure",
      "requiresConfirmation": false,
      "balance": {
        "limit": 100,
        "used": 12,
        "held": 0,
        "available": 88,
        "subscriptionActive": true,
        "messageAr": "رصيدك الحالي 88 نقطة"
      }
    }
  }
}
```

### Error Responses

Insufficient points:

```json
{
  "succeeded": false,
  "message": "رصيد النقاط غير كافٍ لتشغيل هذا الطلب.",
  "data": {
    "requiredPoints": 1,
    "availablePoints": 0,
    "balance": {
      "limit": 100,
      "used": 100,
      "held": 0,
      "available": 0,
      "subscriptionActive": true,
      "messageAr": "لا توجد نقاط متاحة"
    }
  }
}
```

Missing confirmation for repeat:

```json
{
  "succeeded": false,
  "message": "يجب تأكيد إعادة المحاولة قبل إرسال طلب جديد يستهلك نقاطًا.",
  "data": {
    "requiresConfirmation": true,
    "pointCost": 1,
    "repeatKind": "RetryAfterFailure"
  }
}
```

## AI Job Status

All job status responses and SignalR payloads must include charge metadata when the job is chargeable.

### Completed Charged Job

```json
{
  "id": "a6fce83f-8222-4c09-87cf-3d5be4e07f6a",
  "status": "Completed",
  "resultJson": "{...}",
  "errorMessage": null,
  "charge": {
    "pointCost": 1,
    "chargeState": "Charged",
    "chargedPoints": 1,
    "chargeReason": "تم خصم نقطة واحدة بعد اكتمال النتيجة بنجاح.",
    "chargedAt": "2026-05-12T10:31:20Z",
    "isRepeatAttempt": true,
    "repeatKind": "RetryAfterFailure",
    "requiresConfirmation": false,
    "balance": {
      "limit": 100,
      "used": 13,
      "held": 0,
      "available": 87,
      "subscriptionActive": true,
      "messageAr": "تم خصم نقطة واحدة. رصيدك المتاح الآن 87 نقطة."
    }
  }
}
```

### Failed No-Charge Job

```json
{
  "id": "a6fce83f-8222-4c09-87cf-3d5be4e07f6a",
  "status": "Failed",
  "resultJson": null,
  "errorMessage": "حدث خطأ أثناء معالجة الطلب عبر الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.",
  "charge": {
    "pointCost": 1,
    "chargeState": "NoCharge",
    "chargedPoints": 0,
    "chargeReason": "لم يتم خصم أي نقاط لأن الطلب لم يكتمل بنجاح.",
    "chargedAt": null,
    "isRepeatAttempt": false,
    "repeatKind": null,
    "requiresConfirmation": false,
    "balance": {
      "limit": 100,
      "used": 12,
      "held": 0,
      "available": 88,
      "subscriptionActive": true,
      "messageAr": "لم يتم خصم أي نقاط."
    }
  }
}
```

## Point History

History used by support/admin and user-facing account pages must distinguish successful charges from no-charge attempts.

### Response Item

```json
{
  "id": "9ae5f8ee-7ebf-4775-bdab-2071a23e4316",
  "createdAt": "2026-05-12T10:31:20Z",
  "caseId": "7a364c1e-69be-44c0-b1b6-70a3eb0b6df2",
  "workflowType": "ruling-analysis",
  "workflowRunId": "run-123",
  "stepType": "RulingAnalysisReasoning",
  "transactionType": "Charge",
  "points": 1,
  "balanceBefore": 12,
  "balanceAfter": 13,
  "reasonCode": "Success",
  "messageAr": "تم خصم نقطة واحدة بعد اكتمال تحليل أسباب الحكم."
}
```

## Invariants

- Backend is the source of truth for point availability and final charges.
- A successful AI job can create at most one `Charge` transaction.
- Implemented endpoints follow existing controller casing: `GET /api/v1/Subscription/ai-points/balance` and `GET /api/v1/Subscription/ai-points/history`.
- Submit-time insufficient-point errors currently return the shared `Result` error message with HTTP 402; detailed `requiredPoints` and `availablePoints` payloads can be added later without changing charge semantics.
- Repeated attempts create a new `AiJob` row when `repeatIntent` is present so a successful re-run can be charged independently from the original job.
- Stale, cancelled, timed-out, conflicted, and failed jobs are persisted as no-charge outcomes before user-facing notifications.
- Failed/conflicted/cancelled/stale/invalid AI jobs must not increase `UsedAiRequests`.
- Repeat attempts without accepted confirmation must be rejected before queueing.
- Viewing historical results must not create any point transaction.
