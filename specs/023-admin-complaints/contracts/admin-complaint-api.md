# API Contract: Administrative Complaints & Grievances

**Feature**: 023-admin-complaints  
**Date**: 2026-04-10  
**Base URL**: `/api/AdminComplaint`

## Authentication & Authorization

All endpoints require `[Authorize(Roles = "Lawyer")]`.

---

## Endpoints

### POST /api/AdminComplaint

Start a new administrative complaint workflow for a case.

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
    "createdAt": "2026-04-10T10:00:00Z"
  },
  "message": null
}
```

---

### GET /api/AdminComplaint/{id}

Get full workflow state.

**Response** (`200 OK`): Same shape with step outputs populated.

---

### GET /api/AdminComplaint/case/{caseId}

List all complaint workflows for a case.

**Response** (`200 OK`): Array of workflow summaries (id, currentStep, status, createdAt).

---

### POST /api/AdminComplaint/{id}/step/{stepNumber}

Run step 1–5.

**Step 1 Request Body**:
```json
{
  "grievanceNarrative": "string (lawyer's raw description of the client's grievance)"
}
```

**Steps 2–5**: Uses prior step outputs automatically (empty body `{}`).

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": {
    "stepNumber": 1,
    "output": { /* step-specific JSON — see data-model.md */ },
    "workflowCurrentStep": 2,
    "workflowStatus": "InProgress"
  },
  "message": null
}
```

**Error** (`400`): Step run out of order.  
**Error** (`422`): AI returned invalid response.

---

### PUT /api/AdminComplaint/{id}/step/{stepNumber}

Save edited step output. Clears downstream steps.

**Request Body**:
```json
{
  "editedOutput": { /* step-specific JSON */ }
}
```

**Response** (`200 OK`): `{ clearedSteps: [n+1, ...5] }`

---

### DELETE /api/AdminComplaint/{id}

Abandon workflow.

**Response** (`200 OK`): `{ message: "تم إلغاء سير العمل" }`
