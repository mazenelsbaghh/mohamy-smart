# Data Model: AI Model Configuration per Stage

**Feature**: 021-ai-model-config
**Date**: 2026-04-09

## New Entities

### AiStageModelConfig

Represents the mapping between an AI processing stage and its assigned model.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | `int` | PK, auto-increment | Surrogate primary key |
| StepType | `AiStepType` | Unique, NOT NULL | The AI processing stage (enum value) |
| ModelIdentifier | `string` | NOT NULL, max 50 chars | Gemini API model ID (e.g., `gemini-3-pro-preview`) |
| UpdatedAt | `DateTime` | NOT NULL | Last modification timestamp |
| UpdatedBy | `string` | nullable, max 100 chars | Admin user who last changed this setting |

#### Relationships

- None — this is a standalone configuration table with no foreign keys.

#### Validation Rules

- `StepType` must be a valid `AiStepType` enum value.
- `ModelIdentifier` must be one of the three allowed values:
  - `gemini-3-pro-preview`
  - `gemini-3-flash-preview`
  - `gemini-3-flash-lite-preview`
- Each `StepType` can have exactly one configuration entry (unique constraint).

#### State Transitions

No state transitions — this is a simple CRUD configuration table. Each entry is either present (configured) or absent (use default).

## Enum Changes

### AiStepType (existing, modified)

```text
Existing values:
  FactAnalysis = 1
  GenerateDefenses = 2
  AnalysisDefense = 3
  FinalRequirements = 4
  LawsuitCaseType = 10
  LawsuitParties = 11
  LawsuitSubjects = 12
  LawsuitFacts = 13
  LawsuitLegalBasis = 14
  LawsuitRequests = 15
  Ocr = 20

New value:
  Chat = 30
```

### AiModelType (new enum)

```text
Pro = 0          → gemini-3-pro-preview
Flash = 1        → gemini-3-flash-preview
FlashLite = 2    → gemini-3-flash-lite-preview
```

## EF Core Configuration

```text
Entity: AiStageModelConfig
Table: AiStageModelConfigs
  - PK: Id (int, identity)
  - Unique index: StepType
  - Column: ModelIdentifier (nvarchar(50), NOT NULL)
  - Column: UpdatedAt (datetime2, NOT NULL)
  - Column: UpdatedBy (nvarchar(100), nullable)
```

## DbSeed (Initial Data)

On migration, seed one row per step type (all 12 stages) with default model `gemini-3-pro-preview`:

| StepType | ModelIdentifier |
|----------|----------------|
| 1 (FactAnalysis) | gemini-3-pro-preview |
| 2 (GenerateDefenses) | gemini-3-pro-preview |
| 3 (AnalysisDefense) | gemini-3-pro-preview |
| 4 (FinalRequirements) | gemini-3-pro-preview |
| 10 (LawsuitCaseType) | gemini-3-pro-preview |
| 11 (LawsuitParties) | gemini-3-pro-preview |
| 12 (LawsuitSubjects) | gemini-3-pro-preview |
| 13 (LawsuitFacts) | gemini-3-pro-preview |
| 14 (LawsuitLegalBasis) | gemini-3-pro-preview |
| 15 (LawsuitRequests) | gemini-3-pro-preview |
| 20 (Ocr) | gemini-3-pro-preview |
| 30 (Chat) | gemini-3-pro-preview |

## Display Name Mapping (Static, Application Layer)

| Arabic Label | StepType | Category |
|-------------|----------|----------|
| تحليل الوقائع | FactAnalysis (1) | التحليل الذكي |
| توليد الدفوع | GenerateDefenses (2) | التحليل الذكي |
| تحليل الدفاع | AnalysisDefense (3) | التحليل الذكي |
| الطلبات الختامية | FinalRequirements (4) | التحليل الذكي |
| نوع القضية | LawsuitCaseType (10) | إعداد الدعوى |
| الأطراف | LawsuitParties (11) | إعداد الدعوى |
| الموضوعات | LawsuitSubjects (12) | إعداد الدعوى |
| الوقائع | LawsuitFacts (13) | إعداد الدعوى |
| السند القانوني | LawsuitLegalBasis (14) | إعداد الدعوى |
| الطلبات | LawsuitRequests (15) | إعداد الدعوى |
| التعرف البصري | Ocr (20) | التعرف البصري |
| المحادثة | Chat (30) | المحادثة |

| Model Display Name (Arabic) | API Identifier |
|---------------------------|----------------|
| 3.1 Pro | gemini-3-pro-preview |
| 3.1 Flash | gemini-3-flash-preview |
| 3.1 Flash Lite | gemini-3-flash-lite-preview |
