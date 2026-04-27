# خطة إصلاح المشروع بالمراحل — Project Remediation Plan

**تاريخ الإنشاء:** 23 أبريل 2026  
**المرجع:** `docs/FULL_PROJECT_AUDIT.md`  
**الاستراتيجية:** من الحرج → المهم → التحسين، كل Phase ليها timeline وdeliverables واضحة

---

## Phase 0: إصلاحات طارئة (P0 — فوري)
**المدة المتوقعة:** 1-2 يوم  
**الهدف:** سد الثغرات الأمنية الحرجة اللي ممكن تستغل فورًا

### Backend
| # | المهمة | الملف | التفاصيل |
|---|--------|-------|----------|
| 0.1 | إزالة OTP من اللوجات | `AuthService.cs:276,674` | حذف `_logger.LogWarning` اللي بيطبع OTP، أو استبداله بـ `_logger.LogInformation("OTP sent to {Phone}", MaskPhone(phone))` |
| 0.2 | إلغاء Google API Key المسربة | `appsettings.example.json:9` | Revive الـ key من Google Cloud Console + استبدالها بـ placeholder `"YOUR_API_KEY_HERE"` |
| 0.3 | حذف SA credentials | `appsettings.Development.json:3` | نقل الـ connection string لـ User Secrets أو env var |
| 0.4 | حجب DB errors عن الكلنت | `ExceptionMiddleware.cs:55-56` | استبدال `dbMessage` بـ `"A database error occurred. Please try again."` |
| 0.5 | Sanitize file names في Upload | `FileUploadService.cs:36` | `Path.GetFileName(file.FileName)` + فلترة extensions whitelist |
| 0.6 | إضافة File Type whitelist | `FileUploadService.cs` | قائمة `.pdf,.doc,.docx,.jpg,.jpeg,.png` فقط |

### Frontend
| # | المهمة | الملف | التفاصيل |
|---|--------|-------|----------|
| 0.7 | try-catch حول JSON.parse في authSlice (Admin) | `admin/authSlice.ts:27` | `try { JSON.parse } catch { localStorage.removeItem("user"); return null; }` |
| 0.8 | try-catch حول JSON.parse في authSlice (Lawyer) | `lawyer/authSlice.ts` | نفس الحل |

### Landing
| # | المهمة | الملف | التفاصيل |
|---|--------|-------|----------|
| 0.9 | حذف صفحة Register الفاضية | `apps/landing/src/app/register/` | حذف الفولدر بالكامل أو تحويله لـ redirect للـ lawyer dashboard signup |

**Deliverables:**
- [ ] مفيش OTP في اللوجات
- [ ] مفيش credentials في الكود
- [ ] مفيش DB schema في API responses
- [ ] File uploads آمنة
- [ ] التطبيق مش بي crash بسبب localStorage

---

## Phase 1: إصلاحات Backend حرجة (P1)
**المدة المتوقعة:** 3-5 أيام  
**الهدف:** إصلاح الـ Data Integrity و Validation و Performance الحرجة

### 1A. Transactions & Data Integrity
| # | المهمة | التفاصيل |
|---|--------|----------|
| 1.1 | إضافة Transaction لـ Case Creation | `_unitOfWork.BeginTransactionAsync()` حول الـ 4 SaveChanges في `CaseService.cs:89-132` + rollback on failure |
| 1.2 | إصلاح BaseEntity CreatedBy/UpdatedBy | إضافة `AuditInterceptor` أو populate في middleware |
| 1.3 | إصلاح Refresh Token بعد Password Reset | مسح `RefreshToken` و `RefreshTokenExpiresAt` في AuthService عند تغيير الباسورد |

### 1B. Validation
| # | المهمة | التفاصيل |
|---|--------|----------|
| 1.4 | FluentValidation لـ CreateCaseDto | Title required, maxLength 200; Number required; Court required; ClientName required |
| 1.5 | FluentValidation لـ UpdateCaseDto | نفس الـ rules |
| 1.6 | FluentValidation لـ CreateClientDto / UpdateClientDto | Phone regex, email format, national ID format |
| 1.7 | FluentValidation لـ ChangePasswordDto | Password complexity rules |
| 1.8 | FluentValidation لـ ContactRequestDto | Name required, phone format, message maxLength |
| 1.9 | إصلاح LoginValidator | حذف password complexity checks — دي للتسجيل بس |
| 1.10 | Validation لـ paymentMethod | Whitelist `"card" | "wallet"` فقط |

