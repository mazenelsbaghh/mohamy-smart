# Tasks: P0 — Emergency Critical Security Fixes

**Input**: Design documents from `/specs/060-p0-critical-security-fixes/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file path(s) in descriptions
- Keep each task small enough for a low-cost LLM to execute without architectural guesswork
- Prefer one artifact per task; if needed, keep to at most 3 explicit file paths
- Use concrete verbs such as `Add`, `Implement`, `Wire`, `Update`, `Create`, `Validate`

## Path Conventions

- **Backend**: `mohamy-smart-backend/Lawyer.Application/`, `mohamy-smart-backend/Lawyer.Infrastracture/`, `mohamy-smart-backend/Lawyer/`
- **Admin Dashboard**: `apps/admin-dashboard/src/`
- **Lawyer Dashboard**: `apps/lawyer-dashboard/src/`
- **Landing Page**: `apps/landing/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project scaffolding needed — this feature modifies existing files only. This phase is empty.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites — all user stories can begin immediately.

---

## Phase 3: User Story 1 — OTP Codes No Longer Exposed in Logs (Priority: P1) 🎯 MVP

**Goal**: Remove all OTP code values from log statements in AuthService, replacing with masked phone identifiers only.

**Independent Test**: Trigger OTP send and verify flows, then search all log output for raw OTP code patterns — zero matches expected.

### Implementation for User Story 1

- [x] T001 [US1] Replace OTP code logging at line 276 in `mohamy-smart-backend/Lawyer.Application/Services/AuthService.cs` — change `_logger.LogWarning("🚨 DEV OTP CODE FOR {Phone}: {Code} 🚨", user.PhoneNumber, otpCode)` to `_logger.LogInformation("OTP generated for {Phone}", MaskPhone(user.PhoneNumber ?? string.Empty))` removing the `otpCode` parameter entirely
- [x] T002 [US1] Replace OTP verification logging at line 674 in `mohamy-smart-backend/Lawyer.Application/Services/AuthService.cs` — change `_logger.LogWarning("Verifying OTP for {Phone}, Provided: '{ProvidedCode}', Valid: {IsValid}", phone, trimmedCode, isValid)` to `_logger.LogInformation("OTP verification attempted for {Phone}, IsValid: {IsValid}", MaskPhone(phone), isValid)` removing the `trimmedCode` parameter entirely
- [x] T003 [US1] Search entire `AuthService.cs` file for any other log statements that include OTP code values (variables named `otpCode`, `code`, `trimmedCode`, or `request.Code`) and remove the code value from those log calls in `mohamy-smart-backend/Lawyer.Application/Services/AuthService.cs`
- [x] T004 [US1] Search all `.cs` files in `mohamy-smart-backend/` for any other log statements containing OTP-related variables and remove code values from those calls — grep for patterns like `_logger.*otpCode`, `_logger.*Code`, `_logger.*trimmedCode` across all service files

**Checkpoint**: No OTP code values appear in any log statement across the entire backend. Verify with `grep -rn "otpCode" mohamy-smart-backend/ --include="*.cs" | grep -i "log"` returning zero matches.

---

## Phase 4: User Story 2 — No Secrets or Credentials in Source Code (Priority: P1)

**Goal**: Replace the real Google Vision API key in `appsettings.example.json` with a placeholder. Verify `appsettings.Development.json` is gitignored.

**Independent Test**: `grep -i "AIzaSy" mohamy-smart-backend/Lawyer/appsettings.example.json` returns zero matches.

### Implementation for User Story 2

- [x] T005 [US2] Replace the real Google Vision API key with placeholder at line 9 in `mohamy-smart-backend/Lawyer/appsettings.example.json` — change `"ApiKey": "AIzaSyCoLVAdtiPTi_ygh4QpPbwga1QWXbyjetw"` to `"ApiKey": "YOUR_GOOGLE_VISION_API_KEY"`
- [x] T006 [US2] Verify `appsettings.Development.json` is gitignored — confirm that `mohamy-smart-backend/.gitignore` contains `**/appsettings.Development.json` and `**/appsettings.*.json` entries, and that the file is not tracked by git

**Checkpoint**: No real API keys or credentials exist in any tracked file in the repository.

---

## Phase 5: User Story 3 — Database Schema Not Leaked in API Error Responses (Priority: P1)

**Goal**: Return generic error message for `DbUpdateException` and fix the HTTP status code from 400 to 500.

**Independent Test**: Trigger a DB unique constraint violation via API and verify the response contains only "A database error occurred. Please try again." with HTTP status 500.

### Implementation for User Story 3

