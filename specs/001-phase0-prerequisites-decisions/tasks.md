# Tasks: Phase 0 — Prerequisites & Decisions

**Input**: Design documents from `/specs/001-phase0-prerequisites-decisions/`
**Branch**: `001-phase0-prerequisites-decisions`
**Generated**: 2026-04-04

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US7)
- Every task includes exact file path and exact values — no guesswork required

## Path Reference

```
mohamy-smart-backend/Lawyer/appsettings.json
mohamy-smart-backend/Lawyer/appsettings.Development.json   ← git-ignored
mohamy-smart-backend/Lawyer/Properties/launchSettings.json
mohamy-smart-backend/.gitignore
mohamy-smart-lawyer-dashboard/vite.config.ts
mohamy-smart-lawyer-dashboard/.env
mohamy-smart-lawyer-dashboard/.env.example
mohamy-smart-lawyer-dashboard/.gitignore
mohamy-smart-admin-dashboard/vite.config.ts
mohamy-smart-admin-dashboard/.env
mohamy-smart-admin-dashboard/.env.example
mohamy-smart-admin-dashboard/.gitignore
mohamy-smart-landing/package.json
mohamy-smart-landing/src/components/ui/forms/ContactForm.tsx
docs/decisions.md
docs/setup-guide.md
```

---

## Phase 1: Setup

**Purpose**: Create documentation structure before any file changes.

- [x] T001 Create directory `docs/` at repo root (run: `mkdir -p docs`)
- [x] T002 [P] Create `docs/decisions.md` with all 7 decisions (full content specified in task notes below)
- [x] T003 [P] Create empty stub `docs/setup-guide.md` with heading `# MOHAMY SMART — Developer Setup Guide`

### T002 — Full content for docs/decisions.md

```markdown
# MOHAMY SMART — Decision Log

All architectural decisions for the MOHAMY SMART platform. This file is the single
source of truth. Every decision must be recorded here before the dependent phase begins.

---

## DEC-001 — Port Assignments

**Date**: 2026-04-04
**Status**: Confirmed
**Affects phases**: Phase 1

| Component        | Port |
|------------------|------|
| Backend (.NET)   | 8976 |
| Lawyer Dashboard | 5078 |
| Admin Dashboard  | 5079 |
| Landing Page     | 3000 |

**Decision**: Ports specified by platform owner. Non-negotiable.

---

## DEC-002 — Secrets Management

**Date**: 2026-04-04
**Status**: Confirmed
**Affects phases**: Phase 2, all subsequent phases

**Decision**: `appsettings.Development.json` (git-ignored) for local development.
Production: environment variables injected by hosting platform.

**Rules**:
- `appsettings.json` contains only TODO placeholders — no real values.
- `appsettings.Development.json` is git-ignored and holds all real secrets locally.
- React frontend secrets live in `.env` (git-ignored). `.env.example` is committed.

---

## DEC-003 — Admin vs. Lawyer API Separation

**Date**: 2026-04-04
**Status**: Confirmed
**Affects phases**: Phase 3, 4

**Decision**: Shared endpoints with role-based authorization attributes.
- Admin-only endpoints: `[Authorize(Roles = "Admin")]`
- Lawyer-only endpoints: `[Authorize(Roles = "Lawyer")]`
- No duplicate controllers for Admin.

---

## DEC-004 — Email Provider

**Date**: 2026-04-04
**Status**: Confirmed — deferred
**Affects phases**: Post-launch

**Decision**: No email provider integrated in current phase.
- OTP and account verification: Phone OTP only.
- `IEmailService` interface exists as a placeholder — not activated, not implemented.
- No email NuGet packages added.
- Revisit before launch: Brevo (recommended) / SendGrid / Amazon SES.

---

## DEC-005 — Contact Form Destination

**Date**: 2026-04-04
**Status**: Confirmed — deferred to backlog
**Affects phases**: Post-launch

**Decision**: Contact form deferred. The form UI remains visible but submission is
disabled — button replaced with static message "سيتم التواصل معك قريباً".
No `POST /api/contact` endpoint created.

**Future options**: Email to owner / DB + Admin Dashboard / WhatsApp API.

---

## DEC-006 — Notification Delivery

**Date**: 2026-04-04
**Status**: Confirmed
**Affects phases**: Notification backend phase

**Decision**: In-app notifications only.
- Notification entity already in DB.
- `InAppNotificationService` saves to DB.
- No email notifications. No Firebase/push notifications.
- Future upgrade: add `EmailNotificationService` after email provider is chosen.

---

## DEC-007 — Testimonials Management

**Date**: 2026-04-04
**Status**: Confirmed
**Affects phases**: Landing Page phase

**Decision**: Static in Landing Page code. No Admin Dashboard management for v1.
- To update: edit the constants file in Landing Page source → redeploy.
- Dynamic management deferred to post-launch.
```

