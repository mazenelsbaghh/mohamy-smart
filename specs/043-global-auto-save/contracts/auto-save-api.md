# API Contract: Auto-save

## Background
The application uses unified workflow infrastructures. Each workflow step maps to a dictionary integer key (e.g., Step 1, Step 2).

## Contract: Auto-save Step

**Endpoint**: `PATCH /api/{ControllerName}/{workflowId}/step/{stepNumber}/auto-save`

*(Example: `PATCH /api/AppealBrief/15/step/2/auto-save`)*

### Request Payload

The payload adheres to `SaveWorkflowDraftRequest`:

```json
{
  "stepIndex": 2,
  "payload": {
    "warningBody": "Draft text representation..."
  }
}
```

### Response (200 OK)

```json
{
  "succeeded": true,
  "data": {
    "stepNumber": 2,
    "lastSavedAt": "2026-04-12T18:20:00.0000000Z"
  }
}
```

### Validation Rules
- The endpoint DOES NOT trigger AI jobs or LLM validations.
- The endpoint saves the raw JSON/string payload directly into the `Outputs` dictionary of the workflow, and updates `UpdatedAt`.
- It implements `ICaseAccessValidator` to ensure the lawyer owns the base case of this workflow.
