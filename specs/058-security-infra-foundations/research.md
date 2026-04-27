# Research: Security & Infrastructure Foundations

**Feature**: `058-security-infra-foundations`  
**Date**: 2026-04-22  
**Status**: Complete

## R-001: XSS Sanitization Approach

### Decision: DOMPurify as the sanitization library

### Rationale
- Industry-standard HTML sanitization library with 10M+ weekly npm downloads.
- Zero-configuration for common use cases; customizable allowlists for safe tags.
- Tiny footprint (~13KB gzipped); no additional dependencies.
- Actively maintained by the Cure53 security team.
- Already compatible with React's `dangerouslySetInnerHTML` pattern.
- Produces empty string for fully malicious content — enabling our "المحتوى غير متاح" warning flow.

### Alternatives Considered
| Alternative | Rejected Because |
|------------|-----------------|
| `sanitize-html` | Larger bundle, less battle-tested than DOMPurify for browser-side use |
| `xss` (js-xss) | Less comprehensive allowlist defaults; fewer contributors |
| Custom regex stripping | Fragile, easily bypassed, not maintainable |
| Server-side sanitization only | Content arrives from AI models client-side; both layers needed |

### Implementation Pattern
```typescript
// sanitizeHtml.ts — single utility wrapping DOMPurify
import DOMPurify from 'dompurify';

const SAFE_TAGS = ['b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'span', 'div', 'table', 'tr', 'td', 'th', 'thead', 'tbody'];
const SAFE_ATTRS = ['class', 'style', 'dir'];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: SAFE_TAGS,
    ALLOWED_ATTR: SAFE_ATTRS,
  });
}

export function isSanitizedEmpty(html: string): boolean {
  const cleaned = sanitizeHtml(html);
  return cleaned.trim().length === 0;
}
```

---

## R-002: HTTPS Guard Pattern (Reference Implementation)

### Decision: Port the existing Admin/Lawyer dashboard HTTPS guard to the Landing page

### Rationale
The Admin Dashboard already has a production HTTPS guard at `mohamy-smart-admin-dashboard/src/APIs/api.ts` lines 9-15:
```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;
if (import.meta.env.PROD && apiBaseUrl && !apiBaseUrl.startsWith("https://")) {
  throw new Error(
    `[Security] VITE_API_BASE_URL must use HTTPS in production. Got: ${apiBaseUrl}`
  );
}
```

The Landing page uses Next.js (not Vite), so environment variable access differs:
- Vite: `import.meta.env.VITE_*` / `import.meta.env.PROD`
- Next.js: `process.env.NEXT_PUBLIC_*` / `process.env.NODE_ENV === 'production'`

### Implementation Pattern (Next.js)
```typescript
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (process.env.NODE_ENV === 'production' && apiBaseUrl && !apiBaseUrl.startsWith('https://')) {
  throw new Error(
    `[Security] NEXT_PUBLIC_API_BASE_URL must use HTTPS in production. Got: ${apiBaseUrl}`
  );
}
```

### Alternatives Considered
| Alternative | Rejected Because |
|------------|-----------------|
| Automatic HTTP→HTTPS upgrade | Hides misconfiguration; developer may not notice the insecure setup |
| Runtime warning only (no throw) | Allows insecure connections to proceed in production |

---

## R-003: CI Pipeline Enhancement Strategy

### Decision: Enhance existing `ci.yml` by adding lint, type-check, and npm audit steps to each frontend job

### Rationale
- `.github/workflows/ci.yml` already exists with separate jobs: `backend`, `lawyer-dashboard`, `admin-dashboard`, `landing`.
- Current frontend jobs only run `npm ci` + `npm run build`.
- Missing: `npm run lint`, `npm run type-check` (or `npx tsc --noEmit`), `npm audit --production`.
- `.github/workflows/security.yml` exists with gitleaks, Trivy, and CodeQL — security scanning is partially covered.
- The spec clarification decided on a **single workflow with matrix strategy**. However, the existing CI already uses separate jobs (not matrix). Converting to matrix would be a structural change with risk. **Decision: keep the existing separate-jobs structure** for this Phase 0 and add the missing steps to each job. Matrix refactoring deferred to Phase 1 monorepo.

### Changes to `ci.yml`
Each frontend job will add after `npm ci`:
1. `npm run lint` — run ESLint
2. `npx tsc --noEmit` — type checking (works even if no `type-check` script exists)
3. `npm run build` — production build (already present)
4. `npm audit --production --audit-level=high` — dependency security audit

### Node Version
Current: `node-version: '20'`. Should be updated to `'22'` to match the Docker container spec (Node 22 Alpine per constitution).

---

## R-004: Dependabot Configuration

### Decision: Add `.github/dependabot.yml` targeting all 3 frontend package ecosystems

### Rationale
- No existing Dependabot configuration found.
- Trivy in `security.yml` covers vulnerability scanning but does NOT create update PRs.
- Dependabot creates automated PRs with version bumps — complementary to Trivy.

### Configuration Pattern
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/mohamy-smart-admin-dashboard"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  - package-ecosystem: "npm"
    directory: "/mohamy-smart-lawyer-dashboard"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  - package-ecosystem: "npm"
    directory: "/mohamy-smart-landing"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  - package-ecosystem: "nuget"
    directory: "/mohamy-smart-backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 3
```

---

## R-005: TypeScript Strict Mode Strategy

### Decision: Enable `noImplicitAny: true` in all application `tsconfig.json` files and fix all 23 identified `any` usages

### Rationale
- Neither Admin nor Lawyer Dashboard has `noImplicitAny` set in their tsconfig.
- The Landing page uses Next.js which has `strict: true` by default (includes `noImplicitAny`).
- Total `any` usages found:
  - Admin Dashboard: ~8 files with explicit `any` or `as any` (analytics components, FilterSelect, CustomInput)
  - Lawyer Dashboard: ~12 files (to be inventoried during implementation)

### Strategy
1. Enable `noImplicitAny: true` in `tsconfig.json` for both Admin and Lawyer.
2. Run `npx tsc --noEmit` to get the full error list.
3. Fix in priority order: (a) Redux slices/thunks, (b) API service types, (c) component props, (d) utility functions.
4. For genuinely dynamic data (e.g., third-party library callbacks), use `unknown` with type guards instead of `any`.

---

## R-006: Sentry DSN Validation with Zod

### Decision: Replace string-prefix DSN check with Zod URL validator

### Rationale
Current check in both dashboards: `!sentryDsn.startsWith('TODO')` — easily bypassed by `TODOSentryKey` or other prefixes.

### Implementation Pattern
```typescript
import { z } from 'zod';

const envSchema = z.object({
  VITE_SENTRY_DSN: z.string().url().startsWith('https://').optional().or(z.literal('')),
  VITE_API_BASE_URL: z.string().url(),
});

const env = envSchema.safeParse({
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
});

if (!env.success) {
  console.warn('[Config] Environment validation failed:', env.error.flatten());
}
```
