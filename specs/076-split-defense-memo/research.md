# Research: Split Defense Memo Generation

## Decision: Keep one visible final memo job and one point charge

**Rationale**: The lawyer performs one visible action: generate the final memorandum. Existing point accounting charges the parent `AiJob` after successful completion. Keeping internal drafting operations inside that same job preserves the user's expected billing model and avoids multiplying point deductions by defense count.

**Alternatives considered**:
- Create child AI jobs per defense. Rejected because it would require new job accounting semantics and risks accidental per-defense point charges.
- Add new user-visible workflow steps. Rejected because the requested behavior is background/internal and should not change the lawyer journey.

## Decision: Record every internal provider call as `DefenseMemoDraft` usage

**Rationale**: Admin reporting already maps `DefenseMemoDraft` to the defense memo workflow and final drafting stage. Recording each internal call with the same step type and run id makes cost aggregation accurate without a schema change or report rewrite.

**Alternatives considered**:
- Record only one aggregated usage record. Rejected because provider usage metadata is naturally returned per call and aggregation can lose traceability.
- Add new AI step types for frame and single-defense drafting. Rejected because it would require enum/report/frontend/model-config changes while the business stage remains final memo drafting.

## Decision: Generate defense sections separately and assemble final HTML deterministically

**Rationale**: The current monolithic final memo prompt can compress defenses. A focused call per defense gives each argument enough context and budget. Deterministic assembly guarantees section order and prevents a final AI rewrite from omitting or changing selected defenses.

**Alternatives considered**:
- Ask the AI to produce a full final memo with stronger instructions. Rejected because it still competes for one context/output budget across all defenses.
- Generate only defense bodies and use static frame HTML. Rejected because the facts and requests still need professional legal wording based on case data.

## Decision: Fail the parent job if any required internal section fails

**Rationale**: A partial final memorandum is legally risky if it appears complete. Existing job failure handling already prevents successful point charge and surfaces a retry path.

**Alternatives considered**:
- Return a partial memo with warning. Rejected because users may download or file incomplete content.
- Skip failed defenses. Rejected because the spec requires every selected defense exactly once.

## Decision: Avoid database schema changes

**Rationale**: Existing `AiUsageRecords` already store workflow type, run id, step type, token counts, and cost. Existing `AiJobs` already controls the visible final memo action and point accounting.

**Alternatives considered**:
- Add child call metadata columns. Rejected as unnecessary for current admin cost aggregation.
- Add a memo section table. Rejected because final memo sections do not need independent persistence after assembly.
