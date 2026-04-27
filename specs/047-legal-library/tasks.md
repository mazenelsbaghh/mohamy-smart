# Tasks: المكتبة القانونية — حاسبة المواريث والرسوم القضائية

**Input**: Design documents from `/specs/047-legal-library/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-routes.md

**Tests**: Not explicitly requested in the spec — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Paths relative to `mohamy-smart-lawyer-dashboard/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory scaffolding and shared type foundations

- [X] T001 Create `src/pages/legalLibrary/` directory and `src/pages/legalLibrary/engine/` subdirectory in mohamy-smart-lawyer-dashboard/
- [X] T002 [P] Create shared HeirType enum and inheritance type definitions in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/engine/inheritanceTypes.ts`
- [X] T003 [P] Create CaseType enum and court fees type definitions in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/engine/courtFeesTypes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core calculation engines and routing — MUST complete before any user story UI work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create heir categories data (Arabic labels, gender, max count, Quranic fractions) in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/engine/inheritanceData.ts`
- [X] T005 Create Egyptian court fee brackets and case type data (filing fees, expert fees, exemptions per Law 90/1944) in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/engine/courtFeesData.ts`
- [X] T006 Implement inheritance calculation engine (hajb blocking, furud assignment, ta'sib distribution, radd, awl) in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/engine/inheritanceEngine.ts` (depends on T002, T004)
- [X] T007 Implement court fees calculation engine (progressive brackets, exemptions, itemized breakdown) in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/engine/courtFesEngine.ts` (depends on T003, T005)
- [X] T008 Add FaScaleBalanced import and legal-library nav item (label: "المكتبة القانونية", route: `/legal-library`) between "العقود القانونية" and "الأجندة" in `mohamy-smart-lawyer-dashboard/src/components/sidebar/Sidebar.tsx`
- [X] T009 Add three routes (`/legal-library` → LegalLibrary, `/legal-library/inheritance` → InheritanceCalculator, `/legal-library/court-fees` → CourtFeesCalculator) with lazy-loaded imports inside the ProtectedRoute > Layout block in `mohamy-smart-lawyer-dashboard/src/router/AppRouter.tsx`

**Checkpoint**: Engines + routing + nav item ready — user story UI work can begin in parallel

---

## Phase 3: User Story 1 — حاسبة المواريث (Priority: P1) 🎯 MVP

**Goal**: المحامي يدخل بيانات التركة والورثة ويحصل على نصيب كل وريث فوراً

**Independent Test**: افتح `/legal-library/inheritance` مباشرة، أدخل تركة 1,000,000 جنيه مع (زوجة + ابن + أب)، تأكد من ظهور النصيب الصحيح لكل وريث

### Implementation for User Story 1

- [X] T010 [US1] Create inheritance calculator page with three sections: (1) estate info card with totalValue/debts/bequests inputs using CustomInput, (2) heir selection card with add/remove heir buttons and count selectors, (3) results card displaying HeirShare table in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/InheritanceCalculator.tsx`
- [X] T011 [P] [US1] Create styles for inheritance calculator page (RTL, dark mode support, responsive grid for heir cards, results table styling) in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/InheritanceCalculator.css`
- [X] T012 [US1] Wire useMemo for real-time calculation — on every input change call `inheritanceEngine.calculate()` and display results in the shares table with heir type Arabic labels, monetary amounts, percentages, share type (fard/ta'sib/radd), and legal basis in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/InheritanceCalculator.tsx`
- [X] T013 [US1] Add input validation with Arabic error messages for: zero/negative estate value, bequests exceeding 1/3 of net estate, mutually exclusive heir combinations, and zero heirs in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/InheritanceCalculator.tsx`

**Checkpoint**: حاسبة المواريث تعمل بالكامل — يمكن اختبارها مباشرة على `/legal-library/inheritance`

---

## Phase 4: User Story 2 — حاسبة الرسوم القضائية (Priority: P1)

**Goal**: المحامي يختار نوع الدعوى ويدخل القيمة ويحصل على تفصيل الرسوم القضائية فوراً

**Independent Test**: افتح `/legal-library/court-fees` مباشرة، اختر "مطالبة مالية"، أدخل 500,000 جنيه، تأكد من ظهور تفصيل الرسوم

### Implementation for User Story 2

- [X] T014 [US2] Create court fees calculator page with two sections: (1) case info card with CaseType dropdown using InputSelect, claimValue input, isAppeal/isCassation toggles, (2) results card displaying FeeDetail table with totals in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/CourtFeesCalculator.tsx`
- [X] T015 [P] [US2] Create styles for court fees calculator page (RTL, dark mode, responsive layout, fee breakdown table) in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/CourtFeesCalculator.css`
- [X] T016 [US2] Wire useMemo for real-time calculation — on every input change call `courtFesEngine.calculate()` and display itemized fees with totals, exemption notices, and legal basis in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/CourtFeesCalculator.tsx`
- [X] T017 [US2] Add input validation with Arabic error messages for: zero/negative claim value, missing case type selection, and display exemption result for exempt case types (LABOR, PERSONAL_STATUS) in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/CourtFeesCalculator.tsx`

**Checkpoint**: حاسبة الرسوم القضائية تعمل بالكامل — يمكن اختبارها مباشرة على `/legal-library/court-fees`

---

## Phase 5: User Story 3 — صفحة المكتبة القانونية الرئيسية (Priority: P2)

**Goal**: صفحة هبوط تعرض الأدوات القانونية كبطاقات قابلة للنقر

**Independent Test**: افتح `/legal-library`، تأكد من ظهور بطاقتي "حاسبة المواريث" و"حاسبة الرسوم القضائية"، اضغط على أي منهما وتأكد من الانتقال

### Implementation for User Story 3

- [X] T018 [US3] Create legal library landing page with HeadTitle "المكتبة القانونية" and a grid of LibraryTool cards (inheritance calculator card with FaScaleBalanced icon, court fees card with FaMoneyBillWave icon), each card navigates to its route using `useNavigate()` in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/LegalLibrary.tsx`
- [X] T019 [P] [US3] Create styles for legal library landing page (card grid layout, hover effects, RTL, dark mode) in `mohamy-smart-lawyer-dashboard/src/pages/legalLibrary/LegalLibrary.css`

