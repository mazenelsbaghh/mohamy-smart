# Tasks: Backend Architecture Improvements & Testing Polish

**Input**: Design documents from `/specs/063-backend-arch-testing/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-changes.md

**Tests**: Test tasks are included because the spec explicitly requires test coverage (FR-014 through FR-019, SC-003, SC-004).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Paths relative to project root `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new shared types that multiple user stories depend on.

- [x] T001 Create `ForbiddenException` class extending `Exception` with Arabic message support in `mohamy-smart-backend/Lawyer.Core/Exceptions/ForbiddenException.cs`
- [x] T002 [P] Create `PagedResult<T>` generic response model with Items, TotalCount, PageNumber, PageSize, TotalPages, HasPreviousPage, HasNextPage in `mohamy-smart-backend/Lawyer.Core/Common/PagedResult.cs`
- [x] T003 [P] Create `BaseApiController` abstract class extending `ControllerBase` with protected `GetUserId()` method that extracts `ClaimTypes.NameIdentifier` and throws `UnauthorizedAccessException` if missing in `mohamy-smart-backend/Lawyer/Controllers/BaseApiController.cs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core repository and utility changes that MUST be complete before any service refactoring.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Convert `ApiExceptionResponse` instance methods to static methods; remove constructor DI usage; update `ExceptionMiddleware` to use static calls instead of `new ApiExceptionResponse()` in `mohamy-smart-backend/Lawyer.Core/Exceptions/ApiExceptionResponse.cs` and `mohamy-smart-backend/Lawyer/Middlewares/ExceptionMiddleware.cs`
- [x] T005 Add `GetByIdAsync(Guid id)` overload to `IGenericRepository<T>` interface; remove `SaveChangesAsync` method from interface in `mohamy-smart-backend/Lawyer.Core/IRepositories/IGenericRepository.cs`
- [x] T006 Implement `GetByIdAsync(Guid id)` using `_dbSet.FindAsync(id)` in `GenericRepository<T>`; remove `SaveChangesAsync` implementation; migrate any callers of `_repository.SaveChangesAsync()` to `_unitOfWork.SaveChangesAsync()` in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/Repositories/GenericRepository.cs`
- [x] T007 Remove `ApiExceptionResponse` DI registration (`services.AddTransient<ApiExceptionResponse>()`) and update any remaining DI-injected usages to use static calls in `mohamy-smart-backend/Lawyer.Infrastracture/DependancyInjection.cs` and `mohamy-smart-backend/Lawyer.Application/DependencyInjection.cs`

**Checkpoint**: Foundation ready — repository supports Guid, SaveChanges only on UnitOfWork, ApiExceptionResponse is static. User story implementation can begin.

---

## Phase 3: User Story 1 — Service Layer Independence (Priority: P1) MVP

**Goal**: Remove `IHttpContextAccessor` from all 12+ Application layer services; pass userId/lawyerId as explicit parameters; controllers use `BaseApiController.GetUserId()`.

**Independent Test**: Invoke any refactored service method directly with a Guid parameter (no HTTP context) and verify it returns correct results.

### Core Business Services

- [x] T008 [US1] Update `ICaseService` interface: add `Guid lawyerId` parameter to methods that resolve it internally; remove `IHttpContextAccessor` from service thinking in `mohamy-smart-backend/Lawyer.Application/IServices/ICaseService.cs`
- [x] T009 [US1] Refactor `CaseService`: remove `IHttpContextAccessor` and `LawyerIdResolver` constructor params; replace internal `_lawyerIdResolver.ResolveAsync()` calls with the new `lawyerId` parameter; remove `_httpContextAccessor` usage in `mohamy-smart-backend/Lawyer.Application/Services/CaseService.cs`
- [x] T010 [P] [US1] Update `IClientService` interface: add `Guid lawyerId` parameter to methods that need it in `mohamy-smart-backend/Lawyer.Application/IServices/IClientService.cs`
- [x] T011 [US1] Refactor `ClientService`: remove `IHttpContextAccessor` and `LawyerIdResolver` constructor params; replace internal user resolution with `lawyerId` parameter; replace `UserContextHelper.IsInRole`/`UserContextHelper.GetUserId` calls with direct parameter usage; fix service locator anti-pattern at line 243 in `mohamy-smart-backend/Lawyer.Application/Services/ClientService.cs`
- [x] T012 [P] [US1] Update `IAccountService` interface and refactor `AccountService`: remove `IHttpContextAccessor`; add `Guid userId` parameter to methods that need it in `mohamy-smart-backend/Lawyer.Application/IServices/IAccountService.cs` and `mohamy-smart-backend/Lawyer.Application/Services/AccountService.cs`

