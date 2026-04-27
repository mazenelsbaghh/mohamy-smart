# Tasks: Secure Account Messaging

**Input**: Design documents from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/049-secure-otp-recovery/`
**Prerequisites**: [plan.md](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/049-secure-otp-recovery/plan.md), [spec.md](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/049-secure-otp-recovery/spec.md), [research.md](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/049-secure-otp-recovery/research.md), [data-model.md](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/049-secure-otp-recovery/data-model.md), [account-messaging.openapi.yaml](/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/049-secure-otp-recovery/contracts/account-messaging.openapi.yaml)

**Tests**: Tests were not explicitly requested in the feature specification, so this task list focuses on implementation work only.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after foundational work completes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label for story-specific phases only
- Every task includes exact target file path(s)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add provider configuration scaffolding and outbound messaging contracts before touching business logic.

- [X] T001 Update SMS and outbound messaging placeholder values in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/appsettings.example.json`
- [X] T002 Update local placeholder comments for `EmailSettings` and new `SmsSettings` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/appsettings.json`
- [X] T003 [P] Create `SmsSettings` options model in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Setting/SmsSettings.cs`
- [X] T004 [P] Create `ISmsSender` contract for provider-backed OTP delivery in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/ISmsSender.cs`
- [X] T005 [P] Implement Plus SMS provider adapter in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Services/PlusSmsSender.cs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish persistence, DI, and shared messaging abstractions required by all stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T006 Register `SmsSettings` and `ISmsSender` bindings in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/DependancyInjection.cs` (registered alongside EmailSettings)
- [X] T007 Extend `Otp` with hashed code, purpose, attempt counters, masked destination, and consume/invalidate timestamps in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/Otp.cs`
- [X] T008 [P] Update OTP purpose values for forget-password and protected account actions in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Enum/OtpType.cs`
- [X] T009 [P] Create `AccountEmailEvent` entity for welcome/subscription deduplication in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Core/Models/AccountEmailEvent.cs`
- [X] T010 Map `Otp` and `AccountEmailEvent` persistence rules in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs` (depends on T007, T008, T009)
- [X] T011 Generate `SecureAccountMessaging` EF Core migration under `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Migrations/` and update `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Migrations/AppDbContextModelSnapshot.cs` (depends on T010) — schema already applied via prior migration
- [X] T012 Extend `IEmailService` with business-event deduplication and success-recording parameters in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IEmailService.cs`
- [X] T013 Update MailKit sender to persist `AccountEmailEvent` success/failure state in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Infrastracture/Services/EmailService.cs` (depends on T009, T012)
- [X] T014 Create `ForgetPasswordDto`, `VerifyOtpDto`, and `ResetPasswordDto` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Auth/AuthResponseDto.cs` (colocated with other auth DTOs)
- [X] T015 [P] Create `RequestAccountOtpDto` and `VerifyAccountOtpDto` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Auth/RequestAccountOtpDto.cs`
- [X] T016 Update recovery method contracts to use the new DTOs in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAuthService.cs` (depends on T014)

**Checkpoint**: Foundation ready. User stories can now start in priority order or in parallel where dependencies allow.

---

## Phase 3: User Story 1 - Recover account access with a one-time code (Priority: P1) 🎯 MVP

**Goal**: Let a registered user request a secure OTP, verify it, and reset their password through the lawyer dashboard without exposing account existence.

**Independent Test**: Submit forgot-password for an existing account, receive a valid OTP through the configured channel, verify it, reset the password, then confirm the same OTP cannot be reused.

### Implementation for User Story 1

- [X] T017 [US1] Implement secure forgot-password OTP issuance with generic outward response in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AuthService.cs` (depends on T005, T007, T013, T016)
- [X] T018 [US1] Implement OTP verification and single-use reset-password completion in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AuthService.cs` (depends on T017)
- [X] T019 [US1] Update forgot-password, verify-otp, and reset-password actions to bind the new DTO flow in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AuthController.cs` (depends on T018)
- [X] T020 [P] [US1] Add `AUTH_FORGOT_PASSWORD`, `AUTH_VERIFY_OTP`, and `AUTH_RESET_PASSWORD` route constants in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/APIs/routes.ts`
- [X] T021 [P] [US1] Create `thunkForgotPassword`, `thunkVerifyOtp`, and `thunkResetPassword` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/thunk/thunkForgotPassword.ts`, `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/thunk/thunkVerifyOtp.ts`, and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/thunk/thunkResetPassword.ts` (depends on T020)
- [X] T022 [US1] Extend password-recovery step state, recovery user id, and API error handling in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/authSlice.ts` (depends on T021)
- [X] T023 [P] [US1] Expand phone, OTP code, and new-password validation rules in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/validations/forgotPasswordSchema.ts`
- [X] T024 [US1] Replace the lawyer forgot-password stub with a multi-step recovery form in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/auth/ForgotPassword.tsx` (depends on T022, T023)

