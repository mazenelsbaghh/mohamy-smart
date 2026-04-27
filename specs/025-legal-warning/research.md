# Research: Phase 6 — Official Legal Warning / Judicial Notice

**Feature**: 025-legal-warning  
**Date**: 2026-04-10

## Decision 1: Step Output Storage

**Decision**: Store each step's output as a `NVARCHAR(MAX)` JSON column on the `LegalWarningWorkflows` table (columns: `Step1Output`, `Step2Output`, `Step3Output`).

**Rationale**: Same pattern as 022–024. Three step outputs. JSON columns avoid 3 extra tables.

## Decision 2: AI Call Pattern

**Decision**: Synchronous per-step HTTP call. No Hangfire.

**Rationale**: Same pattern as prior features. Lawyer-driven interactive workflow.

## Decision 3: AiStepType Enum Extension

**Decision**: Add 3 members in block 70–72:
```
LegalWarningClassification = 70
LegalWarningBodyDraft      = 71
LegalWarningAssembly       = 72
```

**Rationale**: Block 70 follows 024's block 60–63. Consistent convention.

## Decision 4: Placeholder Handling for Missing Data

**Decision**: When party names, addresses, or dates are not provided by the lawyer, Step 3 inserts standardized Arabic placeholders: `(....)` for text fields and `[التاريخ]` for date fields. These are explicitly rendered as editable fields in the UI before the lawyer downloads the document.

**Rationale**: The spec requires "standardized placeholders rather than inventing data." Using `(....)` is the established Egyptian legal document convention for blank fields. The UI must highlight these so the lawyer knows to fill them before submission.

**Alternatives considered**:
- Block Step 3 until all data is provided — rejected: the lawyer may intentionally draft without some data and fill it later manually.
- Empty string placeholders — rejected: not standard; harder to locate in a long document.

## Decision 5: Zero Hallucination for Numerical Data

**Decision**: Step 1 includes a specific prompt instruction: "إذا لم يذكر المحامي المبلغ صراحةً، يجب إدراج (....)  بدلاً من أي رقم." This applies to amounts, dates, and addresses. No numerical value is ever generated without explicit input.

**Rationale**: The spec states "zero hallucination tolerance for numerical data" (SC-005). Incorrect amounts in a legal warning could constitute a legal defect invalidating the document.

**Alternatives considered**:
- Server-side number extraction validation — rejected: over-engineered for a prompt-enforced constraint.

## Decision 6: Legal Default Status (Matal Qanouni) Classification

**Decision**: Step 1 output includes a boolean `triggersLegalDefault` field plus a `legalDefaultJustification` string explaining the legal basis. The UI displays this prominently (e.g., a highlighted banner) since it determines downstream legal rights.

**Rationale**: Establishing "legal default" (مطل قانوني) is often the primary purpose of the warning. Surfacing it clearly in the UI is critical for the lawyer's advisory to their client.

**Alternatives considered**:
- Embed in narrative text only — rejected: harder for the lawyer to extract and communicate to the client quickly.