---

## Phase 2: Foundational — .gitignore Updates

**Purpose**: MUST complete before creating any secret files. Prevents accidental credential commits.

**⚠️ CRITICAL**: Complete this phase before Phase 3.

- [x] T004 Add `appsettings.Development.json` entry to `mohamy-smart-backend/.gitignore`

  Append these lines at the end of `mohamy-smart-backend/.gitignore`:
  ```
  # Local secrets — never commit
  **/appsettings.Development.json
  **/appsettings.*.json
  !**/appsettings.json
  ```

- [x] T005 [P] Add `.env` entries to `mohamy-smart-lawyer-dashboard/.gitignore`

  Append these lines at the end of `mohamy-smart-lawyer-dashboard/.gitignore`:
  ```
  # Environment secrets
  .env
  .env.local
  .env.*.local
  # Keep example
  !.env.example
  ```

- [x] T006 [P] Add `.env` entries to `mohamy-smart-admin-dashboard/.gitignore`

  Append these lines at the end of `mohamy-smart-admin-dashboard/.gitignore`:
  ```
  # Environment secrets
  .env
  .env.local
  .env.*.local
  # Keep example
  !.env.example
  ```

**Checkpoint**: Run `git check-ignore -v mohamy-smart-backend/Lawyer/appsettings.Development.json` — must return a match before proceeding.

---

## Phase 3: User Story 5 — Secrets Hardening (Priority: P5 — executed first for security)

**Goal**: Remove all hardcoded credentials from committed source files.

**Independent Test**: `git grep -n "Password\|sk-proj\|AIzaSy\|ZXlK\|sz8eI"` returns zero results in committed files.

> **Note**: Although labeled P5 in the spec, secrets hardening is executed FIRST because Principle I (Security-First) is NON-NEGOTIABLE and must precede all other work.

- [x] T007 [US5] Create `mohamy-smart-backend/Lawyer/appsettings.Development.json` with the following exact content (replace placeholder comments with your real values — the values below are the ones currently hardcoded in appsettings.json):

  ```json
  {
    "ConnectionStrings": {
      "SqlServer": "Server=91.108.121.110; Database=Lawyer; User Id=SA; Password=<REDACTED_DB_PASSWORD>; Encrypt=True; TrustServerCertificate=True; MultipleActiveResultSets=True;"
    },
    "OpenAI": {
      "ApiKey": "<REDACTED_OLD_OPENAI_KEY>"
    },
    "Gemini": {
      "ApiKey": "<REDACTED_OLD_GEMINI_KEY>"
    },
    "Paymob": {
      "APIKey": "<REDACTED_OLD_PAYMOB_API_KEY>",
      "SecretKey": "<REDACTED_OLD_PAYMOB_SECRET_KEY>",
      "PublicKey": "<REDACTED_OLD_PAYMOB_PUBLIC_KEY>",
      "HMAC": "<REDACTED_OLD_PAYMOB_HMAC>",
      "CardIntegrationId": "4589994",
      "MobileIntegrationId": "5580959",
      "CallbackBaseUrl": "https://api.smart-mohamy.com"
    },
    "JWT": {
      "Key": "<REDACTED_OLD_JWT_KEY>"
    }
  }
  ```