**Checkpoint**: User Story 1 is complete when a lawyer can recover account access end-to-end from the dashboard.

---

## Phase 4: User Story 2 - Receive account and subscription emails reliably (Priority: P2)

**Goal**: Send welcome emails after registration and subscription confirmation emails after finalized activation without duplicate sends.

**Independent Test**: Register a new user and activate a subscription, then confirm the user receives one welcome email and one correct subscription email, with failures recorded if delivery is unavailable.

### Implementation for User Story 2

- [X] T025 [US2] Send welcome email with a stable registration business event id in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AuthService.cs` (depends on T013)
- [X] T026 [US2] Refactor subscription confirmation sending around finalized `LawyerSubscription` business event ids in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SubscriptionService.cs` (depends on T013)
- [X] T027 [US2] Keep payment callback idempotent while triggering confirmation only after successful activation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/PaymobService.cs` (depends on T026) — SubscriptionService.SubscribeAsync sends confirmation email inside PaymobService.HandleServerCallbackAsync
- [X] T028 [P] [US2] Update landing registration success copy to explain welcome-email delivery without blocking redirect in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/src/components/auth/RegisterForm.tsx`
- [X] T029 [P] [US2] Preserve non-blocking registration success handling for welcome-email side effects in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/thunk/thunkAuthRegister.ts` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/authSlice.ts` (depends on T025) — email is non-blocking backend side-effect; thunk returns registration result directly
- [X] T030 [US2] Add confirmation-email guidance to subscription activation screens in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/subscription/Subscription.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/Subscription.tsx` (depends on T027)

**Checkpoint**: User Story 2 is complete when registration and finalized subscription activation both trigger one correct email event.

---

## Phase 5: User Story 3 - Complete OTP verification for sensitive account actions (Priority: P3)

**Goal**: Reuse the OTP infrastructure for authenticated protected actions such as password-change confirmation.

**Independent Test**: While logged in, request an OTP for a protected account action, verify it, then complete the protected action only after OTP verification succeeds.

### Implementation for User Story 3

- [X] T031 [US3] Add protected-action OTP request and verify method signatures in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAccountService.cs`
- [X] T032 [US3] Implement authenticated OTP issuance and verification for protected account actions in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AccountService.cs` (depends on T013, T015, T031)
- [X] T033 [US3] Add `POST /api/account/request-otp` and `POST /api/account/verify-otp` actions in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AccountController.cs` (depends on T032)
- [X] T034 [P] [US3] Add `ACCOUNT_REQUEST_OTP` and `ACCOUNT_VERIFY_OTP` route constants in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/APIs/routes.ts`
- [X] T035 [P] [US3] Create `thunkRequestAccountOtp` and `thunkVerifyAccountOtp` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/settings/thunk/thunkRequestAccountOtp.ts` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/settings/thunk/thunkVerifyAccountOtp.ts` (depends on T034)
- [X] T036 [P] [US3] Add `otpCode` validation rules for protected password changes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/validations/changePasswordSchema.ts`
- [X] T037 [US3] Require OTP verification before password-change submission in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/settings/subPagesSettings/ChangePassword.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/settings/thunk/thunkChangePassword.ts` (depends on T033, T035, T036)

**Checkpoint**: User Story 3 is complete when a protected account action is blocked until authenticated OTP verification succeeds.

---

## Phase 6: User Story 4 - Operate secure delivery and abuse controls (Priority: P4)

**Goal**: Add throttling, masking, and reviewable admin reporting so operators can investigate abuse and delivery problems safely.

**Independent Test**: Trigger repeated recovery attempts and failed verifications, then confirm cooldowns apply, outward responses remain generic, and admins can review messaging audit records.

### Implementation for User Story 4

- [X] T038 [US4] Enforce resend cooldown windows, max verification attempts, and masked-destination responses in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AuthService.cs` (depends on T017, T018)
- [X] T039 [US4] Apply consistent generic recovery and protected-action error responses in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AuthController.cs` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AccountController.cs` (depends on T038)
- [X] T040 [P] [US4] Create `AccountMessagingAuditDto` and `AccountMessagingAuditFilterDto` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/AdminReport/AccountMessagingAuditDto.cs`
- [X] T041 [US4] Add account-messaging audit query contract and implementation in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAdminReportService.cs` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AdminReportService.cs` (depends on T040)
- [X] T042 [US4] Expose `GET /api/admin/reports/account-messaging` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/AdminReportController.cs` (depends on T041)
- [X] T043 [P] [US4] Create `fetchAccountMessagingAudit` thunk and route constant in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/reports/thunk/fetchAccountMessagingAudit.ts` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/APIs/routes.ts`
- [X] T044 [US4] Store account-messaging audit data and loading/error state in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/reports/reportsSlice.ts` (depends on T043)
- [X] T045 [US4] Create admin account-messaging report page in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/pages/subscriptions/AccountMessagingReport.tsx` (depends on T042, T044)
- [X] T046 [US4] Register the admin account-messaging report route in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/router/AppRouter.tsx` and add sidebar link in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/components/public/sidebar/Sidebar.tsx` (depends on T045)

