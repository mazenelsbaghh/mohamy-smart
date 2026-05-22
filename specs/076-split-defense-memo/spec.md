# Feature Specification: Split Defense Memo Generation

**Feature Branch**: `076-split-defense-memo`  
**Created**: 2026-05-21  
**Status**: Draft  
**Input**: User description: "Make the final defense memorandum stage draft each approved defense separately with its facts and supporting material, then generate the opening, facts, and requests, assemble the final memo without AI, charge one point only no matter how many defenses are included, and keep admin AI usage/cost reporting accurate."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fuller Final Defense Memo (Priority: P1)

As a lawyer preparing a defense memorandum, I want the final memo stage to give each approved defense its own focused drafting pass so that the final document contains stronger, fuller defense arguments instead of compressed summaries.

**Why this priority**: This is the core legal value of the feature. The final memorandum must improve in substance while preserving the existing user journey.

**Independent Test**: Start a defense memo with multiple approved defenses and generate the final memo. The final document should contain the same opening flow as before, a facts section, a separate complete argument for every selected defense, and a requests section.

**Acceptance Scenarios**:

1. **Given** a case has approved defenses with completed explanations, **When** the lawyer generates the final memorandum, **Then** every selected defense appears as its own complete argument in the defense section.
2. **Given** multiple selected defenses exist, **When** the memorandum is generated, **Then** the final defense section preserves the selected defense order and places defenses together under the defense heading.
3. **Given** the final document is displayed to the lawyer, **When** they review the structure, **Then** it is ordered as opening/introduction, facts, defenses, requests, and closing.

---

### User Story 2 - Single Point Charge (Priority: P1)

As a lawyer with an AI point balance, I want the final defense memo stage to charge exactly one point even when the system performs several drafting operations internally, so that the cost is predictable and matches the single visible action I took.

**Why this priority**: The user explicitly requires one point only. Billing trust must not depend on the number of defenses.

**Independent Test**: Generate a final memo for cases with one defense and with several defenses. In both cases, confirm the lawyer is charged exactly one point for the final memo generation action.

**Acceptance Scenarios**:

1. **Given** a lawyer has enough balance for one final memo generation, **When** they generate a memo with several defenses, **Then** exactly one point is deducted.
2. **Given** the internal generation performs multiple drafting operations, **When** the final memo job completes, **Then** no additional point deduction occurs for internal drafting operations.
3. **Given** final memo generation fails, **When** the failure is recorded, **Then** no successful-generation point is deducted.

---

### User Story 3 - Accurate Admin Usage Cost (Priority: P2)

As an admin reviewing AI usage, I want the reporting to show the true AI consumption and cost of the internally split final memo generation, so that operational cost remains visible even though the lawyer sees one billed action.

**Why this priority**: Internal calls increase provider cost. Admin reports must remain useful for model selection, pricing, and workflow profitability.

**Independent Test**: Generate a final memo with several defenses and inspect usage reporting. The report should group the activity under defense memo final drafting while reflecting the combined provider usage/cost from all internal drafting operations.

**Acceptance Scenarios**:

1. **Given** a final memo generation includes several internal drafting operations, **When** an admin reviews usage for the case/workflow, **Then** all provider usage is included in the final memo drafting cost.
2. **Given** usage is grouped by workflow and step, **When** the split final memo appears in reports, **Then** it remains associated with the defense memo workflow and final memo drafting step.
3. **Given** the lawyer was charged one point, **When** the admin reviews cost, **Then** the report still shows the actual provider cost rather than hiding internal consumption.

### Edge Cases

- If no approved defenses are selected, final memo generation must not create an empty defense section and should surface a clear failure state.
- If one internal defense drafting operation fails, the visible final memo job must fail rather than produce a partial final memorandum that looks complete.
- If a defense has missing optional legal texts or precedents, the defense must still be drafted from the available verified explanation without inventing missing material.
- If a case contains many defenses, the final memo action must remain one visible job and one point charge while reporting all internal provider usage.
- If the lawyer regenerates the final memo, the regeneration is treated as a new visible final memo action and may charge one point after confirmation, consistent with existing repeat-generation behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The final defense memorandum generation MUST keep the existing visible user journey as a single final memo action.
- **FR-002**: The final memorandum MUST include, in order, an opening/introduction area, facts, defenses, requests, and closing/signature.
- **FR-003**: The system MUST draft each selected approved defense as a separate, complete legal argument before final assembly.
- **FR-004**: The system MUST assemble the final memorandum from generated sections without asking the drafting engine to rewrite the combined final document.
- **FR-005**: The defense section MUST include all selected approved defenses exactly once.
- **FR-006**: The final memorandum MUST preserve the lawyer-selected defenses and requests and must not add new defenses or requests during final assembly.
- **FR-007**: The final memo action MUST deduct exactly one AI point on successful completion, regardless of the number of selected defenses or internal drafting operations.
- **FR-008**: The final memo action MUST not deduct a successful-generation point when the final memo job fails or is cancelled.
- **FR-009**: Admin usage reporting MUST include provider usage and estimated cost from every internal drafting operation performed for the final memo action.
- **FR-010**: Admin usage reporting MUST group the internal usage under the defense memo workflow and final memo drafting stage so existing workflow reports remain understandable.
- **FR-011**: The user-facing final memo result MUST remain editable, saveable, and downloadable through the existing final memo review flow.
- **FR-012**: The system MUST provide a clear failure outcome if any required internal section cannot be produced.

### Key Entities

- **Final Memo Action**: The single lawyer-visible action that generates or regenerates the final defense memorandum and controls the one-point charge.
- **Selected Defense**: An approved defense chosen for inclusion in the final memorandum, with title, type, factual basis, and verified explanation.
- **Drafted Defense Section**: The generated HTML section for one selected defense, intended to be assembled into the final defense section without being rewritten.
- **Memo Frame Sections**: The generated opening, facts, requests, and closing sections that surround the defense section.
- **Usage Record**: An admin-visible accounting record for provider consumption and cost associated with each internal drafting operation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In test cases with two or more selected defenses, 100% of selected defenses appear exactly once in the final memo defense section.
- **SC-002**: In successful final memo generations with any number of selected defenses, exactly one AI point is deducted from the lawyer balance.
- **SC-003**: In failed or cancelled final memo generations, zero successful-generation points are deducted.
- **SC-004**: Admin reports include 100% of provider usage generated during the final memo action.
- **SC-005**: The final memo structure can be verified in order as opening/introduction, facts, defenses, requests, and closing in every successful generation.

## Assumptions

- The existing defense memo workflow remains the user-facing workflow; no new tabs or visible steps are added.
- Existing defense explanations are considered lawyer-verified inputs for final memo generation.
- Internal drafting operations may increase elapsed generation time, and the existing background job state is acceptable for that longer wait.
- One confirmed final memo generation or regeneration maps to one lawyer-visible billable action.
- Admin cost reporting should show provider cost truthfully even when lawyer point billing is intentionally capped for the visible action.
