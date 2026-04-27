# Feature Specification: Phase 4 — Administrative Complaints & Grievances (Shakawa / Tazallom)

**Feature Branch**: `023-admin-complaints`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "Phase 4 - AI workflow for drafting formal administrative complaints and grievances (Shakawa/Tazallom) to Egyptian government authorities including classification, facts narrative, violation analysis, requests drafting, and final document assembly"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Complaint Classification & Authority Identification (Priority: P1)

As a lawyer, I want the system to classify the type of administrative action (Shakwa, Tazallom, Balagh) and identify the correct competent authority, so that the complaint is directed to the right entity and correctly labeled from the outset.

**Why this priority**: Misclassifying the action type or targeting the wrong authority would render the complaint entirely invalid. This is the foundational step on which all subsequent drafting depends.

**Independent Test**: Can be tested by entering a sample grievance and verifying the output correctly classifies the action type, identifies the competent authority and its administrative level, names the target official by title, and provides a confidence rating.

**Acceptance Scenarios**:

1. **Given** a lawyer inputs a narrative of the client's grievance, **When** Step 1 runs, **Then** the system outputs: the administrative action type (in Arabic), the competent authority name, the authority level, the target official's job title, a justification for the classification, and a confidence rating (High/Medium/Low).
2. **Given** the grievance falls outside clear administrative jurisdiction, **When** Step 1 runs, **Then** the system outputs a Low confidence rating and explains the ambiguity rather than guessing.

---

### User Story 2 — Facts Narrative Drafting (Priority: P1)

