# Quickstart: Official Legal Warning / Judicial Notice (025)

## Prerequisites

- `make dev` running (Backend on :8976, Lawyer Dashboard on :5078)
- `make db-migrate` applied (includes new `LegalWarningWorkflows` migration)
- A lawyer account exists with a case record
- Gemini API key configured in `appsettings.Development.json`

## Backend — Add the Migration

```bash
cd Lawyer.Infrastructure
dotnet ef migrations add AddLegalWarningWorkflows --startup-project ../Lawyer
dotnet ef database update --startup-project ../Lawyer
```

## Backend — Test the API

```bash
# 1. Start a workflow
curl -X POST http://localhost:8976/api/LegalWarning \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"caseId": 1}'

# 2. Run Step 1 (classification)
curl -X POST http://localhost:8976/api/LegalWarning/1/step/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"obligationFacts": "المدين مدين بمبلغ 50,000 جنيه بموجب عقد قرض..."}'

# 3. Run Step 2 (warning body)
curl -X POST http://localhost:8976/api/LegalWarning/1/step/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Frontend — Key Files to Create

| File | Purpose |
|------|---------|
| `src/services/legalWarningService.ts` | Axios calls |
| `src/redux/legalWarning/legalWarningSlice.ts` | Redux state |
| `src/pages/legalWarning/LegalWarningPage.tsx` | 3-step wizard |

## Wizard Flow (Frontend)

```
Step 1: Lawyer inputs obligation facts → POST /step/1 → shows classification
        Highlight `triggersLegalDefault` prominently (banner/badge)
        Flag any missingElements to the lawyer before proceeding
Step 2: POST /step/2 → shows formal warning body paragraph
Step 3: POST /step/3 → shows complete warning document with placeholders highlighted
        Placeholders (....): rendered as editable inline fields before download
```

## Admin Dashboard — Model Config

After migration, 3 new rows appear in "نماذج الذكاء الاصطناعي":
- تصنيف الإنذار والتحليل القانوني (70)
- صياغة متن الإنذار (71)
- تجميع الإنذار النهائي (72)
