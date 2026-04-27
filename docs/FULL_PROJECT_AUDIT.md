# تقييم شامل لمشروع محامي سمارت - Full Project Audit

**تاريخ التقييم:** 23 أبريل 2026  
**المُقيّم:** AI Code Review  
**النطاق:** الباك إند + الداشبورد الإداري + داشبورد المحامي + Landing Page + Shared Packages

---

## الملخص التنفيذي

تم رصد **+160 مشكلة** عبر المشروع بالكامل:

| المنطقة | Critical | High | Medium | Low | الإجمالي |
|---------|----------|------|--------|-----|----------|
| الباك إند (Backend) | 7 | 12 | 15 | 10+ | 44+ |
| Admin Dashboard | 5 | 8 | 10 | 8+ | 31+ |
| Lawyer Dashboard | 3 | 7 | 12 | 10+ | 32+ |
| Landing Page | 3 | 5 | 8 | 6+ | 22+ |
| Shared Packages | 1 | 3 | 5 | 3+ | 12+ |
| **الإجمالي** | **19** | **35** | **50** | **37+** | **141+** |

---

## 1. الباك إند (Backend) — .NET 9 / C# 13

### 1.1 ثغرات أمنية حرجة

| # | المشكلة | الملف | السطر |
|---|---------|-------|-------|
| S1 | **OTP يُطبع في اللوجات كنص واضح** — أي شخص عنده وصول للوجات يقدر يتخطى التحقق | `Lawyer.Application/Services/AuthService.cs` | 276, 674 |
| S2 | **مفتاح Google Vision API حقيقي مرفق في الكود** | `Lawyer/appsettings.example.json` | 9 |
| S3 | **بيانات SA للداتابيز مرفقة في الكود** (`sa` / `YourStrong!Passw0rd`) | `Lawyer/appsettings.Development.json` | 3 |
| S4 | **رسائل خطأ DbUpdateException تُرسل للكلنت** — تكشف أسماء الجداول والأعمدة | `Lawyer/Middlewares/ExceptionMiddleware.cs` | 55-56 |
| S5 | **Payment callback GET يعتمد على boolean من الكنترولر** بدون إعادة تحقق HMAC داخلي | `Lawyer/Controllers/PaymentController.cs` | 93-97 |

### 1.2 ثغرات أمنية عالية

| # | المشكلة | الملف |
|---|---------|-------|
| S6 | **Path Traversal في رفع الملفات** — `file.FileName` غير مُنظف من `../` | `Lawyer.Infrastracture/Services/FileUploadService.cs:36` |
| S7 | **مفيش فلترة نوع ملفات** — ممكن رفع `.exe`, `.js`, `.html` = Stored XSS | `FileUploadService.cs` |
| S8 | **VirusScanner يسمح بالرفع لو السكانر طفى** (لو `CLAMAV_STRICT=false`) | `VirusScannerService.cs:67` |
| S9 | **ExceptionMiddleware بيرجع BadRequest (400) داخل Status 500** — مُضلل | `ExceptionMiddleware.cs:62-63` |
| S10 | **Contact Submit بدون Rate Limit أو CAPTCHA** = Spam | `ContactController.cs:28` |

### 1.3 ثغرات أمنية متوسطة

| # | المشكلة | الملف |
|---|---------|-------|
| S11 | **JWT Cookie مش Secure في Development** | `AppControllerBase.cs:38` |
| S12 | **Refresh Token مش بيتمسح بعد تغيير الباسورد** | `AuthService.cs:924-932` |

### 1.4 مشاكل جودة الكود

| # | المشكلة | الملف |
|---|---------|-------|
| Q1 | **Namespace مش مطابق للفولدر** — `Lawyer.Infrastracture.Services.Identity` في `Lawyer.Application/Services/` | `AccountService.cs:23` |
| Q2 | **Namespace غلط من template** — `MyProject.Core.Validators.Auth` | `LoginValidator.cs:14` |
| Q3 | **Typo في اسم المشروع** — `Infrastracture` بدل `Infrastructure` | المشروع كله |
| Q4 | **Typo في Property** — `ExperinceNumber` بدل `ExperienceNumber` | `Lawyer.Core/Models/Lawyer.cs:15` |
| Q5 | **`ResolveLawyerIdAsync` مكرر 3+ مرات** | `CaseService.cs`, `ClientService.cs` |
| Q6 | **`BuildEmailTemplate` مكرر مرتين** (90 سطر) | `AuthService.cs:51`, `SubscriptionService.cs:371` |
| Q7 | **OTP Utilities مكررة** بين AuthService و AccountService | `GenerateOtp`, `HashOtp`, `MatchesOtp`, `MaskPhone` |
| Q8 | **Font File Handle Leak** — `File.OpenRead` بدون Dispose | `Program.cs:235-236` |
| Q9 | **Constructor Parameters مش مستخدمة** | `CaseController.cs:23`, `ClientController.cs:22` |
| Q10 | **Fire-and-forget AI tracking بدون Error Handling** | `SmartAnalysisService.cs:168,341,499,804` |

