# Quickstart: Generic Workflow Infrastructure

## Why we built this

Previously, creating a new AI pipeline involved copy-pasting over 400 lines of `AiJobWorker` polling code, state hydration, JSON payload loading, and repository resolving. The Generic Workflow Infrastructure collapses all generic multi-step "Wizard-style" AI flows into a unified `WorkflowServiceBase`.

## Adding a New Analysis Pipeline

Follow these 3 steps to implement a new AI feature:

### 1. Create the Database Entity

Make your workflow inherit `WorkflowBase` in `Lawyer.Core/Models/MyNewAnalysisWorkflow.cs`:

```csharp
public class MyNewAnalysisWorkflow : WorkflowBase
{
    // Custom storage per step
    public string? Step1RawJson { get; set; }
    public string? Step2RawJson { get; set; }

    public override int TotalSteps => 2;

    public override string? GetStepOutput(int stepNumber) => stepNumber switch 
    {
        1 => Step1RawJson,
        2 => Step2RawJson,
        _ => null
    };

    public override void SetStepOutput(int stepNumber, string? json)
    {
        switch (stepNumber)
        {
            case 1: Step1RawJson = json; break;
            case 2: Step2RawJson = json; break;
        }
    }
}
```

### 2. Create the Pipeline Service

Inherit `WorkflowServiceBase` in `Lawyer.Application/Services/MyNewAnalysisService.cs`:

```csharp
public class MyNewAnalysisService : WorkflowServiceBase<MyNewAnalysisWorkflow, MyNewAnalysisDto>, IMyNewAnalysisService
{
    // Provide your dependencies
    // Override configurations:
    protected override string GetPromptFolderName() => "My New Feature Prompts Folder";
    protected override string GetStepFileName(int stepNumber) => stepNumber == 1 ? "step1.txt" : "step2.txt";
    protected override AiStepType GetStepType(int stepNumber) => AiStepType.CustomFeature;
}
```

### 3. Register and Run!

You no longer need standalone extraction or prompt-resolution code. The core logic will automatically:
1. Load cases.
2. Resume workflows.
3. Hook into standard DTO payloads mapping and validation!
