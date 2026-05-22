# Data Model: Mobile Web Parity

## LawyerAccount

Represents the authenticated lawyer.

**Fields**:
- `id`
- `displayName`
- `email`
- `phone`
- `licenseNumber`
- `firmName`
- `aiPoints`
- `roles`
- `preferences`

**Relationships**:
- Owns cases, clients, documents, agenda items, workflow versions, subscription, and notifications.

**Validation**:
- Display name and primary contact must be non-empty after profile load.
- AI points must be zero or positive.

## MobileSession

Represents app authentication and session restoration state.

**Fields**:
- `accessToken`
- `refreshToken`
- `expiresAt`
- `isRestoring`
- `isAuthenticated`
- `lastAuthError`

**State Transitions**:
- `unknown` → `restoring`
- `restoring` → `authenticated`
- `restoring` → `signedOut`
- `authenticated` → `expired`
- `expired` → `signedOut` or `authenticated`

## LegalCase

Represents a legal matter.

**Fields**:
- `id`
- `caseNumber`
- `title`
- `clientId`
- `clientName`
- `court`
- `caseType`
- `status`
- `facts`
- `legalClaims`
- `adversary`
- `documentIds`
- `nextSessionAt`
- `readiness`

**Relationships**:
- Belongs to LawyerAccount.
- References Client, Documents, AgendaItems, and AIWorkflows.

**Validation**:
- Case number, court, case type, and client context are required for creation.
- Facts are required before eligible AI workflows can start.

## Client

Represents a represented person or organization.

**Fields**:
- `id`
- `name`
- `phone`
- `email`
- `address`
- `caseIds`
- `documentIds`
- `powerOfAttorneyIds`
- `lastActivity`

**Validation**:
- Name is required.
- Phone/email must show friendly validation when invalid or missing for contact actions.

## AgendaItem

Represents a session, task, reminder, or legal date.

**Fields**:
- `id`
- `caseId`
- `title`
- `court`
- `startsAt`
- `status`
- `notes`
- `reminderState`

**State Transitions**:
- `pending` → `completed`
- `pending` → `cancelled`
- `pending` → `rescheduled`

## LegalDocument

Represents an uploaded or scanned legal file.

**Fields**:
- `id`
- `title`
- `type`
- `caseId`
- `clientId`
- `createdAt`
- `status`
- `isAiReady`
- `ocrReviewId`
- `failureReason`

**State Transitions**:
- `selected` → `uploading`
- `uploading` → `processing`
- `processing` → `ready`
- `processing` → `failed`
- `failed` → `uploading` on retry

## OcrReview

Represents extracted data waiting for lawyer confirmation.

**Fields**:
- `id`
- `documentId`
- `caseNumber`
- `court`
- `caseType`
- `clientName`
- `adversary`
- `facts`
- `confidence`
- `reviewStatus`

**Validation**:
- Required case creation fields must be confirmed before creating a case.
- Low-confidence fields must be visibly flagged.

## AiWorkflow

Represents one case-bound workflow family.

**Fields**:
- `caseId`
- `workflowType`
- `title`
- `status`
- `pointCost`
- `currentStep`
- `totalSteps`
- `selectedFactIds`
- `selectedDocumentIds`
- `runId`
- `lastSavedAt`

**Relationships**:
- Belongs to LegalCase.
- Has AIWorkflowSteps, WorkflowVersions, and AI jobs.

**State Transitions**:
- `notStarted` → `ready`
- `ready` → `running`
- `running` → `paused`
- `running` → `completed`
- `running` → `failed`
- `failed` → `running` on retry

## AiWorkflowStep

Represents one step in a legal AI workflow.

**Fields**:
- `workflowType`
- `stepNumber`
- `stepType`
- `title`
- `inputSummary`
- `output`
- `status`
- `charge`

**Validation**:
- A step cannot start if required prior output is missing.
- A chargeable step cannot start without explicit point confirmation.

## WorkflowVersion

Represents a saved workflow snapshot.

**Fields**:
- `id`
- `caseId`
- `workflowType`
- `label`
- `createdAt`
- `currentStep`
- `outputs`

**State Transitions**:
- `saved` → `renamed`
- `saved` → `restored`
- `saved` → `deleted`

## AiPointLedgerEntry

Represents one points transaction.

**Fields**:
- `id`
- `title`
- `points`
- `date`
- `workflowType`
- `caseId`
- `transactionType`

**Validation**:
- Deductions must show as negative values in mobile UI.
- Balance cannot be interpreted as available when stale or failed to load.

## LegalContract

Represents a generated or managed legal contract.

**Fields**:
- `id`
- `title`
- `status`
- `clientId`
- `caseId`
- `createdAt`
- `outputState`

## ProcessServerPaper

Represents a procedural paper.

**Fields**:
- `id`
- `title`
- `status`
- `caseId`
- `createdAt`
- `nextAction`
- `outputState`

## NotificationItem

Represents a mobile notification center item.

**Fields**:
- `id`
- `category`
- `title`
- `body`
- `createdAt`
- `isRead`
- `destinationType`
- `destinationId`

**State Transitions**:
- `unread` → `read`
- `unread` → `dismissed`

## ScreenLoadState

Reusable UI state for all primary screens.

**Fields**:
- `status`: `idle`, `loading`, `ready`, `empty`, `partial`, `error`, `offline`
- `message`
- `lastUpdatedAt`
- `retryAction`

