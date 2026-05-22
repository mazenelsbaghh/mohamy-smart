# Mohamy Smart Mobile Page Architecture

## 1. Platform Type

Mobile app, Arabic RTL first, with light and dark mode parity.

## 2. Product Type

Premium legal-tech mobile app for Gulf/MENA lawyers. The mobile product is a daily-practice companion, not a compressed admin dashboard. Admin-heavy monitoring, platform operations, and large analytics remain better suited to web/admin.

## 3. Quick Experience Summary

Mohamy Smart Mobile helps lawyers check urgent work, manage cases and clients, follow sessions, upload documents, and run AI-assisted legal workflows from the phone. The experience should feel refined, precise, and calm: fast access to the next legal action, clear AI point visibility, and minimal visual noise.

Primary assumptions:
- Main user: practicing lawyer.
- Language: Arabic.
- Direction: RTL-native.
- Quality level: premium, functional, high-trust.
- Subscription and AI points are visible because workflow generation consumes points.

## 4. Complete Page Map

1. Splash
2. Onboarding
3. Login
4. Sign Up
5. Forgot Password
6. OTP Verification
7. Home Dashboard
8. Cases List
9. Add Case
10. Case Details
11. AI Workflow Hub
12. AI Workflow Runner
13. Clients List
14. Client Details
15. Agenda
16. Documents
17. Legal Library
18. Legal Contracts
19. Process Server Papers
20. Chat
21. Notifications
22. Subscription and AI Points
23. Settings and Profile
24. Empty/Error/Offline States

## 5. Detailed Page-by-Page Breakdown

### 1. Splash
- Purpose: Brand loading and auth/session routing.
- Page type: Primary entry.
- Target user: Lawyer opening the app.
- Main goal: Reach the correct next screen quickly.
- Components: Center logo, short brand line, loading indicator.
- Content: "محامي سمارت", "إدارة قانونية أكثر دقة".
- Actions: None.
- States: loading, offline, version-blocked.
- UX notes: Keep under 1.5 seconds unless session refresh is required.
- UI notes: Full-screen warm neutral canvas, small amber loading mark.
- Connections: Opens to onboarding, login, or home.

### 2. Onboarding
- Purpose: Explain value before account access.
- Page type: Conversion.
- Target user: New lawyer.
- Main goal: Understand core benefits and continue.
- Components: 3 swipe cards, skip, next, create account CTA.
- Content: case control, AI drafting, agenda and documents.
- Actions: Continue, Skip, Create account, Login.
- States: active slide, completed.
- UX notes: Avoid long marketing language; each slide has one clear point.
- UI notes: Thumb-friendly bottom controls, page dots.
- Connections: Splash to login/signup.

### 3. Login
- Purpose: Authenticate returning lawyers.
- Page type: Auth.
- Target user: Existing lawyer.
- Main goal: Sign in safely.
- Components: Phone/email field, password field, remember toggle, forgot password, login button.
- Content: "تسجيل الدخول", "أهلا بعودتك".
- Actions: Login, Forgot password, Create account.
- States: normal, loading, validation error, auth error.
- UX notes: Phone keyboard by default if phone login is primary.
- UI notes: Form below brand header, primary button fixed near thumb zone.
- Connections: Onboarding/signup to home.

### 4. Sign Up
- Purpose: Create lawyer account.
- Page type: Auth/conversion.
- Target user: New lawyer.
- Main goal: Register with required legal profile basics.
- Components: Name, phone, email, password, license number, city, terms checkbox.
- Content: "إنشاء حساب محام", "ابدأ تنظيم مكتبك القانوني".
- Actions: Create account, Login, View terms.
- States: normal, loading, field error, success.
- UX notes: Split into compact steps if license fields expand.
- UI notes: Progressive form, clear required markers.
- Connections: Onboarding/login to OTP.

### 5. Forgot Password
- Purpose: Recover account access.
- Page type: Auth.
- Target user: Existing lawyer.
- Main goal: Receive reset code.
- Components: Phone/email field, send code button, back to login.
- Content: "استعادة كلمة المرور".
- Actions: Send code, Back.
- States: normal, loading, error, success.
- UX notes: Explain where the code will be sent.
- UI notes: Single-purpose screen with no distractions.
- Connections: Login to OTP/reset.

