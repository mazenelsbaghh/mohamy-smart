import { useMemo } from'react';
import { Chip } from'@heroui/react';
import { IoArrowBackOutline, IoPeople } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import {
 UnifiedStepShell,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { hydrateStatementStep } from'../../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import type { TLawsuitParties } from'../../../../../../redux/shared/workflowTypes';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';

type TLawsuitPartiesProps = {
 nextStep: () => void;
 caseId: string;
 caseType?: { caseMainType: string; caseSubType: string; courtType: string } | null;
 selectedFacts?: string[];
};

const LawsuitParties = ({ caseId, nextStep, caseType, selectedFacts = [] }: TLawsuitPartiesProps) => {
 const dispatch = useAppDispatch();
 const lawsuitParties = useAppSelector((state) => state.preparingStatementOfClaimsSlice.outputs[2]) as TLawsuitParties | undefined | null;

 const inputJson = useMemo(
 () => buildAnalysisInput(caseId, selectedFacts, {
 caseMainType: caseType?.caseMainType,
 caseSubType: caseType?.caseSubType,
 courtType: caseType?.courtType,
 }),
 [caseId, selectedFacts, caseType?.caseMainType, caseType?.caseSubType, caseType?.courtType],
 );

 const { isLoading, hasFailed, errorMessage, submit, retry } = useAnalysisStep<TLawsuitParties>({
 caseId,
 stepType:'LawsuitParties',
 autoSubmit: true,
 inputJson,
 onHydrate: (parsed) => {
 dispatch(hydrateStatementStep({ stepNumber: 2, result: parsed }));
 },
 });

 const handleAction = () => {
 if (lawsuitParties) {
 nextStep();
 return;
 }
 submit();
 };

 return (
 <UnifiedStepShell
 isLoading={isLoading && !lawsuitParties}
 hasFailed={hasFailed && !lawsuitParties}
 errorMessage={errorMessage}
 onRetry={retry}
 loadingTitle="جاري إعداد أطراف الدعوى..."
 loadingSubtitle="يقوم المحرك الذكي بتجميع الخصوم، تدقيق صفاتهم القانونية، وربط بياناتهم الأساسية بصياغة الصحيفة."
 title={lawsuitParties ? "مراجعة الخصوم وصفاتهم القانونية" : undefined}
 actions={lawsuitParties ? (
 <div className="flex items-center gap-3 flex-wrap">
 {caseType && <Chip color="warning" variant="flat" size="sm">{caseType.caseMainType}</Chip>}
 </div>
 ) : undefined}
 sidebar={lawsuitParties ? (
 <>
 <AnalysisStageSidebarCard
 label="عدد الأطراف"
 value={<span className="text-5xl">{lawsuitParties.parties.length}</span>}
 description="راجع دور كل طرف وصفته قبل الانتقال إلى صياغة موضوع الدعوى."
 tone="accent"
 icon={<IoPeople />}
 />
 <AnalysisStageActionButton
 label="الانتقال إلى الموضوع"
 icon={IoArrowBackOutline}
 onClick={handleAction}
 disabled={isLoading}
 />
 </>
 ) : undefined}
 >
 {lawsuitParties && lawsuitParties.parties.map((party) => (
 <AnalysisStageSectionCard key={party.id} label={party.role}>
 <div className="flex flex-col gap-4">
 <div className="flex items-start justify-between">
 <div>
 <h4 className="text-lg font-bold text-[var(--title-color)] mb-1">{party.name}</h4>
 <p className="text-sm app-text-subtle">{party.type}</p>
 </div>
 <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800/50">
 {party.role}
 </span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
 <div className="flex flex-col gap-1">
 <span className="text-xs app-text-subtle font-bold">الصفة القانونية</span>
 <strong className="text-sm text-[var(--title-color)]">{party.legalCapacity}</strong>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-xs app-text-subtle font-bold">الرقم القومي</span>
 <strong className="text-sm text-[var(--title-color)]">{party.nationalId}</strong>
 </div>
 <div className="flex flex-col gap-1 md:col-span-2">
 <span className="text-xs app-text-subtle font-bold">العنوان</span>
 <strong className="text-sm text-[var(--title-color)]">{party.address}</strong>
 </div>
 </div>
 </div>
 </AnalysisStageSectionCard>
 ))}
 </UnifiedStepShell>
 );
};

export default LawsuitParties;
