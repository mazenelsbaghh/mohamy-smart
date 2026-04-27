# Project Phase 0: Research

**Feature:** Phase 1: Backend Unification

## Unknowns Resolution

No critical unknowns were marked with `NEEDS CLARIFICATION` in the context, but several architectural decisions are fundamental to the unification plan.

## Research & Architectural Decisions

### 1. Serialization Library Decision
* **Decision**: Adopt strictly `System.Text.Json` relying on global camel case policies.
* **Rationale**: Resolves `CRIT-03`. Legacy integrations used `Newtonsoft.Json`, introducing conflicts in serialization behaviors and causing field mapping errors on the React frontends due to `SnakeCase` outputs. `System.Text.Json` has better performance characteristics natively optimized for .NET 9.
* **Alternatives considered**: Configuring Newtonsoft to use camelCase, but maintaining two parsing libraries in the project creates technical debt.

### 2. Workflow Orchestration Strategy
* **Decision**: Implement `WorkflowServiceBase` as an abstract class inheriting standard capabilities, leveraging EF Core's `IUnitOfWork`.
* **Rationale**: Replaces duplicated pipeline step management across 5 stages (`CRIT-05`, `CRIT-06`, `CRIT-07`). Ensures a consistent state machine behavior.
* **Alternatives considered**: Using composition via a stateless orchestration engine, but the inheritance pattern mapped cleanly to the existing controller expectations.

### 3. Dynamic Job Execution
* **Decision**: Replace distinct hardcoded background worker execution switch cases with a dynamically registered `PipelineRegistry`.
* **Rationale**: Removes tightly coupled steps logic from the background worker. The worker simply resolves the requested workflow service interface dynamically.

### 4. Common Data Parsing
* **Decision**: Centralize all data enrichment (like `BuildCaseContext`, `CleanJsonResponse`) into `AnalysisHelpers`.
* **Rationale**: Fixes rampant code duplication across services processing raw AI string responses.

### 5. Access Security
* **Decision**: Standardize `ICaseAccessValidator` across all stages.
* **Rationale**: Secures the system effectively by abstracting DB validations into a unified policy mechanism.