### 6. OTP Verification
- Purpose: Verify phone or reset flow.
- Page type: Auth.
- Target user: New or returning lawyer.
- Main goal: Enter code and continue.
- Components: 6-digit OTP inputs, timer, resend, verify button.
- Content: "تأكيد رقم الجوال", "أدخل رمز التحقق".
- Actions: Verify, Resend code.
- States: normal, invalid code, expired, loading.
- UX notes: Auto-focus and paste support.
- UI notes: Large numeric boxes, clear timer.
- Connections: Sign up/forgot password to home/login.

### 7. Home Dashboard
- Purpose: Daily command center.
- Page type: Primary.
- Target user: Lawyer.
- Main goal: See urgent work and start common actions.
- Components: Greeting, AI points pill, quick actions, today sessions, active cases, recent AI jobs.
- Content: "صباح الخير، أستاذ مازن", "جلسات اليوم", "القضايا النشطة".
- Actions: Add case, Start AI draft, Upload document, Open session.
- States: normal, empty, loading, partial data.
- UX notes: Show next legal action first, not raw totals only.
- UI notes: Dense but calm cards; no large decorative hero.
- Connections: Bottom nav to core tabs; cards deep-link to details.

### 8. Cases List
- Purpose: Browse and search cases.
- Page type: Primary list.
- Target user: Lawyer.
- Main goal: Find a case quickly.
- Components: Search, filters, case cards, status chips, FAB add case.
- Content: case number, client, court, next session, status.
- Actions: Search, filter, add case, open case.
- States: normal, empty, loading, no results, error.
- UX notes: Recent and urgent cases should appear first by default.
- UI notes: Card list instead of web table.
- Connections: Home/bottom nav to case details/add case.

### 9. Add Case
- Purpose: Create case manually or via OCR.
- Page type: Secondary form.
- Target user: Lawyer or office staff.
- Main goal: Capture minimum viable case data.
- Components: segmented mode manual/OCR, fields, upload area, client picker.
- Content: "إضافة قضية", "بيانات المحكمة", "بيانات الخصوم".
- Actions: Save, Scan document, Add client, Cancel.
- States: normal, draft saved, validation error, upload loading.
- UX notes: Autosave drafts and let the lawyer complete later.
- UI notes: Stepper form with bottom sticky save.
- Connections: Cases list to case details.

### 10. Case Details
- Purpose: Single case workspace.
- Page type: Detail.
- Target user: Lawyer.
- Main goal: Understand status and act.
- Components: Case header, tabs, timeline, documents, facts, sessions, AI actions.
- Content: case metadata, next hearing, client, facts, outputs.
- Actions: Start AI workflow, add fact, upload document, add session.
- States: normal, missing documents, loading, error.
- UX notes: Put next session and AI-ready status above lower details.
- UI notes: Sticky compact header and horizontal tabs.
- Connections: Cases list to workflow/documents/agenda/client.

### 11. AI Workflow Hub
- Purpose: Choose legal AI task for a case.
- Page type: Secondary action hub.
- Target user: Lawyer.
- Main goal: Pick the correct drafting/analysis workflow.
- Components: Case readiness banner, workflow cards, point costs, recent outputs.
- Content: defense memo, statement of claims, appeal brief, ruling analysis, legal warning, exec request, admin complaint.
- Actions: Start, Resume, View output, Buy points.
- States: normal, insufficient points, missing documents, running job.
- UX notes: Disable unavailable workflows with exact reason.
- UI notes: Cards sorted by relevance; point cost visible but not alarming.
- Connections: Case details to workflow runner/subscription.

### 12. AI Workflow Runner
- Purpose: Complete multi-step AI generation.
- Page type: Core workflow.
- Target user: Lawyer.
- Main goal: Review facts, run AI, edit, export.
- Components: stepper, selected facts, document picker, generated result, autosave, progress status.
- Content: "اختيار المستندات", "مراجعة الوقائع", "تشغيل التحليل", "المخرجات".
- Actions: Continue, Run, Pause, Resume, Export PDF/DOCX, Copy.
- States: draft, loading, streaming/running, paused, failed, completed.
- UX notes: Preserve progress and explain point deduction before run.
- UI notes: One primary action per step; bottom action bar.
- Connections: AI hub to documents/output/subscription.

### 13. Clients List
- Purpose: Manage clients.
- Page type: Primary list.
- Target user: Lawyer.
- Main goal: Find client and related cases.
- Components: Search, client cards, recent activity, add client FAB.
- Content: name, phone, case count, last activity.
- Actions: Call, WhatsApp, add client, open details.
- States: normal, empty, loading, no results.
- UX notes: Contact actions must be immediate and thumb-friendly.
- UI notes: Cards with avatar initials and small metadata.
- Connections: Bottom nav/home to client details/add case.

