# Feature Specification: Phase 1: Shared Backend Utilities

**Feature Branch**: `031-shared-backend-utilities`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "phase-1-shared-backend-utilities" from `plan-analyzing.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified JSON Cleaning and Validation (Priority: P1)

As a backend system processing AI responses, I need to cleanly and consistently parse JSON outputs from the LLM across all analytical workflows so that parsing errors and duplicate parsing code are minimized.

**Why this priority**: Eliminating duplicate LLM response parsers reduces technical debt and unifies error handling, acting as the foundation for the generic workflow infrastructure.

**Independent Test**: Can be fully tested by verifying that all 6 existing AI workflow pipelines use the new `AnalysisHelpers` class for JSON cleaning without changing the functionality.

**Acceptance Scenarios**:

1. **Given** an LLM output wrapped in markdown code blocks (` ```json ... ``` `), **When** `AnalysisHelpers.CleanJsonResponse` is called, **Then** it strips the wrappers and whitespace to return a valid JSON payload.
2. **Given** malformed AI JSON output or invalid JSON format, **When** extraction and deserialization helpers are used, **Then** it securely handles errors and responds with standard fallback logic across all pipelines.

---

### User Story 2 - Uniform Case Context Construction (Priority: P2)

As a backend system generating instructions for the LLM, I need a centralized method to build the case context text from Case details so that every AI pipeline feeds the same core case variables in a consistent structure.

**Why this priority**: Building context using a single shared helper reduces duplication and standardizes the inputs provided to the LLM across different dashboards.

**Independent Test**: Can be tested by observing the generated prompts in development environment logging/debugging to ensure they continue to contain the correct case facts, title, opposing parties, etc.

**Acceptance Scenarios**:

1. **Given** a case with only client name and title, **When** `AnalysisHelpers.BuildCaseContext` is invoked, **Then** it produces a structured text paragraph containing only those available fields.
2. **Given** a fully populated case, **When** `AnalysisHelpers.BuildCaseContext` is invoked, **Then** it produces a complete structured overview including client, opponent, court, facts, and legal claims.

---

### Edge Cases

- What happens when an AI service encounters corrupted output that deserialization helpers fail to parse?
- How does the system handle cases with missing attributes (e.g., empty `LegalClaims` or `Facts`) when feeding context?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a centralized `AnalysisHelpers` class inside the `Lawyer.Application/Common` namespace containing shared utility methods.
- **FR-002**: System MUST include `CleanJsonResponse` to standardize stripping JSON markdown tags.
- **FR-003**: System MUST include `BuildCaseContext` to consistently format the core details of a `Case` entity.
- **FR-004**: System MUST include `DeserializeOutput` to deserialize normalized JSON or provide consistent fallback logic.
- **FR-005**: System MUST include validation properties such as `IsValidJson` and `TryExtractJsonPayload`.
- **FR-006**: System MUST update all 6 AI workflow services (`SmartAnalysisService`, `PreparingStatementOfClaimsService`, `RulingAnalysisService`, `AdminComplaintService`, `LegalWarningService`, `ExecRequestService`) to use the newly created `AnalysisHelpers`, completely replacing their local duplicate method definitions.


### Key Entities

- **Case**: Core entity representing the legal dispute. Attributes like `ClientName`, `Title`, `Court`, `Facts`, and `LegalClaims` are extracted to build the AI context.
- **AI Workflow Services**: Backend application services that orchestrate the interaction between prompt generation, LLM prompting, and saving the step results. 

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Approximately 120 lines of duplicated utility code are removed across the 6 workflow services.
- **SC-002**: All 6 workflows reliably use a single standard for parsing and building context, confirmed by zero changes to existing system behavioral tests (backward compatibility maintained).
- **SC-003**: Bug fixes applied to JSON parsing logic in `AnalysisHelpers` will safely propagate to all downstream AI pipelines instantly.

## Assumptions

- We assume no existing workflow relies on undocumented side effects within their specific `CleanJsonResponse` duplicate methods; all instances are exact or near-exact functional clones.
- We assume this change solely touches infrastructure and does not modify any system prompt definitions or wording.
