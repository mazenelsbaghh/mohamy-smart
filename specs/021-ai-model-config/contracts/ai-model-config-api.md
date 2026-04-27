# API Contract: AI Model Configuration

**Feature**: 021-ai-model-config
**Date**: 2026-04-09
**Base URL**: `/api/AiModelConfig`

## Authentication & Authorization

All endpoints require `[Authorize(Roles = "Admin")]`.

---

## Endpoints

### GET /api/AiModelConfig

Retrieve all AI stage model configurations.

**Request**: No parameters.

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": [
    {
      "stepType": 1,
      "stepTypeName": "FactAnalysis",
      "displayName": "تحليل الوقائع",
      "category": "التحليل الذكي",
      "modelIdentifier": "gemini-3-pro-preview",
      "modelDisplayName": "3.1 Pro",
      "updatedAt": "2026-04-09T10:00:00Z",
      "updatedBy": "admin@mohamy.com"
    },
    {
      "stepType": 2,
      "stepTypeName": "GenerateDefenses",
      "displayName": "توليد الدفوع",
      "category": "التحليل الذكي",
      "modelIdentifier": "gemini-3-flash-preview",
      "modelDisplayName": "3.1 Flash",
      "updatedAt": "2026-04-09T10:00:00Z",
      "updatedBy": "admin@mohamy.com"
    }
  ],
  "message": null
}
```

---

### PUT /api/AiModelConfig

Update model configurations for one or more stages in a single request.

**Request Body**:
```json
{
  "configs": [
    {
      "stepType": 1,
      "modelIdentifier": "gemini-3-flash-preview"
    },
    {
      "stepType": 2,
      "modelIdentifier": "gemini-3-pro-preview"
    }
  ]
}
```

**Validation Rules**:
- `configs` array must not be empty.
- Each entry must have a valid `stepType` (matching `AiStepType` enum).
- Each `modelIdentifier` must be one of: `gemini-3-pro-preview`, `gemini-3-flash-preview`, `gemini-3-flash-lite-preview`.
- Duplicate `stepType` values in the same request are rejected.

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": [
    {
      "stepType": 1,
      "stepTypeName": "FactAnalysis",
      "displayName": "تحليل الوقائع",
      "category": "التحليل الذكي",
      "modelIdentifier": "gemini-3-flash-preview",
      "modelDisplayName": "3.1 Flash",
      "updatedAt": "2026-04-09T12:00:00Z",
      "updatedBy": "admin@mohamy.com"
    },
    {
      "stepType": 2,
      "stepTypeName": "GenerateDefenses",
      "displayName": "توليد الدفوع",
      "category": "التحليل الذكي",
      "modelIdentifier": "gemini-3-pro-preview",
      "modelDisplayName": "3.1 Pro",
      "updatedAt": "2026-04-09T12:00:00Z",
      "updatedBy": "admin@mohamy.com"
    }
  ],
  "message": "تم حفظ إعدادات النماذج بنجاح"
}
```

**Error Response** (`400 Bad Request`):
```json
{
  "succeeded": false,
  "data": null,
  "message": "قيمة نموذج غير صالحة: invalid-model"
}
```

---

### GET /api/AiModelConfig/models

Retrieve the list of available AI models (static reference data).

**Request**: No parameters.

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": [
    {
      "identifier": "gemini-3-pro-preview",
      "displayName": "3.1 Pro",
      "description": "أعلى جودة وأعلى تكلفة"
    },
    {
      "identifier": "gemini-3-flash-preview",
      "displayName": "3.1 Flash",
      "description": "متوازن بين الجودة والسرعة"
    },
    {
      "identifier": "gemini-3-flash-lite-preview",
      "displayName": "3.1 Flash Lite",
      "description": "أسرع وأقل تكلفة"
    }
  ],
  "message": null
}
```

---

### GET /api/AiModelConfig/stages

Retrieve the list of all AI stages with their metadata (categories, display names).

**Request**: No parameters.

**Response** (`200 OK`):
```json
{
  "succeeded": true,
  "data": [
    {
      "stepType": 1,
      "stepTypeName": "FactAnalysis",
      "displayName": "تحليل الوقائع",
      "category": "التحليل الذكي",
      "categoryOrder": 1
    },
    {
      "stepType": 2,
      "stepTypeName": "GenerateDefenses",
      "displayName": "توليد الدفوع",
      "category": "التحليل الذكي",
      "categoryOrder": 1
    },
    {
      "stepType": 10,
      "stepTypeName": "LawsuitCaseType",
      "displayName": "نوع القضية",
      "category": "إعداد الدعوى",
      "categoryOrder": 2
    },
    {
      "stepType": 20,
      "stepTypeName": "Ocr",
      "displayName": "التعرف البصري",
      "category": "التعرف البصري",
      "categoryOrder": 3
    },
    {
      "stepType": 30,
      "stepTypeName": "Chat",
      "displayName": "المحادثة",
      "category": "المحادثة",
      "categoryOrder": 4
    }
  ],
  "message": null
}
```

---

## Internal Contract: Model Resolution

**Not exposed via HTTP.** Used internally by `AIProviderFactory`.

### Method: `GetModelForStepAsync(AiStepType stepType)`

- Reads from `IMemoryCache` first (key: `AiModelConfig_{stepType}`).
- On cache miss, queries `AiStageModelConfigs` table.
- Returns the `ModelIdentifier` string (e.g., `gemini-3-flash-preview`).
- If no DB entry exists, returns `gemini-3-pro-preview` (default).
- Cache TTL: 5 minutes sliding expiration.
- Cache invalidated on `PUT /api/AiModelConfig` success.
