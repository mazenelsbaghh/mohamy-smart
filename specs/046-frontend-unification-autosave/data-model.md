# Data Model: Frontend Unification + Auto-save Complete

**Branch**: `046-frontend-unification-autosave`
**Date**: 2026-04-14

## Overview

This feature involves **no database schema changes**. All data model work is purely frontend TypeScript interfaces defining the shape of workflow step outputs. These interfaces exist in Redux state (in-memory) and correspond to the JSON structures returned by backend workflow APIs.

---

## Entity: TypedWorkflowState<TStepOutputs>

**Location**: `src/redux/shared/workflowTypes.ts`
**Status**: Existing — to be expanded with generic type parameter constraints

```
TypedWorkflowState<TStepOutputs>
├── workflowId: number | null
├── currentStep: number
├── status: WorkflowStatus ("NotStarted" | "InProgress" | "Completed" | "Abandoned")
├── lastSavedAt: string | null
├── outputs: TStepOutputs          ← Generic — each workflow defines its own
├── loadingState:
│   ├── isStarting: boolean
│   ├── isGetting: boolean
│   ├── isRunningStep: boolean
│   ├── isSavingStep: boolean
│   └── isAutoSaving: boolean
└── errorState:
    ├── startError: string | null
    ├── getError: string | null
    ├── runError: string | null
    ├── saveError: string | null
    └── autoSaveError: string | null
```

---

## Entity: Defense Memo Step Outputs (TSmartAnalysisOutputs)

**Location**: `src/redux/shared/workflowTypes.ts` (move from `smartAnalysisSlice.ts`)

| Step | Type Name | Key Fields |
|------|-----------|------------|
| 1 | `TFactAnalysis` | caseType, caseNumber, courtName, legalFactsSummary[], defendantsPositions[], evidenceMap[], potentialLegalCharacterization |
| 2 | `TDefenses` | defensesFormal[], defensesSubstantive[], defensesEvidentiary[] (each: TDefense{id, defenseTitle, basisFromCase, scope, strength}) |
| 3 | `TAnalysisDefenses` | Record<string, TDefenseMemorandum> — keyed by defenseId |
| 4 | `TFinalRequirementsWrapper` | finalPrayers[] (each: {id, requestLevel, requestText}) |
| 5 | `string` | Final memo draft HTML |

**State transitions**: NotStarted → Step 1 AI → Step 2 AI → Step 3 (per-defense AI) → Step 4 AI → Step 5 Draft → Completed

---

## Entity: Statement of Claims Step Outputs (TStatementOfClaimsOutputs)

**Location**: `src/redux/shared/workflowTypes.ts` (move from `preparingStatementOfClaimsUnifiedSlice.ts`)

| Step | Type Name | Key Fields |
|------|-----------|------------|
| 1 | `TCaseDetails` | caseId, caseMainType, caseSubType, courtType, proceduralNature, isUrgentOrSummary, justificationSummary |
| 2 | `TLawsuitParties` | caseId, parties[] (each: TLawsuitParty{id, name, role, type, legalCapacity, address, nationalId}) |
| 3 | `TLawsuitSubjects` | caseId, subjectTitle, subjectFullText |
| 4 | `TLawsuitFacts` | factsNarrative: string |
| 5 | `TLawsuitLegalBasis` | caseId, legalTexts[] (each: {id, lawName, articleNumber, articleText, applicationNotes}), cassationRulings[] |
| 6 | `TLawsuitRequests` | caseId, principalRequests[], subsidiaryRequests[], proceduralRequests[] |
| 7 | `string` | Final statement draft HTML |

**State transitions**: NotStarted → Step 1 AI → Step 2 AI → Step 3 AI → Step 4 AI → Step 5 AI → Step 6 AI → Step 7 Draft → Completed

---

## Entity: Auto-save State (per workflow page)

**Location**: Hook-local state in `useWorkflowAutoSave` (no Redux entity)

```
AutoSaveInternalState (refs, not persisted)
├── timeoutRef: NodeJS.Timeout | null    ← Debounce timer
├── pendingPayloadRef: any               ← Last unsaved payload (for retry)
├── isSavingRef: boolean                 ← Mutual-exclusion guard
```

**Button visual state** (derived from Redux `loadingState` + `errorState`):
```
SaveButtonState = "default" | "saving" | "saved" | "failed"

Transitions:
  default → saving (auto-save fires)
  saving → saved (API returns 200, show for 2s → default)
  saving → failed (API error, show for 3s → default)
  default → saving (manual save clicked, same flow)
```

---

## Entity: IWorkflowThunks (typed version)

**Location**: `src/redux/shared/createWorkflowThunks.ts`

Current `any` usages to be replaced:

| Thunk | Current Return | Target Return |
|-------|---------------|---------------|
| `startWorkflow` | `any` | `IWorkflowDto` (existing interface) |
| `getWorkflow` | `any` | `IWorkflowDto & Record<\`step${number}Output\`, string \| null>` |
| `runStep` | `any` | `unknown` (parsed by hydrator) |
| `saveEditedStep` | `any` | `{ success: boolean }` |
| `saveDraftStep` | `any` | `{ lastSavedAt?: string }` |

---

## Relationships

```
createWorkflowSlice<TStepOutputs>
    ├── uses → createWorkflowThunks (typed)
    ├── manages → TypedWorkflowState<TStepOutputs>
    └── hydrates via → stepHydrators[stepNumber](state, result)

AnalysisStepShell
    ├── wraps → useAnalysisStep (submission + SignalR tracking)
    └── renders → step-specific content (children)

useWorkflowAutoSave
    ├── reads → current step state from Redux
    ├── calls → saveDraftStep thunk
    └── guards → isSavingRef (prevents concurrent saves)
```
