# Tasks: Phase 1 — Backend Critical Fixes

**Input**: Design documents from `/specs/061-p1-backend-fixes/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Exact file paths in every task description
- One artifact per task; max 3 file paths if truly inseparable

## Path Prefix

All backend paths are relative to:
`/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/`

Abbreviated below as `$BACKEND`.

---

## Phase 1: Setup (Namespace Fixes & DI Bootstrap)

**Purpose**: Fix broken namespaces and imports that block all subsequent work.

- [x] T001 Fix namespace in $BACKEND/Lawyer.Application/Services/AccountService.cs — change `namespace Lawyer.Infrastracture.Services.Identity` to `namespace Lawyer.Application.Services`
- [x] T002 [P] Fix namespace in $BACKEND/Lawyer.Application/Validators/LoginValidator.cs — remove nested `MyProject.Core.Validators.Auth` namespace, move both `LoginValidator` and `AdminLoginValidator` classes to `namespace Lawyer.Application.Validators`
- [x] T003 [P] Fix broken import in $BACKEND/Lawyer/Controllers/SubscriptionController.cs — replace `using Lawyer.Application.Validators.MyProject.Core.Validators.Auth;` with the correct `using Lawyer.Application.Validators;`

---

## Phase 2: Foundational (Shared Utilities & Infrastructure)

**Purpose**: Create shared utility classes and infrastructure that ALL user stories depend on. MUST complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Create OtpHelper static class in $BACKEND/Lawyer.Application/Common/OtpHelper.cs — extract `GenerateOtpCode()`, `GenerateSalt()`, `HashOtpCode(string code, string salt)`, `MatchesOtp(string plainTextCode, string storedHash, string salt)` from AuthService.cs private methods (lines 155–171). Use `RandomNumberGenerator` for OTP gen, `SHA256` for hashing, `HMACSHA256` for matching. All methods must be `public static`.
- [x] T005 [P] Create EmailTemplateBuilder static class in $BACKEND/Lawyer.Application/Common/EmailTemplateBuilder.cs — extract `BuildEmailTemplate(string title, string body)` from AuthService.cs private method (line 51). Returns Arabic RTL HTML string with Tajawal font, same styling as the original. Method must be `public static`.
- [x] T006 [P] Create ILawyerIdResolver interface in $BACKEND/Lawyer.Application/IServices/ILawyerIdResolver.cs and LawyerIdResolver service in $BACKEND/Lawyer.Application/Common/LawyerIdResolver.cs — extract pattern from CaseService.cs line 337. Constructor takes `IHttpContextAccessor` and `IUnitOfWork`. Method `Task<Result<Guid>> ResolveAsync(Guid? overrideId, CancellationToken ct)` resolves current user via HTTP claims → finds their Lawyer entity via `_unitOfWork.Repository<LawyerProfile>()` → returns Lawyer ID. If `overrideId` is provided and user is Admin, use it directly. Returns `Result<Guid>.Failure("...")` on auth failure.
- [x] T007 [P] Create PaginationDefaults static class in $BACKEND/Lawyer.Application/Common/PaginationDefaults.cs — constants `DefaultPageSize = 10`, `MaxPageSize = 100`. Method `public static int ClampPageSize(int pageSize)` returns `DefaultPageSize` when `pageSize <= 0`, otherwise `Math.Min(pageSize, MaxPageSize)`.
- [x] T008 [P] Create PromptTemplateCache singleton service in $BACKEND/Lawyer.Application/Common/PromptTemplateCache.cs — constructor takes `IWebHostEnvironment` (or string `contentRootPath`). Private `ConcurrentDictionary<string, string> _cache`. Method `public async Task<string> GetAsync(string relativePath, CancellationToken ct)` uses `_cache.GetOrAdd` with async factory that calls `File.ReadAllTextAsync(Path.Combine(_contentRootPath, "wwwroot", "prompts", relativePath), ct)`. Must be registered as Singleton in DI.
- [x] T009 [P] Create AuditInterceptor in $BACKEND/Lawyer.Infrastracture/Persistence/AuditInterceptor.cs — extends `SaveChangesInterceptor`. Constructor takes `IHttpContextAccessor`. Override `SavingAsync` — iterate `eventData.Entries`, for entries with `State == EntityState.Added` and entity is `BaseEntity<Guid>`, set `CreatedBy` to current user GUID from `ClaimTypes.NameIdentifier`. For `State == EntityState.Modified`, set `UpdatedBy` and `Updated = DateTime.UtcNow`. Gracefully handle null HTTP context (Hangfire background jobs) by skipping audit field population.
- [x] T010 Register all new services in $BACKEND/Lawyer/Program.cs — add `builder.Services.AddSingleton<AuditInterceptor>()`, `builder.Services.AddScoped<ILawyerIdResolver, LawyerIdResolver>()`, `builder.Services.AddSingleton<PromptTemplateCache>()`. In DbContext options, chain `.AddInterceptors(new AuditInterceptor(...))` or resolve from DI. Add FluentValidation: `builder.Services.AddValidatorsFromAssembly(typeof(LoginValidator).Assembly)` and `builder.Services.AddFluentValidationAutoValidation()`. Verify existing `FluentValidation` and `FluentValidation.AspNetCore` NuGet packages are referenced in Lawyer.Application and Lawyer projects.

**Checkpoint**: Foundation ready — all shared utilities available for user stories.

---

## Phase 3: User Story 1 — Data Integrity for Case Creation & Password Reset (Priority: P1) 🎯 MVP

**Goal**: Ensure atomic case creation with transactions, auto-populated audit fields, and refresh token invalidation on password change.

**Independent Test**: Create a case, force a failure on last step → verify full rollback (no partial records). Change password → verify old refresh token is rejected.

- [x] T011 [US1] Add transaction wrapper to CreateCaseAsync in $BACKEND/Lawyer.Application/Services/CaseService.cs — wrap the entire method body (lines 46–139) in `await using var transaction = await _unitOfWork.BeginTransactionAsync();` with try/catch. Commit on success, rollback on exception. Remove individual `SaveChangesAsync` calls where redundant — keep a single commit point before `transaction.CommitAsync()`. The transaction must encompass client creation (if new), case creation, and all relationship linking. (depends on T010 for IUnitOfWork.BeginTransactionAsync availability)
- [x] T012 [P] [US1] Add refresh token invalidation to ResetPasswordAsync in $BACKEND/Lawyer.Application/Services/AuthService.cs — after the `UserManager.ResetPasswordAsync()` call succeeds (~line 900), add `user.RefreshToken = null;` and `user.RefreshTokenExpiresAt = null;`, then `await _userManager.UpdateAsync(user);`. This ensures all active sessions are terminated when password is reset via OTP flow.
- [x] T013 [P] [US1] Add refresh token invalidation to ChangePasswordAsync in $BACKEND/Lawyer.Application/Services/AuthService.cs — find the change password method (may be in AccountController or AccountService). After successful password change, set `user.RefreshToken = null;` and `user.RefreshTokenExpiresAt = null;`, then save. Same pattern as T012.

**Checkpoint**: User Story 1 complete — case creation is atomic, audit fields auto-populate (via AuditInterceptor from T009), password changes invalidate sessions.

---

## Phase 4: User Story 2 — Input Validation on All DTOs (Priority: P2)

**Goal**: Add FluentValidation to all DTOs so invalid data returns structured 400 errors with Arabic messages instead of silent corruption or 500 errors.

**Independent Test**: POST to each endpoint with invalid data (empty required fields, bad phone format, oversized strings) → verify 400 with Arabic field-level error messages.

- [x] T014 [P] [US2] Create CaseValidator in $BACKEND/Lawyer.Application/Validators/CaseValidator.cs — two classes: `CreateCaseValidator : AbstractValidator<CreateCaseDto>` with rules: Title Required() with Arabic message "عنوان القضية مطلوب", Title MaximumLength(200) "عنوان القضية يجب ألا يتجاوز 200 حرف", Number Required() "رقم القضية مطلوب", Court Required() "اسم المحكمة مطلوب", ClientName Required() "اسم العميل مطلوب". Also `UpdateCaseValidator : AbstractValidator<UpdateCaseDto>` with identical rules for Title, Number, Court, ClientName. Both in `namespace Lawyer.Application.Validators`.
- [x] T015 [P] [US2] Create ClientValidator in $BACKEND/Lawyer.Application/Validators/ClientValidator.cs — two classes: `CreateClientValidator : AbstractValidator<CreateClientDto>` with rules: ClientName Required() "اسم العميل مطلوب", PhoneNumber Required() + Must use existing `CustomValidator.BeAValidEgyptianPhoneNumber()` "صيغة رقم الهاتف غير صحيحة", Email optional but `EmailAddress()` when provided "صيغة البريد الإلكتروني غير صحيحة", NationalId optional but `Must(CustomValidator.BeAValidSaudiNationalId())` when provided "صيغة الرقم القومي غير صحيحة". `UpdateClientValidator : AbstractValidator<UpdateClientDto>` with identical rules. Use `Lawyer.Application.Common.CustomValidator` for phone/national ID helpers.
- [x] T016 [P] [US2] Create ChangePasswordValidator in $BACKEND/Lawyer.Application/Validators/ChangePasswordValidator.cs — `ChangePasswordValidator : AbstractValidator<ChangePasswordDto>` with rules: CurrentPassword NotEmpty() "كلمة المرور الحالية مطلوبة", NewPassword NotEmpty() + minimum 8 chars + must match existing complexity regex from RegisterValidator "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل", ConfirmPassword Equal(p => p.NewPassword) "تأكيد كلمة المرور غير متطابق", OtpCode NotEmpty() "رمز التحقق مطلوب". Reference the existing password regex from `RegisterValidator.cs` to keep complexity rules consistent.
- [x] T017 [P] [US2] Create ContactRequestValidator in $BACKEND/Lawyer.Application/Validators/ContactRequestValidator.cs — `SubmitContactRequestValidator : AbstractValidator<SubmitContactRequestDto>` with rules: Name NotEmpty() "الاسم مطلوب", Phone NotEmpty() + Must use `CustomValidator.BeAValidEgyptianPhoneNumber()` "صيغة رقم الهاتف غير صحيحة", Message NotEmpty() "الرسالة مطلوبة" + MaximumLength(1000) "الرسالة يجب ألا تتجاوز 1000 حرف". All in `namespace Lawyer.Application.Validators`.
- [x] T018 [P] [US2] Fix LoginValidator in $BACKEND/Lawyer.Application/Validators/LoginValidator.cs — in the `LoginValidator` class, remove all password complexity rules (regex, length) from the `Password` rule. Keep only `RuleFor(x => x.PhoneNumber).NotEmpty()` and `RuleFor(x => x.Password).NotEmpty()`. Do NOT touch `AdminLoginValidator`. Namespace already fixed in T002. (depends on T002)
- [x] T019 [US2] Add payment method whitelist validation to InitiatePaymentAsync in $BACKEND/Lawyer.Application/Services/PaymobService.cs — at the start of the method (~line 44), add a guard: `if (paymentMethod.ToLower() is not ("card" or "wallet"))` → return `Result<PaymentDto>.Failure("طريقة الدفع غير صالحة. يجب أن تكون 'card' أو 'wallet'")`. This must be checked before any Paymob API call.
- [x] T020 [US2] Register validators and verify FluentValidation auto-validation in $BACKEND/Lawyer/Program.cs — confirm `AddValidatorsFromAssembly(typeof(LoginValidator).Assembly)` is present (added in T010). Add `FluentValidationAutoValidation` middleware in the pipeline after `AddControllers()` or equivalent. If the project uses `AddFluentValidationAutoValidation()` from `FluentValidation.AspNetCore`, ensure it's called. Verify the Lawyer.Application project references `FluentValidation` and `FluentValidation.AspNetCore` NuGet packages. (depends on T010)

**Checkpoint**: User Story 2 complete — all DTOs validated, invalid requests return 400 with Arabic field errors.

---

## Phase 5: User Story 3 — Performance Quick Wins (Priority: P3)

**Goal**: Eliminate the N+1 query in account listing, cap page sizes at 100, and cache all prompt templates in memory.

**Independent Test**: Load admin account listing → verify faster response. Request `pageSize=500` → verify capped at 100. Send multiple AI requests → verify no disk reads after first.

- [x] T021 [US3] Replace correlated subquery with GROUP BY dictionary in $BACKEND/Lawyer.Application/Services/AccountService.cs — before the main lawyer listing query (~line 88), add a separate query: `var caseCounts = await _unitOfWork.Repository<Case>().AsQueryable().Where(c => c.IsActive).GroupBy(c => c.LawyerId).Select(g => new { LawyerId = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.LawyerId, x => x.Count, cancellationToken);`. Then replace the correlated `casesQuery.Count(c => c.LawyerId == u.Lawyer.Id)` in the Select projection (line 140) with `caseCounts.GetValueOrDefault(u.Lawyer.Id)`. Remove the `casesQuery` variable declaration (line 109) as it's no longer needed. (depends on T001 for namespace fix)
- [x] T022 [P] [US3] Apply PaginationDefaults.ClampPageSize in all paginated service methods — in $BACKEND/Lawyer.Application/Services/CaseService.cs, add `pageSize = PaginationDefaults.ClampPageSize(pageSize);` at the start of every method that accepts `pageSize` parameter (GetAllCasesAsync, etc.). Repeat in $BACKEND/Lawyer.Application/Services/ClientService.cs, $BACKEND/Lawyer.Application/Services/LawyerTaskService.cs, and any other service with `pageSize` parameters. Add `using Lawyer.Application.Common;` to each file. (depends on T007)
- [x] T023 [US3] Replace File.ReadAllTextAsync with PromptTemplateCache.GetAsync in $BACKEND/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs — inject `PromptTemplateCache` via constructor (add to existing constructor parameters). Replace `await System.IO.File.ReadAllTextAsync(Path.Combine(_contentRootPath, "wwwroot", "prompts", GetPromptFolderName(), GetStepFileName(stepNumber)), ct)` (~line 158) with `await _promptCache.GetAsync(Path.Combine(GetPromptFolderName(), GetStepFileName(stepNumber)), ct)`. Remove `_contentRootPath` field if no longer needed in this class. (depends on T008, T010)
- [x] T024 [US3] Replace File.ReadAllTextAsync with PromptTemplateCache.GetAsync in $BACKEND/Lawyer.Application/Services/SmartAnalysisService.cs — inject `PromptTemplateCache` via constructor. Replace all 8 `File.ReadAllTextAsync` calls with `_promptCache.GetAsync(relativePath, ct)`. The relative path is the portion after `wwwroot/prompts/`. Remove `_contentRootPath` usage from these call sites. (depends on T008, T010)
- [x] T025 [P] [US3] Replace File.ReadAllTextAsync with PromptTemplateCache.GetAsync in $BACKEND/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs — same pattern as T024. Inject cache, replace all ~12 `File.ReadAllTextAsync` calls (steps 1–6, each with promptTemplatePath and systemPromptContent reads). (depends on T008, T010)
- [x] T026 [P] [US3] Replace File.ReadAllTextAsync with PromptTemplateCache.GetAsync in $BACKEND/Lawyer.Application/Services/LegalContractService.cs — inject cache, replace all 3 `File.ReadAllTextAsync` calls for legal-contract-draft, contract-step1-analysis, contract-step3-review prompts. (depends on T008, T010)
- [x] T027 [P] [US3] Replace File.ReadAllTextAsync with PromptTemplateCache.GetAsync in $BACKEND/Lawyer.Application/Services/CaseOcrService.cs — inject cache, replace the single `File.ReadAllTextAsync` call (~line 289) for ocr-extraction prompt. (depends on T008, T010)
- [x] T028 [P] [US3] Replace File.ReadAllTextAsync with PromptTemplateCache.GetAsync in $BACKEND/Lawyer.Application/Services/ClarifyFactsService.cs — inject cache, replace the single `File.ReadAllTextAsync` call (~line 86) for clarify-facts prompt. (depends on T008, T010)

**Checkpoint**: User Story 3 complete — N+1 query eliminated, page sizes bounded, prompt templates cached.

---

## Phase 6: User Story 4 — Code Quality & Maintainability (Priority: P4)

**Goal**: Eliminate code duplication by updating all callers to use the shared utilities created in Phase 2.

**Independent Test**: Build succeeds. Grep for private `GenerateOtpCode`, `BuildEmailTemplate`, `ResolveLawyerIdAsync` — zero matches in service files.

- [x] T029 [US4] Update AuthService to use OtpHelper in $BACKEND/Lawyer.Application/Services/AuthService.cs — replace all calls to private methods `GenerateOtpCode()`, `GenerateSalt()`, `HashOtpCode()`, `MatchesOtp()` with `OtpHelper.GenerateOtpCode()`, `OtpHelper.GenerateSalt()`, `OtpHelper.HashOtpCode()`, `OtpHelper.MatchesOtp()`. Delete the 4 private methods (lines 155–171). Add `using Lawyer.Application.Common;`. (depends on T004)
- [x] T030 [P] [US4] Update AccountService to use OtpHelper in $BACKEND/Lawyer.Application/Services/AccountService.cs — same as T029 but for AccountService. Replace private `GenerateOtpCode()`, `GenerateSalt()`, `HashOtpCode()`, `MatchesOtp()` with `OtpHelper.*`. Delete the 4 private methods (lines 47–71). Add `using Lawyer.Application.Common;`. (depends on T004)
- [x] T031 [P] [US4] Update AuthService to use EmailTemplateBuilder in $BACKEND/Lawyer.Application/Services/AuthService.cs — replace the private `BuildEmailTemplate()` call (line 51) with `EmailTemplateBuilder.BuildEmailTemplate(title, body)`. Delete the private method. Add `using Lawyer.Application.Common;`. (depends on T005)
- [x] T032 [P] [US4] Update SubscriptionService to use EmailTemplateBuilder in $BACKEND/Lawyer.Application/Services/SubscriptionService.cs — replace the private `BuildEmailTemplate()` call (line 371) with `EmailTemplateBuilder.BuildEmailTemplate(title, body)`. Delete the private method. Add `using Lawyer.Application.Common;`. (depends on T005)
- [x] T033 [US4] Update CaseService to use LawyerIdResolver in $BACKEND/Lawyer.Application/Services/CaseService.cs — inject `ILawyerIdResolver` via constructor. Replace all calls to private `ResolveLawyerIdAsync()` with `_lawyerIdResolver.ResolveAsync()`. Delete the private `ResolveLawyerIdAsync` method (line 337). Update method signatures — the resolver handles both `null` and explicit ID cases. (depends on T006, T010)
- [x] T034 [P] [US4] Update ClientService to use LawyerIdResolver in $BACKEND/Lawyer.Application/Services/ClientService.cs — inject `ILawyerIdResolver`, replace all private `ResolveLawyerIdAsync()` calls, delete the private method (line 225). Same pattern as T033. (depends on T006, T010)
- [x] T035 [P] [US4] Update LawyerTaskService to use LawyerIdResolver in $BACKEND/Lawyer.Application/Services/LawyerTaskService.cs — inject `ILawyerIdResolver`, replace all private `ResolveLawyerIdAsync()` calls, delete the private method (line 250). Same pattern as T033. (depends on T006, T010)
- [x] T036 [P] [US4] Update ProcessServerPaperService to use LawyerIdResolver in $BACKEND/Lawyer.Application/Services/ProcessServerPaperService.cs — inject `ILawyerIdResolver`, replace all private `ResolveLawyerIdAsync()` calls, delete the private method (line 33). Same pattern as T033. (depends on T006, T010)

**Checkpoint**: User Story 4 complete — zero duplicated utility code, all callers use shared implementations.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final build verification and integration validation.

- [x] T037 Verify full solution build succeeds — run `dotnet build` on the solution at $BACKEND/Lawyer.sln. Fix any compilation errors from the refactoring. Verify zero warnings related to unused variables or missing references. **Result: Build succeeded, 0 Errors, 23 pre-existing nullability warnings (none introduced by this refactor).**
- [ ] T038 Run quickstart smoke test validation per $BACKEND/../specs/061-p1-backend-fixes/quickstart.md — start the backend, test: POST /api/case with empty title → 400 with Arabic errors, POST /api/case with valid data → 200, POST /api/account/change-password → old refresh token rejected, GET /api/account/lawyers with pageSize=500 → max 100 results returned. **SKIPPED — requires running backend with DB, network deps, and real credentials; must be executed manually per quickstart.md.**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Foundational (Phase 2) completion
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 (T009 AuditInterceptor, T010 DI). No dependency on other stories.
- **US2 (P2)**: Depends on Phase 2 (T007 PaginationDefaults, T010 DI). No dependency on US1.
- **US3 (P3)**: Depends on Phase 2 (T007, T008, T010). T021 also depends on T001 namespace fix. No dependency on US1/US2.
- **US4 (P4)**: Depends on Phase 2 (T004, T005, T006, T010). No dependency on US1/US2/US3.

### Within Each User Story

- Service injections before caller updates
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1**: T001, T002, T003 can all run in parallel (different files)
**Phase 2**: T004, T005, T006, T007, T008, T009 can all run in parallel (new files, no inter-dependencies)
**US1**: T012 and T013 can run in parallel (different code paths)
**US2**: T014, T015, T016, T017, T018 can all run in parallel (different new validator files)
**US3**: T024–T028 can all run in parallel (different AI service files)
**US4**: T030–T036 can all run in parallel (different service files)

---

## Parallel Example: Phase 2 (Foundational)

```text
# Launch all shared utility creation in parallel (new files, no conflicts):
Task T004: "Create OtpHelper static class"
Task T005: "Create EmailTemplateBuilder static class"
Task T006: "Create LawyerIdResolver service with interface"
Task T007: "Create PaginationDefaults static class"
Task T008: "Create PromptTemplateCache singleton service"
Task T009: "Create AuditInterceptor"

# Then sequential:
Task T010: "Register all new services in Program.cs"
```

## Parallel Example: User Story 3 (Performance)

```text
# After T021 and T023 (sequential base changes):
Task T022: "Apply PaginationDefaults in all services"
Task T024: "Replace File.ReadAllTextAsync in SmartAnalysisService"
Task T025: "Replace File.ReadAllTextAsync in PreparingStatementOfClaimsService"
Task T026: "Replace File.ReadAllTextAsync in LegalContractService"
Task T027: "Replace File.ReadAllTextAsync in CaseOcrService"
Task T028: "Replace File.ReadAllTextAsync in ClarifyFactsService"
# All 5 tasks above can run in parallel — different files
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (namespace fixes) — ~5 min
2. Complete Phase 2: Foundational (shared utilities) — ~2 hours
3. Complete Phase 3: User Story 1 (data integrity) — ~1 hour
4. **STOP and VALIDATE**: Test atomic case creation and password reset token invalidation
5. Deploy if ready — system is already safer than before

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Deploy (MVP — data integrity secured)
3. Add US2 → Test independently → Deploy (validation layer active)
4. Add US3 → Test independently → Deploy (performance improved)
5. Add US4 → Test independently → Deploy (code quality cleaned up)
6. Polish → Final build and smoke test

### Suggested MVP Scope

**US1 only** (Phase 1 + Phase 2 + Phase 3 = T001–T013) delivers the highest-value fix: atomic transactions and session security. All other stories add incremental improvement.

---

## Notes

- [P] tasks = different files, no dependencies — safe to parallelize
- [US#] labels map tasks to specific user stories for traceability
- Each user story is independently completable and testable after Phase 2
- All validation error messages must be in Arabic (per Constitution Principle VI)
- No database schema changes — all fixes are application-layer only
- The AuditInterceptor (T009) must handle null HTTP context gracefully for Hangfire background jobs
- Commit after each phase or logical group for clean rollback points
- Stop at any checkpoint to validate the story independently
