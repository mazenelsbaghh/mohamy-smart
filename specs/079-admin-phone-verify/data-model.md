# Data Model: Admin Phone Verification Override

## ApplicationUser

Existing identity account for a platform user.

**Relevant Fields**
- `Id`: Unique user identifier.
- `PhoneNumber`: Current user phone number.
- `PhoneNumberConfirmed`: Whether the phone number is trusted as verified.
- `FullName`, `Email`, `UserType`, `IsActive`: Existing admin profile context.

**Validation Rules**
- Manual verification is allowed only when `PhoneNumber` is present.
- Manual verification is rejected when `PhoneNumberConfirmed` is already true.
- The phone number stored at the time of verification is captured in the audit record.

## ManualPhoneVerificationAudit

New durable audit record for an admin phone verification override.

**Fields**
- `Id`: Unique audit identifier.
- `UserId`: Target user whose phone was verified.
- `PhoneNumber`: Phone number that was manually verified at the time of action.
- `VerifiedByAdminId`: Admin account that performed the override.
- `Reason`: Required reason entered by the admin.
- `Created`: Timestamp inherited from the common audit base.
- `CreatedBy`: Actor inherited from the common audit base.
- `Updated`, `UpdatedBy`, `IsActive`, `RowVersion`: Standard base audit/concurrency fields.

**Relationships**
- `ManualPhoneVerificationAudit.UserId` references `ApplicationUser.Id`.
- `ManualPhoneVerificationAudit.VerifiedByAdminId` references `ApplicationUser.Id`.

**Validation Rules**
- `Reason` is required, trimmed, and length-limited.
- `PhoneNumber` is required and length-limited.
- `VerifiedByAdminId` must be an authenticated admin user id.

## AdminLawyerDetail

Existing admin detail projection extended with latest manual phone verification audit.

**Added Fields**
- `latestManualPhoneVerification`: Optional latest audit summary.

## ManualPhoneVerificationAuditSummary

DTO exposed to the admin dashboard.

**Fields**
- `id`: Audit id.
- `phoneNumber`: Phone number verified.
- `reason`: Admin-entered reason.
- `verifiedByAdminId`: Acting admin id.
- `verifiedByAdminName`: Acting admin name when available.
- `createdAt`: Audit timestamp.