**Checkpoint**: صفحة المكتبة القانونية تعمل كنقطة دخول — التنقل من النيف بار → المكتبة → الأدوات

---

## Phase 6: User Story 4 — النيف بار يعمل بسلاسة (Priority: P2)

**Goal**: شريط التنقل يعرض عنصر المكتبة القانونية ويتميز بنفس سلوك الـ collapsible sidebar

**Independent Test**: افتح أي صفحة في الداشبورد، تأكد من ظهور عنصر "المكتبة القانونية" في النيف بار بين العقود والأجندة، مع hover expansion وactive state highlighting

### Implementation for User Story 4

- [X] T020 [US4] Verify sidebar active state highlighting works for `/legal-library` and all sub-routes (`/legal-library/inheritance`, `/legal-library/court-fees`) using NavLink `end` prop or path matching logic in `mohamy-smart-lawyer-dashboard/src/components/sidebar/Sidebar.tsx`
- [X] T021 [US4] Test sidebar responsive behavior on mobile (<=1000px) — legal library item appears correctly in the mobile drawer and drag-to-open/close works in `mohamy-smart-lawyer-dashboard/src/components/sidebar/Sidebar.tsx`

**Checkpoint**: النيف بار يعمل بشكل كامل مع العنصر الجديد على الديسكتوب والموبايل

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all user stories

