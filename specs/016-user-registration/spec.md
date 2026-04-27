# Feature Specification: User Registration Fields

**Feature Branch**: `016-user-registration`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "•	الاسم الكامل •	رقم الموبايل •	البريد الإلكتروني •	كلمة المرور •	تأكيد كلمة المرور •	المحافظة •	الموافقة على الشروط عايز دي البينات الاساسيه اللي بتتعمل"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Registration Submission (Priority: P1)

As a new user, I want to fill in all the required core registration fields to create a new account in the system.

**Why this priority**: Essential to the platform; no new user can sign up without successfully entering these details.

**Independent Test**: Can be fully tested by submitting a mock form with valid details and confirming that the system registers the account and records the exact data submitted.

**Acceptance Scenarios**:

1. **Given** a user is on the registration page, **When** they fill the fields "Full Name, Mobile Number, Email, Password, Password Confirmation, Governorate" and check "Agree to Terms," and click submit, **Then** the system registers the account.
2. **Given** a user on the registration page, **When** they miss a mandatory field like "Governorate" or "Agree to Terms," **Then** the system prompts them to fill it in and does not submit.
3. **Given** a user enters "Password" and a different "Password Confirmation", **When** they click submit, **Then** the system shows a mismatch error and prevents submission.

---

### Edge Cases

- What happens when a user attempts to register with an email or mobile number already in the system?
- How does system handle entering invalid inputs (e.g., non-numeric mobile number or very weak password)?
- What happens when the terms agreement box is unchecked while trying to submit?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a registration mechanism requiring: Full Name, Mobile Number, Email, Password, Password Confirmation, Governorate, and a Terms of Service Agreement checkbox.
- **FR-002**: System MUST validate that all core fields are filled out; no mandatory field can be left blank.
- **FR-003**: System MUST validate that the Password and Password Confirmation fields match exactly.
- **FR-004**: System MUST check if the "Agree to Terms" checkbox is selected before allowing submission.
- **FR-005**: System MUST validate the email format and ensure it conforms to standard email structures.
- **FR-006**: System MUST authenticate the uniqueness of the user. Registration MUST fail if either the provided Email or Mobile Number already exists in the system.

### Key Entities *(include if feature involves data)*

- **User Registration**: Represents a person signing up, with attributes for full name, mobile number, email, governorate, and their authentication credentials.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the account creation form, entering all fields successfully, in under 2 minutes.
- **SC-002**: 100% of successful registrations have the "Agree to Terms" explicitly checked.
- **SC-003**: The system prevents 100% of registrations where Password and Password Confirmation do not match.
- **SC-004**: Validation cleanly prevents non-conforming emails and empty governorate selections.

## Assumptions

- We assume "Full Name" is a single text string entry.
- We assume standard password complexity rules will apply by default.
- We assume "Governorate" is selected from a predefined list of valid administrative areas rather than freetext.
- "Mobile Number" assumes an Egyptian or standard local format.
