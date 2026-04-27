# Quickstart: Secure Account Messaging

## Goal

Validate the end-to-end setup for password recovery OTP, welcome emails, and subscription confirmation emails in local development without committing secrets.

## 1. Configure runtime secrets

Add placeholder-backed local values in the git-ignored backend configuration:

- SMTP host, port, username, password, sender address, sender name, SSL flag
- SMS provider base URL, username, password, sender name, and any required template identifiers
- Public app base URL for links included in welcome or password-reset notifications

Do not place real credentials in:

- `appsettings.json`
- `appsettings.example.json`
- `.env.docker.example`
- source code

## 2. Start local dependencies

From the repository root:

```bash
make setup
make dev
```

If the database schema changes for OTP or outbound message persistence:

```bash
make db-migrate
```

## 3. Verify registration welcome email

1. Open the landing registration flow.
2. Register a fresh user with a reachable email address.
3. Confirm the account is created and the free-trial subscription is assigned.
4. Verify a welcome email is delivered or a delivery failure is recorded for investigation.

## 4. Verify forgot-password OTP flow

1. Open a forgot-password screen in the lawyer or admin dashboard.
2. Submit a valid account identifier.
3. Confirm the UI shows a generic success message regardless of account existence.
4. Retrieve the OTP from the configured test channel.
5. Submit the OTP and set a new password.
6. Confirm the OTP cannot be reused.

## 5. Verify subscription confirmation email

1. Initiate a plan purchase or activation flow.
2. Complete the payment callback or eligible free activation path.
3. Confirm the subscription becomes active.
4. Verify exactly one subscription confirmation email is delivered for the finalized business event.

## 6. Run focused tests

Backend:

```bash
cd /Users/mazenelsbagh/mazen\ mac/apps/mohamy\ smart/mohamy-smart-backend
dotnet test
```

Frontend clients:

```bash
cd /Users/mazenelsbagh/mazen\ mac/apps/mohamy\ smart/mohamy-smart-lawyer-dashboard
npm test

cd /Users/mazenelsbagh/mazen\ mac/apps/mohamy\ smart/mohamy-smart-admin-dashboard
npm test

cd /Users/mazenelsbagh/mazen\ mac/apps/mohamy\ smart/mohamy-smart-landing
npm test
```

## 7. Review audit outputs

Confirm that local verification leaves reviewable artifacts for:

- OTP issuance attempts
- OTP verification failures and lockouts
- Email delivery failures
- successful password reset completion
- successful subscription activation email issuance
