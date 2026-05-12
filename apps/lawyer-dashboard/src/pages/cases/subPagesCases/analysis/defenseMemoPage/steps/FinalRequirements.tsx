import { useEffect, useMemo, useState } from"react";
import { IoDocumentTextOutline } from"react-icons/io5";
import { sileo } from"sileo";
import {
 UnifiedStepShell,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from"../../../../../../components/analysisWorkflow/UnifiedStepShell";
import { AnalysisStepShell } from"../../../../../../components/analysisWorkflow/AnalysisStepShell";
import { AnalysisStageLayout } from"../../../../../../components/analysisWorkflow/AnalysisStageLayout";
import { useAnalysisStep } from"../../../../../../hooks/useAnalysisStep";
import { hydrateStep } from"../../../../../../redux/analysis/smartAnalysisSlice";
import { useAppDispatch, useAppSelector } from"../../../../../../hooks/reduxHooks";
import type { TFinalRequirementsWrapper } from"../../../../../../redux/shared/workflowTypes";
import { DEFENSE_MEMO_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';

type TFinalRequirementsProps = {
 caseId: string;
 finalFacts: string;
 nextStep: () => void;
};

type TFinalPrayer = {
 id: string;
 requestLevel: string;
 requestText: string;
};

const FinalRequirements = ({ caseId, nextStep }: TFinalRequirementsProps) => {
 const dispatch = useAppDispatch();
 const { outputs } = useAppSelector((state) => state.smartAnalysis);
 const finalRequirementsObj = outputs[4] as TFinalRequirementsWrapper | undefined;
 const finalPrayers: TFinalPrayer[] = useMemo(() => finalRequirementsObj?.finalPrayers || [], [finalRequirementsObj?.finalPrayers]);

 const {
 isLoading,
 hasFailed,
 errorMessage,
 retry, charge,
 } = useAnalysisStep<TFinalRequirementsWrapper>({
 caseId,
 stepType:'FinalRequirements',
 parseResult: (json: string) => {
 const parsed = JSON.parse(json);
 const r = parsed as Record<string, unknown>;
 return {
 finalPrayers: ((r.finalPrayers ?? r.final_prayers ?? []) as Record<string, unknown>[]).map((p) => ({
 id: (p.id ??'') as string,
 requestLevel: (p.requestLevel ?? p.request_level ??'') as string,
 requestText: (p.requestText ?? p.request_text ??'') as string,
 })),
 } as TFinalRequirementsWrapper;
 },
 onHydrate: (parsed) => {
 if (parsed) {
 dispatch(hydrateStep({ stepNumber: 4, result: parsed }));
 }
 },
 });

 const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
 const [isNavigating, setIsNavigating] = useState(false);

 useEffect(() => {
 if (finalPrayers?.length) {
 setSelectedIds(new Set(finalPrayers.map((r: TFinalPrayer) => r.id)));
 }
 }, [finalPrayers]);

 useEffect(() => {
 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 e.preventDefault();
 e.returnValue ="";
 };
 window.addEventListener("beforeunload", handleBeforeUnload);
 return () => window.removeEventListener("beforeunload", handleBeforeUnload);
 }, []);

 const toggleRequirement = (id: string) => {
 setSelectedIds(prev => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 };

 const sendData = async () => {
 setIsNavigating(true);
 const loadingToast = sileo.show({ type:"loading", title:'جاري تجهيز المذكرة النهائية...' });
 try {
 sileo.success({ title:'تم تجهيز المذكرة النهائية' });
 nextStep();
 } finally {
 sileo.dismiss(loadingToast);
 setIsNavigating(false);
 }
 };

 const selectionCount = selectedIds.size;
 const totalCount = finalPrayers.length;
 const progressPercent = totalCount > 0 ? Math.round((selectionCount / totalCount) * 100) : 0;

 return (
 <UnifiedStepShell
 isLoading={isLoading && finalPrayers.length === 0 && !isNavigating}
 hasFailed={hasFailed && !isNavigating}
 errorMessage={errorMessage}
 onRetry={retry}
 charge={charge}
 loadingTitle="جاري التفنيط واستخراج الطلبات..."
 loadingSubtitle="يقوم المحرك الذكي في هذه المرحلة باستخراج كافة الطلبات بناءً على الدفوع والوقائع المعتمدة."
 steps={DEFENSE_MEMO_STEPS}
 currentStepIndex={3}
 >
 {isNavigating && (
 <AnalysisStepShell
 isLoading={true}
 hasFailed={false}
 loadingTitle="جاري صياغة المذكرة النهائية..."
 loadingSubtitle="يقوم المحرك الذكي بجمع كل الأجزاء (الوقائع، الدفوع، الطلبات) في وثيقة قانونية متكاملة وإعداد جاهزيتها للطباعة."
 steps={DEFENSE_MEMO_STEPS}
 currentStepIndex={4}
 >
 <div />
 </AnalysisStepShell>
 )}

 {!isNavigating && (
 <>
 <AnalysisStageLayout
 title="الطلبات الختامية"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="الطلبات المحددة"
 value={`${selectionCount} / ${totalCount}`}
 description={`${selectionCount} طلب معتمد من أصل ${totalCount}`}
 tone="accent"
 icon={<IoDocumentTextOutline />}
 />

 <div className="flex flex-col gap-4">
 <div className="w-full app-surface-soft dark:app-surface-soft rounded-full h-2 overflow-hidden">
 <div
 className="h-full bg-gradient-to-r from-[var(--main-color)] to-orange-300 rounded-full transition-colors duration-500"
 style={{ width: `${progressPercent}%` }}
 />
 </div>

 <AnalysisStageActionButton
 label="إصدار المذكرة"
 icon={IoDocumentTextOutline}
 onClick={sendData}
 disabled={isNavigating || selectionCount === 0}
 variant="primary"
 />
 </div>
 </>
 }
 >
 {finalPrayers.length === 0 && !isLoading && (
 <div className="flex flex-col items-center justify-center py-16 text-center">
 <IoDocumentTextOutline className="text-5xl app-text-subtle mb-4" />
 <p className="text-sm app-text-subtle">لا توجد طلبات لعرضها</p>
 </div>
 )}

 {finalPrayers.length > 0 && (
 <AnalysisStageSectionCard label="قائمة الطلبات الموضوعية">
 <div className="flex flex-col gap-3">
 {finalPrayers.map((item: TFinalPrayer, idx: number) => {
 const isSelected = selectedIds.has(item.id);
 return (
 <div
 key={item.id}
 onClick={() => toggleRequirement(item.id)}
 className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors border ${
 isSelected
 ?'border-[var(--main-color)] bg-orange-50/30 shadow-sm'
 :'app-border bg-white hover:app-border-strong'
 }`}
 >
 <div className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
 isSelected
 ?'bg-[var(--main-color)] border-[var(--main-color)] text-white'
 :'app-border-strong'
 }`}>
 {isSelected && (
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
 <polyline points="20 6 9 17 4 12" />
 </svg>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between gap-2 mb-1">
 <h4 className={`text-sm font-bold ${isSelected ?'text-[var(--title-color)]' :'app-text-subtle'}`}>
 طلب {idx + 1}: {item.requestLevel}
 </h4>
 <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800/50">
 {item.requestLevel}
 </span>
 </div>
 <p className={`text-sm leading-relaxed ${isSelected ?'app-text-muted' :'app-text-subtle line-through opacity-60'}`}>
 {item.requestText}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </AnalysisStageSectionCard>
 )}
 </AnalysisStageLayout>
 </>
 )}
 </UnifiedStepShell>
 );
};

export default FinalRequirements;
