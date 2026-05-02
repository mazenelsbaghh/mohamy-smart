# Feature Specification: Internal Regulations in Legal Library

**Feature Branch**: `069-internal-regulations`  
**Created**: 2026-05-02  
**Status**: Draft  
**Input**: User description: "Add something in the legal library called internal regulations, and allow assigning it to cases, for example a case can use civil law plus the internal regulation so the system works on both the law and the regulation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Internal Regulations to the Legal Library (Priority: P1)

A lawyer or content administrator adds an internal regulation as a first-class legal library item so it can be found and reused alongside laws.

**Why this priority**: The regulation must exist in the legal library before it can be attached to cases or used in legal work.

**Independent Test**: A user can create or identify an internal regulation in the legal library, see it clearly labeled as an internal regulation, and distinguish it from laws.

**Acceptance Scenarios**:

1. **Given** the legal library contains laws, **When** a user adds an internal regulation, **Then** the library stores it as a legal reference with the "internal regulation" type.
2. **Given** the legal library has laws and internal regulations, **When** a user browses or searches library items, **Then** internal regulations appear with a clear type label and can be selected separately from laws.

---

### User Story 2 - Attach Internal Regulations to a Case Beside Laws (Priority: P1)

A lawyer working on a case chooses the relevant law and one or more internal regulations so the case context includes both sources.

**Why this priority**: The main user request is to let a case use civil law plus an internal regulation rather than relying on laws alone.

**Independent Test**: A case can be configured with a law and an internal regulation, saved, reopened, and still show both selected references.

**Acceptance Scenarios**:

1. **Given** a case has a selected law, **When** the lawyer adds an internal regulation to the same case, **Then** the case keeps both references active.
2. **Given** a case already has one or more internal regulations, **When** the lawyer removes one, **Then** the case no longer uses that regulation while keeping the selected law unchanged.
3. **Given** a user reopens a case, **When** the case details load, **Then** all linked laws and internal regulations are visible in the case's legal references.

---

### User Story 3 - Use Combined References in Legal Analysis (Priority: P2)

When the system prepares legal analysis, drafting, or memo work for a case, it considers both the selected laws and the internal regulations linked to that case.

**Why this priority**: The value of linking internal regulations is realized when legal work uses them as part of the active case context.

**Independent Test**: A case with a law and internal regulation produces legal work that includes both sources in the available context and source list.

**Acceptance Scenarios**:

1. **Given** a case has a law and an internal regulation linked, **When** the lawyer starts supported legal work, **Then** the system includes both reference types in the case context.
2. **Given** no internal regulation is linked to a case, **When** legal work starts, **Then** the workflow continues normally using the existing law references only.

### Edge Cases

- A case with no internal regulations must keep the existing law-only behavior.
- Duplicate selection of the same internal regulation for one case must be prevented or safely ignored.
- Removing an internal regulation from a case must not delete it from the legal library.
- Archived, deleted, or unavailable internal regulations must not be offered as active case references.
- If an internal regulation is too large or incomplete, the user must receive a clear message instead of silently losing that source.
- Users without permission to manage legal library content must not be able to add or modify internal regulations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The legal library MUST support "internal regulation" as a distinct legal reference type.
- **FR-002**: Users with legal library management permission MUST be able to add, edit, archive, and view internal regulations using the same quality controls expected for legal library references.
- **FR-003**: Users MUST be able to browse, search, and filter internal regulations separately from laws.
- **FR-004**: A case MUST be able to reference one or more internal regulations alongside its existing law references.
- **FR-005**: The system MUST persist case-to-internal-regulation links so they remain visible after the case is reopened.
- **FR-006**: The system MUST prevent duplicate internal regulation links on the same case.
- **FR-007**: Removing an internal regulation from a case MUST only remove the case link and MUST NOT remove the legal library item.
- **FR-008**: Case legal-reference displays MUST show laws and internal regulations together while preserving each item's type.
- **FR-009**: Supported legal work for a case MUST include all active linked internal regulations in the case reference context together with selected laws.
- **FR-010**: If a case has no linked internal regulations, all existing law-only case workflows MUST continue without additional required input.
- **FR-011**: The system MUST exclude archived or unavailable internal regulations from new case selection while preserving historical links for audit and review where appropriate.
- **FR-012**: The system MUST provide user-readable validation messages when an internal regulation cannot be added, linked, or used.

### Key Entities

- **Legal Library Reference**: A reusable legal source available to users, including laws and internal regulations. Key attributes include title, type, status, content availability, and last updated date.
- **Internal Regulation**: A legal library reference representing an internal bylaw, policy, or regulation that can supplement statutory law in case work.
- **Case Legal Reference Link**: The relationship between a case and a selected legal source, preserving which laws and internal regulations are active for the case.
- **Case Legal Work Context**: The set of legal sources used when the system prepares case analysis, drafting, or memo work.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A permitted user can add an internal regulation to the legal library and locate it again in under 2 minutes.
- **SC-002**: A lawyer can link an internal regulation to an existing case that already has a law selected in under 1 minute.
- **SC-003**: 100% of reopened cases show the same linked internal regulations that were saved before closing the case.
- **SC-004**: Legal work started from a case with internal regulations includes those regulations in the active reference context every time.
- **SC-005**: Existing cases without internal regulations continue their current law-only workflows with no extra required steps.

## Assumptions

- Internal regulations are managed as part of the existing legal library rather than as private per-case attachments.
- A case may use multiple internal regulations unless the product later chooses a stricter business rule.
- Existing permission rules for legal library management apply to internal regulation creation and editing.
- Existing case workflows already support at least one selected legal reference, and this feature expands that set rather than replacing it.
- Historical case links should remain reviewable even if a legal library item is later archived.