- [x] T008 [US5] Replace `mohamy-smart-backend/Lawyer/appsettings.json` with the sanitized version below (all secrets replaced with TODO placeholders, structure preserved):

  ```json
  {
    "ConnectionStrings": {
      "SqlServer": "TODO: set in appsettings.Development.json"
    },
    "Logging": {
      "LogLevel": {
        "Default": "Information",
        "Microsoft.AspNetCore": "Warning"
      }
    },
    "AppSetting": {
      "BaseUrl": "http://localhost:8976"
    },
    "AppSettings": {
      "TimeZoneId": "Africa/Cairo"
    },
    "AIProvider": {
      "Active": "Chatgpt"
    },
    "OpenAI": {
      "ApiKey": "TODO: set in appsettings.Development.json",
      "Model": "gpt-4.1"
    },
    "Gemini": {
      "ApiKey": "TODO: set in appsettings.Development.json",
      "Model": "gemini-3-pro-preview"
    },
    "AllowedHosts": "*",
    "FrontendBaseUrl": "http://localhost:5078",
    "Paymob": {
      "APIKey": "TODO: set in appsettings.Development.json",
      "SecretKey": "TODO: set in appsettings.Development.json",
      "PublicKey": "TODO: set in appsettings.Development.json",
      "HMAC": "TODO: set in appsettings.Development.json",
      "CardIntegrationId": "TODO: set in appsettings.Development.json",
      "MobileIntegrationId": "TODO: set in appsettings.Development.json",
      "CallbackBaseUrl": "TODO: set in appsettings.Development.json"
    },
    "JWT": {
      "Key": "TODO: set in appsettings.Development.json (must be 32+ chars)",
      "Issuer": "SecureApi",
      "Audience": "SecureApiUser",
      "DurationInMinutes": 15
    },
    "Email": {
      "Provider": "PLACEHOLDER: not configured — DEC-004 deferred. Phone OTP only.",
      "FromName": "محامي سمارت"
    },
    "Serilog": {
      "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.File" ],
      "MinimumLevel": {
        "Default": "Information",
        "Override": {
          "Microsoft": "Warning",
          "System": "Warning"
        }
      },
      "Enrich": [ "FromLogContext" ],
      "WriteTo": [
        { "Name": "Console" },
        {
          "Name": "File",
          "Args": {
            "path": "Logs/app-.log",
            "rollingInterval": "Day"
          }
        },
        {
          "Name": "Logger",
          "Args": {
            "configureLogger": {
              "Filter": [
                {
                  "Name": "ByIncludingOnly",
                  "Args": {
                    "expression": "ContainsKey(Properties['IsAudit'])"
                  }
                }
              ],
              "WriteTo": [
                {
                  "Name": "File",
                  "Args": {
                    "path": "Logs/audit-.log",
                    "rollingInterval": "Day"
                  }
                }
              ]
            }
          }
        }
      ]
    }
  }
  ```

- [x] T009 [US5] Verify T007 file is git-ignored: run `git check-ignore -v "mohamy-smart-backend/Lawyer/appsettings.Development.json"` — must print a match. If no match, re-check T004.

**Checkpoint**: `git grep -n "Password\|sk-proj\|AIzaSy\|sz8eI"` must return zero results in committed files (appsettings.Development.json is excluded from git).

---

## Phase 4: User Story 1 — Port Assignments (Priority: P1)

**Goal**: All four components start on their canonical ports with no conflicts.

**Independent Test**: Run all four components simultaneously. Each responds on its designated port.

### Backend port fix

- [x] T010 [US1] Replace `mohamy-smart-backend/Lawyer/Properties/launchSettings.json` with exact content:

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

### Lawyer Dashboard port + env fix

- [x] T011 [P] [US1] Replace `mohamy-smart-lawyer-dashboard/vite.config.ts` with exact content:

  ```typescript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react-swc'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5078,
      strictPort: true,
    },
  })
  ```

- [x] T012 [P] [US1] Replace content of `mohamy-smart-lawyer-dashboard/.env` with:

  ```
  VITE_API_BASE_URL=http://localhost:8976/api
  ```

- [x] T013 [P] [US1] Create `mohamy-smart-lawyer-dashboard/.env.example` with exact content:

  ```
  # Lawyer Dashboard — copy this file to .env and set values
  # Development: http://localhost:8976/api
  # Production: https://api.yourdomain.com/api
  VITE_API_BASE_URL=http://localhost:8976/api
  ```

### Admin Dashboard port + env fix

- [x] T014 [P] [US1] Replace `mohamy-smart-admin-dashboard/vite.config.ts` with exact content:

  ```typescript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5079,
      strictPort: true,
    },
  })
  ```

- [x] T015 [P] [US1] Create `mohamy-smart-admin-dashboard/.env` with exact content:

  ```
  VITE_API_BASE_URL=http://localhost:8976/api
  ```

- [x] T016 [P] [US1] Create `mohamy-smart-admin-dashboard/.env.example` with exact content:

  ```
  # Admin Dashboard — copy this file to .env and set values
  # Development: http://localhost:8976/api
  # Production: https://api.yourdomain.com/api
  VITE_API_BASE_URL=http://localhost:8976/api
  ```

### Landing Page port fix

