# Plan - Auth Pages Redesign (Paymob Style with Mohamy Smart Identity)

Redesign the Login and Register (SignUp) pages of the lawyer dashboard to match the layout and features requested by the user (similar to Paymob's split-screen design), customized with the Mohamy Smart brand identity (orange primary `#EF950A`, native RTL, dark/light mode support, premium look).

## Proposed Changes

### Component: Lawyer Dashboard Auth Layout and Pages

---

#### [MODIFY] [AuthLayout.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/auth/AuthLayout.tsx)
- Add mock language indicator at the top left of the form panel (`auth-lang-switcher` with a `Globe` icon).
- Verify/refine features list structure and layout elements.

#### [MODIFY] [Auth.css](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/auth/Auth.css)
- Update `.auth-visual-panel` to use a vibrant Orange/Amber gradient (`linear-gradient(135deg, #f5d77f 0%, #EF950A 50%, #D46200 100%)`) with glowing radial accents.
- Change feature list icon wrappers (`.auth-feature-icon-wrapper`) to solid white circles/squares with orange icons inside, creating high-contrast modern blocks that pop.
- Customize the background watermark "م" to a soft transparent white (`rgba(255, 255, 255, 0.08)`) so it aligns with the bright orange gradient.
- Add specific styling for HeroUI's `InputOtp` segments in `.auth-otp-wrapper` (generous 3.5rem x 3.5rem square boxes, custom borders, placeholder dots when empty, orange highlights on focus) to match the screenshot's OTP inputs.
- Add support for `.auth-welcome-title-large` and `.auth-back-btn-row` to restructure headings.

#### [MODIFY] [Login.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/auth/Login.tsx)
- Reorganize headers: Place "مرحبًا بك في محامي سمارت" at the top in a large font, then a separate line/row for the back button, followed by the large bold "تسجيل الدخول" heading and subtitle.

#### [MODIFY] [SignUp.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/auth/SignUp.tsx)
- Reorganize headers: Place "ابدأ رحلتك مع محامي سمارت" at the top in a large font, then a separate line/row for the back button, followed by the large bold "إنشاء حساب جديد" heading and subtitle.

#### [MODIFY] [VerifyPhone.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/auth/VerifyPhone.tsx)
- Reorganize headers: Place "تأكيد الحساب في محامي سمارت" at the top, then a separate line/row for the back button, followed by the large bold "تأكيد رقم الهاتف" heading and subtitle.
- Verify `InputOtp` integration and ensure it maps to the custom styling rules.

#### [MODIFY] [ForgotPassword.tsx](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/apps/lawyer-dashboard/src/pages/auth/ForgotPassword.tsx)
- Reorganize headers: Place "استعادة الحساب في محامي سمارت" at the top, then a separate line/row for the back button, followed by the large bold "نسيت كلمة المرور؟" heading and subtitle.

## Verification Plan

### Automated Tests
- Run `npm test` and `npm run lint` inside `apps/lawyer-dashboard/`.

### Manual Verification
- Visual inspection of the Login, Register, Forgot Password, and Phone Verification pages on desktop, tablet, and mobile.
- Verify dark and light mode styling for both form inputs and brand components.
