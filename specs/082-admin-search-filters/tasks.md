# Tasks: Admin Search Filters

**Input**: Design documents from `/specs/082-admin-search-filters/`  
**Target prompt**: Create the tasks file so that a cheaper LLM model can implement it without problems.

## Phase 1: Backend Lawyers Search

- [x] T001 Update `mohamy-smart-backend/Lawyer.Application/IServices/IAccountService.cs` so `GetAllUsersAsync` accepts optional `string? search`, `bool? isActive`, and `bool? subscriptionIsActive` parameters before the cancellation token.
- [x] T002 Update `mohamy-smart-backend/Lawyer/Controllers/AccountController.cs` `GetUsers` action to accept `[FromQuery] string? search`, `[FromQuery] bool? isActive`, and `[FromQuery] bool? subscriptionIsActive`, then pass them to `GetAllUsersAsync`.
- [x] T003 Update `mohamy-smart-backend/Lawyer.Application/Services/AccountService.cs` `GetAllUsersAsync` signature to match T001 and trim `search` into a local `normalizedSearch` variable.
- [x] T004 Update `mohamy-smart-backend/Lawyer.Application/Services/AccountService.cs` query construction to filter by `isActive` when provided.
- [x] T005 Update `mohamy-smart-backend/Lawyer.Application/Services/AccountService.cs` query construction to filter by active lawyer subscription when `subscriptionIsActive` is provided.
- [x] T006 Update `mohamy-smart-backend/Lawyer.Application/Services/AccountService.cs` query construction to search `FullName`, `Email`, `PhoneNumber`, `Lawyer.BarNumber`, `Lawyer.Specialization`, `Lawyer.ExperienceNumber`, `Lawyer.LawFirmName`, and active subscription name when `normalizedSearch` is not empty.

## Phase 2: Shared Admin Toolbar

- [x] T007 Create `apps/admin-dashboard/src/components/adminFilters/adminFilterUtils.ts` with `normalizeAdminSearchText`, `adminTextIncludes`, and `recordMatchesAdminSearch` helpers that trim and lowercase text safely.
- [x] T008 Create `apps/admin-dashboard/src/components/adminFilters/AdminFilterToolbar.tsx` with a HeroUI `Input`, optional HeroUI `Select` filters, result count text, and a reset `Button`.
- [x] T009 Add responsive toolbar CSS classes in `apps/admin-dashboard/src/index.css` for `.admin-filter-toolbar`, `.admin-filter-toolbar__search`, `.admin-filter-toolbar__filters`, and mobile wrapping.

## Phase 3: Lawyers Page (P1)

- [x] T010 Update `apps/admin-dashboard/src/redux/lawyers/thunk/fetchLawyers.ts` request params type to include `search?: string`, `isActive?: boolean`, and `subscriptionIsActive?: boolean`.
- [x] T011 Update `apps/admin-dashboard/src/redux/lawyers/thunk/fetchLawyers.ts` API params to send trimmed `search`, `isActive`, and `subscriptionIsActive` only when set.
- [x] T012 Update `apps/admin-dashboard/src/pages/lawyers/Lawyers.tsx` to add `searchQuery`, `statusFilter`, and `subscriptionFilter` state.
- [x] T013 Update `apps/admin-dashboard/src/pages/lawyers/Lawyers.tsx` fetch effect to pass search/filter params and reset page to 1 when those values change.
- [x] T014 Update `apps/admin-dashboard/src/pages/lawyers/Lawyers.tsx` to render `AdminFilterToolbar` above `ServerPaginationTable` with Arabic labels and filters for status and subscription.

## Phase 4: Other Admin Pages (P2)

- [x] T015 Update `apps/admin-dashboard/src/pages/contactRequests/ContactRequests.tsx` to replace the one-off status filter with `AdminFilterToolbar`, add search over name, phone, message, and status, and keep status API filtering.
- [x] T016 Update `apps/admin-dashboard/src/pages/plansAndReview/Reviews.tsx` to add `AdminFilterToolbar` local search over reviewer name, role, comment, rating, and status.
- [x] T017 Update `apps/admin-dashboard/src/pages/plansAndReview/PlansAndReview.tsx` to add `AdminFilterToolbar` local search over plan name/features and filters for active/archived state.
- [x] T018 Update `apps/admin-dashboard/src/pages/subscriptions/SubscriptionReports.tsx` to use `AdminFilterToolbar` instead of separate `SearchInput` and `FilterSelect` controls while preserving existing API status/type filters and plan local filter.
- [x] T019 Update `apps/admin-dashboard/src/pages/subscriptions/Subscriptions.tsx` to add `AdminFilterToolbar` for the recent paid subscriptions table.
- [x] T020 Update `apps/admin-dashboard/src/pages/notifications/Notifications.tsx` to add `AdminFilterToolbar` local search over title/message/type/date and filters for read state and notification type.
- [x] T021 Update `apps/admin-dashboard/src/pages/aiUsage/AiUsage.tsx` to add `AdminFilterToolbar` local search over model usage and lawyer usage table rows while keeping the existing date filter panel.
- [x] T022 Update `apps/admin-dashboard/src/pages/subscriptions/AccountMessagingReport.tsx` to add separate `AdminFilterToolbar` controls for OTP events and email events.

## Phase 5: Verification and Review

- [x] T023 Run `npm run lint` from `apps/admin-dashboard` and fix any TypeScript/ESLint errors in modified frontend files.
- [x] T024 Run targeted backend build or `dotnet test` from `mohamy-smart-backend` and fix any C# compile/test errors in modified backend files.
- [x] T025 Perform UI/UX critique against the spec and plan: verify RTL labels, mobile wrapping, dark mode token usage, no layout overlap, no nested cards, and clear empty states.
