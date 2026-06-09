# Walkthrough: Proactive OCR Subscription and Quota Verification

We have implemented proactive checks and refined error handling for the OCR flow in the lawyer dashboard to ensure that subscription issues and quota shortages are caught early and displayed clearly.

## Changes Made

### Lawyer Dashboard

#### [Documents.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/Documents/Documents.tsx)
- Added `aiPointBalance` and `subscriptionError` selection from the Redux `subscription` slice.
- Implemented a `validateOcrAccess` helper callback to:
  - Check if there is an active subscription error.
  - Check if `subscriptionActive` is false and show a friendly Arabic warning.
  - Check if `available` points are less than 1 and show a friendly Arabic warning.
  - Fetch balance asynchronously if not already loaded, checking the results inline.
- Integrated `validateOcrAccess` at the very beginning of `handleFileChange` when a PDF or image file requiring OCR is selected.
- Cleared the input file element (`e.target.value = ""`) when validation fails to allow the user to choose another file.
- Updated the `catch (errorMessage)` block in `handleUpload` to detect quota or subscription-specific error keywords (`"اشتراك"`, `"نقاط"`, `"رصيد"`), rendering the error message directly without the generic wrapper text.

---

## Verification Results

### Linting
- Executed `npm run lint` which successfully passed with **zero** issues across all workspaces.

### Type-Checking & Building
- Executed `npm run type-check` which verified successful compilation.
- Executed `npx turbo run build --filter=@mohamy/lawyer-dashboard` which completed successfully and compiled the production build assets.