### AI Workflow Services

- [x] T013 [P] [US1] Update `ISmartAnalysisService` interface and refactor `SmartAnalysisService`: remove `IHttpContextAccessor`; add `Guid lawyerId` parameter to methods in `mohamy-smart-backend/Lawyer.Application/IServices/ISmartAnalysisService.cs` and `mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`
- [x] T014 [P] [US1] Update `IClarifyFactsService` interface and refactor `ClarifyFactsService`: remove `IHttpContextAccessor`; add `Guid lawyerId` parameter in `mohamy-smart-backend/Lawyer.Application/IServices/IClarifyFactsService.cs` and `mohamy-smart-backend/Lawyer.Application/Services/ClarifyFactsService.cs`
- [x] T015 [P] [US1] Update `IPreparingStatementOfClaimsService` interface and refactor `PreparingStatementOfClaimsService`: remove `IHttpContextAccessor`; add `Guid lawyerId` parameter in `mohamy-smart-backend/Lawyer.Application/IServices/IPreparingStatementOfClaimsService.cs` and `mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`
- [x] T016 [P] [US1] Update `IProcessServerPaperService` interface and refactor `ProcessServerPaperService`: remove `IHttpContextAccessor`; add `Guid lawyerId` parameter in `mohamy-smart-backend/Lawyer.Application/IServices/IProcessServerPaperService.cs` and `mohamy-smart-backend/Lawyer.Application/Services/ProcessServerPaperService.cs`

### Supporting Services

- [x] T017 [P] [US1] Update `IAiJobService` interface and refactor `AiJobService`: remove `IHttpContextAccessor`; add `Guid userId` parameter to methods in `mohamy-smart-backend/Lawyer.Application/IServices/IAiJobService.cs` and `mohamy-smart-backend/Lawyer.Application/Services/AiJobService.cs`
- [x] T018 [P] [US1] Update `ILawyerTaskService` interface and refactor `LawyerTaskService`: remove `IHttpContextAccessor`; add `Guid lawyerId` parameter in `mohamy-smart-backend/Lawyer.Application/IServices/ILawyerTaskService.cs` and `mohamy-smart-backend/Lawyer.Application/Services/LawyerTaskService.cs`
- [x] T019 [P] [US1] Update `ICaseOcrService` interface and refactor `CaseOcrService`: remove `IHttpContextAccessor`; add `Guid lawyerId` parameter in `mohamy-smart-backend/Lawyer.Application/IServices/ICaseOcrService.cs` and `mohamy-smart-backend/Lawyer.Application/Services/CaseOcrService.cs`
- [x] T020 [P] [US1] Update `IDocumentHandoffService` interface and refactor `DocumentHandoffService`: remove `IHttpContextAccessor`; add `Guid lawyerId` parameter in `mohamy-smart-backend/Lawyer.Application/IServices/IDocumentHandoffService.cs` and `mohamy-smart-backend/Lawyer.Application/Services/DocumentHandoffService.cs`
- [x] T021 [P] [US1] Update `ICaseAccessValidator` interface and refactor `CaseAccessValidator`: remove `IHttpContextAccessor`; accept lawyerId as parameter in `mohamy-smart-backend/Lawyer.Application/IServices/ICaseAccessValidator.cs` and `mohamy-smart-backend/Lawyer.Application/Services/CaseAccessValidator.cs`

### Controller Migration

- [x] T022 [US1] Migrate core controllers to `BaseApiController`: change base class from `ControllerBase` to `BaseApiController`, replace `User.FindFirst(ClaimTypes.NameIdentifier)` calls with `GetUserId()`, pass `GetUserId()` to service methods for `CaseController`, `ClientController`, `AccountController` in `mohamy-smart-backend/Lawyer/Controllers/`
- [x] T023 [P] [US1] Migrate AI workflow controllers to `BaseApiController`: `SmartAnalysisController`, `ClarifyFactsController` (if exists), `PreparingStatementOfClaimsController`, `ProcessServerPaperController` in `mohamy-smart-backend/Lawyer/Controllers/`
- [x] T024 [P] [US1] Migrate remaining controllers to `BaseApiController`: `PaymentController`, `SubscriptionController`, `NotificationController`, `DocumentsController`, `AgendaController` in `mohamy-smart-backend/Lawyer/Controllers/`
- [x] T025 [P] [US1] Migrate workflow-specific controllers to `BaseApiController`: `AppealBriefController`, `AdminComplaintController`, `LegalContractsController`, `LegalWarningController`, `ExecRequestController`, `RulingAnalysisController` in `mohamy-smart-backend/Lawyer/Controllers/`
- [x] T026 [US1] Update `AuditInterceptor` to receive userId from caller context instead of `IHttpContextAccessor`; update DI registration to remove `IHttpContextAccessor` parameter in `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AuditInterceptor.cs` and `mohamy-smart-backend/Lawyer.Infrastracture/DependancyInjection.cs`

