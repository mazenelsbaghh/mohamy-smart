# Research: Phase 1 — Environment & Port Unification

**Date**: 2026-04-04
**Feature**: 002-env-port-unification

## Research Tasks

### RT-001: Vite strictPort behavior

**Decision**: Use `strictPort: true` in `vite.config.ts` for both dashboards.

**Rationale**: When `strictPort: true` is set, Vite will exit with a non-zero code if
the specified port is already in use, rather than silently incrementing to the next
available port. This is the correct behavior per FR-008 and Constitution Principle V.

**Alternatives considered**:
- `strictPort: false` (default) — rejected because silent fallback to another port
  violates the "no silent port change" requirement.
- Shell-level port checking before `npm run dev` — rejected; over-engineered when Vite
  natively supports this.

**Current state**: ✅ Already configured in both `mohamy-smart-lawyer-dashboard/vite.config.ts`
and `mohamy-smart-admin-dashboard/vite.config.ts`.

---

### RT-002: ASP.NET Core port binding via launchSettings.json

**Decision**: Set `applicationUrl` to `http://localhost:8976` in `launchSettings.json`
under the `http` profile, and set `launchBrowser` to `false`.

**Rationale**: `launchSettings.json` is the standard way to configure ASP.NET Core
development URLs. `dotnet run` uses the `http` profile by default. Setting
`launchBrowser: false` prevents automatic browser opening per FR-002.

**Alternatives considered**:
- `--urls` CLI argument — rejected; less discoverable, requires remembering the flag.
- Environment variable `ASPNETCORE_URLS` — rejected; adds indirection when
  `launchSettings.json` is already the canonical config location.
- `appsettings.Development.json` Kestrel config — rejected; `launchSettings.json` takes
  precedence anyway during `dotnet run`.

**Current state**: Port 8976 is ✅ already set. `launchBrowser: true` needs to be changed
to `false` per FR-002.

---

### RT-003: Hardcoded URL fallbacks in source code

**Decision**: Remove all hardcoded fallback URLs from source code. If `VITE_API_BASE_URL`
or `FrontendBaseUrl` is not set, the application should fail loudly rather than silently
connect to a wrong endpoint.

**Rationale**: Silent fallbacks create hard-to-debug misrouting issues. Constitution
Principle II mandates all API base URLs come from environment variables.

**Issues found**:

| File | Line | Current Value | Action |
|------|------|---------------|--------|
| `mohamy-smart-lawyer-dashboard/src/APIs/api.ts` | 18 | Fallback `http://localhost:5000` | Remove fallback — throw error if env var missing |
| `mohamy-smart-backend/Lawyer/Controllers/PaymentController.cs` | 60 | Fallback `http://localhost:5173` | Use `FrontendBaseUrl` from config, throw if missing |

**Alternatives considered**:
- Keep fallbacks but update to correct ports — rejected; fallbacks mask config errors.
- Log a warning instead of throwing — rejected; a misconfigured URL is a data integrity
  risk (could redirect payments to the wrong frontend).

---

### RT-004: Next.js explicit port configuration

**Decision**: Use `-p 3000` flag in the `dev` script of `package.json`.

**Rationale**: While Next.js defaults to port 3000, explicitly setting it in the script
removes ambiguity and serves as documentation for new developers.

**Alternatives considered**:
- `PORT=3000` environment variable — rejected; less visible than script argument.
- Custom `server.js` with explicit port — rejected; over-engineered for dev mode.

**Current state**: ✅ Already configured: `"dev": "next dev --turbopack -p 3000"`.

---

### RT-005: .env.example files for onboarding

**Decision**: Every component that uses environment variables must have a committed
`.env.example` file with placeholder values and comments.

**Rationale**: FR-009 requires this for developer onboarding. The `.gitignore` rules
already explicitly un-ignore `.env.example` files (`!.env.example`).

**Current state**:
- Lawyer Dashboard: ✅ `.env.example` exists with correct content.
- Admin Dashboard: ✅ `.env.example` exists with correct content.
- Landing Page: No `.env.example` needed (no env vars used for local dev).
- Backend: No `.env.example` needed (uses `appsettings.Development.json` pattern with
  TODO placeholders in `appsettings.json`).

---

### RT-006: CORS configuration for local development

**Decision**: The current `AllowAny` CORS policy is acceptable for the Development
environment per Constitution Principle I ("AllowAnyOrigin is only permitted in
Development profile").

**Rationale**: In local development, all four components run on different ports, so CORS
must allow cross-origin requests. The policy is registered globally but is only used in
the Development environment (production uses nginx reverse proxy on the same domain).

**Current state**: ✅ No change needed for this phase. CORS tightening is a production
hardening task.

---

### RT-007: Vite environment variable loading priority

**Decision**: Use `.env` for local development values, rely on Vite's built-in loading
order: `.env.local` > `.env.[mode].local` > `.env.[mode]` > `.env`.

**Rationale**: The spec originally proposed using `.env.local` for overrides, but
inspection shows the Lawyer Dashboard already has the correct URL directly in `.env`
(which is git-ignored). Since `.env` itself is git-ignored (per `.gitignore`), there is
no risk of committing production URLs. The `.env.example` file serves as the template.

**Current state**: ✅ Both dashboards have `.env` with `VITE_API_BASE_URL=http://localhost:8976/api`
and `.env.example` committed. No `.env.local` override needed — the approach is simpler.
