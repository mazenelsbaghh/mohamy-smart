# مراحل التحليل الذكي — معمارية البيانات وإصلاح snake_case

> آخر تحديث: 2026-04-11  
> الغرض: توثيق كيف تشتغل كل مرحلة من الـ AI إلى الـ UI، وما الإصلاح المطلوب لكل مرحلة.

---

## المشكلة الجذرية

كل الـ DTOs كانت عندها `[JsonPropertyName("snake_case")]` على الـ properties. الـ backend بيستخدم `JsonSerializerOptions` بـ CamelCase لما بيحفظ الـ `resultJson` في الـ DB. لكن `[JsonPropertyName]` بتـ**override** الـ naming policy → الـ resultJson بيتحفظ بـ snake_case. الـ frontend بيقرأ camelCase فيلاقي قيم `undefined`.

---

## أنواع المسارات (Paths)

### مسار A — Direct Service (SmartAnalysis, PreparingStatementOfClaims)

```
AI Response (snake_case JSON)
    ↓
Service.ParseXxxJson() → يستخدم SnakeCaseOptions (أو CamelCaseOptions للـ PrepStatement)
    ↓
result.Data = typed DTO
    ↓
AiJobWorker: JsonSerializer.Serialize(result.Data, _jsonOptions)   ← CamelCase
    ↓  [JsonPropertyName] بتـ override → مشكلة
job.ResultJson في الـ DB
    ↓
Frontend: parseJobResult(job.resultJson) → JSON.parse → camelCase/PascalCase normalization
    ↓
onHydrate(parsed) → dispatch hydrateStep({ stepNumber, result: parsed })
    ↓
stepHydrators[n] → outputs[n]
```

### مسار B — Workflow-based (AppealBrief, AdminComplaint, LegalWarning, ExecRequest)

```
AI Response (snake_case JSON)
    ↓
StepOutputSchemas.Normalize() → ValidateAndParse<TStepOutput>()  ← _jsonOptions CamelCase
    ↓  [JsonPropertyName] بتـ override → يتحفظ بـ snake_case
cleanedJson (string)
    ↓
WorkflowServiceBase → Result<object>{ stepNumber, output = cleanedJson, currentStep, status }
    ↓
AiJobWorker.SerializeWorkflowResult() → JsonSerializer.Serialize(result.Data, _jsonOptions)
    ↓
job.ResultJson = { "stepNumber":1, "output":"{snake_case_json}", "currentStep":2, "status":1 }
    ↓
Frontend: parseJobResult → { stepNumber, output: "...", ... }   ← output لسه string!
    ↓
onHydrate(parsed) → hydrator بياخد الـ wrapper مش الـ actual data ← مشكلة تانية
```

**ولما الـ user يـrefresh** (getWorkflow path):
```
GET /Workflow/case/{caseId}
    ↓
DTO.step1Output = cleanedJson (string)  
    ↓
createWorkflowSlice: JSON.parse(step1Output) → actual step data (snake_case keys)
    ↓
stepHydrators[1](state, parsed)  ← بياخد actual data مباشرة
```

⚠️ مشكلة: الـ aiJob path والـ getWorkflow path بيديوا للـ hydrator format مختلف.

---

## المراحل التفصيلية

---

### 1. ✅ التحليل الذكي / مذكرة الدفاع — `SmartAnalysis`

| | |
|---|---|
| **المسار** | A — Direct Service |
| **الـ Backend Service** | `SmartAnalysisService.cs` |
| **الـ DTOs** | `AnalysisDto.cs` |
| **الـ Frontend Slice** | `smartAnalysisSlice.ts` |

#### الخطوات:
| Step | AiStepType | DTO | Frontend Output |
|------|-----------|-----|-----------------|
| 1 | `FactAnalysis` | `CaseAnalysisResultDto` | `outputs[1]: TFactAnalysis` |
| 2 | `GenerateDefenses` | `CaseDefensesResultDto` | `outputs[2]: TDefenses` |
| 3 | `AnalysisDefense` | `AnalyzeDefenseResponseDto` | `outputs[3]: TAnalysisDefenses` |
| 4 | `FinalRequirements` | `FinalRequirementsResponseDto` | `outputs[4]: TFinalRequirementsWrapper` |

#### الحالة: **✅ مكتمل**

**Backend** — شيلنا كل `[JsonPropertyName]` من `AnalysisDto.cs`. الـ `SnakeCaseOptions` (SnakeCaseLower + PropertyNameCaseInsensitive) بيـparse الـ AI response صح، والـ global CamelCase بيـserialize الـ HTTP response صح.

