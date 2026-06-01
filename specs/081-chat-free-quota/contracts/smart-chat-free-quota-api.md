# API Contract: Smart Chat Free Quota

## Endpoint

`POST /api/v1/SmartAnalysis/chat`

Authentication: required lawyer JWT.

## Request

Existing request body remains unchanged:

```json
{
  "message": "اكتب ردًا قانونيًا مختصرًا",
  "conversationId": null,
  "contextCaseId": null,
  "internalRegulationIds": []
}
```

## Successful Response

Existing response body remains unchanged:

```json
{
  "succeeded": true,
  "message": "تم إرسال الرسالة بنجاح",
  "data": {
    "conversationId": "00000000-0000-0000-0000-000000000000",
    "messages": [
      {
        "messageId": "00000000-0000-0000-0000-000000000000",
        "role": "user",
        "content": "اكتب ردًا قانونيًا مختصرًا",
        "createdAt": "2026-06-01T00:00:00Z"
      },
      {
        "messageId": "00000000-0000-0000-0000-000000000000",
        "role": "assistant",
        "content": "رد عربي نظيف",
        "createdAt": "2026-06-01T00:00:01Z"
      }
    ],
    "availabilityState": "available"
  }
}
```

Accounting behavior:

- If this is one of the lawyer's first five successful chat replies: no point is deducted.
- If this is the sixth or later successful chat reply: one point is deducted after the assistant response succeeds.

## Insufficient Points Response

When the lawyer has already used five successful chat replies and has no available point:

HTTP status: `402 Payment Required`

```json
{
  "succeeded": false,
  "message": "رصيد النقاط غير كافٍ لتشغيل هذا الطلب.",
  "data": null
}
```

Provider behavior:

- The AI provider must not be called for this response.

## Failure Behavior

If the AI provider fails or returns no content:

- No free reply is consumed.
- No AI point is deducted.
- Existing smart chat error response behavior is preserved.
