# Plan: Hide Trial Plan from Subscription Page

This plan details how to filter out the Trial Plan ("الباقة التجريبية" / "Free Trial") from the list of subscription options shown to lawyers.

## Proposed Changes

### Lawyer Dashboard Pages (`apps/lawyer-dashboard`)

#### 1. Main Subscription Page (`Subscription.tsx`)
- Path: `apps/lawyer-dashboard/src/pages/subscription/Subscription.tsx`
- Add a filtered plans memoized array:
  ```tsx
  const filteredPlans = useMemo(() => {
    return plans.filter(p => p.name !== 'الباقة التجريبية' && p.name !== 'Free Trial');
  }, [plans]);
  ```
- Change references to `plans` (when rendering the cards list) to `filteredPlans`.

#### 2. Settings Subscription Subpage (`Subscription.tsx`)
- Path: `apps/lawyer-dashboard/src/pages/settings/subPagesSettings/Subscription.tsx`
- Add the same `filteredPlans` memoized array using `useMemo`.
- Replace references to `plans` when mapping available subscription plans with `filteredPlans`.

## Verification Plan

### Lint Checks
- Run code validation tests:
  ```bash
  npm run lint
  ```

### Manual Verification
- Navigate to the subscription pages (`/subscription` and `/settings?tab=subscription` or similar) in the lawyer dashboard.
- Verify that "الباقة التجريبية" is no longer visible in the list of available subscription cards.
- Verify that all other active subscription plans (e.g., standard, corporate plans) continue to display normally.
