import {  parseWorkflowJobResult  } from"@mohamy/shared-utils";
import { useEffect, useRef } from'react';
import { useParams } from'react-router-dom';
import { IoArrowBackOutline, IoRefreshOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import SmartAnalysisLoader from'../../../../../../components/skeleton/SmartAnalysisLoader';
import thunkSubmitAiJob from'../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { hydrateStep } from'../../../../../../redux/adminComplaint/adminComplaintSlice';
import {
 AnalysisStageActionButton,
 AnalysisStageLayout,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { ADMIN_COMPLAINT_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';

type TComplaintStep1Props = {
 nextStep: () => void;
 selectedFacts: string[];
};



const ComplaintStep1Classification = ({ nextStep, selectedFacts }: TComplaintStep1Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 const aiJobsState = useAppSelector((s) => s.aiJobs);
 const classification = useAppSelector((s) => s.adminComplaint.outputs[1]);
 const job = aiJobsState.jobs['AdminComplaintClassification'];

 const isProcessingJob = job?.status ==='Queued' || job?.status ==='Processing';
 const isWaitingForHydration = job?.status ==='Completed' && !classification;
 const showLoader = isProcessingJob || isWaitingForHydration;

 const hasAutoSubmitted = useRef(false);

 // Hydrate
 useEffect(() => {
 if (job?.status ==='Completed' && job.resultJson && !classification) {
 try {
 const parsed = parseWorkflowJobResult(job.resultJson);
 dispatch(hydrateStep({ stepNumber: 1, result: parsed }));
 } catch { /* ignore */ }
 }
 }, [job?.status, job?.resultJson, classification, dispatch]);

 // Auto-submit
 useEffect(() => {
 if (hasAutoSubmitted.current || classification || job) return;
 if (aiJobsState.loading ==='idle' || aiJobsState.loading ==='pending') return;
 hasAutoSubmitted.current = true;
 if (!caseId) return;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'AdminComplaintClassification',
 inputJson: buildAnalysisInput(caseId, selectedFacts),
 }));
 }, [classification, job, aiJobsState.loading, caseId, dispatch, selectedFacts]);

 const handleRetry = () => {
 if (!caseId) return;
 hasAutoSubmitted.current = true;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'AdminComplaintClassification',
 inputJson: buildAnalysisInput(caseId, selectedFacts),
 }));
 };

 if (showLoader) {
 return (
 <SmartAnalysisLoader
 title="جاري تصنيف الشكوى..."
 subtitle="يقوم النظام بدراسة وقائع الشكوى وتحديد جهة الاختصاص والأساس القانوني."
 steps={ADMIN_COMPLAINT_STEPS}
 activeStepIndex={0}
 />
 );
 }

 if (job?.status ==='Failed') {
 return (
 <div className="w-full mt-4">
 <div className="flex items-center gap-3 p-4 mb-4 bg-[var(--danger-soft)] border border-[var(--danger-soft)] rounded-xl">
 <span className="text-sm font-bold text-[var(--danger-color)]">
 {job.errorMessage ||'تعذّر تصنيف الشكوى. أعد المحاولة أو راجع بيانات القضية.'}
 </span>
 <button type="button" onClick={handleRetry} className="me-auto flex items-center gap-2 bg-[var(--danger-soft)] text-[var(--danger-color)] px-4 py-1.5 rounded-full text-sm font-bold hover:bg-red-200 transition-colors">
 <IoRefreshOutline />إعادة المحاولة
 </button>
 </div>
 </div>
 );
 }

 if (!classification) return null;

 return (
 <AnalysisStageLayout
 title="تصنيف الشكوى وتحديد الجهة المختصة"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="جهة الاختصاص"
 value={classification.targetAuthority}
 valueClassName="text-xl"
 description="تم تحديد نوع الشكوى وجهة الاختصاص. يمكنك الآن الانتقال لاستخراج وصياغة الوقائع."
 />
 <AnalysisStageActionButton
 label="صياغة الوقائع"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 </>
 }
 >
 <AnalysisStageSectionCard label="نوع الشكوى">
 <span className="inline-block rounded-full px-4 py-1.5 text-sm font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300">
 {classification.complaintType}
 </span>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="الجهة الموجه إليها الشكوى (جهة الاختصاص)">
 <p className="text-lg font-bold text-[var(--title-color)]">
 {classification.targetAuthority}
 </p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="الأساس القانوني للشكوى">
 <p className="text-sm leading-relaxed app-text-muted">
 {classification.legalBasis}
 </p>
 </AnalysisStageSectionCard>
 </AnalysisStageLayout>
 );
};

export default ComplaintStep1Classification;
