import { CustomButton, CustomCard } from'@mohamy/shared-ui';
import'./Settings.css';
import SubTitle from'../../../components/subTitle/SubTitle';

import { useAppDispatch, useAppSelector } from'../../../hooks/reduxHooks';
import { useEffect, useState } from'react';
import thunkGetSubscriptionPlans from'../../../redux/subscription/thunk/thunkGetSubscriptionPlans';
import SkeletonCardsList from'../../../components/skeleton/SkeletonCardsList';
import type { TUser } from'../../../types/types';
import thunkGetLawyerPlan from'../../../redux/subscription/thunk/thunkGetLawyerPlan';
import { sileo } from"sileo";
import thunkAddSubscriptionPlan from'../../../redux/subscription/thunk/thunkAddSubscriptionPlan';
import thunkGetAiPointBalance from'../../../redux/subscription/thunk/thunkGetAiPointBalance';
import thunkGetAiPointHistory from'../../../redux/subscription/thunk/thunkGetAiPointHistory';
import { AiPointBalancePill, AiPointHistoryList } from '../../../components/aiPoints';

import { format, parseISO } from'date-fns';
import { ar } from'date-fns/locale/ar';
import PaymentModal from'../../../components/payment/PaymentModal';
import { useSearchParams } from'react-router-dom';
import { LuCircleCheck, LuCircleX, LuCircleAlert, LuCheck } from'react-icons/lu';



type TSubscription = {
 user: TUser;
}

