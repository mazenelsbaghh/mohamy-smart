import { parseWorkflowJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateRulingStep } from'../../../../../../redux/rulingAnalysis/rulingAnalysisWorkflowSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import type { TAppealViability } from'../../../../../../redux/shared/workflowTypes';
import { AnalysisStepShell } from'../../../../../../components/analysisWorkflow/AnalysisStepShell';
import {
 AnalysisStageBanner,
 AnalysisStageLayout,
 AnalysisStageNumberedList,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';

type TRulingStep4Props = {
 selectedFacts: string[];
};

const RulingStep4AppealViability = ({ selectedFacts }: TRulingStep4Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 // Legacy Redux state
 const defectsEvaluation = useAppSelector((s) => s.rulingAnalysis.outputs[3]);
 const appealViability = useAppSelector((s) => s.rulingAnalysis.outputs[4]);

 const { isLoading, hasFailed, errorMessage, retry } = useAnalysisStep<TAppealViability>({
 parseResult: parseWorkflowJobResult,
 caseId: caseId as string,
 stepType:'RulingAnalysisFeasibilityReport',
 autoSubmit: Boolean(defectsEvaluation), // Only run if Phase 3 exists
 inputJson: buildAnalysisInput(caseId ||'', selectedFacts),
 onHydrate: (parsed) => dispatch(hydrateRulingStep({ stepNumber: 4, result: parsed })),
 });

 const isViable = appealViability?.isAppealViable;

 return (
 <AnalysisStepShell
 isLoading={isLoading && !appealViability}
 hasFailed={hasFailed && !appealViability}
 errorMessage={errorMessage}
 onRetry={retry}
 >
 {appealViability && (
 <AnalysisStageLayout
 title="خلاصة وجدوى الطعن"
 sidebar={
 <AnalysisStageSidebarCard
 label="نسبة قوة الطعن المقدرة"
 value={`${appealViability.appealStrength}${typeof appealViability.appealStrength ==='number' ?'%' :''}`}
 tone={isViable ?'success' :'danger'}
 valueClassName="text-5xl"
 description="تم الانتهاء من تحليل الحكم بالكامل. يمكنك مراجعة الأسباب الموصى بها وتقييم قوة الاستئناف أو النقض."
 />
 }
 >
 <AnalysisStageBanner
 label="تقييم النظام لجدوى الطعن"
 tone={isViable ?'success' :'danger'}
 icon={isViable ? <IoCheckmarkCircleOutline /> : <IoCloseCircleOutline />}
 >
 <strong className="text-xl font-extrabold">
 {isViable ?'ينصح بالطعن - توجد أسباب قوية' :'لا ينصح بالطعن - الأسباب ضعيفة'}
 </strong>
 </AnalysisStageBanner>

 <AnalysisStageSectionCard label="الخلاصة التحليلية">
 <p className="text-sm leading-[2.2] app-text-muted">
 {appealViability.conclusion}
 </p>
 </AnalysisStageSectionCard>

 {appealViability.recommendedGrounds?.length > 0 && (
 <AnalysisStageSectionCard label="الأسباب الموصى بالاستناد إليها في الطعن">
 <AnalysisStageNumberedList items={appealViability.recommendedGrounds} />
 </AnalysisStageSectionCard>
 )}
 </AnalysisStageLayout>
 )}
 </AnalysisStepShell>
 );
};

export default RulingStep4AppealViability;
