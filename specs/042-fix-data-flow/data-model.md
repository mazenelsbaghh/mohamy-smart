# Data Model: Fix AI Stages Data Flow

**Feature Branch**: `042-fix-data-flow`
**Created**: 2026-04-11

## Overview

This feature does **not** introduce new database entities or schema changes. It fixes the serialization/deserialization pipeline for existing AI job result data stored in the `ResultJson` column of the `AiJobs` table and the `Step{N}Output` columns of workflow tables.

## Affected Data Entities

### 1. AiJob (existing — no schema change)

| Column | Type | Relevance |
|--------|------|-----------|
| `ResultJson` | `nvarchar(max)` | Stores serialized AI step output. After fix, new entries will be camelCase. Legacy entries remain snake_case — handled by frontend normalizers. |

### 2. Workflow Tables (AppealBrief, AdminComplaint, LegalWarning, ExecRequest — no schema change)

| Column | Type | Relevance |
|--------|------|-----------|
| `Step1Output..Step6Output` | `nvarchar(max)` | Stores per-step JSON strings. After fix, new entries will be camelCase (serialized via SnakeCaseLower parse → CamelCase re-serial). Legacy entries may contain snake_case keys. |

## Data Flow Diagram (Post-Fix)

```
AI Provider Response (snake_case JSON string)
    │
    ▼
Backend Service Parse
    ├── Direct Service (SmartAnalysis, PrepStatement):
    │     JsonSerializer.Deserialize<DTO>(json, SnakeCaseOptions)
    │         → typed DTO (C# PascalCase properties)
    │
    └── Workflow Service (Appeal, Complaint, Warning, Exec, Ruling):
          StepOutputSchemas.ValidateAndParse<DTO>(json, SnakeCaseOptions)
              → typed DTO
    │
    ▼
AiJobWorker / WorkflowServiceBase
    JsonSerializer.Serialize(result.Data, GlobalCamelCase)
        → camelCase JSON string (no [JsonPropertyName] override)
    │
    ▼
Database (ResultJson / Step{N}Output)
    camelCase JSON string
    │
    ▼
Frontend
    ├── aiJob path:
    │     parseJobResult(resultJson) → deepCamelize (handles PascalCase + snake_case)
    │     Workflow steps: parseResult unwraps { output: "..." } wrapper
    │
    └── getWorkflow path:
          createWorkflowSlice: JSON.parse(step{N}Output)
              → stepHydrators normalize data
```

## Key Properties by Pipeline

### PreparingStatementOfClaims (6 steps)

| Step | Key Properties (camelCase) |
|------|--------------------------|
| 1 | `caseMainType`, `caseSubType`, `courtType`, `proceduralNature`, `isUrgentOrSummary`, `justificationSummary` |
| 2 | `parties[]` → `{ name, role, type, legalCapacity, address, nationalId }` |
| 3 | `subjectTitle`, `subjectFullText` |
| 4 | `factsNarrative` |
| 5 | `legalTexts[]` → `{ lawName, articleNumber, articleText, applicationNotes }`, `cassationRulings[]` → `{ court, appealNumber, judicialYear, sessionDate, rulingText, applicationNotes }` |
| 6 | `principalRequests[]`, `subsidiaryRequests[]`, `proceduralRequests[]` → `{ requestNumber, requestText, legalReference }` |

### AppealBrief (6 steps — ExtensionData-based)

All steps use `AppealBriefStepOutput` with `fullAppealText` + dynamic extension properties. After fix, extension keys will be camelCase.

### RulingAnalysis (4 steps)

| Step | Key Properties (camelCase) |
|------|--------------------------|
| 1 | `verdictSummary`, `charges[]`, `verdictPoints[]` |
| 2 | `reasoningSummary`, `evidenceEvaluation[]`, `legalTextsApplied[]` |
| 3 | `defectsIdentified[]`, `proceduralErrors[]` |
| 4 | `appealProbability`, `recommendation`, `nextSteps[]` |
