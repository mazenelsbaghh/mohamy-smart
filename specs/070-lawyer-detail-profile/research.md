# Research: Lawyer Detail Profile

## Decision: Keep the existing admin detail route and expand its response

**Rationale**: The admin dashboard already routes from `/lawyers/:id` to `GET /api/v1/lawyers/{id}`. Preserving this route avoids list-page changes and keeps bookmarked detail URLs working. The response can evolve because the frontend owns this internal admin contract and existing fields remain present.

**Alternatives considered**: Add `/api/v1/lawyers/{id}/profile`, but this would duplicate authorization and keep the weak current detail endpoint around.

## Decision: Build the detail payload in `AdminLawyerService`

**Rationale**: This endpoint is admin-specific and combines operational aggregates with profile fields. Keeping that aggregation in `AdminLawyerService` makes the controller thin and avoids overloading `AccountService`, which is already used for general user account concerns.

**Alternatives considered**: Extend `AccountService.GetUserByIdAsync`, but account retrieval should not know about admin-only case, review, subscription, and AI usage dashboards.

## Decision: Use existing tables and no migration

**Rationale**: The feature is read-only and all requested information already exists in user, lawyer, subscription, case, client, review, power of attorney, and AI usage records. A new table would add lifecycle work without new data ownership.

**Alternatives considered**: Create a denormalized admin profile snapshot. Rejected because freshness matters more than a cached snapshot for this single detail page.

## Decision: Return bounded recent activity lists

**Rationale**: The page needs "everything important" without transferring unbounded history. Counts provide full scale, while the most recent five cases/reviews/AI usage records and recent subscriptions give immediate context.

**Alternatives considered**: Return all related rows. Rejected because large lawyer accounts could slow the admin page and create unreadable UI.

## Decision: Redesign the page around dashboard cards, not disabled inputs

**Rationale**: The screenshot shows empty input outlines that look editable and do not communicate hierarchy. A dashboard detail layout fits admin scanning: profile header, status strip, metrics, detail panels, and recent activity.

**Alternatives considered**: Keep `CustomInput` read-only fields and add more of them. Rejected because the problem is both missing data and weak information architecture.

## Decision: Use existing CSS tokens and restrained product UI

**Rationale**: The admin dashboard already exposes warm neutral surfaces, amber accent, RTL/Tajawal typography, and status colors in `apps/admin-dashboard/src/index.css`. Matching those tokens keeps the page on-brand without introducing a new design system.

**Alternatives considered**: Introduce a new page-level palette or heavy visual treatment. Rejected because this is an operational admin screen, so design should serve fast scanning.
