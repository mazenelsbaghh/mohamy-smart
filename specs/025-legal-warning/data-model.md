# Data Model: Official Legal Warning / Judicial Notice

**Feature**: 025-legal-warning  
**Date**: 2026-04-10

## New Entities

### LegalWarningWorkflow

Represents a lawyer's 3-step official legal warning workflow for a specific case.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Surrogate primary key |
| CaseId | `int` | FK → Cases.Id, NOT NULL | The case this warning is for |
| LawyerId | `string` | NOT NULL, max 450 chars | The lawyer who initiated this workflow |
| CurrentStep | `int` | NOT NULL, default 1 | Active step (1–3) |
| Status | `WorkflowStatus` | NOT NULL, default InProgress | InProgress / Completed / Abandoned |
| Step1Output | `string?` | NVARCHAR(MAX), nullable | JSON: WarningClassification result |
| Step2Output | `string?` | NVARCHAR(MAX), nullable | JSON: WarningBody result |
| Step3Output | `string?` | NVARCHAR(MAX), nullable | JSON: FinalWarningDocument |
| CreatedAt | `DateTime` | NOT NULL | Workflow creation timestamp |
| UpdatedAt | `DateTime` | NOT NULL | Last update timestamp |

#### Validation Rules
- `CurrentStep` must be between 1 and 3.
- Same re-run / downstream clear logic as other workflows.

## Enum Changes

### AiStepType (existing, extended)

```text
New values (Legal Warning):
  LegalWarningClassification = 70
  LegalWarningBodyDraft      = 71
  LegalWarningAssembly       = 72
```

## Step Output JSON Schemas

### Step1Output — WarningClassification

```json
{
  "warningType": "string (تكليف بالوفاء / عذر قضائي / إنذار رسمي / ...)",
  "triggersLegalDefault": true,
  "legalDefaultJustification": "string",
  "legalSummary": {
    "relationshipNature": "string",
    "debtCause": "string",
    "writtenProof": "string | null",
    "amountCertainty": "string",
    "dueDate": "string",
    "legalEffectOfNonPayment": "string"
  },
  "factualGrounds": {
    "debtSource": "string",
    "deliveryFact": "string",
    "deadlineAgreement": "string",
    "refusalToPay": "string"
  },
  "missingElements": ["string"]
}
```

### Step2Output — WarningBody

```json
{
  "warningBodyText": "string (formal 5-element Arabic paragraph)"
}
```

### Step3Output — FinalWarningDocument

```json
{
  "documentText": "string (complete assembled official warning in Egyptian bailiff format)"
}
```

## EF Core Configuration

```text
Entity: LegalWarningWorkflow
Table: LegalWarningWorkflows
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
| 70 (LegalWarningClassification) | gemini-3-pro-preview |
| 71 (LegalWarningBodyDraft) | gemini-3-pro-preview |
| 72 (LegalWarningAssembly) | gemini-3-pro-preview |

## Display Name Mapping (Admin Dashboard)

| Arabic Label | StepType | Category |
|-------------|----------|----------|
| تصنيف الإنذار والتحليل القانوني | LegalWarningClassification (70) | الإنذار الرسمي |
| صياغة متن الإنذار | LegalWarningBodyDraft (71) | الإنذار الرسمي |
| تجميع الإنذار النهائي | LegalWarningAssembly (72) | الإنذار الرسمي |
