# API Contracts: Lawyer Dashboard Fixes and Polish

All lawyer-facing endpoints below require a valid Bearer token for an authenticated lawyer unless explicitly marked otherwise. Responses should preserve the backend’s standard result envelope where applicable.

## 1. Self-Service Profile

### `GET /api/account/profile`

- **Purpose**: Load the authenticated lawyer’s profile for the settings page.
- **Response 200**:

```json
{
  "succeeded": true,
  "message": "تم جلب الملف الشخصي بنجاح",
  "data": {
    "lawyerId": "7b1c0c3e-7a39-4f6b-8cc2-f23d8d2b94f0",
    "applicationUserId": "c2c3c273-cf3f-4ae6-93d2-89d08fc98f63",
    "fullName": "أحمد محمد",
    "email": "lawyer@example.com",
    "phoneNumber": "+201234567890",
    "officeName": "مكتب أحمد محمد للمحاماة",
    "address": "القاهرة",
    "profileImageUrl": "/uploads/profiles/user-1.png"
  }
}
```

### `PUT /api/account/profile`

- **Purpose**: Update editable lawyer profile fields.
- **Request Body**:

```json
{
  "fullName": "أحمد محمد علي",
  "email": "lawyer@example.com",
  "phoneNumber": "+201234567890",
  "officeName": "مكتب أحمد محمد للمحاماة",
  "address": "القاهرة"
}
```

- **Response 200**: Returns the updated profile in the same shape as `GET /api/account/profile`.
- **Response 400**: Field validation errors that the frontend can map to form feedback.

### `PUT /api/account/change-password`

- **Purpose**: Change the authenticated lawyer’s password from settings.
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
  "message": "تم تغيير كلمة المرور بنجاح",
  "data": true
}
```

## 2. Subscription and Payment

### `GET /api/subscription`

- **Purpose**: Load selectable subscription plans.
- **Response 200**:

```json
{
  "succeeded": true,
  "data": [
    {
      "id": 1,
      "name": "الخطة الأساسية",
      "price": 199.0,
      "durationDays": 30,
      "aiRequestsLimit": 100,
      "features": ["تحليل القضايا", "إدارة المهام"]
    }
  ]
}
```

### `GET /api/subscription/lawyer`

- **Purpose**: Load the authenticated lawyer’s current subscription status.
- **Response 200**:

```json
{
  "succeeded": true,
  "data": {
    "lawyerSubscriptionId": "9cf32e08-0d79-42b9-879a-50a2f5b3b2d1",
    "planId": 2,
    "planName": "الخطة الاحترافية",
    "isActive": true,
    "startDate": "2026-04-01T00:00:00Z",
    "endDate": "2026-05-01T00:00:00Z",
    "usedAiRequests": 12,
    "limit": 250
  }
}
```

### `POST /api/payment/initiate?subscriptionId={planId}&paymentMethod={card|wallet}`

- **Purpose**: Start a lawyer payment attempt for a subscription plan.
- **Response 200**:

```json
{
  "succeeded": true,
  "message": "تم إنشاء عملية الدفع بنجاح",
  "data": {
    "paymentId": "f2f8e1e2-8e93-4904-a2f0-d531bb558214",
    "paymentUrl": "https://accept.paymob.com/unifiedcheckout/?publicKey=...",
    "status": "Pending"
  }
}
```

### `GET /api/payment/status/{paymentId}`

- **Purpose**: Poll the current payment attempt state after the user completes or abandons payment.
- **Response 200**:

```json
{
  "succeeded": true,
  "data": {
    "paymentId": "f2f8e1e2-8e93-4904-a2f0-d531bb558214",
    "status": "Success",
    "subscriptionActivated": true,
    "activePlanName": "الخطة الاحترافية"
  }
}
```

### `GET /api/payment/history`

- **Purpose**: Show previous payment attempts in settings if the UI exposes history.
- **Response 200**:

```json
{
  "succeeded": true,
  "data": [
    {
      "paymentId": "f2f8e1e2-8e93-4904-a2f0-d531bb558214",
      "amount": 399.0,
      "paymentMethod": "card",
      "status": "Success",
      "createdAt": "2026-04-04T11:45:00Z"
    }
  ]
}
```

## 3. Documents Workspace

### `GET /api/documents`

- **Purpose**: Return the lawyer-visible document records for the Documents page.
- **Query Parameters**:
  - `caseId` optional
  - `state` optional (`available`, `processing`, `failed`)
- **Response 200**:

```json
{
  "succeeded": true,
  "data": {
    "items": [
      {
        "documentId": "a9eaa389-307d-450e-a9d0-902ae05331fc",
        "caseId": "8f56a14f-978d-47e5-a8a7-93c6fb67f143",
        "title": "صحيفة دعوى - قضية 102",
        "sourceType": "ocr_extract",
        "fileType": "pdf",
        "createdAt": "2026-04-03T09:00:00Z",
        "previewUrl": "/uploads/documents/102-preview.png",
        "downloadUrl": "/uploads/documents/102.pdf",
        "extractedTextSnippet": "بناءً على المستندات المرفقة...",
        "availabilityState": "available"
      }
    ],
    "state": "success"
  }
}
```

- **Empty State Response 200**:

```json
{
  "succeeded": true,
  "data": {
    "items": [],
    "state": "empty"
  }
}
```

## 4. Legal Contracts Workspace

### `GET /api/legal-contracts`

- **Purpose**: Return lawyer-visible legal contract records or a supported explicit unsupported state.
- **Response 200**:

```json
{
  "succeeded": true,
  "data": {
    "items": [
      {
        "contractId": "2558c8a4-bb4b-493d-a640-4fb4db324046",
        "contractType": "عقد إيجار",
        "clientName": "محمد أحمد",
        "status": "draft",
        "createdAt": "2026-04-02T14:00:00Z",
        "lastUpdatedAt": "2026-04-03T10:15:00Z",
        "detailAvailable": true
      }
    ],
    "state": "success"
  }
}
```

- **Unsupported State Response 200**:

```json
{
  "succeeded": true,
  "data": {
    "items": [],
    "state": "unsupported",
    "message": "العقود القانونية غير متاحة حالياً لهذا الحساب"
  }
}
```

## 5. AI Chat

### `POST /api/smartanalysis/chat`

- **Purpose**: Send a lawyer’s message to the AI assistant and receive a conversational response.
- **Request Body**:

```json
{
  "message": "ما هي الخطوات الأولية في دعوى فسخ عقد؟",
  "conversationId": null,
  "contextCaseId": null
}
```

- **Response 200**:

```json
{
  "succeeded": true,
  "data": {
    "conversationId": "f6d44ef1-bf07-4baf-a8a7-441e7b6fa830",
    "messages": [
      {
        "messageId": "056ff6ea-584c-454b-bbc5-b13d7aaf2f0e",
        "role": "user",
        "content": "ما هي الخطوات الأولية في دعوى فسخ عقد؟",
        "createdAt": "2026-04-04T12:00:00Z"
      },
      {
        "messageId": "59f2e5d8-ae3c-4583-b228-9d0e1296dc5d",
        "role": "assistant",
        "content": "تبدأ المراجعة عادةً بجمع العقد والمخالفات والمراسلات...",
        "createdAt": "2026-04-04T12:00:02Z"
      }
    ],
    "availabilityState": "available"
  }
}
```

- **Quota/Unavailable Response 400 or 503**:

```json
{
  "succeeded": false,
  "message": "الخدمة غير متاحة حالياً، حاول مرة أخرى لاحقاً"
}
```
