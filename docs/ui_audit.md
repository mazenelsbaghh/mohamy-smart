# UI Components Audit & Extraction Plan

## Overview
This document serves as the detailed audit required before extracting UI components from `admin-dashboard` and `lawyer-dashboard` to the shared `packages/shared-ui` package, fulfilling Phase 3 of the `PROJECT_AUDIT.md`.

## Current State Analysis

A scan of both dashboards reveals the following duplicated or overlapping components under `src/components/ui/`:

### 1. Duplicated Components (Candidates for Extraction)
*   **`IconButton.tsx`**: Exists in both dashboards. Almost identical wrapper around HeroUI's `Button`.
*   **`InputPassword.tsx`**: Exists in both. However, they have diverged:
    *   *Lawyer*: Extends `InputProps`, uses `startContent` for the toggle icon (likely an RTL adaptation), adds `variant="bordered"`.
    *   *Admin*: Custom props without extending `InputProps`, uses `endContent`.
*   **`InputSelect.tsx`**: Exists in both.
*   **`FilterSelect.tsx`**: Exists in both.
*   **`SearchInput.tsx`**: Exists in both.

### 2. Dashboard-Specific UI Components
*   **Lawyer Dashboard**:
    *   `form/` (FormModal, FormSection, FormFooter, ConfirmReviewBanner)
    *   `caseFile/` (CaseEmptyState, CaseNarrativeSection, CaseInfoCard)
    *   `lists/CustomList.tsx`
    *   `states/AsyncState.tsx`
    *   `table/DataTable.tsx`
*   **Admin Dashboard**:
    *   `table/PaginationTable.tsx`
    *   `table/ServerPaginationTable.tsx`

## Extraction Strategy

To safely extract components to `@mohamy/shared-ui`, we will:
1.  **Reconcile Diverged Components**: Combine the best parts of both implementations. For instance, `InputPassword` should extend `InputProps` from `@heroui/react` and use `endContent`/`startContent` flexibly based on a prop or CSS `rtl` context.
2.  **Update `shared-ui` Exports**: Move the reconciled components to `packages/shared-ui/src/components/ui/` and export them from `packages/shared-ui/src/index.ts`.
3.  **Refactor Dashboards**: Replace local imports with `@mohamy/shared-ui` across both applications.
4.  **Test**: Ensure both dashboards compile and render components correctly after the transition.

## Next Steps
1. ~~Move `IconButton.tsx` as the first test case.~~ (Done)
2. ~~Reconcile and move `InputPassword.tsx`, `SearchInput.tsx`, `InputSelect.tsx`, and `FilterSelect.tsx`.~~ (Done)
3. Evaluate extracting `table/DataTable.tsx` and `PaginationTable.tsx` into a unified `DataTable` component.
