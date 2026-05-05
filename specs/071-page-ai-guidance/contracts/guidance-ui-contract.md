# UI Contract: PageGuidance

## Purpose

Provide a consistent page-level guidance popup that explains what the lawyer can do on the current page and, where applicable, how and when to use AI.

## Component Inputs

```ts
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
};
```

## Behavior

- Render a guidance popup when the lawyer opens a page unless that page was permanently dismissed.
- Show `summary`, ordered `primaryActions`, and `nextStep` as page steps.
- Allow the lawyer to close the popup for now without changing future visits.
- Allow the lawyer to click "عدم الإظهار مرة أخرى" and persist that dismissed state per `key` in local browser storage.
- If `ai` is absent, do not render an AI usage block.
- If `ai` is present, render the review responsibility note.
- Maintain RTL layout and readable Arabic text at desktop and mobile widths.

## Required States

- **Default**: Popup visible with title, summary, ordered steps, and close/dismiss actions.
- **AI-capable**: Popup includes AI timing, required inputs, expected output, and review responsibility note.
- **Dismissed**: Popup does not render for that page after "عدم الإظهار مرة أخرى" is selected.

## Content Rules

- Use professional Arabic.
- Avoid generic copy that could fit any page.
- Avoid promises of legal correctness or outcome guarantees.
- AI review note must preserve the lawyer's responsibility for final review and use.
