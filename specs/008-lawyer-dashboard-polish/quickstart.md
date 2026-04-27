# Quickstart: Lawyer Dashboard Fixes and Polish

## Prerequisites

1. Confirm the canonical local ports are in use:
   - Lawyer Dashboard: `http://localhost:5078`
   - Backend API: `http://localhost:8976`
2. Ensure backend secrets and Paymob settings come from local development configuration only.
3. Ensure a lawyer test account exists with:
   - Valid login credentials
   - At least one subscription plan available in the database
   - Optional existing documents or contracts for list-state testing

## Local Run Flow

### Backend

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer"
dotnet run
```

### Lawyer Dashboard

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard"
npm install
npm run dev
```

## Verification Flow

1. Sign in as a lawyer and open the dashboard.
2. Force or simulate access-token expiry, then trigger multiple protected requests and verify:
   - only one refresh attempt is made
   - successful refresh resumes pending work once
   - failed refresh signs the user out once and redirects to `/auth/login`
3. Open Settings and verify:
   - profile information loads from `GET /api/account/profile`
   - profile updates persist through `PUT /api/account/profile`
   - password changes use `PUT /api/account/change-password`
   - current subscription loads from `GET /api/subscription/lawyer`
4. In the subscription section:
   - load plans from `GET /api/subscription`
   - start payment with `POST /api/payment/initiate`
   - verify payment completion via `GET /api/payment/status/{paymentId}`
   - refresh settings and confirm the active subscription reflects the result
5. Open Documents and verify:
   - existing records render from `GET /api/documents`
   - no-record scenarios show an Arabic empty state
   - processing or failed items render explicit status, not broken placeholders
6. Open Legal Contracts and verify:
   - records render from `GET /api/legal-contracts` when supported
   - unsupported capability returns a clear Arabic unavailable state
7. Open Chat and verify:
   - sending a message calls `POST /api/smartanalysis/chat`
   - assistant responses append to the conversation
   - unavailable or quota failures preserve page usability and show Arabic error feedback

## Validation Commands

From the repository root:

```bash
npm test && npm run lint
```

If frontend-specific scripts must be run from the dashboard workspace instead:

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard"
npm test
npm run lint
```
