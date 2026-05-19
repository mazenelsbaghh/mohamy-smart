# Research: Add Gemini 3.5 Flash

## Decision: Use `gemini-3.5-flash` as the model identifier

**Rationale**: The official Google AI model page lists the model code as `gemini-3.5-flash` and marks it stable. The page was last updated 2026-05-18 UTC.

**Alternatives considered**: Reusing preview identifiers was rejected because the requested page and current Google documentation identify the stable model code.

## Decision: No database migration

**Rationale**: Existing AI stage configurations store model identifiers as strings. Adding a new accepted identifier and UI option is enough for admins to save the new model for any stage.

**Alternatives considered**: Adding a seeded row or lookup table was rejected because the current design uses enum/list validation plus string persistence, not a normalized model table.

## Decision: Use provided paid-tier token pricing for cost estimation

**Rationale**: Current usage tracking estimates Gemini cost from input and output token counts. Gemini 3.5 Flash should follow that existing cost calculation path with $1.50 per 1M input tokens and $9.00 per 1M output tokens.

**Alternatives considered**: Modeling free-tier, context caching, and grounding costs inside request cost calculation was rejected because existing usage records only track text generation token usage and OCR calls.

## Decision: Preserve frontend dropdown pattern

**Rationale**: The current admin AI settings page uses a local `MODEL_OPTIONS` array for every AI config dropdown. Adding Gemini 3.5 Flash there makes it selectable in all existing config controls without introducing new state flow.

**Alternatives considered**: Fetching model options dynamically from `GET /AiModelConfig/models` would reduce duplication but is a larger refactor unrelated to adding the requested model.
