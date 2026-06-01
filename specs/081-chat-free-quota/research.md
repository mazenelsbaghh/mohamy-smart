# Research: Chat Free Quota

## Decision: Count historical successful chat replies from `AiUsageRecords`

**Rationale**: `SmartChatService` already records usage after successful assistant responses using `AiStepType.Chat`. Counting these rows preserves historical usage and avoids a schema migration.

**Alternatives considered**:

- New `ChatUsageQuota` table: stronger concurrency control, but adds migration and operational risk for a small rule.
- Frontend local counter: rejected because users could bypass it and it would not cover other callers.
- Count messages from chat transcripts: no durable transcript entity exists for smart chat.

## Decision: Enforce free/paid boundary in `SmartChatService`

**Rationale**: The chat service is the single application boundary for smart chat and is already used by the API endpoint and AI job worker path. Enforcing there keeps controller code thin and prevents divergent callers.

**Alternatives considered**:

- Controller filter only: rejected because filters cannot know whether the provider call succeeds and would block free quota for zero-balance users.
- AI provider wrapper: rejected because billing rules need lawyer identity and usage history, not just provider calls.

## Decision: Remove generic quota filter from chat endpoint

**Rationale**: `[CheckAiQuota]` blocks zero-balance lawyers before the service can allow the first five free replies. Chat needs a more specific rule: free quota first, then paid availability.

**Alternatives considered**:

- Modify `CheckAiQuota` for chat only: rejected because it would mix action-specific billing into a generic filter and require request-body inspection.

## Decision: Charge after successful assistant response

**Rationale**: Existing AI point accounting charges usable AI output after success. Chat should follow the same principle so provider failures do not consume points.

**Alternatives considered**:

- Charge before provider call: rejected because failed provider calls would need compensation and would feel unfair to users.

## Decision: No frontend redesign for this iteration

**Rationale**: Existing API error handling can show the Arabic insufficient-points message. Adding a new quota counter UI was not requested and would expand scope.

**Alternatives considered**:

- Add remaining-free-replies UI: useful later, but not required for the requested billing rule.
