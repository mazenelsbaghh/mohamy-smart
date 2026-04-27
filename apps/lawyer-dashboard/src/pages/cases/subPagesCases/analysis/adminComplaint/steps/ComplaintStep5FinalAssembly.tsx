import DOMPurify from'dompurify';
import { sanitizeHtml, isSanitizedEmpty } from"@mohamy/shared-utils";
import { SanitizedContentEmpty } from'../../../../../../components/ui/SanitizedContentEmpty';
import {  parseWorkflowJobResult  } from"@mohamy/shared-utils";
import { useEffect, useState } from'react';
import { useParams } from'react-router-dom';
import { IoCheckmarkOutline, IoCopyOutline, IoRefreshOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import SmartAnalysisLoader from'../../../../../../components/skeleton/SmartAnalysisLoader';
import thunkSubmitAiJob from'../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { hydrateStep } from'../../../../../../redux/adminComplaint/adminComplaintSlice';
import {
 AnalysisStageActionButton,
 AnalysisStageDocumentCard,
 AnalysisStageLayout,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { useWorkflowAutoSave } from'../../../../../../hooks/useWorkflowAutoSave';
import { adminComplaintThunks } from'../../../../../../redux/adminComplaint/adminComplaintSlice';
import { useRef } from'react';
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
 ? new Date(lastSavedAt).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' })
 : null;

 const { isAutoSaving } = useAppSelector(s => s.adminComplaint.loadingState);

 const { debouncedSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 if (!workflowId) return;
 await dispatch(adminComplaintThunks.saveDraftStep({
 routeId: workflowId,
 stepNumber: 5,
 payload: { documentText: payload }
 })).unwrap();
 }
 });

 const isProcessingJob = job?.status ==='Queued' || job?.status ==='Processing';
 const isWaitingForHydration = job?.status ==='Completed' && !finalDocument;
 const showLoader = isProcessingJob || isWaitingForHydration || (!job && !finalDocument);

 useEffect(() => {
 if (job?.status ==='Completed' && job.resultJson && !finalDocument) {
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
 stepType:'AdminComplaintAssembly',
 inputJson: buildAnalysisInput(caseId, selectedFacts),
 }));
 }, [finalDocument, job, caseId, requestsDraft, dispatch, selectedFacts]);

 const handleRetry = () => {
 if (!caseId || !requestsDraft) return;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'AdminComplaintAssembly',
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
 /\{\{([^}]+)\}\}/g,'<mark class="bg-[var(--accent-soft)] px-1 rounded text-yellow-800 font-medium">{{$1}}</mark>'
 );
 return DOMPurify.sanitize(highlighted, {
 ALLOWED_TAGS: ['mark','br','p','span','div','b','i','em','strong','ul','ol','li'],
 ALLOWED_ATTR: ['class','style']
 });
 };

 if (showLoader && job?.status !=='Failed') {
 return (
 <SmartAnalysisLoader
 title="جاري تجميع مسودة الشكوى الذكية..."
 subtitle="يقوم النظام بكتابة وتنسيق المذكرة النهائية وتضمين الوقائع والمخالفات والطلبات."
 steps={ADMIN_COMPLAINT_STEPS}
 activeStepIndex={4}
 />
 );
 }

 if (job?.status ==='Failed') {
 return (
 <div className="w-full mt-4">
 <div className="flex items-center gap-3 p-4 mb-4 bg-[var(--danger-soft)] border border-[var(--danger-soft)] rounded-xl">
 <span className="text-sm font-bold text-[var(--danger-color)]">
 {job.errorMessage ||'تعذّر إعداد المسودة النهائية. أعد المحاولة.'}
 </span>
 <button type="button" onClick={handleRetry} className="me-auto flex items-center gap-2 bg-[var(--danger-soft)] text-[var(--danger-color)] px-4 py-1.5 rounded-full text-sm font-bold hover:bg-red-200 transition-colors">
 <IoRefreshOutline />إعادة المحاولة
 </button>
 </div>
 </div>
 );
 }

 if (!finalDocument) return null;

 return (
 <AnalysisStageLayout
 title="المسودة النهائية للشكوى"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="الحالة"
 value={isAutoSaving ?'جارِ الحفظ...' : (lastSaved ?'محفوظ' :'جاهزة للنسخ')}
 tone={isAutoSaving ?'accent' :'success'}
 icon={<IoCheckmarkOutline />}
 valueClassName="text-lg"
 description={lastSaved ? `آخر حفظ ${lastSaved}` :"تم تجميع الشكوى النهائية. الأجزاء المظللة بحاجة للمراجعة أو إدخال البيانات المخصصة."}
 />
 <AnalysisStageActionButton
 label={copied ?'تم النسخ!' :'نسخ المسودة'}
 icon={copied ? IoCheckmarkOutline : IoCopyOutline}
 onClick={handleCopy}
 variant="secondary"
 />
 </>
 }
 >
 <AnalysisStageDocumentCard label="محتوى الشكوى" badge="مسودة جاهزة للتحرير">
 {isSanitizedEmpty(getHighlightedText(finalDocument.documentText)) ? (
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
 dangerouslySetInnerHTML={{ __html: sanitizeHtml(getHighlightedText(finalDocument.documentText)) }}
 />
 )}
 </AnalysisStageDocumentCard>
 </AnalysisStageLayout>
 );
};

export default ComplaintStep5FinalAssembly;
