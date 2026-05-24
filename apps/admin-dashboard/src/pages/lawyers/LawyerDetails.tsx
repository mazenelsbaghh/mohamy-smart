import { Container } from"@mohamy/shared-ui";
import { useEffect, useState, type ReactNode } from"react";
import { useParams, useNavigate } from"react-router-dom";
import { Avatar, Button, Spinner, Textarea } from"@heroui/react";
import {
 FaArrowRight,
 FaBalanceScale,
 FaBriefcase,
 FaCalendarAlt,
 FaChartLine,
 FaCheckCircle,
 FaChevronDown,
 FaChevronUp,
 FaEnvelope,
 FaExternalLinkAlt,
 FaFileSignature,
 FaFolderOpen,
 FaIdCard,
 FaMoneyBillWave,
 FaPhone,
 FaRegClock,
 FaRobot,
 FaStar,
 FaTimesCircle,
 FaUserShield,
 FaUsers,
} from"react-icons/fa";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import HeadTitle from"../../components/public/headTitle/HeadTitle";
import fetchLawyerById from"../../redux/lawyers/thunk/fetchLawyerById";
import verifyLawyerPhoneManually from"../../redux/lawyers/thunk/verifyLawyerPhoneManually";
import updateLawyerStatus from"../../redux/lawyers/thunk/updateLawyerStatus";

type Tone ="success" |"warning" |"danger" |"neutral";

const numberFormatter = new Intl.NumberFormat("ar-EG-u-nu-latn");
const currencyFormatter = new Intl.NumberFormat("ar-EG-u-nu-latn", {
 style:"currency",
 currency:"USD",
 maximumFractionDigits:2,
});
const dateFormatter = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
 dateStyle:"medium",
});

const toneClass: Record<Tone, string> = {
 success:"border-emerald-200 bg-emerald-50 text-emerald-700",
 warning:"border-amber-200 bg-amber-50 text-amber-700",
 danger:"border-red-200 bg-red-50 text-red-700",
 neutral:"border-[var(--border-color)] bg-[var(--surface-soft)] text-[var(--text-secondary)]",
};

const displayValue = (value: ReactNode) => {
 if (value === null || value === undefined || value ==="") return "غير متاح";
 return value;
};

const formatDate = (value?: string | null) => {
 if (!value) return "غير متاح";
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return "غير متاح";
 return dateFormatter.format(date);
};

const formatNumber = (value?: number | null) => numberFormatter.format(value ?? 0);

const formatCost = (value?: number | null) => currencyFormatter.format(value ?? 0);

const getCaseStatus = (status: number) => (status === 1 ?"مغلقة" :"مفتوحة");

const getJobStatusLabel = (status: string) => {
 const normalized = status.toLowerCase();
 if (normalized ==="completed") return "مكتملة";
 if (normalized ==="processing") return "قيد التنفيذ";
 if (normalized ==="queued") return "في الانتظار";
 if (normalized ==="failed") return "فشلت";
 if (normalized ==="conflict") return "تعارض";
 return status ||"غير محدد";
};

const getJobStatusTone = (status: string): Tone => {
 const normalized = status.toLowerCase();
 if (normalized ==="completed") return "success";
 if (normalized ==="failed" || normalized ==="conflict") return "danger";
 if (normalized ==="processing" || normalized ==="queued") return "warning";
 return "neutral";
};

const translateReviewStatus = (status: string) => {
 const normalized = status.toLowerCase();
 if (normalized ==="approved") return "معتمد";
 if (normalized ==="pending") return "قيد المراجعة";
 if (normalized ==="rejected") return "مرفوض";
 return status ||"غير محدد";
};

