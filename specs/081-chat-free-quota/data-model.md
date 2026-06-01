# Data Model: Chat Free Quota

## Existing Entity: AiUsageRecord

Represents a successful AI provider usage record.

Relevant fields:

- `LawyerId`: lawyer who made the chat request.
- `AiStepType`: `Chat` identifies smart chat replies.
- `CaseId`: optional case context for the chat request.
- `ModelIdentifier`, `Provider`, token and cost fields: existing usage metadata.
- `CreatedAt`: used for audit ordering.

Validation rules:

- Only successful assistant replies create usage records.
- Failed provider calls must not create a chat usage record.

## Existing Entity: AiPointTransaction

Represents point accounting audit history.

Relevant fields:

- `LawyerId`: lawyer charged or recorded.
- `LawyerSubscriptionId`: active subscription when a transaction is recorded.
- `CaseId`: optional case context.
- `StepType`: `Chat`.
- `TransactionType`: `NoCharge` for free replies, `Charge` for paid replies.
- `Points`: `0` for free replies, `1` for paid replies.
- `BalanceBefore`, `BalanceAfter`: unchanged for free replies; incremented used-points balance for paid replies.
- `ReasonCode`: `Success`.
- `MessageAr`: Arabic accounting message.

Validation rules:

- Paid chat transaction points must be exactly `1`.
- Free chat transaction points must be exactly `0`.
- Transactions are written only after successful assistant replies.

## Existing Entity: LawyerSubscription

Represents active subscription and AI point balance.

Relevant fields:

- `LawyerId`: owner.
- `IsActive`, `StartDate`, `EndDate`: active subscription window.
- `UsedAiRequests`: consumed point count.
- `Subscription.AiRequestsLimit`: point limit.

Validation rules:

- Paid chat requires an active, unexpired subscription with at least one available point.
- Free chat replies do not deduct points.

## Derived Concept: Chat Free Quota State

Not a new table. Computed per request:

- `SuccessfulChatCount`: count of successful prior `AiUsageRecord` rows for the lawyer where `AiStepType == Chat`.
- `FreeRepliesRemaining`: `max(0, 5 - SuccessfulChatCount)`.
- `NextReplyIsFree`: `SuccessfulChatCount < 5`.
- `NextReplyCost`: `0` when free, `1` when paid.
