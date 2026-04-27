# Research: Phase 4 — Administrative Complaints & Grievances

**Feature**: 023-admin-complaints  
**Date**: 2026-04-10

## Decision 1: Step Output Storage

**Decision**: Store each step's output as a `NVARCHAR(MAX)` JSON column on the `AdminComplaintWorkflows` table (columns: `Step1Output` through `Step5Output`).

**Rationale**: Same rationale as 022-appeal-brief. Five steps, each with a distinct JSON structure. JSON columns avoid 5 separate relational tables while preserving per-step updateability. SQL Server 2022 handles NVARCHAR(MAX) JSON efficiently for this access pattern (write once per step, read all together).

**Alternatives considered**: Separate tables per step — rejected (same reasons as 022).

## Decision 2: AI Call Pattern

**Decision**: Synchronous per-step HTTP call. No Hangfire.

**Rationale**: Interactive step-by-step workflow. Lawyer submits input, waits for classification/drafting output, reviews, then proceeds. Same pattern as 022. Synchronous with 30s timeout is appropriate.

**Alternatives considered**: Hangfire — rejected (same reasons as 022).

## Decision 3: AiStepType Enum Extension

**Decision**: Add 5 members in block 50–54:
```
AdminComplaintClassification = 50
AdminComplaintFacts          = 51
AdminComplaintViolation      = 52
AdminComplaintRequests       = 53
AdminComplaintAssembly       = 54
```

**Rationale**: Block 50 follows 022's block 40–45. Consistent numbering convention.

**Alternatives considered**: N/A — enum extension is the established pattern.

## Decision 4: Confidence Rating — Advisory Only

**Decision**: The Step 1 confidence rating (High/Medium/Low) returned by the AI is stored as a string field in `Step1Output` JSON. It is displayed to the lawyer as an advisory signal in the UI (e.g., a color badge). It does not block the workflow from proceeding.

**Rationale**: The spec states "the confidence rating serves as a lawyer advisory signal, not a system constraint." Blocking the workflow on Low confidence would override lawyer judgment, which contradicts the platform's role as a tool, not an authority.

**Alternatives considered**:
- Block workflow on Low confidence — rejected: spec explicitly says it's advisory.
- Separate DB column for confidence — rejected: confidence is part of the Step 1 classification output; keeping it in the JSON column avoids schema coupling.

## Decision 5: Arabic Output Enforcement

**Decision**: "All output 100% in Arabic" is enforced via prompt system instructions (e.g., "يجب أن يكون كل ناتج باللغة العربية فقط، بدون أي كلمات إنجليزية"). No post-processing validation.

**Rationale**: Prompt-level enforcement is consistent with the approach used for prohibited terms in other workflows. Arabic content from Gemini is reliable when the system prompt explicitly mandates it.

**Alternatives considered**:
- Regex-based English term detection — rejected: brittle and adds latency.
- Client-side language detection — rejected: wrong layer for a server-enforced constraint.

## Decision 6: Compound Authority Routing (Edge Case)

**Decision**: When the grievance spans multiple authorities, Step 1 returns an array of `competentAuthorities` (not a single value). The UI displays all identified authorities and the primary one is highlighted. The lawyer selects which authority to target before proceeding to Step 2.

**Rationale**: The spec edge case asks "What happens when the grievance spans multiple authorities?" A single-authority response would force incorrect classification. The AI prompt is designed to output an array for compound cases, and the UI renders a selection step.

**Alternatives considered**:
- Force single authority selection in prompt — rejected: may cause hallucination or artificial prioritization.
- Generate separate complaint workflows per authority — rejected: over-engineered; the spec asks for one complaint document.
