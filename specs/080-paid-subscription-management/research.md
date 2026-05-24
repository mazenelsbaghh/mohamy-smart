# Research: Paid Subscription Management

## Decision: Classify paid subscriptions by plan price

**Decision**: Treat `Subscription.Price > 0` as paid and `Subscription.Price <= 0` as trial/free. Keep legacy names `"الباقة التجريبية"` and `"Free Trial"` as fallback trial indicators for historical consistency.

**Rationale**: Price is already stored, does not require schema changes, and is more reliable than localized plan display names.

**Alternatives considered**:
- Add a new `IsTrial` column: rejected because the current feature can be delivered without migration and historical data would still need backfill.
- Rely only on plan names: rejected because names can change and Arabic/English variants already exist.

## Decision: Extend existing endpoints instead of creating new paid-only endpoints

**Decision**: Add optional `isPaid` query filtering to `GET /api/v1/Subscription/lawyers` and add aggregate paid/trial fields to `GET /api/v1/admin/reports/subscriptions`.

**Rationale**: The admin UI already consumes these endpoints. Extending contracts keeps routing stable and preserves current clients because new query parameters and response fields are additive.

**Alternatives considered**:
- Create `/Subscription/lawyers/paid`: rejected because it duplicates authorization, controller, service, and Redux paths.
- Filter only in React: rejected because counts and list payloads would remain ambiguous and larger than needed.

## Decision: Main page defaults to paid-only list, detailed report exposes all modes

**Decision**: The main subscription management page fetches paid subscriptions by default. The detailed report page has a subscription-type filter with all/paid/trial options.

**Rationale**: The user's primary ask is "مين مشترك الاشتراك اللي بفلوس مش التجربة". The default should answer that immediately while still keeping trial audit access one click away.

**Alternatives considered**:
- Show all subscriptions by default with badges: rejected because it keeps the admin doing manual separation.
- Remove trials entirely from admin reports: rejected because trial usage still matters operationally.

## Decision: Preserve existing visual system

**Decision**: Use existing `StatsCards`, `CustomTable`, `SearchInput`, and `FilterSelect` patterns; add Arabic labels and empty states without introducing new decorative components.

**Rationale**: `impeccable` product guidance favors predictable, task-focused UI with familiar controls and consistent component vocabulary.

**Alternatives considered**:
- Build a new subscription analytics page layout: rejected as unnecessary scope expansion.
