# Feature Specification: AI-Powered Final Defense Memorandum Generation

**Feature Branch**: `064-ai-final-memo-generation`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "Transform the final memorandum step (Step 5) of the defense memo workflow into an AI-powered generation stage that collects all approved defenses with their detailed explanations, along with the approved requests, and generates a comprehensive, long-form, professionally-structured defense memorandum using an AI model configurable by the admin."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI-Powered Memorandum Assembly (Priority: P1)

A lawyer has completed all prior workflow steps (Fact Analysis → Legal Analysis → Defenses Selection & Explanation → Final Requirements). When they reach the final step ("المذكرة النهائية"), the system automatically collects:
- Only the **approved/selected defenses** with their full explanations (not all generated defenses)
- The **approved final requests** (طلبات)
- The **case facts and legal analysis** from prior steps

The system then calls an AI model to generate a **long, detailed, and professionally-structured defense memorandum** that reads as a complete legal document — properly narrated, well-argued, and ready for submission to court.

**Why this priority**: This is the core value of the feature — replacing the current template-based HTML concatenation with an AI-generated, professionally-written memorandum.

**Independent Test**: Can be tested by completing a defense workflow through steps 1-4, then verifying that Step 5 sends an AI job and renders the resulting memorandum with full narrative structure.

**Acceptance Scenarios**:

1. **Given** a lawyer has completed steps 1-4 with at least one approved defense and one request, **When** they navigate to Step 5, **Then** the system triggers an AI generation job that produces a comprehensive defense memorandum using only approved data.
2. **Given** the AI generation is in progress, **When** the lawyer views Step 5, **Then** a loading state is displayed with a relevant progress message.
3. **Given** the AI has generated the memorandum, **When** the lawyer views the result, **Then** the memorandum is displayed as a complete legal document with proper structure (header, facts, defenses with narrative explanations, requests, closing).
4. **Given** the generated memorandum is displayed, **When** the lawyer reviews it, **Then** the document is editable via the existing content-editable editor.

---

### User Story 2 - Admin Model Selection for Memorandum Generation (Priority: P1)

An admin configures which AI model (Pro, Flash, or Flash Lite) is used for the final memorandum generation step. This setting is accessible through the existing AI Model Settings page in the admin dashboard.

**Why this priority**: The admin needs control over cost vs. quality trade-offs for this AI-intensive step. Pro models produce higher quality but cost more; Flash Lite is cheaper but may produce lower quality output.

**Independent Test**: Can be tested by an admin navigating to AI Model Settings, changing the model for the "Defense Memo Draft" step, and verifying the next memorandum generation uses the selected model.

**Acceptance Scenarios**:

1. **Given** an admin is on the AI Model Settings page, **When** they view the available steps, **Then** the "Defense Memo Draft" step is listed with a model selector.
2. **Given** an admin selects a different model for the memorandum step, **When** a lawyer triggers memorandum generation, **Then** the system uses the admin-selected model.

---

### User Story 3 - Memorandum Quality & Content Completeness (Priority: P1)

The AI-generated memorandum must be a comprehensive legal defense document that:
- Follows proper Egyptian legal memorandum structure and conventions
- Includes a complete narrative introduction connecting facts to the defense strategy
- Presents each approved defense with its full legal reasoning, citations, and precedents in a flowing narrative (not bullet points or disconnected sections)
- Includes the approved requests (original and subsidiary) properly formatted
- Is long and detailed — not a summary, but a full-length defense brief
- Uses correct legal Arabic terminology and courtroom language
- Is 100% properly structured with smooth transitions between sections

**Why this priority**: The entire point of using AI is to produce a document that surpasses the current template-based approach in quality, coherence, and persuasiveness.

**Independent Test**: Can be tested by comparing the AI-generated output against a manually-crafted defense memorandum for the same case data, checking for completeness, structure, and legal language quality.

**Acceptance Scenarios**:

1. **Given** approved defenses include legal texts and precedents, **When** the memorandum is generated, **Then** these are woven into the narrative with proper legal argumentation — not just listed as separate data points.
2. **Given** the case has multiple defense types (formal, substantive, evidentiary), **When** the memorandum is generated, **Then** each defense category flows naturally with proper legal transitions.
3. **Given** the generated memorandum, **When** a lawyer reviews it, **Then** it reads as a cohesive, professional legal document — not as a stitched-together template.

---

