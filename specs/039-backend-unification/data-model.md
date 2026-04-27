# Data Model & Components

**Feature:** Phase 1: Backend Unification

## Centralized Infrastructure Components (C#)

### `AnalysisHelpers` (Application Layer)
A static or decoupled service containing parsing and common utilities.
* **Responsibilities**:
  * `CleanJsonResponse(string rawResponse) -> string`
  * `BuildCaseContext(...) -> string`
  * `BuildPreviousStepsContext(...) -> string`
  * `DeserializeOutput<T>(string rawData) -> T`

### `WorkflowServiceBase` (Application Layer)
Abstract foundation class for all analytical steps (SmartAnalysis, ExecRequest, RulingAnalysis, etc.).
* **State/Dependencies**:
  * `IUnitOfWork` (Database interaction)
  * `ICaseAccessValidator` (Security ownership checks)
  * `ILogger`
  * `AiModelConfigService`
* **Common Logic**:
  * Step validation against `StepOutputSchemas`.
  * Common error handling logic ensuring `Result<T>.Error` wrappers.
  * Standard logic for executing steps, updating definitions, and persisting step states conditionally handling concurrent requests.

### `WorkflowBase` (Core Layer)
A base model for domain workflow database entities.
* **Fields**:
  * `Id` (GUID)
  * `CaseId` (int)
  * `CurrentStep` (int)
  * `WorkflowType` (enum/string)
  * `Status` (enum)

### `PipelineRegistry` (Application Layer)
A stateless registry determining workflow mapping dynamically.
* **Responsibilities**:
  * Resolving specific concrete analytical service implementations based on `WorkflowType` enum bounds mapped by background workers.

## DTO Models

### `WorkflowDto<TStepOutput>`
Generic serialization representation for API transmission to eliminate redundant `...WorkflowDto` classes.
* **Fields**:
  * `CaseId` (int)
  * `CurrentStep` (int)
  * `Outputs` (Dictionary<int, TStepOutput>)
  * `Status` (string)
  * `ExecuteTitleType` (Optional property for ExecRequest implementations)
