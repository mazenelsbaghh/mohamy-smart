# API Contract: AI Usage & Cost Reports

**Branch**: `048-ai-usage-tracking` | **Date**: 2026-04-16
**Authorization**: All endpoints require `[Authorize(Roles = "Admin")]`
**Base URL**: `/api/ai-usage`

---

## GET /api/ai-usage/summary

Returns overall cost summary with optional date range filter.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `from` | `string` (ISO 8601) | No | null (all time) | Start date filter |
| `to` | `string` (ISO 8601) | No | null (all time) | End date filter |

### Response 200

```json
{
  "isSuccess": true,
  "value": {
    "totalCostUsd": 45.67,
    "aiCostUsd": 38.20,
    "ocrCostUsd": 7.47,
    "totalRequests": 1250,
    "aiRequests": 1100,
    "ocrRequests": 150,
    "totalInputTokens": 5500000,
    "totalOutputTokens": 2200000,
    "perModel": [
      {
        "modelIdentifier": "gemini-3.1-pro-preview",
        "displayName": "Gemini 3.1 Pro",
        "requestCount": 500,
        "totalCostUsd": 30.50,
        "inputTokens": 3000000,
        "outputTokens": 1200000
      },
      {
        "modelIdentifier": "gemini-3-flash-preview",
        "displayName": "Gemini 3 Flash",
        "requestCount": 400,
        "totalCostUsd": 6.00,
        "inputTokens": 1500000,
        "outputTokens": 600000
      },
      {
        "modelIdentifier": "gemini-3.1-flash-lite-preview",
        "displayName": "Gemini 3.1 Flash Lite",
        "requestCount": 200,
        "totalCostUsd": 1.70,
        "inputTokens": 1000000,
        "outputTokens": 400000
      }
    ]
  },
  "message": "AI usage summary retrieved successfully"
}
```

---

## GET /api/ai-usage/lawyers

Returns per-lawyer cost breakdown, paginated.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pageNumber` | `int` | No | 1 | Page number (1-based) |
| `pageSize` | `int` | No | 20 | Items per page |
| `from` | `string` (ISO 8601) | No | null | Start date filter |
| `to` | `string` (ISO 8601) | No | null | End date filter |

### Response 200

```json
{
  "isSuccess": true,
  "value": {
    "items": [
      {
        "lawyerId": "guid-here",
        "lawyerName": "أحمد محمد",
        "totalCostUsd": 12.50,
        "aiCostUsd": 10.00,
        "ocrCostUsd": 2.50,
        "totalRequests": 85,
        "aiRequests": 75,
        "ocrRequests": 10
      }
    ],
    "pageNumber": 1,
    "pageSize": 20,
    "totalCount": 50,
    "totalPages": 3,
    "hasPreviousPage": false,
    "hasNextPage": true
  },
  "message": "Lawyer usage retrieved successfully"
}
```

---

## GET /api/ai-usage/lawyers/{lawyerId}

Returns detailed usage for a specific lawyer.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lawyerId` | `Guid` | Yes | Lawyer identifier |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `from` | `string` (ISO 8601) | No | null | Start date filter |
| `to` | `string` (ISO 8601) | No | null | End date filter |

### Response 200

```json
{
  "isSuccess": true,
  "value": {
    "lawyerId": "guid-here",
    "lawyerName": "أحمد محمد",
    "totalCostUsd": 12.50,
    "aiCostUsd": 10.00,
    "ocrCostUsd": 2.50,
    "totalRequests": 85,
    "aiRequests": 75,
    "ocrRequests": 10,
    "perStep": [
      {
        "stepType": 1,
        "stepName": "تحليل الوقائع",
        "requestCount": 25,
        "totalCostUsd": 4.00
      },
      {
        "stepType": 2,
        "stepName": "توليد الدفوع",
        "requestCount": 20,
        "totalCostUsd": 3.50
      }
    ],
    "perModel": [
      {
        "modelIdentifier": "gemini-3.1-pro-preview",
        "displayName": "Gemini 3.1 Pro",
        "requestCount": 50,
        "totalCostUsd": 8.00,
        "inputTokens": 500000,
        "outputTokens": 200000
      }
    ],
    "dailyCosts": [
      {
        "date": "2026-04-15T00:00:00Z",
        "aiCost": 2.50,
        "ocrCost": 0.30,
        "requests": 15
      }
    ]
  },
  "message": "Lawyer usage detail retrieved successfully"
}
```

### Response 404

```json
{
  "isSuccess": false,
  "message": "Lawyer not found or no usage data available"
}
```

---

## GET /api/ai-usage/models

Returns per-model request count and cost breakdown.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `from` | `string` (ISO 8601) | No | null | Start date filter |
| `to` | `string` (ISO 8601) | No | null | End date filter |

### Response 200

```json
{
  "isSuccess": true,
  "value": [
    {
      "modelIdentifier": "gemini-3.1-pro-preview",
      "displayName": "Gemini 3.1 Pro",
      "requestCount": 500,
      "totalCostUsd": 30.50,
      "inputTokens": 3000000,
      "outputTokens": 1200000
    },
    {
      "modelIdentifier": "gemini-3-flash-preview",
      "displayName": "Gemini 3 Flash",
      "requestCount": 400,
      "totalCostUsd": 6.00,
      "inputTokens": 1500000,
      "outputTokens": 600000
    },
    {
      "modelIdentifier": "gemini-3.1-flash-lite-preview",
      "displayName": "Gemini 3.1 Flash Lite",
      "requestCount": 200,
      "totalCostUsd": 1.70,
      "inputTokens": 1000000,
      "outputTokens": 400000
    }
  ],
  "message": "Model usage retrieved successfully"
}
```

---

## Error Responses (All Endpoints)

### 401 Unauthorized
```json
{
  "isSuccess": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "isSuccess": false,
  "message": "Access denied. Admin role required."
}
```
