# API Contract: Executive & Precautionary Requests

**Feature**: 026-exec-requests  
**Date**: 2026-04-10  
**Base URL**: `/api/ExecRequest`

## Authentication & Authorization

All endpoints require `[Authorize(Roles = "Lawyer")]`.

---

## Endpoints

### POST /api/ExecRequest

Start a new executive/precautionary request workflow for a case.

**Request Body**:
```json
{
  "caseId": 123,
  "executiveTitleType": "judicial"
}
```

> `executiveTitleType`: `"judicial"` | `"contractual"` | `"commercial"` — selected by lawyer from dropdown.

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
    "createdAt": "2026-04-10T10:00:00Z"
  },
  "message": null
}
```

---

### GET /api/ExecRequest/{id}

Get full workflow state.

**Response** (`200 OK`): Same shape with outputs populated.

---

### GET /api/ExecRequest/case/{caseId}

List all exec request workflows for a case.

**Response** (`200 OK`): Array of summaries.

---

### POST /api/ExecRequest/{id}/step/{stepNumber}

Run step 1–3.

**Step 1 Request Body**:
```json
{
  "caseFacts": "string (lawyer's summary of the case facts and execution need)"
}
```

**Steps 2–3**: Uses prior outputs automatically (`{}`).

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": {
    "stepNumber": 1,
    "output": {
      "requestNature": ["Executive"],
      "detailedRequestType": "...",
      "legalBasis": { "type": "judicial", "description": "..." },
      "courtCompetency": { "courtName": "...", "proceduralStage": "..." },
      "serviceRequirements": { "isServiceRequired": false, "previousWarningDetails": null },
      "factsSummary": "...",
      "classificationStatement": "..."
    },
    "workflowCurrentStep": 2,
    "workflowStatus": "InProgress"
  },
  "message": null
}
```

**Error** (`400`): Step run out of order.  
**Error** (`422`): AI response invalid.

---

### PUT /api/ExecRequest/{id}/step/{stepNumber}

Save edited step output. Clears downstream steps.

**Request Body**:
```json
{
  "editedOutput": { /* step-specific JSON */ }
}
```

**Response** (`200 OK`): `{ clearedSteps: [n+1, ...3] }`

---

### DELETE /api/ExecRequest/{id}

Abandon workflow.

**Response** (`200 OK`): `{ message: "تم إلغاء سير العمل" }`
