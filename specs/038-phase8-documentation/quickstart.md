# Quickstart: Adding a New AI Pipeline

This guide explains how to add a completely new AI Pipeline using the centralized configuration registry introduced in Phase 8.

## 1. Register the Pipeline

Open `Lawyer.Application/Services/Workflows/PipelineRegistry.cs`.
Add your new pipeline to the registry array:

```csharp
new PipelineDefinition 
{ 
    Id = "new-pipeline-type", 
    Name = "اسم المرحلة الجديدة", 
    TotalSteps = 4 
}
```

## 2. Update Documentation

Open `wwwroot/prompts/mapping.txt` and document the new pipeline prompt-to-step relationship.

```text
Phase N: new-pipeline-type
Step 1 -> prompts/new-pipeline/step1.txt
Step 2 -> prompts/new-pipeline/step2.txt
```

## 3. Define the Workflow Service

Create the service by extending `WorkflowServiceBase` in application layer:

```csharp
public class NewPipelineService : WorkflowServiceBase<NewPipelineWorkflow, NewPipelineDto>
{
    // Configure pipeline hooks
    protected override int TotalSteps => 4;
    protected override string GetPromptFolderName() => "new-pipeline";
    // ...
}
```

By adding the item to `PipelineRegistry`, the `AiModelConfigService` automatically maps the stage definitions, so the frontend UI and Admin dashboard will dynamically receive the configuration without further backend modifications.
