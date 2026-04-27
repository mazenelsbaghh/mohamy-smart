# Data Model: Administrative Complaints & Grievances

**Feature**: 023-admin-complaints  
**Date**: 2026-04-10

## New Entities

### AdminComplaintWorkflow

Represents a lawyer's 5-step administrative complaint workflow for a specific case.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Surrogate primary key |
| CaseId | `int` | FK → Cases.Id, NOT NULL | The case this complaint is for |
| LawyerId | `string` | NOT NULL, max 450 chars | The lawyer who initiated this workflow |
| CurrentStep | `int` | NOT NULL, default 1 | Active step (1–5) |
| Status | `WorkflowStatus` | NOT NULL, default InProgress | InProgress / Completed / Abandoned |
| Step1Output | `string?` | NVARCHAR(MAX), nullable | JSON: ComplaintClassification result |
| Step2Output | `string?` | NVARCHAR(MAX), nullable | JSON: FactsNarrative result |
| Step3Output | `string?` | NVARCHAR(MAX), nullable | JSON: ViolationAnalysis result |
| Step4Output | `string?` | NVARCHAR(MAX), nullable | JSON: ComplaintRequests result |
| Step5Output | `string?` | NVARCHAR(MAX), nullable | JSON: FinalComplaint assembled document |
| CreatedAt | `DateTime` | NOT NULL | Workflow creation timestamp |
| UpdatedAt | `DateTime` | NOT NULL | Last update timestamp |

#### Validation Rules
- `CurrentStep` must be between 1 and 5.
- Same step re-run / downstream clear logic as AppealWorkflow.

## Enum Changes

### AiStepType (existing, extended)

```text
New values (Admin Complaint):
  AdminComplaintClassification = 50
  AdminComplaintFacts          = 51
  AdminComplaintViolation      = 52
  AdminComplaintRequests       = 53
  AdminComplaintAssembly       = 54
```

## Step Output JSON Schemas

### Step1Output — ComplaintClassification

```json
{
  "actionType": "string (شكوى / تظلم / بلاغ)",
  "competentAuthorities": [
    {
      "authorityName": "string",
      "authorityLevel": "string",
      "targetOfficialTitle": "string",
      "isPrimary": true
    }
  ],
  "classificationJustification": "string",
  "confidenceRating": "string (مرتفع / متوسط / منخفض)"
}
```

### Step2Output — FactsNarrative

```json
{
  "factsText": "string (formal Arabic paragraph starting with 'أولاً: الوقائع')"
}
```

### Step3Output — ViolationAnalysis

```json
{
  "violationType": "string",
  "violationDescription": "string",
  "governingRules": [
    {
      "sourceLaw": "string",
      "articleNumber": "string",
      "articleText": "string"
    }
  ]
}
```

### Step4Output — ComplaintRequests

```json
{
  "requestsText": "string (formal Arabic closing requests paragraph)"
}
```

### Step5Output — FinalComplaint

```json
{
  "documentText": "string (complete assembled Arabic complaint document)"
}
```

## EF Core Configuration

```text
Entity: AdminComplaintWorkflow
Table: AdminComplaintWorkflows
  - PK: Id (int, identity)
  - FK: CaseId → Cases(Id)
  - Column: LawyerId (nvarchar(450), NOT NULL)
  - Column: CurrentStep (int, NOT NULL, default 1)
  - Column: Status (int, NOT NULL, default 0)
  - Column: Step1Output–Step5Output (nvarchar(max), nullable each)
  - Column: CreatedAt, UpdatedAt (datetime2, NOT NULL)
```

## AiStageModelConfig Seed (New Rows)

| StepType | ModelIdentifier |
|----------|----------------|
| 50 (AdminComplaintClassification) | gemini-3-pro-preview |
| 51 (AdminComplaintFacts) | gemini-3-pro-preview |
| 52 (AdminComplaintViolation) | gemini-3-pro-preview |
| 53 (AdminComplaintRequests) | gemini-3-pro-preview |
| 54 (AdminComplaintAssembly) | gemini-3-pro-preview |

## Display Name Mapping (Admin Dashboard)

| Arabic Label | StepType | Category |
|-------------|----------|----------|
| تصنيف الشكوى وتحديد الجهة | AdminComplaintClassification (50) | الشكاوى الإدارية |
| صياغة الوقائع | AdminComplaintFacts (51) | الشكاوى الإدارية |
| تحليل المخالفة | AdminComplaintViolation (52) | الشكاوى الإدارية |
| صياغة الطلبات | AdminComplaintRequests (53) | الشكاوى الإدارية |
| تجميع الشكوى النهائية | AdminComplaintAssembly (54) | الشكاوى الإدارية |
