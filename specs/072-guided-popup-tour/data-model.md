# Data Model: Guided Popup Tour

## PageGuidanceContent

Represents the guidance content for a lawyer-dashboard route.

**Fields**:
- `key`: Stable page identifier.
- `eyebrow`: Optional short category label.
- `title`: Popup title.
- `summary`: Page purpose summary.
- `primaryActions`: Existing ordered page steps.
- `nextStep`: Recommended final action.
- `details`: Optional practical notes.
- `ai`: Optional AI usage guidance.
- `tourSteps`: Optional explicit guided steps for target-aware navigation.

**Validation Rules**:
- `key`, `title`, `summary`, `primaryActions`, and `nextStep` are required.
- Text must be Arabic and professionally suitable for lawyers.
- If `tourSteps` is absent, the popup can derive basic steps from `primaryActions` and `nextStep`.

## GuidedTourStep

Represents one step in the popup tour.

**Fields**:
- `title`: Short Arabic step title.
- `body`: Explanation of what the target button or area does.
- `targetText`: Optional visible text or aria label used to locate the target.
- `targetSelector`: Optional CSS selector for a stable target.
- `tone`: Optional visual emphasis such as `default`, `ai`, or `warning`.

**Validation Rules**:
- `title` and `body` are required.
- At least one of `targetText` or `targetSelector` should be present for steps intended to highlight a control.
- Missing targets must not prevent the step from rendering.

## SpotlightTarget

Represents a visible DOM target found for the active guided step.

**Fields**:
- `rect`: Target rectangle in viewport coordinates.
- `label`: Target label used for screen-reader and fallback context.
- `found`: Whether a matching visible target was found.

**Validation Rules**:
- Rect is only used when a visible target exists.
- Target matching must ignore hidden or zero-size elements.

## GuidancePreference

Represents local browser dismissal state.

**Fields**:
- `guidanceKey`: Page guidance key.
- `dismissed`: Whether the page popup should stop appearing in this browser.

**Validation Rules**:
- Preference must not contain legal data, case facts, or client data.
- Dismissal is page-specific.
