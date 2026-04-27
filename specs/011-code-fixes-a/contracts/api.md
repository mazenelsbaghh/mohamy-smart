# API Contracts: Section A Code Fixes

All authenticated endpoints below use the backend's standard result envelope and require a valid Bearer token unless explicitly marked as public.

## 1. Subscription Plan Administration

### `POST /api/subscription/plan`

- **Purpose**: Create a new subscription plan from the admin dashboard.
- **Authentication**: Admin only.
- **Request Body**:

```json
{
  "name": "الباقة الاحترافية",
  "features": "عدد قضايا أكبر,تقارير متقدمة,دعم أسرع",
  "price": 999.0,
  "aiRequestsLimit": 300,
  "durationDays": 30
}
```

- **Response 200**:

```json
{
  "succeeded": true,
  "message": "Plan created successfully",
  "data": {
    "id": 4,
    "name": "الباقة الاحترافية",
    "features": "عدد قضايا أكبر,تقارير متقدمة,دعم أسرع",
    "price": 999.0,
    "aiRequestsLimit": 300,
    "durationDays": 30,
    "isActive": true
  }
}
```

- **Response 400**: Invalid or incomplete plan payload.
- **Design Note**: The current controller incorrectly reads this payload from query parameters; this feature makes the plan-creation contract body-based.

### `GET /api/subscription`

- **Purpose**: Return available subscription plans for authenticated use and admin review.
- **Authentication**: Authenticated user.
- **Response 200**:

```json
{
  "succeeded": true,
  "message": "Plans retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "الخطة الأساسية",
      "features": "ميزة 1,ميزة 2",
      "price": 199.0,
      "aiRequestsLimit": 50,
      "durationDays": 30,
      "isActive": true
    }
  ]
}
```

### `DELETE /api/subscription/plan/{id}`

- **Purpose**: Archive a subscription plan so it is no longer available for new purchases.
- **Authentication**: Admin only.
- **Response 200**:

```json
{
  "succeeded": true,
  "message": "Plan archived successfully",
  "data": true
}
```

- **Response 400**: Archive blocked because the plan still has active customer subscriptions.
- **Response 404**: Plan not found.
- **Design Note**: Although the HTTP verb is delete-like from an admin UX perspective, the business effect in this feature is archival, not destructive deletion.

## 2. Admin Contact Request Review

### `GET /api/contact`

- **Purpose**: List contact requests for administrators, optionally filtered by status.
- **Authentication**: Admin only.
- **Query Parameters**:
  - `status` (optional): `New | Read | Replied`
- **Response 200**:

```json
{
  "succeeded": true,
  "message": "Contact requests retrieved successfully",
  "data": [
    {
      "id": "8df1d842-bc34-4b1a-bf28-21f495db1f1e",
      "name": "أحمد محمد",
      "phone": "+201234567890",
      "message": "أرغب في معرفة تفاصيل الاشتراك.",
      "submittedAt": "2026-04-04T12:35:00Z",
      "status": "New"
    }
  ]
}
```

- **Empty State Response 200**:

```json
{
  "succeeded": true,
  "message": "No contact requests found",
  "data": []
}
```

### `PATCH /api/contact/{id}/status`

- **Purpose**: Update one contact request to `New`, `Read`, or `Replied`.
- **Authentication**: Admin only.
- **Request Body**:

```json
{
  "status": "Replied"
}
```

- **Response 200**:

```json
{
  "succeeded": true,
  "message": "Contact request status updated successfully",
  "data": {
    "id": "8df1d842-bc34-4b1a-bf28-21f495db1f1e",
    "name": "أحمد محمد",
    "phone": "+201234567890",
    "message": "أرغب في معرفة تفاصيل الاشتراك.",
    "submittedAt": "2026-04-04T12:35:00Z",
    "status": "Replied"
  }
}
```

- **Response 400**: Unsupported status value.
- **Response 404**: Contact request not found.

## 3. Public Contact Submission

### `POST /api/contact/submit`

- **Purpose**: Accept a public contact request for later admin follow-up.
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
    "status": "New"
  }
}
```

- **Response 400**: Required-field validation failure.
- **Response 500**: Submission failed after validation; the frontend should show a retry-friendly error state.

## 4. Existing Authenticated Account Contracts Used by This Feature

### `PUT /api/account/forgot-password` or equivalent password-recovery trigger

- **Purpose**: Trigger the existing password-recovery flow, now with email fallback behavior when the primary phone path cannot complete.
- **Authentication**: Public or pre-authenticated depending on the current account flow.
- **Design Note**: This feature does not introduce a new public password-recovery surface; it extends the existing recovery workflow with secondary email behavior and failure visibility.

## 5. Operational Contracts Without New Public Endpoints

- **Email fallback and subscription confirmation delivery**: Internal application-service contract only. No new public API route is required by this feature.
- **Production incident capture**: Uses application bootstrap and middleware boundaries, not a user-facing endpoint.
- **API reference enrichment**: Uses the existing Swagger/Scalar generation pipeline rather than a new business API.
