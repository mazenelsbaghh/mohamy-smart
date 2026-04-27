# Phase 1: Data Model & Integration Logic

This phase requires no alterations to backing database structures. It concentrates purely on mapping UI Layouts to asynchronous Redux state handlers.

## API Thunk Binding Map

| Route Segment Path | Responsible Component | Target Redux Store Slice | Primary Thunks |
| --- | --- | --- | --- |
| `/admin` | `HomeDashboard.tsx` | `state.reports` | `fetchPlatformStats()` |
| `/admin/lawyers` | `LawyersList.tsx` | `state.lawyers` | `fetchLawyers(page)`, `updateLawyerStatus()` |
| `/admin/subscriptions` | `SubscriptionsList.tsx` | `state.subscriptions` | `fetchSubscriptionsReports()` |
| `/admin/plans` | `PlansManager.tsx` | `state.plans` | `fetchPlans()`, `updatePlan()` |
| `/admin/notifications` | `NotificationsHub.tsx` | `state.notifications` | `fetchNotifications()`, `broadcastNotification()` |

## Error Boundary Contracts
All mutations (e.g. `updateLawyerStatus()`) must be wrapped or intercepted to execute the `showSuccessToast` or `showErrorToast` logic established in previous phases to ensure uniform feedback loops for administrators.
