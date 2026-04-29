import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { parseJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoArrowBackOutline, IoArrowForwardOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateStep } from'../../../../../../redux/appealBrief/appealBriefSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import {
 UnifiedStepShell,
 AnalysisStageActionButton,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageListItem,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';

type TAppealStep3Props = {
 nextStep: () => void;
 prevStep: () => void;

 selectedFacts?: string[];};

const AppealStep3Grounds = ({ nextStep, prevStep , selectedFacts }: TAppealStep3Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 const groundsData = useAppSelector((s) => s.appealBrief.outputs[3]);

 const { isLoading, hasFailed, errorMessage, retry } = useAnalysisStep({
 parseResult: parseJobResult,
 caseId: caseId as string,
 stepType:'AppealBriefGrounds',
 autoSubmit: true,
 inputJson: buildAnalysisInput((caseId as string) || caseId ||"", selectedFacts || []), 
 onHydrate: (parsed) => dispatch(hydrateStep({ stepNumber: 3, result: parsed })),
 });

 return (
 <UnifiedStepShell
 isLoading={isLoading && !groundsData}
 hasFailed={hasFailed && !groundsData}
 errorMessage={errorMessage}
 onRetry={retry}
 title={groundsData ? "أوجه الطعن" : undefined}
 sidebar={groundsData ? (
 <>
 <AnalysisStageSidebarCard
 label="ملخص الأوجه"
 value={`${groundsData.grounds?.length || 0} أوجه مبدئية`}
 valueClassName="text-xl"
 description="تم استخراج وصياغة أوجه الطعن. تأكد من مراجعتها قبل استخراج الطلبات."
 />
 <div className="flex flex-col gap-2">
 <AnalysisStageActionButton
 label="الطلبات المقترحة"
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
 ) : undefined}
 >
 {groundsData && (
 <AnalysisStageSectionCard label="أوجه الطعن الجوهرية المُصاغة">
 {groundsData.grounds && groundsData.grounds.length > 0 ? (
 <ul className="flex flex-col gap-3">
 {groundsData.grounds.map((rawGround: unknown, idx: number) => {
 const ground = rawGround as { title?: string; Title?: string; description?: string; Description?: string; relevance?: string; Relevance?: string };
 const text = typeof rawGround ==='string' ? rawGround : (ground.title || ground.Title || ground.description || ground.Description || JSON.stringify(rawGround));
 const subtitle = typeof rawGround ==='object' && rawGround !== null ? (ground.description || ground.Description || ground.relevance || ground.Relevance) : null;
 return (
 <AnalysisStageListItem key={idx} index={idx + 1}>
 <span className="font-bold text-[var(--title-color)]">{text}</span>
 {subtitle && text !== subtitle && <span className="app-text-muted">: {subtitle}</span>}
 </AnalysisStageListItem>
 );
 })}
 </ul>
 ) : (
 <div className="app-text-subtle italic p-4 text-center">لا توجد أوجه طعن مستخرجة.</div>
 )}
 </AnalysisStageSectionCard>
 )}
 </UnifiedStepShell>
 );
};

export default AppealStep3Grounds;
