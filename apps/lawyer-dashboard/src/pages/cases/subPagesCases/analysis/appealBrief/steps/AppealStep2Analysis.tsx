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

type TAppealStep2Props = {
 nextStep: () => void;
 prevStep: () => void;

 selectedFacts?: string[];};

const AppealStep2Analysis = ({ nextStep, prevStep , selectedFacts }: TAppealStep2Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 const analysisData = useAppSelector((s) => s.appealBrief.outputs[2]);

 const { isLoading, hasFailed, errorMessage, retry, charge } = useAnalysisStep({
 parseResult: parseJobResult,
 caseId: caseId as string,
 stepType:'AppealBriefReasoningAnalysis',
 autoSubmit: true,
 inputJson: buildAnalysisInput((caseId as string) || caseId ||"", selectedFacts || []), 
 onHydrate: (parsed) => dispatch(hydrateStep({ stepNumber: 2, result: parsed })),
 });

 return (
 <UnifiedStepShell
 isLoading={isLoading && !analysisData}
 hasFailed={hasFailed && !analysisData}
 errorMessage={errorMessage}
 onRetry={retry}
 charge={charge}
 title={analysisData ? "تحليل الأسباب والعيوب" : undefined}
 sidebar={analysisData ? (
 <>
 <AnalysisStageSidebarCard
 label="حالة التحليل"
 value={((analysisData?.potentialGroundsList as unknown[] | undefined)?.length || analysisData.legalFlaws?.length) ?"اكتمل تحديد العيوب" :"قيد المعالجة"}
 valueClassName="text-xl"
 description="الجهاز قام بتحليل حيثيات الحكم وتم استخراج العيوب القانونية بنجاح."
 />
 <div className="flex flex-col gap-2">
 <AnalysisStageActionButton
 label="أوجه الطعن"
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
 {analysisData && (
 <>
 <AnalysisStageSectionCard label="التحليل الشامل للحيثيات">
 <p className="text-sm leading-relaxed app-text-muted">
 {analysisData.analysis || (analysisData.reasoningAnalysis as string | undefined) || (analysisData.Analysis as string | undefined) ||'جاري المعالجة...'}
 </p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="العيوب القانونية المكتشفة">
 {((analysisData?.potentialGroundsList as unknown[] | undefined)?.length || (analysisData.legalFlaws && analysisData.legalFlaws.length > 0)) ? (
 <div className="flex flex-col gap-3 mt-3">
 {((analysisData.potentialGroundsList as unknown[] | undefined) || analysisData.legalFlaws || []).map((flaw: unknown, idx: number) => {
 const f = flaw as Record<string, unknown>;
 const text = typeof flaw ==='string' ? flaw : String(f.title || f.Title || f.flaw || f.Flaw || f.text || f.Text || JSON.stringify(flaw));
 const details = typeof flaw ==='object' && flaw !== null ? String(f.description || f.Description || f.details || f.Details ||'') || null : null;
 return (
 <AnalysisStageListItem key={idx} index={idx + 1}>
 <span className="font-bold text-[var(--title-color)]">{text}</span>
 {details && text !== details && <span className="app-text-muted">: {details}</span>}
 </AnalysisStageListItem>
 );
 })}
 </div>
 ) : (
 <div className="app-text-subtle italic p-4 text-center">لا توجد عيوب قانونية مسجلة.</div>
 )}
 </AnalysisStageSectionCard>
 </>
 )}
 </UnifiedStepShell>
 );
};

export default AppealStep2Analysis;
