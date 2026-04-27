# Feature Specification: Global Auto-save and Drafts

**Feature Branch**: `043-global-auto-save`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "فكر معايا ماتعملش حاجه لان عايز لكل المراحل فاهمني تحديث شاشة اختيار المسارات (CaseAnalysis.tsx): بدل التفكير القديم اختر المرحلة..., عدلت النصوص لتكون المسودات والمراحل المنجزة (في حالة وجود تحليل أو مسودة سابقة) أو المسودات ومسارات العمل. غيّرنا النصوص المساعدة عشان تفهّم المحامي إن المسودة بيتم حفظها تلقائياً خلال كل مرحلة، وتقدر تستعرض المسارات المتاحة."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Continue Draft Workflows (Priority: P1)

As a lawyer managing multiple complex cases, I want to see a localized "Drafts and Completed Stages" view on the case dashboard, so I can seamlessly resume any previously saved workflow step without restarting or losing my prior AI outputs.

**Why this priority**: Lawyers frequently leave browser tabs or need to pause work on a defense memo or ruling breakdown to consult other documents. Ensuring drafts are clearly labeled and accessible provides immediate peace of mind and prevents redundant data-entry efforts.

**Independent Test**: Can be fully tested by creating a draft in the Defense Memo workflow, navigating back to Case Analysis, verifying the UI says "المسودات والمراحل المنجزة", and successfully re-entering the workflow at the saved draft state.

**Acceptance Scenarios**:

1. **Given** a case with an existing workflow draft, **When** the lawyer visits the Case Analysis tab, **Then** the UI explicitly displays the "المسودات والمراحل المنجزة" element.
2. **Given** a user inside a draft workflow, **When** they click "Resume", **Then** the workflow loads their exact previous input states and AI analyses.

---

### User Story 2 - Ubiquitous Auto-save During Editing (Priority: P1)

As a lawyer editing an AI-generated memo or complaint, I want the system to silently auto-save my modifications in the background as I type, so I never lose my manual refinements due to a browser crash, session timeout, or accidental navigation.

**Why this priority**: Modifying complex Arabic legal phrasing takes time and concentration. Losing this work is highly frustrating. Auto-saving removes cognitive overhead.

**Independent Test**: Can be fully tested by editing a text block in a final stage, triggering the auto-save indicator, deliberately closing the tab, and reloading the page to find the text preserved.

**Acceptance Scenarios**:

1. **Given** the lawyer is typing in the Final Editor stage of any workflow, **When** they pause typing for 2 seconds, **Then** the system triggers a background save operation.
2. **Given** the save operation completes, **When** the lawyer looks at the status bar, **Then** the UI shows "آخر حفظ تلقائي للتعديلات: [Time]".

---

### User Story 3 - Exploring Available Workflows (Priority: P2)

As a lawyer starting a new case, I want the analysis hub to present itself as a catalog of available workflows that implicitly creates autosaved drafts, so I understand that I am exploring safe paths instead of executing un-undoable actions.

**Why this priority**: Clarity around "drafts" vs "final decisions" encourages exploration of the platform's AI tools without fear of irreversibly altering a case file.

**Independent Test**: Can be fully tested by a new user loading a fresh case. The UI displays "المسودات ومسارات العمل", and explicitly mentions automatic saving.

**Acceptance Scenarios**:

1. **Given** a completely new case, **When** the lawyer visits the analysis section, **Then** they see the option to browse available workflows under the "المسودات ومسارات العمل" label.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a debounced Auto-save capability (triggering after N seconds of input pause) across ALL final text editors in ALL available workflows (Defense Memo, Statement of Claims, Admin Complaint, Appeal Brief, etc.).
- **FR-002**: System MUST visually clearly indicate the chronological timestamp of the last successful auto-save directly within the editor interface.
- **FR-003**: System MUST provide a localized Case Analysis entry hub that clearly demarcates between "Starting a new workflow" and "Accessing existing drafts/completed stages".
- **FR-004**: System MUST persist the auto-saved data directly to the SQL database backend across ALL workflow steps (data inputs, AI parsing, draft analysis, final document editing) seamlessly, ensuring zero data loss and minimizing the need for intrusive browser-level 'beforeunload' navigation guards.
- **FR-005**: System MUST centralize the auto-save implementation (e.g. via a shared React Hook or Higher-Order Component) so that when a new workflow stage is added in the future, it automatically inherits the standardized auto-save logic.

### Key Entities

- **WorkflowDraft**: The unified entity storing partial state (inputs, generated AI texts, manual edits) associated with a Case ID and specific Workflow Enum.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of final-stage rich HTML editors across all case workflows inherit the Auto-save mechanism.
- **SC-002**: Zero reported data loss scenarios when a user's browser crashes or navigates away mid-edit (provided the debounce timer fired).
- **SC-003**: Qualitative: Lawyers explicitly acknowledge the "Drafts" phrasing on the portal makes the system feel safer to experiment with.

## Assumptions

- Users have a stable internet connection capable of handling frequent debounced string updates to an API endpoint without severe latency.
- The Redux / Local Storage / Backend state can support overwriting the partial "Draft" strings multiple times sequentially without optimistic concurrency exceptions blocking the save.
- Existing React components are sufficiently modular to accept a generalized "useAutoSave" hook or similar approach.