### User Story 4 - DOCX Export of AI Memorandum (Priority: P2)

The lawyer can download the AI-generated (and optionally edited) memorandum as a properly formatted Word document (.docx).

**Why this priority**: Lawyers need a downloadable document for court filing. This extends the existing DOCX export to work with the new AI-generated content.

**Independent Test**: Can be tested by generating a memorandum, editing it, then downloading as .docx and verifying formatting.

**Acceptance Scenarios**:

1. **Given** an AI-generated memorandum is displayed, **When** the lawyer clicks download, **Then** a .docx file is generated with proper formatting (Traditional Arabic font, justified alignment, proper headings).
2. **Given** the lawyer has edited the AI-generated memorandum, **When** they download, **Then** the downloaded document reflects their edits.

---

### Edge Cases

- What happens when the AI service is temporarily unavailable during memorandum generation?
  - The system displays a clear error message and allows the lawyer to retry generation.
- What happens when no defenses have explanations (none were analyzed in Step 3)?
  - The AI generates the memorandum using defense titles and basis only, without detailed legal analysis.
- What happens when the generated memorandum exceeds the AI model's output token limit?
  - The system handles truncation gracefully and notifies the lawyer that the document may need manual completion.
- What happens when the lawyer navigates away during AI generation?
  - The background job continues processing, and the result is available when the lawyer returns (existing SignalR pattern).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST send all approved defenses (and only approved defenses) with their detailed explanations to the AI model for memorandum generation.
- **FR-002**: System MUST send all approved final requests (طلبات) to the AI model, categorized by level (original, subsidiary).
- **FR-003**: System MUST send the case facts summary and legal analysis context to the AI model for context.
- **FR-004**: System MUST generate a memorandum that follows proper Egyptian legal defense memorandum conventions and structure.
- **FR-005**: System MUST produce a long, detailed, narrative-style memorandum — not a template-based concatenation of sections.
- **FR-006**: System MUST use the AI model configured by the admin for the "Defense Memo Draft" step type.
- **FR-007**: System MUST display a loading state while the AI is generating the memorandum.
- **FR-008**: System MUST allow the lawyer to edit the AI-generated memorandum using the existing content-editable editor.
- **FR-009**: System MUST support downloading the final memorandum (original or edited) as a properly formatted .docx file.
- **FR-010**: System MUST save the generated memorandum content for auto-resume when the lawyer returns to the case.
- **FR-011**: The admin MUST be able to select the AI model for this step from the existing AI Model Settings page.
- **FR-012**: System MUST handle AI generation failures gracefully with clear error messages and retry capability.

### Key Entities

- **Defense Memorandum**: The final AI-generated legal document — contains case header, facts narrative, defense arguments with legal reasoning, requests, and closing.
- **Approved Defense**: A defense item that the lawyer has selected/approved in Step 3, along with its full explanation (legal texts, precedents, analysis).
- **Final Requests**: Court requests approved by the lawyer in Step 4, categorized by level (original, subsidiary, total subsidiary).
- **AI Model Configuration**: Admin-controlled setting mapping the "DefenseMemoDraft" step to a specific AI model (Pro/Flash/Flash Lite).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lawyers can generate a complete AI-powered defense memorandum in under 2 minutes from triggering generation.
- **SC-002**: 90% of generated memorandums require minimal edits (less than 20% content modification) before approval by the lawyer.
- **SC-003**: The generated memorandum contains all approved defenses with their legal reasoning — no approved defense is omitted.
- **SC-004**: The generated memorandum contains all approved requests — no request is omitted.
- **SC-005**: Admin can change the AI model for this step and the change takes effect on the next generation without system restart.
- **SC-006**: The memorandum generation step integrates seamlessly with the existing 5-step workflow — no disruption to steps 1-4.

## Assumptions

- The existing AI job pipeline (thunkSubmitAiJob, SignalR polling, job hydration) is reused for this new step — no new infrastructure is needed.
- The existing admin AI Model Settings page already supports per-step model configuration; this feature adds a new step type entry.
- The "DefenseMemoDraft" step type (value = 5) already exists in the backend AiStepType enum.
- The existing content-editable editor and DOCX export functionality in FinalNote.tsx are retained and enhanced.
- The AI model receives structured JSON input and returns structured JSON/text output that the frontend renders.
- Flash Lite is the default model for this step unless the admin changes it, balancing cost and quality.