### 1C. Performance Quick Wins
| # | المهمة | التفاصيل |
|---|--------|----------|
| 1.11 | إصلاح Correlated Subquery | `AccountService.cs:140` — تحويل لـ GROUP BY subquery |
| 1.12 | إضافة maxPageSize | `if (pageSize > 100) pageSize = 100;` في كل Services |
| 1.13 | Cache Prompt Templates | `ConcurrentDictionary<string, string>` لـ prompt files بدل File.ReadAllText في كل request |

### 1D. Code Quality
| # | المهمة | التفاصيل |
|---|--------|----------|
| 1.14 | Fix namespace typos | `AccountService.cs` → `Lawyer.Application.Services`, `LoginValidator.cs` → correct namespace |
| 1.15 | Extract OTP utilities | `OtpHelper` static class مشترك |
| 1.16 | Extract Email template | `EmailTemplateBuilder` static class واحد |
| 1.17 | Extract ResolveLawyerIdAsync | Base service method أو helper |

**Deliverables:**
- [ ] كل العمليات المتعددة الخطوات في Transaction
- [ ] كل DTOs عليها Validation
- [ ] PageSize محدود بـ 100
- [ ] Prompt files متكاشة
- [ ] N+1 query متصلح

---

## Phase 2: إصلاحات Frontend — Admin Dashboard (P2)
**المدة المتوقعة:** 5-7 أيام  
**الهدف:** تشغيل الصفحات الـ Static + إصلاح Error States

### 2A. صفحات Static → Dynamic
| # | المهمة | التفاصيل |
|---|--------|----------|
| 2.1 | SubscriptionDetails dynamic | إنشاء `fetchSubscriptionById` thunk + ربط بـ API + استخدام URL param `:id` |
| 2.2 | Reviews dynamic | إنشاء `fetchReviews` thunk + ReviewCard يبقى onClick شغال (approve/reject) |
| 2.3 | SubscriptionsChart dynamic | جلب البيانات من API بدل hardcoded mock data |
| 2.4 | حذف Dead Charts | حذف `PieChartHome.tsx` و `LineChartHome.tsx` |
| 2.5 | ReviewCard buttons | إضافة onClick handlers لـ approve/reject |

### 2B. Error/Loading/Empty States
| # | المهمة | التفاصيل |
|---|--------|----------|
| 2.6 | LawyerDetails "not found" state | لما `!lawyer && !isLoading` → رسالة "المحامي غير موجود" + رجوع |
| 2.7 | PlansAndReview form validation | إضافة Zod/react-hook-form |
| 2.8 | PlansAndReview loading state | Spinner أثناء الـ API call |
| 2.9 | ContactRequests error + empty state | Error message + retry + empty illustration |
| 2.10 | SubscriptionReports empty state | رسالة "مفيش نتائج" لما الفلتر ميرجعش حاجة |
| 2.11 | Settings loading state | Spinner أول ما الصفحة بتفتح |
| 2.12 | "تحميل التقرير" button | ربط بـ API download endpoint أو إزالة الزر |

### 2C. Performance
| # | المهمة | التفاصيل |
|---|--------|----------|
| 2.13 | إنشاء fetchLawyerById thunk | بدل تحميل كل المحامين |
| 2.14 | Fix shared isLoading | فصل لكل thunk loading flag خاص بيه في reportsSlice و aiUsageSlice |
| 2.15 | إضافة React.lazy | Route-level code splitting في AppRouter |

### 2D. Code Quality
| # | المهمة | التفاصيل |
|---|--------|----------|
| 2.16 | حذف Duplicate types | نقل TAdminUser لـ `types/index.ts` + استخدام من هناك |
| 2.17 | حذف Duplicate thunks | إبقاء الملفات المتخصصة بس + حذف `reportThunks.ts` المكرر |
| 2.18 | توحيد Error handling | استخدام `axiosErrorHandler` في كل مكان |
| 2.19 | توحيد Redux hooks | `useAppDispatch`/`useAppSelector` في كل مكان |
| 2.20 | حذف Dead code | commented code في Header.tsx |

**Deliverables:**
- [ ] كل الصفحات بتعرض بيانات حقيقية من API
- [ ] كل الصفحة عندها loading/error/empty states
- [ ] مفيش shared isLoading
- [ ] Code splitting شغال

