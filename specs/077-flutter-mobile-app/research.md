# Research: Mohamy Smart Mobile App

## Decision: Build a standalone Flutter app under `apps/mohamy_smart_mobile`

**Rationale**: The repository already uses `apps/` for top-level products. A standalone Flutter app keeps mobile concerns isolated from React dashboards and .NET backend layers while preserving monorepo organization.

**Alternatives considered**:
- Add mobile screens to existing React app: rejected because the user requested Flutter.
- Create mobile app outside `apps/`: rejected because the user explicitly requested `apps/`.

## Decision: Use built-in Flutter state and routing for the MVP

**Rationale**: The app needs to be implemented and tested quickly with low dependency risk. A single `AppState` and Material navigation are sufficient for deterministic MVP flows, widget tests, auth gating, search, forms, and theme toggling.

**Alternatives considered**:
- Riverpod/Bloc/go_router: strong future options, but add dependency and setup overhead for the initial mobile scaffold.
- Ad hoc state inside every screen: rejected because theme/auth/navigation/search state needs predictable tests.

## Decision: Use local deterministic repository data behind a repository boundary

**Rationale**: The mobile app must be runnable and testable now. A repository boundary enables complete UI flows and tests without requiring live credentials, API availability, or backend schema changes. This also keeps demo data out of UI widgets.

**Alternatives considered**:
- Real API only: rejected for this scaffold because API contracts for Flutter authentication/session refresh/file upload/payment are not finalized in this feature.
- Hardcoded data inside screens: rejected because it violates maintainability and would make API replacement harder.

## Decision: Arabic RTL and theme parity from the root app

**Rationale**: The product constitution requires Arabic-first UX. The app root will set Arabic locale, RTL direction, Tajawal font family declaration, and light/dark themes based on Mohamy Smart design tokens.

**Alternatives considered**:
- Per-screen RTL wrappers: rejected because it is error-prone.
- Light mode only: rejected because product principles require dark mode parity.

## Decision: Widget and unit tests focus on launch, navigation, case search, and validation

**Rationale**: These tests directly prove the critical user outcomes from the spec and catch regressions in the app shell and case module.

**Alternatives considered**:
- Screenshot testing: useful later but more brittle for this first scaffold.
- End-to-end simulator tests: deferred because widget tests provide faster feedback in the current repository workflow.

