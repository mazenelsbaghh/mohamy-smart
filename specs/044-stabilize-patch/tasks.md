# Tasks: Phase 0 — Stabilize & Patch

**Input**: Design documents from `/specs/044-stabilize-patch/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Active User Stories** (after research descoping):
- US1: Security Verification (P1) — verification only, no code changes
- US2: Auto-save Race Condition Fix (P1)
- US3: Branch 043 Compilation Stability (P1)
- US4: Remove console.log (P2)
- ~~US5: Dead Redux Code~~ — **DESCOPED** (actively used, see research.md)
- US6: Forgot Password Unavailability Notice (P3)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file path(s) in descriptions

---

## Phase 1: Setup

**Purpose**: Verify current branch state and establish baseline

- [x] T001 Verify backend compiles by running `dotnet build` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/`
- [x] T002 Verify frontend compiles by running `npm run build` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational blockers — all user stories operate on independent files and can begin immediately after Phase 1.

**⚠️ Note**: Phase 1 may reveal compilation errors that must be fixed before proceeding. If so, fix them as part of US3.

**Checkpoint**: Build verification complete — user story implementation can now begin.

---

## Phase 3: User Story 1 — Security Verification (Priority: P1) 🎯

**Goal**: Confirm that the AppealBriefService case ownership check is already in place. No code changes needed.

**Independent Test**: Send a cross-lawyer case access request to the Appeal Brief endpoint. The system must return a 403 Forbidden.

### Implementation for User Story 1

- [x] T003 [US1] Verify `AppealBriefService` constructor receives `ICaseAccessValidator` parameter in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/AppealBriefService.cs` — confirm line 28 passes `caseAccessValidator` to base class
- [x] T004 [US1] Verify `WorkflowServiceBase.StartWorkflowBaseAsync()` calls `_caseAccessValidator.ValidateAsync(caseId, lawyerId, ct)` before creating a workflow in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/Workflows/WorkflowServiceBase.cs` — confirm lines 63-69
- [x] T005 [US1] Verify `CaseAccessValidator.ValidateAsync()` checks `caseEntity.LawyerId != lawyer.Id` and returns Forbidden in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/CaseAccessValidator.cs` — confirm lines 56-57

**Checkpoint**: Security verification complete — AppealBriefService ownership check confirmed with zero code changes.

---

## Phase 4: User Story 2 — Auto-save Race Condition Fix (Priority: P1)

**Goal**: Add `isSaving` mutual-exclusion guard to `useWorkflowAutoSave` hook, fix unmount cleanup, and add silent error retry.

**Independent Test**: In any workflow step, trigger manual save while auto-save debounce is pending. Only one save request should reach the server.

### Implementation for User Story 2

- [x] T006 [US2] Add `isSavingRef = useRef(false)` to `useWorkflowAutoSave` hook and check it at the start of `flush()` — if `isSavingRef.current === true`, return early without saving in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts`
- [x] T007 [US2] Set `isSavingRef.current = true` before `await onSave(payload)` and reset to `false` in a `finally` block inside `flush()` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts` (depends on T006)
- [x] T008 [US2] Wrap `await onSave(payload)` in try/catch inside `flush()` — on catch, restore `pendingPayloadRef.current = payload` so the failed payload retries on next debounce cycle (silent retry per FR-013) in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts` (depends on T007)
- [x] T009 [US2] Change unmount `useEffect` cleanup (lines 49-57) to call `cancel()` instead of `flush()` — unmount should discard pending saves, not attempt async flush during teardown, in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts` (depends on T008)
- [x] T010 [US2] Export `isSaving: isSavingRef.current` as a read-only boolean from the hook's return object `{ debouncedSave, flush, cancel, isSaving }` so consuming components can disable manual save buttons while a save is in-flight, in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/hooks/useWorkflowAutoSave.ts` (depends on T009)

**Checkpoint**: Auto-save race condition fixed. Manual and automatic saves are mutually exclusive. Failed saves retry silently. Unmount cancels pending debounce.

---

## Phase 5: User Story 3 — Branch Compilation Stability (Priority: P1)

**Goal**: Ensure branch 043 compiles cleanly on both backend and frontend. Resolve any untracked files and apply pending migrations.

**Independent Test**: Run `dotnet build` and `npm run build` — both must exit with code 0.

### Implementation for User Story 3

