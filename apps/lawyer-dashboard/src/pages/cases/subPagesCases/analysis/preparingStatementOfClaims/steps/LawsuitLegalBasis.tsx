import { useCallback, useMemo } from'react';
import { IoArrowBackOutline } from'react-icons/io5';
import { Chip } from'@heroui/react';
import { AnalysisStepShell } from'../../../../../../components/analysisWorkflow/AnalysisStepShell';
import {
 AnalysisStageLayout,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from'../../../../../../components/analysisWorkflow/AnalysisStageLayout';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import { hydrateStatementStep } from'../../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import type { TLawsuitLegalBasis } from'../../../../../../redux/shared/workflowTypes';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { useAppDispatch } from'../../../../../../hooks/reduxHooks';

type LawsuitLegalBasisProps = {
 nextStep: () => void;
 caseId: string;
 caseType?: { caseMainType: string; caseSubType: string; courtType: string } | null;
 selectedFacts?: string[];
};

const LawsuitLegalBasis = ({ caseId, nextStep, caseType, selectedFacts = [] }: LawsuitLegalBasisProps) => {
 const dispatch = useAppDispatch();

 const inputJson = useMemo(
 () => buildAnalysisInput(caseId, selectedFacts, {
 caseMainType: caseType?.caseMainType,
 caseSubType: caseType?.caseSubType,
 courtType: caseType?.courtType,
 }),
 [caseId, selectedFacts, caseType?.caseMainType, caseType?.caseSubType, caseType?.courtType],
 );

  const parseResult = useCallback((json: string): TLawsuitLegalBasis => {
 const raw = JSON.parse(json) as {
 CaseId?: string;
 LegalTexts?: Array<{
 Id?: string;
 LawName?: string;
 ArticleNumber?: string;
 ArticleText?: string;
 ApplicationNotes?: string;
 }>;
 CassationRulings?: Array<{
 Id?: string;
 Court?: string;
 AppealNumber?: string;
 JudicialYear?: string;
 SessionDate?: string;
 RulingText?: string;
 ApplicationNotes?: string;
 }>;
 caseId?: string;
 legalTexts?: Array<{
 id?: string;
 lawName?: string;
 articleNumber?: string;
 articleText?: string;
 applicationNotes?: string;
 }>;
 cassationRulings?: Array<{
 id?: string;
 court?: string;
 appealNumber?: string;
 judicialYear?: string;
 sessionDate?: string;
 rulingText?: string;
 applicationNotes?: string;
 }>;
 };

 return {
 caseId: raw.caseId ?? raw.CaseId ?? caseId,
 legalTexts: (raw.legalTexts ?? raw.LegalTexts ?? []).map((t: Record<string, unknown>) => ({
 id: String(t.id ?? t.Id ??''),
 lawName: String(t.lawName ?? t.LawName ??''),
 articleNumber: String(t.articleNumber ?? t.ArticleNumber ??''),
 articleText: String(t.articleText ?? t.ArticleText ??''),
 applicationNotes: String(t.applicationNotes ?? t.ApplicationNotes ??''),
 })),
 cassationRulings: (raw.cassationRulings ?? raw.CassationRulings ?? []).map((r: Record<string, unknown>) => ({
 id: String(r.id ?? r.Id ??''),
 court: String(r.court ?? r.Court ??''),
 appealNumber: String(r.appealNumber ?? r.AppealNumber ??''),
 judicialYear: String(r.judicialYear ?? r.JudicialYear ??''),
 sessionDate: String(r.sessionDate ?? r.SessionDate ??''),
 rulingText: String(r.rulingText ?? r.RulingText ??''),
 applicationNotes: String(r.applicationNotes ?? r.ApplicationNotes ??''),
 })),
 };
  }, []);

  const {
  isLoading,
 hasFailed,
 errorMessage,
 result: data,
 retry,
 } = useAnalysisStep<TLawsuitLegalBasis>({
 caseId,
 stepType:'LawsuitLegalBasis',
 autoSubmit: true,
 inputJson,
 parseResult,
 onHydrate: (parsed) => {
 dispatch(hydrateStatementStep({ stepNumber: 5, result: parsed }));
 },
 });

 const totalReferences = data
 ? data.legalTexts.length + data.cassationRulings.length
 : 0;

 return (
 <AnalysisStepShell
 isLoading={isLoading}
 hasFailed={hasFailed}
 errorMessage={errorMessage}
 onRetry={retry}
 loadingTitle="جاري تأسيس الأساس القانوني للدعوى..."
 loadingSubtitle="يقوم المحرك الذكي باستخراج النصوص القانونية وأحكام النقض ذات الصلة وربطها مباشرة بوقائع الدعوى."
 >
 <AnalysisStageLayout
 title="الأساس القانوني"
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
 label="المراجع القانونية"
 value={totalReferences}
 description="راجع اكتمال السند القانوني قبل الانتقال إلى الطلبات الختامية."
 />

 {data && (
 <AnalysisStageActionButton
 label="الانتقال إلى الطلبات"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 )}
 </>
 }
 >
 {data && (
 <>
 <AnalysisStageSectionCard label="النصوص القانونية">
 <div className="flex flex-col gap-4">
 {data.legalTexts.map((text) => (
 <div key={text.id} className="bg-white dark:bg-[#1a1d24] p-5 rounded-xl border app-border dark:app-border-strong shadow-sm flex flex-col gap-4">
 <h4 className="text-lg font-bold text-[var(--title-color)]">
 {text.lawName} — المادة {text.articleNumber}
 </h4>

 <div className="text-sm leading-relaxed p-4 app-surface-soft dark:app-surface-soft/50 rounded-lg border app-border dark:border-slate-700/50">
 <strong className="app-text-muted">
 {text.articleText}
 </strong>
 </div>

 {text.applicationNotes && (
 <div className="bg-orange-50/50 dark:bg-orange-500/10 p-4 rounded-lg border border-orange-100/50 dark:border-orange-500/20">
 <span className="text-xs font-bold text-orange-800 dark:text-orange-400 block mb-2">وجه الاستدلال / ملاحظات التطبيق:</span>
 <strong className="text-sm leading-relaxed app-text-muted font-medium">
 {text.applicationNotes}
 </strong>
 </div>
 )}
 </div>
 ))}
 </div>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="أحكام النقض">
 <div className="flex flex-col gap-4">
 {data.cassationRulings.map((ruling) => (
 <div key={ruling.id} className="bg-white dark:bg-[#1a1d24] p-5 rounded-xl border app-border dark:app-border-strong shadow-sm flex flex-col gap-4">
 <h5 className="text-base font-bold text-[var(--title-color)]">
 {ruling.court} — الطعن رقم {ruling.appealNumber} / السنة القضائية {ruling.judicialYear}
 </h5>

 <div className="flex flex-col gap-2">
 <span className="text-xs font-bold app-text-subtle dark:app-text-subtle">تاريخ الجلسة: <span className="app-text-muted ms-1">{ruling.sessionDate}</span></span>
 </div>

 <div className="text-sm leading-relaxed p-4 app-surface-soft dark:app-surface-soft/50 rounded-lg border app-border dark:border-slate-700/50">
 <p className="app-text-muted">
 {ruling.rulingText}
 </p>
 </div>

 {ruling.applicationNotes && (
 <div className="bg-orange-50/50 dark:bg-orange-500/10 p-4 rounded-lg border border-orange-100/50 dark:border-orange-500/20">
 <span className="text-xs font-bold text-orange-800 dark:text-orange-400 block mb-2">وجه الاستدلال / ملاحظات التطبيق:</span>
 <p className="text-sm leading-relaxed app-text-muted font-medium">
 {ruling.applicationNotes}
 </p>
 </div>
 )}
 </div>
 ))}
 </div>
 </AnalysisStageSectionCard>
 </>
 )}
 </AnalysisStageLayout>
 </AnalysisStepShell>
 );
};

export default LawsuitLegalBasis;
