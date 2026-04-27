# Data Models: Phase 8 Documentation & Developer Experience

## `PipelineDefinition` (Domain Entity)

Located in `Lawyer.Core/Models/Workflows/`.

### Fields
- `string Id`: Unique identifier for the pipeline (e.g., `"defense-memo"`).
- `string Name`: Human-readable name (e.g., `"مذكرة الدفاع"`).
- `int TotalSteps`: The total number of generic steps this workflow has.
- `List<PipelineStepDefinition> Steps`: (Optional) precise structure of the steps depending on registry complexity.

### Relationships
- Aggregated inside `PipelineRegistry`.
- Used by `AiModelConfigService` to serialize config models.

## `PipelineRegistry` (Static/Singleton Registry)

Located in `Lawyer.Application/Services/Workflows/`.

### Methods
- `PipelineDefinition Get(string id)`: Retrieve a single workflow definition by its programmatic identifier.
- `IEnumerable<PipelineDefinition> GetAll()`: Retrieve all registered pipelines.