**Checkpoint**: User Story 4 is complete when the platform throttles abuse safely and admins can inspect messaging audit data.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation and UX hardening across stories.

- [ ] T047 [P] Update manual verification steps and API examples in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/049-secure-otp-recovery/quickstart.md` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/049-secure-otp-recovery/contracts/account-messaging.openapi.yaml`
- [X] T048 Harden Arabic delayed-delivery copy in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/auth/ForgotPassword.tsx` and `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/src/components/auth/RegisterForm.tsx` (depends on T024, T028)
- [ ] T049 Create rollout and secrets-handling notes in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docs/secure-account-messaging.md` (depends on T046)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies; can start immediately.
- **Phase 2: Foundational**: Depends on Setup; blocks all user stories.
- **Phase 3: US1**: Depends on Foundational only; this is the MVP slice.
- **Phase 4: US2**: Depends on Foundational; can proceed after US1 if you want to validate recovery first.
- **Phase 5: US3**: Depends on Foundational and reuses OTP infrastructure proven in US1.
- **Phase 6: US4**: Depends on Foundational and benefits from completed recovery/email flows in US1-US3.
- **Phase 7: Polish**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on other user stories.
- **US2 (P2)**: Starts after Phase 2; independent from US1 at the business level.
- **US3 (P3)**: Starts after Phase 2, but practically depends on the OTP infrastructure implemented in US1.
- **US4 (P4)**: Starts after Phase 2, but audit/reporting work is most useful after US1-US3 produce real event data.

### Within Each User Story

- Backend DTOs/contracts before service changes.
- Service changes before controller wiring.
- API routes and thunks before UI forms.
- Story-level UI should only begin after its backend contract is stable.

---

## Parallel Opportunities

- **Setup**: `T003`, `T004`, and `T005` can run in parallel.
- **Foundational**: `T008`, `T009`, and `T015` can run in parallel after `T007` starts; `T012` can also proceed independently.
- **US1**: `T020`, `T021`, and `T023` can run in parallel after backend endpoints are defined.
- **US2**: `T028` and `T029` can run in parallel with backend email work.
- **US3**: `T034`, `T035`, and `T036` can run in parallel while backend account OTP work lands.
- **US4**: `T040` and `T043` can run in parallel; frontend admin report state and page work can split after `T042`.

---

## Parallel Example: User Story 1

```bash
Task: "Add AUTH_FORGOT_PASSWORD, AUTH_VERIFY_OTP, and AUTH_RESET_PASSWORD route constants in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/APIs/routes.ts"
Task: "Create thunkForgotPassword, thunkVerifyOtp, and thunkResetPassword in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/thunk/"
Task: "Expand phone, OTP code, and new-password validation rules in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/validations/forgotPasswordSchema.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Update landing registration success copy in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-landing/src/components/auth/RegisterForm.tsx"
Task: "Preserve non-blocking registration success handling in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/thunk/thunkAuthRegister.ts and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/auth/authSlice.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Add ACCOUNT_REQUEST_OTP and ACCOUNT_VERIFY_OTP route constants in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/APIs/routes.ts"
Task: "Create thunkRequestAccountOtp and thunkVerifyAccountOtp in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/redux/settings/thunk/"
Task: "Add otpCode validation rules in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/validations/changePasswordSchema.ts"
```

## Parallel Example: User Story 4

```bash
Task: "Create AccountMessagingAuditDto and AccountMessagingAuditFilterDto in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Dtos/Admin/"
Task: "Create fetchAccountMessagingAudit thunk and route constant in /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/redux/reports/thunk/fetchAccountMessagingAudit.ts and /Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/APIs/routes.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for secure password recovery.
3. Validate that forgot-password, OTP verification, and reset-password work end-to-end.
4. Stop and review before expanding to email automation and admin reporting.

### Incremental Delivery

1. Deliver **US1** to remove the insecure static OTP flow.
2. Deliver **US2** to add welcome and subscription email reliability.
3. Deliver **US3** to reuse OTP for authenticated protected actions.
4. Deliver **US4** to add abuse controls and operator visibility.
5. Finish with Phase 7 polish and rollout notes.

### Parallel Team Strategy

1. One developer handles backend foundation (`T006`-`T013`) while another prepares DTOs and route scaffolding (`T014`-`T016`).
2. After Phase 2, split by story:
   - Developer A: US1 recovery flow
   - Developer B: US2 welcome/subscription emails
   - Developer C: US3 protected-action OTP
3. Admin reporting in US4 can begin once message events are persisted consistently.

---

## Notes

- All tasks follow the required `- [ ] T### ...` checklist format.
- All user-story tasks include `[US#]` labels.
- File paths are absolute to avoid ambiguity for low-cost execution models.
- No task asks the implementer to infer unnamed files or combine unrelated backend/frontend/test work in one step.
