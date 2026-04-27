# Feature Specification: Phase 4 — Admin Dashboard: Auth & Guards

**Feature Branch**: `005-admin-auth-guards`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Phase 4 — Admin Dashboard: Auth & Guards"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Route Protection (Priority: P1)

An unauthenticated visitor attempts to access a secure page in the Admin Dashboard (e.g., the home dashboard, lawyer reviews, or reports). They are immediately intercepted by a route guard and redirected to the login page without seeing any protected information. Conversely, an authenticated admin user can browse these protected pages smoothly.

**Why this priority**: Security is the highest priority per Principle I and III. Establishing the "wall" around the admin console guarantees that no sensitive data or actions are exposed to the public web before any actual dashboards are populated.

**Independent Test**: Navigate to a protected URL directly. It should instantly redirect to login.

**Acceptance Scenarios**:

1. **Given** a user with no valid login session, **When** they navigate directly to `/admin/lawyers`, **Then** the application instantly redirects them to `/auth/login`.
2. **Given** an authenticated admin user, **When** they navigate to `/admin/lawyers`, **Then** the application grants access and renders the page normally.

---

### User Story 2 - Public Authentication Routing (Priority: P2)

An already authenticated admin user clicks a bookmark that points to the login page (`/auth/login`). Because they are already logged in, the application detects their active session and redirects them to the main admin dashboard home instead of showing them the redundant login form.

**Why this priority**: Improves user experience and prevents edge cases where users attempt to log in over an existing active session.

**Independent Test**: Keep the user logged in, then manually type the login page URL into the browser. It should redirect to the dashboard home page.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they navigate directly to `/auth/login`, **Then** the application redirects them to the secure dashboard home page (e.g., `/admin`).

---

### User Story 3 - Admin Role Verification (Priority: P3)

A user logs in correctly, but their account only has standard "Lawyer" privileges rather than "Admin" privileges. Even though they hold a valid JWT, the admin route guard inspects the roles embedded inside the token claims and rejects their access to the Admin Dashboard, forcing a logout or an unauthorized error.

**Why this priority**: Enforces Principle III (Role-Based Authorization), ensuring isolated platform segments where only verified administrators can view the back-office tools.

**Independent Test**: Inject a generated mock JWT containing `Role: Lawyer` into localStorage and attempt to load the admin dashboard. The guard must block the render.

**Acceptance Scenarios**:

1. **Given** a user holds a valid JWT token that lacks the `Admin` role in its claims, **When** they attempt to access any Admin Dashboard page, **Then** they are blocked and redirected to the `/auth/login` page (and optionally shown an "Unauthorized" notification).

---

### Edge Cases

- What happens if the JWT token expires while the user is actively navigating between protected pages? The Axios interceptor handles refresh logic, but if the refresh fails, the route guard or the global app state should trigger the logout workflow redirecting them to login securely.
- What happens if the `localStorage` is manually wiped mid-session? The next navigation event should catch the missing token and trigger a redirect to login.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Admin Dashboard MUST implement a protected wrapper component (`AdminRoute` or similar) wrapping all secure dashboard pages.
- **FR-002**: The route guard MUST verify the presence of an active authentication session (via the Redux `auth` state created in Phase 3).
- **FR-003**: The route guard MUST verify that the user identity includes the `Admin` role by reading the decoded JWT claims or the user profile loaded into the state, without requiring an additional network request.
- **FR-004**: If the session is missing or the role requirement is not met, the user MUST be redirected to `/auth/login`.
- **FR-005**: The Admin Dashboard MUST implement a public restriction wrapper component (`PublicRoute` or similar) wrapping `/auth/login` to redirect actively authenticated admins away from the authentication screens.

### Key Entities

- **JWT Token**: The encoded string containing the user's claims, crucially the `role` (Admin vs. Lawyer).
- **Auth State**: The global state container retaining the `isAuthenticated` boolean and the user profile schema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of routes within the admin dashboard segment cannot be loaded or rendered without an actively verified admin session.
- **SC-002**: Verification of user roles happens within less than 50ms (on the client-side without a round trip) preserving rapid client-side routing speeds.
- **SC-003**: An authenticated admin user naturally retains access bounds even across full page refresh events.

## Assumptions

- Phase 3 structure (Axios + Redux auth state) is successfully established and actively managing `admin_accessToken` and user state.
- React Router 6+ is utilized as the primary routing engine for the application layout.
- The user's role array is accurately mapped within the `authSlice.user` Redux state or can be synchronously parsed from the active token payload.
