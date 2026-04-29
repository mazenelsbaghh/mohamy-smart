import { parseWorkflowJobResult } from "@mohamy/shared-utils";
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useAppDispatch, useAppSelector } from '../../../../../../hooks/reduxHooks';
import thunkSubmitAiJob from '../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { hydrateStep } from '../../../../../../redux/adminComplaint/adminComplaintSlice';
import {
  UnifiedStepShell,
  AnalysisStageActionButton,
  AnalysisStageNumberedList,
  AnalysisStageSectionCard,
  AnalysisStageSidebarCard,
} from '../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from '../../../../../../components/analysisWorkflow/analysisFacts';
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
  const requests = requestsDraft?.requests ?? [];
  const job = aiJobsState.jobs['AdminComplaintRequests'];

  const isProcessingJob = job?.status === 'Queued' || job?.status === 'Processing';
  const isWaitingForHydration = job?.status === 'Completed' && !requestsDraft;
  const isLoading = isProcessingJob || isWaitingForHydration || (!job && !requestsDraft);
  const hasFailed = job?.status === 'Failed';

  useEffect(() => {
    if (job?.status === 'Completed' && job.resultJson && !requestsDraft) {
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
      stepType: 'AdminComplaintRequests',
      inputJson: buildAnalysisInput(caseId, selectedFacts),
    }));
  }, [requestsDraft, job, caseId, violationAnalysis, dispatch, selectedFacts]);

  const handleRetry = () => {
    if (!caseId || !violationAnalysis) return;
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'AdminComplaintRequests',
      inputJson: buildAnalysisInput(caseId, selectedFacts),
    }));
  };

  return (
    <UnifiedStepShell
      isLoading={isLoading}
      hasFailed={hasFailed}
      errorMessage={job?.errorMessage || 'تعذّر صياغة الطلبات. أعد المحاولة.'}
      onRetry={handleRetry}
      loadingTitle="جاري صياغة طلبات الشكوى..."
      loadingSubtitle="بناءً على المخالفات المحددة، يقوم النظام بصياغة طلبات دقيقة ومقنعة للجهة المعنية."
      steps={ADMIN_COMPLAINT_STEPS}
      currentStepIndex={3}
      title="إعداد طلبات الشكوى"
      sidebar={
        <>
          <AnalysisStageSidebarCard
            label="عدد الطلبات المحددة"
            value={requests.length}
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
      {requests.length > 0 ? (
        <AnalysisStageSectionCard label="الطلبات الأساسية">
          <AnalysisStageNumberedList items={requests} />
        </AnalysisStageSectionCard>
      ) : (
        <AnalysisStageSectionCard label="الطلبات الأساسية" className="text-center">
          <p className="text-sm app-text-subtle">لا توجد طلبات محددة.</p>
        </AnalysisStageSectionCard>
      )}
    </UnifiedStepShell>
  );
};

export default ComplaintStep4RequestsDraft;
