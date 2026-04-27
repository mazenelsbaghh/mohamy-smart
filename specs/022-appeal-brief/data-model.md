# Data Model: Appeal Brief Preparation

**Feature**: 022-appeal-brief  
**Date**: 2026-04-10

## New Entities

### AppealWorkflow

Represents a lawyer's 6-step appeal brief workflow for a specific case.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Surrogate primary key |
| CaseId | `int` | FK → Cases.Id, NOT NULL | The case this appeal brief is for |
| LawyerId | `string` | NOT NULL, max 450 chars | The lawyer who initiated this workflow |
| CurrentStep | `int` | NOT NULL, default 1 | Active step (1–6) |
| Status | `WorkflowStatus` | NOT NULL, default InProgress | InProgress / Completed / Abandoned |
| Step1Output | `string?` | NVARCHAR(MAX), nullable | JSON: JudgmentData extraction result |
| Step2Output | `string?` | NVARCHAR(MAX), nullable | JSON: ReasoningAnalysis result |
| Step3Output | `string?` | NVARCHAR(MAX), nullable | JSON: AppealGrounds result |
| Step4Output | `string?` | NVARCHAR(MAX), nullable | JSON: AppealRequests result |
| Step5Output | `string?` | NVARCHAR(MAX), nullable | JSON: LegalBasis result |
| Step6Output | `string?` | NVARCHAR(MAX), nullable | JSON: FinalBrief assembled document |
| CreatedAt | `DateTime` | NOT NULL | Workflow creation timestamp |
| UpdatedAt | `DateTime` | NOT NULL | Last update timestamp |

#### Relationships
- `CaseId` → `Cases.Id` (many-to-one; one case can have multiple workflows over time but only one active at once — enforced at application layer)

#### Validation Rules
- `CurrentStep` must be between 1 and 6.
- `Status` transitions: InProgress → Completed (when Step6Output is set) or InProgress → Abandoned (lawyer explicitly abandons).
- When a step is re-run (lawyer edits input), all subsequent `StepNOutput` columns are set to null and `CurrentStep` is reset to that step number.

#### State Transitions

```
InProgress (CurrentStep 1–6)
  → CurrentStep advances: lawyer runs next step
  → CurrentStep resets: lawyer edits a prior step (clears downstream outputs)
  → Completed: Step6Output is set successfully
  → Abandoned: lawyer explicitly abandons
```

## Enum Changes

### AiStepType (existing, extended)

```text
Existing values:
  FactAnalysis = 1 ... Chat = 30

New values (Appeal Brief):
  AppealBriefJudgmentData      = 40
  AppealBriefReasoningAnalysis = 41
  AppealBriefGrounds           = 42
  AppealBriefRequests          = 43
  AppealBriefLegalBasis        = 44
  AppealBriefAssembly          = 45
```

### WorkflowStatus (new shared enum)

```text
InProgress = 0
Completed  = 1
Abandoned  = 2
```

> Note: `WorkflowStatus` is shared across all workflow entities (022–026). Define once in `Lawyer.Core/Enums/WorkflowStatus.cs`.

## Step Output JSON Schemas

### Step1Output — JudgmentData

```json
{
  "caseNumber": "string",
  "judgmentDate": "string",
  "courtName": "string",
  "parties": {
    "plaintiff": "string",
    "defendant": "string"
  },
  "pronouncement": "string",
  "judgmentType": "string (جنائي / مدني / مختلط)",
  "missingFields": ["string"]
}
```

### Step2Output — ReasoningAnalysis

```json
{
  "reasoningSummary": "string",
  "evidenceList": ["string"],
  "responseToDefense": "string",
  "criminalAspect": "string | null",
  "civilAspect": "string | null"
}
```

### Step3Output — AppealGrounds

```json
{
  "isSufficient": false,
  "defectType": "string",
  "diagnosticChain": "string (A → B → C → D format)"
}
```

### Step4Output — AppealRequests

```json
{
  "proceduralRequests": ["string"],
  "substantiveRequests": ["string"],
  "urgentRequests": ["string"]
}
```

### Step5Output — LegalBasis

```json
{
  "articles": [
    {
      "lawName": "string",
      "articleNumber": "string",
      "articleText": "string"
    }
  ],
  "cassationPrinciples": [
    {
      "caseNumber": "string",
      "year": "string",
      "date": "string",
      "principleText": "string",
      "applicationNotes": "string"
    }
  ]
}
```

### Step6Output — FinalBrief

```json
{
  "documentText": "string (complete assembled Arabic document)"
}
```

## EF Core Configuration

```text
Entity: AppealWorkflow
Table: AppealWorkflows
  - PK: Id (int, identity)
  - FK: CaseId → Cases(Id)
  - Column: LawyerId (nvarchar(450), NOT NULL)
  - Column: CurrentStep (int, NOT NULL, default 1)
  - Column: Status (int, NOT NULL, default 0)
  - Column: Step1Output (nvarchar(max), nullable)
  - Column: Step2Output (nvarchar(max), nullable)
  - Column: Step3Output (nvarchar(max), nullable)
  - Column: Step4Output (nvarchar(max), nullable)
  - Column: Step5Output (nvarchar(max), nullable)
  - Column: Step6Output (nvarchar(max), nullable)
  - Column: CreatedAt (datetime2, NOT NULL)
  - Column: UpdatedAt (datetime2, NOT NULL)
```

## AiStageModelConfig Seed (New Rows)

Migration seeds 6 new rows with default model `gemini-3-pro-preview`:

| StepType | ModelIdentifier |
|----------|----------------|
| 40 (AppealBriefJudgmentData) | gemini-3-pro-preview |
| 41 (AppealBriefReasoningAnalysis) | gemini-3-pro-preview |
| 42 (AppealBriefGrounds) | gemini-3-pro-preview |
| 43 (AppealBriefRequests) | gemini-3-pro-preview |
| 44 (AppealBriefLegalBasis) | gemini-3-pro-preview |
| 45 (AppealBriefAssembly) | gemini-3-pro-preview |

## Display Name Mapping (Admin Dashboard)

| Arabic Label | StepType | Category |
|-------------|----------|----------|
| استخراج بيانات الحكم | AppealBriefJudgmentData (40) | صحيفة الطعن |
| تحليل أسباب الحكم | AppealBriefReasoningAnalysis (41) | صحيفة الطعن |
| تحديد أوجه الطعن | AppealBriefGrounds (42) | صحيفة الطعن |
| صياغة الطلبات | AppealBriefRequests (43) | صحيفة الطعن |
| السند القانوني | AppealBriefLegalBasis (44) | صحيفة الطعن |
| تجميع الصحيفة النهائية | AppealBriefAssembly (45) | صحيفة الطعن |
