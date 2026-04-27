# Phase 0: Outline & Research

## Known Context & Decisions

The technical environment requires no novel technology research, as this phase functions as a convergence vector for 3 independent legacy architectures merging into a monolithic `WorkflowServiceBase` pattern established in prior iterations.

### Decision 1: Centralized Schema Validation
- **Decision**: Extend `StepOutputSchemas.cs` rather than implementing validation directly in discrete step execution methods.
- **Rationale**: `WorkflowServiceBase` relies on deserializing strongly-typed `WorkflowDto<TStepOutput>`. A central JSON schema registry guarantees that before parsing the DTO, the system can statically verify fields in real-time.
- **Alternatives considered**: Keeping `snake_case` properties or relying solely on `System.Text.Json` exception handling. Rejected because schema checks prevent silent field swallowing and offer specific debugging errors (e.g., "Missing field X").

### Decision 2: External Prompts for Stages 1, 2, and 3
- **Decision**: Extract inline string literals from `SmartAnalysisService`, `PreparingStatementOfClaimsService`, and `AppealBriefService` to `wwwroot/prompts/`.
- **Rationale**: Currently, Phase 4-7 already load from static text files. Aligning all 7 stages allows an operations or domain expert to iterate on prompt structures via Git configuration, rather than needing developer C# re-compilation.
- **Alternatives considered**: Storing prompts in SQL Server 2022. Rejected because prompt structures are fundamentally coupled to the JSON schema output bindings hardcoded in the codebase backend. Version control via `.txt` is superior.

### Decision 3: Error Response Canonicalization
- **Decision**: Standardize all endpoints to `return Result<T>.Error(ErrorType.BadRequest, message)` mapped locally instead of controller-level `BadRequest(new {message})`.
- **Rationale**: The frontend `useAiJobSignalR` and Redux Thunk chains depend on uniform HTTP 4xx bodies. Mixing result patterns broke the Toast error presentation layer.
- **Alternatives considered**: Writing custom ASP.NET Core exception filter middlewares. Rejected because workflow orchestration (e.g. failing step #2 out of 5) needs graceful business logic halting, not global exception traps.
