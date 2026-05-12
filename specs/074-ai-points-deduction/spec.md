# Feature Specification: AI Points Deduction

**Feature Branch**: `074-ai-points-deduction`  
**Created**: 2026-05-12  
**Status**: Draft  
**Input**: User description: "عيز يكون لكل حاجه ف الريوست لل ai بس يتخصم من النقاط بتاعتوا و تتاكد لو حصل ايرور مايتهصمش ولو تعمل اعاده محخاموله لاي حاجه يظهر كومفيرم انو هيسحب وتتاكد ان اكلحجاه مظبوطه"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Charge Successful AI Requests (Priority: P1)

As a lawyer using any AI feature, I want each successful AI request to consume the correct number of points from my available balance so that usage is fair, visible, and tied to the value I received.

**Why this priority**: AI point accounting is a core business rule. If successful AI work is not charged consistently, usage limits and subscription value become unreliable.

**Independent Test**: Can be fully tested by running each supported AI action once with enough points and confirming the user's balance decreases exactly once by the displayed cost when the result becomes available.

**Acceptance Scenarios**:

1. **Given** a lawyer has enough points for an AI action, **When** the lawyer submits the action and receives a usable result, **Then** the lawyer's balance is reduced by the cost of that action exactly once.
2. **Given** an AI workflow has multiple stages, **When** the lawyer successfully runs each stage, **Then** each successful stage consumes points according to its own cost.
3. **Given** the lawyer refreshes or resumes while an AI request is already running, **When** the same request completes, **Then** the balance is charged once and no duplicate charge is created.

---

### User Story 2 - Do Not Charge Failed AI Work (Priority: P1)

As a lawyer, I want my points to remain unchanged when an AI request fails, times out, is rejected, or returns an unusable result so that I am not charged for work I did not receive.

**Why this priority**: Charging on errors breaks user trust immediately and makes retry flows feel risky.

**Independent Test**: Can be tested by forcing every major failure state for an AI action and confirming the user's point balance is unchanged after the failure is shown.

**Acceptance Scenarios**:

1. **Given** a lawyer submits an AI action, **When** the action fails before producing a usable result, **Then** no points are deducted.
2. **Given** the AI response is malformed, incomplete, or rejected by quality validation, **When** the user sees the error state, **Then** no points are deducted.
3. **Given** points were temporarily held while the request was running, **When** the request ultimately fails, **Then** the held points are restored and the visible balance matches the pre-request balance.

---

### User Story 3 - Confirm Retry Or Re-run Charges (Priority: P1)

As a lawyer retrying or re-running any AI action, I want a clear confirmation that the action will consume points before it starts so that I intentionally approve every repeated charge.

**Why this priority**: Retries and re-runs can be accidental, especially after errors, refreshes, or repeated clicks. The user explicitly requested confirmation before any retry deducts points.

**Independent Test**: Can be tested by opening every retry, regenerate, re-run, and start-over AI action and confirming the action cannot begin until the lawyer accepts a charge confirmation.

**Acceptance Scenarios**:

1. **Given** an AI request failed and a retry action is available, **When** the lawyer clicks retry, **Then** a confirmation explains that retrying will consume points before the retry can start.
2. **Given** an AI request previously succeeded and the lawyer chooses to regenerate or re-run it, **When** the confirmation is declined, **Then** no new request starts and no points are deducted.
3. **Given** the lawyer accepts the retry or re-run confirmation, **When** the repeated request succeeds, **Then** the correct points are deducted once for that repeated request.

---

### User Story 4 - Block AI Requests With Insufficient Points (Priority: P2)

As a lawyer with insufficient points, I want AI actions to clearly explain that I do not have enough points before starting so that I do not wait for work that cannot be performed.

**Why this priority**: Starting a request that cannot be paid for creates confusing failure states and weakens usage control.

**Independent Test**: Can be tested by setting the user's balance below an AI action cost, attempting the action, and confirming no request starts and no points are deducted.

**Acceptance Scenarios**:

1. **Given** a lawyer has fewer points than an AI action requires, **When** the lawyer attempts the action, **Then** the request is not started and the lawyer sees a clear insufficient-points message.
2. **Given** the lawyer's balance changes while a confirmation is open, **When** the lawyer confirms after the balance is no longer sufficient, **Then** the request is blocked and no points are deducted.
3. **Given** a retry or re-run would cost points, **When** the lawyer has insufficient points, **Then** the confirmation path prevents starting the repeated request.

---

### User Story 5 - Show Clear Point History (Priority: P2)

As a lawyer or administrator reviewing usage, I want point deductions, failed no-charge attempts, and restored holds to be traceable so that disputed AI charges can be understood.

**Why this priority**: Users need confidence that balances are correct, and support needs evidence when users ask why points changed.

**Independent Test**: Can be tested by completing successful, failed, retried, and declined AI actions, then reviewing the usage history and confirming each balance-impacting event is explainable.

**Acceptance Scenarios**:

1. **Given** an AI request succeeds, **When** usage history is reviewed, **Then** it shows the action, time, cost, and resulting charge.
2. **Given** an AI request fails without charge, **When** usage history is reviewed, **Then** it shows that the attempt failed and did not reduce the user's balance.
3. **Given** a held amount is restored after failure, **When** usage history is reviewed, **Then** the restoration is visible and tied to the failed request.

### Edge Cases

