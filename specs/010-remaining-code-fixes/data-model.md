# Data Model: Phase A Remaining Code Fixes

## 1. Local Dashboard Environment

- **Purpose**: Represents the runtime configuration each dashboard needs to talk to the correct local backend during development.
- **Core Fields**:
  - `apiBaseUrl`: string
  - `dashboardPort`: number
  - `hostBinding`: string
  - `environmentName`: `local | docker-local`
- **Validation Rules**:
  - `apiBaseUrl` must point to the canonical local backend origin for development.
  - `dashboardPort` must match the constitution-defined port for the dashboard.
  - `hostBinding` must allow access from the intended local runtime environment.

## 2. Admin Profile

- **Purpose**: The authenticated administrator’s account information displayed and edited in the Admin Settings page.
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
  - `fullName`, `email`, and `phoneNumber` are required for a valid profile payload.
  - Read-only UI placeholders must not be used once profile data has loaded.
  - A successful update must return the persisted profile shape used by the settings page.

## 3. Password Change Request

- **Purpose**: Captures an authenticated account’s request to replace the current password from the settings experience.
- **Core Fields**:
  - `currentPassword`: string
  - `newPassword`: string
  - `confirmPassword`: string
- **Validation Rules**:
  - `currentPassword` must match the account’s existing password.
  - `newPassword` and `confirmPassword` must match.
  - Validation failures must be returned in a form the dashboard can map to clear Arabic feedback.

## 4. Notification Item

- **Purpose**: A persisted in-app notification belonging to one authenticated user and manageable from notification workflows.
- **Core Fields**:
  - `notificationId`: stable identifier
  - `receiverId`: account or profile identifier bound to the current user
  - `title`: string
  - `message`: string
  - `type`: categorized notification type
  - `isRead`: boolean
  - `createdAt`: datetime
- **Validation Rules**:
  - Each notification must belong to exactly one authenticated recipient.
  - Read and delete actions must reject requests for notifications outside the current user’s ownership.
  - Mark-all-read updates only the current user’s unread items.

## 5. Notification Collection State

- **Purpose**: Represents the current user’s visible notification inbox state.
- **Core Fields**:
  - `items`: array of notification items
  - `unreadCount`: number
  - `lastSyncedAt`: datetime
  - `state`: `loaded | empty | error`
- **Validation Rules**:
  - `unreadCount` must equal the number of items where `isRead=false`.
  - Empty states must return an empty collection, not placeholder records.

## 6. Contact Request

- **Purpose**: A business inquiry submitted by a public visitor from the landing page.
- **Core Fields**:
  - `contactRequestId`: stable identifier
  - `name`: string
  - `phone`: string
  - `message`: string
  - `submittedAt`: datetime
  - `status`: `submitted | reviewed | archived`
- **Validation Rules**:
  - `name`, `phone`, and `message` are required for acceptance.
  - Accepted submissions must be durably persisted before the visitor receives a success confirmation.
  - Rejected submissions must return a clear validation or failure result and must not create partial records.

## 7. Dashboard Error State

- **Purpose**: Represents an unexpected UI failure captured by a dashboard-level error boundary.
- **Core Fields**:
  - `hasError`: boolean
  - `errorMessage`: nullable string
  - `recoveryAction`: `reload`
- **Validation Rules**:
  - A captured error must render a visible fallback state.
  - The fallback state must allow the user to attempt recovery without leaving a blank screen.

## 8. Route Resolution State

- **Purpose**: Represents whether an attempted dashboard route is valid or unresolved.
- **Core Fields**:
  - `path`: string
  - `state`: `matched | not_found`
  - `returnTarget`: string
- **Validation Rules**:
  - Unknown admin routes must resolve to a visible 404 page.
  - The 404 page must provide a clear navigation path back to the main dashboard.
