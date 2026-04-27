# Data Model: Remove Profile Images

**Branch**: `050-remove-profile-images` | **Date**: 2026-04-20

## Entity Changes

### ApplicationUser (Modified)

The `ApplicationUser` entity in `Lawyer.Core/Models/ApplicationUser.cs` loses one property:

| Field | Type | Before | After | Notes |
|-------|------|--------|-------|-------|
| `ProfileImageUrl` | `string?` | Nullable, stored profile image path | **REMOVED** | Column dropped from `AspNetUsers` table via EF migration |

All other fields on `ApplicationUser` remain unchanged:
- `FullName` (string) — used for initials generation
- `IsActive` (bool)
- `CreatedAt` (DateTime)
- `RefreshToken` (string?)
- `RefreshTokenExpiresAt` (DateTime?)
- `UserType` (enum)
- `Governorate` (string?)
- `AgreedToTerms` (bool)

## DTO Changes

### ProfileDto (Modified)

| Field | Before | After |
|-------|--------|-------|
| `ProfileImageUrl` | `string` (required in DTO, mapped from nullable entity) | **REMOVED** |

Remaining fields unchanged: `LawyerId`, `ApplicationUserId`, `FullName`, `Email`, `PhoneNumber`, `OfficeName`, `Address`.

### UpdateProfileDto (Unchanged)

No changes — this DTO never included `ProfileImageUrl`.

## Frontend Type Changes

### TProfile (Lawyer Dashboard) — Modified

| Field | Before | After |
|-------|--------|-------|
| `profileImageUrl` | `string \| null` | **REMOVED** |

### AdminProfile (Admin Dashboard) — Modified

| Field | Before | After |
|-------|--------|-------|
| `profileImageUrl` | `string \| null` | **REMOVED** |

## Interface Changes

### IFileUploadService (Modified)

| Method | Before | After |
|--------|--------|-------|
| `UploadUserProfileImageAsync(IFormFile, string)` | Existed (never called) | **REMOVED** |
| `UploadClientFileAsync(IFormFile, string)` | Existed (in use) | Unchanged |

## Computed Value (No Storage)

### Initials Avatar

A **non-persisted** visual representation computed at render time:

- **Source**: `FullName` field from user profile
- **Extraction**: HeroUI `Avatar` component's built-in `name` prop — automatically extracts first character of each word
- **Fallback**: When `FullName` is null/empty, HeroUI renders a generic user icon
- **Color**: HeroUI assigns deterministic colors based on the name hash — consistent across renders for the same user

## Migration

A single EF Core migration will:
1. Drop the `ProfileImageUrl` column from the `AspNetUsers` table
2. No data migration needed (column is nullable, values are discarded)
3. Migration name: `RemoveProfileImageUrl`
