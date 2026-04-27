# Tasks: Phase 1 — Environment & Port Unification

**Input**: Design documents from `/specs/002-env-port-unification/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup tasks needed — all project structure already exists. All config files, `.gitignore` entries, `.env.example` files, port assignments in `vite.config.ts`, and the Next.js `-p 3000` flag are already correctly configured from Phase 0.

**Checkpoint**: ✅ Setup already complete — proceed directly to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix the 3 remaining configuration violations that block all user stories. These are the only code changes in this entire feature.

**⚠️ CRITICAL**: No user story verification can begin until these 3 fixes are applied.

- [x] T001 [P] Set `launchBrowser` to `false` in `mohamy-smart-backend/Lawyer/Properties/launchSettings.json`

  **What to do**: Open the file `mohamy-smart-backend/Lawyer/Properties/launchSettings.json`. Find the line that says `"launchBrowser": true` and change it to `"launchBrowser": false`. Do not change anything else in the file.

  **Current file content (entire file)**:
  ```json
  {
    "$schema": "https://json.schemastore.org/launchsettings.json",
    "profiles": {
      "http": {
        "commandName": "Project",
        "dotnetRunMessages": true,
        "launchBrowser": true,
        "launchUrl": "scalar",
        "applicationUrl": "http://localhost:8976",
        "environmentVariables": {
          "ASPNETCORE_ENVIRONMENT": "Development"
        }
      }
    }
  }
  ```

  **Expected file content after change (entire file)**:
  ```json
  {
    "$schema": "https://json.schemastore.org/launchsettings.json",
    "profiles": {
      "http": {
        "commandName": "Project",
        "dotnetRunMessages": true,
        "launchBrowser": false,
        "launchUrl": "scalar",
        "applicationUrl": "http://localhost:8976",
        "environmentVariables": {
          "ASPNETCORE_ENVIRONMENT": "Development"
        }
      }
    }
  }
  ```

  **Why**: FR-002 requires the backend to NOT open a browser automatically when `dotnet run` is executed. This prevents cluttering the developer's browser with unwanted tabs.

  **Verify**: Run `cd mohamy-smart-backend/Lawyer && dotnet run` — the browser should NOT open automatically.

---

- [x] T002 [P] Remove hardcoded `localhost:5000` fallback from `mohamy-smart-lawyer-dashboard/src/APIs/api.ts`

  **What to do**: Open the file `mohamy-smart-lawyer-dashboard/src/APIs/api.ts`. Go to **line 18**. Find this exact line:
  ```typescript
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  ```
  Replace it with this exact line:
  ```typescript
      baseURL: import.meta.env.VITE_API_BASE_URL,
  ```

  **Do NOT change any other line in this file.** The rest of the file (token helpers, interceptors, etc.) must remain exactly as-is.

  **Why**: The fallback `'http://localhost:5000'` is a stale URL from an older config. If the `.env` file is missing or `VITE_API_BASE_URL` is not set, the app would silently send API requests to the wrong port. Removing the fallback means the app will show a clear error instead of silently misrouting requests. Constitution Principle II forbids hardcoded API URLs.

  **Verify**: After the change, check that `mohamy-smart-lawyer-dashboard/.env` exists and contains `VITE_API_BASE_URL=http://localhost:8976/api`. Then run `cd mohamy-smart-lawyer-dashboard && npm run dev`. Open browser DevTools → Network tab → any API call should target `http://localhost:8976/api`.

---

- [x] T003 [P] Remove hardcoded `localhost:5173` fallback from `mohamy-smart-backend/Lawyer/Controllers/PaymentController.cs`

  **What to do**: Open the file `mohamy-smart-backend/Lawyer/Controllers/PaymentController.cs`. Go to **line 60**. Find this exact line:
  ```csharp
  			var frontendBaseUrl = _configuration["FrontendBaseUrl"] ?? "http://localhost:5173";
  ```
  Replace it with these exact lines:
  ```csharp
  			var frontendBaseUrl = _configuration["FrontendBaseUrl"]
  				?? throw new InvalidOperationException("FrontendBaseUrl is not configured in appsettings.json. Add \"FrontendBaseUrl\": \"http://localhost:5078\" to your configuration.");
  ```

  **Do NOT change any other line in this file.** The rest of the file (HMAC verification, redirects, etc.) must remain exactly as-is.

  **Why**: The fallback `"http://localhost:5173"` is a stale Vite default port. The correct Lawyer Dashboard port is 5078. Instead of updating the fallback to `5078`, we remove the fallback entirely so that a missing config causes a clear exception. The value `"FrontendBaseUrl": "http://localhost:5078"` is already correctly set in `mohamy-smart-backend/Lawyer/appsettings.json`, so this exception will never fire in normal usage.

  **Verify**: Check that `mohamy-smart-backend/Lawyer/appsettings.json` contains `"FrontendBaseUrl": "http://localhost:5078"`. Then run `cd mohamy-smart-backend/Lawyer && dotnet build` — should compile without errors.

