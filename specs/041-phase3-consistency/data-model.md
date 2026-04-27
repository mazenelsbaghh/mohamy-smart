# Phase 1: Data Model Updates

## Existing Entity Adjustments

The workflow logic predominantly relies on standard DTOs inherited from `WorkflowServiceBase`. However, the older Defense Memo and Statement of Claims features originally stored data in three separate tables, whereas new logic relies on one.

### `SmartAnalysisWorkflow` (New Entity to Add)
To unify the architecture (HIGH-10), older distinct tables for `FactAnalysis`, `Defense`, and `FinalPrayer` need an equivalent `WorkflowBase` entity.

**Fields**:
- `Id` (Guid, PK)
- `CaseId` (Guid, FK)
- `Status` (Enum: InProgress, Completed, Abandoned, Failed)
- `CreatedAt` (DateTime)
- `CompletedAt` (DateTime, nullable)
- `UserId` / `LawyerId` (string/Guid for row-level ownership validation)

**Relationships**:
- Inherits from `WorkflowBase` if a Base Table architecture exists, else acts equivalently to `RulingAnalysisWorkflow`.
- 1:1 or N:1 relation to `Case` entity.

## Configuration Registry Updates

### `AiModelConfigService` / `PipelineRegistry`
The application must transition away from hardcoded StageConfigurations.

**Structure**:
```csharp
public record PipelineDefinition
{
    public string PipelineId { get; init; } // e.g., "SmartAnalysis", "LegalWarning"
    public List<StageDefinition> Stages { get; init; }
    public string DefaultPromptDirectory { get; init; }
}

public record StageDefinition
{
    public int StepType { get; init; }
    public string RequiredFields { get; init; }
    public string OutputSchemaRegex { get; init; }
}
```

This mapping lives in RAM, populated dynamically from standard configurations rather than static instantiation methods.
