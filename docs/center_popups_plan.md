# Plan: Center All Popups (Modals) Across Lawyer and Admin Dashboards

## Goal
Ensure that every modal/popup across both the Lawyer Dashboard and the Admin Dashboard is centered on all viewports (especially on mobile), has proper margins (e.g. `mx-4 my-4`), and consistent rounded-3xl corners. Currently, they display as "bottom sheets" or flat overlays at the bottom of the screen on mobile devices.

## Proposed Changes

### Lawyer Dashboard

#### [MODIFY] [FormModal.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/components/ui/form/FormModal.tsx)
- Change `wrapper` class from `items-end sm:items-center` to `items-center` to center it on all screens.
- Change `base` class from `rounded-none sm:rounded-3xl mx-0 sm:mx-4 my-0 sm:my-4` to `rounded-3xl mx-4 my-4` to enforce borders, rounded corners, and margins on mobile.
- Keeps `placement="center"`.

#### [MODIFY] [ChangePhoneModal.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/settings/subPagesSettings/ChangePhoneModal.tsx)
- Add `placement="center"` and `classNames={{ base: "rounded-3xl mx-4 my-4" }}` to center and style it on mobile.

#### [MODIFY] [ConfirmDialog.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/components/common/ConfirmDialog.tsx)
- Add `rounded-3xl mx-4 my-4` to the `base` key in `classNames`.

#### [MODIFY] [ClientDetails.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/clients/ClientDetails.tsx)
- Add `rounded-3xl mx-4 my-4` to the `base` key in `classNames` of the cancel POA Modal.

#### [MODIFY] [PowerOfAttorneysPage.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/legalLibrary/PowerOfAttorneysPage.tsx)
- Add `rounded-3xl mx-4 my-4` to the `base` key in `classNames` of the cancel POA Modal.

#### [MODIFY] [AiPointConfirmDialog.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/components/aiPoints/AiPointConfirmDialog.tsx)
- Add `classNames={{ base: "rounded-3xl mx-4 my-4" }}`.

### Admin Dashboard

#### [MODIFY] [PlansAndReview.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/pages/plansAndReview/PlansAndReview.tsx)
- Add `placement="center"` and `classNames={{ base: "rounded-3xl mx-4 my-4" }}` to both modals (edit and create plans).

#### [MODIFY] [ConfirmDialog.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/components/ui/modal/ConfirmDialog.tsx)
- Add `rounded-3xl mx-4 my-4` to the `base` key in `classNames`.

## Verification Plan
1. Run local linting/testing to verify no syntax errors.
2. Manually test modal behavior in dev mode on mobile emulator to ensure perfect centering and rounded borders.
