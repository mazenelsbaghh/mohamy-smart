# Feature Specification: Lawyer Agenda Roll and Protection Features

**Feature Branch**: `020-lawyer-protection`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Lawyer Agenda Roll, Cancelled POA, Document Handoff, Client Excel"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lawyer Agenda Roll (Priority: P1)

As a lawyer, I want to view my upcoming court sessions in a tabular "Roll" format rather than a standard calendar, so that I can easily see all critical details at a glance, just like my traditional paper agenda.

**Why this priority**: The agenda roll view is the most critical feature because it replaces the core daily interaction unit of the lawyer: checking what cases they have tomorrow, the previous decisions, and who is assigned to attend.

**Independent Test**: Can be independently tested by populating the database with sessions for multiple lawyers and dates, and verifying that the Roll table accurately displays the data with functioning date and lawyer filters.

**Acceptance Scenarios**:

1. **Given** a lawyer navigates to the "Sessions Roll" section, **When** the page loads, **Then** they see a table with columns: Session Date, Case Number/Court, Parties (Plaintiff vs Defendant), Previous Session Decision, and Assigned Lawyer.
2. **Given** the lawyer is viewing the Sessions Roll, **When** they apply a filter for a specific date or a specific assigned lawyer, **Then** the table updates to show only matching sessions.

---

### User Story 2 - Canceled POA (Power of Attorney) Management (Priority: P2)

As a lawyer, I want to be able to mark a Power of Attorney as "Canceled" and have the system issue warnings and block its usage, so that I am protected from the legal liabilities of accidentally using a revoked POA.

**Why this priority**: Utilizing a canceled POA is a severe legal liability (potentially criminal). The system needs to forcefully prevent this mistake.

**Independent Test**: Can be tested by changing a POA's status to canceled and verifying that the warning notification triggers and the POA is blocked from selection in new case creations.

**Acceptance Scenarios**:

1. **Given** a lawyer is managing a client's POAs, **When** they change a POA's status to "Canceled", **Then** the POA is visually highlighted in red or moved to a distinct "Canceled POAs" section, and a notification is sent to the office.
2. **Given** a POA is marked as Canceled, **When** a lawyer attempts to link it to a new case, **Then** the system prevents the action and displays an error message explaining the POA is revoked.

---

### User Story 3 - Original Documents Clearance and Handoff (Priority: P3)

As a lawyer, I want to log the handover of original documents back to my client and upload a signed receipt, so that I can prove I no longer have the documents and protect myself against future claims of loss.

**Why this priority**: Lawyers are personally responsible for original documents. Having an archived proof of return protects them from malicious or forgetful clients, but it is slightly less frequent than daily agenda checks.

**Independent Test**: Can be tested by navigating to a client profile, adding a returned document entry, uploading an attachment, and verifying the attachment is saved and retrievable.

**Acceptance Scenarios**:

1. **Given** a lawyer needs to return documents, **When** they add an entry in the "Handed-over Documents" section specifying document name and delivery date, **Then** the entry is saved to the client's file.
2. **Given** a document handover entry is created, **When** the lawyer clicks "Upload Attachment" and uploads a scanned receipt image/pdf, **Then** the receipt is securely stored and can be viewed or downloaded later as legal proof.

---

### User Story 4 - Client Financial Statement Export (Priority: P4)

As a lawyer, I want to track all financial transactions (received fees, court expenses) for a specific client and generate an Excel statement, so that I can provide a transparent and professional account summary to the client.

**Why this priority**: Generating comprehensive financial sheets is a necessary step for client management and billing, but usually happens at the end of a case or billing cycle.

**Independent Test**: Can be tested by adding multiple financial entries (income and expenses) for a client and clicking "Export to Excel", verifying the resulting file contains the accurate ledger.

**Acceptance Scenarios**:

1. **Given** a lawyer is viewing a client's page, **When** they navigate to the "Financials" tab, **Then** they can log amounts received and amounts spent (with descriptions).
2. **Given** a client has financial records, **When** the lawyer clicks "Export to Excel", **Then** a formatted spreadsheet is downloaded containing a summary of all logged financial transactions for that client.

---

### Edge Cases

- What happens when an assigned lawyer is removed from the office but still has upcoming sessions in the Roll?
- How does the system handle an Office Manager changing a "Canceled" POA back to "Active" by mistake?
- What happens when a lawyer tries to upload a massive file (e.g. 500MB) as a document clearance receipt?
- How does the Excel export format dates and currency symbols for localization?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Data Table view of Court Sessions (Agenda Roll) including fields: Session Date, Case Number, Court, Parties, Previous Decision, and Assigned Lawyer.
- **FR-002**: System MUST allow filtering of the Agenda Roll by Session Date and/or Assigned Lawyer.
- **FR-003**: System MUST introduce a "Canceled" Boolean or Status field to the Power of Attorney entity.
- **FR-004**: System MUST trigger an internal notification/alert to office members when a POA is marked as Canceled.
- **FR-005**: System MUST prevent linking any Canceled POA to a new case or proceeding.
- **FR-006**: System MUST provide a "Handed-over Documents" section in the Client Profile to record document name and handover date.
- **FR-007**: System MUST allow uploading and securely storing an attachment (image/PDF) for each Document Handover record.
- **FR-008**: System MUST provide a Client Financials section to record Income (fees) and Expenses (court costs).
- **FR-009**: System MUST allow exporting the Client Financials ledger to an Excel spreadsheet.

### Key Entities *(include if feature involves data)*

- **Session**: Exists already, but must ensure it captures Previous Decision and assigned Lawyer (attendance).
- **Power of Attorney (POA)**: Exists already, must add `is_canceled` or status enum.
- **Document Handoff (New)**: Represents the transfer of original documents. Attributes: ClientID, Document Name, Delivery Date, Attachment File Path/URL.
- **Client Transaction (New)**: Represents financial ledgers associated with a client. Attributes: ClientID, Transaction Type (Income/Expense), Amount, Description, Date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lawyers can access and correctly read the Agenda Roll table without needing to refer back to paper agendas.
- **SC-002**: A POA marked as canceled entirely blocks the continuation of case creation or linking.
- **SC-003**: The system successfully stores and retrieves uploaded Document Receipts (attachments).
- **SC-004**: Financials tab accurately exports an Excel representing 100% of the recorded ledger rows for a client.

## Assumptions

- Office members have appropriate notification channels setup (in-app alerts, etc.) to receive the POA warning.
- The default attachment limits are adequate for typical signature receipts (e.g., up to 10MB per file).
- The exported Excel file requires standard spreadsheet software to open.
