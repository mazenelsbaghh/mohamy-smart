# Research: Guided Popup Tour

## Decision: Extend Existing Guidance Instead Of Adding A Tour Library

**Decision**: Extend the existing `PageGuidance` component and content catalog with guided steps and spotlight target metadata.

**Rationale**: The feature is small, static, and tightly coupled to Arabic product copy. A third-party tour library would add dependency weight and styling friction without solving the page-specific legal copy requirement.

**Alternatives considered**:
- Dedicated onboarding/tour library: rejected because it increases bundle and design complexity for a contained feature.
- Page-specific custom popups: rejected because it duplicates behavior and risks inconsistent Arabic UX.

## Decision: Target Matching By Text Or Selector With Safe Fallback

**Decision**: Each guided step may define target text or a selector. The component will find a visible matching button/link/control where possible and fall back to text-only guidance if not found.

**Rationale**: Some pages already have meaningful Arabic button text but lack stable test IDs. Text matching gives useful coverage immediately, while selectors allow future precision.

**Alternatives considered**:
- Require data attributes on every target: rejected for the first release because it would require broad page edits.
- Only show abstract steps: rejected because the user specifically wants motion going to buttons.

## Decision: Spotlight And Popup Navigation

**Decision**: Show a moving spotlight around the active target, plus previous/next buttons and a visible step counter in the popup.

**Rationale**: The lawyer can connect each explanation to a concrete control and move at their own pace.

**Alternatives considered**:
- Auto-playing tour: rejected because lawyers need control and reduced interruption.
- Multiple floating labels at once: rejected because it would clutter dense legal pages.

## Decision: Reduced Motion Support

**Decision**: Use lightweight transform/opacity transitions and disable motion when `prefers-reduced-motion` is active.

**Rationale**: The motion should clarify state, not distract or create discomfort.

**Alternatives considered**:
- Heavy animated paths or decorative motion: rejected as inappropriate for a professional legal dashboard.

## Decision: Preserve Page-Specific Dismissal

**Decision**: Keep the existing local "عدم الإظهار مرة أخرى" behavior per page guidance key.

**Rationale**: The guided popup is prominent and should not repeat after a lawyer explicitly dismisses it for a page, while other pages should still be teachable.

**Alternatives considered**:
- Global hide all guidance: rejected because it could hide useful guidance on pages the lawyer has not learned yet.
