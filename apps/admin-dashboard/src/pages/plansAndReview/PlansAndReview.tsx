import { Container } from'@mohamy/shared-ui';
import { useEffect, useState } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import SubscriptionPlanCard from"../../components/pagesComponents/plansAndReview/SubscriptionPlanCard";
import HeadTitle from"../../components/public/headTitle/HeadTitle";
import SubTitle from"../../components/public/subTitle/SubTitle";

import { Spinner, Input, Modal, ModalBody, ModalContent, ModalHeader, Button, Checkbox, Textarea } from"@heroui/react";
import { useDisclosure } from"@heroui/react";
import fetchPlans from"../../redux/plans/thunk/fetchPlans";
import updatePlan from"../../redux/plans/thunk/updatePlan";
import createPlan from"../../redux/plans/thunk/createPlan";
import archivePlan from"../../redux/plans/thunk/archivePlan";
import restorePlan from"../../redux/plans/thunk/restorePlan";
import type { TSubscription } from"../../redux/plans/thunk/fetchPlans";
import ConfirmDialog from"../../components/ui/modal/ConfirmDialog";

const AI_POINT_COST_PER_STEP = 1;

type AiPlanPath = {
 label: string;
 steps: number;
};

const AI_PLAN_PATHS: AiPlanPath[] = [
 { label:"التحليل الذكي ومذكرة الدفاع", steps: 12 },
 { label:"إعداد الدعوى", steps: 5 },
 { label:"صحيفة الطعن", steps: 6 },
 { label:"الشكاوى الإدارية", steps: 5 },
 { label:"تحليل الأحكام", steps: 4 },
 { label:"الإنذار الرسمي", steps: 3 },
 { label:"الطلبات التنفيذية", steps: 3 },
 { label:"إنشاء العقود القانونية", steps: 3 },
 { label:"التعرف البصري على المستندات", steps: 1 },
 { label:"المحادثة الذكية", steps: 1 },
 { label:"التحقق التمهيدي من الوقائع", steps: 1 },
];

const getPathCost = (path: AiPlanPath) => path.steps * AI_POINT_COST_PER_STEP;

const formatPointLabel = (count: number) => {
 if (count === 1) return"نقطة واحدة";
 if (count === 2) return"نقطتان";
 return `${count} نقاط`;
};

const buildAiFeatureLines = (aiRequestsLimit: number) => {
 const points = Math.max(0, Math.floor(aiRequestsLimit || 0));
 return AI_PLAN_PATHS.map((path) => {
 const cost = getPathCost(path);
 const availableRuns = cost > 0 ? Math.floor(points / cost) : 0;
 return `${availableRuns} ${path.label} (${formatPointLabel(cost)} لكل مرة)`;
 });
};

const mergeFeatureLines = (currentFeatures: string, aiRequestsLimit: number) => {
 const existing = currentFeatures
 .split(",")
 .map((feature) => feature.trim())
 .filter(Boolean)
 .filter((feature) => !AI_PLAN_PATHS.some((path) => feature.includes(path.label)));

 return [...existing, ...buildAiFeatureLines(aiRequestsLimit)].join(", ");
};

const AiPointsPlanner = ({
 aiRequestsLimit,
 onApplyFeatures,
}: {
 aiRequestsLimit: number;
 onApplyFeatures: () => void;
}) => {
 const points = Math.max(0, Math.floor(aiRequestsLimit || 0));

 return (
 <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--second-color)]/60 p-4">
 <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <p className="text-sm font-bold text-[var(--title-color)]">رصيد الباقة: {formatPointLabel(points)}</p>
 <p className="text-xs app-text-subtle">كل خطوة ذكاء اصطناعي تكلف {formatPointLabel(AI_POINT_COST_PER_STEP)} حسب إعداد الخصم الحالي.</p>
 </div>
 <Button color="primary" variant="flat" size="sm" onPress={onApplyFeatures}>
 إضافة الحسابات للمميزات
 </Button>
 </div>
 <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
 {AI_PLAN_PATHS.map((path) => {
 const cost = getPathCost(path);
 const availableRuns = cost > 0 ? Math.floor(points / cost) : 0;
 return (
 <div key={path.label} className="rounded-xl border border-[var(--border-color)] bg-[var(--white-color)] px-3 py-2">
 <div className="flex items-start justify-between gap-3">
 <p className="text-sm font-semibold text-[var(--title-color)]">{path.label}</p>
 <span className="shrink-0 rounded-full bg-[var(--main-color)]/10 px-2 py-1 text-xs font-bold text-[var(--main-color)]">
 {formatPointLabel(cost)}
 </span>
 </div>
 <p className="mt-1 text-xs app-text-subtle">الباقة تكفي {availableRuns} مرة</p>
 </div>
 );
 })}
 </div>
 </div>
 );
};

