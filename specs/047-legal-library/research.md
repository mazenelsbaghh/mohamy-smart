# Research: 047-legal-library

## R-001: Islamic Inheritance Calculation (Hanafi School)

**Decision**: Implement a rule-based engine using predefined heir categories, fixed fractions (furud), and residuary (ta'sib) rules per the Hanafi school of Islamic jurisprudence.

**Rationale**: Inheritance law in Islam is deterministic — the Quran specifies fixed shares for 12+ heir categories. The Hanafi school is the most widely followed in Egypt and has clear, well-documented rules. A rule engine with a priority-based resolution algorithm handles all cases correctly.

**Alternatives considered**:
- External API for inheritance calculation — rejected because the spec requires offline capability and no backend dependency.
- Table-based lookup — rejected because inheritance combinations are too numerous (combinatorial explosion); a rule engine handles all cases programmatically.

**Key inheritance rules (Hanafi)**:
1. **Spouse**: Husband gets 1/2 (no children) or 1/4 (with children). Wife/wives get 1/4 (no children) or 1/8 (with children).
2. **Daughters**: If 1 daughter and no sons → 1/2. If 2+ daughters and no sons → 2/3. Sons convert daughters to residuary (ta'sib).
3. **Sons**: Always residuary (ta'sib) — take remaining after fixed shares. Son's share is double daughter's.
4. **Father**: 1/6 if deceased has children or sons' children. Plus residuary if no fixed-share heirs remain.
5. **Mother**: 1/6 if deceased has children or 2+ siblings. Otherwise 1/3. (Special case: Umariyyatain if spouse + both parents only).
6. **Grandfather**: Replaces father if father is absent (same shares in Hanafi).
7. **Siblings**: Full/paternal half-sisters get 1/2 (one) or 2/3 (2+). Blocked by father, grandfather (in Hanafi grandfather doesn't fully block), or sons.
8. **Grandmothers**: 1/6 if no mother. Multiple grandmothers share the 1/6.
9. **Hajb (blocking)**: Certain heirs block others. E.g., son blocks brother; father blocks grandfather (in non-Hanafi); father blocks grandmother's share in some cases.

**Algorithm approach**:
1. Collect all heir inputs (types + counts).
2. Apply blocking rules (hajb) — remove blocked heirs.
3. Assign fixed fractions (furud) to eligible heirs.
4. Distribute remainder to residuary heirs (ta'sib) by priority.
5. Handle special cases: Radd (return) when fixed shares don't exhaust estate; Awl (oversubscription) when fixed shares exceed 1.
6. Calculate monetary values from estate total.

## R-002: Egyptian Court Fees Calculation

**Decision**: Implement a bracket-based fee calculator using the Egyptian Court Fees Law No. 90 of 1944 and its amendments.

**Rationale**: Egyptian court fees follow a progressive bracket system similar to tax brackets — different percentages apply to different value ranges. The calculation is purely arithmetic and deterministic.

**Alternatives considered**:
- External API — rejected per offline requirement.
- Simple percentage — rejected because Egyptian law uses progressive brackets, not flat rates.

**Key fee structure (Law 90/1944 with amendments)**:
1. **Filing fees (رسوم الإيداع)**: Progressive percentage of claim value with minimum and maximum caps.
2. **Expert fees (رسوم الخبراء)**: Fixed or percentage-based depending on case type.
3. **Execution fees (رسوم التنفيذ)**: Percentage of executed amount.
4. **Appeal fees**: Separate fee schedule for appeals.
5. **Exempt categories**: Family law cases (personal status), labor cases, certain criminal cases.

**Fee brackets (filing fees — indicative)**:
| Value Range (EGP) | Fee Rate |
|--------------------|----------|
| Up to 5,000 | Fixed fee |
| 5,001 – 10,000 | 1% |
| 10,001 – 50,000 | 0.8% |
| 50,001 – 200,000 | 0.6% |
| 200,001+ | 0.4% |

Note: Exact brackets must be verified against the latest amendment of Law 90/1944 during implementation.

## R-003: UI Page Structure Pattern

**Decision**: Follow existing page patterns exactly — `<section>`, `<Container>`, `<HeadTitle>`, `<CustomCard>` — with `useState` for form state and `useMemo` for computed results.

**Rationale**: Consistency with existing codebase reduces cognitive load for developers and ensures design system alignment. The FinancialsTab pattern proves that pure TypeScript arithmetic works well for financial calculations in this project.

**Alternatives considered**:
- React Hook Form — unnecessary for calculators where every keystroke updates results; plain `useState` with `useMemo` is simpler and more appropriate for real-time calculation.
- Redux state — rejected because calculator state is ephemeral per-page with no cross-page sharing or persistence requirement.

**Pattern**:
```tsx
// Each calculator page:
const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
const results = useMemo(() => engine.calculate(inputs), [inputs]);

// Input change handler:
const handleChange = (field: string, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
};
```

## R-004: Sidebar Navigation Item Placement

**Decision**: Place "المكتبة القانونية" nav item after "العقود القانونية" (Legal Contracts) and before "الأجندة" (Agenda), using `FaScaleBalanced` icon from `react-icons/fa6`.

**Rationale**: The legal library is a reference/utility section, naturally adjacent to legal contracts. The scale/balance icon is universally recognized as a legal symbol. `FaScaleBalanced` is available in `react-icons/fa6` which is already a project dependency.

**Alternatives considered**:
- `FaGavel` (gavel) — more associated with auctions/judgments than library.
- `FaBook` (book) — too generic, might confuse with documents.
- `FaLandmark` (courthouse) — better suited for court-related features.

## R-005: No External Math Library Needed

**Decision**: Use plain TypeScript arithmetic for all calculations. No external library.

**Rationale**: The FinancialsTab component already performs financial calculations (sums, subtractions, formatting) using plain JavaScript. Inheritance and court fee calculations involve basic arithmetic (fractions, percentages, bracket sums) that don't require specialized libraries.

**Alternatives considered**:
- `decimal.js` or `big.js` — rejected because the precision requirements (currency to 2 decimal places, percentages to 4 decimal places) are well within JavaScript's IEEE 754 double precision for the value ranges involved (up to billions of EGP).
- `mathjs` — rejected as overkill for simple arithmetic.
