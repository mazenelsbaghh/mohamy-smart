# API Contract: Judicial Ruling Analysis

**Feature**: 024-ruling-analysis  
**Date**: 2026-04-10  
**Base URL**: `/api/RulingAnalysis`

## Authentication & Authorization

All endpoints require `[Authorize(Roles = "Lawyer")]`.

---

## Endpoints

### POST /api/RulingAnalysis

Start a new ruling analysis workflow for a case.

**Request Body**:
```json
{
  "caseId": 123
}
```

**Response** (`201 Created`):
```json
{
  "succeeded": true,
  "data": {
    "id": 1,
    "caseId": 123,
    "currentStep": 1,
    "status": "InProgress",
    "step1Output": null,
    "step2Output": null,
    "step3Output": null,
    "step4Output": null,
    "createdAt": "2026-04-10T10:00:00Z"
  },
  "message": null
}
```

---

### GET /api/RulingAnalysis/{id}

Get full workflow state.

**Response** (`200 OK`): Same shape with step outputs populated.

---

### GET /api/RulingAnalysis/case/{caseId}

List all ruling analysis workflows for a case.

**Response** (`200 OK`): Array of summaries (id, currentStep, status, createdAt).

---

### POST /api/RulingAnalysis/{id}/step/{stepNumber}

Run step 1–4.

**Step 1 Request Body**:
```json
{
  "judgmentText": "string (criminal judgment text or summary)"
}
```

**Steps 2–4**: Uses prior outputs automatically (`{}`).

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": {
    "stepNumber": 2,
    "output": { /* neutral reasoning analysis JSON */ },
    "workflowCurrentStep": 3,
    "workflowStatus": "InProgress"
  },
  "message": null
}
```

**Error** (`400`): Step run out of order.  
**Error** (`422`): AI response invalid.

---

### PUT /api/RulingAnalysis/{id}/step/{stepNumber}

Save edited step output. Clears downstream steps.

**Request Body**:
```json
{
  "editedOutput": { /* step-specific JSON */ }
}
```

**Response** (`200 OK`): `{ clearedSteps: [n+1, ...4] }`

---

### DELETE /api/RulingAnalysis/{id}

Abandon workflow.

**Response** (`200 OK`): `{ message: "تم إلغاء سير العمل" }`
