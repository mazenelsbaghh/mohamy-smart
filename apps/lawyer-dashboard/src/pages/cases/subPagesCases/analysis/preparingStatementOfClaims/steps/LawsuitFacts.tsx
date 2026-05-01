import { useEffect, useMemo } from'react';
import { IoArrowBackOutline } from'react-icons/io5';
import { Chip } from'@heroui/react';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import {
 UnifiedStepShell,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { hydrateStatementStep } from'../../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import type { TLawsuitSubjects } from'../../../../../../redux/shared/workflowTypes';

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
 const lawsuitSubjects = useAppSelector(
 (state) => state.preparingStatementOfClaimsSlice.outputs[3],
 ) as TLawsuitSubjects | undefined | null;

 const mergedFactsNarrative = lawsuitSubjects?.subjectFullText?.trim() || '';

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
 autoSubmit: !mergedFactsNarrative,
 inputJson,
 onHydrate: (parsed) =>
 dispatch(hydrateStatementStep({ stepNumber: 4, result: parsed })),
 });

 useEffect(() => {
 if (!lawsuitFact && mergedFactsNarrative) {
 dispatch(hydrateStatementStep({
 stepNumber: 4,
 result: { factsNarrative: mergedFactsNarrative },
 }));
 }
 }, [dispatch, lawsuitFact, mergedFactsNarrative]);

 const handlePrimaryAction = () => {
 if (lawsuitFact || mergedFactsNarrative) {
 nextStep();
 return;
 }
 submit();
 };

 return (
 <UnifiedStepShell
 isLoading={isLoading && !lawsuitFact && !mergedFactsNarrative}
 hasFailed={hasFailed && !lawsuitFact && !mergedFactsNarrative}
 errorMessage={errorMessage}
 onRetry={retry}
 loadingTitle="جاري إعداد الوقائع بصياغة قانونية..."
 loadingSubtitle="يعيد النظام ترتيب التسلسل الواقعي وصياغته في صورة وقائع مترابطة تصلح للإدراج المباشر داخل صحيفة الدعوى."
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
 label={(lawsuitFact || mergedFactsNarrative) ?'الانتقال إلى الأساس القانوني' :'إعداد الوقائع'}
 icon={IoArrowBackOutline}
 onClick={handlePrimaryAction}
 disabled={isLoading && !lawsuitFact && !mergedFactsNarrative}
 />
 </>
 }
 >
 <AnalysisStageSectionCard label="تفاصيل الواقعة">
 <p className="text-sm leading-relaxed app-text-muted whitespace-pre-wrap">
 {lawsuitFact?.factsNarrative || mergedFactsNarrative}
 </p>
 </AnalysisStageSectionCard>
 </UnifiedStepShell>
 );
};

export default LawsuitFacts;
