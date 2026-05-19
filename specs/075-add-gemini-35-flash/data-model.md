# Data Model: Add Gemini 3.5 Flash

## AI Model Option

Represents a model that can be selected for an AI workflow step.

Fields:
- `Identifier`: Stable provider model code. New value: `gemini-3.5-flash`.
- `DisplayName`: Human-readable name shown in admin-facing configuration and reports. New value: `Gemini 3.5 Flash`.
- `Description`: Short Arabic description for admins choosing among model options.
- `DocumentationUrl`: Official provider documentation URL for maintainer verification.
- `PricingNotes`: Human-readable non-token pricing and tier notes.

Validation:
- Identifier must be one of the supported model identifiers.
- Existing identifiers remain valid.

## AI Usage Cost Rule

Represents how a model's request cost is estimated from token usage.

Fields:
- `ModelIdentifier`: Supported model identifier.
- `InputTokenPriceUsd`: USD cost per input token.
- `OutputTokenPriceUsd`: USD cost per output token.

Gemini 3.5 Flash values:
- `InputTokenPriceUsd`: `1.50 / 1_000_000`.
- `OutputTokenPriceUsd`: `9.00 / 1_000_000`.

## Model Usage Breakdown

Represents aggregated usage by model in admin reports.

Fields:
- `ModelIdentifier`
- `DisplayName`
- `RequestCount`
- `TotalCostUsd`
- `InputTokens`
- `OutputTokens`

Rules:
- Gemini 3.5 Flash appears even when no usage records exist.
- Existing model records keep their historical identifiers and display names.
