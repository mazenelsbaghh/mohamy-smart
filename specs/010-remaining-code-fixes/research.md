# Phase 0: Outline & Research

## Decision 1: Local dashboard safety must be solved with environment files plus host binding

- **Decision**: Use per-dashboard `.env.local` files for `VITE_API_BASE_URL=http://localhost:8976/api` and update both Vite dev servers to bind to `0.0.0.0`.
- **Rationale**: The constitution already defines canonical local ports and explicitly requires environment-driven API base URLs plus host binding for Docker/external runtime access. This avoids hidden production-target defaults and keeps local runtime behavior predictable.
- **Alternatives considered**: Hardcoding local URLs in component code (violates API-first and environment consistency rules), relying on developers to export shell variables manually each time (too error-prone for onboarding and daily use).

## Decision 2: Admin settings should reuse the existing account self-service profile endpoints

- **Decision**: The Admin Settings page should use `GET /api/account/profile` and `PUT /api/account/profile` for profile data, and should use `PUT /api/account/change-password` for password changes.
- **Rationale**: The backend already exposes these authenticated contracts on `AccountController`, and the lawyer dashboard already models matching settings thunks against the same route family. Reusing the existing contracts reduces duplicate backend work and keeps account self-service concerns consolidated.
- **Alternatives considered**: Adding a second profile surface under `AuthController` (duplicates behavior and increases maintenance risk), using admin-only user-management routes for self-service settings (wrong authorization boundary and resource shape).

## Decision 3: Notification delivery for this phase is in-app only and scoped to authenticated account management

- **Decision**: Plan NotificationController as an in-app notification management surface that supports fetch, mark-one-read, mark-all-read, and delete for the current authenticated account only.
- **Rationale**: The constitution still lists broader notification delivery as undecided, but the source plan only requires management endpoints. Limiting the scope to persisted in-app notifications resolves the immediate product gap without forcing a push or outbound delivery choice.
- **Alternatives considered**: Blocking the feature until a push strategy is chosen (unnecessary for the stated scope), designing a cross-channel notification platform now (too broad for a remaining-fixes phase).

## Decision 4: Notification persistence needs a domain correction before endpoint work

- **Decision**: Treat notification persistence as part of this feature’s backend design work by wiring the existing `Notification` model into `AppDbContext`, validating identifier consistency, and exposing DTOs/services from the current Clean Architecture layers.
- **Rationale**: The codebase already contains `Lawyer.Core/Models/Notification.cs`, but it is not yet registered in the DbContext and currently mixes GUID base identity with integer fields. Planning around that mismatch explicitly prevents endpoint work from being built on an unstable domain contract.
- **Alternatives considered**: Creating controller logic directly against an unregistered model (would fail at persistence time), inventing an unrelated notification table only for this feature (would fragment the domain).

## Decision 5: Contact intake should prioritize durable submission over immediate admin UI polish

- **Decision**: Implement contact intake as a persisted business record submitted from the landing page through `POST /api/contact/submit`, with storage and review-readiness treated as the success condition for this phase.
- **Rationale**: The source plan explicitly selects the DB-backed option, and the feature spec only requires that valid submissions become available for business review. Durable persistence and clear visitor feedback deliver that value now while keeping the downstream admin review surface free to evolve independently.
- **Alternatives considered**: Email-only contact delivery (contradicts the chosen DB-backed direction), building a full admin review UI before submission works reliably (inverts delivery order and delays lead capture).

## Decision 6: Dashboard resilience should use lightweight recovery states, not a new global UX system

- **Decision**: Add shared `ErrorBoundary` components to both dashboards and a dedicated `NotFoundPage` to the admin router as the minimal resilience layer for this phase.
- **Rationale**: The source plan asks for explicit fallback and 404 behavior, and the current dashboards do not need a broader app-shell redesign to satisfy that requirement. A small, shared fallback layer addresses the failure mode directly.
- **Alternatives considered**: Leaving runtime failures to React’s default crash behavior (poor UX), introducing a full design-system-level state framework as part of a code-fixes phase (too broad).
