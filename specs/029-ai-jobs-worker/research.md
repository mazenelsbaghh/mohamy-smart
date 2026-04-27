# Phase 0: Research & Context

**Feature**: Implement AiJobWorker Cases

## Service Interfaces Signatures

### Context
To support `AiJobWorker.cs`, we must identify the exact method signatures and expected payloads (`InputJson` serialization structures) for the target `IServices`.

**Finding Interfaces**:
The existing interfaces match the respective domains:
- `IAdminComplaintService`
- `ILegalWarningService`
- `IRulingAnalysisService`
- `IExecRequestService`

**Finding Input DTOs**:
By checking the backend code, the expected Request DTOs usually exist in `/Lawyer.Application/Dtos/AdminComplaint/`, `/Lawyer.Application/Dtos/LegalWarning/`, `/Lawyer.Application/Dtos/RulingAnalysis/`, and `/Lawyer.Application/Dtos/ExecRequest/`. All expected JSON payloads match exactly what the frontend dispatches to the `thunkSubmitAiJob`.

### Implementation Decision
**Decision**: Inject `IAdminComplaintService`, `ILegalWarningService`, `IRulingAnalysisService`, `IExecRequestService` into the constructor of `AiJobWorker.cs` and wire the corresponding methods.
**Rationale**: Clean Architecture explicitly enables using Application integration interfaces without duplicating service or infrastructure logic.
**Alternatives considered**: Extracting AI Jobs entirely from their respective domains (rejected - violates Clean Architecture separation of core domain responsibilities).