---

**Checkpoint**: ✅ All 3 foundational fixes are complete. User story verification can begin.

---

## Phase 3: User Story 1 — Backend Runs on Port 8976 (Priority: P1) 🎯 MVP

**Goal**: Verify the backend starts and listens on port 8976, does not open a browser, and fails fast if port is occupied.

**Independent Test**: Run `cd mohamy-smart-backend/Lawyer && dotnet run` — console must show `Now listening on: http://localhost:8976`. Visit `http://localhost:8976/scalar` — API docs page must load.

### Implementation for User Story 1

- [x] T004 [US1] Verify backend starts on port 8976 by running `cd mohamy-smart-backend/Lawyer && dotnet run`

  **What to do**: This is a **verification-only** task — no code changes needed. All code changes were done in T001. Run the following steps:

  1. Open a terminal
  2. Run: `cd mohamy-smart-backend/Lawyer && dotnet run`
  3. Check the console output — it MUST contain: `Now listening on: http://localhost:8976`
  4. Check that a browser did NOT open automatically (T001 fix)
  5. Open a browser and navigate to `http://localhost:8976/scalar`
  6. Confirm the Scalar API documentation page loads successfully
  7. Stop the backend with `Ctrl+C`

  **Expected result**: All 3 checks pass. If the backend fails to start (e.g., missing `appsettings.Development.json`), that is a prerequisite issue from Phase 0, not a bug in this feature.

**Checkpoint**: ✅ US1 complete — backend runs on canonical port 8976.

---

## Phase 4: User Story 2 — Lawyer Dashboard Connects to Local Backend (Priority: P2)

**Goal**: Verify the Lawyer Dashboard runs on port 5078, sends all API calls to `localhost:8976/api`, and fails fast if port is occupied.

**Independent Test**: Start the Lawyer Dashboard. Open DevTools → Network tab. Make any API call (e.g., login). The request URL must be `http://localhost:8976/api/...`.

### Implementation for User Story 2

- [x] T005 [US2] Verify Lawyer Dashboard runs on port 5078 and API calls target local backend

  **What to do**: This is a **verification-only** task — all code changes were done in T002. Run the following steps:

  1. Ensure the backend is running on port 8976 (from US1)
  2. Open a new terminal
  3. Run: `cd mohamy-smart-lawyer-dashboard && npm run dev`
  4. Check the console output — it MUST contain a URL with `:5078`
  5. Open `http://localhost:5078` in a browser — the Lawyer Dashboard must load
  6. Open browser DevTools → Network tab
  7. Try to log in (or trigger any API call)
  8. Check the network request URL — it MUST target `http://localhost:8976/api/...`
  9. Confirm NO requests go to `https://api.mohamy-smart.com` or `localhost:5000`
  10. Stop the dashboard with `Ctrl+C`

  **Expected result**: Dashboard loads on 5078, all API calls go to localhost:8976.

- [x] T006 [US2] Verify Lawyer Dashboard fails fast when port 5078 is occupied

  **What to do**: This is a **verification-only** task. Run the following steps:

  1. Start the Lawyer Dashboard: `cd mohamy-smart-lawyer-dashboard && npm run dev`
  2. Wait for it to fully start on port 5078
  3. Open another terminal and try to start it again: `cd mohamy-smart-lawyer-dashboard && npm run dev`
  4. The second instance MUST fail with a port conflict error
  5. It must NOT silently start on port 5079 or any other port
  6. Stop both instances

  **Expected result**: The second instance exits with a non-zero code and shows a "port already in use" error. This is guaranteed by `strictPort: true` in `vite.config.ts`.

**Checkpoint**: ✅ US2 complete — Lawyer Dashboard on 5078, API→8976, strictPort works.

---

## Phase 5: User Story 3 — Admin Dashboard Connects to Local Backend (Priority: P3)

**Goal**: Verify the Admin Dashboard runs on port 5079, has `VITE_API_BASE_URL` configured, and fails fast if port is occupied.

**Independent Test**: Start the Admin Dashboard. Confirm it loads at `http://localhost:5079`. Confirm `import.meta.env.VITE_API_BASE_URL` returns `http://localhost:8976/api`.

### Implementation for User Story 3

