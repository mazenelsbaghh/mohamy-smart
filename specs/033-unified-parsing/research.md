# Phase 0: Research

## Decision: Unification of JSON Serialization Library

**Decision**: Migrate all analytic parsing from `Newtonsoft.Json` to `System.Text.Json` using `JsonNamingPolicy.SnakeCaseLower` and custom property attributes.

**Rationale**: The existing codebase has experienced divergence, causing mixed usage and bugs in parsing frontend formats correctly. Using the built-in .NET 9 native `System.Text.Json` enhances execution performance and avoids an extra third-party discrepancy, aligning with the project's .NET 9 tech standard.

**Alternatives considered**: 
- *Keeping both Newtonsoft and System.Text.Json*: Rejected due to maintainability issues and serialization bugs.
- *Strict migration to Newtonsoft.Json entirely*: Rejected because `System.Text.Json` is Microsoft's recommended and active native standard in modern .NET platforms and handles records/structs more natively.

## Decision: Data Schema Validation Strategy

**Decision**: Build a static `StepOutputSchemas` validation helper within `Lawyer.Application` to attempt parsing the string payload to the specific pipeline step's target DTO type strictly *before* saving.

**Rationale**: Validating outputs via strict C# object deserialization guarantees the structures exactly match the DTO types sent to the frontend endpoints, resolving structural mismatches without adding another custom data-verification mapping layer or complex dynamic checks. This keeps it strongly-typed.

**Alternatives considered**:
- *Using JSON Schema standard (e.g. `JsonSchema.Net` validation)*: Rejected. While mathematically cleaner for JSON, it introduces a redundant "Source of Truth" (the JSON schemas files versus the C# DTOs themselves), demanding higher maintenance. C# strong-typed class serialization handles validation implicitly.
