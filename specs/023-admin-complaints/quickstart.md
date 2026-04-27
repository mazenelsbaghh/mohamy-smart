# Quickstart: Administrative Complaints & Grievances (023)

## Prerequisites

- `make dev` running (Backend on :8976, Lawyer Dashboard on :5078)
- `make db-migrate` applied (includes new `AdminComplaintWorkflows` migration)
- A lawyer account exists with a case record
- Gemini API key configured in `appsettings.Development.json`

## Backend — Add the Migration

```bash
cd Lawyer.Infrastructure
dotnet ef migrations add AddAdminComplaintWorkflows --startup-project ../Lawyer
dotnet ef database update --startup-project ../Lawyer
```

## Backend — Test the API

```bash
# 1. Start a workflow
curl -X POST http://localhost:8976/api/AdminComplaint \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"caseId": 1}'

# 2. Run Step 1 (classification)
curl -X POST http://localhost:8976/api/AdminComplaint/1/step/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"grievanceNarrative": "تقدم الموكل بطلب ترقية منذ عامين..."}'

# 3. Run Step 2 (facts narrative — no additional input needed)
curl -X POST http://localhost:8976/api/AdminComplaint/1/step/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Frontend — Key Files to Create

| File | Purpose |
|------|---------|
| `src/services/adminComplaintService.ts` | Axios calls |
| `src/redux/adminComplaint/adminComplaintSlice.ts` | Redux state |
| `src/redux/adminComplaint/thunks/runComplaintStep.ts` | Async thunk |
| `src/pages/adminComplaint/AdminComplaintPage.tsx` | 5-step wizard |

## Wizard Flow (Frontend)

```
Step 1: Lawyer inputs grievance narrative → POST /step/1 → shows classification + authority
        If multiple authorities returned: lawyer selects primary before proceeding
Step 2: POST /step/2 → shows formal facts narrative
Step 3: POST /step/3 → shows violation analysis + governing rules
Step 4: POST /step/4 → shows formal closing requests
Step 5: POST /step/5 → shows complete complaint document → download option
```

## Admin Dashboard — Model Config

After migration, 5 new rows appear in "نماذج الذكاء الاصطناعي":
- تصنيف الشكوى وتحديد الجهة (50)
- صياغة الوقائع (51)
- تحليل المخالفة (52)
- صياغة الطلبات (53)
- تجميع الشكوى النهائية (54)
