# Developer Quickstart: Backend Unification Architecture

This quickstart guides developers transitioning from the legacy multi-pattern backend schemas onto the single, unified analytical processing system.

## 1. Unified Utility Methods

Always utilize `AnalysisHelpers` for generic parsing:
```csharp
// DON'T: Extract JSON outputs inline manually.
// DO: Use the abstracted utility method:
var finalJson = AnalysisHelpers.CleanJsonResponse(rawAiResponse);
var dataDto = AnalysisHelpers.DeserializeOutput<AnalysisStepDto>(finalJson);
```

## 2. Implementing Workflows

If you are modifying or mapping new analytical workflows, do NOT implement standalone execution methods. Inherit from `WorkflowServiceBase`:

```csharp
public class SmartAnalysisService : WorkflowServiceBase<SmartAnalysisWorkflow, SmartAnalysisStepOutput>
{
    // Implementation uses unified step saving and parsing mechanism
    // Base class handles: validation, access security, state serialization.
}
```

## 3. Database Security Check Constraints

Ensure your components do not perform arbitrary database queries that bypass token security tests. Rely completely on the injected `ICaseAccessValidator`:
```csharp
await _accessValidator.ValidateCaseAccessAsync(caseId); // Core enforces lawyer tenancy bounds automatically
```

## 4. Frontend Binding Contract
When dealing with DTO adjustments, ensure attributes rely on the global configuration utilizing `System.Text.Json` and `camelCase` default conventions globally. Output shapes should seamlessly deserialize into the generic `WorkflowDto<T>` interface rather than 5 disjoint configurations.