- [X] T022 [P] Verify dark mode support across all three new pages (LegalLibrary, InheritanceCalculator, CourtFeesCalculator) — check CSS custom property usage and Tailwind dark: variants
- [X] T023 [P] Verify RTL layout on all new pages — no LTR text alignment issues, number formatting correct for Arabic locale
- [X] T024 Run `npm run lint` and `npm run build` in mohamy-smart-lawyer-dashboard/ to verify zero lint errors and successful production build
- [X] T025 Format all monetary values with Arabic number formatting (comma separators, EGP suffix) and percentages to 2 decimal places consistently across both calculators

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Phase 2 completion
  - US1 and US2 are fully independent — can proceed in parallel
  - US3 depends on US1 and US2 pages existing (for card links)
  - US4 (sidebar) partially depends on Phase 2 (nav item T008 is in Phase 2)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (حاسبة المواريث)**: After Phase 2 — no dependencies on other stories
- **US2 (حاسبة الرسوم القضائية)**: After Phase 2 — no dependencies on other stories
- **US3 (صفحة المكتبة)**: After US1 + US2 (links to their pages)
- **US4 (النيف بار)**: Nav item added in Phase 2 (T008), verification in Phase 6

### Within Each User Story

- Types before engine before UI
- CSS files can be created in parallel with TSX files
- Validation added after core calculation wiring

### Parallel Opportunities

- T002 and T003: types in parallel
- T004 and T005: data files in parallel
- T006 and T007: engines in parallel (after their respective types + data)
- T010+T011, T014+T015: page + CSS in parallel within each story
- US1 and US2 entire phases can run in parallel
- T018 and T019: landing page + CSS in parallel
- T022, T023: dark mode and RTL checks in parallel

---

## Parallel Example: Phase 2 (Foundational)

```text
# Types (parallel):
T002: "inheritanceTypes.ts"
T003: "courtFeesTypes.ts"

# Data (parallel, after types):
T004: "inheritanceData.ts"
T005: "courtFeesData.ts"

# Engines (parallel, after types+data):
T006: "inheritanceEngine.ts"
T007: "courtFesEngine.ts"

# Nav + routes (parallel with engines):
T008: "Sidebar.tsx nav item"
T009: "AppRouter.tsx routes"
```

## Parallel Example: US1 + US2 (after Phase 2)

```text
# Developer A — US1 (inheritance):
T010: "InheritanceCalculator.tsx"
T011: "InheritanceCalculator.css"  [P]
T012: "Wire useMemo calculation"
T013: "Add input validation"

# Developer B — US2 (court fees) — fully parallel:
T014: "CourtFeesCalculator.tsx"
T015: "CourtFeesCalculator.css"  [P]
T016: "Wire useMemo calculation"
T017: "Add input validation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T009)
3. Complete Phase 3: US1 — حاسبة المواريث (T010–T013)
4. **STOP and VALIDATE**: Test inheritance calculator at `/legal-library/inheritance`
5. Demo-ready: حاسبة المواريث تعمل كاملة

### Incremental Delivery

1. Setup + Foundational → محرك الحسابات + التنقل جاهز
2. Add US1 → حاسبة المواريث → Deploy/Demo (MVP!)
3. Add US2 → حاسبة الرسوم القضائية → Deploy/Demo
4. Add US3 → صفحة المكتبة → Deploy/Demo
5. Add US4 → تأكيد النيف بار → Deploy/Demo
6. Polish → جودة نهائية

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Once Foundational done:
   - Developer A: US1 (حاسبة المواريث)
   - Developer B: US2 (حاسبة الرسوم القضائية)
3. Then US3 + US4 + Polish together

---

## Notes

- All monetary formatting uses Egyptian Arabic locale (commas for thousands, EGP currency)
- No backend changes — all calculations are pure TypeScript functions
- No Redux needed — `useState` + `useMemo` pattern per research.md R-003
- Sidebar modification is additive only — no existing functionality removed or changed
- All new pages follow existing pattern: `<section>` + `<Container>` + `<HeadTitle>` + `<CustomCard>`