---

## Phase 3: إصلاحات Frontend — Lawyer Dashboard (P3)
**المدة المتوقعة:** 5-7 أيام  
**الهدف:** تحسين الأداء + Error Handling + حذف الكود المكرر

### 3A. Error States & UX
| # | المهمة | التفاصيل |
|---|--------|----------|
| 3.1 | Home page error states | Error UI + retry لكل من الـ 4 API calls |
| 3.2 | CaseDetails error state | Error message لو القضية مش موجودة أو حصل خطأ |
| 3.3 | Clients failed state | رسالة خطأ + retry |
| 3.4 | ProtectedRoute loading spinner | Spinner أو skeleton بدل null |
| 3.5 | 404 page حقيقي | Component بLayout وnavigation بدل bare `<h1>` |

### 3B. Performance
| # | المهمة | التفاصيل |
|---|--------|----------|
| 3.6 | حذف moment.js | استبدال بـ date-fns في كل مكان |
| 3.7 | حذف Mantine | استبدال InputOtp/Calendar/Textarea/Spinner بـ HeroUI equivalents |
| 3.8 | React.lazy code splitting | لكل route في AppRouter |
| 3.9 | PDF processing optimization | Lazy page rendering + max concurrency limit |
| 3.10 | Sidebar resize debounce | إضافة debounce على resize listener |

### 3C. Bugs & Code Quality
| # | المهمة | التفاصيل |
|---|--------|----------|
| 3.11 | إصلاح setPageNumber bug | `dispatch(setPageNumber(page))` في Cases.tsx |
| 3.12 | حذف orphaned /home route + dead App.tsx | حذف أو استبدال |
| 3.13 | Extract helper functions | `getInitials`, `getAvatarColor` لـ shared utils |
| 3.14 | Centralize API routes | كل URLs في `routes.ts` |
| 3.15 | Server-side search | إرسال search query للـ API بدل client-side filtering |
| 3.16 | Fix useWorkflowAutoSave.isSaving | استخدام state بدل ref |

### 3D. Hardcoded Values
| # | المهمة | التفاصيل |
|---|--------|----------|
| 3.17 | EGYPT_GOVERNORATES → shared constants | نقل لـ `@mohamy/shared-utils` |
| 3.18 | FALLBACK_PLANS → API only | حذف fallback data أو ربط بـ API |
| 3.19 | Inline styles → CSS classes | خصوصًا `#EF950A` |
| 3.20 | WhatsApp number → env var | `VITE_SUPPORT_WHATSAPP` |

**Deliverables:**
- [ ] كل الصفحات عندها error states
- [ ] Bundle size أقل (بدون moment + Mantine)
- [ ] Code splitting شغال
- [ ] مفيش bugs معروفة

---

## Phase 4: إصلاحات Landing Page (P4)
**المدة المتوقعة:** 3-5 أيام  
**الهدف:** تشغيل العناصر التفاعلية + SEO + Performance

### 4A. العناصر التفاعلية
| # | المهمة | التفاصيل |
|---|--------|----------|
| 4.1 | حذف صفحة Register الفاضية | حذف `apps/landing/src/app/register/` أو redirect |
| 4.2 | CTA button navigation | ربط بـ signup dashboard |
| 4.3 | Pricing plan buttons | ربط كل خطة بـ checkout أو signup |
| 4.4 | الباقة الاحترافية محتوى مختلف | محتوى features مختلف عن الأساسية |

### 4B. SEO
| # | المهمة | التفاصيل |
|---|--------|----------|
| 4.5 | OG Image بصيغة PNG/WEBP | استبدال الـ ICO بصورة مناسبة |
| 4.6 | Production URL من env var | `process.env.NEXT_PUBLIC_SITE_URL` |
| 4.7 | Metadata لكل صفحة فرعية | privacy-policy, refund-policy كل واحد metadata خاص بيه |
| 4.8 | robots.txt + sitemap.xml | إنشاء `app/robots.ts` + `app/sitemap.ts` |
| 4.9 | Internal links → `<Link>` | Header + HeroSection |

