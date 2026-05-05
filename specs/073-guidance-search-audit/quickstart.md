# Quickstart: Guidance Coverage Audit And Case Search Expansion

## Prerequisites

- Local Docker environment running the lawyer dashboard on `http://localhost:5078`.
- A logged-in lawyer account with at least one case that includes a client name, opponent name, court, and case number.

## Guidance Verification

1. Open `http://localhost:5078/clients`.
2. Clear this page's guidance dismissal in browser storage if needed.
3. Move through every step with `التالي`.
4. Confirm each step scrolls to the target before applying the focus outline.
5. Confirm the popup does not cover the focused target when there is enough screen space.
6. Repeat for representative registered routes:
   - `/`
   - `/cases`
   - `/cases/:id`
   - `/cases/:id/document-selection`
   - `/documents`
   - `/legal-library`
   - `/agenda`
   - `/chat`
   - `/settings`
7. Confirm AI pages show when to use AI, required inputs, expected output, and review warning.
8. Confirm `عدم الإظهار مرة أخرى` hides only the current page guidance.

## Cases Search Verification

1. Open `http://localhost:5078/cases`.
2. Search by part of the case number.
3. Search by part of the court name.
4. Search by client name.
5. Search by opponent name.
6. Search by case title or type.
7. Add extra spaces or Arabic-Indic digits where relevant and confirm normalized matches still work.
8. Clear the query and confirm the list returns to the current status/archive filter.

## Expected Checks

- `npm run lint` from `apps/lawyer-dashboard`.
- `npm run build` from `apps/lawyer-dashboard` or record unrelated existing blockers.
- Docker Vite serves changed guidance and cases modules on port 5078.

## Validation Notes

- `npm run lint` passed for the lawyer dashboard after separating the guidance route registry from the React component file.
- Targeted Vitest checks passed for `guidanceCoverage.test.ts` and `caseSearch.test.ts`: 8 tests passed.
- `dotnet build Lawyer.sln` passed for the backend search API changes with 0 errors and existing unrelated warnings.
- `docker compose up -d --build backend` rebuilt the backend container, and `mohamysmart-backend-1` returned healthy on port 8976.
- `npm run build` for the lawyer dashboard is still blocked by unrelated pre-existing TypeScript errors in `AgendaPage.tsx` and `PowerOfAttorneysPage.tsx`.
- Docker Vite served the updated guidance, guidance CSS, guidance coverage, case search helper, and cases page modules on `http://localhost:5078/`.
