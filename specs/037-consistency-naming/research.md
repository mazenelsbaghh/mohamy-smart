# Research & Decisions: Consistency & Naming Fixes

## Overview
This document formalizes the architectural decisions made prior to implementing the consistency fixes described in the Phase 7 refactoring plan. It resolves unknowns regarding prevailing system patterns that all workflow pipelines must conform to.

## Findings & Decisions

### 1. Data Access Dependency Injection Pattern
- **Decision:** All workflow analytical services MUST implement dependency injection strictly using `IUnitOfWork`.
- **Rationale:** `IUnitOfWork` is the prevailing architectural abstraction used in the `Lawyer.Application` layer (e.g., in `WorkflowServiceBase` and `AdminComplaintService`). It accurately encapsulates `DbContext` and repository instantiations within the Clean Architecture boundaries. Using raw `IApplicationDbContext` breaks this pattern and introduces inconsistent data-saving mechanisms.
- **Alternatives considered:** Injecting `IApplicationDbContext` directly, which was rejected due to structural drift from the standard `Repository` and unit of work implementations already heavily utilized.

### 2. HTTP Error Response Payload Schema
- **Decision:** All error responses occurring during workflow execution MUST utilize the `ApiExceptionResponse` wrapper, mapping to `_result.BadRequest<T>()`, `_result.Forbidden<T>()`, or the underlying `Result<T>.Error` wrapper.
- **Rationale:** The frontend exclusively expects standard JSON shapes matching `Result<T>` with `succeeded`, `data`, and `message` properties. Native HTTP exceptions or bespoke formatted errors will fail parsing layers instantiated in Redux reducers.
- **Alternatives considered:** Native .NET `ProblemDetails`. Rejected because changing the core API response schema mid-project would require cascading architectural updates to the entire `mohamy-smart-lawyer-dashboard` Axios interceptor suite.

### 3. Pipeline Security: Case Access Validation
- **Decision:** Create an `ICaseAccessValidator` unified layer injectable via the standard DI container (`IServiceCollection`).
- **Rationale:** Services independently perform duplicate evaluations (`if(caseEntity.LawyerId != lawyerId)`). An explicit service layer centralizes caching and simplifies unit testing of authorization rules contextually isolated from domain logic.
- **Alternatives considered:** Inheriting validation via a base abstract controller or creating an Action Filter. A centralized application service was preferred because workflow mechanics originate both from HTTP triggers and potentially distributed background processing where HTTP Action Filters are inapplicable.

### 4. Workflow Abandonment Endpoint Standard
- **Decision:** Workflow abandonment MUST be defined in `WorkflowServiceBase<TWorkflow, TDto>` and exposed universally by each specific derivative Controller.
- **Rationale:** All pipelines logically map to `WorkflowStatus.Abandoned`. Centralizing the state transition eliminates duplicate entity updates across differing controllers.
- **Alternatives considered:** Creating an independent entity-agnostic endpoint. Rejected due to strong typing requirements mapped in the DB (`AdminComplaintWorkflow` vs `RulingAnalysisWorkflow`).

### 5. Frontend Code Naming & Documentation Conventions
- **Decision:** The directory `appealBrief` is already correctly camelCased in the actual filesystem branch. New efforts will concentrate on documenting the data handoff mechanisms explicitly comparing `smartAnalysis` workflows to `defenseMemoPage`. 
- **Rationale:** Technical debt regarding understanding system boundaries increases exponentially without documentation mapping complex features. Document comments inside the component bodies resolve confusion for future implementers.
- **Alternatives considered:** Re-architecting components, which was rejected to preserve purely cosmetic boundaries described in the project tasks.
