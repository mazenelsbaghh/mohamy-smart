# Data Model: Phase 0 — Stabilize & Patch

**Branch**: `044-stabilize-patch`
**Date**: 2026-04-14

> **No schema changes in this phase.** This document describes the existing entities
> relevant to the stabilization work for reference purposes only.

---

## Existing Entities (Reference Only)

### Case

The central domain entity that ties a lawyer to their legal work.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| Id | Guid | PK | Auto-generated |
| LawyerId | int | FK → Lawyer.Id, NOT NULL | **Ownership field** — used by `ICaseAccessValidator` to verify lawyer access |
| CaseType | relation | FK → CaseType | Eager-loaded in workflow step execution |
| CreatedAt | DateTime | NOT NULL | |

**Relevance**: `CaseAccessValidator.ValidateAsync()` checks `caseEntity.LawyerId != lawyer.Id` to enforce ownership.

---

### WorkflowBase (Abstract)

Base class for all 7 workflow entities. Step outputs are stored as JSON strings.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| Id | int | PK, auto-increment | |
| CaseId | Guid | FK → Case.Id, NOT NULL | |
| LawyerId | string | NOT NULL | ApplicationUserId (Guid as string) |
| Status | WorkflowStatus (enum) | NOT NULL | InProgress, Completed, Abandoned |
| CurrentStep | int | NOT NULL, default 1 | |
| Step1Output…Step6Output | string? | nullable | JSON step results |
| CreatedAt | DateTime | NOT NULL | |
| UpdatedAt | DateTime | NOT NULL | |

**Access pattern**: `SetStepOutput(int, string?)` / `GetStepOutput(int)` — direct field assignment forbidden by constitution.

---

### Concrete Workflows (inherit WorkflowBase)

| Entity | Table | Steps | Service |
|--------|-------|-------|---------|
| AppealWorkflow | AppealWorkflows | 6 | AppealBriefService ✅ |
| AdminComplaintWorkflow | AdminComplaintWorkflows | 5 | AdminComplaintService ✅ |
| LegalWarningWorkflow | LegalWarningWorkflows | 3 | LegalWarningService ✅ |
| ExecRequestWorkflow | ExecRequestWorkflows | 3 | ExecRequestService |
| RulingAnalysisWorkflow | RulingAnalysisWorkflows | 4 | RulingAnalysisService |

✅ = Already on WorkflowServiceBase

---

### State Transitions

```
WorkflowStatus:
  InProgress ──[complete last step]──→ Completed
  InProgress ──[abandon]──→ Abandoned
  Completed ──[re-run earlier step]──→ InProgress (clears subsequent steps)
```

No schema changes, no migrations, no new entities in this phase.
