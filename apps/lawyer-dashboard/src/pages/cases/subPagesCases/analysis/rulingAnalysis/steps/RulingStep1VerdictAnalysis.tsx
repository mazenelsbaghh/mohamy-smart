import { parseWorkflowJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoArrowBackOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateRulingStep } from'../../../../../../redux/rulingAnalysis/rulingAnalysisWorkflowSlice';
import type { TVerdictAnalysis } from'../../../../../../redux/shared/workflowTypes';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import {
 UnifiedStepShell,
 AnalysisStageActionButton,
 AnalysisStageNumberedList,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';

type TRulingStep1Props = {
 nextStep: () => void;
 selectedFacts: string[];
};

const RulingStep1VerdictAnalysis = ({ nextStep, selectedFacts }: TRulingStep1Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 // Legacy mapping or Redux
 const verdictAnalysis = useAppSelector((s) => s.rulingAnalysis.outputs[1]);

 const { isLoading, hasFailed, errorMessage, retry } = useAnalysisStep<TVerdictAnalysis>({
 parseResult: parseWorkflowJobResult,
 caseId: caseId as string,
 stepType:'RulingAnalysisOperative',
 autoSubmit: true,
 inputJson: buildAnalysisInput(caseId ||'', selectedFacts),
 onHydrate: (parsed) => dispatch(hydrateRulingStep({ stepNumber: 1, result: parsed })),
 });

 return (
 <UnifiedStepShell
 isLoading={isLoading && !verdictAnalysis}
 hasFailed={hasFailed && !verdictAnalysis}
 errorMessage={errorMessage}
 onRetry={retry}
 title={verdictAnalysis ? "تحليل منطوق الحكم" : undefined}
 sidebar={verdictAnalysis ? (
 <>
 <AnalysisStageSidebarCard
 label="التهم المستخرجة"
 value={verdictAnalysis.charges?.length || 0}
 valueClassName="text-5xl"
 description="تم تحليل منطوق الحكم بنجاح واستخراج بيانات التهم الأساسية، جاهزين للانتقال إلى تحليل الأسباب."
 />
 <AnalysisStageActionButton
 label="تحليل الأسباب"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 </>
 ) : undefined}
 >
  {verdictAnalysis && (
  <>
  <AnalysisStageSectionCard label="ملخص المنطوق">
  <p className="text-sm leading-relaxed app-text-muted">
  {verdictAnalysis.verdictSummary}
  </p>
  </AnalysisStageSectionCard>

  {verdictAnalysis.charges?.length > 0 && (
  <AnalysisStageSectionCard label="التهم الموجهة">
  <div className="flex flex-wrap gap-2">
  {verdictAnalysis.charges.map((charge, idx) => (
  <span key={idx} className="inline-block rounded-full px-4 py-1.5 text-sm font-bold app-surface-soft dark:app-surface-soft app-text-muted border app-border-strong dark:app-border-strong">
  {charge}
  </span>
  ))}
  </div>
  </AnalysisStageSectionCard>
  )}

  {verdictAnalysis.verdictPoints?.length > 0 && (
  <AnalysisStageSectionCard label="نقاط الحكم الأساسية">
  <AnalysisStageNumberedList items={verdictAnalysis.verdictPoints} />
  </AnalysisStageSectionCard>
  )}
  </>
  )}
 </UnifiedStepShell>
 );
};

export default RulingStep1VerdictAnalysis;
