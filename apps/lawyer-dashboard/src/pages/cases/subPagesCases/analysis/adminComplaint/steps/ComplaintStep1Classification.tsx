import { parseWorkflowJobResult } from "@mohamy/shared-utils";
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useAppDispatch, useAppSelector } from '../../../../../../hooks/reduxHooks';
import thunkSubmitAiJob from '../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { hydrateStep } from '../../../../../../redux/adminComplaint/adminComplaintSlice';
import {
  UnifiedStepShell,
  AnalysisStageActionButton,
  AnalysisStageSectionCard,
  AnalysisStageSidebarCard,
} from '../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from '../../../../../../components/analysisWorkflow/analysisFacts';
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

  const isProcessingJob = job?.status === 'Queued' || job?.status === 'Processing';
  const isWaitingForHydration = job?.status === 'Completed' && !classification;
  const isLoading = isProcessingJob || isWaitingForHydration || (!job && !classification);
  const hasFailed = job?.status === 'Failed';

  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (job?.status === 'Completed' && job.resultJson && !classification) {
      try {
        const parsed = parseWorkflowJobResult(job.resultJson);
        dispatch(hydrateStep({ stepNumber: 1, result: parsed }));
      } catch { /* ignore */ }
    }
  }, [job?.status, job?.resultJson, classification, dispatch]);

  useEffect(() => {
    if (hasAutoSubmitted.current || classification || job) return;
    if (aiJobsState.loading === 'idle' || aiJobsState.loading === 'pending') return;
    hasAutoSubmitted.current = true;
    if (!caseId) return;
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'AdminComplaintClassification',
      inputJson: buildAnalysisInput(caseId, selectedFacts),
    }));
  }, [classification, job, aiJobsState.loading, caseId, dispatch, selectedFacts]);

  const handleRetry = () => {
    if (!caseId) return;
    hasAutoSubmitted.current = true;
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'AdminComplaintClassification',
      inputJson: buildAnalysisInput(caseId, selectedFacts),
    }));
  };

  return (
    <UnifiedStepShell
      isLoading={isLoading}
      hasFailed={hasFailed}
      errorMessage={job?.errorMessage || 'تعذّر تصنيف الشكوى. أعد المحاولة أو راجع بيانات القضية.'}
      onRetry={handleRetry}
      loadingTitle="جاري تصنيف الشكوى..."
      loadingSubtitle="يقوم النظام بدراسة وقائع الشكوى وتحديد جهة الاختصاص والأساس القانوني."
      steps={ADMIN_COMPLAINT_STEPS}
      currentStepIndex={0}
      title="تصنيف الشكوى وتحديد الجهة المختصة"
      sidebar={
        <>
          <AnalysisStageSidebarCard
            label="جهة الاختصاص"
            value={classification?.targetAuthority}
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
          {classification?.complaintType}
        </span>
      </AnalysisStageSectionCard>

      <AnalysisStageSectionCard label="الجهة الموجه إليها الشكوى (جهة الاختصاص)">
        <p className="text-lg font-bold text-[var(--title-color)]">
          {classification?.targetAuthority}
        </p>
      </AnalysisStageSectionCard>

      <AnalysisStageSectionCard label="الأساس القانوني للشكوى">
        <p className="text-sm leading-relaxed app-text-muted">
          {classification?.legalBasis}
        </p>
      </AnalysisStageSectionCard>
    </UnifiedStepShell>
  );
};

export default ComplaintStep1Classification;
