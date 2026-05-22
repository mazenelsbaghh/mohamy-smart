# Research: Admin Phone Verification Override

## Decision 1: Store Manual Verification Audits in SQL Server

**Decision**: Add a dedicated `ManualPhoneVerificationAudit` domain entity persisted in SQL Server.

**Rationale**: The feature requires audit details to be visible later in the admin user detail view. Existing Serilog audit entries are useful for logs but are not queryable through the current admin profile flow. A table provides durable, reportable data and supports the requirement that audit persistence must succeed with the user state change.

**Alternatives considered**:
- Serilog-only audit entry: rejected because the admin detail view cannot reliably query it.
- Reusing `Otp` rows: rejected because a manual override is an administrative decision, not an OTP attempt.
- Adding columns to `AspNetUsers`: rejected because only the latest state would be available and historical accountability would be lost.

## Decision 2: Extend Existing Admin Lawyer Detail Boundary

**Decision**: Extend `AdminLawyerService`, `AdminLawyersController`, and the admin dashboard `LawyerDetails` page.

**Rationale**: The admin already reviews the person, phone number, phone verification status, subscription, and activity in this feature boundary. Keeping the override here avoids introducing a second user-management surface and keeps the workflow under the existing admin authorization route.

**Alternatives considered**:
- New standalone user-management page: rejected for v1 because the existing user detail surface already contains the needed context.
- Direct database operation by operators: rejected because it is not auditable through the application and bypasses authorization.

## Decision 3: Require Reason and Transactional Update

**Decision**: The service must reject blank reasons, reject already verified phones, reject users without a phone number, and persist the audit record in the same save operation as setting `PhoneNumberConfirmed = true`.

**Rationale**: Manual phone verification bypasses the normal OTP proof path. A reason and durable audit record are minimum controls. A single transaction boundary prevents a state where the phone is verified without an audit record.

**Alternatives considered**:
- Optional reason: rejected because it weakens accountability.
- Best-effort audit after verification: rejected because audit failure would leave an unverifiable trust-state change.

## Decision 4: Latest Audit in Detail Response for v1

**Decision**: Return the latest manual verification audit details as part of the existing lawyer detail DTO.

**Rationale**: The spec requires the latest manual verification details to be visible. Returning it with the detail payload avoids another request and keeps the UI simple.

**Alternatives considered**:
- Full audit history endpoint: useful later, but outside the first release scope.
- Toast-only confirmation: rejected because audit visibility must survive page reloads.
