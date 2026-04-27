# Quickstart: Security & Infrastructure Foundations

**Feature**: `058-security-infra-foundations`  
**Date**: 2026-04-22

## Prerequisites

- Node.js 22+ installed
- Access to the project repository
- npm available

## Implementation Order

Execute tasks in this order to minimize conflicts:

### Step 1: XSS Sanitization (Lawyer Dashboard)
```bash
cd mohamy-smart-lawyer-dashboard
npm install dompurify
npm install -D @types/dompurify
```
- Create `src/utils/sanitizeHtml.ts` with the utility function
- Update all 4 files using `dangerouslySetInnerHTML` to wrap content with `sanitizeHtml()`
- Add empty-content warning component for when sanitization produces empty output

### Step 2: HTTPS Guard (Landing Page)
```bash
cd mohamy-smart-landing
```
- Create or update `src/lib/api.ts` with HTTPS guard matching the dashboard pattern
- Adapt for Next.js environment variables (`process.env.NEXT_PUBLIC_*`)

### Step 3: TypeScript Strict Mode
```bash
# Check current errors
cd mohamy-smart-admin-dashboard && npx tsc --noEmit 2>&1 | grep "any" | wc -l
cd mohamy-smart-lawyer-dashboard && npx tsc --noEmit 2>&1 | grep "any" | wc -l
```
- Enable `"noImplicitAny": true` in both `tsconfig.json` files
- Fix all `any` usages with proper types

### Step 4: Environment Validation
- Replace Sentry DSN string checks with Zod validators in both dashboards' `main.tsx`
- Update all `.env.example` files with descriptive comments

### Step 5: CI Enhancement
- Update `.github/workflows/ci.yml` to add lint, type-check, npm audit steps
- Update Node.js version from 20 to 22

### Step 6: Dependabot
- Create `.github/dependabot.yml` with npm + nuget + github-actions ecosystems

## Verification

After all changes:
```bash
# Verify XSS sanitization
cd mohamy-smart-lawyer-dashboard && grep -r "dangerouslySetInnerHTML" src/ --include="*.tsx"
# → Every occurrence should be wrapped with sanitizeHtml()

# Verify type safety
cd mohamy-smart-admin-dashboard && npx tsc --noEmit
cd mohamy-smart-lawyer-dashboard && npx tsc --noEmit
# → Zero errors expected

# Verify CI locally
cd mohamy-smart-admin-dashboard && npm run lint && npx tsc --noEmit && npm run build && npm audit --production
cd mohamy-smart-lawyer-dashboard && npm run lint && npx tsc --noEmit && npm run build && npm audit --production
cd mohamy-smart-landing && npm run lint && npx tsc --noEmit && npm run build && npm audit --production
```