### 14. Client Details
- Purpose: Client workspace.
- Page type: Detail.
- Target user: Lawyer.
- Main goal: View client context and cases.
- Components: profile header, contact actions, cases, documents, notes.
- Content: client data, linked cases, balances/notes if present.
- Actions: Call, message, add case, edit client.
- States: normal, no cases, loading, error.
- UX notes: Keep personal/contact info easy to verify.
- UI notes: Contact buttons as icons with labels.
- Connections: Clients list/case details to cases/documents.

### 15. Agenda
- Purpose: Track sessions and deadlines.
- Page type: Primary calendar.
- Target user: Lawyer.
- Main goal: Know what happens today and upcoming.
- Components: date strip, agenda list, filters, add session.
- Content: hearing time, court, case, task status.
- Actions: Add session, mark done, open case, set reminder.
- States: today, empty day, loading, overdue.
- UX notes: Day list beats monthly grid on mobile.
- UI notes: Sticky date strip and grouped cards.
- Connections: Home/bottom nav to case details.

### 16. Documents
- Purpose: Store and retrieve legal files.
- Page type: Primary library.
- Target user: Lawyer.
- Main goal: Upload/find documents.
- Components: upload CTA, search, filters, document cards, scan option.
- Content: file name, case/client, type, date, OCR status.
- Actions: Upload, scan, open, share, attach to case.
- States: normal, uploading, OCR processing, empty, error.
- UX notes: Show OCR/AI readiness clearly.
- UI notes: File-type icons and compact cards.
- Connections: Bottom nav/case details to AI workflow.

### 17. Legal Library
- Purpose: Access calculators and legal references.
- Page type: Secondary hub.
- Target user: Lawyer.
- Main goal: Use quick legal tools.
- Components: tool cards, search, recent references.
- Content: inheritance calculator, court fees, power of attorneys, internal regulations.
- Actions: Open tool, search regulations, save reference.
- States: normal, loading, no results.
- UX notes: Keep tools searchable and grouped by practical need.
- UI notes: 2-column tool grid on large phones, 1-column on small.
- Connections: More tab/home to specific tools.

### 18. Legal Contracts
- Purpose: Manage and generate contract drafts.
- Page type: Secondary/core feature.
- Target user: Lawyer.
- Main goal: Create or review contracts.
- Components: contract list, templates, filters, AI suggestion block.
- Content: contract title, parties, status, updated date.
- Actions: New contract, open, duplicate, export.
- States: normal, empty, generating, error.
- UX notes: Separate templates from existing drafts.
- UI notes: Tabs for "العقود" and "القوالب".
- Connections: More tab/home to contract details/form.

### 19. Process Server Papers
- Purpose: Track process server papers.
- Page type: Secondary list.
- Target user: Lawyer.
- Main goal: Monitor delivery and required follow-up.
- Components: status filters, paper cards, date badges, add paper.
- Content: recipient, case, delivery status, deadline.
- Actions: Add, update status, open case.
- States: normal, overdue, completed, empty.
- UX notes: Overdue items need clear priority.
- UI notes: Status chips and timeline affordance.
- Connections: More tab/case details.

### 20. Chat
- Purpose: AI/legal assistant conversation.
- Page type: Primary utility.
- Target user: Lawyer.
- Main goal: Ask legal or workflow questions.
- Components: chat list, message composer, attachments, suggested prompts.
- Content: assistant replies, citations if available, linked case context.
- Actions: Send, attach document, use prompt, copy response.
- States: normal, typing, failed send, empty.
- UX notes: Make case context visible before sending.
- UI notes: High readability message bubbles, not playful.
- Connections: Bottom nav/case details/documents.

### 21. Notifications
- Purpose: Centralize alerts.
- Page type: Secondary.
- Target user: Lawyer.
- Main goal: See what needs attention.
- Components: grouped notification list, filters, unread count.
- Content: session reminders, AI job completed, subscription/point alerts.
- Actions: Mark read, open target, clear.
- States: unread, read, empty, loading.
- UX notes: Group by today/this week to reduce noise.
- UI notes: Subtle unread indicator with amber dot.
- Connections: Header bell to target screens.

