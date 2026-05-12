import DOMPurify from'dompurify';
import { sanitizeHtml, isSanitizedEmpty } from"@mohamy/shared-utils";
import { SanitizedContentEmpty } from'../../../../../../components/ui/SanitizedContentEmpty';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { parseJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { useState } from'react';
import { IoCheckmarkOutline, IoCopyOutline, IoArrowForwardOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateStep } from'../../../../../../redux/appealBrief/appealBriefSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import { UnifiedStepShell, AnalysisStageActionButton, AnalysisStageDocumentCard, AnalysisStageSidebarCard } from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { useWorkflowAutoSave } from'../../../../../../hooks/useWorkflowAutoSave';
import { appealBriefThunks } from'../../../../../../redux/appealBrief/appealBriefSlice';
import { useRef } from'react';

type TAppealStep6Props = {
 prevStep: () => void;

 selectedFacts?: string[];};

const AppealStep6Assembly = ({ prevStep , selectedFacts }: TAppealStep6Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 const [copied, setCopied] = useState(false);

 const finalAssemblyData = useAppSelector((s) => s.appealBrief.outputs[6]);
 const workflowId = useAppSelector(s => s.appealBrief.workflowId);
 const lastSavedAt = useAppSelector(s => s.appealBrief.lastSavedAt);
 const lastSaved = lastSavedAt
 ? new Date(lastSavedAt).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' })
 : null;

 const { isLoading, hasFailed, errorMessage, retry, charge } = useAnalysisStep({
 parseResult: parseJobResult,
 caseId: caseId as string,
 stepType:'AppealBriefAssembly',
 autoSubmit: true,
 inputJson: buildAnalysisInput((caseId as string) || caseId ||"", selectedFacts || []),
 onHydrate: (parsed) => dispatch(hydrateStep({ stepNumber: 6, result: parsed })),
 });

 const editorRef = useRef<HTMLDivElement>(null);

 const { isAutoSaving } = useAppSelector(s => s.appealBrief.loadingState);

 const { debouncedSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 if (!workflowId) return;
 await dispatch(appealBriefThunks.saveDraftStep({
 routeId: workflowId,
 stepNumber: 6,
 payload: { fullAppealText: payload }
 })).unwrap();
 }
 });

 const handleCopy = () => {
 if (!finalAssemblyData?.fullAppealText) return;
 navigator.clipboard.writeText(finalAssemblyData.fullAppealText);
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

 return (
 <UnifiedStepShell
 isLoading={isLoading && !finalAssemblyData}
 hasFailed={hasFailed && !finalAssemblyData}
 errorMessage={errorMessage}
 onRetry={retry}
 charge={charge}
 title={finalAssemblyData ? "المسودة النهائية لصحيفة الطعن" : undefined}
 sidebar={finalAssemblyData ? (
 <>
 <AnalysisStageSidebarCard
 label="الحالة"
 value={isAutoSaving ?'جارِ الحفظ...' : (lastSaved ?'محفوظ' :'جاهزة للنسخ')}
 tone={isAutoSaving ?'accent' :'success'}
 icon={<IoCheckmarkOutline />}
 valueClassName="text-lg"
 description={lastSaved ? `آخر حفظ ${lastSaved}` :"تم تجميع صحيفة الطعن بالكامل وتوحيد المعطيات والأسباب والطلبات بشكل جاهز لتقديم المحكمة."}
 />
 <div className="flex flex-col gap-2">
 <AnalysisStageActionButton
 label={copied ?'تم النسخ!' :'نسخ المسودة'}
 icon={copied ? IoCheckmarkOutline : IoCopyOutline}
 onClick={handleCopy}
 />
 <AnalysisStageActionButton
 label="العودة"
 icon={IoArrowForwardOutline}
 onClick={prevStep}
 variant="secondary"
 />
 </div>
 </>
 ) : undefined}
 >
 {finalAssemblyData && (
 <AnalysisStageDocumentCard label="محتوى صحيفة الطعن" badge="مسودة جاهزة للتحرير">
 {isSanitizedEmpty(getHighlightedText(finalAssemblyData.fullAppealText ||'')) ? (
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
 dangerouslySetInnerHTML={{ __html: sanitizeHtml(getHighlightedText(finalAssemblyData.fullAppealText ||'')) }}
 />
  )}
  </AnalysisStageDocumentCard>
  )}
  </UnifiedStepShell>
 );
};

export default AppealStep6Assembly;
