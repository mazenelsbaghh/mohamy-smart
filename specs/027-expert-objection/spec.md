# Feature Specification: Phase 8 — Objection Memo Against Expert Report (Muzakkirat I'tirad Ala Taqrir)

**Feature Branch**: `027-expert-objection`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "Phase 8 - AI workflow for analyzing expert reports in civil cases and drafting formal objection memos for Egyptian courts, covering report analysis, objection points drafting, and full memo assembly"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Expert Report Analysis & Error Identification (Priority: P1)

As a lawyer, I want the system to analyze a civil case expert report and identify all procedural, technical, documentary, and mission-scope defects, so that I have a comprehensive and structured basis for challenging the report in court.

**Why this priority**: The analysis is the intellectual foundation of the entire objection. Without a thorough and precise identification of defects (procedural, technical, documentral, mission-scope), the objection memo has no substance.

**Independent Test**: Can be tested by providing a sample expert report summary and verifying the output identifies defects in each category, generates tactical questions for the expert discussion session, assesses the legal impact of the defects, and lists documents required to support the objection.

**Acceptance Scenarios**:

1. **Given** a lawyer inputs a summary of the expert's mission and conclusion, **When** Step 1 runs, **Then** the system outputs: client name, mission summary (starting with "According to the appointment judgment..."), expert conclusion summary, procedural defects list, technical defects list, documentary defects list, mission-scope violation list, tactical testing questions for the expert, legal impact paragraph, and required documents list — all in Arabic.
2. **Given** no technical defects exist, **When** Step 1 runs, **Then** the technical defects field is empty rather than fabricated.
3. **Given** the output is reviewed, **Then** it uses only safe procedural language ("Shortcoming in procedures affecting defense rights") rather than absolute nullity claims, and uses correct Arabic technical terminology with no English terms.

---

### User Story 2 — Objection Points Drafting (Priority: P1)

As a lawyer, I want the system to draft precise, formally-worded procedural and substantive objection points from the Step 1 analysis, so that I have structured legal arguments ready for the court memo.

**Why this priority**: The drafted objection points are the legal arguments of the memo. They must be precise, formally structured, and differentiate between procedural and substantive objections.

**Independent Test**: Can be tested by providing Step 1 analysis output and verifying the output lists distinct procedural objections and substantive objections, each with a title and a detailed argument, plus formal closing requests and an internal strategy note.

**Acceptance Scenarios**:

1. **Given** the analysis from Step 1, **When** Step 2 runs, **Then** the system outputs: a list of procedural objections (each with title and argument), a list of substantive objections (each with title and argument), formal closing requests to the court, and a strategy note — all in Arabic.
2. **Given** objection language is reviewed, **Then** it must not use absolute nullity claims unless explicitly warranted, must differentiate "accounting error" from "methodological defect", and must use correct Arabic technical terms (no English).
3. **Given** client notes are provided alongside Step 1 output, **When** Step 2 runs, **Then** the client notes are incorporated into the relevant objection arguments.

---

### User Story 3 — Full Objection Memo Assembly (Priority: P2)

As a lawyer, I want the system to assemble a complete, court-ready formal objection memo in the standard Egyptian judicial drafting style (Cassation-level Arabic), so that I can submit it immediately to the court.

**Why this priority**: The final memo is the deliverable. It must be polished to Egyptian judicial standards, with proper structure and tone — it must be ready for a civil judge or court of appeal without further editing.

**Independent Test**: Can be tested by providing Steps 1 and 2 outputs and verifying the memo contains: a properly formatted header (court, parties, case number), a preamble, a facts section, a defense section structured in three parts (procedural, substantive, closing requests), and a closing signature block — all in formal judicial Arabic.

**Acceptance Scenarios**:

