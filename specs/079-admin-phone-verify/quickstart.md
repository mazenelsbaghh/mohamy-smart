# Quickstart: Admin Phone Verification Override

## Scenario 1: Verify an OTP-blocked Phone

1. Start the backend and admin dashboard using the normal local workflow.
2. Sign in to the admin dashboard as an admin.
3. Open `/lawyers`.
4. Select a lawyer whose phone status is not verified.
5. In the lawyer detail view, choose the manual phone verification action.
6. Enter a clear reason in Arabic, for example: `تعذر وصول OTP وتم التحقق من هوية المستخدم عبر الدعم`.
7. Confirm the action.
8. Expected result: the phone badge changes to verified, the action is no longer available, and the latest manual verification audit details are visible.

## Scenario 2: Missing Reason Is Rejected

1. Open an unverified lawyer detail view as an admin.
2. Open the manual phone verification action.
3. Leave the reason blank or whitespace-only.
4. Submit the form.
5. Expected result: the form blocks submission and the phone remains unverified.

## Scenario 3: Already Verified Phone Is Protected

1. Open a lawyer whose phone is already verified.
2. Review the account status area.
3. Expected result: the manual verification action is unavailable or shown as already complete.

## Scenario 4: Non-admin Attempt Is Rejected

1. Attempt the phone verification request without an admin session.
2. Expected result: the request is denied and the target user phone state is unchanged.

## Validation Notes

- Backend build completed successfully with existing warnings only.
- `AdminLawyerServiceTests` passed for detail loading, successful manual verification audit creation, blank reason rejection, and missing lawyer profile handling.
- Admin dashboard production build completed successfully.
- Admin dashboard lint completed successfully.