- [x] T011 [US3] Run `git status` and resolve any remaining untracked files by either staging/committing them or deleting them — working directory at `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/`
- [x] T012 [US3] Apply all pending EF Core migrations by running `dotnet ef database update` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/` (or via `make db-migrate`) and verify the model snapshot is consistent
- [x] T013 [US3] Run `dotnet build` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/` and fix any compilation errors that arise from the branch 043 changes
- [x] T014 [US3] Run `npm run build` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/` and fix any TypeScript or bundling errors that arise from the branch 043 changes (depends on T013)

**Checkpoint**: Branch compiles cleanly. All files tracked. Migrations applied. Ready for code review.

---

## Phase 6: User Story 4 — Remove console.log Statements (Priority: P2)

**Goal**: Remove all 3 `console.log` statements from production frontend source files.

**Independent Test**: Run `grep -r "console.log" mohamy-smart-lawyer-dashboard/src --include="*.tsx" --include="*.ts"` — must return zero results.

### Implementation for User Story 4

- [x] T015 [P] [US4] Remove `console.log('tasks ::', tasks);` on line 37 and `console.log(task)` on line 66 in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/tasks/TasksPage.tsx`
- [x] T016 [P] [US4] Replace `console.log(data)` with a no-op `void data;` in the `onSubmit` handler on line 20 in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/forms/AddNewContractsForm.tsx`
- [x] T017 [US4] Verify zero `console.log` statements remain by running `grep -rn "console.log" mohamy-smart-lawyer-dashboard/src --include="*.tsx" --include="*.ts"` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/` (depends on T015, T016)

**Checkpoint**: Zero `console.log` statements in production frontend code.

---

## Phase 7: User Story 6 — Forgot Password Unavailability Notice (Priority: P3)

**Goal**: Replace the non-functional Forgot Password form with a clear Arabic unavailability message.

**Independent Test**: Navigate to `/auth/forgot-password` in the Lawyer Dashboard. The page must show a notice instead of a form.

### Implementation for User Story 6

- [x] T018 [US6] Replace the form body in `ForgotPassword.tsx` with an Arabic unavailability notice: "هذه الخاصية غير متاحة حالياً. يرجى التواصل مع المسؤول لإعادة تعيين كلمة المرور." — keep the back-link to `/auth/login`, remove the `<form>`, `<Input>`, submit `<button>`, and the `onSubmit` handler in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/auth/ForgotPassword.tsx`
- [x] T019 [US6] Remove unused imports: `useState`, `useForm`, `zodResolver`, `forgotPasswordSchema`, `HiOutlinePhone`, and `SubmitHandler` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/pages/auth/ForgotPassword.tsx` (depends on T018)
- [x] T020 [US6] Verify the Forgot Password page renders the unavailability notice and does not allow form submission by running `npm run build` and confirming no TypeScript errors in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/` (depends on T019)

**Checkpoint**: Forgot Password page displays unavailability notice. No form submission possible.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories.

- [x] T021 Run full backend build verification: `dotnet build` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/` — must exit with code 0
- [x] T022 Run full frontend build verification: `npm run build` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/` — must exit with code 0 (depends on T021)
- [x] T023 Run final `console.log` search to confirm zero matches: `grep -rn "console.log" mohamy-smart-lawyer-dashboard/src --include="*.tsx" --include="*.ts"` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/` (depends on T022)
- [x] T024 Run `git status` from `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/` — working tree must be clean (all changes staged/committed)
- [x] T025 Update spec.md status from "Draft" to "Complete" in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/specs/044-stabilize-patch/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **User Stories (Phase 3-7)**: Can begin after Phase 1, but US3 should ideally run first to establish a clean build baseline
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Security Verification)**: Independent — verification only, no code changes
- **US2 (Auto-save Fix)**: Independent — single file (`useWorkflowAutoSave.ts`)
- **US3 (Build Stability)**: Independent — may need to run first if builds are currently broken
- **US4 (console.log Removal)**: Independent — touches different files than US2/US3
- **US6 (Forgot Password)**: Independent — single file (`ForgotPassword.tsx`)

### Within Each User Story

- Tasks within a story are ordered by dependency
- [P] tasks within the same story can run in parallel

### Parallel Opportunities

```
After Phase 1 completes, all of these can run simultaneously:

  US1 (T003-T005)  ─┐
  US2 (T006-T010)  ─┤── all independent, different files
  US4 (T015-T017)  ─┤
  US6 (T018-T020)  ─┘

  US3 (T011-T014) should run first if builds are broken,
  otherwise can run in parallel too.
```

---

## Implementation Strategy

### MVP First (Recommended Order)

1. Complete Phase 1: Verify current build state
2. If builds fail → US3 first (fix compilation)
3. US2: Fix auto-save race condition (highest-impact code change)
4. US4: Remove console.log (quick win)
5. US6: Forgot Password notice (quick win)
6. US1: Security verification (confirm, no code needed)
7. Phase 8: Final polish and validation

### Incremental Delivery

1. After US2 → Branch is safer for concurrent use
2. After US3 → Branch is merge-ready (compiles cleanly)
3. After US4 + US6 → Branch is production-clean
4. After Phase 8 → Branch is fully validated and ready for review

---

## Notes

- US5 (Dead Redux Code) is **DESCOPED** — the `rulingAnalysisAiSlice.ts` is actively used by 5 components
- US1 requires **no code changes** — it's a verification task confirming the fix is already in place
- The auto-save fix (US2) is the **most impactful code change** in this phase — all other tasks are small patches
- All tasks touch the **frontend only** — zero backend code changes are needed
- Total: **25 tasks** across 8 phases (including setup and polish)
