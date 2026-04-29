import { useEffect, useState } from 'react';
import { parseWorkflowJobResult } from "@mohamy/shared-utils";
import { useParams } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useAppDispatch, useAppSelector } from '../../../../../../hooks/reduxHooks';
import thunkSubmitAiJob from '../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import {
  adminComplaintThunks,
  hydrateStep,
} from '../../../../../../redux/adminComplaint/adminComplaintSlice';
import {
  UnifiedStepShell,
  AnalysisStageActionButton,
  AnalysisStageNumberedList,
  AnalysisStageSectionCard,
  AnalysisStageSidebarCard,
} from '../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from '../../../../../../components/analysisWorkflow/analysisFacts';
import { useWorkflowAutoSave } from '../../../../../../hooks/useWorkflowAutoSave';
import { ADMIN_COMPLAINT_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';

type TComplaintStep2Props = {
  nextStep: () => void;
  selectedFacts: string[];
};

const ComplaintStep2FactsDraft = ({ nextStep, selectedFacts }: TComplaintStep2Props) => {
  const { id: caseId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const aiJobsState = useAppSelector((s) => s.aiJobs);
  const { outputs } = useAppSelector((s) => s.adminComplaint);
  const classification = outputs[1];
  const factsDraft = outputs[2];
  const keyFacts = factsDraft?.keyFacts ?? [];
  const job = aiJobsState.jobs['AdminComplaintFacts'];
  const [localText, setLocalText] = useState('');
  const workflowId = useAppSelector(s => s.adminComplaint.workflowId);
  const lastSavedAt = useAppSelector(s => s.adminComplaint.lastSavedAt);
  const lastSaved = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : null;

  useEffect(() => {
    if (factsDraft?.factsSummary && !localText) {
      setLocalText(factsDraft.factsSummary);
    }
  }, [factsDraft?.factsSummary, localText]);

  const { isAutoSaving } = useAppSelector(s => s.adminComplaint.loadingState);

  const { debouncedSave } = useWorkflowAutoSave({
    mode: 'immediate',
    onSave: async (payload) => {
      if (!workflowId || !factsDraft) return;
      await dispatch(adminComplaintThunks.saveDraftStep({
        routeId: workflowId,
        stepNumber: 2,
        payload: { ...factsDraft, factsSummary: payload }
      })).unwrap();
    }
  });

  const isProcessingJob = job?.status === 'Queued' || job?.status === 'Processing';
  const isWaitingForHydration = job?.status === 'Completed' && !factsDraft;
  const isLoading = isProcessingJob || isWaitingForHydration || (!job && !factsDraft);
  const hasFailed = job?.status === 'Failed';

  useEffect(() => {
    if (job?.status === 'Completed' && job.resultJson && !factsDraft) {
      try {
        const parsed = parseWorkflowJobResult(job.resultJson);
        dispatch(hydrateStep({ stepNumber: 2, result: parsed }));
      } catch { /* ignore */ }
    }
  }, [job?.status, job?.resultJson, factsDraft, dispatch]);

  useEffect(() => {
    if (factsDraft || job || !caseId || !classification) return;
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'AdminComplaintFacts',
      inputJson: buildAnalysisInput(caseId, selectedFacts),
    }));
  }, [factsDraft, job, caseId, classification, dispatch, selectedFacts]);

  const handleRetry = () => {
    if (!caseId || !classification) return;
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'AdminComplaintFacts',
      inputJson: buildAnalysisInput(caseId, selectedFacts),
    }));
  };

  return (
    <UnifiedStepShell
      isLoading={isLoading}
      hasFailed={hasFailed}
      errorMessage={job?.errorMessage || 'تعذّر صياغة الوقائع. أعد المحاولة أو راجع الوقائع المُدخلة.'}
      onRetry={handleRetry}
      loadingTitle="جاري صياغة وتسلسل الوقائع..."
      loadingSubtitle="يتم استخراج الوقائع من المستندات وصياغتها بترتيب زمني يتناسب مع الجهة الإدارية."
      steps={ADMIN_COMPLAINT_STEPS}
      currentStepIndex={1}
      title="صياغة وقائع الشكوى"
      sidebar={
        <>
          <AnalysisStageSidebarCard
            label={isAutoSaving ? 'جارِ الحفظ...' : (lastSaved ? 'وقائع مستخرجة' : 'وقائع مستخرجة')}
            value={keyFacts.length}
            valueClassName="text-5xl"
            description={lastSaved ? `آخر حفظ ${lastSaved}` : "تمت صياغة الوقائع. الخطوة التالية هي ربط هذه الوقائع بالمخالفات والأضرار الواقعة."}
          />
          <AnalysisStageActionButton
            label="تحليل المخالفات الإدارية"
            icon={IoArrowBackOutline}
            onClick={nextStep}
          />
        </>
      }
    >
      <AnalysisStageSectionCard label="سرد وقائع الشكوى">
        <textarea
          className="text-sm leading-[2.2] app-text-muted w-full outline-none bg-transparent resize-none border border-transparent hover:app-border-strong focus:border-[var(--main-color)] focus:ring-1 focus:ring-[var(--main-color)]/20 rounded p-2 transition-colors min-h-[300px]"

          value={localText}
          onChange={(e) => {
            setLocalText(e.target.value);
            debouncedSave(e.target.value);
          }}
        />
      </AnalysisStageSectionCard>

      {keyFacts.length > 0 && (
        <AnalysisStageSectionCard label="النقاط الزمنية والمحورية في الوقائع">
          <AnalysisStageNumberedList items={keyFacts} />
        </AnalysisStageSectionCard>
      )}
    </UnifiedStepShell>
  );
};

export default ComplaintStep2FactsDraft;