- [x] T017 [P] [US1] Update `mohamy-smart-landing/package.json` — change the `"dev"` script value from `"next dev --turbopack"` to `"next dev --turbopack -p 3000"`. Only this one value changes; all other fields stay the same.

**Checkpoint**: Run `cd mohamy-smart-lawyer-dashboard && npm run dev` — must show `Local: http://localhost:5078/`. If it shows 5173, the vite.config.ts change did not save correctly.

---

## Phase 5: User Story 2 — Email Placeholder (Priority: P2)

**Goal**: Email section exists in config as a documented placeholder. No active implementation.

**Independent Test**: `grep "PLACEHOLDER" mohamy-smart-backend/Lawyer/appsettings.json` returns the Email.Provider line.

- [x] T018 [US2] Verify `mohamy-smart-backend/Lawyer/appsettings.json` contains the Email block with `PLACEHOLDER` value (set in T008). No action needed if T008 is complete. If missing, add this block to appsettings.json:

  ```json
  "Email": {
    "Provider": "PLACEHOLDER: not configured — DEC-004 deferred. Phone OTP only.",
    "FromName": "محامي سمارت"
  }
  ```

**Checkpoint**: No email NuGet packages exist in `mohamy-smart-backend/Lawyer/Lawyer.csproj`. Run `grep -i "brevo\|sendgrid\|mailkit" mohamy-smart-backend/Lawyer/Lawyer.csproj` — must return nothing.

---

## Phase 6: User Story 3 — Contact Form Disable (Priority: P3)

**Goal**: Contact form UI visible but submission permanently disabled. Static Arabic message shown.

**Independent Test**: Open Landing Page → contact section → button is disabled and shows "سيتم التواصل معك قريباً".

- [x] T019 [US3] Replace `mohamy-smart-landing/src/components/ui/forms/ContactForm.tsx` with exact content:

  ```tsx
  'use client';
  import React from 'react';
  import { Form, Input, Button, Textarea } from "@heroui/react";

  const ContactForm = () => {
      return (
          <Form className="w-full md:w-9/12 flex flex-col gap-8 mt-10">
              <Input type="text" placeholder='البريد الإلكتروني' isDisabled />
              <Input type="email" placeholder='الاسم بالكامل' isDisabled />
              <Textarea className="w-full" placeholder="الرسالة" isDisabled />
              <Button className='w-full' type="button" isDisabled>
                  سيتم التواصل معك قريباً
              </Button>
          </Form>
      );
  };

  export default ContactForm;
  ```

**Checkpoint**: Open `http://localhost:3000` → scroll to contact section → form fields and button are disabled (greyed out). Clicking the button does nothing.

---

## Phase 7: User Story 4 — Notifications In-App Only (Priority: P4)

**Goal**: Decision recorded. No code changes required in this phase.

**Independent Test**: `grep "In-app" docs/decisions.md` returns DEC-006 content.

- [x] T020 [US4] Verify `docs/decisions.md` contains DEC-006 with "In-app notifications only" (written in T002). No additional code changes needed for this decision in Phase 0.

---

## Phase 8: User Story 6 — Testimonials Static (Priority: P6)

**Goal**: Decision recorded. No code changes required in this phase.

**Independent Test**: `grep "DEC-007" docs/decisions.md` returns the testimonials entry.

- [x] T021 [US6] Verify `docs/decisions.md` contains DEC-007 with "Static in Landing Page code" (written in T002). No code changes needed.

---

## Phase 9: User Story 7 — API Separation Confirmed (Priority: P7)

**Goal**: Decision recorded. No code changes required in this phase.

**Independent Test**: `grep "DEC-003" docs/decisions.md` returns the API separation entry.

- [x] T022 [US7] Verify `docs/decisions.md` contains DEC-003 with "Shared endpoints + role-based authorization" (written in T002). No code changes needed.

---

## Phase N: Polish & Verification

**Purpose**: Credential scan, smoke test, setup guide, and commit.

- [x] T023 Write `docs/setup-guide.md` — copy the full content of `specs/001-phase0-prerequisites-decisions/quickstart.md` into this file (adapt from developer-facing quickstart to a permanent guide). The setup guide MUST include:
  - Port reference table (DEC-001)
  - How to create appsettings.Development.json locally
  - How to create .env files for both dashboards
  - How to start all 4 components
  - The credential scan command

