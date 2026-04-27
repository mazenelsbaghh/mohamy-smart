# API Contracts: Remove Profile Images

**Branch**: `050-remove-profile-images` | **Date**: 2026-04-20

## Modified Endpoints

### GET /api/account/profile

**Change**: Response DTO loses `profileImageUrl` field.

**Before**:
```json
{
  "lawyerId": "guid",
  "applicationUserId": "guid-string",
  "fullName": "string",
  "email": "string",
  "phoneNumber": "string",
  "officeName": "string",
  "address": "string",
  "profileImageUrl": "/uploads/profiles/user123.jpg"
}
```

**After**:
```json
{
  "lawyerId": "guid",
  "applicationUserId": "guid-string",
  "fullName": "string",
  "email": "string",
  "phoneNumber": "string",
  "officeName": "string",
  "address": "string"
}
```

**Backward Compatibility**: Removing a field from a JSON response is backward-compatible for well-behaved clients — they simply won't see it. Frontend types are being updated simultaneously to remove the field.

### PUT /api/account/profile

**Change**: None. The `UpdateProfileDto` never included `profileImageUrl`. Response DTO mirrors GET (field removed).

## Removed Endpoints

None. No profile image upload endpoint ever existed.

## Unchanged Endpoints

All other endpoints remain unchanged. This feature does not add, modify, or remove any routes — only the shape of the profile response DTO changes.