### 1.5 مشاكل Error Handling

| # | المشكلة | الملف |
|---|---------|-------|
| E1 | **مفيش Transaction في Case Creation** — 4 SaveChanges منفصلة = بيانات غير متسقة | `CaseService.cs:89-132` |
| E2 | **مفيش Try-Catch في CaseService.CreateCaseAsync** | `CaseService.cs:46-140` |
| E3 | **CancellationToken مش بتتباص لـ SaveChangesAsync** | `SmartAnalysisService.cs:231,366,830` |
| E4 | **AccountService.LogoutAsync يبلع الأخطاء بصمت** | `AccountService.cs:419-434` |
| E5 | **PaymobService `int.Parse` بدون Validation** | `PaymobService.cs:98` |
| E6 | **OcrController `catch { }` فاضي بالكامل** | `OcrController.cs:47-51` |
| E7 | **مفيش Handler لـ Forbidden (403)** في ExceptionMiddleware | `ExceptionMiddleware.cs` |

### 1.6 مشاكل الأداء

| # | المشكلة | الملف |
|---|---------|-------|
| P1 | **Correlated Subquery** — COUNT query لكل يوزر = N+1 problem | `AccountService.cs:140` |
| P2 | **4 Database Round Trips** لعملية إنشاء قضية واحدة | `CaseService.cs:89-132` |
| P3 | **PageSize مفيش حد أقصى** — `pageSize=999999` يحمل الكل | كل الـ Services |
| P4 | **PaymobService يحمل كل المدفوعات بدون Pagination** | `PaymobService.cs:437-456` |
| P5 | **SubscriptionService.GetAllPlansAsync بدون Pagination** | `SubscriptionService.cs:59-76` |
| P6 | **Prompt Files بتتقرأ من Disk في كل Request** — لازم تتكاش | `SmartAnalysisService.cs` (7 أماكن) |
| P7 | **ClientService.GetByIdAsync = 3 Queries منفصلة** | `ClientService.cs:79-115` |

### 1.7 مشاكل معمارية

| # | المشكلة | الملف |
|---|---------|-------|
| A1 | **ApiExceptionResponse injectable via DI** مع إنه Stateless — لازم يكون Static Utility | كل الـ Services |
| A2 | **Service Layer بي access HttpContext مباشرة** — مخالف لـ Clean Architecture | CaseService, ClientService, SmartAnalysisService, AccountService |
| A3 | **BaseEntity `CreatedBy`/`UpdatedBy` Required بس مفيش حد بيملاهم** | `BaseEntity.cs:22-33` |
| A4 | **GenericRepository بيدعم `int` بس** مع إن كل Entities بتستخدم Guid | `IGenericRepository.cs:13` |
| A5 | **SaveChangesAsync على Repository و UnitOfWork الاتنين** = لبس في الـ Transaction boundary | كل الـ Repos |
| A6 | **User ID Resolution مكرر في كل Controller** | معظم الـ Controllers |
| A7 | **مفيش CQRS** — SmartAnalysisService لوحده +960 سطر | `SmartAnalysisService.cs` |

### 1.8 مشاكل Validation

| # | المشكلة | الملف |
|---|---------|-------|
| V1 | **مفيش FluentValidation لـ CreateCaseDto / UpdateCaseDto** | `CaseController.cs:30-65` |
| V2 | **مفيش FluentValidation لـ CreateClientDto / UpdateClientDto** | `ClientController.cs:28-68` |
| V3 | **مفيش Validation لـ ChangePasswordDto** | `AccountController.cs:90` |
| V4 | **مفيش Validation لـ paymentMethod parameter** | `PaymentController.cs:39` |
| V5 | **مفيش Validation لـ DocumentsController `state`** | `DocumentsController.cs:28` |
| V6 | **مفيش Validation لـ ContactRequestDto** (Endpoint عام) | `ContactController.cs:28` |
| V7 | **LoginValidator بيفحص قوة الباسورد وقت اللوجين** — غلط | `LoginValidator.cs:23-29` |