const PlansAndReview = () => {
 const dispatch = useAppDispatch();
 const { list: plans, isLoading, error } = useAppSelector(
 (state) => state.plans
 );
 const { isOpen, onOpen, onOpenChange } = useDisclosure();
 const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
 const [archivingPlanId, setArchivingPlanId] = useState<number | null>(null);
 const [restoringPlanId, setRestoringPlanId] = useState<number | null>(null);
 const [editingPlan, setEditingPlan] = useState<TSubscription | null>(null);
  const [formState, setFormState] = useState({
  name:"",
  price: 0,
  features:"",
  aiRequestsLimit: 0,
  durationDays: 0,
  isActive: true,
  isPopular: false,
  showOnLanding: false,
  yearlyPrice: null as number | null,
  yearlyDurationDays: 365,
  });
  const [createFormState, setCreateFormState] = useState({
  name:"",
  price: 0,
  features:"",
  aiRequestsLimit: 0,
  durationDays: 30,
  isPopular: false,
  showOnLanding: false,
  yearlyPrice: null as number | null,
  yearlyDurationDays: 365,
  });

 useEffect(() => {
 dispatch(fetchPlans());
 }, [dispatch]);

 const handleOpenEdit = (plan: TSubscription) => {
 setEditingPlan(plan);
  setFormState({
  name: plan.name,
  price: plan.price,
  features: plan.features,
  aiRequestsLimit: plan.aiRequestsLimit,
  durationDays: plan.durationDays,
  isActive: plan.isActive,
  isPopular: plan.isPopular ?? false,
  showOnLanding: plan.showOnLanding ?? false,
  yearlyPrice: plan.yearlyPrice ?? null,
  yearlyDurationDays: plan.yearlyDurationDays ?? 365,
  });
 onOpen();
 };

 const handleSubmit = () => {
 if (!editingPlan) return;
 dispatch(
 updatePlan({
 id: editingPlan.id,
 ...formState,
 })
 ).then((result) => {
 if (updatePlan.fulfilled.match(result)) {
 onOpenChange();
 }
 });
 };

 const handleCreateSubmit = () => {
 dispatch(createPlan(createFormState)).then((result) => {
 if (createPlan.fulfilled.match(result)) {
 onCreateOpenChange();
  setCreateFormState({
  name:"",
  price: 0,
  features:"",
  aiRequestsLimit: 0,
  durationDays: 30,
  isPopular: false,
  showOnLanding: false,
  yearlyPrice: null as number | null,
  yearlyDurationDays: 365,
  });
 }
 });
 };

  const handleArchive = (planId: number) => {
  setArchivingPlanId(planId);
  };

  const confirmArchive = () => {
  if (archivingPlanId != null) {
  dispatch(archivePlan(archivingPlanId));
  }
  setArchivingPlanId(null);
  };

  const handleRestore = (planId: number) => {
  setRestoringPlanId(planId);
  };

  const confirmRestore = () => {
  if (restoringPlanId != null) {
  dispatch(restorePlan(restoringPlanId));
  }
  setRestoringPlanId(null);
  };

  const planCards = plans.map((plan) => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,
  yearlyPrice: plan.yearlyPrice ?? null,
  duration: `${plan.durationDays} يوم`,
  aiRequestsLimit: plan.aiRequestsLimit,
  features: plan.features ? plan.features.split(",").map((f) => f.trim()) : [],
  isActive: plan.isActive,
  }));

 if (isLoading && plans.length === 0) {
 return (
 <section className="pb-20">
 <Container>
 <HeadTitle title="لوحة التحكم" />
 <div className="flex justify-center items-center min-h-[50vh]">
 <Spinner size="lg" color="primary" />
 </div>
 </Container>
 </section>
 );
 }

 return (
 <section className="pb-20">
 <Container>
 <HeadTitle title="لوحة التحكم" />
 <div className="flex justify-between items-center mb-4">
 <SubTitle title="خطط الاشتراك" />
 <Button color="primary" onPress={onCreateOpen}>
 إنشاء خطة جديدة
 </Button>
 </div>
 <div className="flex flex-wrap mb-20">
 {error && plans.length === 0 ? (
 <div className="w-full flex flex-col items-center justify-center min-h-[30vh] gap-2">
 <p className="text-lg text-[var(--danger-color)]">حدث خطأ أثناء تحميل الخطط</p>
 <p className="text-sm app-text-subtle">{error}</p>
 <Button color="primary" variant="flat" onPress={() => dispatch(fetchPlans())}>
 إعادة المحاولة
 </Button>
 </div>
 ) : plans.length === 0 && !isLoading ? (
 <div className="w-full flex flex-col items-center justify-center min-h-[30vh] gap-2">
 <p className="text-lg app-text-subtle">لا توجد خطط اشتراك</p>
 <p className="text-sm app-text-subtle">أنشئ خطة جديدة باستخدام الزر أعلاه</p>
 </div>
 ) : (
 planCards.map((plan) => (
 <div key={plan.id} className="w-full md:w-6/12 lg:w-4/12 p-4">
  <SubscriptionPlanCard
  plan={plan}
  onEdit={() => handleOpenEdit(plans.find((p) => p.id === plan.id)!)}
  onArchive={() => handleArchive(plan.id)}
  onRestore={() => handleRestore(plan.id)}
  />
 </div>
 ))
 )}
 </div>
 </Container>

 {/* Edit Plan Modal */}
 <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" backdrop="blur" placement="center" classNames={{ base: "rounded-3xl mx-4 my-4" }}>
 <ModalContent>
 <ModalHeader className="flex flex-col gap-1">تعديل الخطة</ModalHeader>
 <ModalBody>
 <div className="flex flex-col gap-4 pb-6">
 <Input
 label="اسم الخطة"
 value={formState.name}
 onChange={(e) => setFormState({ ...formState, name: e.target.value })}
 />
 <Input
 type="number"
 label="السعر"
 value={String(formState.price)}
 onChange={(e) => setFormState({ ...formState, price: Number(e.target.value) })}
 />
 <Input
 type="number"
 label="نقاط الذكاء الاصطناعي في الباقة"
 value={String(formState.aiRequestsLimit)}
 onChange={(e) => setFormState({ ...formState, aiRequestsLimit: Number(e.target.value) })}
 />
 <AiPointsPlanner
 aiRequestsLimit={formState.aiRequestsLimit}
 onApplyFeatures={() => setFormState((current) => ({
 ...current,
 features: mergeFeatureLines(current.features, current.aiRequestsLimit),
 }))}
 />
 <Textarea
 label="المميزات (مفصولة بفواصل)"
 minRows={3}
 value={formState.features}
 onChange={(e) => setFormState({ ...formState, features: e.target.value })}
 />
  <Input
  type="number"
  label="مدة الاشتراك (بالأيام)"
  value={String(formState.durationDays)}
  onChange={(e) => setFormState({ ...formState, durationDays: Number(e.target.value) })}
  />
  <Input
  type="number"
  label="السعر السنوي"
  placeholder="اتركه فارغاً لتعطيل الخيار السنوي"
  value={formState.yearlyPrice !== null ? String(formState.yearlyPrice) : ""}
  onChange={(e) => setFormState({ ...formState, yearlyPrice: e.target.value === "" ? null : Number(e.target.value) })}
  />
  <Input
  type="number"
  label="مدة الاشتراك السنوي (بالأيام)"
  value={String(formState.yearlyDurationDays)}
  onChange={(e) => setFormState({ ...formState, yearlyDurationDays: Number(e.target.value) })}
  />
  <div className="flex flex-col gap-3">
  <Checkbox
  isSelected={formState.isActive}
  onValueChange={(isSelected) => setFormState({ ...formState, isActive: isSelected })}
  >
  نشطة
  </Checkbox>
  <Checkbox
 isSelected={formState.isPopular}
 onValueChange={(isSelected) => setFormState({ ...formState, isPopular: isSelected })}
 >
 الأكثر طلباً (موصى بها)
 </Checkbox>
 <Checkbox
 isSelected={formState.showOnLanding}
 onValueChange={(isSelected) => setFormState({ ...formState, showOnLanding: isSelected })}
 >
 عرض في صفحة الموقع (Landing Page)
 </Checkbox>
 </div>
 <Button color="primary" onPress={handleSubmit}>
 حفظ التعديلات
 </Button>
 </div>
 </ModalBody>
 </ModalContent>
 </Modal>

 {/* Create Plan Modal */}
 <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="lg" backdrop="blur" placement="center" classNames={{ base: "rounded-3xl mx-4 my-4" }}>
 <ModalContent>
 <ModalHeader className="flex flex-col gap-1">إنشاء خطة جديدة</ModalHeader>
 <ModalBody>
 <div className="flex flex-col gap-4 pb-6">
 <Input
 label="اسم الخطة"
 value={createFormState.name}
 onChange={(e) => setCreateFormState({ ...createFormState, name: e.target.value })}
 />
 <Input
 type="number"
 label="السعر"
 value={String(createFormState.price)}
 onChange={(e) => setCreateFormState({ ...createFormState, price: Number(e.target.value) })}
 />
 <Input
 type="number"
 label="نقاط الذكاء الاصطناعي في الباقة"
 value={String(createFormState.aiRequestsLimit)}
 onChange={(e) => setCreateFormState({ ...createFormState, aiRequestsLimit: Number(e.target.value) })}
 />
 <AiPointsPlanner
 aiRequestsLimit={createFormState.aiRequestsLimit}
 onApplyFeatures={() => setCreateFormState((current) => ({
 ...current,
 features: mergeFeatureLines(current.features, current.aiRequestsLimit),
 }))}
 />
 <Textarea
 label="المميزات (مفصولة بفواصل)"
 minRows={3}
 value={createFormState.features}
 onChange={(e) => setCreateFormState({ ...createFormState, features: e.target.value })}
 />
  <Input
  type="number"
  label="مدة الاشتراك (بالأيام)"
  value={String(createFormState.durationDays)}
  onChange={(e) => setCreateFormState({ ...createFormState, durationDays: Number(e.target.value) })}
  />
  <Input
  type="number"
  label="السعر السنوي"
  placeholder="اتركه فارغاً لتعطيل الخيار السنوي"
  value={createFormState.yearlyPrice !== null ? String(createFormState.yearlyPrice) : ""}
  onChange={(e) => setCreateFormState({ ...createFormState, yearlyPrice: e.target.value === "" ? null : Number(e.target.value) })}
  />
  <Input
  type="number"
  label="مدة الاشتراك السنوي (بالأيام)"
  value={String(createFormState.yearlyDurationDays)}
  onChange={(e) => setCreateFormState({ ...createFormState, yearlyDurationDays: Number(e.target.value) })}
  />
  <div className="flex flex-col gap-3">
  <Checkbox
  isSelected={createFormState.isPopular}
  onValueChange={(isSelected) => setCreateFormState({ ...createFormState, isPopular: isSelected })}
  >
 الأكثر طلباً (موصى بها)
 </Checkbox>
 <Checkbox
 isSelected={createFormState.showOnLanding}
 onValueChange={(isSelected) => setCreateFormState({ ...createFormState, showOnLanding: isSelected })}
 >
 عرض في صفحة الموقع (Landing Page)
 </Checkbox>
 </div>
 <Button color="primary" onPress={handleCreateSubmit} isLoading={isLoading}>
 إنشاء الخطة
 </Button>
 </div>
 </ModalBody>
 </ModalContent>
 </Modal>

  {/* Archive Confirmation - Branded ConfirmDialog */}
  <ConfirmDialog
  isOpen={archivingPlanId !== null}
  onClose={() => setArchivingPlanId(null)}
  onConfirm={confirmArchive}
  title="أرشفة الخطة"
  description="هل أنت متأكد من أرشفة هذه الخطة؟"
  confirmText="أرشفة"
  cancelText="إلغاء"
  danger
  />

  {/* Restore Confirmation - Branded ConfirmDialog */}
  <ConfirmDialog
  isOpen={restoringPlanId !== null}
  onClose={() => setRestoringPlanId(null)}
  onConfirm={confirmRestore}
  title="استعادة الخطة"
  description="هل أنت متأكد من استعادة هذه الخطة وجعلها نشطة مرة أخرى؟"
  confirmText="استعادة"
  cancelText="إلغاء"
  />
  </section>
 );
};

export default PlansAndReview;
