import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { parseJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoArrowBackOutline, IoArrowForwardOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateStep } from'../../../../../../redux/appealBrief/appealBriefSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import { AnalysisStepShell } from'../../../../../../components/analysisWorkflow/AnalysisStepShell';
import {
 AnalysisStageActionButton,
 AnalysisStageLayout,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageListItem,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';

type TAppealStep4Props = {
 nextStep: () => void;
 prevStep: () => void;

 selectedFacts?: string[];};

const AppealStep4Requests = ({ nextStep, prevStep , selectedFacts }: TAppealStep4Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 const requestsData = useAppSelector((s) => s.appealBrief.outputs[4]);

 const { isLoading, hasFailed, errorMessage, retry } = useAnalysisStep({
 parseResult: parseJobResult,
 caseId: caseId as string,
 stepType:'AppealBriefRequests',
 autoSubmit: true,
 inputJson: buildAnalysisInput((caseId as string) || caseId ||"", selectedFacts || []), 
 onHydrate: (parsed) => dispatch(hydrateStep({ stepNumber: 4, result: parsed })),
 });

 return (
 <AnalysisStepShell
 isLoading={isLoading && !requestsData}
 hasFailed={hasFailed && !requestsData}
 errorMessage={errorMessage}
 onRetry={retry}
 >
 {requestsData && (
 <AnalysisStageLayout
 title="الطلبات"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="إجمالي الطلبات"
 value={`${requestsData.requests?.length || 0} طلبات ختامية`}
 valueClassName="text-xl"
 description="تم استخراج الطلبات الختامية بناءً على أوجه الطعن. يمكنك الآن تحديد السند القانوني."
 />
 <div className="flex flex-col gap-2">
 <AnalysisStageActionButton
 label="السند القانوني"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 <AnalysisStageActionButton
 label="العودة"
 icon={IoArrowForwardOutline}
 onClick={prevStep}
 variant="secondary"
 />
 </div>
 </>
 }
 >
 <AnalysisStageSectionCard label="الطلبات المقترحة في صحيفة الطعن">
 {requestsData.proceduralRequests || requestsData.substantiveRequests || requestsData.urgentRequests ? (
 <ul className="flex flex-col gap-3">
 {[...(requestsData.proceduralRequests || []), ...(requestsData.substantiveRequests || []), ...(requestsData.urgentRequests || [])].map((rawReq: unknown, idx: number) => {
 const req = rawReq as { title?: string; Title?: string; request?: string; Request?: string; text?: string; Text?: string; description?: string; Description?: string; details?: string; Details?: string };
 const text = typeof rawReq ==='string' ? rawReq : (req.title || req.Title || req.request || req.Request || req.text || req.Text || JSON.stringify(rawReq));
 const details = typeof rawReq ==='object' && rawReq !== null ? (req.description || req.Description || req.details || req.Details) : null;
 return (
 <AnalysisStageListItem key={idx} index={idx + 1}>
 <span className="font-bold text-[var(--title-color)]">{text}</span>
 {details && text !== details && <span className="app-text-muted">: {details}</span>}
 </AnalysisStageListItem>
 );
 })}
 </ul>
 ) : (
 <div className="app-text-subtle italic p-4 text-center">لا توجد طلبات مسجلة أو جاري المعالجة.</div>
 )}
 </AnalysisStageSectionCard>
 </AnalysisStageLayout>
 )}
 </AnalysisStepShell>
 );
};

export default AppealStep4Requests;