**Frontend** — أضفنا normalizers في `stepHydrators[1..4]` تتعامل مع الـ legacy snake_case data:
```typescript
// outputs[1] — FactAnalysis
caseType: result.caseType ?? result.case_type ?? ''
legalFactsSummary: result.legalFactsSummary ?? result.legal_facts_summary ?? []
// ... وكل الـ nested properties

// outputs[2] — Defenses
defensesFormal: (result.defensesFormal ?? result.defenses_formal ?? []).map(normalizeDefense)
// حيث normalizeDefense بتنورمل defenseTitle, basisFromCase

// outputs[4] — FinalRequirements
finalPrayers: (result.finalPrayers ?? result.final_prayers ?? []).map(...)
```

---

### 2. ⚠️ إعداد صحيفة الدعوى — `PreparingStatementOfClaims`

| | |
|---|---|
| **المسار** | A — Direct Service |
| **الـ Backend Service** | `PreparingStatementOfClaimsService.cs` |
| **الـ DTOs** | `Dtos/PreparingStatementOfClaims/*.cs` |
| **الـ Frontend Slice** | `preparingStatementOfClaimsUnifiedSlice.ts` |

#### الخطوات:
| Step | AiStepType | Response DTO | Frontend Output | snake_case keys |
|------|-----------|-------------|-----------------|-----------------|
| 1 | `LawsuitCaseType` | `LawSuitCaseTypeResponseDto` | `outputs[1]: TCaseDetails` | `case_main_type`, `case_sub_type`, `court_type`, `procedural_nature`, `is_urgent_or_summary`, `justification_summary` |
| 2 | `LawsuitParties` | `LawSuitPartiesResponseDto` | `outputs[2]: TLawsuitParties` | nested: `legal_capacity`, `national_id` |
| 3 | `LawsuitSubjects` | `LawSuitSubjectsResponseDto` | `outputs[3]: TLawsuitSubjects` | `subject_title`, `subject_full_text` |
| 4 | `LawsuitFacts` | `LawSuitFactsResponseDto` | `outputs[4]: { factsNarrative }` | `facts_narrative` |
| 5 | `LawsuitLegalBasis` | `LawSuitLegalBasisResponseDto` | `outputs[5]: TLawsuitLegalBasis` | `legal_texts`, `cassation_rulings` + nested: `law_name`, `article_number`, `article_text`, `application_notes`, `appeal_number`, `judicial_year`, `session_date`, `ruling_text` |
| 6 | `LawsuitRequests` | `LawSuitRequestsResponseDto` | `outputs[6]: TLawsuitRequests` | `principal_requests`, `subsidiary_requests`, `procedural_requests` + nested: `request_number`, `request_text`, `legal_reference` |

#### الحالة: **⚠️ يحتاج إصلاح**

**⚒ Backend** — اشيل `[JsonPropertyName]` من كل DTOs المذكورة:
- `LawSuitCaseTypeResponseDto`
- `PartyDto` (داخل `LawSuitPartiesDto.cs`)
- `LawSuitSubjectsResponseDto`
- `LawSuitFactsResponseDto`
- `LawSuitLegalBasisResponseDto` + `LegalTextDto` + `CassationRulingDto`
- `LawSuitRequestsResponseDto` + `LawSuitRequestItemDto`

الـ `PreparingStatementOfClaimsService.cs` بيستخدم `CamelCaseOptions` للـ Parse — ده صح (الـ CamelCase مع PropertyNameCaseInsensitive بتـ match camelCase JSON). لكن بعد ما تشيل الـ `[JsonPropertyName]`، لازم تتأكد إن الـ Parse بيشتغل مع AI response بـ snake_case. **الحل**: غيّر `CamelCaseOptions` إلى `SnakeCaseOptions` في `PreparingStatementOfClaimsService.cs` (موجود بالفعل في `SmartAnalysisService.cs`، ابعت نفس التعريف).

