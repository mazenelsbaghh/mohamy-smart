# Fix: Fact Analysis JSON Deserialization — Snake-Case Collision

## Problem
The `AnalyzeCaseFactsAsync` method rejects perfectly valid AI responses as "structurally incomplete."

## Root Cause
`DeserializeSnakeOrCamelJson<T>()` runs `NormalizeJsonKeys()` which converts all JSON keys from
snake_case to camelCase **before** deserialization. But the DTOs use `[JsonPropertyName("snake_case")]`
attributes — e.g. `[JsonPropertyName("opposing_parties_positions")]` on `DefendantsPositions`.

After normalization the key becomes `opposingPartiesPositions`, which no longer matches:
- The `[JsonPropertyName]` attribute (`opposing_parties_positions`) — because attribute values are exact
- The C# property name (`DefendantsPositions`) — because `opposingPartiesPositions ≠ DefendantsPositions`

Result: `DefendantsPositions` deserializes as an empty list → `HasRequiredCaseAnalysisSections` fails.

## Fix Strategy
Instead of normalizing keys to camelCase and then hoping the `[JsonPropertyName]` attrs still work,
we should try the raw JSON first with `DeserializeOptions` (which respects `[JsonPropertyName]`
attributes), and only fall back to `NormalizeJsonKeys` if that yields an empty result.

### Changes
1. **`SmartAnalysisService.cs`** — Update `ParseCaseAnalysisJson` (line ~962) to try direct
   deserialization first (which honors `[JsonPropertyName]` snake_case attrs), then fall back to
   `DeserializeSnakeOrCamelJson` for edge-case payloads.
