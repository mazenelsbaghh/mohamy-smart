# Data Model: Phase 1 — Backend Critical Fixes

**Branch**: `061-p1-backend-fixes` | **Date**: 2026-04-23

## Overview

This phase involves **no database schema changes**. All entities, fields, and relationships remain unchanged. The data model documentation below captures the existing entities that are affected by the fixes and their validation rules.

## Existing Entities (No Schema Changes)

### BaseEntity<TKey>

**Location**: `Lawyer.Core/Models/BaseEntity.cs`

| Field | Type | Description |
|-------|------|-------------|
| `Id` | `TKey` | Auto-generated identity |
| `Created` | `DateTime` | UTC timestamp, defaults to `DateTime.UtcNow` |
| `CreatedBy` | `Guid` | **Currently never populated** — AuditInterceptor will fix this |
| `Updated` | `DateTime?` | Last modification timestamp |
| `UpdatedBy` | `Guid?` | **Currently never populated** — AuditInterceptor will fix this |
| `IsActive` | `bool` | Soft delete flag, defaults to `true` |
| `RowVersion` | `byte[]` | Timestamp for optimistic concurrency |

**Change**: `AuditInterceptor` will auto-populate `CreatedBy` on `Added` entities and `UpdatedBy`/`Updated` on `Modified` entities during `SaveChangesAsync`.

---

### Case

**Location**: `Lawyer.Core/Models/Case.cs` (inherits `BaseEntity<Guid>`)

| Field | Type | Validation Rules (NEW) |
|-------|------|----------------------|
| `Title` | `string` | Required, max 200 chars |
| `Number` | `string` | Required |
| `Court` | `string` | Required |
| `ClientName` | `string` | Required |
| `ApponentName` | `string?` | Optional |
| `DefendingParty` | `string` | Default "client" |
| `Description` | `string` | Required |
| `Facts` | `string` | Required |
| `LegalClaims` | `string` | Required |
| `CaseTypeIds` | `List<int>` | At least 1 required |
| `LawyerId` | `Guid` | FK to Lawyer (auto-resolved) |
| `ClientId` | `Guid?` | FK to Client |
| `Status` | `CaseStatus` | Enum |

**Change**: Case creation wrapped in transaction. FluentValidation enforces rules.

---

### Client

**Location**: `Lawyer.Core/Models/Client.cs` (inherits `BaseEntity<Guid>`)

| Field | Type | Validation Rules (NEW) |
|-------|------|----------------------|
| `ClientName` | `string` | Required |
| `PhoneNumber` | `string` | Required, Egyptian phone format |
| `Email` | `string?` | Optional, valid email format if provided |
| `NationalId` | `string?` | Optional, valid national ID format if provided |
| `Notes` | `string?` | Optional |
| `Address` | `string?` | Optional |
| `Governorate` | `string?` | Optional |
| `LawyerId` | `Guid` | FK to Lawyer |

**Change**: FluentValidation enforces format rules using existing `CustomValidator` helpers.

---

### ApplicationUser (Identity)

**Location**: `Lawyer.Core/Models/ApplicationUser.cs`

| Field | Type | Relevance |
|-------|------|-----------|
| `RefreshToken` | `string?` | SHA-256 hash — **will be cleared on password change** |
| `RefreshTokenExpiresAt` | `DateTime?` | **Will be cleared on password change** |

**Change**: `ResetPasswordAsync()` and `ChangePasswordAsync()` will null out refresh tokens.

---

### Payment

**Location**: `Lawyer.Core/Models/Payment.cs`

| Field | Type | Validation Rules (NEW) |
|-------|------|----------------------|
| `PaymentMethod` | `string` | Must be "card" or "wallet" |

**Change**: PaymobService will validate payment method against whitelist before processing.

---

### Otp

**Location**: `Lawyer.Core/Models/Otp.cs` (inherits `BaseEntity<Guid>`)

| Field | Type | Relevance |
|-------|------|-----------|
| `CodeHash` | `string` | Hashed OTP code |
| `Salt` | `string` | Salt for hashing |
| `IsVerified` | `bool` | Whether OTP was verified |
| `IsConsumed` | `bool` | Whether OTP was used |
| `ExpiresAt` | `DateTime` | Expiry timestamp |
| `OtpType` | `OtpType` | Enum: register, forgetPassword, sensitiveAction |

**Change**: OTP generation/matching logic consolidated into `OtpHelper` — no schema change.

---

## New Components (Not Entities — Application Layer Only)

### AuditInterceptor

**Location**: `Lawyer.Infrastracture/Persistence/AuditInterceptor.cs` (NEW)
**Type**: `SaveChangesInterceptor`
**Behavior**: Intercepts `SavingAsync` event, resolves current user ID, populates `CreatedBy` on `Added` entries and `UpdatedBy`/`Updated` on `Modified` entries for all `BaseEntity` subclasses.

### OtpHelper

**Location**: `Lawyer.Application/Common/OtpHelper.cs` (NEW)
**Type**: Static class
**Methods**: `GenerateOtpCode()`, `GenerateSalt()`, `HashOtpCode()`, `MatchesOtp()`

### EmailTemplateBuilder

**Location**: `Lawyer.Application/Common/EmailTemplateBuilder.cs` (NEW)
**Type**: Static class
**Methods**: `BuildEmailTemplate(string title, string body)`

### LawyerIdResolver

**Location**: `Lawyer.Application/Common/LawyerIdResolver.cs` (NEW)
**Type**: Injectable service
**Methods**: `ResolveAsync(Guid? overrideId, CancellationToken ct)`

### PromptTemplateCache

**Location**: `Lawyer.Application/Common/PromptTemplateCache.cs` (NEW)
**Type**: Singleton service
**Methods**: `GetAsync(string relativePath, CancellationToken ct)`

### PaginationDefaults

**Location**: `Lawyer.Application/Common/PaginationDefaults.cs` (NEW)
**Type**: Static class
**Constants**: `DefaultPageSize = 10`, `MaxPageSize = 100`
**Methods**: `ClampPageSize(int pageSize)`

## Entity State Transitions

### Case Creation Flow (With Transaction)

```
[Start] → Validate DTO → Begin Transaction → Create Client (if new) → Create Case → Link Client → Save Changes → Commit → [End]
                ↓                                                          ↓
          [Validation Error]                                       [Rollback on failure]
```

### Password Reset Flow (With Token Invalidation)

```
[Start] → Verify OTP → Reset Password → Clear Refresh Tokens → Update User → Save → [End]
                ↓                                    ↓
          [Invalid OTP]                      [User must re-login]
```