### 1.9 Hardcoded Values

| # | القيمة | الملف | السطر |
|---|-------|-------|-------|
| H1 | Rate limits (100/min, 10/min, etc.) | `Program.cs` | 180-217 |
| H2 | JWT duration: 15 min | `appsettings.json` | 52 |
| H3 | Refresh token: 7 days | `AuthService.cs` | 369, 434, 976 |
| H4 | OTP expiry: 5 min | `AuthService.cs` | 282, 802 |
| H5 | Paymob base URL | `Program.cs` | 125 |
| H6 | Slow request threshold: 2000ms | `RequestTimingMiddleware.cs` | 11 |
| H7 | Duplicate payment window: 5 min | `PaymobService.cs` | 66 |
| H8 | Free Trial defaults | `AuthService.cs` | 711-718 |
| H9 | Lockout: 5 attempts, 15 min | `WebApplicationServices.cs` | 141-143 |

---

## 2. الداشبورد الإداري (Admin Dashboard)

**Tech:** React 19 + TypeScript 5.9 + Redux Toolkit + HeroUI + Tailwind CSS 4 + Vite 7

### 2.1 صفحات Static / غير شغالة

| # | المشكلة | الملف |
|---|---------|-------|
| C1 | **SubscriptionDetails كلها Static** — كل القيم hardcoded، URL parameter `:id` متجاهل | `src/pages/subscriptions/SubscriptionDetails.tsx` |
| C2 | **Reviews كلها Static** — 6 ReviewCard من `[1,2,3,4,5,6]` بدون API call | `src/pages/plansAndReview/Reviews.tsx` |
| C3 | **SubscriptionsChart ببيانات hardcoded** | `src/components/charts/SubscriptionsChart.tsx` |
| C4 | **PieChartHome + LineChartHome Dead Code** — مش مستخدمين ومفيش import ليهم | `src/components/charts/` |
| C5 | **ReviewCard أزرار "Add"/"Reject" مش شغالة** — مفيش onClick | `ReviewCard.tsx` |
| C6 | **AiModelSettings MODEL_OPTIONS hardcoded** | `src/pages/settings/AiModelSettings.tsx:12-16` |

### 2.2 مشاكل أمنية

| # | المشكلة | الملف |
|---|---------|-------|
| S1 | **`JSON.parse(savedUser)` بدون try-catch** = تطبيق يتهنج لو localStorage فاسد | `src/redux/auth/authSlice.ts:27-29` |
| S2 | **WhatsApp number hardcoded** | `AuthLayout.tsx:23`, `AuthLegalPage.tsx:49` |
| S3 | **Admin email placeholder `admin@mohamy.com`** | `Login.tsx:49` |
| S4 | **PublicRoute مش بيتعامل مع status=unknown** | `PublicRoute.tsx:7-8` |

### 2.3 مشاكل Error Handling

| # | المشكلة | الملف |
|---|---------|-------|
| E1 | **LawyerDetails يفضل يلف Spinner لو Lawyer مش موجود** | `LawyerDetails.tsx:25` |
| E2 | **PlansAndReview مفيش Validation في Edit/Create** | `PlansAndReview.tsx:58-85` |
| E3 | **"تحميل التقرير" Button مش شغال** — مفيش onClick | `Subscriptions.tsx:89-97` |
| E4 | **Triple-nested `.data` access** بدون null checks | `fetchLawyerUsage.ts:19` |
| E5 | **analyticsService defensive hack** `response.data?.data ?? response.data?.Data ?? response.data` | `analyticsService.ts:32-49` |
| E6 | **ContactRequests مفيش Error State** | `ContactRequests.tsx` |
| E7 | **Shared `isLoading` في reportsSlice** — spinner بيختفي بدري لو requests متوازية | `reportsSlice.ts` |
| E8 | **نفس مشكلة isLoading في aiUsageSlice** | `aiUsageSlice.ts` |

### 2.4 مشاكل الأداء

