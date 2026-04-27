# Unified HTTP Workflow Step Execution Request

This unified interface replaces divergent step inputs across the architecture (e.g. `AdminComplaintRequest`, `LegalWarningStepRequest`, etc.). All POST requests kicking off or configuring an AI-based legal analysis step MUST adhere to this structure natively accepted by the .NET controllers.

**Endpoint example**: `POST /api/Analysis/workflow/run-step`

### JSON Request Payload
```json
{
  "caseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "workflowId": 12,
  "stepNumber": 2,
  "input": "Required context from the user manually inputted in text fields."
}
```

### Fields Definition

- **`caseId`** (`uuid`, Root Dependency): The core application case being processed.
- **`workflowId`** (`integer`, Optional): The active `WorkflowBase` execution ID. If omitted or null, the system automatically infers picking up the existing un-completed active workflow for this case, or spinning up a new execution pipeline if none exists.
- **`stepNumber`** (`integer`, Required Bounds: 1 - N): The current index of the workflow stage being requested (e.g. `1` for Verdict Analysis, `2` for Reasons Analysis).
- **`input`** (`string`, Optional): Additional user override parameters, free-text prompt context, or notes.
