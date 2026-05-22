# Mobile API Coverage Contract

This contract records backend-backed capabilities the mobile app must expose or handle explicitly. If a backend capability is missing, the mobile UI must show an honest unavailable/error state rather than silently simulating production data.

## Authentication

- Login
- Logout
- Current profile
- Sign up
- Phone verification
- Resend verification code
- Forgot password
- Reset password
- Session refresh or restoration

## Cases

- List cases with pagination/filter/search support
- Get case details
- Create case with case type, court, client, facts, parties, and claims
- Update case core details
- Add/update/delete case facts
- Link documents to case
- List case agenda items
- List case workflow versions and outputs

## Clients

- List clients with pagination/search support
- Get client details
- Create client
- Update client
- Link client to cases and powers of attorney

## Agenda

- List lawyer agenda
- Get agenda item details
- Create session/task/reminder
- Update agenda item
- Complete/cancel/reschedule agenda item

## Documents and OCR

- List documents
- Upload document with progress-compatible response
- Get document details/status
- Retry failed processing
- Download/preview document
- Delete document if allowed
- Start OCR or retrieve OCR result
- Confirm OCR review and create/update case

## AI Workflows

- List available workflow families for a case
- Start or resume workflow run
- Trigger workflow step job
- Receive job status updates
- Fetch job history/fallback status
- Fetch current AI point balance before charge
- Confirm chargeable step or handle insufficient points
- Save workflow snapshot/version
- Rename workflow version
- Restore workflow version
- Delete workflow version
- Export or retrieve final workflow output

## Legal Library

- Inheritance calculator inputs/results
- Court fees calculator inputs/results
- List/create/cancel powers of attorney
- List/create/update/archive internal regulations

## Legal Contracts

- List contracts
- Create contract
- Get contract details
- Update contract
- Generate/export contract output

## Process Server Papers

- List papers
- Create paper
- Get paper details
- Update paper
- Generate/export paper output

## Subscription and Notifications

- Get active subscription plan
- Get AI point balance
- Get AI point history
- Start or guide top-up/renewal flow
- List notifications
- Mark notification read/unread
- Deep-link notification destination

## Error Contract

All mobile API calls must expose:

- `loading`
- `success`
- `empty`
- `partial`
- `unauthorized`
- `forbidden`
- `offline`
- `validationError`
- `serverError`
- `retryableFailure`

The UI must map each state to Arabic text and a clear user action.

