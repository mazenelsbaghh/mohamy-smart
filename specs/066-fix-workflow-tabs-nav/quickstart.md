# Quickstart: Workflow Tabs & Step Navigation Fix

**Branch**: `066-fix-workflow-tabs-nav` | **Date**: 2026-04-28

## Prerequisites

- Node.js (check `apps/lawyer-dashboard/package.json` for version)
- `npm install` from repo root (monorepo with turborepo)

## Development

```bash
# Start dev server
npm run dev --filter=lawyer-dashboard

# Run tests
npm test --filter=lawyer-dashboard

# Lint
npm run lint --filter=lawyer-dashboard
```

## Key Files to Understand

| File | Purpose |
|------|---------|
| `apps/lawyer-dashboard/src/hooks/useWorkflowOrchestrator.ts` | **NEW** - Shared workflow orchestration hook |
| `apps/lawyer-dashboard/src/components/analysisWorkflow/workflowConstants.ts` | **UPDATED** - Shared tab classNames + step utilities |
| `apps/lawyer-dashboard/src/pages/cases/subPagesCases/analysis/appealBrief/AppealBriefPage.tsx` | **BUG FIX** - Add missing SmartAnalysisLoader import |
| `apps/lawyer-dashboard/src/components/header/CaseHeaderBanner.tsx` | **BUG FIX** - Fix Arabic hamza "ابدأ" |
| `apps/lawyer-dashboard/src/pages/cases/CaseDetails.tsx` | **BUG FIX** - Fix location.state re-render |

## Verification Checklist

1. Open any case → click "ابدأ التحليل الذكي" → select any workflow → loader appears → step 0 renders
2. Complete step 0 → advance to step 1 → click step 0 tab → goes back → click step 2 tab → blocked
3. Refresh page while on step 3 → auto-resumes to step 3
4. Go back to case analysis → click "استكمال" → resumes to correct step
5. Start fresh workflow → old data cleared → starts from step 0
6. Open snapshot → all tabs open → read-only mode
7. Check browser console → no errors on any workflow page