- The user double-clicks an AI submit, retry, or re-run button.
- The page refreshes after submission but before the AI result is shown.
- The same active AI request is resumed from another browser tab.
- An AI request succeeds but the user navigates away before viewing the result.
- An AI request returns malformed, partial, empty, or legally unusable output.
- A network error occurs after the request is accepted but before the user sees the final status.
- A retry is clicked after a failed request whose original attempt was not charged.
- A re-run is clicked after a successful request that was already charged.
- The user's points balance changes between opening a confirmation and accepting it.
- A historical workflow result is viewed; viewing history must not consume points.
- A background completion arrives after the user starts a newer run of the same AI action.
- A charge attempt cannot be completed even though the AI result succeeded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST define a point cost for every user-triggered AI action that can generate, analyze, draft, summarize, classify, or regenerate content.
- **FR-002**: The system MUST show the applicable point cost before starting any AI action where the user is expected to make a charge-impacting choice.
- **FR-003**: The system MUST deduct points exactly once for each AI request that completes with a usable result accepted by the product.
- **FR-004**: The system MUST NOT deduct points for AI requests that fail, time out, are cancelled, are blocked, or produce unusable output.
- **FR-005**: If points are held while an AI request is in progress, the system MUST restore the held points when the request does not complete with a usable result.
- **FR-006**: The system MUST prevent duplicate charges caused by double-clicking, browser refresh, resume behavior, repeated status updates, or receiving the same completion more than once.
- **FR-007**: The system MUST block an AI request before it starts when the user does not have enough available points for the action.
- **FR-008**: Retry, regenerate, re-run, and start-over actions for AI work MUST require explicit user confirmation before a new chargeable request can start.
- **FR-009**: Retry and re-run confirmations MUST state that accepting will consume points if the repeated request succeeds.
- **FR-010**: Declining a retry or re-run confirmation MUST leave the current result or error state unchanged and MUST NOT deduct points.
- **FR-011**: A retry after a failed no-charge attempt MUST be treated as a new chargeable request only after the user confirms and the retry succeeds.
- **FR-012**: A re-run after a successful charged result MUST be treated as a separate chargeable request only after the user confirms and the re-run succeeds.
- **FR-013**: The user-visible point balance MUST update after successful charges, restored holds, and blocked insufficient-point attempts in a way that matches the final request outcome.
- **FR-014**: The system MUST display clear Arabic feedback when points are deducted, when no points were deducted because of an error, when points are restored, and when points are insufficient.
- **FR-015**: The system MUST record enough usage history to explain successful charges, failed no-charge attempts, restored holds, retries, and re-runs.
- **FR-016**: Usage history MUST distinguish between an initial AI request, retry after failure, and re-run/regeneration after success.
- **FR-017**: Viewing existing AI outputs, historical snapshots, or previously completed workflow stages MUST NOT consume points.
- **FR-018**: All supported AI-enabled areas MUST follow the same point deduction, failure no-charge, confirmation, and duplicate-prevention rules unless an action is explicitly marked as free.
- **FR-019**: If an AI result succeeds but the point deduction cannot be finalized, the system MUST avoid silently showing the result as normally completed and MUST present a recoverable state for support or user action.
- **FR-020**: The system MUST keep existing case access, subscription access, and user permission rules unchanged while applying point accounting.

### Key Entities

- **AI Action**: A user-triggered capability that asks AI to generate or process legal work. Key attributes include action name, context, point cost, and whether it is chargeable or free.
- **Point Balance**: The user's available AI usage balance. Key attributes include current available points, held points if applicable, and last visible update time.
- **AI Request**: A single submitted AI action attempt. Key attributes include action, user, case or workflow context, status, cost, result usability, and whether it has been charged.
- **Point Transaction**: A record explaining a balance change or no-charge outcome. Key attributes include request reference, amount, transaction type, reason, timestamp, and resulting balance.
- **Retry Confirmation**: A user decision point shown before retrying or re-running AI work. Key attributes include action name, cost, current balance, confirmation decision, and decision time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of tested successful AI requests, the user's balance is reduced exactly once by the correct cost.
- **SC-002**: In 100% of tested failed, timed-out, blocked, cancelled, malformed, or unusable AI outcomes, the user's final balance is unchanged from before the attempt.
- **SC-003**: In 100% of tested retry, regenerate, re-run, and start-over flows, a confirmation appears before a new chargeable request starts.
- **SC-004**: In 100% of tests where a retry or re-run confirmation is declined, no new AI request starts and no points are deducted.
- **SC-005**: In 100% of double-click, refresh, resume, and duplicate-completion tests, at most one charge is recorded for the same successful AI request.
- **SC-006**: In 100% of insufficient-point tests, the AI request is blocked before starting and the user's balance is unchanged.
- **SC-007**: 95% of lawyers in usability checks can correctly identify whether retrying an AI action will consume points before accepting the confirmation.
- **SC-008**: Support complaints about unexpected AI point deductions decrease by at least 80% after release.

## Assumptions

- The feature applies to all lawyer-facing AI actions, including legal workflows, document drafting, analysis, chat-like assistance, and any regenerate or retry actions.
- "Usable result" means the product accepts the AI output as valid enough to show or save for the user's legal workflow.
- A failed request includes service errors, validation failures, timeout states, insufficient-points blocks, and user-cancelled attempts before completion.
- Some AI actions may be intentionally free, but they must be explicitly identified so users and administrators can understand why no points were deducted.
- Existing subscription and access rules continue to decide whether a user may open a feature; this feature only governs point charging for AI usage.
- Arabic is the primary language for user-facing point and confirmation messages.
