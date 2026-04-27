# Tasks: Phase 2 — Security & Secrets Hardening

**Input**: Design documents from `/specs/003-security-secrets-hardening/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅, contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup tasks needed — all project structure already exists. The backend project, config files, and `.gitignore` are already in place from Phases 0 and 1.

**Checkpoint**: ✅ Setup already complete — proceed directly to Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Apply the 4 code/config changes that all user stories depend on. These are the only source code modifications in this entire feature.

**⚠️ CRITICAL**: No user story verification can begin until all 4 foundational tasks are applied.

- [x] T001 [P] Add `CorsOrigins` array to `mohamy-smart-backend/Lawyer/appsettings.json`

  **What to do**: Open the file `mohamy-smart-backend/Lawyer/appsettings.json`. Add a new `"CorsOrigins"` key at the top level, right after the `"AllowedHosts": "*"` line (line 28). The value is a JSON array of 3 URLs.

  **Exact change — find this line (line 28)**:
  ```json
    "AllowedHosts": "*",
  ```

  **Replace it with these lines**:
  ```json
    "AllowedHosts": "*",
    "CorsOrigins": [
      "http://localhost:5078",
      "http://localhost:5079",
      "http://localhost:3000"
    ],
  ```

  **Do NOT change any other line in this file.** The rest of the file (ConnectionStrings, JWT, Paymob, Serilog, etc.) must remain exactly as-is.

  **Why**: FR-001 requires CORS origins to be read from config, not hardcoded in C# source code. These 3 origins correspond to the Lawyer Dashboard (5078), Admin Dashboard (5079), and Landing Page (3000).

---

- [x] T002 [P] Replace `AllowAnyOrigin` CORS policy with restricted CORS in `mohamy-smart-backend/Lawyer/Extensions/WebApplicationServices.cs`

  **What to do**: Open the file `mohamy-smart-backend/Lawyer/Extensions/WebApplicationServices.cs`. Find the CORS configuration block at **lines 36-44**. Replace the entire block with the new restricted CORS policy.

  **Find this exact code (lines 36-44)**:
  ```csharp
  		services.AddCors(options =>
              {
                  options.AddPolicy("AllowAny", policy =>
                  {
                      policy.AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                  });
              });
  ```

  **Replace it with this exact code**:
  ```csharp
  		var corsOrigins = configuration.GetSection("CorsOrigins").Get<string[]>()
  			?? throw new InvalidOperationException(
  				"CorsOrigins is not configured in appsettings.json. " +
  				"Add a \"CorsOrigins\" array with at least one allowed origin.");

  		if (corsOrigins.Length == 0)
  			throw new InvalidOperationException(
  				"CorsOrigins must contain at least one origin. " +
  				"Example: [\"http://localhost:5078\", \"http://localhost:5079\"]");

  		services.AddCors(options =>
  		{
  			options.AddPolicy("CorsPolicy", policy =>
  			{
  				policy.WithOrigins(corsOrigins)
  					  .AllowAnyHeader()
  					  .AllowAnyMethod()
  					  .AllowCredentials();
  			});
  		});
  ```

  **Do NOT change any other code in this file.** The JWT configuration, Identity setup, rate limiting, and all other service registrations must remain exactly as-is.

  **Why**: FR-001 requires configurable CORS origins. FR-002 restricts Development to known localhost origins. The `AllowCredentials()` call is required because the Lawyer Dashboard sends `Authorization: Bearer` headers in cross-origin requests. The policy name changes from `"AllowAny"` to `"CorsPolicy"` because the old name is misleading.

  **Important**: This change renames the policy from `"AllowAny"` to `"CorsPolicy"`. Task T003 updates the reference in Program.cs to match.

---

- [x] T003 [P] Update `UseCors` policy name in `mohamy-smart-backend/Lawyer/Program.cs` and add startup config validation

  **What to do**: Open the file `mohamy-smart-backend/Lawyer/Program.cs`. Make TWO changes in this file:

  ### Change 1: Add startup config validation (after line 18)

  Find this exact line (**line 18**):
  ```csharp
  var builder = WebApplication.CreateBuilder(args);
  ```

  Add the following block **immediately after** that line (between line 18 and line 19). Keep the existing empty lines 19-20 — just insert the new block after them:

  ```csharp

  // ── Startup Config Validation (Development only) ──────────────────────
  if (builder.Environment.IsDevelopment())
  {
      var errors = new List<string>();
      var cfg = builder.Configuration;

      void CheckRequired(string key, string? value)
      {
          if (string.IsNullOrWhiteSpace(value))
              errors.Add($"Missing required config: '{key}'");
          else if (value.StartsWith("TODO", StringComparison.OrdinalIgnoreCase))
              errors.Add($"Config '{key}' still contains a placeholder. Set a real value in appsettings.Development.json.");
      }

      void CheckUrl(string key, string? value)
      {
          if (string.IsNullOrWhiteSpace(value) || value.StartsWith("TODO", StringComparison.OrdinalIgnoreCase))
              errors.Add($"Config '{key}' is missing or placeholder.");
          else if (!Uri.TryCreate(value, UriKind.Absolute, out _))
              errors.Add($"Config '{key}' is not a valid URL: '{value}'");
      }

      // Database
      CheckRequired("ConnectionStrings:SqlServer", cfg.GetConnectionString("SqlServer"));

      // JWT
      var jwtKey = cfg["JWT:Key"];
      if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.StartsWith("TODO", StringComparison.OrdinalIgnoreCase))
          errors.Add("Config 'JWT:Key' is missing or placeholder. Set in appsettings.Development.json.");
      else if (jwtKey.Length < 32)
          errors.Add($"Config 'JWT:Key' must be at least 32 characters (current: {jwtKey.Length}).");

      // AI Providers
      CheckRequired("OpenAI:ApiKey", cfg["OpenAI:ApiKey"]);
      CheckRequired("Gemini:ApiKey", cfg["Gemini:ApiKey"]);

      // Paymob
      CheckRequired("Paymob:APIKey", cfg["Paymob:APIKey"]);
      CheckRequired("Paymob:SecretKey", cfg["Paymob:SecretKey"]);
      CheckRequired("Paymob:PublicKey", cfg["Paymob:PublicKey"]);
      CheckRequired("Paymob:HMAC", cfg["Paymob:HMAC"]);
      CheckRequired("Paymob:CardIntegrationId", cfg["Paymob:CardIntegrationId"]);
      CheckRequired("Paymob:MobileIntegrationId", cfg["Paymob:MobileIntegrationId"]);
      CheckUrl("Paymob:CallbackBaseUrl", cfg["Paymob:CallbackBaseUrl"]);

      // CORS & Frontend
      CheckUrl("FrontendBaseUrl", cfg["FrontendBaseUrl"]);
      var corsOrigins = cfg.GetSection("CorsOrigins").Get<string[]>();
      if (corsOrigins == null || corsOrigins.Length == 0)
          errors.Add("Config 'CorsOrigins' is missing or empty. Add at least one origin in appsettings.json.");

      if (errors.Count > 0)
      {
          var message = string.Join(Environment.NewLine,
              "╔══════════════════════════════════════════════════════════════╗",
              "║  CONFIGURATION ERROR — Backend cannot start                 ║",
              "╠══════════════════════════════════════════════════════════════╣",
              $"║  {errors.Count} issue(s) found.                                       ║",
              "║  Fix in appsettings.Development.json                       ║",
              "║  (copy from appsettings.example.json if file is missing)   ║",
              "╚══════════════════════════════════════════════════════════════╝",
              "",
              "Issues:",
              string.Join(Environment.NewLine, errors.Select((e, i) => $"  {i + 1}. {e}"))
          );
          throw new InvalidOperationException(message);
      }
  }
  ```

  ### Change 2: Rename UseCors policy (line 137)

  Find this exact line (**line 137**, but the line number will shift after Change 1 — search by content):
  ```csharp
  app.UseCors("AllowAny");
  ```

  Replace it with:
  ```csharp
  app.UseCors("CorsPolicy");
  ```

  **Do NOT change any other code in this file.** All middleware, seeding, Serilog, QuestPDF, rate limiting, and Scalar configuration must remain exactly as-is.

  **Why**: FR-004 requires startup validation of all secrets. FR-005 requires fail-fast with descriptive error messages. FR-012 confirms NO connectivity checks — format validation only. The policy name must match the new name `"CorsPolicy"` defined in T002.

---

- [x] T004 [P] Create `mohamy-smart-backend/Lawyer/appsettings.example.json` onboarding template

  **What to do**: Create a **new file** at `mohamy-smart-backend/Lawyer/appsettings.example.json`. This file will be committed to git and serves as a template for new developers. All values are fake placeholders.

  **Create the file with this exact content**:
  ```json
  {
    "ConnectionStrings": {
      "SqlServer": "Server=YOUR_SERVER_IP; Database=Lawyer; User Id=YOUR_DB_USER; Password=YOUR_DB_PASSWORD; Encrypt=True; TrustServerCertificate=True; MultipleActiveResultSets=True;"
    },
    "OpenAI": {
      "ApiKey": "YOUR_OPENAI_API_KEY (get from https://platform.openai.com/api-keys)"
    },
    "Gemini": {
      "ApiKey": "YOUR_GEMINI_API_KEY (get from https://aistudio.google.com/apikey)"
    },
    "Paymob": {
      "APIKey": "YOUR_PAYMOB_API_KEY (get from Paymob merchant portal)",
      "SecretKey": "YOUR_PAYMOB_SECRET_KEY",
      "PublicKey": "YOUR_PAYMOB_PUBLIC_KEY",
      "HMAC": "YOUR_PAYMOB_HMAC_SECRET",
      "CardIntegrationId": "YOUR_CARD_INTEGRATION_ID",
      "MobileIntegrationId": "YOUR_MOBILE_INTEGRATION_ID",
      "CallbackBaseUrl": "https://YOUR_API_DOMAIN.com"
    },
    "JWT": {
      "Key": "YOUR_JWT_SECRET_KEY_MUST_BE_AT_LEAST_32_CHARACTERS_LONG"
    }
  }
  ```

  **This file MUST be committed to git** (it contains only placeholder values, no real secrets).

  **Why**: FR-006 requires a committed example file. FR-007 requires it to contain only placeholders. New developers copy this file → rename to `appsettings.Development.json` → fill in real values → backend starts.

---

**Checkpoint**: ✅ All 4 foundational code changes are complete. User story verification can begin.

---

## Phase 3: User Story 1 — CORS Restricted to Known Origins (Priority: P1) 🎯 MVP

**Goal**: Verify that the CORS policy allows requests from the 3 known origins and rejects all others.

**Independent Test**: Start the backend. Use `curl` with different `Origin` headers and check for `Access-Control-Allow-Origin` in responses.

### Implementation for User Story 1

- [x] T005 [US1] Verify CORS allows requests from Lawyer Dashboard origin (`http://localhost:5078`)

  **What to do**: This is a **verification-only** task — all code changes were done in T001 and T002. Run the following steps:

  1. Make sure the backend is running: `cd mohamy-smart-backend/Lawyer && dotnet run`
  2. In a separate terminal, run this curl command:
     ```bash
     curl -s -o /dev/null -D - \
       -H "Origin: http://localhost:5078" \
       -H "Access-Control-Request-Method: GET" \
       -X OPTIONS \
       http://localhost:8976/api/Auth/login
     ```
  3. Check the response headers. You MUST see BOTH of these:
     - `Access-Control-Allow-Origin: http://localhost:5078`
     - `Access-Control-Allow-Credentials: true`
  4. If you don't see them, the CORS change in T002 was not applied correctly.

  **Expected result**: Headers present with correct values.

