# API Contract: Official Legal Warning / Judicial Notice

**Feature**: 025-legal-warning  
**Date**: 2026-04-10  
**Base URL**: `/api/LegalWarning`

## Authentication & Authorization

All endpoints require `[Authorize(Roles = "Lawyer")]`.

---

## Endpoints

### POST /api/LegalWarning

Start a new legal warning workflow for a case.

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
    "createdAt": "2026-04-10T10:00:00Z"
  },
  "message": null
}
```

---

### GET /api/LegalWarning/{id}

Get full workflow state.

**Response** (`200 OK`): Same shape with outputs populated.

---

### GET /api/LegalWarning/case/{caseId}

List all warning workflows for a case.

**Response** (`200 OK`): Array of summaries.

---

### POST /api/LegalWarning/{id}/step/{stepNumber}

Run step 1–3.

**Step 1 Request Body**:
```json
{
  "obligationFacts": "string (lawyer's narrative of the debt/obligation situation)"
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
      "warningType": "تكليف بالوفاء",
      "triggersLegalDefault": true,
      "legalDefaultJustification": "...",
      "legalSummary": { /* ... */ },
      "factualGrounds": { /* ... */ },
      "missingElements": []
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

### PUT /api/LegalWarning/{id}/step/{stepNumber}

Save edited step output. Clears downstream steps.

**Request Body**:
```json
{
  "editedOutput": { /* step-specific JSON */ }
}
```

**Response** (`200 OK`): `{ clearedSteps: [n+1, ...3] }`

---

### DELETE /api/LegalWarning/{id}

Abandon workflow.

**Response** (`200 OK`): `{ message: "تم إلغاء سير العمل" }`