| # | المشكلة | الملف |
|---|---------|-------|
| P1 | **LawyerDetails بيحمّل كل المحامين** عشان يلاقي واحد بالـ ID | `LawyerDetails.tsx:17-21` |
| P2 | **Home page بت dispatch 3 thunks في كل mount** بدون caching | `Home.tsx:39-43` |
| P3 | **pageSize: 50 hardcoded في AiUsage بدون Pagination حقيقي** | `AiUsage.tsx:51` |
| P4 | **Client-side filtering في SubscriptionReports** | `SubscriptionReports.tsx:37` |
| P5 | **مفيش Route-level Code Splitting** | `AppRouter.tsx` |

### 2.5 كود مكرر

| # | المشكلة | الملفات |
|---|---------|-------|
| D1 | **TAdminUser type مكرر 3 مرات** | `authSlice.ts`, `thunkAuthLogin.ts`, `thunkAuthMe.ts` |
| D2 | **TLawyersReport مكرر مرتين** | `reportThunks.ts`, `fetchLawyersReport.ts` |
| D3 | **fetchSubscriptionsReport مكرر** | `reportThunks.ts`, `fetchSubscriptionsReport.ts` |
| D4 | **Error handling pattern مختلف** — axiosErrorHandler vs manual cast | ملفات مختلفة |

### 2.6 مشاكل أخرى

| # | المشكلة |
|---|---------|
| X1 | **مفيش RTK Query** — Manual thunks + axios boilerplate ضخم |
| X2 | **Redux hooks استخدام غير موحد** — ناس useAppDispatch وناس useDispatch |
| X3 | **Tests: 2 ملفات بس (~5 tests)** لكل الداشبورد |
| X4 | **Dead code في Header.tsx** — ~20 سطر commented out |
| X5 | **Theme مش متطبق على document.documentElement** |
| X6 | **ErrorBoundary مش بيبعت لـ Sentry** |

---

## 3. داشبورد المحامي (Lawyer Dashboard)

**Tech:** React 19 + TypeScript 5.8 + Redux Toolkit + HeroUI + Mantine + Tailwind CSS 4 + Vite 7

### 3.1 مشاكل أمنية

| # | المشكلة | الملف |
|---|---------|-------|
| S1 | **`JSON.parse` من localStorage بدون try-catch** في authSlice | `authSlice.ts` |
| S2 | **بيانات المستخدم في localStorage بدون تشفير** (roles, profileId) | `authSlice.ts` |
| S3 | **File path URL construction بدون sanitization** | `ClientDetails.tsx` |
| S4 | **`style` attribute في DOMPurify allowlist** = CSS injection vector | `sanitizeHtml.ts` |
| S5 | **`window.open(activePaymentUrl)` بدون URL validation** | `Subscription.tsx` |
| S6 | **Phone number في URL query params** | `Login.tsx` |

### 3.2 مشاكل الأداء

| # | المشكلة | الملف |
|---|---------|-------|
| P1 | **Dual CSS frameworks** — HeroUI + Mantine = bundle ضخم | `package.json` |
| P2 | **moment.js + date-fns مع بعض** = +300KB زيادة | Cases, Clients, ClientDetails |
| P3 | **مفيش Route-level Lazy Loading** | `AppRouter.tsx` |
| P4 | **PDF processing at scale 2.0** بدون limits | `Documents.tsx` |
| P5 | **7 workflow API calls في CaseDetails mount** | `CaseDetails.tsx` |
| P6 | **Sidebar resize listener بدون debounce** | `Sidebar.tsx` |
| P7 | **`useWorkflowAutoSave.isSaving` بي return stale ref value** | `useWorkflowAutoSave.ts` |

### 3.3 مشاكل Error Handling

| # | المشكلة | الملف |
|---|---------|-------|
| E1 | **Home page مفيش Error State** لاي من 4 API calls | `Home.tsx` |
| E2 | **CaseDetails مفيش Error State** لتحميل القضية | `CaseDetails.tsx` |
| E3 | **Clients مفيش Failed State** | `Clients.tsx` |
| E4 | **`isString` guard بيبلع الأخطاء صامت** في كل الـ slices | كل slices |
| E5 | **مفيش Retry logic** لـ auth me, SignalR | عدة ملفات |
| E6 | **ProtectedRoute بي return null أثناء loading** = شاشة بيضا | `ProtectedRoute.tsx` |

### 3.4 مشاكل جودة الكود

