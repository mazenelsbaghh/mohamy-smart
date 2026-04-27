# Quickstart: Judicial Ruling Analysis (024)

## Prerequisites

- `make dev` running (Backend on :8976, Lawyer Dashboard on :5078)
- `make db-migrate` applied (includes new `RulingAnalysisWorkflows` migration)
- A lawyer account exists with a case record
- Gemini API key configured in `appsettings.Development.json`

## Backend — Add the Migration

```bash
cd Lawyer.Infrastructure
dotnet ef migrations add AddRulingAnalysisWorkflows --startup-project ../Lawyer
dotnet ef database update --startup-project ../Lawyer
```

## Backend — Test the API

```bash
# 1. Start a workflow
curl -X POST http://localhost:8976/api/RulingAnalysis \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"caseId": 1}'

# 2. Run Step 1 (operative analysis)
curl -X POST http://localhost:8976/api/RulingAnalysis/1/step/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"judgmentText": "بعد الاطلاع على الأوراق وسماع المرافعة..."}'

# 3. Run Step 2 (neutral reasoning)
curl -X POST http://localhost:8976/api/RulingAnalysis/1/step/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Frontend — Key Files to Create

| File | Purpose |
|------|---------|
| `src/services/rulingAnalysisService.ts` | Axios calls |
| `src/redux/rulingAnalysis/rulingAnalysisSlice.ts` | Redux state |
| `src/pages/rulingAnalysis/RulingAnalysisPage.tsx` | 4-step wizard |

## Wizard Flow (Frontend)

```
Step 1: Lawyer inputs judgment text → POST /step/1 → shows operative analysis (criminal/civil split)
Step 2: POST /step/2 → shows neutral reasoning (descriptive only — no evaluative terms)
Step 3: POST /step/3 → shows defect evaluation (sufficiency + defect type + diagnostic chain)
Step 4: POST /step/4 → shows feasibility report → download option
```

**Important UI note**: Step 2 output must be clearly labeled as "تحليل وصفي محايد" and Step 4 as "تقرير جدوى الطعن" to set correct lawyer expectations.

## Admin Dashboard — Model Config

After migration, 4 new rows appear in "نماذج الذكاء الاصطناعي":
- تحليل المنطوق (60)
- تحليل الأسباب (61)
- تقييم العيوب (62)
- تقرير جدوى الطعن (63)
