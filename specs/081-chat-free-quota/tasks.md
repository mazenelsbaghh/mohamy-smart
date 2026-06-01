# Tasks: Chat Free Quota

**Input**: Design documents from `/specs/081-chat-free-quota/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Backend unit tests are included because this is billing behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths
- Keep each task small enough for a low-cost LLM to execute without architectural guesswork

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm current smart chat and point accounting boundaries.

- [x] T001 Inspect `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/SmartChatService.cs` and identify the single `ChatAsync` success branch where usage tracking and messages are added.
- [x] T002 Inspect `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs` and confirm `ChargeSuccessfulDirectActionAsync` can charge one point for a direct chat action.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add reusable direct-action no-charge accounting so free chat replies can be audited.

- [x] T003 Add `RecordNoChargeDirectActionAsync(Guid lawyerId, AiStepType stepType, Guid? caseId, string? workflowType, string? workflowRunId, string messageAr, CancellationToken ct)` to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/IServices/IAiPointAccountingService.cs`.
- [x] T004 Implement `RecordNoChargeDirectActionAsync` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AiPointAccountingService.cs`; it must return success without throwing when no active subscription exists, and must write an `AiPointTransaction` with `TransactionType = NoCharge`, `StepType = Chat`, `Points = 0`, unchanged balances, and Arabic `MessageAr` when an active subscription exists.
- [x] T005 [P] Add direct-action no-charge unit coverage in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/AiPointAccountingServiceTests.cs`; verify the method records a `NoCharge` chat transaction with zero points and unchanged `UsedAiRequests`.

**Checkpoint**: Foundation ready when direct-action no-charge accounting compiles and has targeted test coverage.

---

## Phase 3: User Story 1 - Use Five Free Chat Replies (Priority: P1) 🎯 MVP

**Goal**: A lawyer's first five successful chat replies do not deduct points.

**Independent Test**: A smart chat unit test seeds four prior successful chat usage records, sends a successful fifth chat, and verifies no point charge is made.

### Tests for User Story 1

- [x] T006 [P] [US1] Create `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/SmartChatServiceTests.cs` with an in-memory `AppDbContext`, mocked `IAIProviderFactory`, mocked `IAiUsageTrackingService`, real `AiPointAccountingService`, and helper methods for seeding `AiUsageRecord` and active subscriptions.
- [x] T007 [US1] Add test `ChatAsync_FifthSuccessfulReply_ShouldRemainFree` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/SmartChatServiceTests.cs`; arrange four prior `AiUsageRecord` rows with `AiStepType.Chat`, call `ChatAsync`, assert success, provider called once, and `UsedAiRequests` unchanged.

### Implementation for User Story 1

- [x] T008 [US1] Inject `IAiPointAccountingService` into `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/SmartChatService.cs` constructor and store it in a private field.
- [x] T009 [US1] Add private constant `FreeSuccessfulChatReplies = 5` and private method `GetSuccessfulChatReplyCountAsync(Guid lawyerId, CancellationToken ct)` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/SmartChatService.cs`; count `AiUsageRecord` rows where `LawyerId == lawyerId` and `AiStepType == AiStepType.Chat`.
- [x] T010 [US1] In `ChatAsync` success branch in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/SmartChatService.cs`, call `RecordNoChargeDirectActionAsync` when the pre-call chat count is less than five; use Arabic message `رسالة الشات ضمن أول 5 رسائل مجانية.`

**Checkpoint**: US1 complete when first five successful replies are free and recorded as no-charge where possible.

---

## Phase 4: User Story 2 - Charge One Point After Free Quota (Priority: P1)

**Goal**: The sixth and later successful chat replies deduct one AI point.

**Independent Test**: A smart chat unit test seeds five prior successful chat usage records and an active subscription, sends one successful chat, and verifies one point is deducted.

### Tests for User Story 2

- [x] T011 [US2] Add test `ChatAsync_SixthSuccessfulReply_ShouldChargeOnePoint` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/SmartChatServiceTests.cs`; arrange five prior chat usage records and a subscription with available points, call `ChatAsync`, assert success and `UsedAiRequests == 1`.

### Implementation for User Story 2

- [x] T012 [US2] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/SmartChatService.cs`, compute `isFreeChatReply` before calling the AI provider and store it for the success branch.
- [x] T013 [US2] In the paid success branch in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/SmartChatService.cs`, call `ChargeSuccessfulDirectActionAsync(lawyerId, AiStepType.Chat, 1, request.ContextCaseId, "SmartChat", conversationId, "تم خصم نقطة واحدة بعد استخدام أول 5 رسائل مجانية في الشات.", cancellationToken)`.

**Checkpoint**: US2 complete when paid chat replies deduct exactly one point after the free quota.

---

## Phase 5: User Story 3 - Block Paid Chat When Points Are Insufficient (Priority: P2)

**Goal**: After the free quota is exhausted, a lawyer without points is blocked before provider invocation.

**Independent Test**: A smart chat unit test seeds five prior successful chat usage records and an exhausted active subscription, calls `ChatAsync`, and verifies payment-required result and zero provider calls.

### Tests for User Story 3

- [x] T014 [US3] Add test `ChatAsync_ExhaustedFreeQuotaWithoutPoints_ShouldReturnPaymentRequiredBeforeProviderCall` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Tests/Services/SmartChatServiceTests.cs`; assert `StatusCode == PaymentRequired` and provider mock was not invoked.

### Implementation for User Story 3

- [x] T015 [US3] In `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/SmartChatService.cs`, before provider invocation, call `ValidateCanStartAsync(lawyerId, AiStepType.Chat, null, "SmartChat", cancellationToken)` only when the pre-call chat count is five or more; return the validation error as `Result<ChatResponseDto>.Error(...)` when insufficient.
- [x] T016 [US3] Remove `[CheckAiQuota]` from the `POST chat` action in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/SmartAnalysisController.cs`; keep `[Authorize]` and the existing route unchanged.

**Checkpoint**: US3 complete when paid chat with insufficient points is rejected before provider cost.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T017 Run `dotnet test Lawyer.Tests/Lawyer.Tests.csproj --filter SmartChatServiceTests` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend` and fix failures in modified files.
- [x] T018 Run `dotnet test Lawyer.Tests/Lawyer.Tests.csproj --filter AiPointAccountingServiceTests` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend` and document any pre-existing failures if unrelated.
- [x] T019 Run `dotnet build Lawyer.sln --no-restore` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend` and fix compile errors in modified files.
- [x] T020 Review `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/SmartAnalysis/SmartChatService.cs` for Arabic-only user-facing messages and no provider call before insufficient-points rejection.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on setup inspection.
- **US1**: Depends on foundational no-charge accounting.
- **US2**: Depends on US1 count and service injection.
- **US3**: Depends on US2 paid/free branching.
- **Polish**: Depends on all desired stories being complete.

### Parallel Opportunities

- T005 can run after T003 and T004 are understood.
- T006 can run in parallel with T008 and T009 once constructor dependencies are known.
- T011 and T014 can be authored in the same test file after T006.

## Implementation Strategy

1. Implement foundational accounting first.
2. Implement and test free quota behavior.
3. Implement and test paid chat behavior.
4. Implement and test insufficient-points preflight.
5. Build and perform a focused architecture/UX review.
