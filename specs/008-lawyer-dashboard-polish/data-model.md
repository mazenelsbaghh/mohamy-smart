# Data Model: Lawyer Dashboard Fixes and Polish

## 1. Lawyer Session State

- **Purpose**: Represents the frontend-visible authentication lifecycle while the lawyer is using protected routes.
- **Core Fields**:
  - `accessTokenPresent`: boolean
  - `refreshTokenPresent`: boolean
  - `status`: `authenticated | refreshing | signed_out`
  - `queuedRequestCount`: number
  - `lastFailureReason`: nullable string
- **Validation Rules**:
  - Only one `refreshing` session cycle may exist at a time.
  - A failed refresh transitions the state to `signed_out`.
  - Pending requests may only resume after a successful refresh.
- **State Transitions**:
  - `authenticated -> refreshing` on first protected 401
  - `refreshing -> authenticated` on successful refresh and replay
  - `refreshing -> signed_out` on failed refresh

## 2. Lawyer Profile

- **Purpose**: Self-service account details displayed and edited from settings.
- **Core Fields**:
  - `lawyerId`: guid
  - `applicationUserId`: guid
  - `fullName`: string
  - `email`: string
  - `phoneNumber`: string
  - `officeName`: nullable string
  - `address`: nullable string
  - `profileImageUrl`: nullable string
- **Validation Rules**:
  - `fullName`, `email`, and `phoneNumber` are required for a complete profile response.
  - Edited fields must return field-level validation failures instead of silent rejection.
  - Password changes are modeled separately and must not mutate unrelated profile fields.

## 3. Password Change Request

- **Purpose**: Captures a lawyer-initiated password update from settings.
- **Core Fields**:
  - `currentPassword`: string
  - `newPassword`: string
  - `confirmPassword`: string
- **Validation Rules**:
  - `currentPassword` must match the existing account password.
  - `newPassword` and `confirmPassword` must match.
  - Validation errors must be returned in a way the settings form can map to Arabic feedback.

## 4. Subscription Status

- **Purpose**: Represents the lawyer’s current subscription state and visible entitlements.
- **Core Fields**:
  - `lawyerSubscriptionId`: guid
  - `planId`: number
  - `planName`: string
  - `isActive`: boolean
  - `startDate`: datetime
  - `endDate`: datetime
  - `usedAiRequests`: number
  - `aiRequestLimit`: number
  - `renewalState`: `active | pending_payment | expired | inactive`
- **Validation Rules**:
  - A lawyer can have at most one active visible subscription at a time.
  - `usedAiRequests` must not exceed `aiRequestLimit` in successful responses.
  - `renewalState` must reflect payment outcomes and expiry consistently.

## 5. Subscription Plan Option

- **Purpose**: Sellable plan data shown in the subscription section.
- **Core Fields**:
  - `id`: number
  - `name`: string
  - `price`: decimal
  - `durationDays`: number
  - `aiRequestsLimit`: number
  - `features`: array of strings
  - `isSelectable`: boolean
- **Validation Rules**:
  - `price` must be greater than zero.
  - `durationDays` must be greater than zero.
  - `features` may be empty but should not be rendered as raw serialized JSON.

## 6. Payment Attempt

- **Purpose**: Tracks a single subscription payment attempt and its result.
- **Core Fields**:
  - `paymentId`: guid
  - `lawyerId`: guid
  - `planId`: number
  - `paymentMethod`: `card | wallet`
  - `status`: `pending | success | failed | expired`
  - `amount`: decimal
  - `paymentUrl`: nullable string
  - `transactionId`: nullable string
  - `createdAt`: datetime
  - `processedAt`: nullable datetime
- **Validation Rules**:
  - Duplicate active pending attempts for the same lawyer and plan should be blocked or surfaced predictably.
  - Only successful attempts may activate or renew a subscription.
  - A failed or expired attempt must not mutate subscription entitlements.

## 7. Document Record

- **Purpose**: A lawyer-facing document artifact shown in the Documents page.
- **Core Fields**:
  - `documentId`: guid
  - `caseId`: nullable guid
  - `title`: string
  - `sourceType`: `uploaded_file | ocr_extract | generated_case_artifact`
  - `fileType`: string
  - `createdAt`: datetime
  - `previewUrl`: nullable string
  - `downloadUrl`: nullable string
  - `extractedTextSnippet`: nullable string
  - `availabilityState`: `available | processing | failed`
- **Validation Rules**:
  - Records must belong to the authenticated lawyer either directly or through a related case.
  - `processing` items must not masquerade as complete documents.
  - Empty results return an empty collection, not placeholder records.

## 8. Legal Contract Record

- **Purpose**: A lawyer-facing legal contract entry for the Legal Contracts page.
- **Core Fields**:
  - `contractId`: guid
  - `contractType`: string
  - `clientName`: string
  - `status`: `draft | in_review | active | archived | unsupported`
  - `createdAt`: datetime
  - `lastUpdatedAt`: nullable datetime
  - `detailAvailable`: boolean
- **Validation Rules**:
  - If contract capability is not implemented for the lawyer context, the page should return an unsupported state rather than fake records.
  - `detailAvailable=false` items may appear in lists but cannot imply a working drill-down flow.

## 9. Chat Conversation

- **Purpose**: Represents a conversational exchange between a lawyer and the AI assistant.
- **Core Fields**:
  - `conversationId`: guid
  - `messages`: array of `ChatMessage`
  - `availabilityState`: `available | unavailable | quota_exceeded | error`
  - `lastUpdatedAt`: datetime

### Chat Message

- **Core Fields**:
  - `messageId`: guid
  - `role`: `user | assistant | system`
  - `content`: string
  - `createdAt`: datetime
- **Validation Rules**:
  - User messages must preserve input order.
  - Failed assistant responses must not erase the user’s pending text.
  - Availability and quota failures must be distinguishable from transport errors.
