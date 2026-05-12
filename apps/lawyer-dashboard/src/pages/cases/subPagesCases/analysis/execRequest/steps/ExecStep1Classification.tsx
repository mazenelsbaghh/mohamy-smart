import { parseJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoArrowBackOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateStep } from'../../../../../../redux/execRequest/execRequestSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import {
 UnifiedStepShell,
 AnalysisStageActionButton,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';

type TExecStep1Props = {
 nextStep: () => void;
 selectedFacts: string[];
};

const ExecStep1Classification = ({ nextStep, selectedFacts }: TExecStep1Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 const classification = useAppSelector((s) => s.execRequest.outputs[1]);


 const { isLoading, hasFailed, errorMessage, retry, charge } = useAnalysisStep({
 parseResult: parseJobResult,
 caseId: caseId as string,
 stepType:'ExecRequestClassification',
 autoSubmit: true,
 inputJson: buildAnalysisInput(caseId ||'', selectedFacts),
 onHydrate: (parsed) => dispatch(hydrateStep({ stepNumber: 1, result: parsed })),
 });

 return (
 <UnifiedStepShell
 isLoading={isLoading && !classification}
 hasFailed={hasFailed && !classification}
 errorMessage={errorMessage}
 onRetry={retry}
 charge={charge}
 title={classification ? "تصنيف ومعطيات الطلب التنفيذي" : undefined}
 sidebar={classification ? (
 <>
 <AnalysisStageSidebarCard
 label="نوع الطلب المستخرج"
 value={classification.requestType}
 valueClassName="text-2xl"
 description="تم تحديد نوع الطلب التنفيذي والسند القانوني الخاص به. النظام جاهز لصياغة مسودة الطلب."
 />
 <AnalysisStageActionButton
 label="صياغة متطلبات التنفيذ"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 </>
 ) : undefined}
 >
 {classification && (
 <>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <AnalysisStageSectionCard label="نوع الطلب التنفيذي">
 <span className="inline-block rounded-full px-4 py-1.5 text-sm font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300">
 {classification.requestType}
 </span>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="درجة الأهمية / الاستعجال">
 <span className="inline-block rounded-full px-4 py-1.5 text-sm font-bold app-surface-soft dark:app-surface-soft app-text-muted">
 {classification.urgencyLevel ||'عادي'}
 </span>
 </AnalysisStageSectionCard>
 </div>

 <AnalysisStageSectionCard label="السند التنفيذي والأساس القانوني">
 <p className="text-sm leading-relaxed app-text-muted">
 {classification.legalBasis}
 </p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="موجبات ودواعي التنفيذ">
 <p className="text-sm leading-relaxed app-text-muted">
 {classification.executionGrounds}
 </p>
 </AnalysisStageSectionCard>
 </>
 )}
 </UnifiedStepShell>
 );
};

export default ExecStep1Classification;

