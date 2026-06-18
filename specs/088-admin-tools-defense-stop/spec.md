# Feature Specification: Admin Tools & Defense Analysis Stop

**Feature Branch**: `088-admin-tools-defense-stop`  
**Created**: 2026-06-18  
**Status**: Draft  
**Input**: User description: "Admin tools: adjust AI points by amount, change lawyer password, stop defense analysis button"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Adjusts Lawyer AI Points (Priority: P1)

The admin opens a lawyer's detail page in the admin dashboard and needs to increase or decrease the lawyer's available AI points by a specific amount. The admin clicks an "Adjust Points" button, enters a positive or negative number (e.g., +100 or -50), sees the projected new balance, and confirms the change. The system updates the balance and shows a success notification.

**Why this priority**: AI points directly affect the lawyer's ability to use AI features. Admins frequently need to adjust points for support, promotions, or corrections.

**Independent Test**: Can be fully tested by navigating to any lawyer's detail page, clicking "Adjust Points", entering an amount, and verifying the balance changes correctly.

**Acceptance Scenarios**:

1. **Given** admin is on a lawyer's detail page showing current AI balance of 50, **When** admin clicks "تعديل النقاط", enters +100, and confirms, **Then** the balance updates to 150 and a success toast appears.
2. **Given** admin is on a lawyer's detail page showing current AI balance of 50, **When** admin clicks "تعديل النقاط", enters -30, and confirms, **Then** the balance updates to 20 and a success toast appears.
3. **Given** admin enters a negative amount that would result in a balance below zero, **When** admin tries to confirm, **Then** the system prevents the operation and shows a validation error: "لا يمكن أن يكون الرصيد أقل من صفر".
4. **Given** admin enters zero or non-numeric input, **When** admin tries to confirm, **Then** the system shows a validation error.

---

### User Story 2 - Admin Changes Lawyer Password (Priority: P1)

The admin opens a lawyer's detail page and needs to reset the lawyer's password. The admin clicks a "Change Password" button, enters a new password (minimum 8 characters), and confirms. The system updates the password immediately.

**Why this priority**: Password resets are a critical admin support function. Lawyers who lose access need immediate help.

**Independent Test**: Can be fully tested by navigating to any lawyer's detail page, clicking "تغيير كلمة المرور", entering a new password, and verifying the lawyer can log in with the new password.

**Acceptance Scenarios**:

1. **Given** admin is on a lawyer's detail page, **When** admin clicks "تغيير كلمة المرور", enters "NewPass123" (≥8 chars), and confirms, **Then** the password is changed and a success toast appears.
2. **Given** admin enters a password shorter than 8 characters, **When** admin tries to confirm, **Then** the system shows a validation error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل".
3. **Given** admin opens the change password modal, **When** admin clicks cancel, **Then** no changes are made.

---

### User Story 3 - Lawyer Stops Parallel Defense Analysis (Priority: P2)

A lawyer is on the defense memo page (DefensesList step) and has triggered "Analyze All Defenses" (تحليل كل الدفوع). While the parallel analysis is running, the lawyer sees a "Stop Analysis" button. Clicking it stops submitting new defense analyses. Defenses already analyzed remain saved.

**Why this priority**: Without a stop button, the lawyer has no way to cancel a long-running parallel analysis. If they started analysis by mistake or want to modify defenses, they must wait for all analyses to complete.

**Independent Test**: Can be fully tested by starting parallel defense analysis with multiple defenses, clicking stop mid-way, and verifying that completed analyses are preserved while remaining ones are not submitted.

**Acceptance Scenarios**:

1. **Given** lawyer has started parallel defense analysis on 8 defenses and 3 are completed, **When** lawyer clicks "إيقاف تحليل الدفوع", **Then** analysis stops, the 3 completed analyses are preserved, and the remaining 5 are not submitted.
2. **Given** parallel defense analysis is not running, **When** lawyer views the DefensesList, **Then** the stop button is not visible.
3. **Given** lawyer stops the analysis, **When** they click "تحليل كل الدفوع" again, **Then** only the un-analyzed defenses are submitted for analysis.

---

### Edge Cases

- What happens when the admin tries to adjust points for a lawyer with no active subscription? → Show an error: "لا يوجد اشتراك نشط لهذا المحامي".
- What happens when the admin enters a very large point value (e.g., +999999)? → Allow it; admin has full authority.
- What happens if the backend request to change password fails? → Show error toast with the backend error message.
- What happens if all defenses are already analyzed when stop is clicked? → Button disappears since analysis is complete; no action needed.
- What happens if the lawyer navigates away during analysis? → Already-submitted jobs continue on the backend; stop only prevents new frontend submissions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to adjust a lawyer's AI point balance by a positive or negative integer amount.
- **FR-002**: System MUST NOT allow the resulting balance to go below zero.
- **FR-003**: System MUST display the current balance and projected new balance before confirmation.
- **FR-004**: System MUST allow admins to change a lawyer's password to a new password of their choice.
- **FR-005**: System MUST enforce a minimum password length of 8 characters.
- **FR-006**: System MUST display a "Stop Defense Analysis" button in the DefensesList component when parallel analysis is running.
- **FR-007**: System MUST stop submitting new defense analysis jobs when the stop button is clicked.
- **FR-008**: System MUST preserve all defense analyses that completed before the stop was triggered.
- **FR-009**: Both admin actions (points and password) MUST require admin authentication and authorization.
- **FR-010**: System MUST show appropriate success/error toasts for all operations.

### Key Entities

- **LawyerSubscription**: Holds `UsedAiRequests` (integer) which tracks consumed AI points. Linked to `Subscriptions.AiRequestsLimit` for the total limit.
- **AspNetUsers**: Standard ASP.NET Identity user table. Password is managed through `UserManager<ApplicationUser>`.
- **ParallelDefenseTracking**: Frontend-only Redux state tracking `{ total, completed, failed }` for in-progress parallel analysis.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can adjust AI points for any lawyer in under 10 seconds from the detail page.
- **SC-002**: Admin can change any lawyer's password in under 10 seconds from the detail page.
- **SC-003**: Lawyer can stop a running parallel defense analysis within 1 second of clicking the stop button.
- **SC-004**: All completed defense analyses are preserved after stopping (zero data loss).
- **SC-005**: Both admin operations show immediate visual feedback (toast notifications).

## Assumptions

- The admin dashboard lawyer detail page already exists (feature 070-lawyer-detail-profile).
- The `LawyerSubscription` entity and `UsedAiRequests` column already exist in the database.
- ASP.NET Identity's `UserManager` is already configured in the backend for password management.
- The frontend parallel defense tracking state (`ParallelDefenseTracking`) already exists in Redux.
- No audit log is required for this iteration (can be added later).
- No email/SMS notification is sent to the lawyer when their password is changed or points are adjusted.
