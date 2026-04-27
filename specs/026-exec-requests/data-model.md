# Data Model: Executive & Precautionary Requests

**Feature**: 026-exec-requests  
**Date**: 2026-04-10

## New Entities

### ExecRequestWorkflow

Represents a lawyer's 3-step executive/precautionary requests workflow for a specific case.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Surrogate primary key |
| CaseId | `int` | FK → Cases.Id, NOT NULL | The case this petition is for |
| LawyerId | `string` | NOT NULL, max 450 chars | The lawyer who initiated this workflow |
| CurrentStep | `int` | NOT NULL, default 1 | Active step (1–3) |
| Status | `WorkflowStatus` | NOT NULL, default InProgress | InProgress / Completed / Abandoned |
| Step1Output | `string?` | NVARCHAR(MAX), nullable | JSON: RequestClassification result |
| Step2Output | `string?` | NVARCHAR(MAX), nullable | JSON: DraftRequests result |
| Step3Output | `string?` | NVARCHAR(MAX), nullable | JSON: FinalPetitionTemplate |
| CreatedAt | `DateTime` | NOT NULL | Workflow creation timestamp |
| UpdatedAt | `DateTime` | NOT NULL | Last update timestamp |

#### Validation Rules
- `CurrentStep` must be between 1 and 3.
- Same re-run / downstream clear logic as other workflows.

## Enum Changes

### AiStepType (existing, extended)

```text
New values (Executive Requests):
  ExecRequestClassification = 80
  ExecRequestDrafting       = 81
  ExecRequestAssembly       = 82
```

## Step Output JSON Schemas

### Step1Output — RequestClassification

```json
{
  "requestNature": ["Executive", "Precautionary", "Service"],
  "detailedRequestType": "string",
  "legalBasis": {
    "type": "string (judicial / contractual / legal)",
    "description": "string"
  },
  "courtCompetency": {
    "courtName": "string",
    "proceduralStage": "string"
  },
  "serviceRequirements": {
    "isServiceRequired": true,
    "previousWarningDetails": "string | null"
  },
  "factsSummary": "string",
  "classificationStatement": "string"
}
```

### Step2Output — DraftRequests

```json
{
  "legalRequests": ["string"],
  "serviceRequests": ["string"],
  "executivePetitionDocuments": ["string"],
  "serviceRequestDocuments": ["string"]
}
```

### Step3Output — FinalPetitionTemplate

```json
{
  "documentText": "string (complete assembled petition in Egyptian judicial format)"
}
```

## EF Core Configuration

```text
Entity: ExecRequestWorkflow
Table: ExecRequestWorkflows
  - PK: Id (int, identity)
  - FK: CaseId → Cases(Id)
  - Column: LawyerId (nvarchar(450), NOT NULL)
  - Column: CurrentStep (int, NOT NULL, default 1)
  - Column: Status (int, NOT NULL, default 0)
  - Column: Step1Output, Step2Output, Step3Output (nvarchar(max), nullable each)
  - Column: CreatedAt, UpdatedAt (datetime2, NOT NULL)
```

## AiStageModelConfig Seed (New Rows)

| StepType | ModelIdentifier |
|----------|----------------|
| 80 (ExecRequestClassification) | gemini-3-pro-preview |
| 81 (ExecRequestDrafting) | gemini-3-pro-preview |
| 82 (ExecRequestAssembly) | gemini-3-pro-preview |

## Display Name Mapping (Admin Dashboard)

| Arabic Label | StepType | Category |
|-------------|----------|----------|
| تحليل وتصنيف طبيعة الطلب | ExecRequestClassification (80) | الطلبات التنفيذية |
| صياغة الطلبات | ExecRequestDrafting (81) | الطلبات التنفيذية |
| تجميع العريضة النهائية | ExecRequestAssembly (82) | الطلبات التنفيذية |