1. **Given** outputs from Steps 1 and 2, **When** Step 3 runs, **Then** the system outputs a complete objection memo with: memo header (court, parties, case number), legal preamble, facts and mission section, defense section (procedural defenses first, substantive & technical defenses second, closing requests third), and a closing/signature block — all in formal Arabic.
2. **Given** the output is reviewed for tone, **Then** it contains no aggressive or accusatory language (no "Bias/Tahayuz", "Fabricated", "Ignorance") and instead uses judicial politeness terms (Qusur, Mukhalafat Al-Usul, Adam Al-Tahaqquq, Adam Al-Itma'nan).
3. **Given** the output is reviewed, **Then** it contains zero English words, zero new facts not established in prior steps, and zero internal strategy notes.

---

### Edge Cases

- What happens when the expert report contains both valid and invalid findings — how does the system differentiate?
- How does the system handle a case where the expert's mission was properly conducted but the conclusions are mathematically wrong?
- What happens when the objection is to a supplementary expert (not the original appointed expert)?
- How does the system handle a case where the appointment judgment itself has ambiguities about the mission scope?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept an expert report summary (mission, conclusion, client notes) as input to Step 1.
- **FR-002**: Step 1 MUST output: client name, mission summary, conclusion summary, four defect category lists (procedural, technical, documentary, mission-scope), tactical testing questions, legal impact paragraph, and required documents list — all in Arabic.
- **FR-003**: Step 1 MUST use safe procedural language (Qusur/Shortcoming) rather than Absolute Nullity claims, and must use Arabic equivalents for all technical terms.
- **FR-004**: Step 2 MUST output: procedural objections list (title + argument each), substantive objections list (title + argument each), formal closing requests, and internal strategy note — all in Arabic.
- **FR-005**: Step 2 MUST differentiate between error types (accounting error vs. methodological defect) and must not use English technical terms.
- **FR-006**: Step 3 MUST assemble a complete objection memo in standard Egyptian judicial format (Cassation style) following the required 3-part defense structure.
- **FR-007**: Step 3 output MUST NOT contain aggressive language, English terms, internal strategy notes, or new facts not from prior steps.
- **FR-008**: Admin MUST be able to configure which AI model is used for each of the 3 steps independently.
- **FR-009**: Each step's output MUST be stored and passed to the next step.
- **FR-010**: The workflow MUST allow the lawyer to review and edit each step's output before proceeding.
- **FR-011**: Client notes provided by the lawyer MUST be incorporated into relevant objection points in Step 2.

### Key Entities *(include if feature involves data)*

- **ExpertObjectionWorkflow**: A lawyer's instance of the 3-step objection memo workflow for a specific case. Linked to a Case.
- **ReportAnalysis** (Step 1 Output): Client name, mission summary, conclusion summary, defect categories (4 lists), tactical questions, legal impact, required documents — Arabic.
- **ObjectionPoints** (Step 2 Output): Procedural objections list, substantive objections list, closing requests, strategy note — Arabic.
- **FinalObjectionMemo** (Step 3 Output): Complete assembled memo document — Arabic.
- **AiStageModelConfig** (Existing): Admin-configurable model per step — extended for these 3 steps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lawyers can produce a complete expert report objection memo through the 3-step workflow without leaving the platform.
- **SC-002**: Step 1 output contains zero English technical terms in 100% of test cases.
- **SC-003**: Step 3 memo passes lawyer review for tone without aggressive language removal needed in the majority of cases.
- **SC-004**: Admin can configure different AI models per step with changes taking effect for new workflow instances.
- **SC-005**: Step 3 memo contains zero internal strategy notes or new facts not from prior step outputs.

## Assumptions

- This workflow applies to civil case expert reports only (financial, technical, commercial) — not criminal forensic reports.
- The lawyer provides the expert report summary and client notes; the system does not have access to the full report document.
- The three-part defense structure (Procedural → Substantive → Closing Requests) is the required format for all memos under this workflow.
- The `AiStageModelConfig` table from feature `021` is extended to support this workflow's 3 steps.
- The output memo targets civil judges and courts of appeal — Cassation-level formal Arabic is the standard.
