import {  parseWorkflowJobResult  } from"@mohamy/shared-utils";
import { useEffect } from'react';
import { useParams } from'react-router-dom';
import { IoArrowBackOutline, IoRefreshOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import SmartAnalysisLoader from'../../../../../../components/skeleton/SmartAnalysisLoader';
import thunkSubmitAiJob from'../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { hydrateStep } from'../../../../../../redux/adminComplaint/adminComplaintSlice';
import {
 AnalysisStageActionButton,
 AnalysisStageLayout,
 AnalysisStageNumberedList,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { ADMIN_COMPLAINT_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';

type TComplaintStep4Props = {
 nextStep: () => void;
 selectedFacts: string[];
};

const ComplaintStep4RequestsDraft = ({ nextStep, selectedFacts }: TComplaintStep4Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 const aiJobsState = useAppSelector((s) => s.aiJobs);
 const { outputs } = useAppSelector((s) => s.adminComplaint);
 const violationAnalysis = outputs[3];
 const requestsDraft = outputs[4];
 const job = aiJobsState.jobs['AdminComplaintRequests'];

 const isProcessingJob = job?.status ==='Queued' || job?.status ==='Processing';
 const isWaitingForHydration = job?.status ==='Completed' && !requestsDraft;
 const showLoader = isProcessingJob || isWaitingForHydration || (!job && !requestsDraft);

 useEffect(() => {
 if (job?.status ==='Completed' && job.resultJson && !requestsDraft) {
 try {
 const parsed = parseWorkflowJobResult(job.resultJson);
 dispatch(hydrateStep({ stepNumber: 4, result: parsed }));
 } catch { /* ignore */ }
 }
 }, [job?.status, job?.resultJson, requestsDraft, dispatch]);

 useEffect(() => {
 if (requestsDraft || job || !caseId || !violationAnalysis) return;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'AdminComplaintRequests',
 inputJson: buildAnalysisInput(caseId, selectedFacts),
 }));
 }, [requestsDraft, job, caseId, violationAnalysis, dispatch, selectedFacts]);

 const handleRetry = () => {
 if (!caseId || !violationAnalysis) return;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'AdminComplaintRequests',
 inputJson: buildAnalysisInput(caseId, selectedFacts),
 }));
 };

 if (showLoader && job?.status !=='Failed') {
 return (
 <SmartAnalysisLoader
 title="جاري صياغة طلبات الشكوى..."
 subtitle="بناءً على المخالفات المحددة، يقوم النظام بصياغة طلبات دقيقة ومقنعة للجهة المعنية."
 steps={ADMIN_COMPLAINT_STEPS}
 activeStepIndex={3}
 />
 );
 }

 if (job?.status ==='Failed') {
 return (
 <div className="w-full mt-4">
 <div className="flex items-center gap-3 p-4 mb-4 bg-[var(--danger-soft)] border border-[var(--danger-soft)] rounded-xl">
 <span className="text-sm font-bold text-[var(--danger-color)]">
 {job.errorMessage ||'تعذّر صياغة الطلبات. أعد المحاولة.'}
 </span>
 <button type="button" onClick={handleRetry} className="me-auto flex items-center gap-2 bg-[var(--danger-soft)] text-[var(--danger-color)] px-4 py-1.5 rounded-full text-sm font-bold hover:bg-red-200 transition-colors">
 <IoRefreshOutline />إعادة المحاولة
 </button>
 </div>
 </div>
 );
 }

 if (!requestsDraft) return null;

 return (
 <AnalysisStageLayout
 title="إعداد طلبات الشكوى"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="عدد الطلبات المحددة"
 value={requestsDraft.requests?.length || 0}
 valueClassName="text-5xl"
 description="تمت صياغة كافة طلبات الشكوى. يمكنك الآن إعداد مسودة الشكوى النهائية وتصديرها."
 />
 <AnalysisStageActionButton
 label="إعداد مسودة الشكوى النهائية"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 </>
 }
 >
 {requestsDraft.requests?.length > 0 ? (
 <AnalysisStageSectionCard label="الطلبات الأساسية">
 <AnalysisStageNumberedList items={requestsDraft.requests} />
 </AnalysisStageSectionCard>
 ) : (
 <AnalysisStageSectionCard label="الطلبات الأساسية" className="text-center">
 <p className="text-sm app-text-subtle">لا توجد طلبات محددة.</p>
 </AnalysisStageSectionCard>
 )}
 </AnalysisStageLayout>
 );
};

export default ComplaintStep4RequestsDraft;
