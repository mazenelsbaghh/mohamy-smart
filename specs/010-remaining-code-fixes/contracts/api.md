# API Contracts: Phase A Remaining Code Fixes

All authenticated endpoints below use the backend’s standard result envelope and require a valid Bearer token unless explicitly marked as public.

## 1. Admin Self-Service Settings

### `GET /api/account/profile`

- **Purpose**: Load the current authenticated account profile for the settings page.
- **Response 200**:

```json
{
  "succeeded": true,
  "message": "Profile retrieved successfully",
  "data": {
    "lawyerId": "7b1c0c3e-7a39-4f6b-8cc2-f23d8d2b94f0",
    "applicationUserId": "c2c3c273-cf3f-4ae6-93d2-89d08fc98f63",
    "fullName": "محمد معوض",
    "email": "admin@example.com",
    "phoneNumber": "+201234567890",
    "officeName": "Mohamy Smart",
    "address": "القاهرة",
    "profileImageUrl": "/uploads/profiles/admin-1.png"
  }
}
```

### `PUT /api/account/profile`

- **Purpose**: Update editable profile fields for the current authenticated account.
- **Request Body**:

```json
{
  "fullName": "محمد معوض",
  "email": "admin@example.com",
  "phoneNumber": "+201234567890",
  "officeName": "Mohamy Smart",
  "address": "القاهرة"
}
```

- **Response 200**: Returns the updated profile in the same shape as `GET /api/account/profile`.
- **Response 400**: Field validation or business-rule failure with user-displayable message.

### `PUT /api/account/change-password`

- **Purpose**: Change the current authenticated account password from settings.
- **Request Body**:

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password",
  "confirmPassword": "new-password"
}
```

- **Response 200**:

```json
{
  "succeeded": true,
  "message": "Password changed successfully",
  "data": true
}
```

- **Design Note**: The source Phase A notes referenced `POST /api/Auth/change-password`, but the current backend already exposes `PUT /api/account/change-password`. This plan treats the existing account route as canonical for this feature.

## 2. Notification Management

### `GET /api/notification`

- **Purpose**: Return the current authenticated user’s notification list.
- **Response 200**:

```json
{
  "succeeded": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "notificationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "title": "تم تحديث الاشتراك",
      "message": "تم تفعيل باقتك الجديدة بنجاح",
      "type": "Subscription",
      "isRead": false,
      "createdAt": "2026-04-04T12:30:00Z"
    }
  ]
}
```

- **Empty State Response 200**:

```json
{
  "succeeded": true,
  "message": "No notifications found",
  "data": []
}
```

### `PUT /api/notification/{id}/read`

- **Purpose**: Mark a single notification as read for the current authenticated user.
- **Response 200**:

```json
{
  "succeeded": true,
  "message": "Notification marked as read",
  "data": true
}
```

- **Response 404**: Notification not found or not owned by the current user.

### `PUT /api/notification/read-all`

- **Purpose**: Mark all unread notifications as read for the current authenticated user.
- **Response 200**:

```json
{
  "succeeded": true,
  "message": "All notifications marked as read",
  "data": true
}
```

### `DELETE /api/notification/{id}`

- **Purpose**: Delete one notification owned by the current authenticated user.
- **Response 200**:

```json
{
  "succeeded": true,
  "message": "Notification deleted successfully",
  "data": true
}
```

- **Response 404**: Notification not found or not owned by the current user.

## 3. Public Contact Intake

### `POST /api/contact/submit`

- **Purpose**: Accept a landing-page contact request for later business follow-up.
- **Authentication**: Public endpoint.
- **Request Body**:

```json
{
  "name": "أحمد محمد",
  "phone": "+201234567890",
  "message": "أرغب في معرفة تفاصيل الاشتراك."
}
```

- **Response 201**:

```json
{
  "succeeded": true,
  "message": "تم إرسال رسالتك بنجاح",
  "data": {
    "contactRequestId": "8df1d842-bc34-4b1a-bf28-21f495db1f1e",
    "submittedAt": "2026-04-04T12:35:00Z",
    "status": "submitted"
  }
}
```

- **Response 400**: Required-field validation failure.
- **Response 500**: Submission failed after validation; the frontend should show a retry-friendly error state.
