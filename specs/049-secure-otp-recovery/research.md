# Research: Secure Account Messaging

## Decision 1: Use the existing MailKit email infrastructure for welcome and subscription emails

- **Decision**: Keep `Lawyer.Infrastracture/Services/EmailService.cs` as the primary email delivery path and extend its event coverage to include registration welcome emails, password-reset notices, and subscription confirmation emails.
- **Rationale**: The project already has `EmailSettings`, `IEmailService`, and persisted `EmailDeliveryFailure` records. Reusing this path minimizes new infrastructure and keeps failure auditing aligned with Principle I.
- **Alternatives considered**:
  - Introduce a second email provider SDK directly in application services: rejected because it duplicates delivery logic and bypasses the current failure-recording model.
  - Send welcome/subscription emails synchronously from controllers: rejected because it violates clean architecture boundaries and makes retries/auditing harder.

## Decision 2: Integrate OTP SMS through a provider-backed infrastructure adapter with runtime-only credentials

- **Decision**: Implement SMS OTP delivery behind an infrastructure service interface, configured from environment/appsettings secrets, with the initial provider pointing at the externally supplied Plus SMS HTTP endpoint pattern.
- **Rationale**: The user requirement explicitly calls for OTP delivery over SMS. Encapsulating the provider behind an interface keeps the application layer provider-agnostic, avoids hardcoding credentials, and makes fallback or replacement possible later.
- **Alternatives considered**:
  - Keep OTP email-only: rejected because the requested feature explicitly includes SMS OTP and existing auth flow is phone-centric.
  - Call the SMS provider directly inside `AuthService`: rejected because it couples business logic to provider transport details and weakens testability.

## Decision 3: Replace the current static OTP with generated, single-use, expiring challenges

- **Decision**: Replace the hardcoded `1234` OTP path in `AuthService` with cryptographically generated short-lived codes, invalidate previous active OTPs for the same purpose, and mark OTPs as used after successful verification.
- **Rationale**: The current implementation is explicitly temporary and logs the OTP value. That violates the security expectations in the spec and constitution. Single-use, expiring challenges are the minimum acceptable baseline.
- **Alternatives considered**:
  - Keep the static OTP and add rate limiting only: rejected because it remains trivially guessable and unsafe.
  - Use ASP.NET Identity password reset tokens directly in the UI: rejected because the product requirement expects OTP-based verification and phone/SMS delivery.

## Decision 4: Return generic responses for password recovery initiation

- **Decision**: Change forgot-password initiation responses so they do not reveal whether the user exists, while still recording internal audit and delivery outcomes.
- **Rationale**: The current `User not found.` response leaks account existence. The feature spec requires enumeration resistance. Generic user-facing copy can coexist with precise internal diagnostics.
- **Alternatives considered**:
  - Preserve current not-found response for UX clarity: rejected because it directly conflicts with FR-008 and the constitution’s security posture.

## Decision 5: Keep subscription confirmation email tied to successful business completion, not payment initiation

- **Decision**: Send subscription confirmation only after the business event is finalized, which in paid flows means after successful payment callback and subscription activation, and in free-trial/registration flows means after the free-trial subscription is persisted.
- **Rationale**: The current architecture already activates paid subscriptions inside `PaymobService.HandleServerCallbackAsync` via `SubscriptionService.SubscribeAsync`. Attaching user email confirmation to finalized activation prevents false positives and duplicate messages.
- **Alternatives considered**:
  - Send confirmation on payment initiation: rejected because pending or failed payments would generate misleading emails.
  - Send confirmation separately from subscription service state changes: rejected because it increases drift between business truth and user messaging.

## Decision 6: Add event-level deduplication and auditability for account emails

- **Decision**: Track welcome and subscription email events with stable business identifiers and delivery state so the system can prevent duplicate sends and support manual follow-up.
- **Rationale**: The existing `EmailDeliveryFailure` table captures failures only. The expanded feature requires reasoning about successful sends, retries, and duplicate prevention across registration and subscription events.
- **Alternatives considered**:
  - Infer deduplication from logs only: rejected because logs are not a reliable business-level source of truth.
  - Rely on provider idempotency alone: rejected because business-event deduplication must remain under application control.

## Decision 7: Frontend changes should stay minimal and contract-driven

- **Decision**: Limit frontend scope to consuming the updated auth endpoints, showing Arabic-first generic forgot-password messaging, and not exposing provider-specific delivery details.
- **Rationale**: Most of the feature risk and complexity sits in backend auth, messaging, and persistence. Keeping the UI thin reduces regression risk while still satisfying UX requirements.
- **Alternatives considered**:
  - Build multi-step OTP orchestration separately in every client: rejected because shared contracts and minimal client branching are easier to maintain.
  - Expose raw provider delivery errors in the UI: rejected because it leaks operational details and degrades UX consistency.
