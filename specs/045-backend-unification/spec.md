# Feature Specification: Backend Unification

**Feature Branch**: `045-backend-unification`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "Phase 1 — Backend Unification: Unify all 7 workflow backend services under WorkflowServiceBase, consolidate to a single JSON library, centralize shared utility methods, add typed step output schemas for all stages, standardize error handling, and enforce consistent case access validation across every workflow."

## Clarifications

### Session 2026-04-14

- Q: When AI output fails schema validation for a known step type, should the system reject entirely or store with a warning? → A: Reject and require re-analysis — invalid output is NOT persisted; the step is marked as failed with a descriptive error message.
- Q: Should the 7 services be migrated sequentially (one at a time) or all at once? → A: Sequential — one service at a time, from easiest to hardest, with testing after each migration before proceeding to the next.
- Q: Where should schema validation failures be recorded? → A: Both server logs AND database records accessible from the admin dashboard, enabling pattern analysis without server access.
- Q: How should the system handle in-flight AI jobs that return results in the old format after migration? → A: Accept both formats temporarily — the system auto-detects the naming convention and converts to the new format before storage during a transitional period.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent Data Format Across All Workflows (Priority: P1)

A lawyer uses any of the 7 workflow stages (Defense Memo, Statement of Claims, Appeal Brief, Administrative Complaints, Ruling Analysis, Formal Notice, Execution Requests) and the system returns AI-generated step outputs in a single, consistent data format. The lawyer's dashboard displays all results identically regardless of which workflow was used, with no silent parsing failures or mismatched field names.

**Why this priority**: Today, two of the seven workflows return data in a different naming convention (snake_case) while the remaining five return camelCase. This inconsistency causes silent parsing failures in the dashboard, resulting in lawyers seeing empty or broken results for completed analyses. This is a data-integrity and trust issue — lawyers may act on incomplete legal analysis.

**Independent Test**: Trigger an AI analysis in each of the 7 workflows, verify the dashboard correctly receives and renders all step output fields without parsing errors.

**Acceptance Scenarios**:

1. **Given** a lawyer initiates a Defense Memo analysis (workflow 1), **When** the AI completes Step 1, **Then** the step output arrives at the dashboard in the same field-naming convention as all other workflows and renders correctly.
2. **Given** a lawyer initiates a Statement of Claims analysis (workflow 2), **When** any step completes, **Then** the output format matches the convention used by workflows 3–7 and the dashboard parses it without fallback to raw/untyped display.
3. **Given** a lawyer switches between different workflow types in the same session, **When** viewing completed step outputs, **Then** all outputs appear with consistent formatting — no fields are missing or misnamed.

---

### User Story 2 - Validated AI Outputs Before Storage (Priority: P1)

When the AI generates step outputs for any of the 7 workflows, the system validates the output structure before persisting it. If the AI returns malformed or incomplete data, the system detects the problem immediately and reports a clear error instead of silently storing invalid data in the database.

**Why this priority**: Currently, only 1 of 7 workflows validates AI output structure (Ruling Analysis covers step types 51–54). The remaining 6 workflows store AI output as unvalidated dynamic objects. This means corrupted or incomplete AI responses can be silently persisted, leading to downstream errors when lawyers view or export their legal documents.

**Independent Test**: Submit deliberately malformed AI output for each workflow stage and verify the system rejects it with a descriptive error rather than storing it.

**Acceptance Scenarios**:

1. **Given** the AI returns a valid response for any workflow step, **When** the system processes the output, **Then** it validates the structure against the expected schema and stores it successfully.
2. **Given** the AI returns an output missing required fields for Step 2 of Administrative Complaints, **When** the system processes it, **Then** it rejects the output with a descriptive error indicating which fields are missing, the step is marked as failed, and no data is persisted for that step.
3. **Given** the AI returns extra unexpected fields, **When** the system processes the output, **Then** it stores only the expected fields and does not fail.

---

### User Story 3 - Uniform Security Enforcement Across All Workflows (Priority: P1)

Every workflow enforces that the requesting lawyer owns the case before any analysis runs. No lawyer can trigger AI analysis, view results, or modify step outputs for a case that belongs to another lawyer — regardless of which workflow is used.

**Why this priority**: One workflow (Appeal Brief) currently has no ownership validation at all, meaning any authenticated lawyer can run analyses on any case in the system. Two other workflows use a different validation mechanism than the standard. This is a security vulnerability that could expose confidential legal case data.

**Independent Test**: Attempt to initiate a workflow analysis for a case owned by a different lawyer; the system must reject the request with an authorization error in every workflow.

**Acceptance Scenarios**:

1. **Given** Lawyer A owns Case X, **When** Lawyer B attempts to start an Appeal Brief analysis on Case X, **Then** the system returns an authorization error and no analysis is initiated.
2. **Given** Lawyer A owns Case X, **When** Lawyer A initiates any workflow analysis on Case X, **Then** the system allows the analysis to proceed.
3. **Given** a lawyer attempts to access step outputs of a workflow for a case they do not own, **When** the system processes the request, **Then** it returns an authorization error and no data is returned.

