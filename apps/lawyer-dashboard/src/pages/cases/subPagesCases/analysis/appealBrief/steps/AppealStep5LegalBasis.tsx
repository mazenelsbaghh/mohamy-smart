import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { parseJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoArrowBackOutline, IoArrowForwardOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateStep } from'../../../../../../redux/appealBrief/appealBriefSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import {
 UnifiedStepShell,
 AnalysisStageActionButton,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';

type TAppealStep5Props = {
 nextStep: () => void;
 prevStep: () => void;

 selectedFacts?: string[];};

const AppealStep5LegalBasis = ({ nextStep, prevStep , selectedFacts }: TAppealStep5Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 const legalBasisData = useAppSelector((s) => s.appealBrief.outputs[5]);

 const { isLoading, hasFailed, errorMessage, retry, charge } = useAnalysisStep({
 parseResult: parseJobResult,
 caseId: caseId as string,
 stepType:'AppealBriefLegalBasis',
 autoSubmit: true,
 inputJson: buildAnalysisInput((caseId as string) || caseId ||"", selectedFacts || []), 
 onHydrate: (parsed) => dispatch(hydrateStep({ stepNumber: 5, result: parsed })),
 });

 return (
 <UnifiedStepShell
 isLoading={isLoading && !legalBasisData}
 hasFailed={hasFailed && !legalBasisData}
 errorMessage={errorMessage}
 onRetry={retry}
 charge={charge}
 title={legalBasisData ? "السند القانوني" : undefined}
 sidebar={legalBasisData ? (
 <>
 <AnalysisStageSidebarCard
 label="إطار السند"
 value={legalBasisData.legalBasis?.length ?"مكتمل" :"تحت المراجعة"}
 valueClassName="text-xl"
 description="تم توليد المواد القانونية والسوابق القضائية التي تدعم الطعن وتؤيده للوصول إلى التجميع النهائي."
 />
 <div className="flex flex-col gap-2">
 <AnalysisStageActionButton
 label="التجميع النهائي"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 <AnalysisStageActionButton
 label="العودة"
 icon={IoArrowForwardOutline}
 onClick={prevStep}
 variant="secondary"
 />
 </div>
 </>
 ) : undefined}
 >
 {legalBasisData && (
 <div className="grid grid-cols-1 gap-6">
 <AnalysisStageSectionCard label="المواد والسوابق ومجه الاستدلال">
 {legalBasisData.legalBasis && legalBasisData.legalBasis.length > 0 ? (
 <div className="space-y-6">
 {(legalBasisData.legalBasis as Array<{ verbatimArticles?: Array<{ law?: string; articleNo?: string | number; text?: string }>; cassationPrinciples?: Array<{ caseNo?: string | number; year?: string | number; date?: string; text?: string }>; reasoning?: string; applicationNotes?: string }>).map((basis, sectionIdx) => (
 <div key={sectionIdx} className="bg-white dark:bg-[#1a1d24] p-5 rounded-xl border app-border dark:app-border-strong shadow-sm">
 {/* Articles */}
 {basis.verbatimArticles && basis.verbatimArticles.length > 0 && (
 <div className="mb-4">
 <h4 className="font-bold text-[var(--main-color)] mb-2">النصوص القانونية:</h4>
 <ul className="flex flex-col gap-2">
 {basis.verbatimArticles.map((art: { law?: string; articleNo?: string | number; text?: string }, artIdx: number) => (
 <li key={artIdx} className="app-text-muted text-sm leading-relaxed p-3 app-surface-soft dark:app-surface-soft/50 rounded-lg border app-border dark:border-slate-700/50">
 <span className="font-bold text-[var(--title-color)] ms-1">{art.law ||'القانون'} {art.articleNo ? `- المادة رقم ${art.articleNo}` :''}:</span>
 {art.text}
 </li>
 ))}
 </ul>
 </div>
 )}
 
 {/* Cassation */}
 {basis.cassationPrinciples && basis.cassationPrinciples.length > 0 && (
 <div className="mb-4">
 <h4 className="font-bold text-[var(--main-color)] mb-2">المبادئ القضائية:</h4>
 <ul className="flex flex-col gap-2">
 {basis.cassationPrinciples.map((prec: { caseNo?: string | number; year?: string | number; date?: string; text?: string }, precIdx: number) => (
 <li key={precIdx} className="app-text-muted text-sm leading-relaxed p-3 app-surface-soft dark:app-surface-soft/50 rounded-lg border app-border dark:border-slate-700/50">
 <span className="font-bold text-[var(--title-color)] ms-1">
 {prec.caseNo ? `الطعن رقم ${prec.caseNo}` :'سابق قضائي'} 
 {prec.year ? ` لسنة ${prec.year}` :''} 
 {prec.date ? ` - جلسة ${prec.date}` :''}:
 </span>
 {prec.text}
 </li>
 ))}
 </ul>
 </div>
 )}
 
 {/* Application Notes */}
 {basis.applicationNotes && (
 <div className="bg-orange-50/50 dark:bg-orange-500/10 p-4 rounded-lg border border-orange-100/50 dark:border-orange-500/20 mt-4">
 <h4 className="font-bold text-orange-800 dark:text-orange-400 mb-2">وجه الاستدلال:</h4>
 <p className="text-sm app-text-muted leading-relaxed font-medium">
 {basis.applicationNotes}
 </p>
 </div>
  )}
  </div>
  ))}
  </div>
  ) : (
  <div className="app-text-subtle italic p-4 text-center">لا يوجد سند قانوني مسجل.</div>
  )}
  </AnalysisStageSectionCard>
  </div>
  )}
  </UnifiedStepShell>
  );
};

export default AppealStep5LegalBasis;
