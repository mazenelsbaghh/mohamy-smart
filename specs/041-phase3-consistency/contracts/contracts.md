# Contract: Standard Workflow Execution API

**Type**: REST HTTP API Endpoint + JSON Schemas
**Context**: Re-enforces the contract expected across all 7 AI stage variants.

## I. Standard Execution Response

Regardless of the workflow type, success shapes must adhere to:

```json
{
  "isSuccess": true,
  "data": {
    "workflowId": "guid",
    "stepNumber": 1,
    "status": "InProgress" // or "Completed" / "Failed"
  },
  "message": "Workflow step initialized successfully." // Or similar localized text
}
```

## II. Standard Application / Validation Error Shape

If the payload to `/api/{workflowName}/execute` is malformed, lacks permissions, or has logic errors, the `Result<T>.Error` structure is explicitly used. 

**Format**:
```json
{
  "isSuccess": false,
  "data": null,
  "errorType": 400, // Or 403, 404 HTTP semantic mapping
  "message": "Validation failed: [Details from StepOutputSchemas]",
  "errors": [
    "Field 'DefendantName' is missing",
    "Field 'LegalBasis' failed JSON deserialization constraints"
  ]
}
```

## III. Standard Abandon Endpoint

New endpoint contract for early termination of workflows:

**POST** `/api/{workflowEndpointName}/{workflowId}/abandon`
- **Request Body**: Empty or `null`
- **Response**: `200 OK` (Standard Success Response above) updating Status to `Abandoned`.
