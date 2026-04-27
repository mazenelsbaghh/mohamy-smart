# Quickstart: 047-legal-library

## Prerequisites

- Lawyer Dashboard dev server running (`npm run dev` in `mohamy-smart-lawyer-dashboard/`)
- Port 5078 accessible

## Running Locally

```bash
cd mohamy-smart-lawyer-dashboard
npm run dev
```

Open http://localhost:5078 → login → click "المكتبة القانونية" in sidebar.

## Direct Routes (for testing)

| Route | Purpose |
|-------|---------|
| `/legal-library` | Library landing page |
| `/legal-library/inheritance` | Inheritance calculator |
| `/legal-library/court-fees` | Court fees calculator |

## Test Scenarios

### Inheritance Calculator

1. **Basic case**: Estate = 1,000,000 EGP, heirs = [wife, son, father]
   - Wife: 1/8 = 125,000
   - Son: residuary
   - Father: 1/6 + residuary remainder

2. **Daughters only**: Estate = 600,000 EGP, heirs = [husband, 2 daughters]
   - Husband: 1/4 = 150,000
   - 2 Daughters: 2/3 = 400,000
   - Remaining 50,000 returned via radd

3. **Oversubscription (awl)**: Estate where fixed shares exceed 100%

### Court Fees Calculator

1. **Monetary claim**: 500,000 EGP → progressive bracket calculation
2. **Personal status**: → exempt
3. **Labor case**: → exempt

## Files to Create/Modify

### New Files
- `src/pages/legalLibrary/LegalLibrary.tsx` + `.css`
- `src/pages/legalLibrary/InheritanceCalculator.tsx` + `.css`
- `src/pages/legalLibrary/CourtFeesCalculator.tsx` + `.css`
- `src/pages/legalLibrary/engine/inheritanceEngine.ts`
- `src/pages/legalLibrary/engine/inheritanceTypes.ts`
- `src/pages/legalLibrary/engine/inheritanceData.ts`
- `src/pages/legalLibrary/engine/courtFesEngine.ts`
- `src/pages/legalLibrary/engine/courtFeesTypes.ts`
- `src/pages/legalLibrary/engine/courtFeesData.ts`

### Modified Files
- `src/components/sidebar/Sidebar.tsx` — add nav item
- `src/router/AppRouter.tsx` — add 3 routes