### 4C. Performance
| # | المهمة | التفاصيل |
|---|--------|----------|
| 4.10 | Hero Section 100vh بدل 170vh | تصحيح الارتفاع |
| 4.11 | تفعيل Image optimization أو استخدام CDN | إزالة `unoptimized: true` أو استخدام external loader |
| 4.12 | Lazy load Framer Motion | `next/dynamic` للـ animated sections |
| 4.13 | حذف unused boilerplate SVGs | `public/next.svg`, `vercel.svg`, etc. |
| 4.14 | حذف duplicate Swiper CSS imports | استيراد مرة واحدة |

### 4D. Security & Integration
| # | المهمة | التفاصيل |
|---|--------|----------|
| 4.15 | nginx CSP + HSTS headers | إضافة لـ `nginx.conf` |
| 4.16 | Dockerfile default HTTPS | تغيير default ARG |
| 4.17 | ربط Landing بـ shared-validations | استخدام `@mohamy/shared-validations` بدل local schema |
| 4.18 | ربط Landing بـ shared-api | استخدام `@mohamy/shared-api` بدل local api.ts |

**Deliverables:**
- [ ] CTA وأزرار الباقات شغالة
- [ ] SEO scores محسنة
- [ ] Landing بيستخدم shared packages
- [ ] Performance metrics أحسن

---

## Phase 5: Shared Packages Integration (P5)
**المدة المتوقعة:** 3-4 أيام  
**الهدف:** توحيد الـ packages + إصلاح الـ inconsistencies

### 5A. Zod & Validation Alignment
| # | المهمة | التفاصيل |
|---|--------|----------|
| 5.1 | توحيد Zod version | اختيار v3 أو v4 + تحديث كل الـ packages و apps |
| 5.2 | توحيد Password regex | regex واحد في `shared-validations/common.ts` + استخدام من كل مكان |
| 5.3 | توحيد Phone regex | regex واحد يقبل local + international |
| 5.4 | حذف `any` types في shared-validations | استخدام Zod inferred types |

### 5B. shared-api Fix
| # | المهمة | التفاصيل |
|---|--------|----------|
| 5.5 | CSRF flag reset after login | Reset `_csrfFailedPreAuth` بعد successful auth |
| 5.6 | إزالة `as any` assertions | Proper typing لـ `import.meta.env` |

### 5C. shared-types & shared-utils
| # | المهمة | التفاصيل|
|---|--------|----------|
| 5.7 | Date branded type | `type ISODateString = string & { __brand: "ISODate" }` |
| 5.8 | NotificationItem.type union | `'info' \| 'warning' \| 'error' \| 'success'` |
| 5.9 | TClient.email consistency | توحيد nullable مع TProfile |
| 5.10 | envValidator يدعم Next.js | إضافة NEXT_PUBLIC_* support |
| 5.11 | isString docstring fix | تصحيح أو إضافة non-empty check |

### 5D. shared-ui & Config
| # | المهمة | التفاصيل |
|---|--------|----------|
| 5.12 | tsconfig توحيد | كل packages extends `tsconfig.base.json` |
| 5.13 | حذف duplicate dependencies | peerDependencies فقط |
| 5.14 | CustomInput type safety | إزالة `as any` assertions |
| 5.15 | CustomTable type safety | Generic proper typing |

**Deliverables:**
- [ ] Zod version واحد في كل مكان
- [ ] Validation regex متطابق
- [ ] CSRF flag شغال صح
- [ ] كل tsconfigs موحدة

---

## Phase 6: Backend Architecture Improvements (P6)
**المدة المتوقعة:** 5-7 أيام  
**الهدف:** تحسين البنية المعمارية + الأداء

### 6A. Architecture
| # | المهمة | التفاصيل |
|---|--------|----------|
| 6.1 | إزالة HttpContext من Service Layer | تمرير userId كـ parameter بدل IHttpContextAccessor |
| 6.2 | GenericRepository Guid support | `GetByIdAsync<T>(Guid id)` أو generic key type |
| 6.3 | إزالة SaveChangesAsync من Repository | UnitOfWork بس اللي يتحكم في الـ transaction |
| 6.4 | Controller base method لـ User ID | `GetUserId()` extension أو base class method |
| 6.5 | ApiExceptionResponse → static utility | بدل DI injection |

### 6B. Performance
| # | المهمة | التفاصيل |
|---|--------|----------|
| 6.6 | PaymobService pagination | إضافة pagination لـ GetPaymentHistoryAsync |
| 6.7 | ClientService query optimization | دمج 3 queries في واحد |
| 6.8 | Case creation single SaveChanges | تجميع الـ operations في transaction واحد |
| 6.9 | CancellationToken في كل SaveChangesAsync | تمرير cancellation token |