**⚒ Frontend** — أضف `stepHydrators` في `preparingStatementOfClaimsUnifiedSlice.ts`:
```typescript
stepHydrators: {
    1: (state, result) => {
        if (!result) { state.outputs[1] = null; return; }
        state.outputs[1] = {
            caseId: result.caseId ?? result.CaseId ?? '',
            caseMainType: result.caseMainType ?? result.case_main_type ?? '',
            caseSubType: result.caseSubType ?? result.case_sub_type ?? '',
            courtType: result.courtType ?? result.court_type ?? '',
            proceduralNature: result.proceduralNature ?? result.procedural_nature ?? '',
            isUrgentOrSummary: result.isUrgentOrSummary ?? result.is_urgent_or_summary ?? '',
            justificationSummary: result.justificationSummary ?? result.justification_summary ?? '',
        };
    },
    3: (state, result) => {
        if (!result) { state.outputs[3] = null; return; }
        state.outputs[3] = {
            caseId: result.caseId ?? result.CaseId ?? '',
            subjectTitle: result.subjectTitle ?? result.subject_title ?? '',
            subjectFullText: result.subjectFullText ?? result.subject_full_text ?? '',
        };
    },
    4: (state, result) => {
        if (!result) { state.outputs[4] = null; return; }
        state.outputs[4] = {
            factsNarrative: result.factsNarrative ?? result.facts_narrative ?? '',
        };
    },
    5: (state, result) => {
        if (!result) { state.outputs[5] = null; return; }
        state.outputs[5] = {
            caseId: result.caseId ?? result.CaseId ?? '',
            legalTexts: (result.legalTexts ?? result.legal_texts ?? []).map((t: any) => ({
                id: t.id ?? t.Id ?? '',
                lawName: t.lawName ?? t.law_name ?? '',
                articleNumber: t.articleNumber ?? t.article_number ?? '',
                articleText: t.articleText ?? t.article_text ?? '',
                applicationNotes: t.applicationNotes ?? t.application_notes ?? '',
            })),
            cassationRulings: (result.cassationRulings ?? result.cassation_rulings ?? []).map((r: any) => ({
                id: r.id ?? r.Id ?? '',
                court: r.court ?? r.Court ?? '',
                appealNumber: r.appealNumber ?? r.appeal_number ?? '',
                judicialYear: r.judicialYear ?? r.judicial_year ?? '',
                sessionDate: r.sessionDate ?? r.session_date ?? '',
                rulingText: r.rulingText ?? r.ruling_text ?? '',
                applicationNotes: r.applicationNotes ?? r.application_notes ?? '',
            })),
        };
    },
    6: (state, result) => {
        if (!result) { state.outputs[6] = null; return; }
        const normalizeRequest = (r: any) => ({
            id: r.id ?? r.Id ?? '',
            requestNumber: r.requestNumber ?? r.request_number ?? 0,
            requestText: r.requestText ?? r.request_text ?? '',
            legalReference: r.legalReference ?? r.legal_reference ?? '',
        });
        state.outputs[6] = {
            caseId: result.caseId ?? result.CaseId ?? '',
            principalRequests: (result.principalRequests ?? result.principal_requests ?? []).map(normalizeRequest),
            subsidiaryRequests: (result.subsidiaryRequests ?? result.subsidiary_requests ?? []).map(normalizeRequest),
            proceduralRequests: (result.proceduralRequests ?? result.procedural_requests ?? []).map(normalizeRequest),
        };
    },
}
```

> **ملاحظة:** `outputs[2]` (Parties) — `LawsuitParties.tsx` عنده normalization يدوية تعمل بالفعل (camelCase + PascalCase). بعد ما تشيل `[JsonPropertyName]` من `PartyDto` هيشتغل تلقائياً.

---

### 3. ⚠️ وجيزة الاستئناف — `AppealBrief`

| | |
|---|---|
| **المسار** | B — Workflow-based |
| **الـ Backend Service** | `AppealBriefService` → `WorkflowServiceBase` |
| **الـ StepOutput DTOs** | `AppealBriefStepOutput` في `StepOutputDtos.cs` |
| **الـ Frontend Slice** | `appealBriefSlice.ts` |

#### الخطوات:
| Step | AiStepType (int) | StepOutput Type | Frontend Output | المشكلة |
|------|-----------------|-----------------|-----------------|---------|
| 1 | `AppealBriefJudgmentData` (40) | `AppealBriefStepOutput` | `outputs[1]: TAppealJudgmentData` | `full_appeal_text` + ExtensionData |
| 2 | `AppealBriefReasoningAnalysis` (41) | `AppealBriefStepOutput` | `outputs[2]: TAppealReasoningAnalysis` | نفس |
| 3 | `AppealBriefGrounds` (42) | `AppealBriefStepOutput` | `outputs[3]: TAppealGrounds` | نفس |
| 4 | `AppealBriefRequests` (43) | `AppealBriefStepOutput` | `outputs[4]: TAppealRequests` | نفس |
| 5 | `AppealBriefLegalBasis` (44) | `AppealBriefStepOutput` | `outputs[5]: TAppealLegalBasis` | نفس |
| 6 | `AppealBriefAssembly` (45) | `AppealBriefStepOutput` | `outputs[6]: TAppealFinalAssembly` | نفس |

