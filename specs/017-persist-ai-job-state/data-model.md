# Data Model: Persistent AI Job State

**Phase**: 1 — Design  
**Date**: 2026-04-08  
**Branch**: `017-persist-ai-job-state`

---

## New Entities

### AiJob (Lawyer.Core/Entities/AiJob.cs)

Represents one background AI processing task associated with a case and a specific workflow step.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `Id` | `Guid` | No | Primary key, generated on creation |
| `CaseId` | `int` | No | FK → `Cases.Id` |
| `StepType` | `AiStepType` (enum) | No | Identifies which AI operation this job performs |
| `Status` | `AiJobStatus` (enum) | No | Current lifecycle state of the job |
| `HangfireJobId` | `string` | Yes | Hangfire's internal job ID; null until enqueued |
| `ResultJson` | `string` | Yes | Serialized JSON of the AI response payload; null until completed |
| `ErrorMessage` | `string` | Yes | Human-readable error; null unless status = Failed |
| `CreatedAt` | `DateTime` | No | UTC timestamp when the job record was created |
| `StartedAt` | `DateTime` | Yes | UTC timestamp when Hangfire picked up the job |
| `CompletedAt` | `DateTime` | Yes | UTC timestamp when the job reached Completed or Failed |

**Unique constraint**: `(CaseId, StepType)` for non-terminal statuses — enforced at service layer + DB index.  
**Relationships**: Many `AiJob` → one `Case` (existing entity).

---

### AiJobStatus (Lawyer.Core/Enums/AiJobStatus.cs)

```
Queued      = 0   // Job record created, Hangfire job enqueued
Processing  = 1   // Hangfire worker has picked up the job
Completed   = 2   // AI call succeeded, ResultJson populated
Failed      = 3   // All retry attempts exhausted, ErrorMessage populated
```

**State transitions**:
```
[none] → Queued → Processing → Completed
                             → Failed (after max retries)
Failed → Queued              (user retry: creates a new job record)
```

---

### AiStepType (Lawyer.Core/Enums/AiStepType.cs)

```
// Smart Analysis workflow
FactAnalysis        = 1
GenerateDefenses    = 2
AnalysisDefense     = 3
FinalRequirements   = 4

// Preparing Statement of Claims workflow
LawsuitCaseType     = 10
LawsuitParties      = 11
LawsuitSubjects     = 12
LawsuitFacts        = 13
LawsuitLegalBasis   = 14
LawsuitRequests     = 15

// Document processing
Ocr                 = 20
```

*Values are spaced to allow future insertions without re-numbering.*

---

## Modified Entities

### Case (existing — Lawyer.Core/Entities/Case.cs)

Add navigation property (no schema change required if using shadow FK):

```csharp
public ICollection<AiJob> AiJobs { get; set; } = new List<AiJob>();
```

---

## Database Schema Changes

### New table: `AiJobs`

```sql
CREATE TABLE AiJobs (
    Id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    CaseId         INT              NOT NULL REFERENCES Cases(Id) ON DELETE CASCADE,
    StepType       INT              NOT NULL,
    Status         INT              NOT NULL DEFAULT 0,
    HangfireJobId  NVARCHAR(100)    NULL,
    ResultJson     NVARCHAR(MAX)    NULL,
    ErrorMessage   NVARCHAR(2000)   NULL,
    CreatedAt      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    StartedAt      DATETIME2        NULL,
    CompletedAt    DATETIME2        NULL
);

-- Prevents two active jobs for the same case+step
CREATE UNIQUE INDEX UX_AiJobs_CaseId_StepType_Active
    ON AiJobs (CaseId, StepType)
    WHERE Status IN (0, 1);  -- Queued or Processing
```

### Hangfire schema

Hangfire creates its own schema (`HangFire`) automatically on first startup via `SqlServerStorage`. No manual migration needed for Hangfire's own tables.

---

## DTOs (Lawyer.Application/Dtos/AiJobs/)

### AiJobStatusDto

```csharp
public record AiJobStatusDto(
    Guid        Id,
    int         CaseId,
    AiStepType  StepType,
    AiJobStatus Status,
    string?     ResultJson,
    string?     ErrorMessage,
    DateTime    CreatedAt,
    DateTime?   CompletedAt
);
```

### SubmitAiJobDto

```csharp
public record SubmitAiJobDto(
    int        CaseId,
    AiStepType StepType,
    string?    InputJson   // Step-specific input payload (e.g., facts text for FactAnalysis)
);
```

---

## Frontend Type Additions (TypeScript)

```typescript
// src/redux/aiJobs/aiJobsSlice.ts

type AiJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

type AiStepType =
    | 'FactAnalysis' | 'GenerateDefenses' | 'AnalysisDefense' | 'FinalRequirements'
    | 'LawsuitCaseType' | 'LawsuitParties' | 'LawsuitSubjects'
    | 'LawsuitFacts' | 'LawsuitLegalBasis' | 'LawsuitRequests'
    | 'Ocr';

type AiJob = {
    id: string;
    caseId: number;
    stepType: AiStepType;
    status: AiJobStatus;
    resultJson: string | null;
    errorMessage: string | null;
    createdAt: string;
    completedAt: string | null;
};

type TAiJobsState = {
    jobs: Record<AiStepType, AiJob | null>;  // keyed by step type for fast lookup
    loading: TLoading;
    error: string | null;
};
```
