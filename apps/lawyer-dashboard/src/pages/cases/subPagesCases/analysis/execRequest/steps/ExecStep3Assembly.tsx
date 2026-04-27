import DOMPurify from'dompurify';
import { sanitizeHtml, isSanitizedEmpty } from"@mohamy/shared-utils";
import { SanitizedContentEmpty } from'../../../../../../components/ui/SanitizedContentEmpty';
import { parseJobResult } from"@mohamy/shared-utils";
import { useState } from'react';
import { useParams } from'react-router-dom';
import { IoCheckmarkOutline, IoCopyOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateStep } from'../../../../../../redux/execRequest/execRequestSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import { AnalysisStepShell } from'../../../../../../components/analysisWorkflow/AnalysisStepShell';
import {
 AnalysisStageActionButton,
 AnalysisStageDocumentCard,
 AnalysisStageLayout,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';

type TExecStep3Props = {
 selectedFacts: string[];
};

const ExecStep3Assembly = ({ selectedFacts }: TExecStep3Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 const drafting = useAppSelector((s) => s.execRequest.outputs[2]);
 const finalAssembly = useAppSelector((s) => s.execRequest.outputs[3]);
 
 const [copied, setCopied] = useState(false);

 const { isLoading, hasFailed, errorMessage, retry } = useAnalysisStep({
 parseResult: parseJobResult,
 caseId: caseId as string,
 stepType:'ExecRequestAssembly',
 autoSubmit: Boolean(drafting), // Only run if Phase 2 is complete
 inputJson: buildAnalysisInput(caseId ||'', selectedFacts),
 onHydrate: (parsed) => dispatch(hydrateStep({ stepNumber: 3, result: parsed })),
 });

 const handleCopy = () => {
 if (!finalAssembly?.documentText) return;
 navigator.clipboard.writeText(finalAssembly.documentText);
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
 <AnalysisStepShell
 isLoading={isLoading && !finalAssembly}
 hasFailed={hasFailed && !finalAssembly}
 errorMessage={errorMessage}
 onRetry={retry}
 >
 {finalAssembly && (
 <AnalysisStageLayout
 title="المسودة النهائية للطلب التنفيذي"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="الحالة النهائية"
 value="جاهز للإيداع"
 tone="success"
 icon={<IoCheckmarkOutline />}
 valueClassName="text-lg"
 description="تم تجميع الطلب التنفيذي النهائي. الأجزاء المظللة بالأصفر بحاجة لملئها قبل الإرسال الفعلي أو النسخ."
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
 <AnalysisStageDocumentCard label="الطلب التنفيذي المتكامل" badge="مسودة جاهزة للتصدير">
 {isSanitizedEmpty(getHighlightedText(finalAssembly.documentText)) ? (
 <SanitizedContentEmpty />
 ) : (
 <div
 className="text-sm leading-[2.4] text-[var(--title-color)] dark:text-gray-200 text-end whitespace-pre-wrap"
 style={{ direction:'rtl' }}
 dangerouslySetInnerHTML={{ __html: sanitizeHtml(getHighlightedText(finalAssembly.documentText)) }}
 />
 )}
 </AnalysisStageDocumentCard>
 </AnalysisStageLayout>
 )}
 </AnalysisStepShell>
 );
};

export default ExecStep3Assembly;