As a lawyer, I want the system to draft a formal, chronological, and objective "Facts" section (Waqa'i) for the complaint, so that the narrative meets Egyptian administrative drafting standards without emotional language.

**Why this priority**: A formally-drafted facts section is mandatory for all administrative filings. It must strip emotions from client-provided narratives and render them in proper Legal Arabic.

**Independent Test**: Can be tested by inputting an emotional client narrative and verifying the output is a formal Arabic paragraph starting with "Awalan: Al-Waqa'i" and containing only chronological, objective facts.

**Acceptance Scenarios**:

1. **Given** a lawyer inputs the client's raw facts, **When** Step 2 runs, **Then** the system outputs a formal Arabic facts narrative that: starts with the standard opening phrase, presents events chronologically, and removes all emotional or subjective language.
2. **Given** the client narrative contains opinion statements rather than facts, **When** Step 2 runs, **Then** the output excludes those opinions and presents only verifiable factual statements.

---

### User Story 3 — Violation Analysis (Priority: P2)

As a lawyer, I want the system to analyze the administrative violation, classify its type, and identify the governing rules and legal articles that were breached, so that the complaint has a solid legal foundation.

**Why this priority**: The violation analysis translates the factual narrative into legal language and identifies the specific rules breached, which is required before drafting requests and the final document.

**Independent Test**: Can be tested by providing Step 2's facts output and verifying the system identifies the violation type, describes the defect, and lists the applicable rules with their source law and article text.

**Acceptance Scenarios**:

1. **Given** the facts narrative from Step 2, **When** Step 3 runs, **Then** the system outputs: violation type classification, violation description, and a list of governing rules (each with source law/regulation name, article number, and article text) — all in Arabic.
2. **Given** no clear legal article is applicable, **When** Step 3 runs, **Then** the system flags the gap rather than fabricating a legal basis.

---

### User Story 4 — Requests Drafting (Priority: P2)

As a lawyer, I want the system to draft the formal closing requests (Talabat Khitamiya) of the complaint, so that the document clearly states what administrative action or relief is being sought.

**Why this priority**: The requests section defines the outcome the client seeks. It must be specific, formal, and tied to the violation analysis.

**Independent Test**: Can be tested by providing Steps 1–3 outputs and verifying the output contains a well-structured, formal Arabic closing requests paragraph.

**Acceptance Scenarios**:

1. **Given** the classification, facts, and violation analysis from prior steps, **When** Step 4 runs, **Then** the system outputs a formal closing requests text in Arabic specifying the exact administrative actions or relief being demanded.
2. **Given** the violation involves a disciplinary matter, **When** Step 4 runs, **Then** the requests include the appropriate disciplinary request language (e.g., investigation, suspension, corrective action).

---

### User Story 5 — Full Administrative Complaint Assembly (Priority: P3)

As a lawyer, I want the system to assemble all prior step outputs into a complete, court/authority-ready formal administrative complaint document, so that I can print or submit it immediately.

**Why this priority**: The final assembled document is the deliverable. It must follow the standard Egyptian official document layout exactly.

**Independent Test**: Can be tested by providing all prior step outputs and verifying the final document includes: date, addressee, greeting, preamble, facts section (from Step 2), violation section (from Step 3), requests section (from Step 4), and a closing signature block.

**Acceptance Scenarios**:

1. **Given** outputs from Steps 1–4, **When** Step 5 runs, **Then** the system outputs a complete administrative complaint document in "White Paper" professional style with all required sections in formal Arabic.
2. **Given** any prior step has an empty or incomplete output, **When** Step 5 runs, **Then** the system indicates which section is missing rather than generating an incomplete document silently.

---

### Edge Cases

- What happens when the grievance spans multiple authorities (compound violation)?
- How does the system handle a Tazallom that has already been rejected once and is being resubmitted?
- What happens when the target official's exact title is unknown?
- How does the system handle grievances involving both administrative and criminal violations?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a raw narrative of client facts/grievance as input to Step 1.
- **FR-002**: Step 1 MUST output: action type, competent authority, authority level, target official title, classification justification, and confidence rating — all in Arabic.
- **FR-003**: Step 2 MUST output a formal Arabic facts narrative starting with the standard Egyptian administrative opening phrase, using only objective and chronological language.
- **FR-004**: Step 3 MUST output: violation type, violation description, and a list of applicable rules (source, article number, article text) — all in Arabic.
- **FR-005**: Step 4 MUST output formal closing requests in Arabic specifying the exact relief or administrative action demanded.
- **FR-006**: Step 5 MUST assemble a complete administrative complaint document in standard Egyptian layout including all mandatory sections.
- **FR-007**: Admin MUST be able to configure which AI model is used for each of the 5 steps independently.
- **FR-008**: Each step's output MUST be stored and passed as structured input to the next step.
- **FR-009**: The workflow MUST allow the lawyer to review and edit each step's output before proceeding.
- **FR-010**: All output values MUST be 100% in Arabic — no English terms in the generated content.

### Key Entities *(include if feature involves data)*

- **AdminComplaintWorkflow**: A lawyer's use of the 5-step administrative complaint workflow for a specific client matter. Linked to a Case.
- **ComplaintClassification** (Step 1 Output): Action type, authority, authority level, target official, justification, confidence.
- **FactsNarrative** (Step 2 Output): The formal Arabic facts paragraph.
- **ViolationAnalysis** (Step 3 Output): Violation type, description, governing rules list.
- **ComplaintRequests** (Step 4 Output): Formal closing requests text.
- **FinalComplaint** (Step 5 Output): Complete assembled document text.
- **AiStageModelConfig** (Existing): Admin-configurable AI model per workflow step — must be extended to include each of the 5 steps for this workflow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lawyers can produce a complete administrative complaint document through the 5-step workflow without leaving the platform.
- **SC-002**: Step 2 outputs contain zero emotional or subjective language in audited test cases.
- **SC-003**: Step 5 assembled documents pass lawyer review without structural reformatting in the majority of cases.
- **SC-004**: Admin can assign and change the AI model for any individual step without affecting other steps.
- **SC-005**: The system correctly identifies the competent authority for standard grievance types with High confidence in test cases.

## Assumptions

- The lawyer has an existing client and case record before initiating the complaint workflow.
- The system's `AiStageModelConfig` from feature `021` is extended to support this workflow's steps.
- All output fields must be in Arabic; the system does not need to support multilingual output for this feature.
- The confidence rating (High/Medium/Low) is AI-generated and serves as a lawyer advisory signal, not a system constraint.
- Administrative complaints under this workflow target Egyptian government entities under Egyptian administrative law.
