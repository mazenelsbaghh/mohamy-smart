# Research: Generic Workflow Infrastructure

## Technical Stack Decisions

### Decision: C# 13 / .NET 9 Web API
**Rationale**: Required by project constitution (Tech Stack Constraints).
**Alternatives considered**: N/A - constitution mandate.

### Decision: System.Text.Json for serialization
**Rationale**: Native out-of-the-box support in .NET. It's performant and avoids external dependencies like Newtonsoft.Json which the project aims to minimize for this workflow processing tier.
**Alternatives considered**: Newtonsoft.Json (deprecated / removed for analysis endpoints to reduce redundancy and unify the parser stack).

### Decision: Clean Architecture Enforcement
**Rationale**: `WorkflowBase` must go in `Lawyer.Core` (domain entity), and `WorkflowServiceBase` in `Lawyer.Application` (business logic) per Constitution Principle IV.
**Alternatives considered**: N/A - constitution mandate.

### Decision: Generic EF Core Repositories / DbContext
**Rationale**: Allows the worker `AiJobWorker` to generically fetch `DbSet<TWorkflow>` and resolve workflow cases dynamically based on the requested AI job pipeline.
**Alternatives considered**: Hardcoded repository switches (which bloats code and violates the feature goal of reducing duplicated infra code).
