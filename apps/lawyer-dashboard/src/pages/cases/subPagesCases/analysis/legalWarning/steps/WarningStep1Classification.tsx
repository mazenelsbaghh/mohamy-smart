import {  parseWorkflowJobResult  } from"@mohamy/shared-utils";
import { useEffect, useRef } from'react';
import { useParams } from'react-router-dom';
import { IoArrowBackOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import thunkSubmitAiJob from'../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { hydrateStep } from'../../../../../../redux/legalWarning/legalWarningSlice';
import {
 UnifiedStepShell,
 AnalysisStageActionButton,
 AnalysisStageBanner,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { LEGAL_WARNING_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';

type TWarningStep1Props = {
 nextStep: () => void;
 selectedFacts: string[];
};



const WarningStep1Classification = ({ nextStep, selectedFacts }: TWarningStep1Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 const aiJobsState = useAppSelector((s) => s.aiJobs);
 const classification = useAppSelector((s) => s.legalWarning.outputs[1]);
 const job = aiJobsState.jobs['LegalWarningClassification'];

 const isProcessingJob = job?.status ==='Queued' || job?.status ==='Processing';
 const isWaitingForHydration = job?.status ==='Completed' && !classification;
 const isLoading = isProcessingJob || isWaitingForHydration;

 const hasAutoSubmitted = useRef(false);

 useEffect(() => {
 if (job?.status ==='Completed' && job.resultJson && !classification) {
 try {
 const parsed = parseWorkflowJobResult(job.resultJson);
 dispatch(hydrateStep({ stepNumber: 1, result: parsed }));
 } catch { /* ignore parse errors */ }
 }
 }, [job?.status, job?.resultJson, classification, dispatch]);

 useEffect(() => {
 if (hasAutoSubmitted.current || classification || job) return;
 if (aiJobsState.loading ==='idle' || aiJobsState.loading ==='pending') return;
 hasAutoSubmitted.current = true;
 if (!caseId) return;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'LegalWarningClassification',
 inputJson: buildAnalysisInput(caseId, selectedFacts),
 }));
 }, [classification, job, aiJobsState.loading, caseId, dispatch, selectedFacts]);

 const handleRetry = () => {
 if (!caseId) return;
 hasAutoSubmitted.current = true;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'LegalWarningClassification',
 inputJson: buildAnalysisInput(caseId, selectedFacts),
 }));
 };

 return (
 <UnifiedStepShell
 isLoading={isLoading}
 hasFailed={job?.status === 'Failed'}
 errorMessage={job?.errorMessage || 'تعذّر تصنيف الإنذار. أعد المحاولة.'}
 onRetry={handleRetry}
 loadingTitle="جاري تصنيف الإنذار وتحليل الالتزامات..."
 loadingSubtitle="يقوم النظام بدراسة وقائع القضية وتحديد نوع الإنذار والأساس القانوني المناسب."
 steps={LEGAL_WARNING_STEPS}
 currentStepIndex={0}
 title="تصنيف الإنذار وتحديد الالتزامات"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="التصنيف"
 value={classification?.warningType}
 valueClassName="text-2xl"
 description="تم تحديد نوع الإنذار والأساس القانوني. يمكنك الانتقال لصياغة متن الإنذار."
 />
 <AnalysisStageActionButton
 label="الانتقال لصياغة الإنذار"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 </>
 }
 >
 <AnalysisStageSectionCard label="نوع الإنذار">
 <span className="inline-block rounded-full px-4 py-1.5 text-sm font-bold bg-orange-100 text-orange-800">
 {classification?.warningType}
 </span>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="الأساس القانوني">
 <span className="inline-block rounded-full px-3 py-1 text-xs font-bold app-surface-soft app-text-muted mb-3">
 {classification?.legalBasis?.type}
 </span>
 <p className="text-sm leading-relaxed app-text-muted">
 {classification?.legalBasis?.description}
 </p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="تفاصيل الالتزام">
 <p className="text-sm leading-relaxed app-text-muted">
 {classification?.obligationDetails}
 </p>
 </AnalysisStageSectionCard>

 {classification?.recommendedAction && (
 <AnalysisStageBanner label="الإجراء الموصى به" icon="⚡">
 <p>{classification?.recommendedAction}</p>
 </AnalysisStageBanner>
 )}
 </UnifiedStepShell>
 );
};

export default WarningStep1Classification;
