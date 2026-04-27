# Feature Specification: Phase 1 — Environment & Port Unification

**Feature Branch**: `002-env-port-unification`
**Created**: 2026-04-04
**Status**: Draft
**Input**: User description: "Phase 1 — Environment & Port Unification: توحيد بيئة التطوير المحلي وضمان تشغيل كل جزء على الـ port الصحيح"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend Runs on Port 8976 (Priority: P1)

A developer starts the backend locally and it listens on port 8976 — the designated port
agreed upon in Phase 0. Any attempt by the backend to start on a different port (5025 or
7240) must not succeed silently; it should either fail or be overridden.

**Why this priority**: The backend is the dependency of all frontends. Until it runs on
the correct port, no frontend can connect to it in the local environment. This unblocks
all other stories.

**Independent Test**: Run `cd mohamy-smart-backend && dotnet run` — the console output
must show `Now listening on: http://localhost:8976`. Visiting
`http://localhost:8976/scalar` (or `/swagger`) shows the API docs page.

**Acceptance Scenarios**:

1. **Given** the backend is stopped, **When** a developer runs `dotnet run`,
   **Then** the startup log shows the application is listening on `http://localhost:8976`.
2. **Given** the backend is running on 8976, **When** the developer opens
   `http://localhost:8976/scalar` in a browser, **Then** the API documentation page loads.
3. **Given** port 8976 is already in use, **When** a developer tries to start the backend,
   **Then** the process fails with a clear "port in use" error — it does NOT silently start
   on a different port.

---

### User Story 2 - Lawyer Dashboard Connects to Local Backend (Priority: P2)

A developer starts the Lawyer Dashboard and it runs on port 5078, pointing all API calls
to the local backend at `http://localhost:8976/api`. The current production URL
(`https://api.mohamy-smart.com/api`) must not be used in local development.

The production `.env` file is preserved — a local-override file handles the development URL.
This means the developer can switch between local and production mode without modifying
committed files.

**Why this priority**: The Lawyer Dashboard is 80% complete and has full API integration.
Until it points to local, all development and debugging hits the production server — which
risks corrupting production data.

**Independent Test**: Start the Lawyer Dashboard. Open browser developer tools → Network tab.
Click Login. The request URL must be `http://localhost:8976/api/...` not `https://api.mohamy-smart.com/api/...`.
The login page must render at `http://localhost:5078`.

**Acceptance Scenarios**:

1. **Given** the dev server starts, **When** the developer opens a browser,
   **Then** the Lawyer Dashboard loads at `http://localhost:5078`.
2. **Given** the Lawyer Dashboard is running, **When** any API call is made,
   **Then** the request goes to `http://localhost:8976/api` — confirmed via browser network tab.
3. **Given** port 5078 is already in use, **When** `npm run dev` is executed,
   **Then** the process fails immediately with a port conflict error (no silent port change).
4. **Given** the local backend is running on 8976, **When** the developer submits the login form,
   **Then** the request reaches the local backend and returns a real response (not a network error).

---

### User Story 3 - Admin Dashboard Connects to Local Backend (Priority: P3)

A developer starts the Admin Dashboard and it runs on port 5079, with all future API calls
configured to target `http://localhost:8976/api`. The Admin Dashboard currently has no
environment file at all — this story creates that file and sets the port.

**Why this priority**: The Admin Dashboard API integration work (Phase 3) cannot begin
without an environment file. Creating this file now unblocks the next three phases.

**Independent Test**: Start the Admin Dashboard. Confirm it loads at `http://localhost:5079`.
Confirm a `VITE_API_BASE_URL` environment variable is accessible within the app (can verify
via `console.log(import.meta.env.VITE_API_BASE_URL)` in any component).

**Acceptance Scenarios**:

1. **Given** the dev server starts, **When** the developer opens a browser,
   **Then** the Admin Dashboard loads at `http://localhost:5079`.
2. **Given** the Admin Dashboard is running, **When** the developer checks the configured
   API base URL, **Then** it is `http://localhost:8976/api`.
3. **Given** port 5079 is already in use, **When** `npm run dev` is executed,
   **Then** the process fails immediately (no silent fallback to 5080).
4. **Given** both dashboards are running, **When** the developer checks port assignments,
   **Then** Lawyer Dashboard is on 5078 and Admin Dashboard is on 5079 — no conflict.

---

### User Story 4 - Landing Page Runs on Explicit Port 3000 (Priority: P4)

A developer starts the Landing Page and it explicitly runs on port 3000. The port
assignment is visible in the start command so there is no ambiguity for new developers
joining the project.

**Why this priority**: Next.js already defaults to 3000, so this is the lowest-risk story.
The explicit port configuration mainly benefits documentation and prevents surprise when
a developer runs multiple Next.js projects simultaneously.

**Independent Test**: Run `cd mohamy-smart-landing && npm run dev` — the console must show
`Local: http://localhost:3000` and the landing page loads at that address.

