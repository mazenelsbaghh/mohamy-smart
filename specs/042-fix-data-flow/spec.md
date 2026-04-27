# Feature Specification: Fix AI Stages Data Flow

**Feature Branch**: `042-fix-data-flow`
**Created**: 2026-04-11
**Status**: Draft
**Input**: User description: "@[/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/ai-stages-data-flow.md] عايز اعمل الحلول دد"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Integration & Normalization (Priority: P1)

As a developer, I want all frontend state slices to receive AI output data in uniform camelCase structures, so that UI components correctly display legal text rather than rendering empty or undefined fields.

**Why this priority**: Without this structural fix, the user interface remains empty for recently updated pipelines where the data bindings expect camelCase but the API serves snake_case keys. This directly breaks user value delivery.

**Independent Test**: Can be independently tested by triggering the execution of "Preparing Statement of Claims", "Legal Warning", and other pipelines, and asserting that the resulting Redux state contains correct properties such as `caseMainType` instead of `case_main_type`.

**Acceptance Scenarios**:

1. **Given** a successful AI step execution emitting a snake_case JSON response, **When** the backend parses the response, **Then** the `[JsonPropertyName]` overrides do not force it back to snake_case upon serialization.
2. **Given** the frontend hydrating data, **When** the workflow state receives the response payload, **Then** all underlying keys are deeply camelCased to match exact component bindings.

---

### User Story 2 - Workflow Data Extraction & Unwrapping (Priority: P1)

As a developer, I want the frontend to safely extract nested JSON payloads (output wrapping), so that workflow components receive actual objects instead of finding stringified representations inside `output`.

**Why this priority**: Workflow paths wrap their payloads inside an `output` string property. Passing a string to the hydration normalizer causes hard crashes and failures to populate data structures.

**Independent Test**: Can be tested by navigating away from and back to a cached "Appeal Brief" or "Admin Complaint" workflow, verifying the string unwrapping pipeline gracefully converts it to structured data on load.

**Acceptance Scenarios**:

1. **Given** an AI workflow payload wrapped as a string, **When** step components extract the data, **Then** the value is successfully decoded from JSON to a deeply nested object before being passed to the state hydrators.
2. **Given** direct workflow polling results, **When** data arrives not string-wrapped, **Then** step normalizers handle it smoothly without unnecessarily executing `JSON.parse`.

---

### Edge Cases

- What happens when deeply nested properties like those stored in backend `ExtensionData` dictionaries are passed through? The system properly maps missing PascalCase or snake_case key paths into unified camelCase equivalents on the frontend via `deepCamelize`.
- How does the system handle poorly-formatted or unexpected JSON keys? The normalizers implement safe fallbacks (e.g., matching against missing properties natively).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST process incoming snake_case parameters dynamically via explicit `SnakeCaseOptions` during JSON parsing rather than hardcoded PropertyName annotations.
- **FR-002**: System MUST consistently serialize outgoing service data objects back to camelCase responses targeting modern API payload expectations.
- **FR-003**: Frontend normalizer MUST defensively parse string representations from wrapped `output` object chains without cascading exceptions.
- **FR-004**: Frontend parsing pipelines MUST implement `deepCamelize` safely to transform arbitrary snake_case dictionaries natively to normalized camelCase records.
- **FR-005**: All UI Redux hydration reducers MUST handle partial parsing payloads ensuring null checks are adhered to.

### Key Entities

- **Workflow Job Response**: The overarching parent DTO container that either directly holds data or a stringified payload tracking AI operation results.
- **StepOutput State**: The structured frontend view models holding unstringified camelCase maps bound to the React hooks and component trees.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pipeline definitions (Statements, Appeal Brief, Admin Complaint, Legal Warning, Execution Request, Ruling Analysis) successfully present populated data across their components on reload.
- **SC-002**: Backend APIs serialize all dynamically typed payloads uniformly without regression to legacy formatting rules.
- **SC-003**: Frontend console avoids any Redux exceptions mapped to attempting property paths within stringified elements or undefined properties from mapping mismatches.

## Assumptions

- Data returned by the language endpoints strictly represents valid JSON structures.
- Backend pipeline definitions correctly encapsulate their data logic utilizing proper StepOutputs (AppealBriefStepOutput, etc.) where required without mixing schema methodologies.
- Normalization patterns within the frontend can be cleanly introduced incrementally across existing workflow slice code without impacting non-AI state components.
