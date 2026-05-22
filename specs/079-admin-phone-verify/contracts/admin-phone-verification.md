# Contract: Admin Phone Verification Override

## PATCH `/api/v1/lawyers/{id}/phone-verification`

Marks the target lawyer account phone number as verified through an admin override.

**Authorization**
- Requires authenticated admin role.

**Path Parameters**
- `id` (guid): Target `ApplicationUser.Id` for the lawyer account shown in the admin dashboard.

**Request Body**

```json
{
  "reason": "OTP SMS failed after repeated attempts; support verified caller identity."
}
```

**Validation**
- `reason` is required.
- `reason` must contain non-whitespace text.
- Target user must exist.
- Target user must have a phone number.
- Target phone must not already be verified.

**Success Response**

```json
{
  "succeeded": true,
  "message": "تم توثيق رقم الهاتف يدويًا.",
  "data": {
    "id": "target-user-guid",
    "phoneNumber": "01000000000",
    "phoneNumberConfirmed": true,
    "latestManualPhoneVerification": {
      "id": "audit-guid",
      "phoneNumber": "01000000000",
      "reason": "OTP SMS failed after repeated attempts; support verified caller identity.",
      "verifiedByAdminId": "admin-user-guid",
      "verifiedByAdminName": "Admin User",
      "createdAt": "2026-05-22T19:00:00Z"
    }
  }
}
```

**Failure Responses**
- `400 Bad Request`: Missing/blank reason, no phone number, or phone already verified.
- `401 Unauthorized`: No valid session.
- `403 Forbidden`: Authenticated user is not an admin.
- `404 Not Found`: Target user or lawyer profile not found.

## GET `/api/v1/lawyers/{id}`

Existing endpoint extended to include latest manual phone verification audit when present.

**Added Response Field**

```json
{
  "data": {
    "phoneNumberConfirmed": true,
    "latestManualPhoneVerification": {
      "id": "audit-guid",
      "phoneNumber": "01000000000",
      "reason": "OTP SMS failed after repeated attempts; support verified caller identity.",
      "verifiedByAdminId": "admin-user-guid",
      "verifiedByAdminName": "Admin User",
      "createdAt": "2026-05-22T19:00:00Z"
    }
  }
}
```
