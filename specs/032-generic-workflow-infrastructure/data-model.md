# Data Model: Generic Workflow Infrastructure

## Entities

### `WorkflowBase` (Abstract Entity)
**Location**: `Lawyer.Core/Models/WorkflowBase.cs`
**Purpose**: Represents the foundational data struct for any multi-step AI process.
**Fields**:
- `Id` (int, Primary Key)
- `CaseId` (Guid, Foreign Key to Case)
- `Case` (Navigation Property)
- `LawyerId` (string, the owner executing the workflow)
- `CurrentStep` (int, defaults to 1)
- `Status` (WorkflowStatus Enum: InProgress, Completed, Abandoned)
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime)

**Abstract Methods to be implemented by derived entities**:
- `TotalSteps` (int property)
- `GetStepOutput(int stepNumber)` (string?)
- `SetStepOutput(int stepNumber, string? json)` (void)

### Derived Workflow Entities (Existing, but re-mapped to inherit `WorkflowBase`)
- `RulingAnalysisWorkflow`
- `LegalWarningWorkflow`
- `PreparingStatementOfClaimsWorkflow`
- `AdminComplaintWorkflow`
- `ExecRequestWorkflow`

All these tables remain their respective SQL-server backed schemas but in code they derive from the above class.

## Services & Abstractions

### `WorkflowServiceBase<TWorkflow, TDto>` (Abstract Service)
**Location**: `Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs`
**Purpose**: Centralizes the logic for Start, Resume, and Step-execution over any pipeline.

### `WorkflowInvocationContext` (Data Transfer Class)
**Purpose**: Carries contextual workflow resolution results from the background job processor back to the caller.
**Fields**:
- `WorkflowId` (int)
- `LawyerId` (string)