- [x] T006 [US1] Verify CORS allows requests from Admin Dashboard origin (`http://localhost:5079`)

  **What to do**: Same as T005 but with a different origin. Run:
  ```bash
  curl -s -o /dev/null -D - \
    -H "Origin: http://localhost:5079" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS \
    http://localhost:8976/api/Auth/login
  ```

  **Expected result**: `Access-Control-Allow-Origin: http://localhost:5079` and `Access-Control-Allow-Credentials: true`.

- [x] T007 [US1] Verify CORS allows requests from Landing Page origin (`http://localhost:3000`)

  **What to do**: Same as T005 but with origin `http://localhost:3000`. Run:
  ```bash
  curl -s -o /dev/null -D - \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS \
    http://localhost:8976/api/Auth/login
  ```

  **Expected result**: `Access-Control-Allow-Origin: http://localhost:3000` and `Access-Control-Allow-Credentials: true`.

- [x] T008 [US1] Verify CORS rejects unknown origins

  **What to do**: Run the following curl commands with unauthorized origins:
  ```bash
  # Test 1: Random evil site
  curl -s -o /dev/null -D - \
    -H "Origin: http://evil-site.com" \
    -X OPTIONS \
    http://localhost:8976/api/Auth/login

  # Test 2: Wrong localhost port
  curl -s -o /dev/null -D - \
    -H "Origin: http://localhost:9999" \
    -X OPTIONS \
    http://localhost:8976/api/Auth/login

  # Test 3: Production URL (should be rejected in Development)
  curl -s -o /dev/null -D - \
    -H "Origin: https://app.mohamy-smart.com" \
    -X OPTIONS \
    http://localhost:8976/api/Auth/login
  ```

  **Expected result**: None of the 3 responses contain an `Access-Control-Allow-Origin` header. The absence of this header means the browser will block the request.

