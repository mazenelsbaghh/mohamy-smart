# Data Model: AI Usage & Cost Tracking

**Branch**: `048-ai-usage-tracking` | **Date**: 2026-04-16 | **Phase**: 1

---

## New Entity: AiUsageRecord

**File**: `mohamy-smart-backend/Lawyer.Core/Models/AiUsageRecord.cs`
**Layer**: Lawyer.Core (Domain)

### Fields

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| Id | `Guid` | PK, auto-generated | Unique record identifier |
| LawyerId | `Guid` | FK → Lawyer.Id, NOT NULL, indexed | Which lawyer triggered the call |
| CaseId | `Guid?` | FK → Case.Id, nullable, indexed | Associated case (null for chat) |
| AiStepType | `AiStepType` (enum) | NOT NULL, indexed | Which pipeline step triggered the call |
| ModelIdentifier | `string` | NOT NULL, max 100 chars | Model used (e.g., "gemini-3.1-pro-preview") |
| Provider | `string` | NOT NULL, max 50 chars | "Gemini" or "GoogleVision" |
| InputTokens | `int` | NOT NULL, default 0 | Prompt token count from API response |
| OutputTokens | `int` | NOT NULL, default 0 | Response token count from API response |
| TotalTokens | `int` | NOT NULL, default 0 | Total token count from API response |
| EstimatedCostUsd | `decimal` | NOT NULL, default 0 | Calculated cost in USD (18,6 precision) |
| CreatedAt | `DateTime` | NOT NULL, indexed | When the call was made (UTC) |

### Relationships

| Relationship | Type | Target Entity | FK Field | Delete Behavior |
|-------------|------|--------------|----------|----------------|
| Lawyer | Many-to-One | `Lawyer` | `LawyerId` | No action (preserve records if lawyer deactivated) |
| Case | Many-to-One | `Case` | `CaseId` | No action (preserve records) |

### Indexes

```csharp
entity.HasIndex(e => e.LawyerId);
entity.HasIndex(e => e.CreatedAt);
entity.HasIndex(e => e.AiStepType);
entity.HasIndex(e => e.Provider);
entity.HasIndex(e => new { e.LawyerId, e.CreatedAt });
entity.HasIndex(e => new { e.Provider, e.CreatedAt });
```

### Validation Rules

- `ModelIdentifier` must not be empty for Gemini provider calls
- `EstimatedCostUsd` must be >= 0
- `InputTokens` and `OutputTokens` must be >= 0
- `CreatedAt` defaults to `DateTime.UtcNow`
- For `Provider = "GoogleVision"`: InputTokens and OutputTokens should be 0 (OCR uses flat pricing)

### Entity Definition

```csharp
public class AiUsageRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LawyerId { get; set; }
    public Guid? CaseId { get; set; }
    public AiStepType AiStepType { get; set; }
    public string ModelIdentifier { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public int InputTokens { get; set; }
    public int OutputTokens { get; set; }
    public int TotalTokens { get; set; }
    public decimal EstimatedCostUsd { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Lawyer Lawyer { get; set; } = null!;
    public Case? Case { get; set; }
}
```

---

## Existing Entities (Modified)

### IAIProvider Interface Changes

**File**: `mohamy-smart-backend/Lawyer.Application/IServices/AI/IAIProvider.cs`

Two new records added to the same file:

```csharp
public record AIUsageMetadata(int InputTokens, int OutputTokens, int TotalTokens);

public record AIResponse(string Content, AIUsageMetadata? Usage);
```

The return type of `SendChatCompletionAsync` changes from `Task<Result<string>>` to `Task<Result<AIResponse>>`.

### AppDbContext Addition

**File**: `mohamy-smart-backend/Lawyer.Infrastracture/Persistence/AppDbContext.cs`

```csharp
public DbSet<AiUsageRecord> AiUsageRecords { get; set; } = null!;
```

---

## DTO Definitions

### AiUsageSummaryDto

```csharp
public class AiUsageSummaryDto
{
    public decimal TotalCostUsd { get; set; }
    public decimal AiCostUsd { get; set; }
    public decimal OcrCostUsd { get; set; }
    public int TotalRequests { get; set; }
    public int AiRequests { get; set; }
    public int OcrRequests { get; set; }
    public long TotalInputTokens { get; set; }
    public long TotalOutputTokens { get; set; }
    public List<ModelUsageDto> PerModel { get; set; } = [];
}
```

### ModelUsageDto

```csharp
public class ModelUsageDto
{
    public string ModelIdentifier { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public int RequestCount { get; set; }
    public decimal TotalCostUsd { get; set; }
    public long InputTokens { get; set; }
    public long OutputTokens { get; set; }
}
```

### LawyerUsageDto

```csharp
public class LawyerUsageDto
{
    public Guid LawyerId { get; set; }
    public string LawyerName { get; set; } = "";
    public decimal TotalCostUsd { get; set; }
    public decimal AiCostUsd { get; set; }
    public decimal OcrCostUsd { get; set; }
    public int TotalRequests { get; set; }
    public int AiRequests { get; set; }
    public int OcrRequests { get; set; }
}
```

### LawyerUsageDetailDto

```csharp
public class LawyerUsageDetailDto : LawyerUsageDto
{
    public List<StepUsageDto> PerStep { get; set; } = [];
    public List<ModelUsageDto> PerModel { get; set; } = [];
    public List<DailyCostDto> DailyCosts { get; set; } = [];
}
```

### StepUsageDto

```csharp
public class StepUsageDto
{
    public int StepType { get; set; }
    public string StepName { get; set; } = "";
    public int RequestCount { get; set; }
    public decimal TotalCostUsd { get; set; }
}
```

### DailyCostDto

```csharp
public class DailyCostDto
{
    public DateTime Date { get; set; }
    public decimal AiCost { get; set; }
    public decimal OcrCost { get; set; }
    public int Requests { get; set; }
}
```

---

## State Transitions

No state machine — records are insert-only (append-only log). No updates or deletes through normal operation.

Admin reports are read-only aggregations over these records.
