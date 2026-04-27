# Feature Specification: Phase 3 — Appeal Brief Preparation (Sahifat Taan)

**Feature Branch**: `022-appeal-brief`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "Phase 3 - AI workflow for preparing formal appeal briefs (Sahifat Taan) against judgments, covering judgment data extraction, reasoning analysis, grounds identification, requests drafting, legal basis citation, and final document assembly"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Judgment Data Extraction (Priority: P1)

As a lawyer, I want to input a judgment summary and have the system extract all structured data from the operative and parties section, so that downstream steps have a clean structured foundation to build the appeal from.

**Why this priority**: All subsequent steps depend on the structured judgment data. Without a clean extraction of the pronouncement, parties, dates, and case type, the rest of the workflow cannot proceed.

**Independent Test**: Can be tested by entering a sample judgment text and verifying the system outputs a structured JSON containing case number, judgment date, parties, and the exact pronouncement text.

**Acceptance Scenarios**:

1. **Given** a lawyer inputs a raw judgment text/summary, **When** Step 1 runs, **Then** the system outputs a structured record containing: case number, judgment date, parties (plaintiff & defendant), court name, the exact pronouncement (Mantouq), and the judgment type (criminal/civil).
2. **Given** the judgment input is incomplete or ambiguous, **When** Step 1 runs, **Then** the system flags missing fields rather than hallucinating data.

---

### User Story 2 — Reasoning Analysis (Priority: P1)

As a lawyer, I want the system to produce a neutral, purely descriptive analysis of the court's reasoning (Asbab Al-Hukm), so that I can understand how the court built its conviction without any evaluative bias introduced by the AI.

**Why this priority**: The reasoning analysis is the raw material for identifying appeal grounds. It must be strictly neutral and descriptive to preserve legal accuracy.

**Independent Test**: Can be tested by providing a sample judgment with known reasoning patterns and verifying that the output uses only descriptive language (no evaluative terms like "the court correctly" or "the court failed").

**Acceptance Scenarios**:

1. **Given** the structured judgment data from Step 1, **When** Step 2 runs, **Then** the system outputs a neutral summary of how the court built its conviction, a list of evidence relied upon, the court's response to any denial, and a separation of the criminal vs. civil aspects.
2. **Given** the output contains any evaluative phrase (e.g., "sound reasoning", "conscience satisfaction"), **When** the output is reviewed, **Then** those terms must not appear — the system must use only neutral descriptive phrases.

---

### User Story 3 — Appeal Grounds Identification (Priority: P2)

As a lawyer, I want the system to analyze the court's reasoning and identify specific legal defects (Uyub) that constitute valid grounds for appeal, so that I have a structured list of defensible grounds to build the appeal brief around.

**Why this priority**: Identifying the correct grounds is the intellectual core of the appeal. Each defect must be categorized precisely (procedural, substantive, reasoning deficiency) to be actionable.

**Independent Test**: Can be tested by providing a mock reasoning analysis and verifying the output lists specific defect types with a logical explanation chain (A → B → C → D diagnostic format).

**Acceptance Scenarios**:

1. **Given** the reasoning analysis from Step 2, **When** Step 3 runs, **Then** the system outputs whether reasoning is sufficient (true/false), the type of defect, and a technical diagnostic explanation chain in formal Arabic.
2. **Given** no clear defect is identified, **When** Step 3 runs, **Then** the system explicitly states that no defect was found rather than fabricating one.

---

### User Story 4 — Requests Drafting (Priority: P2)

As a lawyer, I want the system to draft the formal requests section (Talabat) of the appeal brief, so that the procedural, substantive, and urgent requests are structured in the standard Egyptian judicial format.

**Why this priority**: The requests section is the actionable output of the brief — what the court is being asked to do. It must follow a precise format.

**Independent Test**: Can be tested by providing grounds from Step 3 and verifying the output contains three distinct request categories: procedural, substantive, and urgent — all in formal legal Arabic.

**Acceptance Scenarios**:

1. **Given** the identified grounds from Step 3, **When** Step 4 runs, **Then** the system outputs formal procedural requests, substantive requests, and urgent requests in structured JSON with Arabic values.
2. **Given** no urgent measures are needed, **When** Step 4 runs, **Then** the urgent requests field is empty rather than fabricated.

---

### User Story 5 — Legal Basis Citation (Priority: P3)

As a lawyer, I want the system to identify and cite the specific legal articles and Cassation Court principles (Mabadi Al-Naqd) that support the appeal grounds, so that the brief has authoritative legal backing.

**Why this priority**: Legal citations are what transform a factual argument into a legally-grounded appeal. However, they depend on all prior steps being complete.

**Independent Test**: Can be tested by providing specific grounds and verifying the output lists relevant articles with their law source, article number, verbatim text, and relevant Cassation principles.

