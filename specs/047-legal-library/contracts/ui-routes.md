# UI Routes Contract: 047-legal-library

## Routes

All routes are protected (behind `ProtectedRoute` + `Layout`).

### GET `/legal-library`

**Page**: LegalLibrary.tsx
**Description**: Landing page showing available legal tools as clickable cards.
**Component tree**: `<section><Container><HeadTitle /><cards grid></Container></section>`

**Cards displayed**:
| Title | Icon | Route |
|-------|------|-------|
| حاسبة المواريث | FaScaleBalanced | `/legal-library/inheritance` |
| حاسبة الرسوم القضائية | FaMoneyBillWave | `/legal-library/court-fees` |

**Behavior**: Each card navigates to the corresponding calculator page via React Router `navigate()`.

### GET `/legal-library/inheritance`

**Page**: InheritanceCalculator.tsx
**Description**: Islamic inheritance calculator (Hanafi school).
**Input fields**: Estate value, debts, bequests, heir selection (type + count).
**Output**: Per-heir share table with amount, percentage, share type, and legal basis.
**Behavior**: Results update in real-time via `useMemo` on every input change.

**UI sections**:
1. Estate info card (total value, debts, bequests inputs)
2. Heir selection card (add/remove heir types with count)
3. Results card (table showing each heir's share)

### GET `/legal-library/court-fees`

**Page**: CourtFeesCalculator.tsx
**Description**: Egyptian court fees calculator per Law 90/1944.
**Input fields**: Case type dropdown, claim value, appeal/cassation toggles.
**Output**: Itemized fee breakdown with total and legal basis citations.
**Behavior**: Results update in real-time via `useMemo` on every input change.

**UI sections**:
1. Case info card (case type select, claim value input, toggles)
2. Results card (fee breakdown table with totals)

## Sidebar Navigation

**New item**: Added between "العقود القانونية" and "الأجندة" in Sidebar.tsx.
- **Icon**: `FaScaleBalanced` (from `react-icons/fa6`)
- **Label**: المكتبة القانونية
- **Route**: `/legal-library`
- **Active state**: Highlighted when route matches `/legal-library/*`

## No API Contract

This feature has no backend API endpoints. All calculations are performed client-side.
