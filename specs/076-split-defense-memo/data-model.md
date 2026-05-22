# Data Model: Split Defense Memo Generation

## FinalMemoAction

Represents the single lawyer-visible final memorandum generation or regeneration action.

**Fields**
- `caseId`: Case being drafted.
- `runId`: Current workflow run identifier.
- `selectedDefenseIds`: Selected defenses included in the final memo.
- `selectedRequestIds`: Selected final requests included in the final memo.
- `status`: Queued, Processing, Completed, Failed, Cancelled, or Conflict.
- `pointCharge`: Exactly one point on successful completion.

**Relationships**
- Contains multiple `DraftedDefenseSection` values during processing.
- Produces one final `MemoHtml` result.
- Produces multiple `UsageRecord` entries when provider calls occur.

**Validation Rules**
- Must have at least one selected approved defense with an explanation.
- Must have case access validation before processing.
- Must fail as a whole when any required section cannot be produced.

## DraftedDefenseSection

Represents the generated HTML for one selected defense.

**Fields**
- `defenseTitle`: Displayed defense title.
- `defenseType`: Formal, Substantive, or Evidentiary.
- `sourceOrder`: Order from the selected defense list.
- `html`: Complete legal argument HTML for this one defense.

**Relationships**
- Belongs to one `FinalMemoAction`.
- Is assembled into the final defense section.

**Validation Rules**
- Must map to exactly one selected defense.
- Must not contain opening, facts, requests, or closing sections.
- Must be non-empty before final assembly.

## MemoFrameSections

Represents generated HTML sections around the defenses.

**Fields**
- `openingHtml`: Court/title/parties opening.
- `factsHtml`: Facts narrative.
- `requestsHtml`: Final requests.
- `closingHtml`: Signature/closing.

**Relationships**
- Belongs to one `FinalMemoAction`.
- Is assembled with `DraftedDefenseSection` values into final `MemoHtml`.

**Validation Rules**
- Must not include defense argument bodies.
- Must preserve selected final requests exactly.
- Must be non-empty for a successful final memo.

## UsageRecord

Represents provider usage for an internal drafting operation.

**Fields**
- `caseId`: Case being drafted.
- `workflowType`: Defense memo workflow.
- `workflowRunId`: Run identifier.
- `stepType`: Final memo drafting stage.
- `modelIdentifier`: Provider model used.
- `inputTokens`, `outputTokens`, `totalTokens`: Provider usage counts.
- `estimatedCost`: Calculated provider cost.

**Relationships**
- Belongs to the same case/run as the `FinalMemoAction`.
- Multiple usage records may be produced for one final memo action.

**Validation Rules**
- Every successful provider call during final memo generation must create a usage record.
- Usage records must remain grouped under the final memo drafting stage for admin reports.
