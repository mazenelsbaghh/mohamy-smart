import { parseWorkflowJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoArrowBackOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateRulingStep } from'../../../../../../redux/rulingAnalysis/rulingAnalysisWorkflowSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import type { TReasonsAnalysis } from'../../../../../../redux/shared/workflowTypes';
import {
 UnifiedStepShell,
 AnalysisStageActionButton,
 AnalysisStageNumberedList,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';

type TRulingStep2Props = {
 nextStep: () => void;
 selectedFacts: string[];
};

const RulingStep2ReasonsAnalysis = ({ nextStep, selectedFacts }: TRulingStep2Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 // Legacy Redux state
 const verdictAnalysis = useAppSelector((s) => s.rulingAnalysis.outputs[1]);
 const reasonsAnalysis = useAppSelector((s) => s.rulingAnalysis.outputs[2]);

 const { isLoading, hasFailed, errorMessage, retry } = useAnalysisStep<TReasonsAnalysis>({
 parseResult: parseWorkflowJobResult,
 caseId: caseId as string,
 stepType:'RulingAnalysisReasoning',
 autoSubmit: Boolean(verdictAnalysis), // Only run if Phase 1 exists
 inputJson: buildAnalysisInput(caseId ||'', selectedFacts),
 onHydrate: (parsed) => dispatch(hydrateRulingStep({ stepNumber: 2, result: parsed })),
 });

 return (
 <UnifiedStepShell
 isLoading={isLoading && !reasonsAnalysis}
 hasFailed={hasFailed && !reasonsAnalysis}
 errorMessage={errorMessage}
 onRetry={retry}
 title={reasonsAnalysis ? "تحليل أسباب الحكم والأسانيد" : undefined}
 sidebar={reasonsAnalysis ? (
 <>
 <AnalysisStageSidebarCard
 label="أسباب الحكم المستخرجة"
 value={reasonsAnalysis.reasoningPoints?.length || 0}
 valueClassName="text-5xl"
 description="تم تحليل الأسباب التي استندت إليها المحكمة. لمعرفة ما إذا كانت هناك عيوب في هذا التسبيب يمكن الانتقال للخطوة التالية."
 />
 <AnalysisStageActionButton
 label="تقييم عيوب الحكم"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 </>
 ) : undefined}
 >
  {reasonsAnalysis && (
  <>
  {reasonsAnalysis.keyFindings?.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {reasonsAnalysis.keyFindings.map((finding, idx) => (
  <AnalysisStageSectionCard key={idx} label="استنتاج المحكمة" className="p-5">
  <p className="text-sm leading-relaxed app-text-muted font-medium">
  {finding}
  </p>
  </AnalysisStageSectionCard>
  ))}
  </div>
  )}

  {reasonsAnalysis.reasoningPoints?.length > 0 && (
  <AnalysisStageSectionCard label="النقاط التشريعية لتسبيب الحكم">
  <AnalysisStageNumberedList items={reasonsAnalysis.reasoningPoints} />
  </AnalysisStageSectionCard>
  )}
  </>
  )}
 </UnifiedStepShell>
 );
};

export default RulingStep2ReasonsAnalysis;
