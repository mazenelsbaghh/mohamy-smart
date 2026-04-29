import DOMPurify from 'dompurify';
import { sanitizeHtml, isSanitizedEmpty } from "@mohamy/shared-utils";
import { SanitizedContentEmpty } from '../../../../../../components/ui/SanitizedContentEmpty';
import { parseWorkflowJobResult } from "@mohamy/shared-utils";
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IoCheckmarkOutline, IoCopyOutline } from 'react-icons/io5';
import { useAppDispatch, useAppSelector } from '../../../../../../hooks/reduxHooks';
import thunkSubmitAiJob from '../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { hydrateStep, adminComplaintThunks } from '../../../../../../redux/adminComplaint/adminComplaintSlice';
import {
  UnifiedStepShell,
  AnalysisStageActionButton,
  AnalysisStageDocumentCard,
  AnalysisStageSidebarCard,
} from '../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from '../../../../../../components/analysisWorkflow/analysisFacts';
import { useWorkflowAutoSave } from '../../../../../../hooks/useWorkflowAutoSave';
import { ADMIN_COMPLAINT_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';

type TComplaintStep5Props = {
  selectedFacts: string[];
};

const ComplaintStep5FinalAssembly = ({ selectedFacts }: TComplaintStep5Props) => {
  const { id: caseId } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const aiJobsState = useAppSelector((s) => s.aiJobs);
  const { outputs } = useAppSelector((s) => s.adminComplaint);
  const requestsDraft = outputs[4];
  const finalDocument = outputs[5];
  const job = aiJobsState.jobs['AdminComplaintAssembly'];
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const workflowId = useAppSelector(s => s.adminComplaint.workflowId);
  const lastSavedAt = useAppSelector(s => s.adminComplaint.lastSavedAt);
  const lastSaved = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : null;

  const { isAutoSaving } = useAppSelector(s => s.adminComplaint.loadingState);

  const { debouncedSave } = useWorkflowAutoSave({
    mode: 'immediate',
    onSave: async (payload) => {
      if (!workflowId) return;
      await dispatch(adminComplaintThunks.saveDraftStep({
        routeId: workflowId,
        stepNumber: 5,
        payload: { documentText: payload }
      })).unwrap();
    }
  });

  const isProcessingJob = job?.status === 'Queued' || job?.status === 'Processing';
  const isWaitingForHydration = job?.status === 'Completed' && !finalDocument;
  const isLoading = isProcessingJob || isWaitingForHydration || (!job && !finalDocument);
  const hasFailed = job?.status === 'Failed';

  useEffect(() => {
    if (job?.status === 'Completed' && job.resultJson && !finalDocument) {
      try {
        const parsed = parseWorkflowJobResult(job.resultJson);
        dispatch(hydrateStep({ stepNumber: 5, result: parsed }));
      } catch { /* ignore */ }
    }
  }, [job?.status, job?.resultJson, finalDocument, dispatch]);

  useEffect(() => {
    if (finalDocument || job || !caseId || !requestsDraft) return;
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'AdminComplaintAssembly',
      inputJson: buildAnalysisInput(caseId, selectedFacts),
    }));
  }, [finalDocument, job, caseId, requestsDraft, dispatch, selectedFacts]);

  const handleRetry = () => {
    if (!caseId || !requestsDraft) return;
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'AdminComplaintAssembly',
      inputJson: buildAnalysisInput(caseId, selectedFacts),
    }));
  };

  const handleCopy = () => {
    if (!finalDocument?.documentText) return;
    navigator.clipboard.writeText(finalDocument.documentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHighlightedText = (text: string) => {
    const highlighted = text.replace(
      /\{\{([^}]+)\}\}/g, '<mark class="bg-[var(--accent-soft)] px-1 rounded text-yellow-800 font-medium">{{$1}}</mark>'
    );
    return DOMPurify.sanitize(highlighted, {
      ALLOWED_TAGS: ['mark', 'br', 'p', 'span', 'div', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['class', 'style']
    });
  };

  return (
    <UnifiedStepShell
      isLoading={isLoading}
      hasFailed={hasFailed}
      errorMessage={job?.errorMessage || 'تعذّر إعداد المسودة النهائية. أعد المحاولة.'}
      onRetry={handleRetry}
      loadingTitle="جاري تجميع مسودة الشكوى الذكية..."
      loadingSubtitle="يقوم النظام بكتابة وتنسيق المذكرة النهائية وتضمين الوقائع والمخالفات والطلبات."
      steps={ADMIN_COMPLAINT_STEPS}
      currentStepIndex={4}
      title="المسودة النهائية للشكوى"
      sidebar={
        <>
          <AnalysisStageSidebarCard
            label="الحالة"
            value={isAutoSaving ? 'جارِ الحفظ...' : (lastSaved ? 'محفوظ' : 'جاهزة للنسخ')}
            tone={isAutoSaving ? 'accent' : 'success'}
            icon={<IoCheckmarkOutline />}
            valueClassName="text-lg"
            description={lastSaved ? `آخر حفظ ${lastSaved}` : "تم تجميع الشكوى النهائية. الأجزاء المظللة بحاجة للمراجعة أو إدخال البيانات المخصصة."}
          />
          <AnalysisStageActionButton
            label={copied ? 'تم النسخ!' : 'نسخ المسودة'}
            icon={copied ? IoCheckmarkOutline : IoCopyOutline}
            onClick={handleCopy}
            variant="secondary"
          />
        </>
      }
    >
      <AnalysisStageDocumentCard label="محتوى الشكوى" badge="مسودة جاهزة للتحرير">
        {isSanitizedEmpty(getHighlightedText(finalDocument?.documentText || '')) ? (
          <SanitizedContentEmpty />
        ) : (
          <div
            className="text-sm leading-[2.4] text-[var(--title-color)] dark:text-gray-200 text-end whitespace-pre-wrap outline-none focus:ring-2 focus:ring-[var(--main-color)]/30 rounded-lg p-4 w-full transition-shadow"
            style={{ direction: 'rtl', minHeight: '300px' }}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            ref={editorRef}
            onInput={() => {
              if (editorRef.current) debouncedSave(editorRef.current.innerText || editorRef.current.innerHTML);
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(getHighlightedText(finalDocument?.documentText || '')) }}
          />
        )}
      </AnalysisStageDocumentCard>
    </UnifiedStepShell>
  );
};

export default ComplaintStep5FinalAssembly;
