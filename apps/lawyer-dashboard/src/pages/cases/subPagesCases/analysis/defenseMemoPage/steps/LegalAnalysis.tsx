import { useMemo, useState, useEffect } from'react';
import { IoArrowBackOutline, IoReload } from'react-icons/io5';
import { HiOutlineLightBulb } from'react-icons/hi2';
import { sileo } from"sileo";
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import thunkSubmitAiJob from'../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { hydrateStep } from'../../../../../../redux/analysis/smartAnalysisSlice';
import { parseJobResult } from"@mohamy/shared-utils";
import { DEFENSE_MEMO_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';
import {
 UnifiedStepShell,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
 AnalysisStageNumberedList,
 AnalysisStageDocumentCard,
 AnalysisStageBanner,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';

type TLegalAnalysis = {
 finalFacts: string;
 caseFacts: string;
 nextStep: () => void;
 caseId: string;
};

const LegalAnalysis = ({ finalFacts, caseFacts, nextStep, caseId }: TLegalAnalysis) => {
 const dispatch = useAppDispatch();
 const outputs = useAppSelector((state) => state.smartAnalysis.outputs);
 const singleCase = useAppSelector((state) => state.cases.singleCase);
 const factAnalysis = outputs[1];
 const defenses = outputs[2];
 const aiJobs = useAppSelector((state) => state.aiJobs);
 const factAnalysisJob = aiJobs.jobs['FactAnalysis'];

 const [isLoading, setIsLoading] = useState(false);
 const [isNavigating, setIsNavigating] = useState(false);

 const isFactJobActive = factAnalysisJob && (factAnalysisJob.status ==='Queued' || factAnalysisJob.status ==='Processing');
 const showLoading = (!factAnalysis && isFactJobActive) || isNavigating || (factAnalysisJob?.status ==='Completed' && !factAnalysis);
 const hasFactFailed = factAnalysisJob?.status ==='Failed';
 const factErrorMessage = factAnalysisJob?.errorMessage ||'تعذّر تحليل الوقائع. أعد المحاولة أو تحقق من البيانات.';

 const normalizedFactAnalysis = useMemo(() => {
 if (!factAnalysis) return null;

 return {
 ...factAnalysis,
 caseType: factAnalysis.caseType || singleCase?.caseTypeName ||'',
 caseNumber: factAnalysis.caseNumber || singleCase?.number ||'',
 courtName: factAnalysis.courtName || singleCase?.court ||'',
 legalFactsSummary: factAnalysis.legalFactsSummary ?? [],
 defendantsPositions: factAnalysis.defendantsPositions ?? [],
 evidenceMap: factAnalysis.evidenceMap ?? [],
 legalAndTechnicalReviewPoints: factAnalysis.legalAndTechnicalReviewPoints ?? [],
 potentialLegalCharacterization: {
 chargeDescription: factAnalysis.potentialLegalCharacterization?.chargeDescription ??'غير محدد',
 elementsReliedUpon: factAnalysis.potentialLegalCharacterization?.elementsReliedUpon ?? [],
 elementsLackingProof: factAnalysis.potentialLegalCharacterization?.elementsLackingProof ?? [],
 },
 };
 }, [factAnalysis, singleCase?.caseTypeName, singleCase?.number, singleCase?.court]);

 const effectiveFacts = finalFacts || caseFacts || normalizedFactAnalysis?.legalFactsSummary?.join('\n') ||'';
 const displayFactSummary = useMemo(() => {
 if (normalizedFactAnalysis?.legalFactsSummary?.length) {
 return normalizedFactAnalysis.legalFactsSummary.filter(s => s.trim().length > 15);
 }

 return effectiveFacts
 .split(/\n+/)
 .map((item) => item.trim())
 .filter(item => item.length > 15);
 }, [normalizedFactAnalysis?.legalFactsSummary, effectiveFacts]);

 useEffect(() => {
 if (factAnalysisJob?.status ==='Completed' && factAnalysisJob.resultJson && !factAnalysis) {
 try {
 const parsed = parseJobResult(factAnalysisJob.resultJson);
 dispatch(hydrateStep({ stepNumber: 1, result: parsed }));
 } catch { /* ignore */ }
 }
 }, [factAnalysisJob?.status, factAnalysisJob?.resultJson, factAnalysis, dispatch]);

 const handleNext = () => {
 if (defenses?.defensesFormal) {
 nextStep();
 return;
 }
 sendData();
 };

 const reAnalysis = async () => {
 if (!effectiveFacts.trim()) {
 sileo.error({ title:'وقائع القضية مطلوبة' });
 return;
 }

 const loadingToast = sileo.show({ type:"loading", title:'جاري إعادة تحليل الوقائع...' });
 setIsLoading(true);

 await dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'FactAnalysis',
 inputJson: JSON.stringify({ caseId, caseFacts: effectiveFacts }),
 })).unwrap()
 .then(() => {
 sileo.success({ title:'مساعدك الذكي شغال الآن...' });
 }).catch((error: unknown) => {
 sileo.error({ title: `حدث خطأ: ${typeof error ==='string' ? error :'مشكلة بالاتصال'}` });
 }).finally(() => {
 sileo.dismiss(loadingToast);
 });

 setIsLoading(false);
 };

 const sendData = async () => {
 if (!effectiveFacts.trim()) {
 sileo.error({ title:'وقائع القضية مطلوبة' });
 return;
 }

 if (caseId && factAnalysis) {
 setIsNavigating(true);
 const loadingToast = sileo.show({ type:"loading", title:'جاري إنشاء الدفوع...' });
 await dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'GenerateDefenses',
 inputJson: JSON.stringify({ caseId, caseFacts: effectiveFacts, legalAnalysis: factAnalysis }),
 })).unwrap()
 .then(() => {
 sileo.success({ title:'مساعدك الذكي شغال الآن...' });
 nextStep();
 }).catch((error) => {
 sileo.error({ title: `حدث خطأ: ${typeof error ==='string' ? error :'مشكلة بالاتصال'}` });
 }).finally(() => {
 sileo.dismiss(loadingToast);
 setIsNavigating(false);
 });
 }
 };

 useEffect(() => {
 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 e.preventDefault();
 e.returnValue ='';
 };
 window.addEventListener('beforeunload', handleBeforeUnload);
 return () => {
 window.removeEventListener('beforeunload', handleBeforeUnload);
 };
 }, [factAnalysis]);

 const aiRecommendation = useMemo(() => {
 if (!normalizedFactAnalysis) return'';

 const firstGap = normalizedFactAnalysis.potentialLegalCharacterization.elementsLackingProof[0];
 const firstReliance = normalizedFactAnalysis.potentialLegalCharacterization.elementsReliedUpon[0];
 const firstReview = normalizedFactAnalysis.legalAndTechnicalReviewPoints[0];

 if (firstGap) {
 return `يُفضّل التركيز في المذكرة القادمة على سد فجوة"${firstGap}" وربطها مباشرة بالمستندات أو القرائن المتاحة قبل الانتقال لصياغة الدفوع.`;
 }

 if (firstReliance) {
 return `ركّز في الدفوع التالية على عنصر"${firstReliance}" لأنه يمثل أقوى نقطة ارتكاز قانونية في هذا التحليل.`;
 }

 return firstReview ||'حافظ على الربط المباشر بين الوقائع والمستندات عند الانتقال إلى قائمة الدفوع.';
 }, [normalizedFactAnalysis]);

 const retryFactAnalysis = () => {
 if (!effectiveFacts.trim()) {
 sileo.error({ title:'وقائع القضية مطلوبة' });
 return;
 }
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'FactAnalysis',
 inputJson: JSON.stringify({ caseId, caseFacts: effectiveFacts }),
 }));
 };

 if (!normalizedFactAnalysis) {
 return (
 <UnifiedStepShell
 isLoading={!hasFactFailed}
 hasFailed={hasFactFailed}
 errorMessage={factErrorMessage}
 onRetry={retryFactAnalysis}
 loadingTitle="جاري التحليل القانوني الذكي للوقائع..."
 loadingSubtitle="يقوم النظام بدراسة الوقائع وتحديد التكييف القانوني، وبناء خريطة للأدلة."
 steps={DEFENSE_MEMO_STEPS}
 currentStepIndex={1}
 >
 <></>
 </UnifiedStepShell>
 );
 }

 return (
 <UnifiedStepShell
 isLoading={showLoading}
 hasFailed={hasFactFailed}
 errorMessage={factErrorMessage}
 onRetry={retryFactAnalysis}
 loadingTitle="جاري التحليل القانوني الذكي للوقائع..."
 loadingSubtitle="يقوم النظام بدراسة الوقائع وتحديد التكييف القانوني، وبناء خريطة للأدلة."
 steps={DEFENSE_MEMO_STEPS}
 currentStepIndex={1}
 title={normalizedFactAnalysis ? "التحليل القانوني المتقدم" : undefined}
 actions={normalizedFactAnalysis ? (
 <button
 type="button"
 disabled={isLoading}
 onClick={reAnalysis}
 className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${
 isLoading
 ?'app-surface-soft app-text-subtle cursor-not-allowed'
 :'bg-[var(--accent-soft)] text-[var(--main-color)] dark:text-white hover:opacity-80 border border-[var(--accent-soft-strong)]'
 }`}
 >
 <IoReload className="text-base" />
 إعادة التحليل الذكي
 </button>
 ) : undefined}
 sidebar={normalizedFactAnalysis ? (
 <>
 <AnalysisStageSidebarCard
 label="نوع القضية"
 value={normalizedFactAnalysis.caseType ||'غير محدد'}
 description="التصنيف القانوني المبدئي للقضية بناءً على الوقائع المسجلة."
 />
 <AnalysisStageSidebarCard
 label="رقم القضية"
 value={normalizedFactAnalysis.caseNumber ||'غير مبين بالأوراق'}
 description="الرقم المرجعي للقضية في المحكمة المختصة."
 />
 <AnalysisStageSidebarCard
 label="المحكمة"
 value={normalizedFactAnalysis.courtName ||'المحكمة المختصة'}
 description="المحكمة المنظورة أمامها الدعوى."
 />
 <AnalysisStageActionButton
 label={defenses?.defensesFormal ?'الذهاب لقائمة الدفوع' :'الدفوع القانونية'}
 icon={IoArrowBackOutline}
 onClick={handleNext}
 disabled={isLoading}
 />
 </>
 ) : undefined}
 >
 <AnalysisStageDocumentCard label="ملخص الوقائع" badge="تحليل قانوني">
 <AnalysisStageNumberedList
 items={displayFactSummary}
 emptyText="لا يوجد ملخص للوقائع"
 />
 </AnalysisStageDocumentCard>

 <AnalysisStageSectionCard label="الواقعة القانونية">
 <p className="text-[15px] text-[var(--title-color)] leading-loose">
 {effectiveFacts || normalizedFactAnalysis.legalFactsSummary.join('')}
 </p>
 </AnalysisStageSectionCard>

 <AnalysisStageBanner label="توصية الذكاء الاصطناعي" icon={<HiOutlineLightBulb className="text-2xl" />}>
 <p>{aiRecommendation}</p>
 </AnalysisStageBanner>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <AnalysisStageSectionCard label="موقف خصم الموكل">
 <div className="flex flex-col gap-4">
 {normalizedFactAnalysis.defendantsPositions.map((defendant, idx) => (
 <div key={`${defendant.defendantName}-${idx}`} className="app-surface border app-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
 <div className="flex items-center gap-2 mb-2">
 <strong className="text-sm text-[var(--title-color)]">{defendant.defendantName}</strong>
 {defendant.relationshipToClient && (
 <span className="text-xs bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800/50">
 {defendant.relationshipToClient}
 </span>
 )}
 </div>
 <p className="text-sm app-text-muted leading-loose">{defendant.positionSummary}</p>
 </div>
 ))}
 </div>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="خريطة الأدلة">
 <div className="flex flex-col gap-4">
 {normalizedFactAnalysis.evidenceMap.map((evidence, idx) => (
 <div key={`${evidence.source}-${idx}`} className="app-surface border app-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
 <strong className="block text-sm text-[var(--title-color)] mb-3 border-b border-gray-50 pb-2">الدليل {idx + 1}</strong>
 <ul className="flex flex-col gap-2 text-sm app-text-muted text-end pe-4 list-disc marker:text-gray-300">
 <li><span className="font-bold text-[var(--title-color)] ms-1">المصدر:</span>{evidence.source}</li>
 <li><span className="font-bold text-[var(--title-color)] ms-1">يثبت:</span>{evidence.proves}</li>
 <li><span className="font-bold text-[var(--title-color)] ms-1">لا يثبت:</span>{evidence.doesNotProve}</li>
 <li><span className="font-bold text-[var(--title-color)] ms-1">القيود:</span>{evidence.limitations}</li>
 </ul>
 </div>
 ))}
 </div>
 </AnalysisStageSectionCard>
 </div>

 <AnalysisStageSectionCard label="نقاط المراجعة القانونية والفنية">
 <AnalysisStageNumberedList
 items={normalizedFactAnalysis.legalAndTechnicalReviewPoints}
 emptyText="لا توجد نقاط مراجعة"
 />
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="التوصيف القانوني المحتمل">
 <div className="flex flex-col gap-5">
 <div className="flex flex-col gap-2 app-surface-soft p-4 rounded-xl border app-border">
 <span className="text-xs font-semibold app-text-subtle">الوصف القانوني</span>
 <strong className="text-base text-[var(--title-color)]">{normalizedFactAnalysis.potentialLegalCharacterization.chargeDescription}</strong>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
 <div className="app-surface border app-border rounded-xl p-5 shadow-sm">
 <strong className="block text-sm text-[var(--title-color)] mb-4 pb-2 border-b app-border">العناصر التي يعتمد عليها</strong>
 <ul className="flex flex-col gap-2 text-sm app-text-muted list-disc pe-4 marker:text-[var(--success-color)]">
 {normalizedFactAnalysis.potentialLegalCharacterization.elementsReliedUpon.map((item, idx) => (
 <li key={idx} className="leading-relaxed">{item}</li>
 ))}
 </ul>
 </div>

 <div className="app-surface border app-border rounded-xl p-5 shadow-sm">
 <strong className="block text-sm text-[var(--title-color)] mb-4 pb-2 border-b app-border">العناصر التي تفتقر إلى الدليل</strong>
 <ul className="flex flex-col gap-2 text-sm app-text-muted list-disc pe-4 marker:text-[var(--danger-color)]">
 {normalizedFactAnalysis.potentialLegalCharacterization.elementsLackingProof.map((item, idx) => (
 <li key={idx} className="leading-relaxed">{item}</li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </AnalysisStageSectionCard>
 </UnifiedStepShell>
 );
};

export default LegalAnalysis;
