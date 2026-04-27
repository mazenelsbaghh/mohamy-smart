# Quickstart: Phase 1: Shared Backend Utilities

**Branch**: `031-shared-backend-utilities`
**Related Spec**: [spec.md](./spec.md)

## Integration Guide

Once `AnalysisHelpers` is implemented, you can leverage it in any new LLM integration service.

### 1. Building AI Prompt Context

```csharp
// Example in a workflow service
string promptContext = AnalysisHelpers.BuildCaseContext(caseEntity);
```

### 2. Extracting & Cleaning JSON from AI Responses

```csharp
// AI outputs may be wrapped in Markdown. Ensure plain JSON string wrapper removal:
string cleanJson = AnalysisHelpers.CleanJsonResponse(rawAiResponse);

// If parsing specific JSON output directly from nested AI responses (like admin complaints):
string payload = AnalysisHelpers.TryExtractJsonPayload(cleanJson);
```

### 3. Quick Validation & Deserialization

```csharp
if (AnalysisHelpers.IsValidJson(cleanJson))
{
    var outputObject = AnalysisHelpers.DeserializeOutput(cleanJson);
}
```

These utilities guarantee unified AI data extraction logic instead of having to redefine markdown parsing arrays per service.