**Acceptance Scenarios**:

1. **Given** the Landing Page dev server starts, **When** the developer checks the output,
   **Then** the URL shown is `http://localhost:3000`.
2. **Given** the developer opens `http://localhost:3000`, **When** the page loads,
   **Then** the full Landing Page renders correctly (hero section, navigation, footer).

---

### User Story 5 - All Four Components Run Simultaneously (Priority: P5)

A developer runs all four components at the same time in separate terminal sessions.
Each component operates independently on its designated port with no conflicts, and the
Lawyer Dashboard successfully communicates with the local backend.

**Why this priority**: This is the final integration validation — the "everything works
together" proof that the environment is correctly unified. Individual stories (US1–US4)
must pass first.

**Independent Test**: Open four terminals, start one component per terminal. All four start
without errors. From the Lawyer Dashboard, clicking any API-dependent feature returns a
real response from the local backend.

**Acceptance Scenarios**:

1. **Given** all four components are started in separate terminals, **When** each finishes
   loading, **Then** all four are available on their designated ports simultaneously.
2. **Given** all four are running, **When** the Lawyer Dashboard makes an authenticated
   API call, **Then** the local backend handles the request and the response reaches the
   frontend (no CORS error, no network error).
3. **Given** all four are running, **When** the Admin Dashboard is opened,
   **Then** it loads at port 5079 without interfering with the Lawyer Dashboard on 5078.

---

### Edge Cases

- What happens if a developer has another service already using port 8976, 5078, 5079,
  or 3000? The `strictPort` configuration must produce an error, not a silent port change.
- What if a developer has the production `.env` loaded and also a `.env.local`? The local
  override file must always win — local development must never accidentally hit production.
- What if the backend fails to start (missing appsettings.Development.json, wrong DB)? The
  frontend should display a "cannot connect to server" error, not crash the browser tab.
- What if a developer runs `npm run dev` in the wrong dashboard directory? Each dashboard
  must have a clear identity (port number, app name in terminal output).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The backend MUST start and listen on `http://localhost:8976` when launched
  for local development. No other port is acceptable.
- **FR-002**: The backend startup script MUST NOT launch a browser automatically (the
  `launchBrowser` setting must be disabled or set to false for local dev to avoid
  cluttering developer workflow).
- **FR-003**: The Lawyer Dashboard MUST load at `http://localhost:5078` and all API requests
  MUST target `http://localhost:8976/api` when running locally.
- **FR-004**: The local API base URL configuration MUST override the production URL without
  modifying the committed production environment file.
- **FR-005**: The Admin Dashboard MUST load at `http://localhost:5079` and its environment
  configuration MUST include `VITE_API_BASE_URL=http://localhost:8976/api`.
- **FR-006**: The Landing Page MUST load at `http://localhost:3000` and the port MUST be
  explicitly declared in the start script — not relying on framework defaults.
- **FR-007**: All four components MUST be independently startable — starting one component
  MUST NOT require any other component to be running first.
- **FR-008**: Each dashboard MUST fail fast (non-zero exit) if its designated port is already
  occupied — silent port fallback is forbidden.
- **FR-009**: A `.env.example` file MUST exist for each component that uses environment
  variables, committed to version control, so new developers know what to create.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four components start on their designated ports within 60 seconds of
  running their start commands, with zero manual configuration steps beyond following
  the setup guide.
- **SC-002**: A developer can run all four components simultaneously on the same machine
  without any port conflict or startup error.
- **SC-003**: 100% of API requests from the Lawyer Dashboard target the local backend
  (`localhost:8976`) when a `.env.local` override is in place — verified via browser
  network tab showing zero requests to the production domain.
- **SC-004**: A developer with a fresh clone can get all four components running in under
  15 minutes by following the setup guide (Port Unification section).
- **SC-005**: Zero production API calls are made from any dashboard during local development
  sessions after this phase is complete.

## Assumptions

- Phase 0 is complete: all port decisions are confirmed (DEC-001) and the canonical ports
  (8976, 5078, 5079, 3000) are non-negotiable.
- `appsettings.Development.json` with real credentials exists locally (created in Phase 0)
  so the backend can actually start and connect to the database.
- The backend's Serilog and other configuration in `appsettings.json` is already correct
  from Phase 0 — this phase only changes the port.
- Local development is HTTP only (no HTTPS certificate setup needed). HTTPS is for
  production deployments only.
- The `.env` file in the Lawyer Dashboard retains the production URL as its value — the
  local override uses a separate `.env.local` file that Vite loads with higher priority.
  This prevents accidental overwrite of the production URL on commit.
- The Admin Dashboard has no existing `.env` file — one will be created fresh in this phase.
- `strictPort: true` is the intended behavior for both dashboards — a port conflict is an
  error to fix, not a problem to work around by using the next available port.
