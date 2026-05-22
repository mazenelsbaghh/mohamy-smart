# Plan: Toggle Lawyer Status (Suspended / Active) Button

Introduce an explicit action button on both the Lawyers List page and the Lawyer Details page in the admin dashboard to toggle the status of a lawyer between Active (نشط) and Suspended (موقوف), and fix the backend identifier query mismatch.

## User Review Required

> [!IMPORTANT]
> - **Backend Identification Fix**: The status update endpoint in the backend was previously looking up the lawyer entity using `Lawyer.Id == lawyerId`. However, the frontend passes the `ApplicationUser.Id` (User ID). We will update the backend repository query to check both `Lawyer.Id` and `Lawyer.ApplicationUserId` to handle both cases cleanly.
> - **Redux State Update Mismatch**: The `updateLawyerStatus` thunk in Redux was expected to return a `TUser` object, but the backend PATCH endpoint actually returns a success string message. This caused a mismatch and prevented the status from updating instantly in the list. We will adjust the thunk to return `{ id, isActive }` directly and update the Redux slice to update only the `isActive` state of the targeted lawyer.

## Proposed Changes

### Backend Component

#### [MODIFY] [AdminLawyerService.cs](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/mohamy-smart-backend/Lawyer.Application/Services/AdminLawyerService.cs)
- Update `UpdateLawyerStatusAsync` to query the lawyer entity checking both `l.Id` and `l.ApplicationUserId`:
  ```csharp
  var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
      .FirstOrDefaultAsync(l => l.Id == lawyerId || l.ApplicationUserId == lawyerId, cancellationToken, l => l.ApplicationUser);
  ```

---

### Admin Dashboard Component

#### [MODIFY] [updateLawyerStatus.ts](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/redux/lawyers/thunk/updateLawyerStatus.ts)
- Modify the thunk return type to `{ id: string; isActive: boolean }`.
- Modify the API call return value to return `{ id: data.id, isActive: data.isActive }` on success, ignoring the string response from the backend.

#### [MODIFY] [lawyersSlice.ts](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/redux/lawyers/lawyersSlice.ts)
- Add `isUpdatingStatus` to the `TLawyersState` type and `initialState`.
- Update `updateLawyerStatus` extraReducers to:
  - Set `isUpdatingStatus` to `true` on `.pending`.
  - Update `isActive` in `state.list` and `state.selectedLawyer` on `.fulfilled`.
  - Set `isUpdatingStatus` to `false` on `.fulfilled` and `.rejected`.

#### [MODIFY] [Lawyers.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/pages/lawyers/Lawyers.tsx)
- Modify the table columns to add an `actions` column (`الإجراءات`).
- Keep the `status` column as a read-only badge indicating status (no click handler).
- Add the `actions` column to `tableData` mapping, rendering a `@heroui/react` `Button` to activate/suspend:
  - If `isActive` is `true`, render a red button/badge labeled "إيقاف".
  - If `isActive` is `false`, render a green button/badge labeled "تنشيط".
  - Ensure `onClick` stops propagation (`e.stopPropagation()` and `e.preventDefault()`) so that row click details navigation is not triggered.

#### [MODIFY] [LawyerDetails.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/admin-dashboard/src/pages/lawyers/LawyerDetails.tsx)
- Import `updateLawyerStatus` thunk.
- Extract `isUpdatingStatus` from `state.lawyers` Redux state.
- Add an action button next to the existing action buttons (top-right of profile header) to activate/suspend the lawyer:
  - If `lawyer.isActive` is `true`, display a red button labeled "إيقاف الحساب".
  - If `lawyer.isActive` is `false`, display a green button labeled "تنشيط الحساب".
  - Set `isLoading={isUpdatingStatus}` on the button.

## Verification Plan

### Manual Verification
- Log in to the admin dashboard, navigate to the lawyers list (`/lawyers`).
- Check a lawyer who is `موقوف` (Suspended) and click "تنشيط" (Activate).
- Verify the status badge updates to `نشط` (Active) immediately and the button changes to "إيقاف" (Suspend).
- Click on the row to navigate to details.
- Toggle status from the details page and verify the header status badge updates instantly.
