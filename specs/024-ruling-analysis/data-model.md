# Data Model: Judicial Ruling Analysis

**Feature**: 024-ruling-analysis  
**Date**: 2026-04-10

## New Entities

### RulingAnalysisWorkflow

Represents a lawyer's 4-step ruling analysis workflow for a specific case.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Surrogate primary key |
| CaseId | `int` | FK → Cases.Id, NOT NULL | The case this analysis is for |
| LawyerId | `string` | NOT NULL, max 450 chars | The lawyer who initiated this workflow |
| CurrentStep | `int` | NOT NULL, default 1 | Active step (1–4) |
| Status | `WorkflowStatus` | NOT NULL, default InProgress | InProgress / Completed / Abandoned |
| Step1Output | `string?` | NVARCHAR(MAX), nullable | JSON: OperativeAnalysis result |
| Step2Output | `string?` | NVARCHAR(MAX), nullable | JSON: ReasoningAnalysis (neutral descriptive) |
| Step3Output | `string?` | NVARCHAR(MAX), nullable | JSON: DefectEvaluation result |
| Step4Output | `string?` | NVARCHAR(MAX), nullable | JSON: FeasibilityReport result |
| CreatedAt | `DateTime` | NOT NULL | Workflow creation timestamp |
| UpdatedAt | `DateTime` | NOT NULL | Last update timestamp |

#### Validation Rules
- `CurrentStep` must be between 1 and 4.
- Same re-run / downstream clear logic as other workflows.

## Enum Changes

### AiStepType (existing, extended)

```text
New values (Ruling Analysis):
  RulingAnalysisOperative         = 60
  RulingAnalysisReasoning         = 61
  RulingAnalysisDefectEvaluation  = 62
  RulingAnalysisFeasibilityReport = 63
```

## Step Output JSON Schemas

### Step1Output — OperativeAnalysis

```json
{
  "judgmentSummary": "string",
  "judgmentType": "string (إدانة / براءة / حفظ / ...)",
  "legalEffect": "string",
  "criminalAspect": "string | null",
  "civilAspect": "string | null"
}
```

### Step2Output — ReasoningAnalysis (Neutral Descriptive)

```json
{
  "reasoningSummary": "string (neutral descriptive only)",
  "evidenceList": ["string"],
  "responseToDefense": "string | null",
  "criminalAspectReasoning": "string | null",
  "civilAspectReasoning": "string | null"
}
```

### Step3Output — DefectEvaluation

```json
{
  "isSufficient": true,
  "defectType": "string | null",
  "diagnosticChain": "string | null (A → B → C → D)"
}
```

### Step4Output — FeasibilityReport

```json
{
  "isAppealable": true,
  "appealType": "string",
  "legalBasisForAppealability": "string (generic, no Article 406 citation)",
  "appealGrounds": ["string"],
  "appealScope": "string",
  "notes": "string | null"
}
```

## EF Core Configuration

```text
Entity: RulingAnalysisWorkflow
Table: RulingAnalysisWorkflows
  - PK: Id (int, identity)
  - FK: CaseId → Cases(Id)
  - Column: LawyerId (nvarchar(450), NOT NULL)
  - Column: CurrentStep (int, NOT NULL, default 1)
  - Column: Status (int, NOT NULL, default 0)
  - Column: Step1Output–Step4Output (nvarchar(max), nullable each)
  - Column: CreatedAt, UpdatedAt (datetime2, NOT NULL)
```

## AiStageModelConfig Seed (New Rows)

| StepType | ModelIdentifier |
|----------|----------------|
| 60 (RulingAnalysisOperative) | gemini-3-pro-preview |
| 61 (RulingAnalysisReasoning) | gemini-3-pro-preview |
| 62 (RulingAnalysisDefectEvaluation) | gemini-3-pro-preview |
| 63 (RulingAnalysisFeasibilityReport) | gemini-3-pro-preview |

## Display Name Mapping (Admin Dashboard)

| Arabic Label | StepType | Category |
|-------------|----------|----------|
| تحليل المنطوق | RulingAnalysisOperative (60) | تحليل الأحكام |
| تحليل الأسباب | RulingAnalysisReasoning (61) | تحليل الأحكام |
| تقييم العيوب | RulingAnalysisDefectEvaluation (62) | تحليل الأحكام |
| تقرير جدوى الطعن | RulingAnalysisFeasibilityReport (63) | تحليل الأحكام |