### 22. Subscription and AI Points
- Purpose: Manage plan and AI balance.
- Page type: Conversion/settings.
- Target user: Lawyer/account owner.
- Main goal: Understand usage and buy/upgrade.
- Components: balance card, plan card, usage history, packages.
- Content: current plan, points remaining, renewal date, recent deductions.
- Actions: Upgrade, buy points, view invoice, contact support.
- States: normal, low balance, payment loading, payment success/error.
- UX notes: Explain why points were deducted in plain Arabic.
- UI notes: Strong balance card, restrained pricing cards.
- Connections: Settings/AI hub to payment modal.

### 23. Settings and Profile
- Purpose: Manage account, preferences, security.
- Page type: Settings.
- Target user: Lawyer.
- Main goal: Update profile and app preferences.
- Components: profile summary, sections, toggles, security actions.
- Content: personal data, firm info, notifications, theme, language, logout.
- Actions: Edit, change password, toggle dark mode, logout.
- States: normal, saving, validation error, success.
- UX notes: Dangerous actions at the bottom with confirmation.
- UI notes: Grouped list cells, not dense tables.
- Connections: More tab/home to auth after logout.

### 24. Empty/Error/Offline States
- Purpose: Consistent system feedback.
- Page type: System states.
- Target user: All lawyers.
- Main goal: Understand issue and recover.
- Components: icon, title, short explanation, primary retry/action.
- Content: no cases, no documents, offline, server error, insufficient points.
- Actions: Retry, add first item, contact support, buy points.
- States: empty, loading, error, offline, permission denied.
- UX notes: Every state must offer one next action.
- UI notes: Calm centered layout; no large illustrations.
- Connections: Used across all screens.

## 6. Navigation Structure

Use mixed navigation:
- Bottom navigation: الرئيسية، القضايا، الجلسات، المحادثة، المزيد.
- "More" sheet/list: العملاء، المستندات، المكتبة القانونية، العقود، أوراق المحضرين، الاشتراك، الإعدادات.
- Case details use top tabs: الملخص، الوقائع، المستندات، الجلسات، الذكاء الاصطناعي.
- AI workflow runner uses a stepper inside the screen, not bottom nav.
- Global header actions: search where relevant, notifications, AI points pill.

## 7. Design System Direction

- Visual style: refined, elegant, precise, professional legal workspace.
- Colors: `#EF950A` primary accent, `#F0EEE7` light canvas, `#FBFAE8` soft surface, `#1B1B1B` text, `#0A0A0A` dark canvas, `#1D1D1D` dark surface.
- Typography: Tajawal only; clear Arabic hierarchy.
- Buttons: primary amber filled, secondary warm cream, destructive red outline.
- Cards: 16-20px radius on mobile; 1px warm border; light tonal depth.
- Icons: lucide-style line icons, mirrored for RTL when directional.
- Density: mobile cards and lists, no web-like tables.
- Motion: subtle press, sheet, and progress transitions; respect reduced motion.

## 8. Content Style

Tone: formal, practical, concise, legal. The interface should speak like a capable office assistant.

Examples:
- "ابدأ مذكرة دفاع"
- "استكمال التحليل"
- "لا توجد جلسات اليوم"
- "الرصيد غير كاف لتشغيل هذا الإجراء"
- "تم حفظ المسودة تلقائيا"
- "افتح القضية"
- "أضف مستندا"

## 9. Priorities: MVP / Advanced

### MVP
- Splash
- Onboarding
- Login/Sign Up/Forgot Password/OTP
- Home Dashboard
- Cases List
- Add Case
- Case Details
- AI Workflow Hub
- AI Workflow Runner
- Clients List
- Client Details
- Agenda
- Documents
- Subscription and AI Points
- Settings and Profile
- Empty/Error/Offline States

### Later
- Legal Library
- Legal Contracts
- Process Server Papers
- Notifications
- Chat improvements beyond basic assistant

### Premium / Advanced
- Offline document queue
- Voice notes to case facts
- Push notification deep links
- AI workflow comparison/history
- Regulation-aware case recommendations
- Client portal handoff
- Advanced reporting on mobile

## 10. Smart UX Improvement Suggestions

- Add a persistent "next best action" on home and case details.
- Show AI readiness per case: documents present, facts present, points available.
- Use resumable workflows so lawyers can pause during court/meeting contexts.
- Make phone actions immediate on client cards.
- Put the AI point confirmation before expensive generation, not after selecting workflow.
- Prefer day agenda over full calendar grid on mobile.
- Use one global empty-state pattern so screens feel consistent.

## 11. Per-Page UI Design Prompt Files

Created in [page-prompts](/Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/docs/mobile-page-architecture/page-prompts).

