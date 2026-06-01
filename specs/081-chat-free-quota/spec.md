# Feature Specification: Chat Free Quota

**Feature Branch**: `081-chat-free-quota`  
**Created**: 2026-06-01  
**Status**: Draft  
**Input**: User description: "خلي ف الشات ليك بس ٥ فري بعهدا هتكون بخصم نقطه"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use Five Free Chat Replies (Priority: P1)

As a lawyer, I can use the smart chat for my first five successful assistant replies without consuming AI points, so I can try the chat before points are deducted.

**Why this priority**: This is the core business rule and must work before charging can be considered correct.

**Independent Test**: A lawyer with fewer than five previous successful chat replies sends a chat message and receives an assistant reply while their available AI point balance remains unchanged.

**Acceptance Scenarios**:

1. **Given** a lawyer has zero prior successful smart chat replies, **When** they send a valid smart chat message and the assistant returns a response, **Then** no AI point is deducted and the chat reply is recorded as a free chat usage.
2. **Given** a lawyer has four prior successful smart chat replies, **When** they send a valid smart chat message and the assistant returns a response, **Then** no AI point is deducted and the free usage count reaches five.

---

### User Story 2 - Charge One Point After Free Quota (Priority: P1)

As a lawyer who already used five successful free chat replies, each additional successful chat reply costs one AI point.

**Why this priority**: Charging after the free quota is the second half of the requested billing rule and protects paid AI capacity.

**Independent Test**: A lawyer with five prior successful smart chat replies and available AI points sends a chat message and receives an assistant reply; exactly one point is deducted.

**Acceptance Scenarios**:

1. **Given** a lawyer has five prior successful smart chat replies and at least one available AI point, **When** they send a valid smart chat message and the assistant returns a response, **Then** exactly one AI point is deducted.
2. **Given** a lawyer has more than five prior successful smart chat replies and at least one available AI point, **When** they send another valid smart chat message and the assistant returns a response, **Then** exactly one AI point is deducted.

---

### User Story 3 - Block Paid Chat When Points Are Insufficient (Priority: P2)

As a lawyer who exhausted the free chat quota, I receive a clear Arabic payment-required message if I do not have enough AI points.

**Why this priority**: The system must avoid unpaid provider usage once the free quota is exhausted.

**Independent Test**: A lawyer with five prior successful chat replies and zero available AI points sends a chat message; the system returns a payment-required response and does not call the AI provider.

**Acceptance Scenarios**:

1. **Given** a lawyer has exhausted the five free smart chat replies and has zero available AI points, **When** they send a chat message, **Then** the request is rejected with an Arabic insufficient-points message before generating an assistant reply.

---

### Edge Cases

- Failed AI provider calls do not count toward the five free successful chat replies and do not deduct points.
- Empty or invalid messages follow the existing smart chat validation and do not count as successful chat replies.
- Concurrent chat requests from the same lawyer must not allow more than five successful free replies when the quota is already near exhaustion.
- Existing historical successful chat usage counts toward the free quota so lawyers cannot regain free replies after deployment.
- Chat linked to a case still uses the same quota as general chat; the quota is per lawyer, not per case or conversation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow exactly five successful smart chat assistant replies per lawyer without deducting AI points.
- **FR-002**: System MUST deduct exactly one AI point for each successful smart chat assistant reply after the lawyer has used five successful free replies.
- **FR-003**: System MUST check point availability before calling the AI provider when the lawyer has already exhausted the five free replies.
- **FR-004**: System MUST return an Arabic payment-required error when a lawyer has exhausted free replies and lacks at least one available AI point.
- **FR-005**: System MUST count only successful assistant replies toward the free quota; failed provider responses and rejected requests MUST NOT count.
- **FR-006**: System MUST record free chat usage in a durable audit trail so future requests can determine how many free replies were consumed.
- **FR-007**: System MUST preserve existing smart chat behavior, including selected internal regulations, case context, Arabic-only responses, and provider identity sanitization.
- **FR-008**: System MUST make the chat endpoint enforce the new free quota rule even when generic AI quota filters would otherwise block zero-balance lawyers before their free replies are used.

### Key Entities

- **Chat Usage Count**: The number of successful smart chat assistant replies already completed by a lawyer. It determines whether the next successful reply is free or chargeable.
- **AI Point Transaction**: The durable accounting record used for no-charge and charged chat replies, including lawyer, step type, points, reason, and Arabic message.
- **Lawyer Subscription Balance**: The active point balance used once chat replies become chargeable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A lawyer's first five successful chat replies complete with zero point deduction in 100% of tested cases.
- **SC-002**: The sixth and later successful chat replies deduct exactly one point in 100% of tested cases where balance is available.
- **SC-003**: Paid chat requests with insufficient points are rejected before provider invocation in 100% of tested cases.
- **SC-004**: Existing smart chat response quality and Arabic response formatting remain unchanged for free and paid replies.

## Assumptions

- The free quota is lifetime per lawyer across all conversations and cases, not a monthly reset.
- Existing successful `AiUsageRecord` chat rows count toward the five free replies after deployment.
- Existing AI point accounting remains the source of truth for point balances and transaction history.
- Frontend UI changes are not required for this iteration; existing payment-required handling is sufficient.
