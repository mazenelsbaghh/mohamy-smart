import DOMPurify from'dompurify';
import { sanitizeHtml, isSanitizedEmpty } from"@mohamy/shared-utils";
import { SanitizedContentEmpty } from'../../../../../../components/ui/SanitizedContentEmpty';
import {  parseWorkflowJobResult  } from"@mohamy/shared-utils";
import { useEffect } from'react';
import { useParams } from'react-router-dom';
import { IoCopyOutline, IoCheckmarkOutline } from'react-icons/io5';
import { useState } from'react';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import thunkSubmitAiJob from'../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { hydrateStep } from'../../../../../../redux/legalWarning/legalWarningSlice';
import {
 UnifiedStepShell,
 AnalysisStageActionButton,
 AnalysisStageDocumentCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { useWorkflowAutoSave } from'../../../../../../hooks/useWorkflowAutoSave';
import { legalWarningThunks } from'../../../../../../redux/legalWarning/legalWarningSlice';
import { useRef } from'react';
import { LEGAL_WARNING_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';

type TWarningStep3Props = {
 selectedFacts: string[];
};

const WarningStep3FinalAssembly = ({ selectedFacts }: TWarningStep3Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 const aiJobsState = useAppSelector((s) => s.aiJobs);
 const warningDraft = useAppSelector((s) => s.legalWarning.outputs[2]);
 const finalDocument = useAppSelector((s) => s.legalWarning.outputs[3]);
 const job = aiJobsState.jobs['LegalWarningAssembly'];
 const [copied, setCopied] = useState(false);
 const editorRef = useRef<HTMLDivElement>(null);
 const workflowId = useAppSelector(s => s.legalWarning.workflowId);
 const lastSavedAt = useAppSelector(s => s.legalWarning.lastSavedAt);
 const lastSaved = lastSavedAt
 ? new Date(lastSavedAt).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' })
 : null;

 const { isAutoSaving } = useAppSelector(s => s.legalWarning.loadingState);

 const { debouncedSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 if (!workflowId) return;
 await dispatch(legalWarningThunks.saveDraftStep({
 routeId: workflowId,
 stepNumber: 3,
 payload: { documentText: payload }
 })).unwrap();
 }
 });

 const isProcessingJob = job?.status ==='Queued' || job?.status ==='Processing';
 const isWaitingForHydration = job?.status ==='Completed' && !finalDocument;
 const isLoading = isProcessingJob || isWaitingForHydration || (!job && !finalDocument);

 useEffect(() => {
 if (job?.status ==='Completed' && job.resultJson && !finalDocument) {
 try {
 const parsed = parseWorkflowJobResult(job.resultJson);
 dispatch(hydrateStep({ stepNumber: 3, result: parsed }));
 } catch { /* ignore */ }
 }
 }, [job?.status, job?.resultJson, finalDocument, dispatch]);

 useEffect(() => {
 if (finalDocument || job || !caseId || !warningDraft) return;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'LegalWarningAssembly',
 inputJson: buildAnalysisInput(caseId, selectedFacts, { warningBody: warningDraft.warningBody }),
 }));
 }, [finalDocument, job, caseId, warningDraft, dispatch, selectedFacts]);

 const handleRetry = () => {
 if (!caseId || !warningDraft) return;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'LegalWarningAssembly',
 inputJson: buildAnalysisInput(caseId, selectedFacts, { warningBody: warningDraft.warningBody }),
 }));
 };

 const handleCopy = () => {
 if (!finalDocument?.documentText) return;
 navigator.clipboard.writeText(finalDocument.documentText);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 const getHighlightedText = (text: string | undefined) => {
 if (!text) return'';
 const highlighted = text.replace(
 /\{\{([^}]+)\}\}/g,'<mark class="bg-[var(--accent-soft)] px-1 rounded text-yellow-800 font-medium">{{$1}}</mark>'
 );
 return DOMPurify.sanitize(highlighted, {
 ALLOWED_TAGS: ['mark','br','p','span','div','b','i','em','strong','ul','ol','li'],
 ALLOWED_ATTR: ['class','style']
 });
 };

 return (
 <UnifiedStepShell
 isLoading={isLoading}
 hasFailed={job?.status === 'Failed'}
 errorMessage={job?.errorMessage || 'تعذّر تجميع الإنذار النهائي. أعد المحاولة.'}
 onRetry={handleRetry}
 loadingTitle="جاري تجميع الإنذار الرسمي النهائي..."
 loadingSubtitle="يقوم النظام بتجميع وتنسيق الإنذار في صيغته الرسمية النهائية الجاهزة للتسليم."
 steps={LEGAL_WARNING_STEPS}
 currentStepIndex={2}
 title="الإنذار الرسمي النهائي"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="الحالة"
 value={isAutoSaving ?'جارِ الحفظ...' : (lastSaved ?'محفوظ' :'جاهزة للنسخ')}
 tone={isAutoSaving ?'accent' :'success'}
 icon={<IoCheckmarkOutline />}
 valueClassName="text-lg"
 description={lastSaved ? `آخر حفظ ${lastSaved}` :"الإنذار جاهز للمراجعة النهائية والتوقيع. الحقول المظللة بالأصفر تحتاج إلى تعبئة."}
 />
 <AnalysisStageActionButton
 label={copied ?'تم النسخ!' :'نسخ النص'}
 icon={copied ? IoCheckmarkOutline : IoCopyOutline}
 onClick={handleCopy}
 variant="secondary"
 />
 </>
 }
 >
 <AnalysisStageDocumentCard label="الإنذار الرسمي" badge="مسودة جاهزة للمراجعة">
 {isSanitizedEmpty(getHighlightedText(finalDocument?.documentText)) ? (
 <SanitizedContentEmpty />
 ) : (
 <div
 className="text-sm leading-[2.4] text-[var(--title-color)] dark:text-gray-200 text-end whitespace-pre-wrap outline-none focus:ring-2 focus:ring-[var(--main-color)]/30 rounded-lg p-4 w-full transition-shadow"
 style={{ direction:'rtl', minHeight:'300px' }}
 contentEditable
 suppressContentEditableWarning
 spellCheck={false}
 ref={editorRef}
 onInput={() => {
 if (editorRef.current) debouncedSave(editorRef.current.innerText || editorRef.current.innerHTML);
 }}
 dangerouslySetInnerHTML={{ __html: sanitizeHtml(getHighlightedText(finalDocument?.documentText)) }}
 />
 )}
 </AnalysisStageDocumentCard>
 </UnifiedStepShell>
 );
};

export default WarningStep3FinalAssembly;
