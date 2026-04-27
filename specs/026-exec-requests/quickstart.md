# Quickstart: Executive & Precautionary Requests (026)

## Prerequisites

- `make dev` running (Backend on :8976, Lawyer Dashboard on :5078)
- `make db-migrate` applied (includes new `ExecRequestWorkflows` migration)
- A lawyer account exists with a case record (with a judgment or executive title)
- Gemini API key configured in `appsettings.Development.json`

## Backend — Add the Migration

```bash
cd Lawyer.Infrastructure
dotnet ef migrations add AddExecRequestWorkflows --startup-project ../Lawyer
dotnet ef database update --startup-project ../Lawyer
```

## Backend — Test the API

```bash
# 1. Start a workflow (lawyer picks executive title type from dropdown)
curl -X POST http://localhost:8976/api/ExecRequest \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"caseId": 1, "executiveTitleType": "judicial"}'

# 2. Run Step 1 (classification)
curl -X POST http://localhost:8976/api/ExecRequest/1/step/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"caseFacts": "صدر حكم بإلزام المدعى عليه بمبلغ 100,000 جنيه..."}'

# 3. Run Step 2 (draft requests)
curl -X POST http://localhost:8976/api/ExecRequest/1/step/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Frontend — Key Files to Create

| File | Purpose |
|------|---------|
| `src/services/execRequestService.ts` | Axios calls |
| `src/redux/execRequest/execRequestSlice.ts` | Redux state |
| `src/pages/execRequest/ExecRequestPage.tsx` | 3-step wizard |

## Wizard Flow (Frontend)

```
Start: Lawyer inputs case facts + selects executive title type (dropdown: حكم قضائي / عقد موثق / ورقة تجارية)
Step 1: POST /step/1 → shows classification
        requestNature shown as tag chips (e.g., "تنفيذي" + "تحفظي" if combined)
        serviceRequirements.isServiceRequired shown as a prominent info block
Step 2: POST /step/2 → shows drafted requests (legal + service sections)
        If serviceRequests is empty array → service section hidden
Step 3: POST /step/3 → shows complete petition template with placeholders
        Download as .docx option
```

## Admin Dashboard — Model Config

After migration, 3 new rows appear in "نماذج الذكاء الاصطناعي":
- تحليل وتصنيف طبيعة الطلب (80)
- صياغة الطلبات (81)
- تجميع العريضة النهائية (82)