- [x] T024 [P] Run credential scan — execute the following command from repo root and confirm ZERO results:

  ```bash
  git grep -n "<REDACTED_SEARCH_PATTERNS>" -- "*.json" "*.ts" "*.tsx" "*.env" ":!*.Development.json"
  ```

  If any results appear: the file containing the credential must be edited to remove the real value before committing.

- [x] T025 [P] Smoke test — start all components and verify ports (run each in a separate terminal):

  ```bash
  # Terminal 1
  cd mohamy-smart-backend && dotnet run
  # Expected: Now listening on: http://localhost:8976

  # Terminal 2
  cd mohamy-smart-lawyer-dashboard && npm run dev
  # Expected: Local: http://localhost:5078/

  # Terminal 3
  cd mohamy-smart-admin-dashboard && npm run dev
  # Expected: Local: http://localhost:5079/

  # Terminal 4
  cd mohamy-smart-landing && npm run dev
  # Expected: Local: http://localhost:3000/
  ```

- [x] T026 Stage and commit Phase 0 changes:

  ```bash
  git add docs/decisions.md docs/setup-guide.md
  git add mohamy-smart-backend/.gitignore
  git add mohamy-smart-backend/Lawyer/appsettings.json
  git add mohamy-smart-backend/Lawyer/Properties/launchSettings.json
  git add mohamy-smart-lawyer-dashboard/.gitignore
  git add mohamy-smart-lawyer-dashboard/.env.example
  git add mohamy-smart-lawyer-dashboard/vite.config.ts
  git add mohamy-smart-admin-dashboard/.gitignore
  git add mohamy-smart-admin-dashboard/.env.example
  git add mohamy-smart-admin-dashboard/vite.config.ts
  git add mohamy-smart-landing/package.json
  git add "mohamy-smart-landing/src/components/ui/forms/ContactForm.tsx"
  # VERIFY: do NOT add .env or appsettings.Development.json
  git status  # confirm no .env or Development.json in staging
  git commit -m "chore: phase 0 — decisions locked, secrets removed, ports fixed"
  ```

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — MUST complete before Phase 3
- **Phase 3 (US5 Secrets)**: Depends on Phase 2 (.gitignore must exist) — BLOCKS all other phases
- **Phase 4 (US1 Ports)**: Depends on Phase 3 (appsettings.json sanitized) — BLOCKS smoke test
- **Phase 5 (US2 Email)**: Depends on Phase 3 (appsettings.json must exist) — can run after T008
- **Phase 6 (US3 Contact)**: Independent — can run after Phase 1
- **Phase 7–9 (US4, US6, US7)**: Independent — only verify docs/decisions.md from T002
- **Phase N (Polish)**: Depends on all phases complete

### Parallel Opportunities

```
After T001 (docs/ created):
  T002 and T003 can run in parallel

After T003 (gitignore):
  T004, T005, T006 can run in parallel

After T007+T008 (secrets done):
  T010, T011, T012, T013, T014, T015, T016, T017 can all run in parallel
  (different files, no shared dependencies)

After all phases complete:
  T024, T025 can run in parallel
```

---

## Implementation Strategy

### Strict Execution Order (for single LLM / single developer)

```
T001 → T002 → T003                          (Phase 1 Setup)
     ↓
T004 → T005 → T006                          (Phase 2 .gitignore)
     ↓
T007 → T008 → T009                          (Phase 3 Secrets — VERIFY T009 before continuing)
     ↓
T010 → T011+T012+T013+T014+T015+T016+T017  (Phase 4 Ports — parallel)
     ↓
T018 → T019                                 (Phase 5+6 Email+Contact)
     ↓
T020 → T021 → T022                          (Phase 7-9 Verify decisions)
     ↓
T023 → T024+T025 → T026                     (Phase N Polish + Commit)
```

### MVP Scope (minimum to unblock Phase 1)

Complete only T001–T009 (Phases 1–3). This alone satisfies:
- ✅ Secrets out of committed files (Constitution Principle I)
- ✅ .gitignore protecting future secret files
- ✅ docs/decisions.md with all 7 decisions

Then proceed to T010–T017 (Phase 4) to fix ports.

---

## Notes

- [P] tasks touch different files — safe to run simultaneously
- T009 is a mandatory checkpoint — do not proceed to Phase 4 if it fails
- T026 commit explicitly lists files — do not use `git add .` which could accidentally include `.env`
- appsettings.Development.json is never committed — confirm with `git status` before T026
- If `strictPort: true` causes an error on startup, it means another process is using that port — kill it, don't change the port
