import { useMemo } from'react';
import { IoArrowBackOutline } from'react-icons/io5';
import { Chip } from'@heroui/react';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import { AnalysisStepShell } from'../../../../../../components/analysisWorkflow/AnalysisStepShell';
import {
 AnalysisStageLayout,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';
import { hydrateStatementStep } from'../../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';

type TLawsuitFacts = {
 nextStep: () => void;
 caseId: string;
 caseType?: { caseMainType: string; caseSubType: string; courtType: string } | null;
 selectedFacts?: string[];
};

const LawsuitFacts = ({ caseId, nextStep, caseType, selectedFacts = [] }: TLawsuitFacts) => {
 const dispatch = useAppDispatch();
 const lawsuitFact = useAppSelector(
 (state) => state.preparingStatementOfClaimsSlice.outputs[4],
 ) as { factsNarrative: string } | undefined | null;

 const inputJson = useMemo(
 () =>
 buildAnalysisInput(caseId, selectedFacts, {
 caseMainType: caseType?.caseMainType,
 caseSubType: caseType?.caseSubType,
 courtType: caseType?.courtType,
 }),
 [caseId, selectedFacts, caseType?.caseMainType, caseType?.caseSubType, caseType?.courtType],
 );

 const { isLoading, hasFailed, errorMessage, submit, retry } = useAnalysisStep({
 caseId,
 stepType:'LawsuitFacts',
 autoSubmit: true,
 inputJson,
 onHydrate: (parsed) =>
 dispatch(hydrateStatementStep({ stepNumber: 4, result: parsed })),
 });

 const handlePrimaryAction = () => {
 if (lawsuitFact) {
 nextStep();
 return;
 }
 submit();
 };

 return (
 <AnalysisStepShell
 isLoading={isLoading && !lawsuitFact}
 hasFailed={hasFailed && !lawsuitFact}
 errorMessage={errorMessage}
 onRetry={retry}
 loadingTitle="جاري إعداد الوقائع بصياغة قانونية..."
 loadingSubtitle="يعيد النظام ترتيب التسلسل الواقعي وصياغته في صورة وقائع مترابطة تصلح للإدراج المباشر داخل صحيفة الدعوى."
 >
 <AnalysisStageLayout
 title="سرد الوقائع بصياغة مرتبة"
 actions={
 caseType ? (
 <Chip color="warning" variant="flat" size="sm">
 {caseType.caseMainType}
 </Chip>
 ) : undefined
 }
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="حالة السرد"
 value="مكتمل"
 description="تستطيع الآن الانتقال إلى الأساس القانوني وربط الوقائع بالنصوص والأحكام."
 tone="success"
 />
 <AnalysisStageActionButton
 label={lawsuitFact ?'الانتقال إلى الأساس القانوني' :'إعداد الوقائع'}
 icon={IoArrowBackOutline}
 onClick={handlePrimaryAction}
 disabled={isLoading && !lawsuitFact}
 />
 </>
 }
 >
 <AnalysisStageSectionCard label="تفاصيل الواقعة">
 <p className="text-sm leading-relaxed app-text-muted whitespace-pre-wrap">
 {lawsuitFact?.factsNarrative}
 </p>
 </AnalysisStageSectionCard>
 </AnalysisStageLayout>
 </AnalysisStepShell>
 );
};

export default LawsuitFacts;
