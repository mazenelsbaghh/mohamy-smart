# Research: Guidance Coverage Audit And Case Search Expansion

## Decision 1: Use Existing Guidance Registry As Source Of Truth

**Decision**: Audit and improve every route already registered in `PageGuidanceRoute.tsx`, using `guidanceContent.ts` as the content source.

**Rationale**: The feature request is to make the existing guidance complete and correct, not to introduce a second onboarding system. The registry already maps routes to guidance keys and is the correct coverage boundary.

**Alternatives considered**:

- Build a separate onboarding overlay: rejected because it would duplicate routing and dismissal state.
- Add inline help text to every page: rejected because the user asked for a popup-style guided explanation and the app should not become visually crowded.

## Decision 2: Make Scrolling Deterministic Instead Of Relying Only On Browser Defaults

**Decision**: Keep a custom scroll calculation that scrolls the nearest scrollable parent or the window so the target sits in a clear guide position before focus and spotlight updates run.

**Rationale**: `scrollIntoView` may do nothing when a target is technically visible but covered by the popup or too close to an edge. A computed scroll position gives the guide predictable behavior.

**Alternatives considered**:

- Continue using only `scrollIntoView`: rejected because it does not guarantee the target is in a useful visible area.
- Disable page scrolling while the popup is open: rejected because the feature explicitly needs guided scrolling.

## Decision 3: Use Temporary Focus Classes And Cleanup

**Decision**: Apply a temporary focus class and temporary `tabindex` only when the target is not naturally focusable, then remove both when the step changes or the popup closes.

**Rationale**: Guidance must visibly focus cards and headings as well as real buttons, without leaving stale DOM state after navigation.

**Alternatives considered**:

- Spotlight overlay only: rejected because the user asked for real focus and reliable target visibility.
- Permanent `data-*` attributes across all pages: rejected for now because stable selectors can be introduced progressively without modifying every page.

## Decision 4: Search Current Case List By Normalized Visible Fields

**Decision**: Expand the frontend search index for each loaded case to include case number, title, court, client name, opponent name, type names, status labels, active/archive labels, creation date, and description where available.

**Rationale**: The existing case list already includes most of the required fields. Frontend filtering is the smallest scoped change and satisfies the lawyer's immediate need for the currently loaded paginated list.

**Alternatives considered**:

- Backend search endpoint: deferred because the request targets the visible search input and the current page already filters client-side.
- Search only client and opponent names: rejected because the placeholder and existing behavior also include case number and court.

## Decision 5: Normalize Arabic Search Input

**Decision**: Normalize repeated whitespace, Arabic-Indic digits, and common Arabic letter variants for both query and indexed fields.

**Rationale**: Lawyers may type Arabic names and numbers in different forms. Lightweight normalization improves practical matching without adding heavy dependencies.

**Alternatives considered**:

- Exact string match only: rejected because it misses common Arabic and digit variations.
- Full fuzzy search library: rejected as unnecessary for the current paginated data size.
