import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { parseJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoArrowBackOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateStep } from'../../../../../../redux/appealBrief/appealBriefSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import { AnalysisStepShell } from'../../../../../../components/analysisWorkflow/AnalysisStepShell';
import {
 AnalysisStageActionButton,
 AnalysisStageLayout,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';

type TAppealStep1Props = {
 nextStep: () => void;

 selectedFacts?: string[];
};

const AppealStep1JudgmentData = ({ nextStep, selectedFacts }: TAppealStep1Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();

 const judgmentData = useAppSelector((s) => s.appealBrief.outputs[1]);

 const { isLoading, hasFailed, errorMessage, retry } = useAnalysisStep({
 parseResult: parseJobResult,
 caseId: caseId as string,
 stepType:'AppealBriefJudgmentData',
 autoSubmit: true,
 inputJson: buildAnalysisInput((caseId as string) || caseId ||"", selectedFacts || []), // Or buildAnalysisInput if facts are required
 onHydrate: (parsed) => dispatch(hydrateStep({ stepNumber: 1, result: parsed })),
 });

 return (
 <AnalysisStepShell
 isLoading={isLoading && !judgmentData}
 hasFailed={hasFailed && !judgmentData}
 errorMessage={errorMessage}
 onRetry={retry}
 >
 {judgmentData && (
 <AnalysisStageLayout
 title="بيانات الحكم المطعون فيه"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="منطوق الحكم"
 value={judgmentData?.judgmentData?.pronouncementExact || judgmentData?.verdict || (judgmentData?.Verdict as string | undefined) ||"غير متوفر"}
 valueClassName="text-xl"
 description="تم استخراج بيانات الحكم الأساسية بنجاح. أصبحت معطيات الحكم جاهزة للتحليل والمراجعة."
 />
 <AnalysisStageActionButton
 label="تحليل الأسباب"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 </>
 }
 >
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <AnalysisStageSectionCard label="معلومات المحكمة">
 <p className="text-sm leading-relaxed app-text-muted">
 {judgmentData?.judgmentData?.courtName ? `${judgmentData.judgmentData.courtName} - قضية رقم ${judgmentData.judgmentData.caseNumber ||''}` : (judgmentData.courtInformation || (judgmentData.CourtInformation as string | undefined) ||'جاري المعالجة...')}
 </p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="أطراف الخصومة">
 <p className="text-sm leading-relaxed app-text-muted">
 {judgmentData?.judgmentData?.parties || judgmentData.parties || (judgmentData.Parties as string | undefined) ||'جاري المعالجة...'}
 </p>
 </AnalysisStageSectionCard>
 </div>
 </AnalysisStageLayout>
 )}
 </AnalysisStepShell>
 );
};

export default AppealStep1JudgmentData;