const Subscription = ({ user }: TSubscription) => {
 const dispatch = useAppDispatch();
 const { plans, lawyerPlan, loading, paymentLoading, aiPointBalance, aiPointHistory } = useAppSelector((state) => state.subscription);
 const [searchParams, setSearchParams] = useSearchParams();

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedPlan, setSelectedPlan] = useState<{ id: number; name: string; price: number } | null>(null);

 useEffect(() => {
 // Handle redirect from Paymob
 const pmStatus = searchParams.get('status');
 if (pmStatus) {
 if (pmStatus ==='success') {
 sileo.success({ title:'تم إتمام عملية الدفع بنجاح' });
 } else if (pmStatus ==='failed') {
 sileo.error({ title:'لم تكتمل عملية الدفع. لم يُخصم أي مبلغ.' });
 } else if (pmStatus ==='error') {
 sileo.error({ title:'تعذّر التحقق من الدفع. تواصل مع الدعم إن خُصم منك أي مبلغ.' });
 }
 
 // Cleanup URL
 const params = new URLSearchParams(searchParams);
 params.delete('status');
 params.delete('transactionId');
 setSearchParams(params, { replace: true });
 }

 dispatch(thunkGetSubscriptionPlans());
 dispatch(thunkGetAiPointBalance());
 dispatch(thunkGetAiPointHistory());
 dispatch(thunkGetLawyerPlan({ lawyerId: user.profileId }))
 .unwrap()
 .catch((err: string) => sileo.error({ title: err }));
 }, [dispatch, searchParams, setSearchParams, user.profileId]);

 const openPaymentModal = (planId: number, planName: string, planPrice: number) => {
 setSelectedPlan({ id: planId, name: planName, price: planPrice });
 setIsModalOpen(true);
 };

 const handleConfirmSubscription = async (method:'wallet' |'card') => {
 if (!selectedPlan) return;

 try {
 const res = await dispatch(thunkAddSubscriptionPlan({ planId: selectedPlan.id, paymentMethod: method })).unwrap();
 if (res.paymentUrl) {
 window.location.href = res.paymentUrl;
 } else {
 sileo.error({ title:'تعذّر إنشاء رابط الدفع. أعد المحاولة أو تواصل مع الدعم.' });
 }
 } catch (err: unknown) {
 sileo.error({ title: (err as string) ||'حدث خطأ. أعد المحاولة أو تواصل مع الدعم.' });
 setIsModalOpen(false);
 setSelectedPlan(null);
 }
 };

 const usagePercentage = lawyerPlan
 ? Math.min((lawyerPlan.usedAiRequests / lawyerPlan.limit) * 100, 100)
 : 0;

 return (
 <div className='subscription pt-5 pb-10'>

 {/* Current Plan */}
 <SubTitle title='خطتك الحالية' />

 {loading ==='pending' && <SkeletonCardsList />}

 {!lawyerPlan && loading !=='pending' && (
 <p className='text-[var(--text-color)] text-lg my-4'>
 أنت غير مشترك في أي خطة حاليًا
 </p>
 )}

 {lawyerPlan && (
 <div className="w-full max-w-xl mb-8">
 <CustomCard>
 <div className="p-6">
 {/* Name + Status */}
 <div className="flex items-center justify-between mb-5">
  <div className="flex items-center gap-1.5">
    <h3 className="text-xl font-bold text-[var(--title-color)]">
      {lawyerPlan.planName}
    </h3>
    {(lawyerPlan.planName === 'الباقة التجريبية' || lawyerPlan.planName === 'Free Trial') && (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--main-color)]/10 text-[var(--main-color)] font-medium">تجريبية</span>
    )}
  </div>
 <AiPointBalancePill balance={aiPointBalance} />
 <span className={`text-sm px-3 py-1 rounded-full font-medium ${lawyerPlan.isActive ?'bg-[var(--success-soft)] text-[var(--success-color)]' :'bg-[var(--danger-soft)] text-[var(--danger-color)]'}`}>
 <span className="flex items-center gap-1">{lawyerPlan.isActive ? <><LuCircleCheck size={14} />نشطة</> : <><LuCircleX size={14} />غير نشطة</>}</span>
 </span>
 </div>

 {/* AI Limit */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
 <div className="bg-[var(--surface-muted)] rounded-xl p-3 text-center">
 <p className="text-xs text-[var(--text-color)] mb-1">الحد الأقصى للـ AI</p>
 <h4 className="text-lg font-bold text-[var(--title-color)]">{lawyerPlan.limit}</h4>
 </div>
 <div className="bg-[var(--surface-muted)] rounded-xl p-3 text-center">
 <p className="text-xs text-[var(--text-color)] mb-1">المستخدم</p>
 <h4 className="text-lg font-bold text-[var(--main-color)]">{lawyerPlan.usedAiRequests}</h4>
 </div>
 </div>

 {/* Progress */}
 <div className="mb-5">
 <div className="flex justify-between text-sm mb-2">
 <span className="text-[var(--text-color)]">الاستخدام</span>
 <span className="font-semibold text-[var(--title-color)]">{lawyerPlan.usedAiRequests} / {lawyerPlan.limit}</span>
 </div>
 <div className="w-full bg-[var(--surface-soft)] rounded-full h-2.5">
 <div
 className={`h-2.5 rounded-full transition-colors duration-500 ${usagePercentage >= 90 ?'bg-[var(--danger-color)]' :'bg-[var(--main-color)]'}`}
 style={{ width: `${usagePercentage}%` }}
 />
 </div>
 {usagePercentage >= 90 && (
 <p className="flex items-center gap-1 text-xs text-[var(--danger-color)] mt-1"><LuCircleAlert size={13} /> اقتربت من الحد الأقصى</p>
 )}
 </div>

 {/* Dates */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
 <div>
 <p className="text-[var(--text-color)] mb-1">تاريخ البداية</p>
 <p className="font-medium text-[var(--title-color)]">{format(parseISO(lawyerPlan.startDate),'d MMMM yyyy', { locale: ar })}</p>
 </div>
 <div>
 <p className="text-[var(--text-color)] mb-1">تاريخ الانتهاء</p>
 <p className="font-medium text-[var(--title-color)]">{format(parseISO(lawyerPlan.endDate),'d MMMM yyyy', { locale: ar })}</p>
 </div>
 </div>
 </div>
 </CustomCard>
 <div className="mt-4">
 <AiPointHistoryList items={aiPointHistory} />
 </div>
 </div>
 )}

 {/* Available Plans */}
 <SubTitle title='خطط الاشتراكات المتاحة' />

 <p className='text-[var(--text-color)] text-sm mb-4'>
 بعد نجاح الدفع وتفعيل الباقة سنرسل رسالة تأكيد الاشتراك إلى بريدك الإلكتروني المسجل.
 </p>

 {plans.length > 0 && (
 <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
 {plans.map((plan) => (
 <div
 key={plan.id}
 className="bg-[var(--white-color)] rounded-2xl shadow-md p-6 border border-[var(--border-color)] hover:shadow-xl transition-colors duration-200 flex flex-col justify-between"
 >
 <div>
  <div className="flex items-center gap-1.5 mb-1">
    <h2 className="text-xl font-bold text-[var(--title-color)]">
      {plan.name}
    </h2>
    {(plan.name === 'الباقة التجريبية' || plan.name === 'Free Trial') && (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--main-color)]/10 text-[var(--main-color)] font-medium">تجريبية</span>
    )}
  </div>
 <h5 className="text-2xl font-bold text-[var(--main-color)] mb-4">
 {plan.price} ج.م
 <span className="text-sm text-[var(--text-color)] font-normal"> / شهرياً</span>
 </h5>

 <div className="space-y-3 mb-4 text-sm">
 <div className="flex items-center justify-between bg-[var(--surface-muted)] rounded-lg px-3 py-2">
 <span className="text-[var(--text-color)]">حد طلبات AI</span>
 <span className="font-semibold text-[var(--title-color)]">{plan.aiRequestsLimit}</span>
 </div>
 <div className="flex items-center justify-between bg-[var(--surface-muted)] rounded-lg px-3 py-2">
 <span className="text-[var(--text-color)]">مدة الاشتراك</span>
 <span className="font-semibold text-[var(--title-color)]">{plan.durationDays} يوم</span>
 </div>
 </div>

 <ul className="space-y-2 text-sm text-[var(--text-color)] mb-4">
 <li className="flex items-center gap-2"><LuCheck size={14} color="var(--success-color)" /> إدارة كاملة لمكتبك</li>
 <li className="flex items-center gap-2"><LuCheck size={14} color="var(--success-color)" /> دعم فني مستمر</li>
 <li className="flex items-center gap-2"><LuCheck size={14} color="var(--success-color)" /> نظام AI متكامل</li>
 </ul>
 </div>

 <CustomButton
 type='button'
 text='اشترك الآن'
 size='md'
 radius='lg'
 color='primary'
 variant='solid'
 onClick={() => openPaymentModal(plan.id, plan.name, plan.price)}
 />
 </div>
 ))}
 </div>
 )}

 {/* Payment Modal */}
 {selectedPlan && (
 <PaymentModal
 isOpen={isModalOpen}
 onClose={() => { setIsModalOpen(false); setSelectedPlan(null); }}
 planName={selectedPlan.name}
 planPrice={selectedPlan.price}
 onConfirm={handleConfirmSubscription}
 loading={paymentLoading ==='pending'}
 />
 )}
 </div>
 );
};

export default Subscription;