**Checkpoint**: ✅ US1 complete — CORS restricted to known origins.

---

## Phase 4: User Story 2 — Backend Fails Fast on Missing Secrets (Priority: P2)

**Goal**: Verify the backend fails immediately with descriptive errors when secrets are missing or invalid.

**Independent Test**: Rename `appsettings.Development.json`, run `dotnet run`, confirm it exits with error listing missing keys.

### Implementation for User Story 2

- [x] T009 [US2] Verify backend fails when `appsettings.Development.json` is missing

  **What to do**: This is a **verification-only** task — the validation code was added in T003. Run the following steps:

  1. Stop the backend if it's running
  2. Rename the config file temporarily:
     ```bash
     cd mohamy-smart-backend/Lawyer
     mv appsettings.Development.json appsettings.Development.json.bak
     ```
  3. Try to start the backend:
     ```bash
     dotnet run
     ```
  4. The backend MUST exit with a non-zero code and print an error message that:
     - Contains "CONFIGURATION ERROR"
     - Lists multiple missing keys (ConnectionStrings:SqlServer, JWT:Key, OpenAI:ApiKey, etc.)
     - Mentions "appsettings.Development.json" or "appsettings.example.json"
  5. Restore the config file:
     ```bash
     mv appsettings.Development.json.bak appsettings.Development.json
     ```

  **Expected result**: Backend does NOT start. Error message lists all missing keys clearly.

