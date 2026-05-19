# Feature Specification: Add Gemini 3.5 Flash

**Feature Branch**: `075-add-gemini-35-flash`  
**Created**: 2026-05-20  
**Status**: Draft  
**Input**: User description: "Add https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash to every AI config, with paid tier pricing: input $1.50 per 1M tokens, output including thinking tokens $9.00 per 1M tokens, context caching $0.15 per 1M tokens plus $1.00 per 1M tokens per hour storage, Google Search and Google Maps grounding not available on free tier and 5,000 prompts/month free on paid tier shared across Gemini 3 then $14 per 1,000 search queries, free tier data used to improve products yes and paid tier no."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Gemini 3.5 Flash (Priority: P1)

An admin managing AI workflow model choices can select Gemini 3.5 Flash anywhere the system offers configurable Gemini models.

**Why this priority**: The model must be selectable before any workflow can use it.

**Independent Test**: Fetch the available AI models and verify Gemini 3.5 Flash appears with the correct model identifier, display name, and description.

**Acceptance Scenarios**:

1. **Given** the admin opens AI model settings, **When** available models are loaded, **Then** Gemini 3.5 Flash is included as a selectable model option.
2. **Given** an admin submits a model configuration using Gemini 3.5 Flash, **When** the configuration is validated, **Then** the system accepts the model identifier.

---

### User Story 2 - Calculate Gemini 3.5 Flash Cost (Priority: P2)

Usage tracking calculates estimated costs for Gemini 3.5 Flash using the provided paid-tier input and output token prices.

**Why this priority**: Cost reporting and AI point deduction depend on accurate per-model cost estimates.

**Independent Test**: Calculate a Gemini 3.5 Flash request with known input and output token counts and verify the estimated cost matches $1.50 and $9.00 per 1M tokens respectively.

**Acceptance Scenarios**:

1. **Given** a Gemini 3.5 Flash usage record with input and output tokens, **When** cost is calculated, **Then** input tokens are charged at $1.50 per 1M and output tokens at $9.00 per 1M.
2. **Given** reports group usage by model, **When** Gemini 3.5 Flash usage exists, **Then** it appears under the Gemini 3.5 Flash display name.

---

### User Story 3 - Document Pricing Metadata (Priority: P3)

The system records the official model documentation URL and pricing details close to the model configuration source so maintainers can verify future pricing changes.

**Why this priority**: The pricing table includes extra metadata beyond token cost that should remain traceable, but it does not block model selection.

**Independent Test**: Inspect the model metadata source and verify the official documentation URL and provided pricing notes are present for Gemini 3.5 Flash.

**Acceptance Scenarios**:

1. **Given** a maintainer reviews configured model metadata, **When** they inspect Gemini 3.5 Flash, **Then** the Google AI documentation URL is available.
2. **Given** a maintainer reviews Gemini 3.5 Flash pricing notes, **When** they inspect the model metadata, **Then** the context caching, grounding, and product-improvement tier notes are visible.

### Edge Cases

- Existing AI configurations using older Gemini models must remain valid and unchanged.
- Unknown model identifiers must continue to fall back to the existing default behavior.
- Usage reports must include Gemini 3.5 Flash even when it has zero usage, matching the current per-model report behavior.
- Existing historical usage records with old model identifiers must retain their original display names and costs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST include Gemini 3.5 Flash as an available AI model configuration option.
- **FR-002**: System MUST accept `gemini-3.5-flash` as a valid AI model identifier wherever model configurations are validated.
- **FR-003**: System MUST display Gemini 3.5 Flash with a human-readable name distinct from existing Gemini 3.1 Pro, Gemini 3 Flash, and Gemini 3.1 Flash Lite options.
- **FR-004**: System MUST calculate Gemini 3.5 Flash paid-tier input token cost at $1.50 per 1,000,000 tokens.
- **FR-005**: System MUST calculate Gemini 3.5 Flash paid-tier output token cost, including thinking tokens, at $9.00 per 1,000,000 tokens.
- **FR-006**: System MUST include Gemini 3.5 Flash in model usage breakdowns even when usage is zero.
- **FR-007**: System MUST preserve existing AI model choices and cost calculations for all existing supported models.
- **FR-008**: System MUST store the official Gemini 3.5 Flash documentation URL: `https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash`.
- **FR-009**: System MUST document Gemini 3.5 Flash context caching pricing as $0.15 per 1,000,000 tokens and $1.00 per 1,000,000 tokens per hour for storage.
- **FR-010**: System MUST document Gemini 3.5 Flash grounding notes: free tier not available for Google Search or Maps grounding, paid tier includes 5,000 prompts per month free shared across Gemini 3 and then $14 per 1,000 search queries.
- **FR-011**: System MUST document product-improvement usage notes: free tier is used to improve products, paid tier is not.

### Key Entities *(include if feature involves data)*

- **AI Model Option**: A selectable model entry containing identifier, display name, description, documentation URL, and pricing notes.
- **AI Usage Cost Rule**: The pricing rule used to estimate request cost from input and output token counts.
- **Model Usage Breakdown**: Report output that aggregates request count, tokens, and estimated cost by model identifier.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin model option retrieval includes exactly one Gemini 3.5 Flash option with identifier `gemini-3.5-flash`.
- **SC-002**: A configuration update using `gemini-3.5-flash` succeeds without validation errors.
- **SC-003**: A request with 1,000,000 input tokens and 1,000,000 output tokens for Gemini 3.5 Flash estimates a total cost of $10.50.
- **SC-004**: Model usage breakdown includes Gemini 3.5 Flash with zero counts when no records exist.
- **SC-005**: Existing supported Gemini model identifiers continue to be accepted after the change.

## Assumptions

- The model identifier used by the Google API is `gemini-3.5-flash`, confirmed from the official model page last updated 2026-05-18 UTC.
- "All AI config" refers to backend model option selection, validation, default/report model lists, and cost calculation sources used by the existing admin AI configuration flow.
- The provided paid-tier token prices are the source of truth for in-app cost estimation in this change.
- Context caching, grounding, and product-improvement pricing notes are documented as metadata only unless an existing billing flow already consumes them.
