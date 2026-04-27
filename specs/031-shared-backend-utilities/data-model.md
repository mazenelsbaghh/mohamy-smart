# Data Model: Phase 1: Shared Backend Utilities

**Branch**: `031-shared-backend-utilities`
**Related Spec**: [spec.md](./spec.md)

## Entities

No new domain entities are being created in this phase.

The primary existing entity interacted with is the `Case` entity.

### Case (Existing)
*Found in Lawyer.Core/Models*

This entity contains business fields describing a legal dispute. `AnalysisHelpers.BuildCaseContext` will extract the following fields to format text prompts for the AI pipelines:

- `ClientName` (string): The primary client's name.
- `ApponentName` (string): The opposing party's name.
- `Number` (string): The judicial case number.
- `Court` (string): The presiding court.
- `Title` (string): The case title.
- `Description` (string): Summary or notes on the case.
- `Facts` (string): Factual statements and timelines.
- `LegalClaims` (string): Legal claims or objectives.

## State Transitions

There are no database-level state transitions managed by `AnalysisHelpers`. Parsing outputs and building context are stateless string operations.