| # | المشكلة | الملف |
|---|---------|-------|
| Q1 | **`setPageNumber` مش مت dispatch** في Cases pagination — غالبًا bug | `Cases.tsx` |
| Q2 | **Orphaned `/home` route** مع dead App.tsx | `AppRouter.tsx` |
| Q3 | **Client-side search بدون Server-side filtering** | Cases, Clients |
| Q4 | **Inline styles في ForgotPassword** (`#EF950A`) | `ForgotPassword.tsx` |
| Q5 | **Helper functions مكررة** (`getInitials`, `getAvatarColor`) | `Clients.tsx`, `ClientDetails.tsx` |
| Q6 | **API routes مش مركزية** — URLs hardcoded في thunks | عدة ملفات |
| Q7 | **مفيش Path aliases** — deep relative imports `../../../` | المشروع كله |
| Q8 | **Chat مفيش message persistence** — بيت Lost on refresh | `Chat.tsx` |
| Q9 | **`useWorkflowAutoSave` silent retry** — المستخدم مش عارف إن البيانات مش متسجلة | `useWorkflowAutoSave.ts` |

### 3.5 Hardcoded Values

| # | القيمة | الملف |
|---|-------|------|
| H1 | EGYPT_GOVERNORATES array | `SignUp.tsx` |
| H2 | FALLBACK_PLANS و FEATURE_DESCRIPTIONS | `Subscription.tsx` |
| H3 | pageSize: 10 في thunks | عدة ملفات |
| H4 | Hub URL construction via string replace | `useAiJobSignalR.ts` |
| H5 | Color #EF950A scattered | Inline styles |
| H6 | WhatsApp support number | `AuthLayout.tsx` |

### 3.6 Tests

| | |
|---|---|
| **ملفات الـ Test** | 2 ملفات فقط (`api.test.ts`, `ProtectedRoute.test.tsx`) |
| **التغطية** | تقريبًا صفر لـ 100+ source file |

---

## 4. Landing Page

**Tech:** Next.js 16 + React 19 + TypeScript + Framer Motion + Swiper + Tailwind CSS 4

### 4.1 مشاكل حرجة

| # | المشكلة | الملف |
|---|---------|-------|
| C1 | **صفحة Register فاضية** — RegisterForm موجود بس مش مستخدم (ملاحظة: سيتم حذف الصفحة) | `register/page.tsx` |
| C2 | **CTA Button مش شغال** — مفيش onClick/href | `CallToAction.tsx:12` |
| C3 | **أزرار الباقات كلها مش شغالة** | `PricingPlans.tsx:23,48,84` |
| C4 | **الباقة الاحترافية = نفس محتوى الباقة الأساسية** (+ TODO comment) | `PricingPlans.tsx:80-107` |

### 4.2 مشاكل SEO

| # | المشكلة | الملف |
|---|---------|-------|
| SEO1 | **OG Image بصيغة ICO** — مش هتشتغل على السوشيال | `layout.tsx:27-31` |
| SEO2 | **Production URL hardcoded** | `layout.tsx:23` |
| SEO3 | **مفيش Metadata على الصفحات الفرعية** | privacy-policy, refund-policy, register |
| SEO4 | **مفيش robots.txt, sitemap, manifest, canonical** | — |
| SEO5 | **Navigation يستخدم `<a>` بدل `<Link>`** | `Header.tsx`, `HeroSection.tsx` |

### 4.3 مشاكل الأداء

| # | المشكلة | الملف |
|---|---------|-------|
| P1 | **Next.js Image Optimization disabled** (`unoptimized: true`) | `next.config.ts:6-8` |
| P2 | **Hero Section 170vh** — ضعف ارتفاع الشاشة | `HeroSection.css:3` |
| P3 | **Unused boilerplate SVGs** (file, globe, next, vercel, window) | `public/` |
| P4 | **Framer Motion بدون lazy loading** | عدة components |
| P5 | **Swiper CSS مكرر مرتين** | FeaturesSection, TestimonialCarousel |

### 4.4 مشاكل Accessibility

| # | المشكلة | الملف |
|---|---------|-------|
| A1 | **sr-only + aria-hidden مع بعض** = عنصر مش واخد لا بص ولا سمع | `TestimonialCarousel.tsx:32` |
| A2 | **Nav element بدون aria-label** | `Header.tsx:18` |
| A3 | **Sections بدون aria-labels** | عدة components |

### 4.5 مشاكل أمنية

| # | المشكلة | الملف |
|---|---------|-------|
| S1 | **Phone number في URL** وقت redirect بعد التسجيل | `RegisterForm.tsx:73` |
| S2 | **nginx.conf ناقص CSP و HSTS** | `nginx.conf` |
| S3 | **Dockerfile default API URL = HTTP** | `Dockerfile:21` |

