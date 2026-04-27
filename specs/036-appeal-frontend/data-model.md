# Phase 1: Data Model & State Schema

## Component Inputs (React Props/State)

### `AppealBriefPage` (UI Orchestration Shell)
This component loads `AnalysisWorkflowShell`. State relies on Redux `appealBriefSlice` attributes.

### Hook: `useAnalysisStep` 
**Inputs**:
- `caseId: string`
- `workflowId: number | null`
- `stepNumber: number` 
- `stepType: AiStepType` (mapped to AppealBrief specific enums)
- `autoSubmit?: boolean` 
- `parseResult?: (json: string) => unknown`
- `onHydrate?: (parsed: unknown) => void` 

## Redux State Schemas (Hydrated via useAnalysisStep)

The `appealBriefSlice` manages state for 6 main outputs:

1. **Judgment Data (`AppealStep1JudgmentData`)**
   - Extracted facts, parties, court identification, dates.
2. **Reasoning Analysis (`AppealStep2Analysis`)**
   - Analysis of legal reasons provided by the judgement.
3. **Appeal Grounds (`AppealStep3Grounds`)**
   - Identified gaps, errors or application flaws.
4. **Appeal Requests (`AppealStep4Requests`)**
   - Formal requests to the higher court.
5. **Legal Basis (`AppealStep5LegalBasis`)**
   - Foundational clauses or precedents.
6. **Final Assembly (`AppealStep6Assembly`)**
   - Compiled master document string/markdown ready for docx export.