- [x] T010 [US2] Verify backend fails when JWT key is too short

  **What to do**: This is a **verification-only** task. Run the following steps:

  1. Stop the backend if it's running
  2. Create a temporary copy of the config:
     ```bash
     cd mohamy-smart-backend/Lawyer
     cp appsettings.Development.json appsettings.Development.json.bak
     ```
  3. Edit `appsettings.Development.json` — change the `JWT:Key` value to a short string:
     ```json
     "JWT": {
       "Key": "TooShort"
     }
     ```
  4. Try to start the backend:
     ```bash
     dotnet run
     ```
  5. The backend MUST exit with an error that includes:
     - "JWT:Key"
     - "at least 32 characters"
  6. Restore the original config:
     ```bash
     mv appsettings.Development.json.bak appsettings.Development.json
     ```

  **Expected result**: Backend fails specifically about JWT key length.

- [x] T011 [US2] Verify backend starts normally when all secrets are correct

  **What to do**: This is a **verification-only** task. Run:

  1. Ensure `appsettings.Development.json` has all real values (not "TODO" placeholders)
  2. Start the backend:
     ```bash
     cd mohamy-smart-backend/Lawyer && dotnet run
     ```
  3. The backend MUST start with NO configuration errors
  4. Console MUST show `Now listening on: http://localhost:8976`
  5. Stop the backend

  **Expected result**: Clean startup on port 8976.