### 6C. Error Handling
| # | المهمة | التفاصيل |
|---|--------|----------|
| 6.10 | ExceptionMiddleware 403 handler | إضافة ForbiddenException handling |
| 6.11 | ExceptionMiddleware status code fix | Result status يتطابق مع HTTP status |
| 6.12 | Contact endpoint rate limiting | إضافة rate limit + CAPTCHA |
| 6.13 | Error handling في fire-and-forget tasks | logging بدل silent swallow |

**Deliverables:**
- [ ] Service layer مستقل عن HTTP context
- [ ] Repository pattern متسق
- [ ] كل endpoints عندها error handling مناسب

---

## Phase 7: Testing & Polish (P7)
**المدة المتوقعة:** 5-7 أيام  
**الهدف:** تغطية Tests + التحسينات النهائية

### 7A. Backend Tests
| # | المهمة | التفاصيل |
|---|--------|----------|
| 7.1 | Auth flow tests | Login, Register, OTP, Password Reset |
| 7.2 | Case CRUD tests | Create, Read, Update, Delete + Validation |
| 7.3 | Client CRUD tests | Create, Read, Update, Delete + Validation |
| 7.4 | Payment tests | Payment flow, HMAC verification |
| 7.5 | Middleware tests | ExceptionMiddleware scenarios |

### 7B. Frontend Tests
| # | المهمة | التفاصيل |
|---|--------|----------|
| 7.6 | Admin: Auth flow tests | Login, logout, protected routes |
| 7.7 | Admin: Key thunks tests | fetchLawyers, fetchReports |
| 7.8 | Lawyer: Auth flow tests | Login, logout, protected routes |
| 7.9 | Lawyer: Workflow system tests | Basic workflow operations |
| 7.10 | Shared packages unit tests | validators, utils, types |

### 7C. Polish
| # | المهمة | التفاصيل |
|---|--------|----------|
| 7.11 | ErrorBoundary → Sentry | إرسال errors لـ Sentry من ErrorBoundary components |
| 7.12 | Theme consistency | تطبيق theme على document.documentElement |
| 7.13 | Accessibility pass | aria-labels, keyboard navigation, screen reader fixes |
| 7.14 | RTL consistency | التأكد إن كل الـ layouts RTL بشكل صحيح |

**Deliverables:**
- [ ] Backend test coverage > 50%
- [ ] Frontend test coverage > 30% for critical paths
- [ ] Error monitoring شغال (Sentry)
- [ ] Accessibility basic checks pass

---

## ملخص الـ Phases

| Phase | الاسم | المدة | الأولوية |
|-------|-------|------|---------|
| **0** | إصلاحات طارئة أمنية | 1-2 يوم | 🔴 فوري |
| **1** | Backend حرجة (Transactions, Validation, Performance) | 3-5 أيام | 🔴 فوري |
| **2** | Admin Dashboard (Static pages, Error states) | 5-7 أيام | 🟠 عاجل |
| **3** | Lawyer Dashboard (Performance, Errors, Cleanup) | 5-7 أيام | 🟠 عاجل |
| **4** | Landing Page (CTA, SEO, Performance) | 3-5 أيام | 🟡 مهم |
| **5** | Shared Packages (Zod, Validation, Consistency) | 3-4 أيام | 🟡 مهم |
| **6** | Backend Architecture (Clean Architecture, Perf) | 5-7 أيام | 🟢 تحسين |
| **7** | Testing & Polish | 5-7 أيام | 🟢 تحسين |

**الإجمالي المتوقع:** 30-44 يوم عمل

### رسم الـ Dependencies

```
Phase 0 (فوري)
    ↓
Phase 1 (Backend) ←── Phase 5 (Shared Packages)
    ↓                        ↓
Phase 2 (Admin)         Phase 4 (Landing)
    ↓
Phase 3 (Lawyer)
    ↓
Phase 6 (Backend Architecture)
    ↓
Phase 7 (Testing & Polish)
```

> **ملاحظة:** Phase 0 و 1 لازم يخلصوا الأول. Phase 2-5 ممكن يشتغلوا بالتوازي. Phase 6-7 بعد الباقي.
