# Feature Specification: Admin Phone Verification Override

**Feature Branch**: `079-admin-phone-verify`  
**Created**: 2026-05-22  
**Status**: Draft  
**Input**: User description: "Allow admins to manually verify user phone numbers when OTP delivery or verification has a problem with required reason and audit trail"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Verify a User Phone Manually (Priority: P1)

An authorized admin can open a user profile in the admin dashboard and mark the user's phone number as verified when OTP delivery or OTP confirmation is blocked by an operational issue.

**Why this priority**: This immediately restores access for legitimate users who cannot complete OTP, while keeping the override restricted to admins and tied to a reason.

**Independent Test**: Can be fully tested by selecting an unverified user phone, entering a reason, confirming the action, and verifying that the user is treated as phone-verified afterward.

**Acceptance Scenarios**:

1. **Given** an authorized admin is viewing a user whose phone number is not verified, **When** the admin enters a reason and confirms manual phone verification, **Then** the user phone is marked verified and the admin sees a success state.
2. **Given** an authorized admin attempts manual phone verification without a reason, **When** they submit the action, **Then** the system blocks the action and explains that a reason is required.
3. **Given** a user phone is already verified, **When** an authorized admin views the user profile, **Then** the manual verification action is unavailable or clearly shown as already completed.

---

### User Story 2 - Preserve an Audit Trail (Priority: P2)

An authorized admin can see that a user's phone was manually verified, including who performed the action, when it happened, and why it was done.

**Why this priority**: Manual verification bypasses an identity check, so accountability must be visible to support and operations teams.

**Independent Test**: Can be tested by manually verifying a phone and then reopening the same user profile to confirm the audit information is visible and accurate.

**Acceptance Scenarios**:

1. **Given** an admin manually verifies a phone, **When** the action succeeds, **Then** an audit record is stored with actor, timestamp, target user, phone number, and reason.
2. **Given** a user has a manual phone verification record, **When** an authorized admin views that user's profile, **Then** the latest manual verification details are displayed.

---

### User Story 3 - Reject Unauthorized Overrides (Priority: P3)

Users without the required admin authority cannot manually verify phone numbers.

**Why this priority**: The action changes account trust state and must not be available to regular users or lower-privilege operators.

**Independent Test**: Can be tested by attempting the same action with a non-admin or unauthorized account and confirming the action is refused without changing the user.

**Acceptance Scenarios**:

1. **Given** a user without the required admin authority, **When** they attempt manual phone verification, **Then** the system denies the action and leaves the target user's phone verification state unchanged.
2. **Given** an unauthorized user opens admin user details, **When** manual phone verification controls would otherwise appear, **Then** those controls are not available.

### Edge Cases

- The target user does not exist or was deleted before the admin submits the override.
- The target user has no phone number saved.
- The phone number changes between page load and confirmation.
- The phone is verified by OTP or another admin before the current admin submits.
- The reason is blank, whitespace-only, or too vague to support auditing.
- The system cannot write the audit record.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow only authorized admins to manually mark a user's phone number as verified.
- **FR-002**: The system MUST require a non-empty reason before manual phone verification can be completed.
- **FR-003**: The system MUST prevent manual phone verification when the target user has no phone number.
- **FR-004**: The system MUST prevent duplicate manual verification when the phone is already verified.
- **FR-005**: The system MUST show admins the current phone verification status on the relevant user profile or detail view.
- **FR-006**: The system MUST record an audit entry for every successful manual phone verification.
- **FR-007**: The audit entry MUST include the target user, the phone number verified, the acting admin, the timestamp, and the reason.
- **FR-008**: The system MUST show the latest manual verification audit details to authorized admins viewing the user.
- **FR-009**: The system MUST leave the user unchanged if validation fails, authorization fails, or audit recording cannot be completed.
- **FR-010**: The system MUST communicate success and failure states clearly in the admin dashboard.

### Key Entities *(include if feature involves data)*

- **User Account**: The person whose phone verification status may be changed by an admin.
- **Admin Actor**: The authorized staff account performing the manual verification.
- **Manual Phone Verification Audit**: A record of the override action, including target user, verified phone number, actor, reason, and timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authorized admins can manually verify an eligible user's phone in under 60 seconds from the user detail view.
- **SC-002**: 100% of successful manual phone verification actions have a visible audit record with actor, timestamp, phone number, and reason.
- **SC-003**: 100% of attempts without a reason are blocked before changing phone verification status.
- **SC-004**: 100% of unauthorized attempts are rejected without changing the target user's phone verification state.
- **SC-005**: Support can resolve OTP-blocked phone verification cases without asking engineering or database operators to intervene.

## Assumptions

- The manual override is for operational recovery when OTP delivery or confirmation fails, not a replacement for the normal OTP flow.
- Only existing admin dashboard users with account-management authority should perform the override.
- A reason is mandatory because the action bypasses a normal identity proof step.
- Showing the latest manual verification audit on the user detail view is sufficient for the first release.
- Existing user identity and phone fields remain the source of truth for whether a phone is verified.
