import { parseWorkflowJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoArrowBackOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateRulingStep } from'../../../../../../redux/rulingAnalysis/rulingAnalysisWorkflowSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import type { TDefectsEvaluation } from'../../../../../../redux/shared/workflowTypes';
import {
 UnifiedStepShell,
 AnalysisStageActionButton,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';

type TRulingStep3Props = {
 nextStep: () => void;
 selectedFacts: string[];
};

const RulingStep3DefectsEvaluation = ({ nextStep, selectedFacts }: TRulingStep3Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 // Legacy Redux state
 const reasonsAnalysis = useAppSelector((s) => s.rulingAnalysis.outputs[2]);
 const defectsEvaluation = useAppSelector((s) => s.rulingAnalysis.outputs[3]);

 const { isLoading, hasFailed, errorMessage, retry, charge } = useAnalysisStep<TDefectsEvaluation>({
 parseResult: parseWorkflowJobResult,
 caseId: caseId as string,
 stepType:'RulingAnalysisDefectEvaluation',
 autoSubmit: Boolean(reasonsAnalysis), // Only run if Phase 2 is done
 inputJson: buildAnalysisInput(caseId ||'', selectedFacts),
 onHydrate: (parsed) => dispatch(hydrateRulingStep({ stepNumber: 3, result: parsed })),
 });

 const getSeverityColor = (severity: string) => {
 if (severity ==='خطير') return'bg-[var(--danger-soft)] dark:bg-red-950/40 text-[var(--danger-color)] dark:text-[var(--danger-color)] border-[var(--danger-soft)] dark:border-red-800/50';
 if (severity ==='متوسط') return'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50';
 return'app-surface-soft dark:app-surface-soft app-text-muted dark:app-text-subtle app-border-strong dark:app-border-strong';
 };

 return (
 <UnifiedStepShell
 isLoading={isLoading && !defectsEvaluation}
 hasFailed={hasFailed && !defectsEvaluation}
 errorMessage={errorMessage}
 onRetry={retry}
 charge={charge}
 title={defectsEvaluation ? "تحليل عيوب ومثالب الحكم" : undefined}
 sidebar={defectsEvaluation ? (
 <>
 <AnalysisStageSidebarCard
 label="إجمالي العيوب المكتشفة"
 value={defectsEvaluation.defects?.length || 0}
 valueClassName="text-5xl"
 description="تم فحص الحكم لتحديد الأخطاء الجوهرية، وهي نقاط هامة لتحديد ما إذا كان الطعن ممكناً."
 />
 <AnalysisStageActionButton
 label="تقييم جدوى الطعن"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 </>
 ) : undefined}
 >
  {defectsEvaluation && (
  <>
  {defectsEvaluation.defects?.length > 0 ? (
  <div className="flex flex-col gap-4">
  {defectsEvaluation.defects.map((defect, idx) => (
  <AnalysisStageSectionCard key={idx} label={`العيب ${idx + 1}`} className="relative overflow-hidden">
  <div className={`absolute top-0 end-0 h-full w-[4px] ${defect.severity ==='خطير' ?'bg-red-500' : defect.severity ==='متوسط' ?'bg-orange-400' :'bg-gray-300 dark:bg-gray-600'}`} />
  <div className="flex justify-between items-start mb-3">
  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getSeverityColor(defect.severity)}`}>
  {defect.severity}
  </span>
  </div>
  <p className="text-sm leading-relaxed text-[var(--title-color)] dark:text-gray-200">
  {defect.description}
  </p>
  </AnalysisStageSectionCard>
  ))}
  </div>
  ) : (
  <AnalysisStageSectionCard label="نتيجة التقييم" className="border-green-100 dark:border-green-800/50 bg-[var(--success-soft)] dark:bg-green-950/30 text-center">
  <strong className="block text-lg font-bold text-[var(--success-color)] dark:text-green-400 mb-2">لا توجد عيوب جوهرية</strong>
  <p className="text-sm text-[var(--success-color)] dark:text-green-400">الحكم سليم تقريباً من حيث التسبيب وتطبيق القانون بناءً على المستندات المتاحة.</p>
  </AnalysisStageSectionCard>
  )}
  </>
  )}
 </UnifiedStepShell>
 );
};

export default RulingStep3DefectsEvaluation;