**Checkpoint**: All services work without HTTP context. `IHttpContextAccessor` removed from Application layer. Controllers use `BaseApiController.GetUserId()`. Build compiles and all existing endpoints function correctly.

---

## Phase 4: User Story 2 — Resilient Error Handling (Priority: P2)

**Goal**: Add proper 403 ForbiddenException handling, fix inconsistent 500 response, wire SchemaValidationException to 400, add contact rate limiting, add fire-and-forget error logging.

**Independent Test**: Trigger ForbiddenException, validation errors, and rate limiting — verify correct HTTP status codes (403, 400, 429) and Arabic messages in responses.

- [x] T027 [US2] Add `ForbiddenException` catch block in `ExceptionMiddleware`: return HTTP 403 with `Result<string>.Error("ليس لديك صلاحية للوصول إلى هذا المورد.")`; add `SchemaValidationException` catch returning HTTP 400; fix default catch block to return `Result<string>.Error("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.")` instead of `BadRequest<string>()` in `mohamy-smart-backend/Lawyer/Middlewares/ExceptionMiddleware.cs`
- [x] T028 [P] [US2] Add `contact` rate limiting policy (5 requests/min per IP) using `PartitionedRateLimiter` with `SlidingWindowRateLimiter` in `mohamy-smart-backend/Lawyer/Program.cs`; apply `[EnableRateLimiting("contact")]` attribute to `ContactController` in `mohamy-smart-backend/Lawyer/Controllers/ContactController.cs`
- [x] T029 [US2] Add `SafeFireAndForget` extension method on `Task` that wraps fire-and-forget calls with try-catch logging via `ILogger`; audit and wrap all `_ = SomeAsync()` and `Task.Run()` patterns in services in `mohamy-smart-backend/Lawyer.Application/Common/SafeFireAndForget.cs`
- [x] T030 [US2] Add frontend 403 error handling in Axios interceptor: show Arabic permission denied toast for 403 responses; add 429 handling with retry message in `apps/admin-dashboard/src/APIs/api.ts` and `apps/lawyer-dashboard/src/APIs/api.ts`
- [x] T031 [P] [US2] Update payment history API consumer in frontend: update Axios call to pass `pageNumber`/`pageSize` query params; update response parsing to read `data.items` instead of `data` array; add pagination controls in payment history pages in `apps/admin-dashboard/src/` and `apps/lawyer-dashboard/src/`

**Checkpoint**: All error scenarios return correct HTTP status codes. Contact endpoint rate limited. Frontend handles 403 and 429 gracefully.

---

## Phase 5: User Story 3 — Backend Performance Optimization (Priority: P3)

**Goal**: Reduce database round-trips in case creation and client lookup, add pagination to payment history, propagate cancellation tokens.

**Independent Test**: Measure response times for case creation (1 save), client lookup (1 query), payment history (paginated) before and after.

