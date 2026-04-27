# Quickstart: Phase 0 — Prerequisites & Decisions

**Estimated time**: 45–60 minutes (including decision confirmations)
**Goal**: All 7 decisions recorded, all secrets out of git, all ports configured.

---

## Step 0 — All decisions confirmed ✅

All 7 Phase 0 decisions are confirmed. No pending owner input required.

| Decision | Outcome |
|----------|---------|
| DEC-001 | Ports locked (Backend: 8976, Lawyer: 5078, Admin: 5079, Landing: 3000) |
| DEC-002 | Secrets: appsettings.Development.json locally, env vars in production |
| DEC-003 | API separation: shared endpoints + role-based authorization |
| DEC-004 | Email: Phone OTP only. No email provider. Placeholder interface only. |
| DEC-005 | Contact Form: deferred to backlog. Form UI disabled (no submit). |
| DEC-006 | Notifications: in-app only. No email/push. |
| DEC-007 | Testimonials: static in Landing Page code. |

Proceed directly to Step 1.

---

## Step 1 — Create docs/ directory and decisions.md

```bash
mkdir -p docs
touch docs/decisions.md
touch docs/setup-guide.md
```

Copy the decision log template from `research.md` and record all 7 decisions with their
chosen options and rationale.

---

## Step 2 — Update .gitignore

Ensure these patterns are in the root `.gitignore` (or each component's `.gitignore`):

```gitignore
# Secrets
appsettings.Development.json
.env
.env.local
.env.*.local

# Keep examples
!.env.example
```

Verify with:
```bash
git check-ignore -v mohamy-smart-backend/Lawyer/appsettings.Development.json
git check-ignore -v mohamy-smart-lawyer-dashboard/.env
git check-ignore -v mohamy-smart-admin-dashboard/.env
```
Each should return a match. If not, add the pattern to the appropriate `.gitignore`.

---

## Step 3 — Backend: Remove hardcoded secrets

**3a. Create appsettings.Development.json**

```bash
touch mohamy-smart-backend/Lawyer/appsettings.Development.json
```

Populate it with real values using the template from
`contracts/appsettings-schema.md` → "Git-ignored appsettings.Development.json".

**3b. Sanitize appsettings.json**

Open `mohamy-smart-backend/Lawyer/appsettings.json` and replace every real value with
a `TODO:` placeholder using the template from `contracts/appsettings-schema.md` →
"Committed appsettings.json".

**3c. Verify**

```bash
# Must return nothing (no real secrets in committed file)
grep -r "91.108.121.110" mohamy-smart-backend/Lawyer/appsettings.json
grep -r "sk-" mohamy-smart-backend/Lawyer/appsettings.json
# Must return the real connection string (in git-ignored file)
cat mohamy-smart-backend/Lawyer/appsettings.Development.json | grep DefaultConnection
```

---

## Step 4 — Backend: Fix port in launchSettings.json

Open `mohamy-smart-backend/Lawyer/Properties/launchSettings.json`.

Find the `applicationUrl` field and change it to:
```
"applicationUrl": "http://localhost:8976"
```

Ensure `"environmentVariables": { "ASPNETCORE_ENVIRONMENT": "Development" }` is present
so `appsettings.Development.json` is auto-loaded.

**Verify**:
```bash
cd mohamy-smart-backend && dotnet run
# Should see: Now listening on: http://localhost:8976
```

---

## Step 5 — Lawyer Dashboard: Fix .env

Open `mohamy-smart-lawyer-dashboard/.env` and set:
```env
VITE_API_BASE_URL=http://localhost:8976/api
```

Create `.env.example`:
```env
# Lawyer Dashboard environment — copy to .env and set values
VITE_API_BASE_URL=http://localhost:8976/api
```

Fix `vite.config.ts` — add `server.port` and `server.strictPort`:
```typescript
server: {
  port: 5078,
  strictPort: true,
}
```

**Verify**:
```bash
cd mohamy-smart-lawyer-dashboard && npm run dev
# Should see: Local: http://localhost:5078/
```

---

## Step 6 — Admin Dashboard: Create .env

Create `mohamy-smart-admin-dashboard/.env`:
```env
VITE_API_BASE_URL=http://localhost:8976/api
```

Create `mohamy-smart-admin-dashboard/.env.example`:
```env
# Admin Dashboard environment — copy to .env and set values
VITE_API_BASE_URL=http://localhost:8976/api
```

Fix `vite.config.ts`:
```typescript
server: {
  port: 5079,
  strictPort: true,
}
```

**Verify**:
```bash
cd mohamy-smart-admin-dashboard && npm run dev
# Should see: Local: http://localhost:5079/
```

---

## Step 7 — Landing Page: Verify port

The Landing Page runs on port 3000 with Next.js default. Verify `package.json` `dev` script:
```json
"dev": "next dev -p 3000"
```

If not present, add `-p 3000` explicitly.

---

## Step 8 — Full stack smoke test

Run all four components simultaneously in separate terminals:

| Terminal | Command | Expected |
|----------|---------|----------|
| 1 | `cd mohamy-smart-backend && dotnet run` | Listening on :8976 |
| 2 | `cd mohamy-smart-lawyer-dashboard && npm run dev` | Local: :5078 |
| 3 | `cd mohamy-smart-admin-dashboard && npm run dev` | Local: :5079 |
| 4 | `cd mohamy-smart-landing && npm run dev` | Local: :3000 |

Open `http://localhost:5078` → Lawyer Dashboard login page should load.
Open `http://localhost:5079` → Admin Dashboard should load.
Open `http://localhost:3000` → Landing Page should load.
Open `http://localhost:8976/swagger` → Swagger UI should load.

---

## Step 9 — Credential scan verification

```bash
# Scan for common credential patterns in committed files
git grep -n "password" -- "*.json" ":!*.Development.json"
git grep -n "ApiKey" -- "*.json" ":!*.Development.json"
git grep -n "SecretKey" -- "*.json" ":!*.Development.json"
git grep -n "91.108.121.110"
```

All results should show only `TODO:` placeholder values, never real credentials.

---

## Step 10 — Commit Phase 0

```bash
git add docs/decisions.md docs/setup-guide.md
git add "**/.gitignore"
git add "**/appsettings.json"         # sanitized — no secrets
git add "**/launchSettings.json"      # port change only
git add "**/.env.example"             # placeholder templates
git add "**/vite.config.ts"           # port changes

# DO NOT add:
# appsettings.Development.json
# .env files

git commit -m "chore: phase 0 — lock decisions, remove hardcoded secrets, fix ports"
```

---

## Definition of Done

- [ ] `docs/decisions.md` exists with all 7 decisions recorded
- [ ] `docs/setup-guide.md` exists with setup instructions
- [ ] `appsettings.json` contains only `TODO:` placeholders — no real values
- [ ] `appsettings.Development.json` exists locally and is git-ignored
- [ ] Backend starts on port 8976
- [ ] Lawyer Dashboard starts on port 5078
- [ ] Admin Dashboard starts on port 5079
- [ ] Landing Page starts on port 3000
- [ ] `git grep` credential scan returns zero real secrets in committed files
- [ ] `.env.example` files committed for both dashboards