**Checkpoint**: ✅ US2 complete — fail-fast validation works.

---

## Phase 5: User Story 3 — Onboarding Template (Priority: P3)

**Goal**: Verify the example file is usable for onboarding and correctly committed.

**Independent Test**: Delete `appsettings.Development.json`, copy example file, verify it has all required keys.

### Implementation for User Story 3

- [x] T012 [US3] Verify `appsettings.example.json` contains all required keys

  **What to do**: This is a **verification-only** task — the file was created in T004. Run:

  1. Open `mohamy-smart-backend/Lawyer/appsettings.example.json`
  2. Verify it contains these sections with placeholder values:
     - `ConnectionStrings:SqlServer` — contains "YOUR_SERVER_IP"
     - `JWT:Key` — contains "YOUR_JWT_SECRET_KEY"
     - `OpenAI:ApiKey` — contains "YOUR_OPENAI_API_KEY"
     - `Gemini:ApiKey` — contains "YOUR_GEMINI_API_KEY"
     - `Paymob:APIKey` — contains "YOUR_PAYMOB_API_KEY"
     - `Paymob:SecretKey` — contains "YOUR_PAYMOB_SECRET_KEY"
     - `Paymob:PublicKey` — contains "YOUR_PAYMOB_PUBLIC_KEY"
     - `Paymob:HMAC` — contains "YOUR_PAYMOB_HMAC"
     - `Paymob:CardIntegrationId` — contains "YOUR_CARD"
     - `Paymob:MobileIntegrationId` — contains "YOUR_MOBILE"
     - `Paymob:CallbackBaseUrl` — contains "YOUR_API_DOMAIN"
  3. Verify NO real secrets are present (no `sk-proj-`, no `AIzaSy`, no `egy_sk_test_`, no real IPs)

  **Expected result**: All keys present, all values are clearly fake placeholders.

- [x] T013 [US3] Verify the onboarding flow works end-to-end

  **What to do**: This is a **verification-only** task. Simulate the new developer experience:

  1. Stop the backend
  2. Rename the real config:
     ```bash
     cd mohamy-smart-backend/Lawyer
     mv appsettings.Development.json appsettings.Development.json.bak
     ```
  3. Copy the example file:
     ```bash
     cp appsettings.example.json appsettings.Development.json
     ```
  4. Try to start the backend: `dotnet run`
  5. Backend MUST fail with config errors (because values are placeholders starting with "YOUR_")
  6. The error message should help the developer know what to fill in
  7. Restore the real config:
     ```bash
     mv appsettings.Development.json.bak appsettings.Development.json
     ```

  **Expected result**: Error message clearly lists every placeholder that needs to be replaced.

**Checkpoint**: ✅ US3 complete — onboarding template works.

---

## Phase 6: User Story 4 — Compromised Secrets Rotated (Priority: P4)

**Goal**: Rotate all credentials exposed in git history. Verify old credentials are rejected.

**Independent Test**: Extract old creds from git history → try to use them → they must fail.

### Implementation for User Story 4