#### الحالة: **⚠️ يحتاج إصلاح (مزدوج)**

**المشكلة 1: Output Wrapping**

من الـ aiJob path، الـ hydrator بياخد:
```js
{ stepNumber: 1, output: '{"full_appeal_text":"...","court_information":"..."}', currentStep: 2, status: 1 }
```
بدل الـ actual step data. لازم تُعدّل `parseResult` في كل `useAnalysisStep` call عشان تُخرج الـ `output` string وتـparsه:

```typescript
// في AppealStep1JudgmentData.tsx وباقي الـ steps:
parseResult: (resultJson) => {
    try {
        const outer = JSON.parse(resultJson);
        // من الـ aiJob path: output هو string
        if (typeof outer?.output === 'string') {
            return JSON.parse(outer.output);
        }
        // من الـ getWorkflow path: البيانات مباشرة
        return outer;
    } catch { return null; }
},
```

**المشكلة 2: snake_case في الـ ExtensionData**

الـ `AppealBriefStepOutput` عنده `[JsonPropertyName("full_appeal_text")]` على `FullAppealText`. الـ AI بيرجع keys زي `court_information`, `parties`, `verdict` اللي بتتحط في `ExtensionData` وبتتسيريلايز بـ snake_case.

**⚒ الحل**: في `useAnalysisStep` بتاع كل step، أضف `parseResult` زي فوق + `deepCamelize` على الناتج لنورملة الـ snake_case:

```typescript
import { parseJobResult, deepCamelize } from '../../../../../../utils/parseJobResult';

parseResult: (resultJson) => {
    const outer = parseJobResult(resultJson);
    const actual = (typeof outer?.output === 'string')
        ? parseJobResult(outer.output)
        : outer;
    return deepCamelize(actual) as TAppealJudgmentData;
},
```

> `deepCamelize` موجود بالفعل في `utils/parseJobResult.ts` وهو **exported** (`export function deepCamelize`). يمكن استخدامه مباشرة.

---

### 4. ⚠️ شكوى إدارية — `AdminComplaint`

| | |
|---|---|
| **المسار** | B — Workflow-based |
| **الـ Backend Service** | `AdminComplaintService` → `WorkflowServiceBase` |
| **الـ StepOutput DTOs** | `AdminComplaintStepOutput` في `StepOutputDtos.cs` |
| **الـ Frontend Slice** | `adminComplaintSlice.ts` |

#### الخطوات:
| Step | AiStepType (int) | Frontend Output | المشكلة |
|------|-----------------|-----------------|---------|
| 1 | `AdminComplaintClassification` (50) | `outputs[1]: TAdminComplaintClassification` | `complaintType`, `targetAuthority`, `legalBasis` — لا underscores |
| 2 | `AdminComplaintFacts` (51) | `outputs[2]: TAdminComplaintFacts` | ExtensionData |
| 3 | `AdminComplaintViolation` (52) | `outputs[3]: TAdminComplaintViolation` | ExtensionData |
| 4 | `AdminComplaintRequests` (53) | `outputs[4]: TAdminComplaintRequests` | ExtensionData |
| 5 | `AdminComplaintAssembly` (54) | `outputs[5]: TComplaintFinalDocument` | ExtensionData |

#### الحالة: **⚠️ يحتاج إصلاح**

`AdminComplaintStepOutput` عنده:
- `[JsonPropertyName("complaintType")]` ← مش snake_case لكن explicit
- `[JsonPropertyName("targetAuthority")]`
- `[JsonPropertyName("legalBasis")]`

**⚒ الحل**: نفس مشكلة الـ output wrapping زي AppealBrief. أضف `parseResult` في كل `useAnalysisStep` call:

```typescript
parseResult: (resultJson) => {
    const outer = parseJobResult(resultJson);
    return (typeof outer?.output === 'string')
        ? parseJobResult(outer.output)
        : outer;
},
```

الـ keys هنا (`complaintType`, `targetAuthority`, `legalBasis`) مش snake_case فمش محتاج `deepCamelize`.

---

### 5. ⚠️ إنذار قانوني — `LegalWarning`

