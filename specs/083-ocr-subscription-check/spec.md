# Feature Specification: Proactive OCR Subscription and Quota Verification

**Feature Branch**: `083-ocr-subscription-check`  
**Created**: 2026-06-09  
**Status**: Draft  
**Input**: User description: "عايز لو حصل ؛ده و هو بيعمل ocr ف الاول خالص يتقالوا مايظهرلوا حدق خطا فاهمني" (تحقق من الاشتراك والنفاط قبل الـ OCR وعرض خطأ واضح بدلاً من رسالة حدث خطأ)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Proactive Check for Inactive Subscription (Priority: P1)

As a lawyer with an expired/inactive subscription, when I select a PDF or image file requiring OCR, I want the system to immediately block the upload and show me a clear message indicating my subscription status instead of wasting time uploading or showing a generic error.

**Why this priority**: It is the most critical flow to prevent users with expired trial periods (like the 106 lawyers identified) from seeing confusing "حدث خطأ" messages during OCR.

**Independent Test**:
- Log in with a user whose subscription has expired (balance endpoint returns 400 Bad Request with "لا يوجد اشتراك نشط").
- Go to the Documents page.
- Select an image file.
- **Result**: The file is not processed or uploaded, and a toast error appears with: `"لا يوجد اشتراك نشط لاستخدام ميزات الذكاء الاصطناعي. يرجى تجديد الاشتراك لتتمكن من استخدام ميزة استخراج النصوص (OCR)."`

**Acceptance Scenarios**:
1. **Given** a lawyer has no active subscription, **When** they click "Upload" and choose an image or PDF, **Then** they receive a specific error toast and no upload starts.
2. **Given** a lawyer's subscription is active but they have 0 points, **When** they choose a PDF or image, **Then** they see a toast: `"رصيد نقاط الذكاء الاصطناعي الخاص بك غير كافٍ لاستخراج النصوص. يرجى شحن الرصيد أولاً."`

---

### User Story 2 - User-friendly API Error Rendering (Priority: P2)

As a lawyer whose points run out or whose subscription status changes during a session, when the OCR extraction API call fails due to a subscription/quota restriction, I want to see the specific backend error message directly instead of seeing a generic "حدث خطأ أثناء استخراج النصوص" wrapper.

**Why this priority**: It ensures that even if a proactive check was bypassed (e.g. state changed mid-session), the final error presentation is clear and helpful.

**Independent Test**:
- Attempt OCR and intercept the request to return 400 with a custom error message like `"رصيد النقاط غير كافٍ لاستخراج النص من المستندات."`
- **Result**: The UI displays the toast with exactly `"رصيد النقاط غير كافٍ لاستخراج النص من المستندات."` without any generic prefixes.

**Acceptance Scenarios**:
1. **Given** the OCR thunk fails with a string error containing `"اشتراك"` or `"نقاط"` or `"رصيد"`, **When** the error is caught, **Then** the toast shows that string error directly.

---

### Edge Cases

- **Word Files Uploaded**: Word files (.docx) do not require OCR and are processed client-side. The proactive OCR checks should NOT block Word uploads.
- **API Offline/Slow**: If the point balance state is null and fails to fetch, the system should show the actual fetch error to the user rather than letting them upload and fail late.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST identify if any selected files in the file input require OCR (specifically images and PDFs).
- **FR-002**: System MUST check the subscription and points balance state (`aiPointBalance` and `error` in `state.subscription`) before starting PDF conversion or image upload.
- **FR-003**: If the subscription state is not yet loaded, the system MUST dispatch `thunkGetAiPointBalance` and await the results before proceeding with OCR processing.
- **FR-004**: If subscription validation fails:
  - If `aiPointBalance.subscriptionActive` is `false` or subscription error indicates no active subscription, show: `"لا يوجد اشتراك نشط لاستخدام ميزات الذكاء الاصطناعي. يرجى تجديد الاشتراك لتتمكن من استخدام ميزة استخراج النصوص (OCR)."`
  - If `aiPointBalance.available < 1`, show: `"رصيد نقاط الذكاء الاصطناعي الخاص بك غير كافٍ لاستخراج النصوص. يرجى شحن الرصيد أولاً."`
- **FR-005**: If the OCR thunk rejects with an error message containing subscription or points related keywords (`"اشتراك"`, `"نقاط"`, `"رصيد"`), the system MUST display the exact error message via `sileo.error` without appending generic prefixes.

### Key Entities

- **AiPointBalance**: Contains `subscriptionActive` (boolean) and `available` (number of available points).
- **SubscriptionError**: Error message string returned from the balance API when the lawyer has no active subscription.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of OCR uploads by lawyers with inactive subscriptions are blocked immediately at the client side.
- **SC-002**: 100% of subscription or quota-related errors are presented directly to the user in their specific Arabic format without generic "حدث خطأ" prefixes.

## Assumptions

- Lawyers must be logged in to access the Documents page, so their authentication is active.
- The balance endpoint `/Subscription/ai-points/balance` is reliable and handles standard session requests.
