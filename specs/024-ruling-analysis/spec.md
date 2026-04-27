# Feature Specification: Phase 5 — Judicial Ruling Analysis (Tahlil Hukm Qada'i)

**Feature Branch**: `024-ruling-analysis`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "Phase 5 - AI workflow for analyzing issued criminal court judgments including operative part extraction, reasoning analysis, defect evaluation, and appeal feasibility reporting"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Operative Part Analysis (Priority: P1)

As a lawyer, I want the system to extract and classify the operative part (Mantouq) of a criminal judgment, so that I have a precise structured record of what the court decided and what legal effects that decision produces.

**Why this priority**: The operative part is the legally binding output of the judgment. It determines the client's legal status and whether any further steps are possible. All subsequent analysis depends on it.

**Independent Test**: Can be tested by providing a sample judgment text and verifying the output contains: a judgment summary, a judgment type classification, and the specific legal effect of the decision — all in formal Arabic.

**Acceptance Scenarios**:

1. **Given** a lawyer inputs a criminal judgment text/summary, **When** Step 1 runs, **Then** the system outputs: a judgment summary, a judgment type (e.g., Conviction, Acquittal, Dismissal), and a statement of the legal effect (e.g., subject to appeal, final, civil-only) — all in Arabic.
2. **Given** the judgment covers both criminal and civil aspects, **When** Step 1 runs, **Then** both aspects are captured separately in the output.

---

### User Story 2 — Reasoning Analysis (Neutral Descriptive) (Priority: P1)

As a lawyer, I want the system to produce a neutral, purely descriptive analysis of how the court built its conviction (reasoning chain), so that I can understand the court's logic as a factual baseline for evaluation.

**Why this priority**: The reasoning analysis is the raw material for identifying weaknesses and grounds. It must be strictly neutral to preserve objectivity before evaluation begins in Step 3.

**Independent Test**: Can be tested by providing a judgment with known reasoning patterns and verifying the output uses only neutral descriptive phrases, contains no evaluative language, and correctly lists the evidence relied upon.

**Acceptance Scenarios**:

1. **Given** the operative data from Step 1, **When** Step 2 runs, **Then** the system outputs: a neutral reasoning summary, a list of evidence relied upon, how the court responded to any denial by the defendant, and the distinction between criminal and civil decisions — using only descriptive language.
2. **Given** the output is reviewed, **When** any of the prohibited terms appear (e.g., "Yaqeen Qada'i", "Sound Judgment", "Coherent Evidence"), **Then** the system has violated the quality rules and the output is invalid.

---

### User Story 3 — Defect Evaluation (Priority: P2)

As a lawyer, I want the system to evaluate whether the court's reasoning is legally sufficient and identify specific technical defects, so that I know whether an appeal is feasible and on what grounds.

**Why this priority**: Moving from neutral description to evaluation is the specialist step that determines whether the case has viable appeal grounds. It requires precise categorization.

**Independent Test**: Can be tested by providing a mock reasoning analysis with a known defect type and verifying the output correctly classifies it and explains the diagnostic chain in A → B → C → D format.

**Acceptance Scenarios**:

1. **Given** the reasoning analysis from Step 2, **When** Step 3 runs, **Then** the system outputs: a boolean sufficiency assessment (true/false), the specific defect type in legal Arabic, and a technical diagnostic explanation chain.
2. **Given** no clear defect exists, **When** Step 3 runs, **Then** the system outputs `true` for sufficiency and does not fabricate a defect.
3. **Given** the evaluation is conducted, **When** the output is reviewed, **Then** pleading language (e.g., "must be overturned", "we request") must not appear.

---

### User Story 4 — Appeal Feasibility Report (Priority: P2)

As a lawyer, I want the system to generate a formal "Appeal Feasibility and Grounds Report" so that I can present an informed advisory to my client about whether to proceed with an appeal.

**Why this priority**: The report is the client-facing deliverable. It must be authoritative, safe from procedural mistakes (especially regarding deadlines and scope predictions), and ready for professional use.