---

### User Story 4 - Centralized Utility Logic for Reliable AI Processing (Priority: P2)

All workflow services use a single, shared implementation for common operations — cleaning AI-generated JSON responses, building case context for AI prompts, and building previous-step context. Bug fixes or improvements to these shared operations apply automatically to all 7 workflows without requiring changes in multiple places.

**Why this priority**: Five separate copies of JSON-cleaning logic and four separate copies of case-context-building logic currently exist across different services. A bug fix in one copy does not propagate to the others, leading to inconsistent behavior and repeated debugging effort.

**Independent Test**: Introduce a deliberate formatting variation in AI output (e.g., extra whitespace, markdown fencing around JSON) and verify all 7 workflows handle it identically via the shared utility method.

**Acceptance Scenarios**:

1. **Given** the AI returns a JSON response wrapped in markdown code fences, **When** any of the 7 workflow services processes it, **Then** all services produce the same cleaned result because they call the same shared utility.
2. **Given** a bug fix is applied to the shared JSON-cleaning method, **When** any workflow processes an AI response, **Then** the fix is effective across all 7 workflows without additional service-level changes.
3. **Given** the case context builder is updated with a new field, **When** any workflow builds an AI prompt, **Then** all workflows include the new field identically.

---

### User Story 5 - Standardized Error Responses Across Workflows (Priority: P2)

When any workflow encounters an error (missing case, invalid input, AI failure), the system returns errors in a single, consistent format. The lawyer's dashboard handles and displays errors uniformly regardless of which workflow triggered the failure.

**Why this priority**: Some services currently return errors via `Result<T>.Error()` while others use `_result.BadRequest<T>()`, producing different response structures. This forces the frontend to handle multiple error formats, increasing complexity and the risk of unhandled error states.

**Independent Test**: Trigger the same class of error (e.g., case not found) in each of the 7 workflows and verify the frontend receives identically structured error responses.

**Acceptance Scenarios**:

1. **Given** a lawyer provides an invalid case ID to any workflow, **When** the system processes the request, **Then** it returns an error response in the same format used by all other workflows.
2. **Given** the AI service fails during processing in workflow 3 (Appeal Brief), **When** the error is returned, **Then** the dashboard renders the same error UI component as it would for a failure in workflow 6 (Formal Notice).
3. **Given** multiple errors occur in a single workflow execution, **When** the system reports them, **Then** each error follows the same structural pattern.

---

### User Story 6 - Simplified Addition of New Workflow Pipelines (Priority: P3)

A developer adding a new (8th) workflow pipeline to the system can do so by configuring a minimal set of pipeline-specific information (step definitions, prompt folder, schema definitions) rather than duplicating an entire service implementation from scratch. The shared base provides all common operations automatically.

**Why this priority**: Currently, adding a new pipeline requires creating 15+ new files with significant copy-paste from existing services. This increases the time to deliver new legal analysis features and introduces risk of subtle inconsistencies between workflows.

**Independent Test**: Add a mock/stub workflow using only the pipeline-specific configuration and verify it correctly inherits all shared behaviors (case access validation, JSON processing, error handling, step output persistence).

**Acceptance Scenarios**:

1. **Given** a new workflow type is defined with its step definitions and prompt configuration, **When** a developer registers it in the system, **Then** the workflow automatically inherits case access validation, JSON cleaning, context building, error handling, and step output persistence.
2. **Given** a new workflow is added, **When** a lawyer triggers its analysis, **Then** it behaves identically to existing workflows in terms of security enforcement, error formatting, and data persistence.

---

### Edge Cases