- [x] T007 [US3] Update `DbUpdateException` handler in `mohamy-smart-backend/Lawyer/Middlewares/ExceptionMiddleware.cs` (lines 52-57) — change `HttpStatusCode.BadRequest` to `HttpStatusCode.InternalServerError`, remove the `dbMessage` variable, replace `_responseHandler.BadRequest<string>(dbMessage)` with `_responseHandler.ServerError<string>("A database error occurred. Please try again.")`, and simplify the log call to `_logger.LogError(dbUpdateEx, "Database update error.")`

**Checkpoint**: DB error API responses return HTTP 500 with generic message only. Server-side logs still contain full exception details for debugging.

---

## Phase 6: User Story 4 — File Uploads Reject Dangerous Files (Priority: P1)

**Goal**: Add filename sanitization and file extension whitelist validation to both upload methods in `FileUploadService`.

**Independent Test**: Upload `.exe` file → rejected. Upload `../../../etc/passwd.pdf` → sanitized filename stored. Upload `.pdf` → accepted.

### Implementation for User Story 4

- [x] T008 [US4] Add a `private static readonly HashSet<string> AllowedExtensions` field (case-insensitive) containing `.pdf`, `.doc`, `.docx`, `.jpg`, `.jpeg`, `.png` at class level in `mohamy-smart-backend/Lawyer.Infrastracture/Services/FileUploadService.cs`
- [x] T009 [US4] Add a `private static string SanitizeFileName(string rawFileName)` method that returns `Path.GetFileName(rawFileName) ?? "unknown"` in `mohamy-smart-backend/Lawyer.Infrastracture/Services/FileUploadService.cs`
- [x] T010 [US4] Add a `private static void ValidateFileExtension(string fileName)` method that extracts extension via `Path.GetExtension`, checks it exists in `AllowedExtensions`, and throws `ArgumentException` with Arabic error message if not, in `mohamy-smart-backend/Lawyer.Infrastracture/Services/FileUploadService.cs`
- [x] T011 [US4] Update `UploadClientFileAsync` in `mohamy-smart-backend/Lawyer.Infrastracture/Services/FileUploadService.cs` to call `ValidateFileExtension(file.FileName)` and `SanitizeFileName(file.FileName)` before constructing the file path — replace `file.FileName` in the `$"{Guid.NewGuid()}_{file.FileName}"` line with the sanitized name
- [x] T012 [US4] Update `UploadGeneralFileAsync` in `mohamy-smart-backend/Lawyer.Infrastracture/Services/FileUploadService.cs` with the same `ValidateFileExtension` and `SanitizeFileName` calls — same pattern as T011

**Checkpoint**: All file uploads validate extension against whitelist and sanitize filenames. Dangerous files are rejected with clear error messages.

---

## Phase 7: User Story 5 — Application Does Not Crash from Corrupt localStorage (Priority: P2)

**Goal**: Wrap `JSON.parse` in try-catch in both dashboard authSlice files so corrupted localStorage data is auto-cleaned instead of crashing.

**Independent Test**: Set `localStorage.setItem("admin_user", "{invalid")` in admin dashboard, refresh → shows login page, not crash. Same for `"user"` key in lawyer dashboard.

### Implementation for User Story 5

- [x] T013 [P] [US5] Replace lines 26-29 in `apps/admin-dashboard/src/redux/auth/authSlice.ts` — remove `const savedUser = localStorage.getItem("admin_user")` and `user: savedUser ? JSON.parse(savedUser) : null`, replace with a `getSavedUser` helper function that wraps `localStorage.getItem` + `JSON.parse` in try-catch, calls `localStorage.removeItem("admin_user")` on failure, and returns `null`
- [x] T014 [P] [US5] Replace lines 35-38 in `apps/lawyer-dashboard/src/redux/auth/authSlice.ts` — remove `const savedUser = localStorage.getItem("user")` and `user: savedUser ? JSON.parse(savedUser) : null`, replace with a `getSavedUser` helper function that wraps `localStorage.getItem` + `JSON.parse` in try-catch, calls `localStorage.removeItem("user")` on failure, and returns `null`

**Checkpoint**: Both dashboards recover gracefully from corrupted localStorage. Invalid entries are auto-removed and the user sees the login page.

---

## Phase 8: User Story 6 — Empty Register Page Removed from Landing Site (Priority: P2)

**Goal**: Delete the empty register page directory, unused RegisterForm component, and its validation schema from the landing site.

**Independent Test**: `ls apps/landing/src/app/register/` returns "No such file or directory". Landing site builds successfully with `npm run build`.

### Implementation for User Story 6

