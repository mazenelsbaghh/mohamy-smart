# Feature Specification: Phase 7 — Executive & Precautionary Requests with Legal Service (Talabat Tanfiziya / Tahaffuziya wal-I'lan)

**Feature Branch**: `026-exec-requests`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "Phase 7 - AI workflow for analyzing and drafting executive petitions, precautionary measures, and court service/notification requests. Covers strict legal analysis of request nature, formal drafting, and final petition template assembly."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Request Nature Analysis & Classification (Priority: P1)

As a lawyer, I want the system to analyze the legal situation and classify whether it requires an executive petition (Talaba Tanfiziya), a precautionary measure (Ijraa Tahaffuzi), a service request (Talab I'lan), or a combination, so that the correct petition type is prepared and directed to the correct court and stage.

**Why this priority**: Petitioning the wrong court or using the wrong petition type would render the motion invalid and harm the client. The strict legal classification determines everything that follows.

**Independent Test**: Can be tested by entering a scenario (e.g., an unpaid debt with a court judgment in hand) and verifying the output correctly identifies the request nature, the specific request type, the legal basis (judgment, law, contract), court competency data, whether prior service is still required, and a summary of decision-relevant facts.

**Acceptance Scenarios**:

1. **Given** a lawyer inputs a case facts summary, **When** Step 1 runs, **Then** the system outputs: request nature (Executive/Precautionary/Service or a combination), the detailed specific request type, the legal basis (type and description), court competency data (court name, procedural stage), service requirements (is service required now, any previous warning details), relevant facts summary, and a final classification statement — all in Arabic.
2. **Given** the situation requires both an executive petition and a service notification, **When** Step 1 runs, **Then** both are captured in the output as separate request types.
3. **Given** the legal basis is a prior court judgment, **When** Step 1 runs, **Then** the legal basis type is classified as "judicial" rather than "contractual" or "legal".

---

### User Story 2 — Request Drafting (Priority: P1)

As a lawyer, I want the system to draft the formal legal requests, service requests, and list of supporting documents based on the analysis in Step 1, so that I have a complete set of formal legal petitions ready for structuring into the final template.

**Why this priority**: The drafted requests are the substantive legal content of the petition. They must be precise, formally worded, and tied directly to the Step 1 classification.

**Independent Test**: Can be tested by providing Step 1 output and verifying that the system outputs: drafted legal requests, drafted service requests (if applicable), and a combined list of the supporting documents required for each.

**Acceptance Scenarios**:

1. **Given** the classification from Step 1, **When** Step 2 runs, **Then** the system outputs: formal draft legal requests, formal draft service requests (if service is required), a list of supporting documents needed for the executive petition, and a list of supporting documents needed for the service request.
2. **Given** service is not required at this stage, **When** Step 2 runs, **Then** the service request fields are empty rather than fabricated.

---

### User Story 3 — Final Executive Petition Template Assembly (Priority: P2)

As a lawyer, I want the system to assemble a complete final executive or precautionary petition template from the prior steps, so that I have a court-ready document that can be submitted with minimal editing.

**Why this priority**: The final petition template is the deliverable. It must be structured in the standard Egyptian judicial format used for petitions submitted to enforcement judges or presidents of courts.

**Independent Test**: Can be tested by providing Steps 1 and 2 outputs and verifying the final template contains all standard Egyptian petition sections: header, subject, facts with legal basis, formal requests, supporting documents list, closing, and signature block.

**Acceptance Scenarios**:

1. **Given** outputs from Steps 1 and 2, **When** Step 3 runs, **Then** the system outputs a complete petition template in correct Egyptian court format including all required sections — all in Arabic.
2. **Given** certain data is not yet confirmed, **When** Step 3 runs, **Then** the system uses standard placeholders rather than inventing names, amounts, or dates.
3. **Given** the petition is for a precautionary measure (Ijraa Tahaffuzi), **When** Step 3 runs, **Then** the template structure and language reflect the precautionary rather than the executive petition style.

---

### Edge Cases

- What happens when execution requires action in multiple governorates simultaneously?
- How does the system handle a case where the debtor has already voluntarily complied after the judgment?
- What happens when the executive title (Sund Tanfizi) is a notarized contract rather than a court judgment?
- How does the system handle combined executive + precautionary requests in a single petition?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a case facts summary as input to Step 1.
- **FR-002**: Step 1 MUST output: request nature, detailed request type, legal basis (type & description), court competency data (court name, stage), service requirements, facts summary, and final classification — all in Arabic.
- **FR-003**: Step 2 MUST output: formal draft legal requests, formal draft service requests, supporting documents list for the executive petition, and supporting documents list for the service request — all in Arabic.
- **FR-004**: Step 2 MUST leave service-related fields empty when service is not required, rather than fabricating content.
- **FR-005**: Step 3 MUST assemble a complete petition template in standard Egyptian judicial format using outputs from Steps 1 and 2.
- **FR-006**: Step 3 MUST use standard placeholders for any unknown party or case data.
- **FR-007**: Admin MUST be able to configure which AI model is used for each of the 3 steps independently.
- **FR-008**: Each step's output MUST be stored and passed to the next step.
- **FR-009**: The workflow MUST allow the lawyer to review and edit each step's output before proceeding.
- **FR-010**: All output values MUST be 100% Arabic.

### Key Entities *(include if feature involves data)*

- **ExecRequestWorkflow**: A lawyer's instance of the 3-step executive/precautionary requests workflow. Linked to a Case.
- **RequestClassification** (Step 1 Output): Request nature, type, legal basis, court data, service data, facts summary, classification result — Arabic.
- **DraftRequests** (Step 2 Output): Draft legal requests, draft service requests, supporting documents lists — Arabic.
- **FinalPetitionTemplate** (Step 3 Output): Complete assembled petition document — Arabic.
- **AiStageModelConfig** (Existing): Admin-configurable model per step — extended for these 3 steps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lawyers can produce a complete executive or precautionary petition through the 3-step workflow without leaving the platform.
- **SC-002**: Step 1 correctly classifies the request type (executive vs. precautionary vs. service) for standard scenarios in test cases.
- **SC-003**: Step 3 assembled petition templates require no structural reformatting before court submission in the majority of cases.
- **SC-004**: Admin can configure different AI models for each step with changes taking effect immediately.
- **SC-005**: Service fields remain empty in the output when not applicable — no hallucinated service requests in non-service scenarios.

## Assumptions

- This workflow applies to Egyptian civil and commercial court execution and precautionary proceedings.
- The lawyer has an existing case with a judgment or executive title before initiating the workflow.
- The executive title (Sund Tanfizi) may be a court judgment, notarized contract, or commercial paper — the system classifies based on the lawyer's input.
- The `AiStageModelConfig` table from feature `021` is extended to support this workflow's 3 steps.
- The final template output contains placeholders for party data and specific case numbers that the lawyer fills in before submission.

> **Note**: The PDF prompt files in this spec's `prompts/` folder are temporary references from Phase 6's warning workflow. The actual Phase 7 AI prompt specifications are derived from the phase 7 `.docx` file's field mapping schema above.
