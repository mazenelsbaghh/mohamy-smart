import { useMemo } from 'react';
import { Chip } from'@heroui/react';
import { IoArrowBackOutline, IoRefreshOutline } from'react-icons/io5';
import {
 UnifiedStepShell,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
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

 const { isLoading, hasFailed, errorMessage, retry, charge, submit } = useAnalysisStep<TLawsuitSubjects>({
 caseId,
 stepType:'LawsuitSubjects',
 autoSubmit: !hydratedData,
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
 <UnifiedStepShell
 isLoading={isLoading && !data}
 hasFailed={hasFailed && !data}
 errorMessage={errorMessage}
 onRetry={retry}
 charge={charge}
 loadingTitle="جاري صياغة موضوع الدعوى ووقائعها..."
 loadingSubtitle="يقوم النظام بصياغة السرد الواقعي المعتمد للصحيفة باعتباره موضوع الدعوى ووقائعها في قسم واحد."
 title={data ? "موضوع الدعوى ووقائعها" : undefined}
 actions={data ? (
 caseType ? (
 <Chip color="warning" variant="flat" size="sm">
 {caseType.caseMainType}
 </Chip>
 ) : undefined
 ) : undefined}
 sidebar={data ? (
 <>
 <AnalysisStageSidebarCard
 label="وضع المرحلة"
 value="جاهز"
 description="هذا النص هو السرد المعتمد الذي سيظهر في الصحيفة كموضوع الدعوى ووقائعها."
 />

 <AnalysisStageActionButton
 label="اعتماد النص والانتقال"
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
 ) : undefined}
 >
  {data && (
  <>
 <AnalysisStageSectionCard label="عنوان القسم">
  <p className="text-sm app-text-muted leading-relaxed whitespace-pre-wrap">
  {data.subjectTitle}
  </p>
  </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="موضوع الدعوى ووقائعها">
  <p className="text-sm app-text-muted leading-relaxed whitespace-pre-wrap">
  {data.subjectFullText}
  </p>
  </AnalysisStageSectionCard>
  </>
  )}
 </UnifiedStepShell>
 );
};

export default LawsuitSubjects;