### 4.6 Landing مش بيستخدم Shared Packages خالص

| Package | Landing بداله |
|---------|--------------|
| `@mohamy/shared-api` | `src/lib/api.ts` خاص |
| `@mohamy/shared-validations` | `src/lib/validations/registerSchema.ts` خاص |
| `@mohamy/shared-ui` (Container) | `src/components/ui/Container.tsx` خاص |
| `@mohamy/shared-utils` | مش مستخدم |

### 4.7 Hardcoded Values

| القيمة | الملف |
|-------|-------|
| `http://localhost:5078` | Header.tsx, HeroSection.tsx, RegisterForm.tsx |
| `Info@mohamy-smart.com` | ContactSection.tsx |
| `+201289221056` | ContactSection.tsx |
| أسعار 299/599/1299 EGP | PricingPlans.tsx |
| كل التقييمات | TestimonialsSection.tsx |
| `https://mohamy-smart.com` | layout.tsx |

---

## 5. Shared Packages

### 5.1 shared-validations

| # | المشكلة | الملف |
|---|---------|-------|
| V1 | **Zod v3 vs v4 mismatch** — `peerDependencies: "zod": "^3.0.0"` لكن Landing بتستخدم `^4.3.6` و`.nonempty()` مش موجود في v4 | `package.json` |
| V2 | **Explicit `any` types** في refine callbacks | `auth.ts:24,42` |
| V3 | **Password regex مختلف** بين shared و Landing | `common.ts:10` vs Landing `registerSchema.ts:16` |
| V4 | **Phone regex مختلف** — shared: `/^01[0125]/` vs Landing: تقبل international prefixes | `common.ts:17` |

### 5.2 shared-api

| # | المشكلة | الملف |
|---|---------|-------|
| A1 | **CSRF pre-auth flag مش بيتريسيت بعد login** — ممكن يسبب 400 error | `createApiClient.ts:61,84` |
| A2 | **Unsafe `as any` type assertion** على `import.meta` | `createApiClient.ts:34` |

### 5.3 shared-ui

| # | المشكلة | الملف |
|---|---------|-------|
| U1 | **tsconfig مش extends base** — مختلف عن باقي الـ packages | `tsconfig.json` |
| U2 | **Duplicate peer/dev dependencies** | `package.json` |
| U3 | **`as any` assertions** في CustomInput | `CustomInput.tsx:20,35` |
| U4 | **Unsafe type assertion** في CustomTable | `CustomTable.tsx:34` |

### 5.4 shared-types

| # | المشكلة | الملف |
|---|---------|-------|
| T1 | **`TClient.email` nullable بس `TProfile.email` مش nullable** | `dashboard.ts:5` |
| T2 | **Date fields = `string` بدون branded type** | عدة ملفات |
| T3 | **`NotificationItem.type` = `string` بدل union type** | `notification.ts:6` |

### 5.5 shared-utils

| # | المشكلة | الملف |
|---|---------|-------|
| X1 | **envValidator بيدعم VITE بس** — مش شغال مع NEXT_PUBLIC | `envValidator.ts` |
| X2 | **`isString` docstring غلط** — بيقول non-empty بس مش بيفحص كده | `guards.ts:1` |

### 5.6 Cross-Package Issues

| # | المشكلة |
|---|---------|
| CP1 | **tsconfig مش موحد** — 3 packages extends base، 2 مش |
| CP2 | **مفيش build scripts** في أي package |
| CP3 | **Landing مش بيستخدم أي package** |

---

## 6. أولويات الإصلاح (Top 10)

1. **إزالة OTP من اللوجات** وإلغاء الـ API key المسربة فورًا
2. **حذف بيانات الداتابيز** من الكود وربطها بـ Environment Variables
3. **إضافة Transactions** لعمليات إنشاء القضية والعميل
4. **إضافة FluentValidation** لكل الـ DTOs في الباك إند
5. **إصلاح الصفحات الـ Static** في Admin (SubscriptionDetails, Reviews, Charts)
6. **حذف صفحة Register الفاضية** من Landing Page
7. **إضافة Error/Loading/Empty States** في كل الصفحات
8. **إضافة maxPageSize** وتحسين الـ Queries (N+1, correlated subqueries)
9. **توحيد Shared Packages** مع الـ Landing (خصوصًا Zod version)
10. **إضافة Code Splitting** + حذف moment.js
