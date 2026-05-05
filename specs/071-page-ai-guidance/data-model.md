# Data Model: Page AI Guidance

## PageGuidanceContent

Represents the guidance popup content shown on a main lawyer dashboard page.

**Fields**:
- `key`: Stable identifier for the page or workflow.
- `eyebrow`: Short category label, for example "إرشاد الصفحة" or "استخدام الذكاء".
- `title`: Page-specific guidance title.
- `summary`: One short paragraph explaining what this page is for.
- `primaryActions`: Ordered list of steps the lawyer can perform on the page.
- `nextStep`: One recommended next action for the current page.
- `details`: Optional list of practical notes shown inside the popup.
- `ai`: Optional AI guidance block.

**Validation Rules**:
- `key`, `title`, `summary`, and `nextStep` are required.
- `primaryActions` must contain at least one item.
- Text must be Arabic and written in professional legal-product tone.
- Content must not claim that AI replaces lawyer review.

## AiGuidanceContent

Represents AI-specific guidance for pages or workflows that include AI actions.

**Fields**:
- `whenToUse`: When the lawyer should use AI on the page.
- `requiredInputs`: Information the lawyer should prepare before starting AI.
- `expectedOutput`: What the AI should produce.
- `reviewNote`: Professional responsibility notice.

**Validation Rules**:
- All fields are required when an AI block exists.
- `reviewNote` must state that the lawyer remains responsible for review and final decision.
- AI guidance must not appear on pages without an AI action.

## GuidancePreference

Represents a local browser preference for hiding a guidance popup.

**Fields**:
- `guidanceKey`: The page guidance key.
- `dismissed`: Whether the page popup should stop appearing in this browser.

**Validation Rules**:
- Preference is optional. If absent, guidance popup opens by default on page visit.
- Preference must not contain user legal data or case data.

## Relationships

- `PageGuidanceContent` may contain one `AiGuidanceContent`.
- `GuidancePreference` references `PageGuidanceContent.key`.
- Multiple pages can share common wording patterns but must use separate `key` values and page-specific summary text.
