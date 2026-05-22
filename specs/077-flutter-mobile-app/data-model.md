# Data Model: Mohamy Smart Mobile App

## LawyerProfile

- `id`: stable identifier
- `displayName`: Arabic lawyer display name
- `licenseNumber`: professional license number
- `firmName`: office or firm name
- `phone`: contact phone
- `email`: contact email
- `aiPoints`: current AI point balance
- `darkMode`: display preference

## LegalCase

- `id`: stable identifier
- `caseNumber`: display case number
- `title`: short case title
- `clientId`: linked Client
- `clientName`: denormalized display name for mobile lists
- `court`: court name
- `caseType`: legal category
- `status`: active, pending, completed
- `nextSessionAt`: optional upcoming session date/time
- `facts`: list of key facts
- `documentIds`: linked documents
- `readiness`: document/fact/point readiness summary

### Validation Rules

- `caseNumber`, `clientName`, `court`, and `caseType` are required for a saved case.
- Long case numbers and mixed Arabic/English values must remain display-safe.

## Client

- `id`: stable identifier
- `name`: Arabic client name
- `phone`: primary phone
- `email`: optional email
- `caseIds`: linked cases
- `lastActivity`: latest interaction summary

## AgendaItem

- `id`: stable identifier
- `caseId`: linked case
- `title`: hearing/task title
- `court`: court name
- `startsAt`: date/time
- `status`: upcoming, overdue, completed

## LegalDocument

- `id`: stable identifier
- `caseId`: optional linked case
- `clientId`: optional linked client
- `title`: file title
- `type`: judgment, claim, memo, power of attorney, other
- `date`: display date
- `status`: uploading, processing, ready, failed
- `isAiReady`: whether extracted content is ready for AI workflows

## AiWorkflow

- `id`: stable identifier
- `caseId`: linked case
- `title`: workflow name
- `description`: short legal purpose
- `pointCost`: required AI points
- `status`: available, blocked, running, paused, failed, completed
- `progress`: 0-100
- `outputPreview`: optional generated output summary

### State Transitions

- `available` → `running` when points and inputs are sufficient.
- `blocked` → `available` when required data or points become available.
- `running` → `paused`, `failed`, or `completed`.
- `failed` → `running` on retry.

## SubscriptionPlan

- `name`: plan display name
- `renewalDate`: next renewal date
- `aiPoints`: current balance
- `usageEntries`: AI point deductions and additions

## SystemState

- `type`: loading, empty, error, offline, permissionDenied, insufficientPoints
- `title`: Arabic title
- `message`: short Arabic explanation
- `primaryAction`: one recovery action

