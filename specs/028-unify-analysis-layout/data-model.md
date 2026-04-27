# Data Model: توحيد صفحات التحليل القانوني

**Feature**: 028-unify-analysis-layout  
**Date**: 2026-04-10

> لا entities جديدة في الـ database — تغيير frontend فقط.

---

## Component Interfaces

### TStepProps (مشترك)

```typescript
type TStepProps = {
  nextStep?: () => void;
};
```

### TAnalysisPageState (مشترك للمسارات القديمة الثلاثة)

```typescript
type TLegacyWorkflowState = {
  workflow: { id: number } | null;
  currentStep: number;
  stepsOutputs: (string | null)[];
  loading: boolean;
  error: string | null;
};
```

### الـ Step Output Variants

```typescript
// Step components تتعامل مع هذا النوع
type TStepOutput =
  | Record<string, unknown>  // JSON parsed
  | string                    // raw text
  | null;                     // لم يُنفَّذ بعد

// Helper لقراءة وتحليل الـ output
function parseStepOutput(raw: string | null): TStepOutput {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return raw;
  }
}
```

---

## Output Field Mapping (per workflow)

### LegalWarning

| Step | Field | Type | Render Pattern |
|---|---|---|---|
| 1 | `warningType` | `string` | chip (برتقالي) |
| 1 | `legalBasis.type` | `string` | chip (رمادي) |
| 1 | `legalBasis.description` | `string` | card |
| 1 | `obligationDetails` | `string` | card |
| 1 | `recommendedAction` | `string` | banner (برتقالي) |
| 2 | `warningBody` | `string` | document card (كبير) |
| 2 | `keyPoints` | `string[]` | numbered list |
| 3 | `documentText` | `string` | document view + placeholder highlight |

### RulingAnalysis

| Step | Field | Type | Render Pattern |
|---|---|---|---|
| 1 | `verdictSummary` | `string` | card |
| 1 | `verdictPoints` | `string[]` | numbered list |
| 1 | `charges` | `string[]` | chips row |
| 2 | `reasoningPoints` | `string[]` | numbered list |
| 2 | `keyFindings` | `string[]` | cards grid |
| 3 | `defects` | `{description, severity}[]` | list مع severity chip |
| 4 | `isAppealViable` | `boolean` | banner (أخضر/أحمر) |
| 4 | `appealStrength` | `string\|number` | metric في sidebar |
| 4 | `recommendedGrounds` | `string[]` | numbered list |
| 4 | `conclusion` | `string` | card |

### AdminComplaint

| Step | Field | Type | Render Pattern |
|---|---|---|---|
| 1 | `complaintType` | `string` | chip (برتقالي) |
| 1 | `targetAuthority` | `string` | card |
| 1 | `legalBasis` | `string` | card |
| 2 | `factsSummary` | `string` | card |
| 2 | `keyFacts` | `string[]` | numbered list |
| 3 | `violations` | `{description, legalRef}[]` | list مع legalRef chip |
| 4 | `requests` | `string[]` | numbered list |
| 5 | `documentText` | `string` | document view + placeholder highlight |

---

## File Movement Map

| من | إلى | Action |
|---|---|---|
| `pages/appealBrief/AppealBriefPage.tsx` | `analysis/appeal-brief/AppealBriefPage.tsx` | نقل |
| `pages/appealBrief/` (steps folder) | `analysis/appeal-brief/steps/` | نقل |
| `pages/adminComplaint/AdminComplaintPage.tsx` | `analysis/adminComplaint/AdminComplaintPage.tsx` | **إعادة بناء** |
| `pages/rulingAnalysis/RulingAnalysisPage.tsx` | `analysis/rulingAnalysis/RulingAnalysisPage.tsx` | **إعادة بناء** |
| `pages/legalWarning/LegalWarningPage.tsx` | `analysis/legalWarning/LegalWarningPage.tsx` | **إعادة بناء** |
| `pages/execRequest/ExecRequestPage.tsx` | `analysis/execRequest/ExecRequestPage.tsx` | نقل |
| `pages/execRequest/steps/` | `analysis/execRequest/steps/` | نقل |
| `router/AppRouter.tsx` | `router/AppRouter.tsx` | تحديث imports |
