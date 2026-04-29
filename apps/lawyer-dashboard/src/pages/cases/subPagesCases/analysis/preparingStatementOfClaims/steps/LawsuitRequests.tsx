import { useCallback, useMemo } from"react";
import { Chip } from"@heroui/react";
import {
 UnifiedStepShell,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from"../../../../../../components/analysisWorkflow/UnifiedStepShell";
import { useAnalysisStep } from"../../../../../../hooks/useAnalysisStep";
import { hydrateStatementStep } from"../../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice";
import type { TLawsuitRequests } from"../../../../../../redux/shared/workflowTypes";
import { buildAnalysisInput } from"../../../../../../components/analysisWorkflow/analysisFacts";
import { IoArrowBackOutline } from"react-icons/io5";
import { useAppDispatch } from"../../../../../../hooks/reduxHooks";

type LawsuitRequestsProps = {
 nextStep: () => void;
 caseId: string;
 caseType?: { caseMainType: string; caseSubType: string; courtType: string } | null;
 selectedFacts?: string[];
};

const LawsuitRequests = ({ caseId, nextStep, caseType, selectedFacts = [] }: LawsuitRequestsProps) => {
 const dispatch = useAppDispatch();

 const inputJson = useMemo(
 () =>
 buildAnalysisInput(caseId, selectedFacts, {
 caseMainType: caseType?.caseMainType ??'',
 caseSubType: caseType?.caseSubType ??'',
 courtType: caseType?.courtType ??'',
 }),
 [caseId, selectedFacts, caseType?.caseMainType, caseType?.caseSubType, caseType?.courtType],
 );

 const onHydrate = useCallback(
 (parsed: TLawsuitRequests) => {
 dispatch(hydrateStatementStep({ stepNumber: 6, result: parsed }));
 },
 [dispatch],
 );

 const {
 isLoading,
 hasFailed,
 errorMessage,
 result: lawsuitRequests,
 submit,
 retry,
 } = useAnalysisStep<TLawsuitRequests>({
 caseId,
 stepType:'LawsuitRequests',
 autoSubmit: true,
 inputJson,
 onHydrate,
 });

 const normalizedRequests = lawsuitRequests
 ? {
 ...lawsuitRequests,
 principalRequests: lawsuitRequests.principalRequests ?? [],
 subsidiaryRequests: lawsuitRequests.subsidiaryRequests ?? [],
 proceduralRequests: lawsuitRequests.proceduralRequests ?? [],
 }
 : null;

 const requestGroups = normalizedRequests
 ? [
 { title:'الطلبات الأصلية', items: normalizedRequests.principalRequests },
 { title:'الطلبات الاحتياطية', items: normalizedRequests.subsidiaryRequests },
 { title:'الطلبات الإجرائية', items: normalizedRequests.proceduralRequests },
 ].filter((g) => g.items.length > 0)
 : [];

 return (
 <UnifiedStepShell
 isLoading={isLoading}
 hasFailed={hasFailed}
 errorMessage={errorMessage}
 onRetry={retry}
 loadingTitle="جاري تنسيق الطلبات الختامية..."
 loadingSubtitle="يقوم النظام الاستدلالي ببناء الطلبات الأصلية والاحتياطية والإجرائية اعتمادًا على الوقائع والأساس القانوني المعتمد."
 title="تنسيق الطلبات الختامية للدعوى"
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
 label="إجمالي الطلبات"
 value={
 normalizedRequests
 ? normalizedRequests.principalRequests.length +
 normalizedRequests.subsidiaryRequests.length +
 normalizedRequests.proceduralRequests.length
 : 0
 }
 description="راجع ترتيب الطلبات وصياغتها قبل الانتقال إلى مرحلة الصحيفة النهائية."
 />

 <AnalysisStageActionButton
 label={
 normalizedRequests
 ?'الانتقال إلى الصحيفة'
 : isLoading
 ?'جاري إعداد المرحلة...'
 :'إعداد الطلبات'
 }
 icon={IoArrowBackOutline}
 onClick={() => (normalizedRequests ? nextStep() : submit())}
 disabled={isLoading}
 />
 </>
 }
 >
 {requestGroups.map((group) => (
 <AnalysisStageSectionCard key={group.title} label={group.title}>
 <div className="flex flex-col gap-4">
 {group.items.map((item) => (
 <div
 key={item.id}
 className="flex gap-3 rounded-[18px] border app-border dark:app-border-strong bg-[rgba(251,250,232,0.45)] dark:bg-[rgba(251,250,232,0.04)] px-4 py-3"
 >
 <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
 {item.requestNumber}
 </span>
 <div className="flex flex-col gap-1 text-sm leading-relaxed">
 <strong className="text-[var(--title-color)]">
 {item.requestText}
 </strong>
 {item.legalReference && (
 <p className="text-xs app-text-muted dark:app-text-subtle">
 {item.legalReference}
 </p>
 )}
 </div>
 </div>
 ))}
 </div>
 </AnalysisStageSectionCard>
 ))}
 </UnifiedStepShell>
 );
};

export default LawsuitRequests;
