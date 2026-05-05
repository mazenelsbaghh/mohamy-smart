# UI Contract: Guided Page Popup

## Purpose

Provide a page-level Arabic guided popup that moves through important buttons and page areas, explains each step, and teaches safe AI usage where applicable.

## Component Inputs

```ts
type GuidedTourStep = {
  title: string;
  body: string;
  targetText?: string;
  targetSelector?: string;
  tone?: 'default' | 'ai' | 'warning';
};

type PageGuidanceContent = {
  key: string;
  eyebrow?: string;
  title: string;
  summary: string;
  primaryActions: string[];
  nextStep: string;
  details?: string[];
  ai?: {
    whenToUse: string;
    requiredInputs: string[];
    expectedOutput: string;
    reviewNote: string;
  };
  tourSteps?: GuidedTourStep[];
};
```

## Behavior

- Render as a modal popup portal above the full application shell.
- Start at the first available tour step whenever the page popup opens.
- Show `السابق` and `التالي` controls when multiple steps exist.
- Show `ابدأ العمل` when the lawyer reaches the final step.
- Show a visual spotlight around the active target when found.
- Scroll the active target into view when practical.
- Fall back to text-only guidance if no target is found.
- Keep `عدم الإظهار مرة أخرى` page-specific and persistent in local browser storage.
- Respect reduced-motion preferences.

## Required States

- **Default**: Popup visible, first step active, spotlight shown if target exists.
- **Step Navigation**: Active step and spotlight update after next/previous.
- **Target Missing**: Popup remains usable, no spotlight error is shown.
- **AI Step**: AI readiness and lawyer responsibility copy is visible.
- **Dismissed**: Popup does not render after permanent dismissal for that page.

## Content Rules

- Arabic copy must be concise and action-oriented.
- AI steps must not imply AI replaces the lawyer.
- Button explanations must state what happens and when the lawyer should use the control.
- Non-AI pages must not display AI usage instructions.