- [x] T015 [US6] Delete the entire register page directory `apps/landing/src/app/register/`
- [x] T016 [US6] Delete the unused RegisterForm component at `apps/landing/src/components/auth/RegisterForm.tsx`
- [x] T017 [US6] Check if `apps/landing/src/lib/validations/registerSchema.ts` is imported by any other file besides RegisterForm — if not, delete it. Search for `registerSchema` imports across all `.ts` and `.tsx` files in `apps/landing/src/`
- [x] T018 [US6] Verify landing site builds successfully by running `npm run build` in `apps/landing/` and confirming no errors about missing register page or RegisterForm

**Checkpoint**: Landing site has no register route, no dead RegisterForm code, and builds cleanly.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and build validation across all apps.

- [x] T019 [P] Build and verify backend compiles successfully — run `dotnet build` in `mohamy-smart-backend/`
- [x] T020 [P] Build and verify admin dashboard compiles successfully — run `npm run build` in `apps/admin-dashboard/`
- [x] T021 [P] Build and verify lawyer dashboard compiles successfully — run `npm run build` in `apps/lawyer-dashboard/`
- [x] T022 Run the full quickstart validation from `specs/060-p0-critical-security-fixes/quickstart.md` to verify all acceptance scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no setup needed
- **Foundational (Phase 2)**: Empty — no blocking prerequisites
- **User Stories (Phase 3-8)**: All independent — can proceed in any order or in parallel
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (OTP Logging)**: No dependencies — modifies `AuthService.cs` only
- **User Story 2 (Credentials)**: No dependencies — modifies `appsettings.example.json` only
- **User Story 3 (DB Errors)**: No dependencies — modifies `ExceptionMiddleware.cs` only
- **User Story 4 (File Upload)**: No dependencies — modifies `FileUploadService.cs` only
- **User Story 5 (localStorage)**: No dependencies — modifies two different `authSlice.ts` files
- **User Story 6 (Register Page)**: No dependencies — deletes landing site files only

### Within Each User Story

- US1: T001 → T002 → T003 → T004 (sequential — same file for T001-T003, then broader search)
- US2: T005 and T006 are independent
- US3: T007 is single task
- US4: T008 → T009 → T010 (add infrastructure) → T011, T012 (apply to both methods)
- US5: T013 and T014 are independent (different apps)
- US6: T015, T016, T017 can run in parallel → T018 validates

### Parallel Opportunities

- **All 6 user stories** can be worked on simultaneously by different developers
- **T013 and T014** (localStorage fix) can run in parallel (different apps)
- **T008, T009, T010** (file upload infrastructure) can be combined into a single edit session
- **T015, T016, T017** (file deletions) can run in parallel
- **T019, T020, T021** (build verification) can run in parallel

---

## Parallel Example: Maximum Parallelism

```bash
# All user stories can run simultaneously:
Task: "T001-T004: Fix OTP logging in AuthService.cs"
Task: "T005-T006: Fix leaked credentials in appsettings.example.json"
Task: "T007: Fix DB error exposure in ExceptionMiddleware.cs"
Task: "T008-T012: Add file upload security in FileUploadService.cs"
Task: "T013: Fix admin dashboard localStorage crash"
Task: "T014: Fix lawyer dashboard localStorage crash"
Task: "T015-T017: Delete landing register page and dead code"
```

---

## Implementation Strategy

### MVP First (User Stories 1-4 only — Backend P1 fixes)

1. Complete US1: OTP logging fix (2 files, ~10 minutes)
2. Complete US2: Credentials fix (1 file, ~2 minutes)
3. Complete US3: DB error fix (1 file, ~5 minutes)
4. Complete US4: File upload security (1 file, ~20 minutes)
5. **STOP and VALIDATE**: Run backend build, verify with quickstart.md steps 1-4
6. Deploy backend if ready

### Full Delivery (All 6 User Stories)

1. Backend P1 fixes (US1-US4) → Deploy backend
2. Frontend P2 fixes (US5-US6) → Deploy frontends
3. Polish (Phase 9) → Final build verification
4. Revoke Google API key in Google Cloud Console (manual, post-merge)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No test tasks included — tests were not explicitly requested in the spec
- `ApiExceptionResponse.ServerError<T>()` method confirmed to exist (line 30 of `ApiExceptionResponse.cs`) — use it for the ExceptionMiddleware fix
- Admin localStorage key is `"admin_user"`, Lawyer localStorage key is `"user"` — use correct key per app
- Post-merge action: Revoke Google Vision API key `AIzaSyCoLVAdtiPTi_ygh4QpPbwga1QWXbyjetw` in Google Cloud Console
