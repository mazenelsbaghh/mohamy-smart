import usePageTitle from '../../hooks/usePageTitle';
import { Container } from'@mohamy/shared-ui';
import { useEffect, useState, useCallback, useMemo } from'react';
import { useAppDispatch, useAppSelector } from'../../hooks/reduxHooks';
import thunkGetSubscriptionPlans from'../../redux/subscription/thunk/thunkGetSubscriptionPlans';
import thunkGetLawyerPlan from'../../redux/subscription/thunk/thunkGetLawyerPlan';
import thunkAddSubscriptionPlan from'../../redux/subscription/thunk/thunkAddSubscriptionPlan';

import HeadTitle from'../../components/headTitle/HeadTitle';
import { sileo } from"sileo";
import'./Subscription.css';
import PaymentModal from'../../components/payment/PaymentModal';
import { BiCheckCircle, BiShield, BiTime, BiInfoCircle } from 'react-icons/bi';
import { HiSparkles } from 'react-icons/hi';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale/ar';

const FEATURE_DESCRIPTIONS: Record<string, string> = {'10 ساعات تحليل ذكي':'يتيح لك استخدام محرك الذكاء الاصطناعي لتحليل القضايا والمستندات لمدة 10 ساعات شهرياً','50 ملف قضية نشط':'الحد الأقصى لعدد القضايا المفتوحة التي يمكنك إدارتها في نفس الوقت','دعم عبر البريد الإلكتروني':'الرد على استفساراتك خلال 24 ساعة عمل','استشارات ذات أولوية':'تخطي طابور الانتظار والحصول على دعم فني وقانوني فوري','ساعات تحليل غير محدودة':'استخدام غير مقيد لمحرك الذكاء الاصطناعي دون حدود شهرية','عدد غير محدود من القضايا':'إدارة عدد لا نهائي من القضايا والموكلين عبر المنصة','أدوات التحليل المقارن':'مقارنة قضاياك بسوابق قضائية مماثلة لتوقع النتائج بدقة','تخصيص الخوارزميات':'تدريب محرك الذكاء الاصطناعي على قضايا وتخصصات مكتبك حصرياً','تكامل API مخصص':'ربط المنصة مع أنظمتك الداخلية (ERP/CRM)','إدارة حساب مخصص 24/7':'مدير حساب شخصي متاح على مدار الساعة لدعم مكتبك','تدريب حصري للفريق':'دورات تدريبية مخصصة لفريق عملك على استخدام المنصة بكفاءة','بنية تحتية مخصصة':'خوادم خاصة لمؤسستك تضمن أعلى معايير الأمان والسرعة'
};

