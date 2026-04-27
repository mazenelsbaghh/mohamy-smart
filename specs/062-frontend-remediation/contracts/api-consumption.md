# API Consumption Contracts: Frontend Remediation — Phases 2–5

**Branch**: `062-frontend-remediation` | **Date**: 2026-04-23

> This feature does NOT create new backend API endpoints. It documents the **existing** API endpoints that will be newly consumed by frontend pages, and the **shared package interfaces** that will be modified.

---

## Backend API Endpoints — Newly Consumed by Frontend

### Admin Dashboard — New API Connections

| Endpoint | Method | Purpose | Current Status |
|----------|--------|---------|---------------|
| `/Subscription/{id}` | GET | Fetch subscription details by ID | Exists; not consumed by admin frontend |
| `/Review` or `/admin/reviews` | GET | Fetch reviews list | Exists (verify endpoint path) |
| `/Review/{id}/status` or equivalent | PUT/PATCH | Approve/reject review | Exists (verify endpoint path) |
| `/admin/reports/subscriptions-chart` | GET | Chart data for subscriptions over time | May need to reuse `/admin/reports/subscriptions` with chart params |
| `/Subscription/lawyers/{id}` | GET | Fetch single lawyer subscription details | Exists; currently admin fetches all lawyers |

**Assumption**: All endpoints listed above exist on the backend. If any endpoint path is incorrect, the implementation phase will identify the correct path from the backend controllers.

---

### Lawyer Dashboard — Search Parameter Addition

| Endpoint | Current | Target |
|----------|---------|--------|
| `GET /Case/lawyer/{id}/cases` | Accepts `pageNumber`, `pageSize` | Add `searchQuery` parameter for server-side filtering |

**Note**: This requires verifying the backend `CaseController` accepts a search/filter parameter. If not, client-side filtering remains and this becomes a future backend task.

---

## Shared Package Interface Changes

### shared-validations — Public API

**Current exports** (`src/index.ts`):
```
passwordSchema, emailSchema, phoneSchema, lawyerLoginSchema, adminLoginSchema,
signupSchema, forgotPasswordRequestSchema, verifyOtpSchema, resetPasswordSchema
```

**Changes**:
- Upgrade to Zod v4 peer dependency (`^4.0.0`)
- `phoneSchema`: updated regex to accept international format
- `.nonempty()` calls → `.min(1)` (Zod v4 preference)
- Remove explicit `any` type annotations in `auth.ts`

**Breaking change**: Any consumer passing Zod v3 schemas to Zod v4 APIs must be tested. All 3 apps already use Zod v4, so impact is minimal.

---

### shared-api — Public API

**Current exports** (`src/index.ts`):
```
createApiClient, axiosErrorHandler
```

**Changes**:
- Add `_csrfFailedPreAuth = false` reset after successful login response
- Replace `(import.meta as any).env?.PROD` with environment-agnostic production detection
- No new exports; behavior change only

**No breaking changes** to the public API.

---

### shared-types — Public API

**Current exports** (`src/index.ts`):
```
TLoading, ApiResponse, PaginatedResponse, NotificationItem,
TProfile, UpdateProfileDto, ChangePasswordDto,
TSubscription, SubscriptionPlan, PaymentInfo, CreateSubscriptionResponse,
auth types, dashboard types
```

**New exports**:
- `ISODateString` — branded type for ISO date strings

**Modified exports**:
- `NotificationItem.type`: `string` → `'info' | 'warning' | 'error' | 'success'`
- `TClient` (if it exists elsewhere): align `email` field to `string | null`

**Breaking change**: `NotificationItem.type` narrowing may cause TypeScript errors in consumers that pass arbitrary strings. All consumers should be updated in the same PR.

---

### shared-utils — Public API

**Current exports** (`src/index.ts`):
```
envValidator, formatters, guards, normalizeDigits, parseJobResult, sanitizeHtml
```

**Changes**:
- `envValidator`: accept `NEXT_PUBLIC_*` env var prefix alongside `VITE_*`

**No breaking changes** — additive only.

---

### shared-ui — Public API

**Current exports** (`src/index.ts`):
```
CustomButton, CustomCard, CustomInput, CustomTable, Container, TableConfig
```

**Changes**:
- `CustomInput`: remove `as any` cast for `radius` prop — use proper HeroUI `Radius` type
- `CustomTable`: add generic type parameter for type-safe column access

**Potential breaking change**: `CustomTable` API may change if generic type parameter is added. Consumers may need to pass a type argument.

---

## Environment Variables — New or Modified

| Variable | App | Current | Target |
|----------|-----|---------|--------|
| `VITE_SUPPORT_WHATSAPP` | Lawyer Dashboard | Not defined | WhatsApp number (e.g., `201289221056`) |
| `NEXT_PUBLIC_SITE_URL` | Landing | Not used in metadata | Production site URL for OG tags |
| `NEXT_PUBLIC_DASHBOARD_URL` | Landing | Used in HeroSection only | Expand to all CTA/pricing buttons |

---

## Content Changes — Landing Page

| Component | Change |
|-----------|--------|
| `PricingPlans.tsx` | Professional plan features — distinct from basic plan |
| `CallToAction.tsx` | Button links to signup URL |
| `PricingPlans.tsx` | All 3 plan buttons link to signup/checkout |
| `layout.tsx` | OG image: `.ico` → `.png`/`.webp` |
| `privacy-policy/page.tsx` | Export unique `generateMetadata` |
| `refund-policy/page.tsx` | Export unique `generateMetadata` |
| `HeroSection.css` | `min-height: 170vh` → `100vh` |
| `robots.txt` + `sitemap.xml` | New files via Next.js App Router (`app/robots.ts`, `app/sitemap.ts`) |
