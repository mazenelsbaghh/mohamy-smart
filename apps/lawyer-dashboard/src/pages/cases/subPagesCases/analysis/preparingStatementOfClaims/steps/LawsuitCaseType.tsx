import { useState, useMemo } from'react';
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
import type { TCaseDetails } from'../../../../../../redux/shared/workflowTypes';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';

type TLawsuitCaseType = {
 nextStep: () => void;
 caseId: string;
 selectedFacts?: string[];
};

const LawsuitCaseType = ({ caseId, nextStep, selectedFacts }: TLawsuitCaseType) => {
 const dispatch = useAppDispatch();
 const hydratedData = useAppSelector((state) => state.preparingStatementOfClaimsSlice.outputs[1]) as TCaseDetails | undefined | null;

  const inputJson = useMemo(() => selectedFacts && selectedFacts.length > 0
  ? JSON.stringify({ caseId, facts: selectedFacts.join('\n\n') })
  : JSON.stringify({ caseId }), [caseId, selectedFacts]);

 const { isLoading, hasFailed, errorMessage, retry, submit } = useAnalysisStep<TCaseDetails>({
 caseId,
 stepType:'LawsuitCaseType',
 autoSubmit: true,
 inputJson,
 onHydrate: (parsed) => {
 dispatch(hydrateStatementStep({ stepNumber: 1, result: parsed }));
 },
 });

 const [summaryOpen, setSummaryOpen] = useState(false);

 const data = hydratedData;

 const handlePrimaryAction = () => {
 if (data) {
 nextStep();
 return;
 }
 submit();
 };

 const handleRegenerate = () => {
 dispatch(hydrateStatementStep({ stepNumber: 1, result: null }));
 submit();
 };

 return (
 <AnalysisStepShell
 isLoading={isLoading && !data}
 hasFailed={hasFailed && !data}
 errorMessage={errorMessage}
 onRetry={retry}
 loadingTitle="جاري تحديد نوع الدعوى والاختصاص..."
 loadingSubtitle="يقوم النظام بتحليل وقائع القضية وتكييفها قانونيًا لتحديد نوع الدعوى، المحكمة المختصة، والطبيعة الإجرائية المناسبة."
 >
 {data && (
 <AnalysisStageLayout
 title="تصنيف القضية وتحديد نطاقها القضائي"
 actions={
 <Chip color="warning" variant="flat">
 {data.caseMainType ||'تصنيف'}
 </Chip>
 }
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label="التصنيف الحالي"
 value={data.caseMainType}
 description="التكييف الحالي سيُستخدم كأساس لبقية عناصر الصحيفة بدءًا من الأطراف وحتى الطلبات الختامية."
 />

 <AnalysisStageActionButton
 label="الانتقال إلى الأطراف"
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
 <AnalysisStageSectionCard label="بيانات التصنيف الأساسية">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div className="flex flex-col gap-1">
 <span className="text-xs app-text-subtle dark:app-text-subtle font-bold">نوع القضية الرئيسي</span>
 <strong className="text-sm text-[var(--title-color)] dark:text-gray-200">{data.caseMainType}</strong>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-xs app-text-subtle dark:app-text-subtle font-bold">النوع الفرعي</span>
 <strong className="text-sm text-[var(--title-color)] dark:text-gray-200">{data.caseSubType}</strong>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-xs app-text-subtle dark:app-text-subtle font-bold">المحكمة المختصة</span>
 <strong className="text-sm text-[var(--title-color)] dark:text-gray-200">{data.courtType}</strong>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-xs app-text-subtle dark:app-text-subtle font-bold">الطبيعة الإجرائية</span>
 <strong className="text-sm text-[var(--title-color)] dark:text-gray-200">{data.proceduralNature}</strong>
 </div>
 <div className="flex flex-col gap-1 sm:col-span-2">
 <span className="text-xs app-text-subtle dark:app-text-subtle font-bold">مستعجلة؟</span>
 <strong className="text-sm text-[var(--title-color)] dark:text-gray-200">{data.isUrgentOrSummary}</strong>
 </div>
 </div>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="ملخص التبرير">
 <div className="flex items-center justify-between gap-3">
 <span className="text-xs app-text-subtle dark:app-text-subtle font-bold">ملخص التبرير</span>
 <button
 type="button"
 onClick={() => setSummaryOpen(!summaryOpen)}
 className="text-sm font-bold text-[var(--main-color)]"
 >
 {summaryOpen ?'إخفاء الملخص' :'عرض الملخص'}
 </button>
 </div>
 {summaryOpen && (
 <p className="text-sm app-text-muted leading-relaxed mt-3">
 {data.justificationSummary}
 </p>
 )}
 </AnalysisStageSectionCard>
 </AnalysisStageLayout>
 )}
 </AnalysisStepShell>
 );
};

export default LawsuitCaseType;
