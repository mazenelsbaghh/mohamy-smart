# Contract: Admin Subscription API

## GET `/api/v1/Subscription/lawyers`

Returns lawyer subscriptions visible to admins.

### Authorization

- Required role: `Admin`

### Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `isActive` | boolean | No | Existing active/inactive filter |
| `isPaid` | boolean | No | `true` returns paid subscriptions, `false` returns trial/free subscriptions, omitted returns all |

### Response

```json
{
  "data": [
    {
      "lawyerId": "00000000-0000-0000-0000-000000000000",
      "lawyerName": "اسم المحامي",
      "planName": "الخطة الاحترافية",
      "price": 1200,
      "isTrial": false,
      "isPaid": true,
      "startDate": "2026-05-01T00:00:00Z",
      "endDate": "2026-06-01T00:00:00Z",
      "usedAiRequests": 10,
      "limit": 100,
      "isActive": true
    }
  ]
}
```

### Contract Rules

- Existing clients that omit `isPaid` continue to receive all records.
- `isPaid=true` and `isActive=true` returns active paid subscribers only.
- `isPaid=false` returns trial/free subscriptions only.

## GET `/api/v1/admin/reports/subscriptions`

Returns subscription aggregate reporting and payment ledger data.

### Authorization

- Required role: `Admin`

### Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `pageNumber` | int | No | Ledger page number |
| `pageSize` | int | No | Ledger page size |

### Response Additions

```json
{
  "data": {
    "totalSubscriptions": 25,
    "totalActive": 18,
    "totalInactive": 7,
    "totalPaid": 12,
    "activePaid": 10,
    "totalTrial": 13,
    "countPerPlan": [],
    "totalRevenue": 12000,
    "churnedSubscriptions": 7,
    "ledger": {
      "items": [],
      "totalCount": 0,
      "page": 1,
      "pageSize": 50,
      "totalPages": 0
    }
  }
}
```

### Contract Rules

- New fields are additive and must not remove existing report fields.
- Trial/free subscription records do not count as paid subscribers.