- [x] T014 [US4] Rotate SQL Server database password

  **What to do**: This is a **manual/operational** task — NOT a code change.

  1. Connect to SQL Server at `91.108.121.110` using SSMS, Azure Data Studio, or `sqlcmd`
  2. Change the `SA` password (or create a new dedicated database user instead of SA):
     ```sql
     ALTER LOGIN SA WITH PASSWORD = 'NEW_STRONG_PASSWORD_HERE';
     ```
  3. Update `mohamy-smart-backend/Lawyer/appsettings.Development.json`:
     - Change the `Password=...` part in the `ConnectionStrings:SqlServer` value
  4. Test the connection by starting the backend and hitting an API that queries the DB

  **Old password (from git history — to verify it's rejected)**: `Zer0_Mohamy`
  **Verify**: Try connecting with the old password → connection MUST be refused.

---

- [x] T015 [US4] Rotate OpenAI API key

  **What to do**: This is a **manual/operational** task.

  1. Go to https://platform.openai.com/api-keys
  2. Find and **revoke/delete** the old key starting with `sk-proj-c1q40hOJ03o...`
  3. Generate a new API key
  4. Update `mohamy-smart-backend/Lawyer/appsettings.Development.json`:
     - Set `OpenAI:ApiKey` to the new key
  5. Test by triggering an AI feature in the app

  **Verify**: The old key `sk-proj-c1q40hOJ03oUaYUjLJJB...` MUST return "invalid key" if used.

---

- [x] T016 [US4] Rotate Gemini API key

  **What to do**: This is a **manual/operational** task.

  1. Go to https://aistudio.google.com/apikey
  2. Find and **delete** the old key `AIzaSyDH4EgDTcg4UAwczF6Js1OUl5axxkND3A0`
  3. Generate a new API key
  4. Update `mohamy-smart-backend/Lawyer/appsettings.Development.json`:
     - Set `Gemini:ApiKey` to the new key

  **Verify**: The old key MUST return "invalid" or "not found" if used.

---

- [x] T017 [US4] Rotate Paymob keys

  **What to do**: This is a **manual/operational** task.

  1. Log in to the Paymob merchant portal
  2. Regenerate all the following keys:
     - API Key (the long base64 string)
     - Secret Key (`egy_sk_test_697...`)
     - Public Key (`egy_pk_test_BAG...`)
     - HMAC secret (`D0C0ACC6E1EC...`)
  3. Check if integration IDs need to be regenerated (usually they stay the same)
  4. Update `mohamy-smart-backend/Lawyer/appsettings.Development.json`:
     - Set all `Paymob:*` values to the new keys
  5. Test by triggering a payment flow

  **Verify**: The old keys MUST be rejected if used.

---

- [x] T018 [US4] Rotate JWT signing key

  **What to do**: This is a **manual/operational** task.

  1. Generate a new random string of at least 64 characters. Use this command:
     ```bash
     openssl rand -base64 48
     ```
  2. Update `mohamy-smart-backend/Lawyer/appsettings.Development.json`:
     - Set `JWT:Key` to the new string
  3. **Important side effect**: All existing JWT tokens will become invalid. Users will need to log in again.

  **Old key (from git history)**: `sz8eI7OdHBrjrIo8jsnTW?rQyO1OvY0pAQ2wDKQZw!0=`
  **Verify**: A token signed with the old key MUST be rejected by the backend after this change.

---

- [x] T019 [US4] Verify all old credentials are non-functional

  **What to do**: This is a **verification-only** task. After T014-T018 are complete:

  1. Extract old secrets from git history:
     ```bash
     git show f63a9f2:mohamy-smart-backend/Lawyer/appsettings.json
     ```
  2. For each old credential, attempt to use it:
     - DB: Try connecting with old password → MUST fail
     - OpenAI: Call API with old key → MUST return 401/invalid
     - Gemini: Call API with old key → MUST return error
     - Paymob: Attempt payment with old keys → MUST fail
     - JWT: Forge a token with old secret → backend MUST reject it
  3. Confirm the backend starts and works with the NEW credentials

  **Expected result**: All old credentials rejected. Backend works with new credentials.

**Checkpoint**: ✅ US4 complete — all compromised secrets rotated and verified.

---

## Phase 7: User Story 5 — Production CORS Origins Documented (Priority: P5)

**Goal**: Verify that the CORS configuration pattern supports production origins without code changes.

**Independent Test**: Confirm production origins can be set via `appsettings.Production.json` or environment variables.

### Implementation for User Story 5

- [x] T020 [US5] Verify production CORS origins can be configured without code changes

  **What to do**: This is a **verification-only** task — no code changes needed. The CORS implementation from T002 already reads from config. Verify:

  1. Check that the CORS code in `WebApplicationServices.cs` reads from `configuration.GetSection("CorsOrigins")` — this means any config source (appsettings, environment variables) works
  2. Verify that environment variables can override the array:
     ```bash
     CorsOrigins__0=https://mohamy-smart.com \
     CorsOrigins__1=https://app.mohamy-smart.com \
     CorsOrigins__2=https://admin.mohamy-smart.com \
     dotnet run --environment Production
     ```
     (This test is informational — do NOT actually run in production mode against the dev DB)
  3. Alternatively, create a temporary `appsettings.Production.json`:
     ```json
     {
       "CorsOrigins": [
         "https://mohamy-smart.com",
         "https://app.mohamy-smart.com",
         "https://admin.mohamy-smart.com"
       ]
     }
     ```
     This file would be git-ignored and used only on the production server.

  **Expected result**: The pattern supports production origins without modifying any C# code. The production origins are: `https://mohamy-smart.com`, `https://app.mohamy-smart.com`, `https://admin.mohamy-smart.com`.

**Checkpoint**: ✅ US5 complete — production CORS documented and configurable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, git hygiene, and commit.

- [x] T021 [P] Verify `appsettings.example.json` is committed to version control

  **What to do**: Run from the repo root:
  ```bash
  git add mohamy-smart-backend/Lawyer/appsettings.example.json
  git status
  ```

  The file MUST appear in staged changes (or already tracked). It MUST be committed because it contains only placeholder values.

- [x] T022 [P] Verify `appsettings.Development.json` is NOT committed to version control

  **What to do**: Run from the repo root:
  ```bash
  git ls-files mohamy-smart-backend/Lawyer/appsettings.Development.json
  ```

  This command MUST return empty (no output). If it returns a path, the `.gitignore` rules are broken — this is a **Constitution Principle I violation**.

- [x] T023 [P] Verify Lawyer Dashboard still works with restricted CORS

  **What to do**: End-to-end regression test:

  1. Start the backend: `cd mohamy-smart-backend/Lawyer && dotnet run`
  2. Start the Lawyer Dashboard: `cd mohamy-smart-lawyer-dashboard && npm run dev`
  3. Open `http://localhost:5078` in a browser
  4. Open DevTools → Network tab
  5. Try to log in or trigger any API call
  6. Check that:
     - The request goes to `http://localhost:8976/api/...`
     - The response has `Access-Control-Allow-Origin: http://localhost:5078`
     - NO CORS errors appear in the Console tab
  7. Stop both

  **Expected result**: Zero CORS errors. All API calls succeed. SC-005 confirmed.

- [x] T024 Commit all changes with descriptive message

  **What to do**: From the repo root, run:

  ```bash
  git add mohamy-smart-backend/Lawyer/appsettings.json
  git add mohamy-smart-backend/Lawyer/appsettings.example.json
  git add mohamy-smart-backend/Lawyer/Extensions/WebApplicationServices.cs
  git add mohamy-smart-backend/Lawyer/Program.cs
  git commit -m "feat(003): security & secrets hardening — restrict CORS, add startup validation, create onboarding template

  - Replace AllowAnyOrigin CORS with configurable AllowedOrigins from appsettings.json (FR-001, FR-002)
  - Add AllowCredentials() for cross-origin Authorization headers (Clarification Q3)
  - Rename CORS policy from 'AllowAny' to 'CorsPolicy'
  - Add startup config validation: fail-fast on missing/placeholder secrets (FR-004, FR-005)
  - Validation is format-only: no DB ping, no external connectivity (FR-012)
  - Create appsettings.example.json onboarding template (FR-006, FR-007)
  - Add CorsOrigins array to appsettings.json for Development origins
  - Credential rotation tracked separately (FR-008, FR-009)
  - Constitution Principle I: Security-First ✅"
  ```

  **Note**: T014-T019 (credential rotation) modify `appsettings.Development.json` which is git-ignored — those changes are NOT committed (by design).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately. **T001, T002, T003, T004 can ALL run in parallel** (they edit different files)
- **US1 (Phase 3)**: Depends on T001 + T002 + T003 (CORS config + code + policy rename)
- **US2 (Phase 4)**: Depends on T003 (startup validation code)
- **US3 (Phase 5)**: Depends on T004 (example file must exist) + T003 (validation must catch placeholders)
- **US4 (Phase 6)**: No code dependencies — can start anytime. Depends on access to third-party portals
- **US5 (Phase 7)**: Depends on T002 (CORS reads from config)
- **Polish (Phase 8)**: Depends on all user stories passing

### User Story Dependencies

```text
T001 ──┐
T002 ──┼── T005/T006/T007/T008 (US1) ──────┐
T003 ──┤                                     │
       ├── T009/T010/T011 (US2) ────────────┤
T004 ──┼── T012/T013 (US3) ────────────────┤
       │                                     ├── T021/T022/T023/T024 (Polish)
T014 ──┤                                     │
T015 ──┤                                     │
T016 ──┼── T019 (US4 verify) ──────────────┤
T017 ──┤                                     │
T018 ──┘                                     │
                                             │
T020 (US5) ──────────────────────────────────┘
```

### Parallel Opportunities

**Maximum parallelism available:**

1. **T001 + T002 + T003 + T004**: All 4 foundational tasks edit different files — run in parallel
2. **T005 + T006 + T007 + T008**: US1 CORS verification tests — run in parallel (same curl pattern)
3. **T009 + T010**: US2 validation tests — run sequentially (both modify the config file)
4. **T014 + T015 + T016 + T017 + T018**: US4 credential rotation — all can happen in parallel (different services)
5. **T021 + T022 + T023**: Polish verification checks — run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Apply T001 + T002 + T003 (CORS restriction + validation + policy rename) — **~15 min**
2. Run T005-T008 (verify CORS with curl) — **~5 min**
3. ✅ MVP complete — backend CORS is secured

### Incremental Delivery

1. T001 + T002 + T003 + T004 → All 4 foundational code changes — **~20 min**
2. T005-T008 → Verify US1 (CORS restricted) — **~5 min**
3. T009-T011 → Verify US2 (fail-fast validation) — **~10 min**
4. T012-T013 → Verify US3 (onboarding template) — **~5 min**
5. T014-T019 → US4 (credential rotation) — **~30-60 min** (depends on portal access)
6. T020 → Verify US5 (production CORS pattern) — **~5 min**
7. T021-T024 → Polish & commit — **~5 min**

**Total estimated time**: ~60-90 minutes (credential rotation is the longest step)

---

## Notes

- Only **4 tasks** (T001-T004) require actual code/file changes — everything else is verification or manual operations
- T001-T004 all edit different files — maximum parallelism possible
- T014-T018 (credential rotation) are manual tasks requiring third-party portal access
- The startup validation (T003) runs ONLY in Development mode — it won't affect production
- After credential rotation (T014-T018), `appsettings.Development.json` changes are NOT committed (git-ignored by design)
- Commit after T004 (all code changes) at T024 — credential rotation is tracked separately