- [x] T032 [US3] Consolidate `ClientService.GetByIdAsync` into a single query using `.Include(x => x.Files).Include(x => x.Cases)` instead of 2 separate round-trips in `mohamy-smart-backend/Lawyer.Application/Services/ClientService.cs`
- [x] T033 [US3] Reduce `CaseService.CreateCaseAsync` to single `SaveChangesAsync`: remove intermediate saves; for new-client path, assign `Guid.NewGuid()` to Client entity before setting relationship; call `_unitOfWork.SaveChangesAsync()` once before `CommitAsync` in `mohamy-smart-backend/Lawyer.Application/Services/CaseService.cs`
- [x] T034 [US3] Add pagination to `PaymobService.GetPaymentHistoryAsync`: add `int pageNumber = 1, int pageSize = 20` parameters; cap pageSize at 100; return `PagedResult<PaymentHistoryDto>` using Skip/Take; update `IPaymobService` interface and `PaymentController` to pass pagination params in `mohamy-smart-backend/Lawyer.Application/Services/PaymobService.cs`, `mohamy-smart-backend/Lawyer.Application/IServices/IPaymobService.cs`, and `mohamy-smart-backend/Lawyer/Controllers/PaymentController.cs`
- [x] T035 [P] [US3] Fix CancellationToken propagation in `ProcessServerPaperService`: replace 5 `SaveChangesAsync(default)` calls with `SaveChangesAsync(cancellationToken)` in `mohamy-smart-backend/Lawyer.Application/Services/ProcessServerPaperService.cs`
- [x] T036 [P] [US3] Fix CancellationToken propagation in `PreparingStatementOfClaimsService`: replace 8 `SaveChangesAsync()` calls (no token) with `SaveChangesAsync(cancellationToken)` in `mohamy-smart-backend/Lawyer.Application/Services/PreparingStatementOfClaimsService.cs`
- [x] T037 [P] [US3] Fix CancellationToken propagation in `SmartAnalysisService`: replace 4 `SaveChangesAsync()` and 1 `SaveChangesAsync(CancellationToken.None)` with `SaveChangesAsync(cancellationToken)` in `mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysisService.cs`
- [x] T038 [P] [US3] Fix CancellationToken propagation in `WorkflowServiceBase`: replace 6 `SaveChangesAsync()` calls with `SaveChangesAsync(cancellationToken)` in `mohamy-smart-backend/Lawyer.Application/Services/WorkflowServiceBase.cs`

**Checkpoint**: Case creation uses 1 DB save. Client lookup uses 1 query. Payment history paginated. All SaveChangesAsync calls pass cancellation tokens.

---

## Phase 6: User Story 4 — Comprehensive Test Coverage (Priority: P4)

**Goal**: Backend test coverage >50%, frontend critical path coverage >30%, shared packages unit tests.

**Independent Test**: Run full test suite — `dotnet test` and `npm test` — verify coverage thresholds met.

### Backend Tests

- [x] T039 [P] [US4] Create `AuthServiceTests` with unit tests for: successful login, invalid credentials, OTP generation and verification, password reset flow, refresh token rotation using Moq for `IUnitOfWork` and `UserManager` in `mohamy-smart-backend/Lawyer.Tests/Services/AuthServiceTests.cs`
- [x] T040 [P] [US4] Create `CaseServiceTests` with unit tests for: create case (valid dto, invalid dto), get case by id, update case, delete case, ownership validation using Moq for `IUnitOfWork` and `IGenericRepository` in `mohamy-smart-backend/Lawyer.Tests/Services/CaseServiceTests.cs`
- [x] T041 [P] [US4] Create `ClientServiceTests` with unit tests for: create client (valid, invalid phone/email), get client by id, update client, delete client, file operations (add/delete) using Moq in `mohamy-smart-backend/Lawyer.Tests/Services/ClientServiceTests.cs`
- [x] T042 [P] [US4] Create `PaymentServiceTests` with unit tests for: payment history pagination (page bounds, empty results, pageSize cap), HMAC verification (valid/invalid signature) in `mohamy-smart-backend/Lawyer.Tests/Services/PaymentServiceTests.cs`
- [x] T043 [P] [US4] Create `ExceptionMiddlewareTests` with unit tests for: ForbiddenException → 403, KeyNotFoundException → 404, UnauthorizedAccessException → 401, SchemaValidationException → 400, DbUpdateException → 500, unhandled exception → 500 with correct body using `DefaultHttpContext` in `mohamy-smart-backend/Lawyer.Tests/Middlewares/ExceptionMiddlewareTests.cs`

### Frontend Tests — Admin Dashboard

- [x] T044 [P] [US4] Create admin auth flow tests: test login thunk (success, invalid credentials, network error), test logout clears state and localStorage in `apps/admin-dashboard/src/redux/auth/authSlice.test.ts`
- [x] T045 [P] [US4] Create admin thunks tests: test `fetchLawyers` thunk (success, error, loading state), test `fetchReports` thunk using Vitest mocking in `apps/admin-dashboard/src/redux/thunks/adminThunks.test.ts`

### Frontend Tests — Lawyer Dashboard

