# Feature Specification: Phase 6 — Official Legal Warning / Judicial Notice (Inzar Rasmi / I'zar Qada'i)

**Feature Branch**: `025-legal-warning`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "Phase 6 - AI workflow for preparing and drafting official legal warnings and judicial notices (Inzar Rasmi / Izhar Qadai) through a bailiff, covering legal classification, warning body drafting, and final official document assembly"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Warning Classification & Legal Analysis (Priority: P1)

As a lawyer, I want the system to analyze the facts of a debt or obligation situation and classify the correct type of legal warning (e.g., Takleef bil Wafaa, Judicial Excuse, Official Warning), so that the warning I issue is legally valid and accurately establishes or confirms the debtor's legal default status.

**Why this priority**: Choosing the wrong classification renders the warning legally ineffective. Establishing "legal default" (Matal Qanouni) is often the purpose of the warning and determines downstream legal rights.

**Independent Test**: Can be tested by entering a debt scenario and verifying the output correctly classifies the warning type, states whether legal default status is triggered, provides a legal summary covering all 6 required elements, and categorizes factual grounds into the 4 required categories.

**Acceptance Scenarios**:

1. **Given** a lawyer inputs a summary of the obligation facts, **When** Step 1 runs, **Then** the system outputs: the legal classification of the warning type (including whether it establishes legal default), a legal summary covering (relationship nature, debt cause, written proof, amount certainty, due date, legal effect of non-payment), and factual grounds in 4 categories (debt source, delivery fact, deadline agreement, refusal to pay) — all in Arabic.
2. **Given** a fact is absent from the input (e.g., no written proof of debt), **When** Step 1 runs, **Then** the system flags the missing element rather than inventing it.
3. **Given** the output is reviewed, **Then** it contains only pure legal Arabic with no English terms.

---

### User Story 2 — Warning Body Drafting (Priority: P1)

As a lawyer, I want the system to draft the formal body text of the legal warning (Matn Al-Inzar), so that the warning text is legally sound, formally structured, and ready for bailiff execution.

**Why this priority**: The warning body is the core legal instrument. It must follow a precise narrative structure linking parties, stating the obligation, the breach, the demand, and the legal consequences.

**Independent Test**: Can be tested by providing Step 1's classification output and verifying the warning body includes: a preamble linking parties, the obligation described, the breach/delay stated, an explicit demand (Takleef), and a general warning of legal action — all in formal Arabic.

**Acceptance Scenarios**:

1. **Given** the classification from Step 1, **When** Step 2 runs, **Then** the system outputs a warning body paragraph that includes all 5 required elements in formal and dry Legal Arabic.
2. **Given** the output is reviewed, **Then** it contains no invented amounts, dates, or facts not present in Step 1's input.
3. **Given** a specific warning type (e.g., Judicial Excuse) was identified in Step 1, **When** Step 2 runs, **Then** the warning body language exactly matches that warning type's legal requirements.

---

### User Story 3 — Final Official Warning Document Assembly (Priority: P2)

As a lawyer, I want the system to assemble a complete final official warning document in the standard Egyptian bailiff format (Inzar Rasmi Ala Yad Mohdar), so that I can provide the document to the bailiff's office for formal service without additional reformatting.

**Why this priority**: The assembled document is the final deliverable — it must match the exact Egyptian official format to be accepted by bailiff offices and courts.

**Independent Test**: Can be tested by providing Step 1 and Step 2 outputs and verifying the final document includes all required sections in the correct order: header, date (or placeholder), notifier data, notified party data, bailiff preamble, warning body, closing bailiff block, and signature block.

**Acceptance Scenarios**:

1. **Given** outputs from Steps 1 and 2, plus party data, **When** Step 3 runs, **Then** the system outputs a complete warning document containing all required Egyptian bailiff format sections in Arabic.
2. **Given** a party's name or date is not yet known, **When** Step 3 runs, **Then** the system uses standardized placeholders (....) for those fields rather than inventing data.
3. **Given** the output is reviewed, **Then** it contains no new legal claims not present in the prior steps.

---

### Edge Cases

- What happens when the debt has already been partially paid and the remaining amount is disputed?
- How does the system handle a warning for a non-monetary obligation (e.g., handover of property)?
- What happens when the due date (Hulul Al-Ajal) has not yet arrived?
- How does the system handle a situation where no written proof of debt exists?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a narrative summary of the obligation facts as input to Step 1.
- **FR-002**: Step 1 MUST output: legal classification (with legal default status), legal summary (covering 6 required elements), and factual grounds (4 categories) — all 100% in Arabic.
- **FR-003**: Step 1 MUST NOT invent facts not present in the input — missing facts must be flagged.
- **FR-004**: Step 2 MUST output a formal warning body paragraph containing all 5 structural elements in formal Legal Arabic.
- **FR-005**: Step 2 MUST NOT introduce new amounts, dates, or facts not established in Step 1.
- **FR-006**: Step 3 MUST assemble a complete official warning document in standard Egyptian bailiff format.
- **FR-007**: Step 3 MUST use standardized placeholders for any missing party data or dates rather than inventing information.
- **FR-008**: Step 3 MUST NOT add new legal claims beyond those established in prior steps.
- **FR-009**: Admin MUST be able to configure which AI model is used for each of the 3 steps independently.
- **FR-010**: Each step's output MUST be stored and passed to the next step.
- **FR-011**: The workflow MUST allow the lawyer to review and edit each step's output before proceeding.
- **FR-012**: All output values MUST be 100% in Arabic with no English terminology in generated content.

### Key Entities *(include if feature involves data)*

- **LegalWarningWorkflow**: A lawyer's instance of the 3-step warning workflow for a specific client matter. Linked to a Case.
- **WarningClassification** (Step 1 Output): Legal classification, legal summary, factual grounds (4 categories) — Arabic.
- **WarningBody** (Step 2 Output): The formal warning body paragraph — Arabic.
- **FinalWarningDocument** (Step 3 Output): The complete assembled official warning document — Arabic.
- **AiStageModelConfig** (Existing): Admin-configurable model per step — extended for these 3 steps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lawyers can produce a complete official warning document through the 3-step workflow without leaving the platform.
- **SC-002**: Step 1 correctly identifies legal default status (Matal Qanouni) for standard debt scenarios in all test cases.
- **SC-003**: Step 3 assembled documents require no structural reformatting before submission to bailiff offices in the majority of cases.
- **SC-004**: Admin can configure AI models per step and the system uses the correct model for each step.
- **SC-005**: No invented facts (amounts, dates, names) appear in output when not present in input — zero hallucination tolerance for numerical data.

## Assumptions

- Warnings under this workflow target Egyptian civil and procedural law obligations primarily.
- The lawyer provides the raw facts and the system handles legal structuring — the lawyer remains responsible for final legal review.
- The standard Egyptian bailiff format is well-defined and stable — the system follows the fixed structure.
- Party data (names, addresses) may be incomplete at drafting time and are handled with placeholders.
- The `AiStageModelConfig` table from feature `021` is extended to support this workflow's 3 steps.
