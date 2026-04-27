# Quickstart: Appeal Brief Preparation (022)

## Prerequisites

- `make dev` running (Backend on :8976, Lawyer Dashboard on :5078)
- `make db-migrate` applied (includes new `AppealWorkflows` migration)
- A lawyer account exists with a case record linked to it
- Gemini API key configured in `appsettings.Development.json`

## Backend — Add the Migration

```bash
cd Lawyer.Infrastructure
dotnet ef migrations add AddAppealWorkflows --startup-project ../Lawyer
dotnet ef database update --startup-project ../Lawyer
# or via Makefile:
make db-migrate
```

## Backend — Test the API

```bash
# 1. Login as lawyer → get JWT
curl -X POST http://localhost:8976/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"01000000000","password":"Password123!"}'

# 2. Start a workflow
curl -X POST http://localhost:8976/api/AppealBrief \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"caseId": 1}'

# 3. Run Step 1
curl -X POST http://localhost:8976/api/AppealBrief/1/step/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"judgmentText": "قضت المحكمة بإدانة المتهم..."}'
```

## Frontend — Key Files to Create

| File | Purpose |
|------|---------|
| `src/services/appealBriefService.ts` | Axios calls for all endpoints |
| `src/redux/appealBrief/appealBriefSlice.ts` | Redux state: currentWorkflow, loading, error |
| `src/redux/appealBrief/thunks/runAppealStep.ts` | Async thunk: POST /step/{n} |
| `src/pages/appealBrief/AppealBriefPage.tsx` | 6-step wizard component |

## Wizard Flow (Frontend)

```
Step 1: Lawyer inputs judgment text → POST /step/1 → shows JudgmentData output
Step 2: Lawyer reviews Step 1 output → POST /step/2 → shows ReasoningAnalysis
Step 3: Lawyer reviews → POST /step/3 → shows AppealGrounds
Step 4: Lawyer reviews → POST /step/4 → shows AppealRequests
Step 5: Lawyer reviews → POST /step/5 → shows LegalBasis
Step 6: Lawyer reviews all → POST /step/6 → shows final brief → download option
```

At each step: "تعديل" button → PUT /step/{n} → re-runs save + clears downstream.

## Admin Dashboard — Model Config

After migration, 6 new rows appear automatically in the "نماذج الذكاء الاصطناعي" tab:
- استخراج بيانات الحكم (40)
- تحليل أسباب الحكم (41)
- تحديد أوجه الطعن (42)
- صياغة الطلبات (43)
- السند القانوني (44)
- تجميع الصحيفة النهائية (45)