const StatusBadge = ({ tone, children, icon }: { tone: Tone; children: ReactNode; icon?: ReactNode }) => (
 <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneClass[tone]}`}>
 {icon}
 {children}
 </span>
);

const InfoField = ({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) => (
 <div className="min-w-0 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-4 py-3 shadow-sm">
 <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
 <span className="text-[var(--main-color)]">{icon}</span>
 <span>{label}</span>
 </div>
 <div className="break-words text-sm font-semibold leading-7 text-[var(--text-primary)]">
 {displayValue(value)}
 </div>
 </div>
);

const MetricCard = ({ label, value, icon, sub }: { label: string; value: ReactNode; icon: ReactNode; sub?: ReactNode }) => (
 <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] p-4 shadow-sm">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <p className="text-xs font-semibold text-[var(--text-muted)]">{label}</p>
 <p className="mt-2 break-words text-2xl font-bold leading-tight text-[var(--text-primary)]">{value}</p>
 {sub ? <p className="mt-2 break-words text-xs leading-6 text-[var(--text-secondary)]">{sub}</p> : null}
 </div>
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--main-color)]">
 {icon}
 </span>
 </div>
 </div>
);

const SectionTitle = ({ icon, title }: { icon: ReactNode; title: string }) => (
 <div className="flex items-center gap-2">
 <span className="text-[var(--main-color)]">{icon}</span>
 <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
 </div>
);

const EmptyState = ({ text }: { text: string }) => (
 <div className="rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--surface-soft)] px-4 py-6 text-center text-sm text-[var(--text-secondary)]">
 {text}
 </div>
);

const LawyerDetails = () => {
 const { id } = useParams();
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const [manualReason, setManualReason] = useState("");
 const [manualReasonError, setManualReasonError] = useState<string | null>(null);
 const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
 const { selectedLawyer: lawyer, isLoadingDetail, isVerifyingPhone, isUpdatingStatus, error } = useAppSelector(
 (state) => state.lawyers
 );

 useEffect(() => {
 if (id) {
 dispatch(fetchLawyerById(id));
 setExpandedCaseId(null);
 }
 }, [dispatch, id]);

 const handleToggleStatus = () => {
 if (!lawyer) return;
 dispatch(updateLawyerStatus({ id: lawyer.id, isActive: !lawyer.isActive }));
 };

 const handleVerifyPhone = async () => {
 const reason = manualReason.trim();
 if (!reason) {
 setManualReasonError("اكتب سبب التوثيق اليدوي قبل التأكيد");
 return;
 }

 if (!lawyer) return;

 setManualReasonError(null);
 const result = await dispatch(verifyLawyerPhoneManually({ id: lawyer.id, reason }));
 if (verifyLawyerPhoneManually.fulfilled.match(result)) {
 setManualReason("");
 }
 };

 if (isLoadingDetail) {
 return (
 <section className="lawyer-details">
 <Container>
 <HeadTitle title="تفاصيل المحامي" />
 <div className="flex min-h-[55vh] items-center justify-center">
 <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-8 py-7 text-center shadow-sm">
 <Spinner size="lg" color="primary" />
 <p className="mt-4 text-sm font-semibold text-[var(--text-secondary)]">جاري تحميل ملف المحامي</p>
 </div>
 </div>
 </Container>
 </section>
 );
 }

 if (error || !lawyer) {
 return (
 <section className="lawyer-details">
 <Container>
 <HeadTitle title="تفاصيل المحامي" />
 <div className="flex min-h-[55vh] items-center justify-center">
 <div className="max-w-md rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-8 py-7 text-center shadow-sm">
 <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
 <FaTimesCircle />
 </span>
 <p className="mt-4 text-base font-bold text-[var(--text-primary)]">{error ||"المحامي غير موجود"}</p>
 <Button className="mt-5 bg-[var(--main-color)] text-white" onPress={() => navigate("/lawyers")}>
 العودة لقائمة المحامين
 </Button>
 </div>
 </div>
 </Container>
 </section>
 );
 }

 const subscription = lawyer.subscription;
 const activity = lawyer.activity;
 const aiRequestsLimit = subscription?.aiRequestsLimit ?? 0;
 const usedAiRequests = subscription?.usedAiRequests ?? 0;
 const remainingAiRequests = Math.max(0, aiRequestsLimit - usedAiRequests);
 const hasLawyerProfile = Boolean(lawyer.lawyerId);
 const activeTone: Tone = lawyer.isActive ?"success" :"danger";
 const subscriptionTone: Tone = subscription?.isActive ?"success" : subscription ?"warning" :"neutral";
 const canVerifyPhoneManually = Boolean(lawyer.phoneNumber) && !lawyer.phoneNumberConfirmed;
 const latestManualVerification = lawyer.latestManualPhoneVerification;

 return (
 <section className="lawyer-details pb-10">
 <Container>
 <HeadTitle title="تفاصيل المحامي" />

 <div className="space-y-8">
 <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] p-5 shadow-sm md:p-6">
 <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
 <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
 <Avatar
 className="h-24 w-24 shrink-0 border-3 border-[var(--main-color)] bg-[var(--surface-muted)] text-xl font-bold text-[var(--text-primary)]"
 name={lawyer.fullName ||"محامي"}
 />
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <h1 className="break-words text-2xl font-extrabold leading-10 text-[var(--text-primary)] md:text-3xl">
 {displayValue(lawyer.fullName)}
 </h1>
 <StatusBadge tone={activeTone} icon={lawyer.isActive ? <FaCheckCircle /> : <FaTimesCircle />}>
 {lawyer.isActive ?"نشط" :"موقوف"}
 </StatusBadge>
 </div>
 <div className="mt-3 flex flex-wrap gap-2">
 <StatusBadge tone={subscriptionTone} icon={<FaMoneyBillWave />}>
 {subscription?.isActive ? `مشترك في ${subscription.planName ||"خطة غير مسماة"}` : subscription ?"اشتراك غير نشط" :"بدون اشتراك"}
 </StatusBadge>
 <StatusBadge tone={lawyer.phoneNumberConfirmed ?"success" :"warning"} icon={<FaPhone />}>
 {lawyer.phoneNumberConfirmed ?"الهاتف موثق" :"الهاتف غير موثق"}
 </StatusBadge>
 <StatusBadge tone={lawyer.emailConfirmed ?"success" :"neutral"} icon={<FaEnvelope />}>
 {lawyer.emailConfirmed ?"البريد موثق" :"البريد غير موثق"}
 </StatusBadge>
 </div>
 </div>
 </div>

 <div className="flex flex-wrap gap-2">
 <Button
 color={lawyer.isActive ?"danger" :"success"}
 variant="flat"
 startContent={lawyer.isActive ? <FaTimesCircle /> : <FaCheckCircle />}
 isLoading={isUpdatingStatus}
 isDisabled={isUpdatingStatus}
 onPress={handleToggleStatus}
 >
 {lawyer.isActive ?"إيقاف الحساب" :"تنشيط الحساب"}
 </Button>
 <Button
 variant="flat"
 className="bg-[var(--surface-muted)] text-[var(--text-primary)]"
 startContent={<FaArrowRight />}
 onPress={() => navigate("/lawyers")}
 >
 قائمة المحامين
 </Button>
 {hasLawyerProfile ? (
 <Button
 className="bg-[var(--main-color)] text-white"
 startContent={<FaExternalLinkAlt />}
 onPress={() => navigate(`/ai-usage/${lawyer.lawyerId}`)}
 >
 استخدام الذكاء
 </Button>
 ) : null}
 </div>
 </div>
 </div>

 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <MetricCard label="إجمالي القضايا" value={formatNumber(activity.casesCount)} icon={<FaFolderOpen />} sub={`${formatNumber(activity.activeCasesCount)} قضية نشطة`} />
 <MetricCard label="العملاء" value={formatNumber(activity.clientsCount)} icon={<FaUsers />} sub="إجمالي العملاء المرتبطين" />
 <MetricCard label="التوكيلات" value={formatNumber(activity.powersOfAttorneyCount)} icon={<FaFileSignature />} sub={`${formatNumber(activity.activePowersOfAttorneyCount)} توكيل نشط`} />
 <MetricCard
 label="استخدام الذكاء"
 value={formatNumber(activity.aiRequestUsageCount ?? activity.aiUsageCount)}
 icon={<FaRobot />}
 sub={`${formatNumber(activity.ocrUsageCount ?? 0)} OCR، ${formatNumber(activity.aiTotalTokens)} توكن`}
 />
 </div>

 <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
 <div className="space-y-6">
 <section className="space-y-4">
 <SectionTitle icon={<FaIdCard />} title="البيانات الأساسية" />
 <div className="grid gap-3 md:grid-cols-2">
 <InfoField label="الاسم الكامل" value={lawyer.fullName} icon={<FaIdCard />} />
 <InfoField label="رقم الهاتف" value={lawyer.phoneNumber} icon={<FaPhone />} />
 <InfoField label="البريد الإلكتروني" value={lawyer.email} icon={<FaEnvelope />} />
 <InfoField label="المحافظة" value={lawyer.governorate} icon={<FaBalanceScale />} />
 <InfoField label="تاريخ إنشاء الحساب" value={formatDate(lawyer.createdAt)} icon={<FaCalendarAlt />} />
 <InfoField label="الموافقة على الشروط" value={lawyer.agreedToTerms ?"تمت الموافقة" :"غير مسجلة"} icon={<FaCheckCircle />} />
 </div>
 </section>

 <section className="space-y-4">
 <SectionTitle icon={<FaBriefcase />} title="البيانات المهنية" />
 <div className="grid gap-3 md:grid-cols-2">
 <InfoField label="اسم المكتب" value={lawyer.lawFirmName} icon={<FaBriefcase />} />
 <InfoField label="رقم القيد بالنقابة" value={lawyer.barNumber} icon={<FaIdCard />} />
 <InfoField label="التخصص القانوني" value={lawyer.specialization} icon={<FaBalanceScale />} />
 <InfoField label="سنوات الخبرة" value={lawyer.experienceNumber} icon={<FaChartLine />} />
 <InfoField label="تاريخ الميلاد" value={displayValue(lawyer.birthDate)} icon={<FaCalendarAlt />} />
 <InfoField label="تاريخ إنشاء الملف المهني" value={formatDate(lawyer.lawyerProfileCreatedAt)} icon={<FaRegClock />} />
 </div>
 </section>
 </div>

 <div className="space-y-6">
 <section className="space-y-4">
 <SectionTitle icon={<FaMoneyBillWave />} title="الاشتراك" />
 {subscription ? (
 <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] p-4 shadow-sm">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="text-sm font-bold text-[var(--text-primary)]">{subscription.planName ||"خطة غير مسماة"}</p>
 <p className="mt-1 text-xs text-[var(--text-secondary)]">من {formatDate(subscription.startDate)} إلى {formatDate(subscription.endDate)}</p>
 </div>
 <StatusBadge tone={subscription.isActive ?"success" :"warning"}>
 {subscription.isActive ?"نشط" :"منتهي أو متوقف"}
 </StatusBadge>
 </div>
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <InfoField label="المدة" value={`${formatNumber(subscription.durationDays)} يوم`} icon={<FaCalendarAlt />} />
 <InfoField 
    label="طلبات AI المتبقية" 
    value={aiRequestsLimit ? (
      <span dir="ltr">
        {formatNumber(remainingAiRequests)} / {formatNumber(aiRequestsLimit)}
      </span>
    ) : "غير محدود"} 
    icon={<FaRobot />} 
  />
 <InfoField label="طلبات AI المستخدمة" value={formatNumber(usedAiRequests)} icon={<FaRobot />} />
 <InfoField label="طلبات OCR" value={formatNumber(activity.ocrUsageCount ?? 0)} icon={<FaFileSignature />} />
 <InfoField label="السعر الشهري" value={formatNumber(subscription.price)} icon={<FaMoneyBillWave />} />
 <InfoField label="السعر السنوي" value={subscription.yearlyPrice ? formatNumber(subscription.yearlyPrice) : null} icon={<FaMoneyBillWave />} />
 </div>
 </div>
 ) : (
 <EmptyState text="لا يوجد اشتراك محفوظ لهذا المحامي" />
 )}
 </section>

 <section className="space-y-4">
 <SectionTitle icon={<FaChartLine />} title="مؤشرات النشاط" />
 <div className="grid gap-3 sm:grid-cols-2">
 <InfoField label="التقييمات" value={`${formatNumber(activity.reviewsCount)} تقييم`} icon={<FaStar />} />
 <InfoField label="متوسط التقييم" value={activity.averageReviewRating ? `${formatNumber(activity.averageReviewRating)} / 5` : null} icon={<FaStar />} />
 <InfoField label="التقييمات المعتمدة" value={formatNumber(activity.approvedReviewsCount)} icon={<FaCheckCircle />} />
 <InfoField label="تكلفة الذكاء التقديرية" value={formatCost(activity.aiEstimatedCostUsd)} icon={<FaRobot />} />
 <InfoField label="آخر نشاط" value={formatDate(activity.lastActivityAt)} icon={<FaRegClock />} />
 <InfoField label="التقييمات قيد المراجعة" value={formatNumber(activity.pendingReviewsCount)} icon={<FaRegClock />} />
 </div>
 </section>

 <section className="space-y-4">
 <SectionTitle icon={<FaUserShield />} title="توثيق الهاتف" />
 <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] p-4 shadow-sm">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div className="min-w-0">
 <p className="text-sm font-bold text-[var(--text-primary)]">
 {lawyer.phoneNumberConfirmed ?"رقم الهاتف موثق" : lawyer.phoneNumber ?"رقم الهاتف يحتاج توثيق" :"لا يوجد رقم هاتف"}
 </p>
 <p className="mt-1 max-w-[65ch] text-xs leading-6 text-[var(--text-secondary)]">
 استخدم التوثيق اليدوي فقط عند تعطل OTP وبعد التحقق من هوية المستخدم عبر الدعم.
 </p>
 </div>
 <StatusBadge tone={lawyer.phoneNumberConfirmed ?"success" : lawyer.phoneNumber ?"warning" :"neutral"} icon={<FaPhone />}>
 {lawyer.phoneNumberConfirmed ?"موثق" : lawyer.phoneNumber ?"غير موثق" :"غير متاح"}
 </StatusBadge>
 </div>

 {canVerifyPhoneManually ? (
 <div className="mt-4 space-y-3">
 <Textarea
 label="سبب التوثيق اليدوي"
 placeholder="مثال: تعذر وصول OTP وتم التحقق من هوية المستخدم عبر الدعم"
 minRows={3}
 maxRows={5}
 maxLength={500}
 value={manualReason}
 onValueChange={(value) => {
 setManualReason(value);
 if (manualReasonError && value.trim()) setManualReasonError(null);
 }}
 isInvalid={Boolean(manualReasonError)}
 errorMessage={manualReasonError ?? undefined}
 classNames={{
 inputWrapper:"rounded-lg border border-[var(--border-color)] bg-[var(--surface-soft)]",
 label:"text-[var(--text-secondary)]",
 }}
 />
 <div className="flex flex-wrap items-center justify-between gap-3">
 <p className="text-xs text-[var(--text-muted)]">
 سيتم حفظ السبب واسم الأدمن في سجل التدقيق.
 </p>
 <Button
 className="bg-[var(--main-color)] text-white"
 startContent={<FaCheckCircle />}
 isLoading={isVerifyingPhone}
 isDisabled={isVerifyingPhone}
 onPress={handleVerifyPhone}
 >
 توثيق الهاتف يدويًا
 </Button>
 </div>
 </div>
 ) : null}

 {latestManualVerification ? (
 <div className="mt-4 rounded-lg border border-[var(--border-color)] bg-[var(--surface-soft)] p-3">
 <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
 <FaRegClock className="text-[var(--main-color)]" />
 <span>آخر توثيق يدوي</span>
 </div>
 <div className="grid gap-2 text-xs leading-6 text-[var(--text-secondary)]">
 <p><span className="font-semibold text-[var(--text-primary)]">بواسطة:</span> {displayValue(latestManualVerification.verifiedByAdminName)}</p>
 <p><span className="font-semibold text-[var(--text-primary)]">التاريخ:</span> {formatDate(latestManualVerification.createdAt)}</p>
 <p><span className="font-semibold text-[var(--text-primary)]">الهاتف:</span> {displayValue(latestManualVerification.phoneNumber)}</p>
 <p className="break-words"><span className="font-semibold text-[var(--text-primary)]">السبب:</span> {displayValue(latestManualVerification.reason)}</p>
 </div>
 </div>
 ) : null}
 </div>
 </section>
 </div>
 </div>

 <div className="grid gap-6 xl:grid-cols-2">
 <section className="space-y-4">
 <SectionTitle icon={<FaFolderOpen />} title="أحدث القضايا" />
 {lawyer.recentCases.length ? (
 <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] shadow-sm">
 {lawyer.recentCases.map((item) => (
 <div key={item.id} className="border-b border-[var(--border-color)] last:border-b-0">
 <button
 type="button"
 className="w-full px-4 py-3 text-right transition-colors hover:bg-[var(--surface-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]/30"
 onClick={() => setExpandedCaseId((current) => current === item.id ? null : item.id)}
 aria-expanded={expandedCaseId === item.id}
 >
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <span className="text-[var(--main-color)]">{expandedCaseId === item.id ? <FaChevronUp /> : <FaChevronDown />}</span>
 <p className="break-words text-sm font-bold text-[var(--text-primary)]">{item.title ||"قضية بدون عنوان"}</p>
 </div>
 <p className="mt-1 break-words text-xs leading-6 text-[var(--text-secondary)]">{displayValue(item.number)}، {displayValue(item.court)}، {displayValue(item.clientName)}</p>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <StatusBadge tone={item.isActive ?"success" :"neutral"}>{getCaseStatus(item.status)}</StatusBadge>
 <StatusBadge tone={(item.workflows?.length ?? 0) > 0 ?"warning" :"neutral"}>
 {formatNumber(item.workflows?.length ?? 0)} مسار
 </StatusBadge>
 </div>
 </div>
 <p className="mt-2 text-xs text-[var(--text-muted)]">{formatDate(item.created)}</p>
 </button>

 {expandedCaseId === item.id ? (
 <div className="border-t border-[var(--border-color)] bg-[var(--surface-soft)] px-4 py-4">
 {item.workflows?.length ? (
 <div className="space-y-3">
 {item.workflows.map((workflow) => (
 <div key={`${workflow.workflowKey}-${workflow.workflowRunId ?? "legacy"}`} className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] p-3">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <p className="text-sm font-bold text-[var(--text-primary)]">{workflow.workflowName}</p>
 <p className="mt-1 text-xs text-[var(--text-secondary)]">
 {formatNumber(workflow.completedSteps)} مكتملة من {formatNumber(workflow.requestCount)}، {formatNumber(workflow.totalTokens)} توكن، {formatCost(workflow.totalCostUsd)}
 </p>
 </div>
 {workflow.failedSteps > 0 ? (
 <StatusBadge tone="danger">{formatNumber(workflow.failedSteps)} فشل</StatusBadge>
 ) : (
 <StatusBadge tone="success">بدون أخطاء</StatusBadge>
 )}
 </div>

 <div className="mt-3 space-y-2">
 {workflow.steps.map((step, index) => (
 <div key={`${workflow.workflowKey}-${step.stepType ?? step.aiStepType ?? index}-${step.createdAt}`} className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-soft)] px-3 py-3">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div className="min-w-0">
 <p className="break-words text-xs font-bold text-[var(--text-primary)]">{step.stepName}</p>
 <p className="mt-1 text-xs leading-6 text-[var(--text-secondary)]">
 {step.modelIdentifier ||"نموذج غير محدد"}، {formatNumber(step.totalTokens)} توكن، {formatCost(step.estimatedCostUsd)}
 </p>
 </div>
 <StatusBadge tone={getJobStatusTone(step.status)}>{getJobStatusLabel(step.status)}</StatusBadge>
 </div>
 <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
 <span>بدأت: {formatDate(step.createdAt)}</span>
 <span>اكتملت: {formatDate(step.completedAt)}</span>
 </div>
 {step.errorMessage ? (
 <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-6 text-red-700">{step.errorMessage}</p>
 ) : null}
 {step.resultPreview ? (
 <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] px-3 py-2 text-xs leading-6 text-[var(--text-secondary)]">
 {step.resultPreview}
 </pre>
 ) : (
 <p className="mt-2 text-xs text-[var(--text-muted)]">لا توجد نتيجة محفوظة لهذه الخطوة.</p>
 )}
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <EmptyState text="لم يتم تشغيل مسارات ذكاء على هذه القضية بعد" />
 )}
 </div>
 ) : null}
 </div>
 ))}
 </div>
 ) : (
 <EmptyState text="لا توجد قضايا محفوظة لهذا المحامي" />
 )}
 </section>

 <section className="space-y-4">
 <SectionTitle icon={<FaMoneyBillWave />} title="سجل الاشتراكات" />
 {lawyer.recentSubscriptions.length ? (
 <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] shadow-sm">
 {lawyer.recentSubscriptions.map((item) => (
 <div key={item.id} className="border-b border-[var(--border-color)] px-4 py-3 last:border-b-0">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="min-w-0">
 <p className="break-words text-sm font-bold text-[var(--text-primary)]">{item.planName ||"خطة غير مسماة"}</p>
 <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatDate(item.startDate)}، {formatDate(item.endDate)}</p>
 </div>
 <StatusBadge tone={item.isActive ?"success" :"warning"}>{item.isActive ?"نشط" :"غير نشط"}</StatusBadge>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <EmptyState text="لا يوجد سجل اشتراكات" />
 )}
 </section>

 <section className="space-y-4">
 <SectionTitle icon={<FaStar />} title="أحدث التقييمات" />
 {lawyer.recentReviews.length ? (
 <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] shadow-sm">
 {lawyer.recentReviews.map((item) => (
 <div key={item.id} className="border-b border-[var(--border-color)] px-4 py-3 last:border-b-0">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <p className="break-words text-sm font-bold text-[var(--text-primary)]">{item.reviewerName}</p>
 <StatusBadge tone={item.status.toLowerCase() ==="approved" ?"success" :"warning"}>{translateReviewStatus(item.status)}</StatusBadge>
 </div>
 <p className="mt-2 break-words text-xs leading-6 text-[var(--text-secondary)]">{item.comment}</p>
 <p className="mt-2 text-xs text-[var(--text-muted)]">{formatNumber(item.rating)} / 5، {formatDate(item.created)}</p>
 </div>
 ))}
 </div>
 ) : (
 <EmptyState text="لا توجد تقييمات حتى الآن" />
 )}
 </section>

 <section className="space-y-4">
 <SectionTitle icon={<FaRobot />} title="أحدث استخدام للذكاء" />
 {lawyer.recentAiUsage.length ? (
 <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] shadow-sm">
 {lawyer.recentAiUsage.map((item) => (
 <div key={item.id} className="border-b border-[var(--border-color)] px-4 py-3 last:border-b-0">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <p className="break-words text-sm font-bold text-[var(--text-primary)]">{item.provider ||"مزود غير محدد"}</p>
 <StatusBadge tone="neutral">{item.modelIdentifier ||"نموذج غير محدد"}</StatusBadge>
 </div>
 <p className="mt-2 text-xs leading-6 text-[var(--text-secondary)]">
 خطوة {formatNumber(item.aiStepType)}، {formatNumber(item.totalTokens)} توكن، {formatCost(item.estimatedCostUsd)}
 </p>
 <p className="mt-2 text-xs text-[var(--text-muted)]">{formatDate(item.createdAt)}</p>
 </div>
 ))}
 </div>
 ) : (
 <EmptyState text="لا يوجد استخدام مسجل للذكاء" />
 )}
 </section>
 </div>
 </div>
 </Container>
 </section>
 );
};

export default LawyerDetails;
