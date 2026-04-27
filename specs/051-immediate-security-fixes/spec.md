# Feature Specification: Immediate Security Fixes (Phase 0)

**Feature Branch**: `051-immediate-security-fixes`  
**Created**: 2026-04-20
**Status**: Draft  
**Input**: User description: "📍 Phase 0 — إجراءات فورية (خلال 24 ساعة)
لا يمكن تأجيلها - تسريبات أمنية نشطة
- تدوير (rotate) جميع المفاتيح المسرّبة فوراً: OpenAI, Gemini, Google Vision, Paymob (SecretKey/HMAC), JWT signing key, SMTP password, SMS credentials
- إضافة .env.docker إلى .gitignore
- حذف الأسرار من تاريخ Git (git filter-repo أو BFG)
- نقل المفاتيح إلى secret manager (Azure Key Vault / AWS Secrets Manager / Doppler)
- إخطار فريق الدفع بإعادة إصدار Paymob HMAC
المخرجات: ريبو نظيف، مفاتيح جديدة في vault."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure System Configuration and Credential Rotation (Priority: P1)

As a system administrator, I want all compromised credentials to be rotated and securely stored in a Secret Manager, so that active security leaks are stopped and unauthorized access is prevented immediately.

**Why this priority**: Active security leaks pose an immediate financial and data risk. Stopping the leaks and rotating the keys is the most critical action that cannot be delayed.

**Independent Test**: Can be fully tested by verifying that old credentials no longer work, the application successfully authenticates with new credentials from the Secret Manager, and `.env.docker` is no longer tracked in the repository.

**Acceptance Scenarios**:

1. **Given** a compromised environment, **When** all leaked keys (OpenAI, Gemini, Google Vision, Paymob, JWT, SMTP, SMS) are rotated, **Then** the application should resume normal operations using the new keys.
2. **Given** the new keys are generated, **When** they are configured in a Secret Manager, **Then** the application should successfully fetch and utilize them without hardcoding.
3. **Given** the source code repository, **When** `.env.docker` is added to `.gitignore` and history is purged, **Then** old secrets must no longer exist in any Git history or commit.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST be configured to use a Secret Manager (Azure Key Vault, AWS Secrets Manager, or Doppler) for all sensitive configurations.
- **FR-002**: System MUST operate with freshly rotated keys for OpenAI, Gemini, Google Vision, Paymob (SecretKey/HMAC), JWT signing, SMTP, and SMS credentials.
- **FR-003**: System MUST NOT expose `.env.docker` or any secret files to source control.
- **FR-004**: System MUST have a clean Git history without any previously leaked secrets.
- **FR-005**: System MUST facilitate the Paymob HMAC reissue process with the payment team.

### Key Entities

- **Secret Keys/Credentials**: Represent all third-party and internal API keys, passwords, and signing tokens used by the application.
- **Secret Manager**: Represents the external secure storage solution (e.g., Azure Key Vault) that handles the keys.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the listed compromised keys are rotated and functionally validated in production.
- **SC-002**: 0 leaked secrets remain in the Git repository history.
- **SC-003**: The application successfully starts and connects to all third-party services using keys exclusively fetched from the Secret Manager.
- **SC-004**: `.env.docker` is ignored by Git and removed from the active index.

## Assumptions

- Secret Manager infrastructure (Azure Key Vault, AWS Secrets Manager, or Doppler) is either available or can be rapidly provisioned.
- The team has the necessary access rights to rotate all third-party credentials (OpenAI, Gemini, Google Vision, Paymob, SMTP, SMS).
- The team has permissions to rewrite Git history (e.g., force pushing to the repository) to purge leaked secrets.
