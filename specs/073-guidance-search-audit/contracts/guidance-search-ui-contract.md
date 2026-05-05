# UI Contract: Guidance Tour And Cases Search

## Page Guidance Contract

### Inputs

- `PageGuidanceContent`
  - `key`: page identifier.
  - `title`: popup title.
  - `summary`: page workflow summary.
  - `tourSteps`: ordered guidance steps.
  - `details`: optional notes.
  - `ai`: optional AI usage block.

### Required Behavior

- On open, show the first step for the active page.
- On next or previous, resolve the new target and remove focus from the previous target.
- If a target exists:
  - Scroll the nearest scrollable area or window until the target is clearly visible.
  - Apply a visible temporary focus style to the target.
  - Position spotlight using the target viewport bounds.
  - Keep the popup away from the target when possible.
- If a target does not exist:
  - Remove spotlight.
  - Show a clear fallback label explaining that the target may not be available in the current state.
- On close:
  - Remove target focus state.
  - Keep dismissal unchanged unless the lawyer selected permanent dismissal.
- On permanent dismissal:
  - Store dismissal for the current page key only.

### Accessibility And Motion

- Escape closes the popup.
- Arrow navigation moves between steps.
- Reduced motion disables pulse animation and smooth movement.
- Non-focusable targets may receive a temporary `tabindex` only during the active step.

## Cases Search Contract

### Input

- Search query from cases list search input.
- Current loaded cases list.
- Current status/archive filters.

### Searchable Fields

- Case number.
- Case title.
- Court.
- Client name.
- Opponent name.
- Primary and additional case type names.
- Status label.
- Active/archive label.
- Creation date.
- Description when available.

### Required Behavior

- Trim and normalize the query.
- Return all status-matching cases when query is empty.
- Match partial text from any searchable field.
- Ignore missing fields without errors.
- Placeholder must mention case number, court, client, and opponent.