| | |
|---|---|
| **المسار** | B — Workflow-based |
| **الـ Backend Service** | `LegalWarningService` → `WorkflowServiceBase` |
| **الـ StepOutput DTOs** | `LegalWarningStepOutput` في `StepOutputDtos.cs` |
| **الـ Frontend Slice** | `legalWarningSlice.ts` |

#### الخطوات:
| Step | AiStepType (int) | Frontend Output | المشكلة |
|------|-----------------|-----------------|---------|
| 1 | `LegalWarningClassification` (70) | `outputs[1]: TLegalWarningClassification` | `warningType`, `obligationDetails`, `recommendedAction` |
| 2 | `LegalWarningBodyDraft` (71) | `outputs[2]: TLegalWarningBodyDraft` | ExtensionData |
| 3 | `LegalWarningAssembly` (72) | `outputs[3]: TWarningFinalDocument` | ExtensionData |

#### الحالة: **⚠️ يحتاج إصلاح**

نفس مشكلة AppealBrief — output wrapping. `LegalWarningStepOutput` عنده `[JsonPropertyName("warningType")]` إلخ.

**⚒ الحل**: نفس `parseResult` pattern في كل `useAnalysisStep` call بتاع الـ 3 steps.

> ملاحظة: `WarningStep2WarningDraft.tsx` بيعمل parse يدوي من `resultJson`. لازم تراجعه يستخدم نفس الـ pattern.

---

### 6. ⚠️ طلب تنفيذي — `ExecRequest`

| | |
|---|---|
| **المسار** | B — Workflow-based |
| **الـ Backend Service** | `ExecRequestService` → `WorkflowServiceBase` |
| **الـ StepOutput DTOs** | `ExecRequestStepOutput` في `StepOutputDtos.cs` |
| **الـ Frontend Slice** | `execRequestSlice.ts` |

#### الخطوات:
| Step | AiStepType (int) | Frontend Output | المشكلة |
|------|-----------------|-----------------|---------|
| 1 | `ExecRequestClassification` (80) | `outputs[1]: TExecRequestClassification` | `requestType`, `legalBasis`, `executionGrounds`, `urgencyLevel` |
| 2 | `ExecRequestDrafting` (81) | `outputs[2]: TExecRequestDrafting` | ExtensionData |
| 3 | `ExecRequestAssembly` (82) | `outputs[3]: TExecFinalAssembly` | ExtensionData |

#### الحالة: **⚠️ يحتاج إصلاح**

نفس output wrapping pattern.

**⚒ الحل**: نفس `parseResult` في `ExecStep1Classification.tsx`, `ExecStep2Drafting.tsx`, `ExecStep3Assembly.tsx`.

---

### 7. ⚠️ تحليل الحكم — `RulingAnalysis`

| | |
|---|---|
| **المسار** | B — Workflow-based (لكن slice مختلف) |
| **الـ Backend Service** | `RulingAnalysisService` → `WorkflowServiceBase` |
| **الـ StepOutput DTOs** | `RulingStep1Output..4Output` في `StepOutputDtos.cs` |
| **الـ Frontend Slice** | `rulingAnalysisAiSlice.ts` — **custom slice** (مش workflow slice) |

#### الخطوات:
| Step | AiStepType (int) | StepOutput DTO | snake_case keys | Frontend |
|------|-----------------|----------------|-----------------|---------|
| 1 | `RulingAnalysisOperative` (60) | `RulingStep1Output` | `verdict_summary`, `verdict_points` | `verdictAnalysis` |
| 2 | `RulingAnalysisReasoning` (61) | `RulingStep2Output` | `reasoning_summary`, `evidence_evaluation`, `legal_texts_applied` | `reasonsAnalysis` |
| 3 | `RulingAnalysisDefectEvaluation` (62) | `RulingStep3Output` | `defects_identified`, `procedural_errors` | `defectsEvaluation` |
| 4 | `RulingAnalysisFeasibilityReport` (63) | `RulingStep4Output` | `appeal_probability`, `next_steps` | `appealViability` |

#### الحالة: **⚠️ يحتاج إصلاح**

الـ slice هنا مش workflow slice — عنده hydrators منفصلة (`hydrateVerdictAnalysis`, etc.). مش بيستخدم `createWorkflowSlice`.

