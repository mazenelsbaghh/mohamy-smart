# Research: Phase 1: Shared Backend Utilities

**Branch**: `031-shared-backend-utilities`
**Related Spec**: [spec.md](./spec.md)

## Unknowns & Clarifications

There are no major unknowns or undefined technical constraints requiring extensive research for this feature. The specification maps exactly to an internal code optimization defined in `plan-analyzing.md`. 

## Technical Decisions

### JSON Parsing Library
- **Decision**: Standardize on `System.Text.Json`.
- **Rationale**: While some previous pipeline helpers might have utilized `Newtonsoft.Json`, aligning strictly with `System.Text.Json` (which is standard in modern .NET and .NET 9 ASP.NET Core specifically) provides better performance and unifies naming policies. `DeserializeOutput` in the shared helper will leverage `System.Text.Json`.
- **Alternatives considered**: None, as this conforms to existing .NET 9 standards for the project.

### Helper Class Location
- **Decision**: Place `AnalysisHelpers` in `Lawyer.Application/Common`.
- **Rationale**: These are stateless extension-like utilities that deal with business logic abstractions (like reading `Case` domains to format strings) without touching infrastructure (DB). `Common` is appropriate.
- **Alternatives considered**: Keeping them inside `Lawyer.Application/Services/Workflows`. Rejected because these methods are meant to be reused across potentially any LLM-powered context, not strictly workflow steps.

## Findings

All logic necessary for `CleanJsonResponse`, `BuildCaseContext`, `DeserializeOutput`, `TryExtractJsonPayload`, and `IsValidJson` is well understood and can be cleanly aggregated.

The integration strategy is straightforward: create the helper, copy the canonical correct logic from `AdminComplaintService` or `RulingAnalysisService` (which typically have the most complete implementations of these methods based on context), implement them statically in `AnalysisHelpers`, and replace the local copies in all six services.
