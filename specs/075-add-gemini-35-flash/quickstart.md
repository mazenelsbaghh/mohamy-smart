# Quickstart: Add Gemini 3.5 Flash

## Backend Validation

1. Start the backend or run the backend tests.
2. Request available models from the admin-only AI model config models endpoint.
3. Verify the response includes:
   - `identifier`: `gemini-3.5-flash`
   - `displayName`: `Gemini 3.5 Flash`
   - `documentationUrl`: `https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash`

## Admin Configuration

1. Open Admin Dashboard settings.
2. Go to the AI model settings tab.
3. Open any AI stage model dropdown.
4. Verify `Gemini 3.5 Flash` is selectable.
5. Save a stage using `Gemini 3.5 Flash`.
6. Verify save succeeds and the selected value remains after reload.

## Cost Calculation

1. Calculate Gemini 3.5 Flash cost for:
   - 1,000,000 input tokens
   - 1,000,000 output tokens
2. Expected cost: `$10.50`.

## Usage Reporting

1. Open model usage reporting for a period with no Gemini 3.5 Flash usage.
2. Verify Gemini 3.5 Flash appears with zero requests, zero tokens, and zero cost.