const Subscription = () => {
 const dispatch = useAppDispatch();
  usePageTitle('الاشتراك');
 const { plans, lawyerPlan, paymentLoading, activePaymentUrl, plansLoading } = useAppSelector(s => s.subscription);
 const { user } = useAppSelector(s => s.auth);


 const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
 const [checkingPlan, setCheckingPlan] = useState<number | null>(null);

 const [paymentModalOpen, setPaymentModalOpen] = useState(false);
 const [selectedPlanIdForPayment, setSelectedPlanIdForPayment] = useState<number | null>(null);

 const openPaymentModal = useCallback((planId: number) => {
   setSelectedPlanIdForPayment(planId);
   setPaymentModalOpen(true);
 }, []);

 const closePaymentModal = useCallback(() => {
   setPaymentModalOpen(false);
   setSelectedPlanIdForPayment(null);
 }, []);

  const filteredPlans = useMemo(() => {
    return plans.filter(p => p.name !== 'الباقة التجريبية' && p.name !== 'Free Trial');
  }, [plans]);

 const selectedPlanDetails = useMemo(() => {
   if (!selectedPlanIdForPayment) return null;
   const p = filteredPlans.find(plan => plan.id === selectedPlanIdForPayment);
   if (!p) return null;
   const isYearly = billingCycle === 'yearly' && p.hasYearlyOption && p.yearlyPrice != null && p.yearlyPrice > 0;
   const displayPrice = isYearly ? p.yearlyPrice! : p.price;
   return { name: p.name, price: displayPrice };
 }, [selectedPlanIdForPayment, filteredPlans, billingCycle]);

 useEffect(() => {
 dispatch(thunkGetSubscriptionPlans());
 if (user?.profileId) {
 dispatch(thunkGetLawyerPlan({ lawyerId: user.profileId }));
 }
 }, [dispatch, user?.profileId]);

 useEffect(() => {
 if (activePaymentUrl) {
 try {
 const url = new URL(activePaymentUrl);
 if (url.protocol ==='https:') {
 window.open(activePaymentUrl,'_blank','noopener,noreferrer');
 sileo.success({ title:'تم فتح صفحة الدفع في نافذة جديدة' });
 } else {
 sileo.error({ title:'رابط الدفع غير صالح' });
 }
 } catch {
 sileo.error({ title:'رابط الدفع غير صالح' });
 }
 }
 }, [activePaymentUrl]);

  const handleConfirmSubscription = useCallback(async (method: 'wallet' | 'card') => {
  if (selectedPlanIdForPayment === null) return;
  const planId = selectedPlanIdForPayment;
  setCheckingPlan(planId);
  try {
  const res = await dispatch(thunkAddSubscriptionPlan({ planId, paymentMethod: method, billingCycle })).unwrap();
  closePaymentModal();
  
  if (!res.paymentUrl || res.paymentUrl.trim() === '') {
      sileo.success({ title: 'تم الاشتراك وتفعيل الباقة بنجاح 🎉' });
      if (user?.profileId) {
          dispatch(thunkGetLawyerPlan({ lawyerId: user.profileId }));
      }
  }
  } catch (err: unknown) {
  sileo.error({ title: (typeof err === 'string' ? err : undefined) || 'تعذّر تنفيذ العملية. أعد المحاولة.' });
  } finally {
  setCheckingPlan(null);
  }
  }, [dispatch, billingCycle, selectedPlanIdForPayment, closePaymentModal, user?.profileId]);

 const usagePercent = useMemo(() => {
 if (!lawyerPlan) return 0;
 return Math.min(100, Math.round((lawyerPlan.usedAiRequests / lawyerPlan.limit) * 100));
 }, [lawyerPlan]);

  const hasApiPlans = useMemo(() => filteredPlans.length > 0, [filteredPlans.length]);

  const anyPlanHasYearly = useMemo(() => filteredPlans.some(p => p.hasYearlyOption && p.yearlyPrice != null && p.yearlyPrice > 0), [filteredPlans]);

 return (
 <section className="subscription-page" dir="rtl">
 <Container>
 <HeadTitle title="الباقات والاشتراكات" />

 {/* Current Plan Banner */}
 {lawyerPlan && lawyerPlan.isActive && (
 <div className="bg-[var(--white-color)] dark:bg-[var(--surface-color)] border app-border dark:app-border-strong rounded-3xl p-6 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
 <div className="absolute top-0 end-0 w-1.5 h-full bg-[var(--main-color)]" />
 <div className="flex items-center gap-5 relative z-10">
 <div className="w-14 h-14 rounded-2xl bg-[var(--main-color)]/10 flex items-center justify-center text-[var(--main-color)]">
 <BiShield size={28} />
 </div>
 <div>
 <span className="text-xs font-bold text-[var(--main-color)] bg-[var(--main-color)]/10 px-2.5 py-1 rounded-lg mb-2 inline-block">باقتك الحالية</span>
 <h3 className="text-2xl font-bold text-[var(--title-color)] m-0">{lawyerPlan.planName}</h3>
 <p className="text-sm text-[var(--text-color)] mt-1.5 flex items-center gap-1.5 font-medium">
 <BiTime size={16} className="text-[var(--main-color)]" /> ينتهي {formatDistanceToNow(parseISO(lawyerPlan.endDate), { locale: ar, addSuffix: true })}
 </p>
 </div>
 </div>
 
 <div className="w-full md:w-auto flex-1 max-w-md bg-[var(--surface-muted)] dark:bg-[#1b1b1b]/20 p-5 rounded-2xl border border-[var(--border-color)] dark:border-white/5 relative z-10">
 <div className="flex justify-between text-sm mb-3">
 <span className="font-bold text-[var(--title-color)]">طلبات الذكاء المتبقية</span>
 <span className="text-[var(--main-color)] font-bold" dir="ltr">{Math.max(0, lawyerPlan.limit - lawyerPlan.usedAiRequests)} / {lawyerPlan.limit}</span>
 </div>
 <div className="w-full h-2.5 bg-[#1b1b1b]/5 dark:bg-white/5 rounded-full overflow-hidden">
 <div 
 className="h-full rounded-full transition-colors duration-1000 ease-out relative"
 style={{ 
 width: `${usagePercent}%`,
 backgroundColor: usagePercent > 85 ? '#ef4444' : usagePercent > 60 ? '#eab308' : 'var(--main-color)'
 }}
 >
 <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Controls Section: Billing Cycle & Payment Method */}
  <div className="flex flex-col md:flex-row justify-center items-center mb-10 gap-6 relative z-10">
  {anyPlanHasYearly && (
  <div className="flex items-center p-1.5 rounded-2xl bg-[var(--white-color)] dark:bg-[var(--surface-color)] border app-border dark:app-border-strong shadow-sm w-full md:w-auto">
  <button
  type="button"
  className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'bg-[var(--main-color)] text-white shadow-md' : 'text-[var(--text-color)] hover:text-[var(--title-color)]'}`}
  onClick={() => setBillingCycle('monthly')}
  >
  شهري
  </button>
  <button
  type="button"
  className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${billingCycle === 'yearly' ? 'bg-[var(--main-color)] text-white shadow-md' : 'text-[var(--text-color)] hover:text-[var(--title-color)]'}`}
  onClick={() => setBillingCycle('yearly')}
  >
  سنوي
  </button>
  </div>
  )}


 </div>

 {/* Plans Grid */}
 {plansLoading === 'pending' ? (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
 {[1, 2, 3].map(i => (
 <div key={i} className="min-h-[500px] rounded-3xl bg-[var(--surface-muted)] dark:bg-white/5 animate-pulse" />
 ))}
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-stretch">
 {hasApiPlans ? (
  filteredPlans.map((plan, idx) => {
  const isCurrentPlan = lawyerPlan?.planName === plan.name && lawyerPlan?.isActive;
  const isPopular = plan.isPopular;
  const isLoading = paymentLoading === 'pending' && checkingPlan === plan.id;
  const isYearly = billingCycle === 'yearly' && plan.hasYearlyOption && plan.yearlyPrice != null && plan.yearlyPrice > 0;
  const displayPrice = isYearly ? plan.yearlyPrice! : plan.price;
  const displayDuration = isYearly ? 'سنة' : `${Math.round(plan.durationDays / 30)} شهر`;
  const yearlySavingsPercent = plan.yearlyPrice != null && plan.yearlyPrice > 0 ? Math.round(((plan.price * 12 - plan.yearlyPrice) / (plan.price * 12)) * 100) : 0;

  return (
 <div
 key={plan.id}
 className={`relative rounded-3xl p-8 flex flex-col gap-6 transition-colors duration-300 ${isPopular ? 'bg-[var(--surface-color)] dark:bg-[var(--surface-color)] border-2 border-[var(--main-color)] shadow-md transform md:-translate-y-2' : 'bg-[var(--white-color)] dark:bg-[var(--surface-color)] border app-border dark:app-border-strong shadow-sm hover:shadow-md'} ${isCurrentPlan ? 'ring-2 ring-[var(--main-color)] ring-offset-2 ring-offset-[var(--bg-color)]' : ''}`}
 >
 {isPopular && (
 <div className="absolute -top-4 inset-x-0 mx-auto w-max bg-[var(--main-color)] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
 <HiSparkles size={14} /> الأكثر طلباً
 </div>
 )}
 {isCurrentPlan && (
 <div className="absolute -top-4 inset-x-0 mx-auto w-max bg-[var(--success-color)] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
 <BiCheckCircle size={14} /> باقتك الحالية
 </div>
 )}

 <div className="text-center">
 <h3 className={`text-2xl font-black mb-1 ${isPopular ? 'text-[var(--main-color)]' : 'text-[var(--title-color)]'}`}>{plan.name}</h3>
 <p className="text-xs text-[var(--text-color)] font-bold tracking-widest uppercase opacity-70">
 {idx === 0 ? 'للمحامين المستقلين' : idx === 1 ? 'نخبة مكاتب المحاماة' : 'للمؤسسات الكبرى'}
 </p>
 </div>

  <div className="flex items-center justify-center gap-2 my-2" dir="rtl">
  <span className="text-5xl font-black text-[var(--title-color)] leading-none">{displayPrice}</span>
  <div className="flex flex-col items-start justify-center pt-1 leading-tight">
  <span className="text-lg font-bold text-[var(--text-color)] opacity-80">ج.م</span>
  <span className="text-sm font-medium text-[var(--text-color)] opacity-60">/ {displayDuration}</span>
  </div>
  {isYearly && yearlySavingsPercent > 0 && (
  <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-500/10 text-[var(--success-color)] font-bold mr-2">وفّر {yearlySavingsPercent}%</span>
  )}
  </div>
  {!isYearly && plan.hasYearlyOption && plan.yearlyPrice != null && plan.yearlyPrice > 0 && (
  <p className="text-center text-xs text-[var(--text-color)] opacity-60 mt-1">أو {plan.yearlyPrice} ج.م / سنة {yearlySavingsPercent > 0 && <span className="text-[var(--success-color)] font-bold">وفّر {yearlySavingsPercent}%</span>}</p>
  )}

 <ul className="flex flex-col gap-4 flex-1 mt-4">
 <li className="flex items-start gap-3">
 <div className="w-5 h-5 rounded-full bg-[var(--main-color)]/10 flex items-center justify-center shrink-0 mt-0.5">
 <BiCheckCircle className="text-[var(--main-color)] text-sm" />
 </div>
 <span className="text-sm font-semibold text-[var(--title-color)]">{plan.aiRequestsLimit} طلب ذكاء اصطناعي</span>
 </li>
 <li className="flex items-start gap-3">
 <div className="w-5 h-5 rounded-full bg-[var(--main-color)]/10 flex items-center justify-center shrink-0 mt-0.5">
 <BiCheckCircle className="text-[var(--main-color)] text-sm" />
 </div>
 <span className="text-sm font-semibold text-[var(--title-color)]">{plan.durationDays} يوم نشاط</span>
 </li>
 {Array.isArray(plan.features) && plan.features.map((f: string, fi: number) => (
 <li key={fi} className="group relative flex items-start gap-3">
 <div className="w-5 h-5 rounded-full bg-[var(--main-color)]/10 flex items-center justify-center shrink-0 mt-0.5">
 <BiCheckCircle className="text-[var(--main-color)] text-sm" />
 </div>
 <span className="text-sm font-medium text-[var(--text-color)] leading-snug flex-1">{f}</span>
 {FEATURE_DESCRIPTIONS[f as string] && (
 <div className="relative flex items-center shrink-0 mt-0.5">
 <BiInfoCircle className="text-[var(--text-color)] opacity-50 hover:text-[var(--main-color)] hover:opacity-100 cursor-help transition-colors" size={16} />
 <div className="absolute bottom-full start-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-[#1b1b1b]/90 backdrop-blur-md text-white text-xs leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-colors duration-200 z-10 text-center shadow-xl pointer-events-none">
 {FEATURE_DESCRIPTIONS[f as string]}
 <div className="absolute top-full start-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
 </div>
 </div>
 )}
 </li>
 ))}
 </ul>

 <button
 className={`w-full py-4 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2 mt-4 ${
 isCurrentPlan 
 ? 'bg-green-500/10 text-[var(--success-color)] cursor-not-allowed border border-green-500/20' 
 : isPopular
 ? 'bg-[var(--main-color)] text-white hover:shadow-[0_8px_20px_rgba(239,149,10,0.3)]'
 : 'bg-transparent border-2 border-[var(--opacity-color)] text-[var(--title-color)] hover:border-[var(--main-color)] hover:text-[var(--main-color)]'
 }`}
 onClick={() => !isCurrentPlan && openPaymentModal(plan.id)}
 disabled={isCurrentPlan || paymentLoading === 'pending'}
 >
 {isLoading ? (
 <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
 ) : isCurrentPlan ? ('باقتك الحالية ✓') : ('اشترك الآن')}
 </button>
 </div>
 );
 })
 ) : (
 <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-[var(--white-color)] dark:bg-[var(--surface-color)] rounded-3xl border app-border dark:app-border-strong border-dashed">
 <p className="text-xl font-bold text-[var(--title-color)]">لا توجد باقات متاحة حالياً</p>
 <p className="text-sm text-[var(--text-color)] mt-2">يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.</p>
 </div>
 )}
 </div>
 )}

 {/* Trust / Why Section */}
 <div className="bg-[var(--white-color)] dark:bg-[var(--surface-color)] border app-border dark:app-border-strong rounded-3xl p-8 lg:p-12 mb-8 mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center shadow-sm relative overflow-hidden">
 <div className="absolute -top-40 -start-40 w-96 h-96 bg-[var(--main-color)] opacity-5 blur-[100px] rounded-full pointer-events-none" />
 
 <div className="relative z-10">
 <h4 className="text-2xl md:text-3xl font-black text-[var(--title-color)] mb-4 leading-tight">لماذا يعتمد نخبة المحامين على <span className="text-[var(--main-color)]">محامي سمارت؟</span></h4>
 <p className="text-[var(--text-color)] leading-relaxed mb-8 text-sm md:text-base opacity-80">
 منصتنا مصممة خصيصاً لتلبية احتياجات السوق القانوني. نحن نجمع بين أحدث تقنيات الذكاء الاصطناعي ومعايير الأمان الصارمة لنقدم لك مساعداً يختصر ساعات من البحث والمراجعة بدقة متناهية.
 </p>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-[var(--surface-muted)] dark:bg-[#1b1b1b]/20 p-5 rounded-2xl border border-[var(--border-color)] dark:border-white/5 shadow-sm">
 <p className="text-3xl font-black text-[var(--main-color)] mb-1 drop-shadow-sm">+10x</p>
 <p className="text-xs font-bold text-[var(--title-color)] uppercase tracking-wider opacity-80">سرعة في المراجعة</p>
 </div>
 <div className="bg-[var(--surface-muted)] dark:bg-[#1b1b1b]/20 p-5 rounded-2xl border border-[var(--border-color)] dark:border-white/5 shadow-sm">
 <p className="text-3xl font-black text-[var(--main-color)] mb-1 drop-shadow-sm">100%</p>
 <p className="text-xs font-bold text-[var(--title-color)] uppercase tracking-wider opacity-80">تشفير وحماية</p>
 </div>
 </div>
 </div>
 <div className="flex justify-center relative z-10">
 <div className="bg-[var(--white-color)] dark:bg-[var(--surface-color)] border app-border dark:app-border-strong rounded-[2rem] p-12 flex flex-col items-center gap-6 text-center w-full max-w-sm shadow-sm transition-transform duration-300">
 <div className="w-24 h-24 rounded-full bg-[var(--main-color)]/10 flex items-center justify-center">
 <BiShield className="text-6xl text-[var(--main-color)] drop-shadow-md" />
 </div>
 <span className="text-xl font-bold text-[var(--title-color)]">بياناتك وموكليك<br/>محمية بالكامل 🔒</span>
 </div>
 </div>
 </div>

 </Container>

 {selectedPlanDetails && (
   <PaymentModal
     isOpen={paymentModalOpen}
     onClose={closePaymentModal}
     planName={selectedPlanDetails.name}
     planPrice={selectedPlanDetails.price}
     onConfirm={handleConfirmSubscription}
     loading={checkingPlan !== null}
   />
 )}
 </section>
 );
};

export default Subscription;
