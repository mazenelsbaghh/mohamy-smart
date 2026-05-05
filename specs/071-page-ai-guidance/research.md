# Research: Page AI Guidance

## Decision: Use Static Editorial Guidance Content

**Decision**: Store page guidance as a local content catalog maintained with the lawyer dashboard source.

**Rationale**: The requested guidance is product education copy, not user-generated or case-specific data. Static content renders immediately, avoids a backend dependency, and keeps professional wording reviewable in code review.

**Alternatives considered**:
- Backend-managed guidance records: rejected for v1 because it adds admin tooling and persistence without a current requirement to edit guidance at runtime.
- AI-generated help text: rejected because legal product guidance must be stable, reviewed, and consistent.

## Decision: Shared Guidance Component With Page-Specific Content

**Decision**: Build one reusable `PageGuidance` presentation component and pass page-specific content from the catalog.

**Rationale**: A shared component keeps popup behavior, AI notices, and responsive behavior consistent across pages while allowing each page to have tailored copy.

**Alternatives considered**:
- Inline guidance markup on each page: rejected because it would duplicate behavior and create style drift.
- Page-specific inline markup: rejected because it would duplicate behavior and create style drift.

## Decision: Page Popup With Ordered Steps

**Decision**: Show a concise popup by default with ordered page steps, plus AI usage and review notes when relevant.

**Rationale**: New users need page orientation at the moment they arrive. A popup makes the guidance visible enough to teach the workflow without permanently occupying page space.

**Alternatives considered**:
- Always-expanded large help panels: rejected because repeated daily pages would become noisy.
- Hidden-only help icons: rejected because the user specifically wants guidance visible on every page.
- Inline compact banners: rejected after product feedback because the intended experience is an explicit step-by-step popup.

## Decision: AI Guidance Only Where AI Exists

**Decision**: Pages with AI actions show AI usage timing, required inputs, expected output, and lawyer review responsibility. Pages without AI actions show manual workflow guidance only.

**Rationale**: Overstating AI availability harms trust and could lead lawyers to expect automation where none exists.

**Alternatives considered**:
- Generic AI explanation on all pages: rejected because it is misleading for pages that do not include AI.

## Decision: Local Permanent Dismiss Preference

**Decision**: Persist "عدم الإظهار مرة أخرى" locally in the browser for each page guidance key.

**Rationale**: This avoids requiring backend storage while making the experience less repetitive for returning lawyers. It is page-specific so hiding guidance on one page does not disable useful guidance elsewhere.

**Alternatives considered**:
- No persistence: rejected because repeated exposure to full guidance can become annoying.
- Account-level preference: deferred until users explicitly need cross-device help preferences.