- [x] T007 [US3] Verify Admin Dashboard runs on port 5079 with correct API base URL

  **What to do**: This is a **verification-only** task — the `.env` and `vite.config.ts` were already correctly configured in Phase 0. Run the following steps:

  1. Open a new terminal
  2. Run: `cd mohamy-smart-admin-dashboard && npm run dev`
  3. Check the console output — it MUST contain a URL with `:5079`
  4. Open `http://localhost:5079` in a browser — the Admin Dashboard must load
  5. Open browser DevTools → Console tab
  6. Type: `console.log(import.meta.env.VITE_API_BASE_URL)` — this is a Vite-specific check that only works in the browser console if the environment variable is available at build time
  7. The output MUST be: `http://localhost:8976/api`
  8. Stop the dashboard with `Ctrl+C`

  **Note**: If step 6 does not work in the browser console (Vite tree-shakes env vars that aren't used in source code), temporarily add `console.log('API URL:', import.meta.env.VITE_API_BASE_URL)` to any component file (e.g., `mohamy-smart-admin-dashboard/src/App.tsx` inside the component function), check the browser console, then remove the temporary log line.

  **Expected result**: Dashboard loads on 5079, `VITE_API_BASE_URL` is `http://localhost:8976/api`.

- [x] T008 [US3] Verify Admin Dashboard fails fast when port 5079 is occupied

  **What to do**: This is a **verification-only** task. Same procedure as T006 but for the Admin Dashboard:

  1. Start the Admin Dashboard: `cd mohamy-smart-admin-dashboard && npm run dev`
  2. Wait for it to fully start on port 5079
  3. Open another terminal and try to start it again: `cd mohamy-smart-admin-dashboard && npm run dev`
  4. The second instance MUST fail with a port conflict error
  5. It must NOT silently start on port 5080 or any other port
  6. Stop both instances

  **Expected result**: Non-zero exit with a port conflict error.

**Checkpoint**: ✅ US3 complete — Admin Dashboard on 5079, env var correct, strictPort works.

---

## Phase 6: User Story 4 — Landing Page Runs on Explicit Port 3000 (Priority: P4)

**Goal**: Verify the Landing Page runs on port 3000 with the port explicitly set in the dev script.

**Independent Test**: Run `cd mohamy-smart-landing && npm run dev` — console must show `http://localhost:3000` and the landing page loads.

### Implementation for User Story 4

- [x] T009 [US4] Verify Landing Page runs on explicit port 3000

  **What to do**: This is a **verification-only** task — `package.json` already has `"dev": "next dev --turbopack -p 3000"`. Run the following steps:

  1. Verify the port is explicit: Check `mohamy-smart-landing/package.json` — the `"dev"` script must contain `-p 3000`
  2. Open a terminal
  3. Run: `cd mohamy-smart-landing && npm run dev`
  4. Check the console output — it MUST contain `http://localhost:3000`
  5. Open `http://localhost:3000` in a browser — the full landing page must render (hero section, navigation, footer)
  6. Stop the landing page with `Ctrl+C`

  **Expected result**: Landing page loads on port 3000.

**Checkpoint**: ✅ US4 complete — Landing Page on 3000 with explicit port flag.

---

## Phase 7: User Story 5 — All Four Components Run Simultaneously (Priority: P5)

**Goal**: Run all four components at the same time. No port conflicts. Lawyer Dashboard communicates with local backend.

**Independent Test**: Start all four in separate terminals. All start without errors. Lawyer Dashboard API calls return real responses from local backend.

### Implementation for User Story 5

- [x] T010 [US5] Verify all four components run simultaneously without port conflicts

  **What to do**: This is a **verification-only** task — the integration test for the entire feature. Run the following steps:

  1. **Terminal 1 — Backend**: `cd mohamy-smart-backend/Lawyer && dotnet run`
     - Wait for: `Now listening on: http://localhost:8976`
  2. **Terminal 2 — Lawyer Dashboard**: `cd mohamy-smart-lawyer-dashboard && npm run dev`
     - Wait for: URL with `:5078`
  3. **Terminal 3 — Admin Dashboard**: `cd mohamy-smart-admin-dashboard && npm run dev`
     - Wait for: URL with `:5079`
  4. **Terminal 4 — Landing Page**: `cd mohamy-smart-landing && npm run dev`
     - Wait for: `http://localhost:3000`
  5. **Verify all running**: All four terminals show their component running without errors
  6. **Verify API integration**: Open `http://localhost:5078` → DevTools → Network → trigger an API call (e.g., login) → request must go to `http://localhost:8976/api/...` and return a real response (200, 401, etc. — not a network error)
  7. **Verify no cross-interference**: Open `http://localhost:5079` — Admin Dashboard loads independently. Open `http://localhost:3000` — Landing Page loads independently.
  8. Stop all four with `Ctrl+C` in each terminal

  **Expected result**: All four components running simultaneously, no port conflicts, no CORS errors, API calls succeed.

**Checkpoint**: ✅ US5 complete — full integration verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation and cleanup.

- [x] T011 [P] Verify `.env.example` files are committed to version control

  **What to do**: Run the following commands from the repo root:

  ```bash
  git ls-files mohamy-smart-lawyer-dashboard/.env.example
  git ls-files mohamy-smart-admin-dashboard/.env.example
  ```

  Both commands MUST output the file path (meaning the file is tracked by git). If either command returns empty, run:

  ```bash
  git add mohamy-smart-lawyer-dashboard/.env.example
  git add mohamy-smart-admin-dashboard/.env.example
  ```

  **Why**: FR-009 requires `.env.example` files to be committed so new developers know what env vars to create.

- [x] T012 [P] Verify `.env` and `appsettings.Development.json` are NOT committed to version control

  **What to do**: Run the following commands from the repo root:

  ```bash
  git ls-files mohamy-smart-lawyer-dashboard/.env
  git ls-files mohamy-smart-admin-dashboard/.env
  git ls-files mohamy-smart-backend/Lawyer/appsettings.Development.json
  ```

  All three commands MUST return empty (meaning the files are NOT tracked by git). If any returns a file path, the `.gitignore` rules are broken — this is a Constitution Principle I (Security-First) violation.

  **Why**: These files contain secrets (API keys, DB credentials). They must be git-ignored.

- [x] T013 Commit all changes with descriptive message

  **What to do**: From the repo root, run:

  ```bash
  git add mohamy-smart-backend/Lawyer/Properties/launchSettings.json
  git add mohamy-smart-lawyer-dashboard/src/APIs/api.ts
  git add mohamy-smart-backend/Lawyer/Controllers/PaymentController.cs
  git commit -m "feat(002): unify environment & ports — remove stale URL fallbacks, disable launchBrowser

  - Set launchBrowser: false in launchSettings.json (FR-002)
  - Remove localhost:5000 fallback from Lawyer Dashboard api.ts (Constitution Principle II)
  - Remove localhost:5173 fallback from PaymentController.cs (Constitution Principle II)
  - All ports verified: Backend 8976, Lawyer 5078, Admin 5079, Landing 3000
  - strictPort: true enforced on both dashboards (FR-008)"
  ```

  **Why**: Creates a clean git history with a descriptive commit message that references the feature requirements and constitution principles.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately. **T001, T002, T003 can ALL run in parallel** (they edit different files)
- **US1 (Phase 3)**: Depends on T001 completion (launchBrowser fix)
- **US2 (Phase 4)**: Depends on T002 completion (api.ts fallback fix) + US1 (backend must be running)
- **US3 (Phase 5)**: No dependencies on T001/T002/T003 (Admin Dashboard was already correctly configured)
- **US4 (Phase 6)**: No dependencies (Landing Page already fully configured)
- **US5 (Phase 7)**: Depends on US1 + US2 + US3 + US4 all passing
- **Polish (Phase 8)**: Depends on all user stories passing

### User Story Dependencies

```text
T001 ──┐
T002 ──┼── T004 (US1) ──┐
T003 ──┘                 │
                         ├── T005/T006 (US2) ──┐
T007/T008 (US3) ─────────┤                     │
T009 (US4) ──────────────┤                     ├── T010 (US5) → T011/T012/T013 (Polish)
                         │                     │
                         └─────────────────────┘
```

### Parallel Opportunities

**Maximum parallelism available:**

1. **T001 + T002 + T003**: All three foundational fixes edit different files — run in parallel
2. **T004 + T007 + T009**: US1, US3, US4 verifications can happen in parallel (after T001-T003 are done)
3. **T005 + T006**: US2 verification steps can be done together
4. **T011 + T012**: Polish git-tracking checks can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Apply T001 (launchBrowser fix) — **1 line change**
2. Run T004 (verify backend on 8976) — **manual test**
3. ✅ MVP complete — backend works on canonical port

### Incremental Delivery

1. T001 + T002 + T003 → All 3 code changes (can be done in parallel) — **estimated time: 2 minutes**
2. T004 → Verify US1 (backend on 8976) — **estimated: 1 minute**
3. T005 + T006 → Verify US2 (Lawyer Dashboard → local backend) — **estimated: 3 minutes**
4. T007 + T008 → Verify US3 (Admin Dashboard env) — **estimated: 2 minutes**
5. T009 → Verify US4 (Landing Page port) — **estimated: 1 minute**
6. T010 → Verify US5 (all 4 simultaneous) — **estimated: 5 minutes**
7. T011 + T012 + T013 → Polish & commit — **estimated: 2 minutes**

**Total estimated time**: ~16 minutes

---

## Notes

- Only **3 tasks** (T001, T002, T003) require actual code changes — everything else is verification
- All 3 code changes are single-line edits in different files — maximum parallelism
- The `.env`, `.env.example`, `.gitignore`, `vite.config.ts`, and `package.json` are all already correct from Phase 0
- Commit after T003 (all code changes) or after T013 (including verification)
- If any verification task fails, the fix is in the corresponding foundational task (T001/T002/T003)
