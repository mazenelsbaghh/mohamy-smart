# Research: Phase 7 — Executive & Precautionary Requests

**Feature**: 026-exec-requests  
**Date**: 2026-04-10

## Decision 1: Step Output Storage

**Decision**: Store each step's output as a `NVARCHAR(MAX)` JSON column on the `ExecRequestWorkflows` table (columns: `Step1Output`, `Step2Output`, `Step3Output`).

**Rationale**: Same pattern as 022–025. Three step outputs. JSON columns are the established pattern.

## Decision 2: AI Call Pattern

**Decision**: Synchronous per-step HTTP call. No Hangfire.

**Rationale**: Same pattern as prior features.

## Decision 3: AiStepType Enum Extension

**Decision**: Add 3 members in block 80–82:
```
ExecRequestClassification = 80
ExecRequestDrafting       = 81
ExecRequestAssembly       = 82
```

**Rationale**: Block 80 follows 025's block 70–72. Consistent convention.

## Decision 4: Combined Executive + Precautionary Requests in One Petition

**Decision**: Step 1 output supports a `requestNature` field as an array (e.g., `["Executive", "Precautionary"]`). Step 2 drafts both request types as separate sub-sections. Step 3 assembles them into a single petition with distinct sections labeled by type.

**Rationale**: The spec edge case asks "How does the system handle combined executive + precautionary requests?" A single-value `requestNature` would force two separate workflow runs, which is inefficient and contradicts the spec's implied single petition output.

**Alternatives considered**:
- Two separate workflows — rejected: the spec shows a single 3-step workflow that can handle combinations.

## Decision 5: Service Request Fields — Empty When Inapplicable

**Decision**: When the classification (Step 1) determines that service is not required, the `serviceRequests` and `serviceDocumentsList` fields in Step 2 are explicitly set to empty arrays `[]` in the JSON output. The prompt instructs the AI: "إذا لم يكن الإعلان مطلوباً، اترك حقول طلبات الإعلان فارغة تماماً."

**Rationale**: SC-005 states "Service fields remain empty in the output when not applicable — no hallucinated service requests in non-service scenarios." Empty array is preferable to null to avoid frontend null-check errors.

**Alternatives considered**:
- Omit service fields entirely — rejected: consistent JSON schema per step makes frontend rendering simpler.
- Include placeholder service text — rejected: spec explicitly prohibits fabricated service requests.

## Decision 6: Executive Title (Sund Tanfizi) Classification

**Decision**: Step 1 accepts a `executiveTitleType` parameter (court judgment / notarized contract / commercial paper) provided by the lawyer as structured input (dropdown in UI). The AI uses this to classify the legal basis type correctly without having to infer it from narrative.

**Rationale**: The spec assumption states "The executive title may be a court judgment, notarized contract, or commercial paper — the system classifies based on the lawyer's input." Structured input is more reliable than AI inference from free text for a legally critical classification.

**Alternatives considered**:
- Free-text input only with AI inference — rejected: classification errors in executive title type can invalidate the petition.
