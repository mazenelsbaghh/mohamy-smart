import {  parseWorkflowJobResult  } from"@mohamy/shared-utils";
import { useEffect, useRef } from'react';
import { useParams } from'react-router-dom';
import { IoArrowBackOutline, IoRefreshOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import SmartAnalysisLoader from'../../../../../../components/skeleton/SmartAnalysisLoader';
import thunkSubmitAiJob from'../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { hydrateStep } from'../../../../../../redux/legalWarning/legalWarningSlice';
import {
 AnalysisStageActionButton,
 AnalysisStageBanner,
 AnalysisStageLayout,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';
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
 const showLoader = isProcessingJob || isWaitingForHydration;

 const hasAutoSubmitted = useRef(false);

 // Hydrate from resultJson when job completes
 useEffect(() => {
 if (job?.status ==='Completed' && job.resultJson && !classification) {
 try {
 const parsed = parseWorkflowJobResult(job.resultJson);
 dispatch(hydrateStep({ stepNumber: 1, result: parsed }));
 } catch { /* ignore parse errors */ }
 }
 }, [job?.status, job?.resultJson, classification, dispatch]);

 // Auto-submit on mount if no job exists yet
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

 if (showLoader) {
 return (
 <SmartAnalysisLoader
 title="جاري تصنيف الإنذار وتحليل الالتزامات..."
 subtitle="يقوم النظام بدراسة وقائع القضية وتحديد نوع الإنذار والأساس القانوني المناسب."
 steps={LEGAL_WARNING_STEPS}
 activeStepIndex={0}
 />
 );
 }

 if (job?.status ==='Failed') {
 return (
 <div className="w-full mt-4">
 <div className="flex items-center gap-3 p-4 mb-4 bg-[var(--danger-soft)] border border-[var(--danger-soft)] rounded-xl">
 <span className="text-sm font-bold text-[var(--danger-color)]">
 {job.errorMessage ||'تعذّر تصنيف الإنذار. أعد المحاولة.'}
 </span>
 <button
 type="button"
 onClick={handleRetry}
 className="me-auto flex items-center gap-2 bg-[var(--danger-soft)] text-[var(--danger-color)] px-4 py-1.5 rounded-full text-sm font-bold hover:bg-red-200 transition-colors"
 >
 <IoRefreshOutline />
 إعادة المحاولة
 </button>
 </div>
 </div>
 );
 }

 if (!classification) return null;

 return (
 <AnalysisStageLayout
 title="تصنيف الإنذار وتحديد الالتزامات"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="التصنيف"
 value={classification.warningType}
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
 {classification.warningType}
 </span>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="الأساس القانوني">
 <span className="inline-block rounded-full px-3 py-1 text-xs font-bold app-surface-soft app-text-muted mb-3">
 {classification.legalBasis?.type}
 </span>
 <p className="text-sm leading-relaxed app-text-muted">
 {classification.legalBasis?.description}
 </p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="تفاصيل الالتزام">
 <p className="text-sm leading-relaxed app-text-muted">
 {classification.obligationDetails}
 </p>
 </AnalysisStageSectionCard>

 {classification.recommendedAction && (
 <AnalysisStageBanner label="الإجراء الموصى به" icon="⚡">
 <p>{classification.recommendedAction}</p>
 </AnalysisStageBanner>
 )}
 </AnalysisStageLayout>
 );
};

export default WarningStep1Classification;
