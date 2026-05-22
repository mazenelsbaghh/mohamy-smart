# Contract: Final Defense Memo Generation

## User-Facing Contract

The lawyer uses the existing final memo stage and submits the selected defenses and requests exactly as before.

**Input**
- Case id.
- Current workflow run id.
- Case metadata.
- Legal facts summary.
- Defendant positions.
- Selected approved defenses with completed explanations.
- Selected final requests.

**Successful Output**
- A single editable HTML defense memorandum.
- The final document structure is:
  1. Opening/introduction.
  2. Facts.
  3. Defenses.
  4. Requests.
  5. Closing/signature.
- All selected defenses appear exactly once in the defenses section.
- All selected requests appear in the requests section.
- The final memo job is marked completed.
- Exactly one lawyer point is charged.

**Failure Output**
- The final memo job is marked failed.
- No successful-generation point is charged.
- No partial memo is presented as a completed final memorandum.

## Admin Reporting Contract

Every provider call performed inside the final memo action must be visible in usage reporting.

**Usage Grouping**
- Workflow: defense memo.
- Stage: final defense memo drafting.
- Case: same case id as the parent final memo action.
- Run: same workflow run id as the parent final memo action.

**Expected Reporting Behavior**
- Request count may be greater than one for a single final memo action.
- Token usage and estimated cost are summed from all internal calls.
- The lawyer point charge remains one point and is not used as a proxy for provider cost.

## Assembly Contract

Final assembly is deterministic.

**Rules**
- The final assembled memo must not be sent to a drafting provider for a rewrite.
- Generated defense sections are inserted under one defense heading.
- Defense order follows the selected defense input order.
- Empty required sections cause a failed final memo action.
