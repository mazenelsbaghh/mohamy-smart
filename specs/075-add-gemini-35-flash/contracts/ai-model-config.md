# Contract: AI Model Configuration

## GET /api/v1/AiModelConfig/models

Returns the list of supported AI model options for admin configuration.

### Expected Gemini 3.5 Flash entry

```json
{
  "identifier": "gemini-3.5-flash",
  "displayName": "Gemini 3.5 Flash",
  "description": "أداء أحدث وسرعة عالية للمهام المعقدة",
  "documentationUrl": "https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash",
  "pricingNotes": "Paid tier: input $1.50/1M tokens, output including thinking tokens $9.00/1M tokens. Context caching $0.15/1M tokens plus $1.00/1M tokens/hour storage. Google Search and Maps grounding: free tier unavailable; paid tier includes 5,000 prompts/month free shared across Gemini 3 then $14/1,000 search queries. Used to improve products: free tier yes, paid tier no."
}
```

## PUT /api/v1/AiModelConfig

Accepts stage model configuration updates.

### Gemini 3.5 Flash request example

```json
{
  "configs": [
    {
      "stepType": 1,
      "modelIdentifier": "gemini-3.5-flash"
    }
  ]
}
```

### Expected behavior

- Request succeeds when `stepType` is valid.
- Existing supported model identifiers remain accepted.
- Unsupported model identifiers continue to return validation errors.