**Acceptance Scenarios**:

1. **Given** the grounds and requests from prior steps, **When** Step 5 runs, **Then** the system outputs a list of legal articles with law name, article number, verbatim text, and Cassation principles with case number, year, date, and application notes.
2. **Given** a Cassation principle is uncertain, **When** Step 5 runs, **Then** the system flags it rather than fabricating a ruling.

---

### User Story 6 — Final Appeal Brief Assembly (Priority: P3)

As a lawyer, I want the system to assemble all previous steps into a complete, court-ready formal appeal brief document, so that I can download or print the document for submission.

**Why this priority**: The final assembly is the deliverable. It depends on all prior steps and should follow the exact Egyptian court submission format.

**Independent Test**: Can be tested by providing all step outputs and verifying the final document follows the correct Egyptian appeal brief structure with all sections present.

**Acceptance Scenarios**:

1. **Given** all prior step outputs (Steps 1–5), **When** Step 6 runs, **Then** the system outputs a complete appeal brief document in standard Egyptian judicial format including: header, parties, pronouncement, grounds with arguments and legal basis, requests, and signature block — all in formal Arabic.
2. **Given** any step's output is missing, **When** Step 6 runs, **Then** the system indicates which section is incomplete rather than generating with missing data.

---

### Edge Cases

- What happens when the judgment date falls outside the statutory appeal window?
- How does the system handle a judgment with both a criminal and a civil aspect that have conflicting grounds?
- What happens if the lawyer inputs a cassation-only judgment (Al-Naqd) instead of an appeal-level judgment?
- How does the system handle a judgment where the pronouncement contradicts the stated reasoning?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept structured judgment data (case number, date, parties, court, pronouncement) as input to Step 1.
- **FR-002**: Step 1 MUST output a structured JSON record with all extracted judgment fields and flag any missing fields.
- **FR-003**: Step 2 MUST produce a purely neutral and descriptive reasoning analysis using only approved descriptive language (no evaluative terms).
- **FR-004**: Step 2 MUST separate the criminal and civil aspects of the judgment's reasoning.
- **FR-005**: Step 3 MUST output a boolean sufficiency assessment, a classified defect type, and a diagnostic chain explaining the defect.
- **FR-006**: Step 4 MUST output three categories of requests (procedural, substantive, urgent) in formal legal Arabic.
- **FR-007**: Step 5 MUST output cited articles with: law name, article number, verbatim text, and relevant Cassation principles (with case number, year, date, application notes).
- **FR-008**: Step 6 MUST assemble a complete appeal brief document in standard Egyptian judicial format.
- **FR-009**: Admin MUST be able to configure which AI model is used for each of the 6 steps independently.
- **FR-010**: Each step's output MUST be stored and passed as structured input to the next step.
- **FR-011**: The workflow MUST allow the lawyer to review and edit each step's output before proceeding to the next.

### Key Entities *(include if feature involves data)*

- **AppealWorkflow**: Represents a single lawyer's use of the appeal brief workflow for a specific judgment. Links to the originating Case. Contains the outputs of each step.
- **JudgmentData** (Step 1 Output): Case number, judgment date, court, parties, pronouncement text, judgment type.
- **ReasoningAnalysis** (Step 2 Output): Reasoning summary, evidence list, response to denial, criminal/civil separation.
- **AppealGrounds** (Step 3 Output): Sufficiency flag, defect type, diagnostic chain.
- **AppealRequests** (Step 4 Output): Procedural requests list, substantive requests list, urgent requests list.
- **LegalBasis** (Step 5 Output): Articles list (law, number, text), Cassation principles list.
- **FinalBrief** (Step 6 Output): Complete assembled document text.
- **AiStageModelConfig** (Existing): Admin-configurable AI model per workflow step — must be extended to include each of the 6 steps for this workflow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lawyers can complete a full 6-step appeal brief workflow without leaving the platform, reducing manual drafting time.
- **SC-002**: Step 2 reasoning analysis output contains zero evaluative or prohibited terms in 100% of test cases.
- **SC-003**: The final assembled brief (Step 6) passes lawyer review without requiring structural reformatting in the majority of cases.
- **SC-004**: Admin can successfully assign a different AI model to any of the 6 steps and the workflow uses the correct model for each step.
- **SC-005**: Each step's output is stored and retrievable, allowing the lawyer to resume an interrupted workflow at any step.

## Assumptions

- The lawyer has already created a case in the system before initiating the appeal brief workflow.
- The system's existing `AiStageModelConfig` entity from feature `021` will be extended to support the new workflow steps.
- The prohibited terms list for Step 2 (e.g., "Yaqeen Qada'i", "Sound Judgment") is fixed in the prompt and not user-configurable.
- Appeal brief workflows are linked to specific cases and stored per-case.
- The system supports Arabic-language output natively.