- What happens when a workflow service is migrated but the AI still returns output in the old naming convention (snake_case) from cached/in-flight jobs? — The system auto-detects the format and converts to the new convention before validation and storage; this dual-format acceptance is temporary.
- How does the system handle a workflow step that has been partially completed under the old format and is then resumed after the migration?
- What happens if the AI returns a completely empty JSON object `{}` — schema validation rejects it as invalid; the step is marked as failed and no data is persisted.
- How does the system behave if two concurrent requests attempt to write to the same workflow step (race condition between manual and automated triggers)?
- What happens if a legacy workflow (Defense Memo, Statement of Claims) with a different database schema is processed through the unified base? How is backward compatibility maintained?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST use a single JSON serialization library with a single naming convention (camelCase) across all 7 workflow services, replacing all instances of the alternative library and snake_case naming.
- **FR-002**: The system MUST validate AI-generated step outputs against defined schemas before persisting them for all known step types across all 7 workflows. If validation fails, the output MUST NOT be persisted and the step MUST be marked as failed with a descriptive error message. Unknown step types MUST fall back to a generic dynamic schema with a logged warning.
- **FR-003**: The system MUST enforce case ownership validation before any workflow operation (create, analyze, retrieve results) for all 7 workflows, using a single, shared validation mechanism.
- **FR-004**: The system MUST provide a single shared implementation of JSON-response cleaning logic used by all workflow services, eliminating per-service duplicates.
- **FR-005**: The system MUST provide a single shared implementation of case-context building logic used by all workflow services when constructing AI prompts.
- **FR-006**: The system MUST provide a single shared implementation of previous-step-context building logic used by all workflow services to feed prior step outputs into subsequent AI prompts.
- **FR-007**: All workflow services MUST return errors in a single, consistent format (using the same error-result pattern) so that consuming applications receive uniformly structured error responses.
- **FR-008**: All workflow services that support step output persistence MUST use the shared step-output storage method rather than per-service custom storage logic, ensuring consistent pre-save processing.
- **FR-009**: All workflow services MUST share a common operational foundation that provides case access validation, response cleaning, context building, error handling, and step persistence, with each workflow extending only its unique behavior.
- **FR-010**: The system MUST provide a shared output-mapping mechanism so that each workflow defines its specific transformations while the output structure is consistent.
- **FR-011**: For the two legacy workflows (Defense Memo, Statement of Claims) that have a different data structure, the system MUST provide a compatibility layer that enforces case access validation and uses the unified utility methods, without requiring an immediate data structure migration.
- **FR-012**: The system MUST retain backward compatibility for any in-flight AI jobs during the migration. When a job returns results in the legacy naming convention, the system MUST auto-detect the format and convert it to the current convention before validation and storage. This dual-format acceptance is temporary and MUST be removable once all in-flight legacy jobs have completed.
- **FR-013**: Workflow services MUST be migrated to the shared foundation one at a time in order of complexity (simplest first), with each service fully tested before proceeding to the next, to isolate failures and enable targeted rollback.
- **FR-014**: When schema validation fails, the system MUST record the failure in both server logs and a persistent database record. The record MUST include the workflow type, step type, timestamp, and a summary of the validation error. These records MUST be accessible from the admin dashboard.

### Key Entities

- **Workflow Service Foundation**: Shared operational base providing common operations — case access validation, response cleaning, context building, error handling, step output persistence, and output mapping.
- **Step Output Schema**: Definition of the expected structure for each workflow step type's AI output, used for validation before persistence.
- **Case Access Validator**: Shared mechanism that verifies a requesting user has ownership rights to a specific case before any workflow operation is permitted.
- **Analysis Helpers**: Centralized utility providing response-cleaning, case-context building, and previous-step-context building methods consumed by all workflow services.
- **Workflow Output Structure**: Standardized data structure that each workflow maps its internal state to, with a consistent base structure and workflow-specific extensions.
- **Validation Failure Record**: Persistent record of a schema validation failure, capturing workflow type, step type, timestamp, and error details — queryable from the admin dashboard for pattern analysis.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 7 workflows return step outputs in a single consistent naming convention, verified by running a complete analysis in each workflow and confirming 100% field-name consistency at the dashboard.
- **SC-002**: AI output validation covers 100% of known step types (approximately 35 step types across 7 workflows), with no unvalidated known step types falling through to a generic dynamic handler.
- **SC-003**: Case ownership is enforced in 100% of workflow entry points — an unauthorized access attempt is rejected with an authorization error in every workflow, confirmed by automated or manual security test for each workflow.
- **SC-004**: The number of distinct copies of shared logic (JSON cleaning, case context building, previous-step context building) is reduced from 14+ to exactly 1 each, verified by code search showing zero duplicate implementations.
- **SC-005**: All 7 workflow services use the same error response pattern, confirmed by triggering an identical error condition in each workflow and verifying uniform response structure.
- **SC-006**: Adding a new workflow pipeline requires defining only pipeline-specific configuration (step definitions, prompt paths, schema) rather than duplicating entire service files, reducing the new-pipeline file count from 15+ to 5 or fewer.
- **SC-007**: The system's existing end-to-end functionality (all 7 workflow analyses complete successfully with correct results) is preserved after migration, verified by regression testing each workflow.
- **SC-008**: Zero usage of the replaced JSON library remains in any workflow service, verified by searching the codebase.
- **SC-009**: All schema validation failures are recorded in both server logs and the database, and are viewable from the admin dashboard, verified by triggering a validation failure and confirming it appears in both locations.

## Assumptions

- Phase 0 (Stabilize & Patch) has been completed before this phase begins — the auto-save race condition is resolved, the Appeal Brief security gap has an initial fix, and the codebase compiles cleanly.
- The two legacy workflows (Defense Memo, Statement of Claims) will receive a temporary compatibility layer rather than a full data-structure migration in this phase; the full migration is deferred to a future phase.
- The existing `WorkflowServiceBase` and `ICaseAccessValidator` patterns from workflows 4 and 6 (Administrative Complaints, Formal Notice) serve as the reference implementation for unification.
- All 7 workflow types have defined AI prompt folders; prompt content itself is not modified in this phase — only the service infrastructure that processes AI responses.
- The frontend `parseJobResult()` function may require minor adjustments to accommodate the unified backend format, but full frontend migration is out of scope for this phase (covered in Phase 2).
- The existing `AnalysisHelpers` class already provides partial implementations of the shared utilities; this phase extends and enforces their usage rather than building from scratch.
- The application is not under active public production traffic during migration, allowing for sequential service-by-service rollout without blue-green deployment.
