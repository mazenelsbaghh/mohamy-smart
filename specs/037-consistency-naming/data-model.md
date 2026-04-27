# Data Model & Business Logic: Consistency & Naming Fixes

## 1. Entities & Types

### 1.1 `CaseAccessValidator` (Application Service Entity)
Acts as a security facade unifying case ownership verification.

**Interface Location**: `Lawyer.Application/IServices/ICaseAccessValidator.cs`
**Implementation Location**: `Lawyer.Application/Services/CaseAccessValidator.cs`

**Core Mechanism:**
- Queries `IUnitOfWork.Repository<Case>()`.
- Asserts that `Case.LawyerId` matches the authenticated `lawyerId`.
- Caches the check transiently if applicable, eliminating redundant lookup overhead.

### 1.2 Unified Workflow Base (Existing Entity Refined)
Workflow states are maintained by the database. The state string/enum values apply universally across pipelines.

- **Status Transition Supported**: `InProgress` → `Abandoned`

## 2. Validation & Flow Logic

**Consistent Authorization Pipeline:**
1. Action invoked on Controller (e.g., `StartWorkflowAsync`, `RunStepAsync`).
2. Controller delegates directly to specific Service (e.g., `RulingAnalysisService`).
3. Service calls `await _caseAccessValidator.ValidateAsync(caseId, lawyerId, ct)`.
4. If invalid, the unified error mechanism immediately returns `_result.Forbidden<T>()`.
5. If valid, the domain process resumes executing.

**Error Mapping Flow:**
- Expected errors (Validation/Forbidden/NotFound) → Returned structurally via `Result<T>`.
- Unexpected Exceptions → Caught via native global/logger handlers and wrapped into `_result.ServerError<T>()`.