الـ frontend code اللي بيحمّل الـ ruling analysis لازم تعمل parse مخصص زي:
```typescript
parseResult: (resultJson) => {
    const outer = parseJobResult(resultJson);
    const actual = (typeof outer?.output === 'string')
        ? parseJobResult(outer.output)
        : outer;
    return {
        verdictSummary: actual?.verdictSummary ?? actual?.verdict_summary ?? '',
        verdictPoints: actual?.verdictPoints ?? actual?.verdict_points ?? [],
        charges: actual?.charges ?? [],
    };
},
onHydrate: (parsed) => dispatch(hydrateVerdictAnalysis(parsed)),
```

---

## ملخص الإصلاحات المطلوبة

### Backend (مرة واحدة)

| الملف | الإصلاح |
|------|---------|
| `LawSuitCaseTypeDto.cs` | اشيل `[JsonPropertyName]` من `LawSuitCaseTypeResponseDto` |
| `LawSuitPartiesDto.cs` | اشيل `[JsonPropertyName]` من `PartyDto` |
| `LawSuitSubjectsDto.cs` | اشيل `[JsonPropertyName]` من `LawSuitSubjectsResponseDto` |
| `LawSuitFactsDto.cs` | اشيل `[JsonPropertyName]` من `LawSuitFactsResponseDto` |
| `LawSuitLegalBasisDto.cs` | اشيل `[JsonPropertyName]` من كل الـ classes |
| `LawSuitRequestsDto.cs` | اشيل `[JsonPropertyName]` من كل الـ classes |
| `PreparingStatementOfClaimsService.cs` | غيّر `CamelCaseOptions` → `SnakeCaseOptions` في كل الـ Parse methods |
| `StepOutputDtos.cs` | اشيل `[JsonPropertyName]` من `RulingStep1..4Output`, `AppealBriefStepOutput`, `AdminComplaintStepOutput`, `LegalWarningStepOutput`, `ExecRequestStepOutput` |
| `StepOutputDtos.cs` (PrepStatement) | اشيل `[JsonPropertyName]` من `LawsuitCaseTypeStepOutput`, `LawsuitPartiesStepOutput`, `LawsuitSubjectsStepOutput`, `LawsuitFactsStepOutput`, `LawsuitLegalBasisStepOutput`, `LawsuitRequestsStepOutput` — دي بتُستخدم في الـ `getWorkflow` path |
| `StepOutputSchemas.cs` | غيّر `_jsonOptions` من CamelCase → SnakeCaseLower |

### Frontend (لكل مرحلة)

| الملف | الإصلاح |
|------|---------|
| `preparingStatementOfClaimsUnifiedSlice.ts` | أضف `stepHydrators` بالـ normalization المذكورة في القسم 2 |
| `AppealStep*.tsx` (كل الـ 6 steps) | أضف `parseResult` في `useAnalysisStep` لاستخراج `output` string |
| `ComplaintStep*.tsx` (كل الـ 5 steps) | نفس |
| `WarningStep*.tsx` (كل الـ 3 steps) | نفس |
| `ExecStep*.tsx` (كل الـ 3 steps) | نفس |
| Ruling Analysis components | `parseResult` + dispatch للـ hydrators المناسبة |

### الـ parseResult Pattern (copy-paste للـ workflow steps)

```typescript
// في useAnalysisStep call لأي workflow-based step:
parseResult: (resultJson: string) => {
    try {
        const outer = JSON.parse(resultJson);
        // aiJob path: output هو string مغلف
        const actual = typeof outer?.output === 'string'
            ? JSON.parse(outer.output)
            : outer;
        // نورملة أي snake_case/PascalCase متبقية
        return deepCamelize(actual) as YourStepType;
    } catch {
        return null;
    }
},
```

> **`deepCamelize`** موجودة في `src/utils/parseJobResult.ts` وهي **exported** بالفعل — يمكن استيرادها مباشرة: `import { deepCamelize } from '../../utils/parseJobResult'`

---

## الـ `parseJobResult.ts` — حالتها الحالية

```
PascalCase keys  → deepCamelize ✓
camelCase keys   → as-is ✓
snake_case keys  → ❌ مش بتتعامل معاها
```

الـ `deepCamelize` بتعمل `key.charAt(0).toLowerCase()` بس — مش بتحوّل `snake_case` → `camelCase`. إذا احتجت حل عام، أضف:

```typescript
const toSnakeToCamel = (key: string): string =>
    key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

// ثم في deepCamelize:
const normalized = toCamelKey(toSnakeToCamel(k));
```

لكن ده سيأثر على كل الـ stages — اتأكد من الـ testing قبل.
