# Phase 1: Data Models

## Entities

### `RunWorkflowStepRequest` (Input Data Transfer Object)
Standardizes the trigger for stepping an AI workflow, shared everywhere.
- **`CaseId`** (Guid): Identifier for the target `Case`.
- **`WorkflowId`** (int?): Identifies an existing workflow if present, else creates one.
- **`StepNumber`** (int): Specifically which AI step to execute bounds.
- **`Input`** (string?): Optional human text configuration or feedback for the AI step.

### `StepOutputSchemas` (Static Validation Map)
A utility mapping engine rather than a typical persisted entity.
- Uses built-in `System.Text.Json.JsonSerializer` to attempt deserialization to discrete interface targets depending on the requested `stepType` ID integer.
- Intercepts bad types and drops or attempts retry extraction.

### `[PipelineStep]Output` (Sub-DTO Types)
Used explicitly during the deserialization validation attempt in `StepOutputSchemas`.
- Must match the exact snake_case JSON outputs defined in the LLM prompts.
- Employs `[JsonPropertyName("field_name_in_snake")]` universally.