- [x] T046 [P] [US4] Create lawyer auth flow tests: test login thunk (success, invalid credentials), test logout, test protected route redirect in `apps/lawyer-dashboard/src/redux/auth/authSlice.test.ts`
- [x] T047 [P] [US4] Create lawyer workflow tests: test basic workflow thunk (start, success, error), test auto-save trigger using Vitest mocking in `apps/lawyer-dashboard/src/redux/thunks/workflowThunks.test.ts`

### Shared Package Tests

- [x] T048 [P] [US4] Add Vitest config and test script to `shared-utils` package.json; create tests for `formatters.ts`, `guards.ts`, `normalizeDigits.ts`, `sanitizeHtml.ts` in `packages/shared-utils/src/__tests__/`
- [x] T049 [P] [US4] Add Vitest config and test script to `shared-validations` package.json; create tests for `auth.ts` (login/register schemas — valid/invalid inputs) and `common.ts` (phone regex, password regex) in `packages/shared-validations/src/__tests__/`

**Checkpoint**: Backend tests pass with >50% coverage on services/middleware. Frontend tests pass for auth flows and key thunks. Shared package utilities tested.

---

## Phase 7: User Story 5 — Polish & Accessibility (Priority: P5)

**Goal**: Admin ErrorBoundary sends to Sentry, admin theme applied to documentElement, RTL root attributes on both dashboards, high-impact accessibility improvements.

**Independent Test**: Trigger frontend error in admin (verify Sentry capture), toggle theme (verify documentElement class), check `<html>` attributes, test keyboard navigation.

- [x] T050 [US5] Update admin `ErrorBoundary.componentDidCatch` to dynamically import `@sentry/browser` and call `Sentry.captureException(error, { extra: { componentStack: info.componentStack } })` matching the lawyer dashboard pattern in `apps/admin-dashboard/src/components/ErrorBoundary.tsx`
- [x] T051 [US5] Fix admin theme application: add `document.documentElement.classList.add/remove('dark')` in `Layout.tsx` alongside existing `<main>` class toggle, matching the lawyer dashboard pattern in `apps/admin-dashboard/src/layout/Layout.tsx`
- [x] T052 [P] [US5] Set `<html lang="ar" dir="rtl">` replacing current `lang="en"` in `apps/admin-dashboard/index.html`
- [x] T053 [P] [US5] Set `<html lang="ar" dir="rtl">` replacing current `lang="en"` in `apps/lawyer-dashboard/index.html`
- [x] T054 [US5] Add skip-navigation link (`<a href="#main-content" class="sr-only focus:not-sr-only">`) as first child of `<body>` in both dashboard root layouts in `apps/admin-dashboard/src/layout/Layout.tsx` and `apps/lawyer-dashboard/src/layout/Layout.tsx`
- [x] T055 [P] [US5] Add `aria-live="polite"` region for toast notifications and loading state updates in both dashboard root layouts in `apps/admin-dashboard/src/layout/Layout.tsx` and `apps/lawyer-dashboard/src/layout/Layout.tsx`
- [x] T056 [P] [US5] Update generic `aria-label="Icon Button"` to descriptive labels (e.g., `aria-label="فتح القائمة"`, `aria-label="إغلاق"`) on IconButton components in both dashboards in `apps/admin-dashboard/src/` and `apps/lawyer-dashboard/src/`

**Checkpoint**: Admin errors captured by Sentry. Theme works correctly on both dashboards. Both apps have proper RTL root attributes. Basic accessibility (skip nav, aria-live, descriptive labels) in place.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, verification, and documentation.

