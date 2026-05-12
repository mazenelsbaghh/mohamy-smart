import { useCallback, useMemo } from'react';
import { IoArrowBackOutline } from'react-icons/io5';
import { Chip } from'@heroui/react';
import {
 UnifiedStepShell,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import { hydrateStatementStep } from'../../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import type { TLawsuitLegalBasis } from'../../../../../../redux/shared/workflowTypes';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';

type LawsuitLegalBasisProps = {
 nextStep: () => void;
 caseId: string;
 caseType?: { caseMainType: string; caseSubType: string; courtType: string } | null;
 selectedFacts?: string[];
};

const asRecord = (value: unknown): Record<string, unknown> =>
 value && typeof value ==='object' ? value as Record<string, unknown> : {};

const asArray = (value: unknown): Record<string, unknown>[] =>
 Array.isArray(value) ? value as Record<string, unknown>[] : [];

const asString = (value: unknown): string =>
 typeof value ==='string' ? value : value == null ? '' : String(value);

const normalizeLegalBasis = (value: unknown, caseId: string): TLawsuitLegalBasis | null => {
 const raw = asRecord(value);
 if (Object.keys(raw).length === 0) return null;

 const legalTexts = asArray(raw.legalTexts ?? raw.legal_texts ?? raw.LegalTexts).map((text, index) => ({
 id: asString(text.id ?? text.Id) || String(index + 1),
 lawName: asString(text.lawName ?? text.law_name ?? text.LawName),
 articleNumber: asString(text.articleNumber ?? text.article_number ?? text.ArticleNumber),
 articleText: asString(text.articleText ?? text.article_text ?? text.ArticleText),
 applicationNotes: asString(text.applicationNotes ?? text.application_notes ?? text.ApplicationNotes),
 }));

 const cassationRulings = asArray(raw.cassationRulings ?? raw.cassation_rulings ?? raw.CassationRulings).map((ruling, index) => ({
 id: asString(ruling.id ?? ruling.Id) || String(index + 1),
 court: asString(ruling.court ?? ruling.Court),
 appealNumber: asString(ruling.appealNumber ?? ruling.appeal_number ?? ruling.AppealNumber),
 judicialYear: asString(ruling.judicialYear ?? ruling.judicial_year ?? ruling.JudicialYear),
 sessionDate: asString(ruling.sessionDate ?? ruling.session_date ?? ruling.SessionDate),
 rulingText: asString(ruling.rulingText ?? ruling.ruling_text ?? ruling.RulingText),
 applicationNotes: asString(ruling.applicationNotes ?? ruling.application_notes ?? ruling.ApplicationNotes),
 }));

 return {
 caseId: asString(raw.caseId ?? raw.CaseId) || caseId,
 legalTexts,
 cassationRulings,
 };
};

const LawsuitLegalBasis = ({ caseId, nextStep, caseType, selectedFacts = [] }: LawsuitLegalBasisProps) => {
	 const dispatch = useAppDispatch();
	 const rawHydratedData = useAppSelector(
	 (state) => state.preparingStatementOfClaimsSlice.outputs[5],
	 );
 const hydratedData = useMemo(
 () => normalizeLegalBasis(rawHydratedData, caseId),
 [rawHydratedData, caseId],
 );

 const inputJson = useMemo(
 () => buildAnalysisInput(caseId, selectedFacts, {
 caseMainType: caseType?.caseMainType,
 caseSubType: caseType?.caseSubType,
 courtType: caseType?.courtType,
 }),
 [caseId, selectedFacts, caseType?.caseMainType, caseType?.caseSubType, caseType?.courtType],
 );

  const parseResult = useCallback((json: string): TLawsuitLegalBasis => {
 const normalized = normalizeLegalBasis(JSON.parse(json), caseId);
 return normalized ?? { caseId, legalTexts: [], cassationRulings: [] };
  }, [caseId]);

	  const {
	  isLoading,
	 hasFailed,
	 errorMessage,
	 result,
	 retry, charge,
	 } = useAnalysisStep<TLawsuitLegalBasis>({
	 caseId,
	 stepType:'LawsuitLegalBasis',
	 autoSubmit: !hydratedData,
	 inputJson,
 parseResult,
 onHydrate: (parsed) => {
 dispatch(hydrateStatementStep({ stepNumber: 5, result: parsed }));
 },
	 });

	 const data = hydratedData ?? result;

 const totalReferences = data
 ? data.legalTexts.length + data.cassationRulings.length
 : 0;

 return (
 <UnifiedStepShell
	 isLoading={isLoading && !data}
	 hasFailed={hasFailed && !data}
 errorMessage={errorMessage}
 onRetry={retry}
 charge={charge}
 loadingTitle="جاري تأسيس الأساس القانوني للدعوى..."
 loadingSubtitle="يقوم المحرك الذكي باستخراج النصوص القانونية وأحكام النقض ذات الصلة وربطها مباشرة بوقائع الدعوى."
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
 </UnifiedStepShell>
 );
};

export default LawsuitLegalBasis;