**Independent Test**: Can be tested by providing prior step outputs and verifying the report includes all required fields and contains no forbidden content (no specific deadline dates, no prediction of appeal success, no claim that appeal suspends execution as absolute rule).

**Acceptance Scenarios**:

1. **Given** the prior step outputs, **When** Step 4 runs, **Then** the system outputs a formal report containing: appealability status, appeal type, legal basis for appealability (without citing specific deadline articles), appeal grounds (linked to Step 3 defects), appeal scope, and any relevant notes.
2. **Given** the report is reviewed, **When** it contains any of the prohibited items (specific deadline calculations, Article 406 citation, "appeal suspends execution" as absolute statement, future outcome predictions), **Then** the output is invalid.

---

### Edge Cases

- What happens when the judgment is a default judgment (In Absentia) with different appeal rules?
- How does the system handle an appeal deadline that has already expired?
- What happens when the criminal and civil aspects of a judgment have conflicting appeal viability?
- How does the system handle a judgment where reasoning is entirely absent (Khali Min Al-Asbab)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a criminal judgment text/summary as input to Step 1.
- **FR-002**: Step 1 MUST output: judgment summary, judgment type classification, and legal effect — all in Arabic.
- **FR-003**: Step 2 MUST output a purely descriptive reasoning analysis with no evaluative terms, using only approved language (e.g., "The court relied on...", "The court explained...").
- **FR-004**: Step 2 MUST explicitly separate criminal and civil aspects in the reasoning output.
- **FR-005**: Step 3 MUST output a sufficiency boolean, a classified defect type, and a diagnostic chain in formal Arabic.
- **FR-006**: Step 3 output MUST NOT contain pleading or evaluative language.
- **FR-007**: Step 4 MUST output an appeal feasibility report with all required fields and without prohibited content (no deadline calculations, no prediction of success/failure, no absolute "suspension of execution" claim).
- **FR-008**: Admin MUST be able to configure which AI model is used for each of the 4 steps independently.
- **FR-009**: Each step's output MUST be stored and available for the next step as structured input.
- **FR-010**: The workflow MUST allow the lawyer to review and edit each step's output before proceeding.

### Key Entities *(include if feature involves data)*

- **RulingAnalysisWorkflow**: A lawyer's use of the 4-step ruling analysis workflow for a specific judgment. Linked to a Case.
- **OperativeAnalysis** (Step 1 Output): Judgment summary, type, legal effect — Arabic.
- **ReasoningAnalysis** (Step 2 Output): Neutral reasoning summary, evidence list, denial response, criminal/civil split — Arabic.
- **DefectEvaluation** (Step 3 Output): Sufficiency boolean, defect type, diagnostic chain — Arabic.
- **FeasibilityReport** (Step 4 Output): Appealability, appeal type, legal basis, grounds list, scope, notes — Arabic.
- **AiStageModelConfig** (Existing): Admin-configurable model per step — extended for these 4 steps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lawyers can complete a full 4-step ruling analysis and receive a formatted feasibility report without leaving the platform.
- **SC-002**: Step 2 outputs contain zero prohibited terms (evaluative language) in all test cases.
- **SC-003**: Step 4 reports contain zero prohibited content (no deadline calculations, no success predictions) in all test cases.
- **SC-004**: Admin can assign different AI models to individual steps and the system uses the assigned model for each step.
- **SC-005**: Workflow state is persisted, allowing lawyers to resume at any step after closing the browser.

## Assumptions

- This workflow applies to criminal misdemeanor and felony judgments primarily; civil judgment analysis is handled by other workflows.
- The lawyer has a case record in the system before starting the workflow.
- The prohibited terms and prohibited content rules are enforced through prompt-level constraints, not separate validation logic.
- The `AiStageModelConfig` table from feature `021` is extended to support this workflow's 4 steps.
- No statutory deadline dates or article numbers related to appeal deadlines will be calculated or cited by the AI output.
