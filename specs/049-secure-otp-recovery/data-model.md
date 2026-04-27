# Data Model: Secure Account Messaging

## 1. OTP Challenge

**Purpose**: Represents a single OTP verification challenge for password recovery or another protected account action.

**Core fields**

| Field | Type | Notes |
|------|------|------|
| `Id` | integer/guid | Existing entity key or upgraded key, depending on implementation path |
| `UserId` | guid | Required reference to `ApplicationUser` |
| `Purpose` | enum | `ForgetPassword`, `RegistrationVerification`, `SensitiveAction` |
| `CodeHash` | string | Store hashed OTP rather than plaintext |
| `ExpiresAtUtc` | datetime | Hard expiry for verification |
| `IssuedAtUtc` | datetime | Audit and cooldown support |
| `ConsumedAtUtc` | datetime? | Null until successful use |
| `InvalidatedAtUtc` | datetime? | Set when superseded or revoked |
| `AttemptCount` | integer | Failed verification count |
| `MaxAttempts` | integer | Policy-driven threshold |
| `DeliveryChannel` | enum | `Sms`, `Email` |
| `MaskedDestination` | string | Safe user-facing display |
| `RequestIp` | string? | Abuse review support |
| `RequestDeviceFingerprint` | string? | Optional abuse/throttle support |

**Validation rules**

- OTP must be single-use.
- Only one active OTP challenge per user and purpose.
- Expired, consumed, or invalidated challenges cannot be verified.
- Attempt count must not exceed `MaxAttempts`.

**State transitions**

`Issued -> Delivered|DeliveryFailed -> Verified -> Consumed`  
`Issued -> Expired`  
`Issued -> LockedOut`  
`Issued -> Invalidated`

## 2. Account Email Event

**Purpose**: Captures welcome and subscription email business events with enough state to prevent duplicates and support retries or manual follow-up.

**Core fields**

| Field | Type | Notes |
|------|------|------|
| `Id` | guid | Primary identifier |
| `UserId` | guid | Target account |
| `EventType` | enum/string | `WelcomeEmail`, `SubscriptionConfirmation`, `PasswordResetNotice` |
| `BusinessEventId` | string | Stable ID from registration, lawyer subscription, or password reset |
| `RecipientEmail` | string | Normalized target email |
| `SubjectTemplateKey` | string | Tracks template family |
| `DeliveryStatus` | enum | `Pending`, `Sent`, `Failed`, `Suppressed` |
| `SentAtUtc` | datetime? | Set on success |
| `FailureReasonCategory` | string? | Provider, configuration, timeout, validation |
| `RetryState` | string | `not_attempted`, `scheduled`, `manual_follow_up`, `completed` |
| `TriggeredBy` | string | Registration, payment callback, manual resend |

**Validation rules**

- One successful welcome email per finalized registration unless manually resent.
- One successful subscription confirmation per finalized subscription activation unless manually resent.
- Events must be keyed to a stable business event ID for deduplication.

## 3. Email Delivery Failure

**Purpose**: Existing persistence model for failed email deliveries; remains part of the design but may be extended with stronger event typing and retry metadata.

**Current fields**

- `EventType`
- `RelatedBusinessId`
- `RecipientAddress`
- `FailureReason`
- `FailedAt`
- `RetryState`

**Design note**

- This model can either remain as failure-only persistence with a separate success-tracking table, or evolve into a more general outbound message event record. The planned implementation should choose one path consistently.

## 4. Lawyer Subscription

**Purpose**: Existing business entity that becomes the authoritative trigger point for subscription confirmation email delivery after activation.

**Relevant fields**

- `LawyerId`
- `SubscriptionId`
- `StartDate`
- `EndDate`
- `IsActive`
- `UsedAiRequests`

**Messaging behavior**

- Welcome or subscription email decisions should derive from finalized subscription state, not from UI intent alone.

## 5. Application User

**Purpose**: Existing account entity used for identity, login, password reset targeting, and verified messaging destinations.

**Relevant fields**

- `Id`
- `PhoneNumber`
- `Email`
- `FullName`
- `IsActive`
- `RefreshToken`
- `RefreshTokenExpiresAt`

**Messaging behavior**

- Password recovery must use a verified contact destination.
- User-facing responses should reveal only masked destination values.

## Relationships

- `ApplicationUser 1 -> many OTP Challenges`
- `ApplicationUser 1 -> many Account Email Events`
- `ApplicationUser 1 -> many Lawyer Subscriptions` through Lawyer profile
- `LawyerSubscription 1 -> 0..many Account Email Events`

## Retention and audit expectations

- OTP records must remain available long enough for abuse review and troubleshooting, even after expiration or use.
- Email event and failure records must support security and support review without storing plaintext secrets or full OTP codes.
