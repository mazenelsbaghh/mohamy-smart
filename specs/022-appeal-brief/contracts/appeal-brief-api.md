# API Contract: Appeal Brief Preparation

**Feature**: 022-appeal-brief  
**Date**: 2026-04-10  
**Base URL**: `/api/AppealBrief`

## Authentication & Authorization

All endpoints require `[Authorize(Roles = "Lawyer")]`.

---

## Endpoints

### POST /api/AppealBrief

Start a new appeal brief workflow for a case.

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
    "step5Output": null,
    "step6Output": null,
    "createdAt": "2026-04-10T10:00:00Z"
  },
  "message": null
}
```

**Error** (`404 Not Found`): Case not found or not owned by this lawyer.

---

### GET /api/AppealBrief/{id}

Get full workflow state (for resuming).

**Response** (`200 OK`): Same shape as POST response with all step outputs populated as far as they've been run.

---

### GET /api/AppealBrief/case/{caseId}

Get all appeal workflows for a case.

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": [
    {
      "id": 1,
      "caseId": 123,
      "currentStep": 3,
      "status": "InProgress",
      "createdAt": "2026-04-10T10:00:00Z"
    }
  ],
  "message": null
}
```

---

### POST /api/AppealBrief/{id}/step/{stepNumber}

Run a specific step (1–6). Submits the lawyer's input for that step and returns the AI output.

**URL params**: `id` (workflow id), `stepNumber` (1–6)

**Request Body** (varies by step — all inputs are free Arabic text or structured data):

*Step 1 example:*
```json
{
  "judgmentText": "string (raw judgment text or summary)"
}
```

*Steps 2–5 example (no additional input — uses prior step outputs):*
```json
{}
```

*Step 6 example:*
```json
{}
```

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": {
    "stepNumber": 1,
    "output": { /* step-specific JSON object — see data-model.md */ },
    "workflowCurrentStep": 2,
    "workflowStatus": "InProgress"
  },
  "message": null
}
```

**Error** (`400 Bad Request`):
```json
{
  "succeeded": false,
  "data": null,
  "message": "لا يمكن تشغيل الخطوة 3 قبل إكمال الخطوة 2"
}
```

**Error** (`422 Unprocessable Entity`): AI returned empty/invalid response.

---

### PUT /api/AppealBrief/{id}/step/{stepNumber}

Save a manually edited step output (lawyer edits the AI output). Clears all downstream step outputs.

**Request Body**:
```json
{
  "editedOutput": { /* step-specific JSON object */ }
}
```

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": {
    "workflowCurrentStep": 3,
    "clearedSteps": [4, 5, 6]
  },
  "message": "تم حفظ التعديلات وإعادة ضبط الخطوات التالية"
}
```

---

### DELETE /api/AppealBrief/{id}

Abandon a workflow (sets status to Abandoned).

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": null,
  "message": "تم إلغاء سير العمل"
}
```
