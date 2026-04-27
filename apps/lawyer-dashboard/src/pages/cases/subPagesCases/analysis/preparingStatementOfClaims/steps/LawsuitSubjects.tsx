import { useMemo } from 'react';
import { Chip } from'@heroui/react';
import { IoArrowBackOutline, IoRefreshOutline } from'react-icons/io5';
import { AnalysisStepShell } from'../../../../../../components/analysisWorkflow/AnalysisStepShell';
import {
 AnalysisStageLayout,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import { hydrateStatementStep } from'../../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import type { TLawsuitSubjects } from'../../../../../../redux/shared/workflowTypes';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';

type TLawsuitSubjectsProps = {
 nextStep: () => void;
 caseId: string;
 caseType?: { caseMainType: string; caseSubType: string; courtType: string } | null;
 selectedFacts?: string[];
};

const LawsuitSubjects = ({ caseId, nextStep, caseType, selectedFacts = [] }: TLawsuitSubjectsProps) => {
 const dispatch = useAppDispatch();
 const hydratedData = useAppSelector((state) => state.preparingStatementOfClaimsSlice.outputs[3]) as TLawsuitSubjects | undefined | null;

  const inputJson = useMemo(() => buildAnalysisInput(caseId, selectedFacts, {
  caseMainType: caseType?.caseMainType,
  caseSubType: caseType?.caseSubType,
  courtType: caseType?.courtType,
  }), [caseId, selectedFacts, caseType?.caseMainType, caseType?.caseSubType, caseType?.courtType]);

 const { isLoading, hasFailed, errorMessage, retry, submit } = useAnalysisStep<TLawsuitSubjects>({
 caseId,
 stepType:'LawsuitSubjects',
 autoSubmit: true,
 inputJson,
 onHydrate: (parsed) => {
 dispatch(hydrateStatementStep({ stepNumber: 3, result: parsed }));
 },
 });

 const data = hydratedData;

 const handlePrimaryAction = () => {
 if (data) {
 nextStep();
 return;
 }
 submit();
 };

 const handleRegenerate = () => {
 dispatch(hydrateStatementStep({ stepNumber: 3, result: null }));
 submit();
 };

 return (
 <AnalysisStepShell
 isLoading={isLoading && !data}
 hasFailed={hasFailed && !data}
 errorMessage={errorMessage}
 onRetry={retry}
 loadingTitle="جاري صياغة موضوع صحيفة الدعوى..."
 loadingSubtitle="يقوم النظام ببناء عنوان الدعوى ونص موضوعها بصورة قانونية منسقة ومتسقة مع بيانات القضية والأطراف."
 >
 {data && (
 <AnalysisStageLayout
 title="صياغة موضوع الصحيفة"
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
 label="وضع المرحلة"
 value="جاهز"
 description="بعد اعتماد هذا الجزء يمكن الانتقال مباشرة إلى ترتيب الوقائع."
 />

 <AnalysisStageActionButton
 label="الانتقال إلى الوقائع"
 icon={IoArrowBackOutline}
 onClick={handlePrimaryAction}
 disabled={isLoading}
 />

 <AnalysisStageActionButton
 label="إعادة الإعداد"
 icon={IoRefreshOutline}
 onClick={handleRegenerate}
 disabled={isLoading}
 variant="secondary"
 />
 </>
 }
 >
 <AnalysisStageSectionCard label="عنوان الموضوع">
 <p className="text-sm app-text-muted leading-relaxed whitespace-pre-wrap">
 {data.subjectTitle}
 </p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="تفصيل الموضوع">
 <p className="text-sm app-text-muted leading-relaxed whitespace-pre-wrap">
 {data.subjectFullText}
 </p>
 </AnalysisStageSectionCard>
 </AnalysisStageLayout>
 )}
 </AnalysisStepShell>
 );
};

export default LawsuitSubjects;
