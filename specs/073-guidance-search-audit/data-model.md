# Data Model: Guidance Coverage Audit And Case Search Expansion

## GuidancePage

Represents one registered page with contextual guidance.

**Fields**

- `key`: Stable page guidance identifier.
- `routePattern`: Route pattern that activates the guidance.
- `title`: Popup heading.
- `summary`: Short description of the page workflow.
- `tourSteps`: Ordered list of guidance steps.
- `ai`: Optional AI usage guidance.
- `dismissed`: Per-page browser preference controlled by the lawyer.

**Validation Rules**

- Every registered page must resolve to existing content.
- Every page must have at least one tour step.
- No page should contain placeholder or generic-only copy.
- Dismissal is scoped by page key.

## GuidanceStep

Represents one step in the guided popup.

**Fields**

- `title`: Specific step title naming the target or action.
- `body`: Practical instruction for the lawyer.
- `targetText`: Optional visible or accessible text used to find a target.
- `targetSelector`: Optional stable selector used before text matching.
- `tone`: Visual and semantic tone such as default, AI, or warning.

**Validation Rules**

- Each step must have a non-empty title and body.
- Each step should have a target reference when the page has a visible target.
- AI steps must align with available AI guidance content.
- If the target is unavailable, the step must still be understandable.

## GuidanceTarget

Represents a DOM element explained by a guidance step.

**Fields**

- `label`: Resolved accessible or visible label.
- `bounds`: Current viewport position and size.
- `scrollParent`: Nearest scrollable container, if present.
- `focusState`: Temporary focused state applied by the guide.

**Validation Rules**

- Target must be visible before focus is applied.
- Focus state must be removed when the step changes or closes.
- Targets inside scrollable panels must be scrolled through the nearest scrollable panel when possible.

## CaseSearchRecord

Represents one case item in the search list.

**Fields**

- `number`: Case number.
- `title`: Case title.
- `court`: Court name.
- `clientName`: Client name.
- `apponentName`: Opponent name as currently named in case state.
- `caseTypeName`: Primary case type label.
- `caseTypeNames`: Additional case type labels.
- `status`: Raw status value.
- `isActive`: Active/archive state.
- `description`: Optional visible or available description.
- `creationDate`: Case creation date.

**Validation Rules**

- Missing optional fields must be ignored.
- Search text must be normalized before matching.
- Empty search returns the current list subject only to status/archive filters.