- [x] T057 Remove deprecated `LawyerIdResolver` class if no remaining references after US1 migration in `mohamy-smart-backend/Lawyer.Application/Common/LawyerIdResolver.cs`
- [x] T058 [P] Remove deprecated `UserContextHelper` in Application layer if no remaining references after US1 migration in `mohamy-smart-backend/Lawyer.Application/Common/UserContextHelper.cs`
- [x] T059 Verify all `IHttpContextAccessor` registrations are removed from DI if no longer needed by any service; keep only if `AuditInterceptor` or other infrastructure still requires it in `mohamy-smart-backend/Lawyer.Infrastracture/DependancyInjection.cs` and `mohamy-smart-backend/Lawyer/Program.cs`
- [x] T060 Run and validate quickstart checklist: build backend (`dotnet build`), run all backend tests (`dotnet test`), run all frontend tests (`npm test` in each app), verify coverage thresholds in `mohamy-smart-backend/` and `apps/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 Service Independence (Phase 3)**: Depends on Phase 2 — the big refactor
- **US2 Error Handling (Phase 4)**: Depends on Phase 2 (uses `ForbiddenException` from T001); can proceed in parallel with Phase 3
- **US3 Performance (Phase 5)**: Depends on Phase 3 (touches same service files refactored in US1)
- **US4 Testing (Phase 6)**: Depends on Phase 3 + Phase 4 (tests validate refactored services and new error handling)
- **US5 Polish (Phase 7)**: Depends on nothing — can start after Phase 1
- **Polish (Phase 8)**: Depends on all phases

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2. No dependencies on other stories.
- **US2 (P2)**: Depends on Phase 1 (ForbiddenException). Independent of US1, but middleware changes can run in parallel.
- **US3 (P3)**: Depends on US1 (same files — service implementations).
- **US4 (P4)**: Depends on US1 + US2 (tests validate refactored code).
- **US5 (P5)**: Independent — can start after Phase 1.

### Within Each User Story

- Interface changes before implementation changes
- Service refactoring before controller migration (US1)
- Exception type before middleware handler (US2)
- Tests written after implementation is stable (US4)

### Parallel Opportunities

**Phase 1** — All 3 tasks run in parallel:
```
T001 (ForbiddenException) | T002 (PagedResult) | T003 (BaseApiController)
```

**Phase 2** — T005 and T006 are sequential (interface before implementation):
```
T004 (ApiExceptionResponse static) | T005 + T006 (Repository — sequential) | T007 (DI cleanup)
```

**Phase 3** — Service refactoring can be parallelized by group:
```
T008-T009 (CaseService) | T010-T011 (ClientService) | T012 (AccountService)
T013 (SmartAnalysis) | T014 (ClarifyFacts) | T015 (Preparing) | T016 (ProcessServer)
T017 (AiJob) | T018 (LawyerTask) | T019 (CaseOcr) | T020 (DocumentHandoff) | T021 (CaseAccess)
```
Controllers after services:
```
T022 (core controllers) | T023 (AI controllers) | T024 (remaining) | T025 (workflow)
```

**Phase 4** — Error handling tasks can mostly run in parallel:
```
T027 (middleware) | T028 (rate limiting) | T029 (fire-and-forget)
T030 (frontend interceptor) | T031 (payment pagination frontend)
```

**Phase 5** — Performance tasks are independent:
```
T032 (client query) | T033 (case creation) | T034 (payment pagination)
T035 | T036 | T037 | T038 (CancellationToken — all parallel)
```

**Phase 6** — All test tasks can run in parallel:
```
T039-T043 (backend tests — all parallel)
T044-T045 (admin frontend tests — parallel)
T046-T047 (lawyer frontend tests — parallel)
T048-T049 (shared package tests — parallel)
```

**Phase 7** — All polish tasks can run in parallel:
```
T050 | T051 | T052 | T053 | T054 | T055 | T056
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: US1 Service Independence (T008-T026)
4. **STOP and VALIDATE**: Build compiles, all endpoints work, services callable without HTTP context
5. Deploy/demo if ready

### Recommended Order (All Stories)

1. Phase 1 + Phase 2 → Foundation ready (1-2 days)
2. Phase 3 (US1) → Service independence (2-3 days) — **MVP**
3. Phase 4 (US2) + Phase 7 (US5) in parallel → Error handling + Polish (1-2 days)
4. Phase 5 (US3) → Performance (1-2 days)
5. Phase 6 (US4) → Testing (2-3 days)
6. Phase 8 → Final cleanup (0.5 day)

**Total estimated**: 8-13 days

### Parallel Team Strategy

- **Developer A**: Phases 1-3 (backend architecture — the critical path)
- **Developer B**: Phase 7 (frontend polish — independent of backend)
- **After Phase 3**: Developer A continues Phases 4-5, then Phase 6 (backend tests)
- **Developer B**: Phase 6 frontend/shared tests in parallel

---

## Notes

- US1 is the largest phase (19 tasks) because it touches 12+ services and 17 controllers
- US2 and US5 can run in parallel with US1 since they touch different files
- US3 must wait for US1 because both modify the same service files
- US4 must wait for US1+US2 because tests validate the refactored code
- Each service refactor follows the same mechanical pattern: remove `IHttpContextAccessor` from constructor, add `Guid userId/lawyerId` to methods, update internal calls
- CancellationToken fixes (T035-T038) are trivial find-and-replace tasks within already-modified files
- Payment history pagination (T034 backend + T031 frontend) is the only breaking API change — coordinate deployment
