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
  AnalysisStageSectionCard,
  AnalysisStageSidebarCard,
} from '../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from '../../../../../../components/analysisWorkflow/analysisFacts';
import { ADMIN_COMPLAINT_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';

type TComplaintStep3Props = {
  nextStep: () => void;
  selectedFacts: string[];
};

const ComplaintStep3ViolationAnalysis = ({ nextStep, selectedFacts }: TComplaintStep3Props) => {
  const { id: caseId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const aiJobsState = useAppSelector((s) => s.aiJobs);
  const { outputs } = useAppSelector((s) => s.adminComplaint);
  const factsDraft = outputs[2];
  const violationAnalysis = outputs[3];
  const job = aiJobsState.jobs['AdminComplaintViolation'];

  const isProcessingJob = job?.status === 'Queued' || job?.status === 'Processing';
  const isWaitingForHydration = job?.status === 'Completed' && !violationAnalysis;
  const isLoading = isProcessingJob || isWaitingForHydration || (!job && !violationAnalysis);
  const hasFailed = job?.status === 'Failed';

  useEffect(() => {
    if (job?.status === 'Completed' && job.resultJson && !violationAnalysis) {
      try {
        const parsed = parseWorkflowJobResult(job.resultJson);
        dispatch(hydrateStep({ stepNumber: 3, result: parsed }));
      } catch { /* ignore */ }
    }
  }, [job?.status, job?.resultJson, violationAnalysis, dispatch]);

  useEffect(() => {
    if (violationAnalysis || job || !caseId || !factsDraft) return;
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'AdminComplaintViolation',
      inputJson: buildAnalysisInput(caseId, selectedFacts),
    }));
  }, [violationAnalysis, job, caseId, factsDraft, dispatch, selectedFacts]);

  const handleRetry = () => {
    if (!caseId || !factsDraft) return;
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'AdminComplaintViolation',
      inputJson: buildAnalysisInput(caseId, selectedFacts),
    }));
  };

  return (
    <UnifiedStepShell
      isLoading={isLoading}
      hasFailed={hasFailed}
      errorMessage={job?.errorMessage || 'تعذّر تحليل المخالفات. أعد المحاولة.'}
      onRetry={handleRetry}
      loadingTitle="جاري تحليل المخالفات..."
      loadingSubtitle="يقوم النظام بربط الوقائع بالأنظمة الإدارية وتحديد المخالفات بشكل مقنن لدعم الشكوى."
      steps={ADMIN_COMPLAINT_STEPS}
      currentStepIndex={2}
      title="تحليل المخالفات والقصور الإداري"
      sidebar={
        <>
          <AnalysisStageSidebarCard
            label="إجمالي المخالفات"
            value={violationAnalysis?.violations?.length || 0}
            valueClassName="text-5xl"
            description="تم تكييف الوقائع قانونياً وإدارياً. يمكنك الانتقال الآن لإعداد وتحديد طلبات الشكوى."
          />
          <AnalysisStageActionButton
            label="إعداد طلبات الشكوى"
            icon={IoArrowBackOutline}
            onClick={nextStep}
          />
        </>
      }
    >
      {violationAnalysis?.violations?.length > 0 ? (
        <div className="flex flex-col gap-4">
          {violationAnalysis.violations.map((violation, idx) => (
            <AnalysisStageSectionCard key={idx} label={`مخالفة ${idx + 1}`} className="relative">
              <div className="absolute top-0 end-0 h-full w-[4px] bg-[var(--main-color)] opacity-60" />
              <div className="flex justify-between items-start mb-3">
                <span className="px-3 py-1 text-xs font-bold rounded-full app-surface-soft app-text-muted border app-border-strong dark:app-border-strong">
                  {violation.legalRef}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--title-color)]">
                {violation.description}
              </p>
            </AnalysisStageSectionCard>
          ))}
        </div>
      ) : (
        <AnalysisStageSectionCard label="المخالفات المستخرجة" className="text-center">
          <p className="text-sm app-text-subtle">لا توجد مخالفات واضحة مستخرجة من الوقائع.</p>
        </AnalysisStageSectionCard>
      )}
    </UnifiedStepShell>
  );
};

export default ComplaintStep3ViolationAnalysis;
