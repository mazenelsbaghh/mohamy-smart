# Data Model: Section A Code Fixes

## 1. Administrator Session Gate

- **Purpose**: Represents the current admin dashboard access decision before protected content renders.
- **Core Fields**:
  - `isAuthenticated`: boolean
  - `roles`: string array
  - `isAuthorizedAdmin`: boolean
  - `denialMessage`: nullable string
  - `redirectTarget`: string
- **Validation Rules**:
  - Protected admin content must render only when `isAuthenticated=true` and `roles` includes `Admin`.
  - Unauthorized or unauthenticated states must resolve to an immediate redirect target.
  - Denial feedback must use Arabic user-facing copy when shown in the dashboard.

## 2. Subscription Plan Lifecycle

- **Purpose**: Represents an administratively managed subscription offering that can be sold, edited, and archived.
- **Core Fields**:
  - `planId`: integer
  - `name`: string
  - `features`: string
  - `price`: decimal
  - `aiRequestsLimit`: integer
  - `durationDays`: integer
  - `isActiveForPurchase`: boolean
  - `archivedAt`: nullable datetime
- **Validation Rules**:
  - `name`, `price`, `aiRequestsLimit`, and `durationDays` are required for valid plan creation.
  - Archived plans must not be offered for new purchases.
  - Plans tied to active customer subscriptions cannot be archived until the blocking business condition is cleared.

## 3. Customer Subscription Reference

- **Purpose**: Represents an existing customer-plan relationship used to determine whether a plan can be archived.
- **Core Fields**:
  - `lawyerSubscriptionId`: guid
  - `lawyerId`: guid
  - `planId`: integer
  - `startDate`: datetime
  - `endDate`: datetime
  - `isActive`: boolean
- **Validation Rules**:
  - A plan archive decision must inspect whether any related records are still active.
  - Historical subscriptions must remain readable after the linked plan is archived.

## 4. Contact Request Review Item

- **Purpose**: Represents a business inquiry that can be reviewed and updated by administrators.
- **Core Fields**:
  - `contactRequestId`: guid
  - `name`: string
  - `phone`: string
  - `message`: string
  - `submittedAt`: datetime
  - `status`: `New | Read | Replied`
- **Validation Rules**:
  - `name`, `phone`, and `message` are required for valid submission.
  - `status` may only be one of `New`, `Read`, or `Replied`.
  - Admin filtering must operate on the same canonical status values used for updates.

## 5. Contact Request Collection State

- **Purpose**: Represents the admin dashboard’s list and filter state for contact triage.
- **Core Fields**:
  - `items`: array of contact request review items
  - `selectedStatus`: `All | New | Read | Replied`
  - `isLoading`: boolean
  - `errorMessage`: nullable string
  - `lastSyncedAt`: nullable datetime
- **Validation Rules**:
  - Filtering by one status must return only items with that status.
  - Empty filtered results must be represented as an empty collection, not placeholder records.

## 6. Email Notification Event

- **Purpose**: Represents a business-triggered email attempt for password-recovery fallback or subscription confirmation.
- **Core Fields**:
  - `eventType`: `PasswordResetFallback | SubscriptionConfirmation`
  - `recipientAddress`: string
  - `subject`: string
  - `body`: string
  - `relatedBusinessId`: stable identifier
  - `attemptedAt`: datetime
- **Validation Rules**:
  - Email fallback events may only be triggered for scenarios recognized by the feature scope.
  - Successful delivery does not require a dedicated operational record in this feature.

## 7. Email Delivery Failure Record

- **Purpose**: Represents a failed email attempt that support staff may need to review.
- **Core Fields**:
  - `failureId`: guid or stable identifier
  - `eventType`: `PasswordResetFallback | SubscriptionConfirmation`
  - `relatedBusinessId`: stable identifier
  - `recipientAddress`: string
  - `failureReason`: string
  - `failedAt`: datetime
  - `retryState`: `not_attempted | manual_follow_up`
- **Validation Rules**:
  - Every failed delivery attempt in scope must create one reviewable failure record.
  - Failure records must include enough context to identify the affected business event and recipient.

## 8. Production Incident Capture

- **Purpose**: Represents a production error event captured for operational diagnosis across dashboards and backend.
- **Core Fields**:
  - `incidentId`: provider-generated identifier
  - `sourceArea`: `AdminDashboard | LawyerDashboard | Backend`
  - `environment`: string
  - `message`: string
  - `capturedAt`: datetime
  - `correlationContext`: nullable string
- **Validation Rules**:
  - Incident capture must not block the user-facing workflow from completing its own error handling.
  - Each captured incident must identify at least the source area and timestamp.

## 9. API Reference Entry

- **Purpose**: Represents a documented business endpoint shown in the API reference.
- **Core Fields**:
  - `route`: string
  - `method`: `GET | POST | PUT | PATCH | DELETE`
  - `summary`: string
  - `requestShape`: structured description
  - `responseShape`: structured description
- **Validation Rules**:
  - Covered endpoints in this feature must expose a readable purpose description.
  - Reference content must reflect the active request/response shape used by the endpoint.

## 10. Automated Verification Suite

- **Purpose**: Represents the maintained automated checks added for critical corrected flows in this feature.
- **Core Fields**:
  - `suiteName`: string
  - `surface`: `Backend | AdminDashboard | LawyerDashboard`
  - `coverageFocus`: string
  - `executionCommand`: string
  - `status`: `passing | failing | pending`
- **Validation Rules**:
  - The suite portfolio must cover admin-route behavior, shared auth/request behavior, and plan/contact business rules within this feature scope.
  - Failing suites must block release validation for the corrected flow they protect.
