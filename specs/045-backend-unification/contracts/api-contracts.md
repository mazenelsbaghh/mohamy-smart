# API Contract: Validation Failures (Admin Dashboard)

## GET /api/admin/validation-failures

Retrieve paginated schema validation failure records for admin review.

### Request

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| page | int | query | no | Page number (default: 1) |
| pageSize | int | query | no | Items per page (default: 20, max: 100) |
| workflowType | string | query | no | Filter by workflow type (e.g., "appeal-brief") |
| stepType | int | query | no | Filter by AiStepType int value |
| from | datetime | query | no | Filter failures after this UTC timestamp |
| to | datetime | query | no | Filter failures before this UTC timestamp |

### Response (200 OK)

```json
{
  "succeeded": true,
  "data": {
    "items": [
      {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "workflowType": "ruling-analysis",
        "stepType": 60,
        "occurredAt": "2026-04-14T12:30:00Z",
        "errorSummary": "Missing required field: verdictSummary",
        "caseId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "lawyerId": "user-guid-here"
      }
    ],
    "totalCount": 42,
    "page": 1,
    "pageSize": 20
  },
  "message": null,
  "statusCode": 200
}
```

### Authorization

- Requires `Admin` role (`[Authorize(Roles = "Admin")]`)

---

## Internal Contract: StepOutputSchemas.Normalize

Not an HTTP endpoint — an internal method contract used by all workflow services.

### Signature

```csharp
public static object Normalize(int stepTypeAsInt, string rawAiOutput)
```

### Behavior After Unification

1. Clean the raw output via `AnalysisHelpers.CleanJsonResponse()`
2. Detect naming convention (snake_case vs camelCase) — if snake_case, convert to camelCase
3. Deserialize into the typed DTO for the given step type
4. If deserialization succeeds → return the typed DTO
5. If deserialization fails → throw `SchemaValidationException` (new custom exception)
   - The caller (WorkflowServiceBase or legacy service) is responsible for creating the `ValidationFailureRecord` and returning an error result

### Step Type Coverage (exhaustive)

| Range | Workflow | Step Types |
|-------|----------|------------|
| 10–13 | Smart Analysis | FactAnalysis, GenerateDefenses, AnalysisDefense, FinalRequirements |
| 20–25 | Statement of Claims | CaseType, Parties, Subjects, Facts, LegalBasis, Requests |
| 40–45 | Appeal Brief | JudgmentData, ReasoningAnalysis, Grounds, Requests, LegalBasis, Assembly |
| 50–54 | Admin Complaint | Classification, Facts, Violation, Requests, Assembly |
| 60–63 | Ruling Analysis | Operative, Reasoning, DefectEvaluation, FeasibilityReport |
| 70–72 | Legal Warning | Classification, BodyDraft, Assembly |
| 80–82 | Exec Request | Classification, Drafting, Assembly |
