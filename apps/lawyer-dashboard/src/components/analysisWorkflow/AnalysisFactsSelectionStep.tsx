import { useState } from'react';
import { useDisclosure } from'@heroui/react';
import { IoAdd, IoArrowBackOutline, IoCheckmarkCircle, IoDocumentTextOutline, IoHelpCircleOutline, IoShieldCheckmarkOutline, IoCreateOutline } from'react-icons/io5';
import { sileo } from"sileo";
import { useAppDispatch } from'../../hooks/reduxHooks';
import AddNewFact from'../forms/AddNewFact';
import FormModal from'../ui/form/FormModal';
import {
 AnalysisStageActionButton,
 AnalysisStageLayout,
 AnalysisStageSidebarCard
} from'./AnalysisStageLayout';
import { CustomCard } from'@mohamy/shared-ui';
import { evaluateFactsGaps } from'../../services/clarifyFacts/clarifyFactsApi';
import type { ClarifyFactsQuestion } from'../../services/clarifyFacts/clarifyFactsApi';
import thunkUpdateCaseFacts from'../../redux/cases/thunk/thunkUpdateCaseFacts';

type AnswerMap = Record<number, { selected: string; custom?: string }>;

type AnalysisFactsSelectionStepProps = {
 title?: string;
 facts: string[];
 setFacts: React.Dispatch<React.SetStateAction<string[]>>;
 selectedFacts: string[];
 setSelectedFacts: React.Dispatch<React.SetStateAction<string[]>>;
 metricLabel?: string;
 sidebarDescription: string;
 startLabel: string;
 continueLabel?: string;
 onStart: () => void;
 isStarting?: boolean;
 startingLabel?: string;
 emptyStateText?: string;
 caseId?: string; // We need caseId for the ClarifyFacts API
 selectionHint?: {
 selected: string;
 unselected: string;
 footerSelected: string;
 footerUnselected: string;
 };
};

const defaultSelectionHint = {
 selected:'معتمدة',
 unselected:'اضغط للاعتماد',
 footerSelected:'سيتم تضمينها في التحليل القانوني',
 footerUnselected:'لن تُرسل إلا بعد اعتمادها',
};

const AnalysisFactsSelectionStep = ({
 title ='مراجعة الوقائع',
 facts,
 setFacts,
 selectedFacts,
 setSelectedFacts,
 metricLabel ='الوقائع المعتمدة',
 sidebarDescription,
 startLabel,
 continueLabel,
 onStart,
 isStarting = false,
 startingLabel ='جارٍ تجهيز المرحلة...',
 emptyStateText ='لا توجد وقائع محفوظة داخل القضية الحالية.',
 caseId,
 selectionHint = defaultSelectionHint,
}: AnalysisFactsSelectionStepProps) => {
 const dispatch = useAppDispatch();
 const { isOpen, onOpen, onOpenChange } = useDisclosure();

 // ── Pre-flight clarification state ──
 const [clarifyQuestions, setClarifyQuestions] = useState<ClarifyFactsQuestion[]>([]);
 const [clarifyAnswers, setClarifyAnswers] = useState<AnswerMap>({});
 const [isClarifyLoading, setIsClarifyLoading] = useState(false);
 
 const [clarifyState, setClarifyState] = useState(() => {
 if (!caseId) return { done: false, skipped: false, count: 0 };
 try {
 const saved = localStorage.getItem(`mohamy_clarify_facts_${caseId}`);
 if (saved) return JSON.parse(saved);
 } catch { /* ignore */ }
 return { done: false, skipped: false, count: 0 };
 });
 const [clarifyError, setClarifyError] = useState(false);

 const markClarifyDone = (skipped: boolean, count: number) => {
 const newState = { done: true, skipped, count };
 setClarifyState(newState);
 if (caseId) {
 localStorage.setItem(`mohamy_clarify_facts_${caseId}`, JSON.stringify(newState));
 }
 };
 
 const resetClarifyState = () => {
 const newState = { done: false, skipped: false, count: 0 };
 setClarifyState(newState);
 };

 const toggleFact = (fact: string) => {
 setSelectedFacts((prev) => (
 prev.includes(fact)
 ? prev.filter((item) => item !== fact)
 : [...prev, fact]
 ));
 };

 const handleAddFact = (updater: React.SetStateAction<string[]>) => {
 setFacts((prevFacts) => {
 const nextFacts = typeof updater ==='function' ? updater(prevFacts) : updater;
 const addedFact = nextFacts[nextFacts.length - 1];

 if (addedFact) {
 setSelectedFacts((prevSelected) => (
 prevSelected.includes(addedFact) ? prevSelected : [...prevSelected, addedFact]
 ));
 }

 return nextFacts;
 });
 };

 // ── Pre-flight logic ──
 const handleEvaluateClarify = async () => {
 if (!caseId) {
 markClarifyDone(true, 0);
 return;
 }

 try {
 setIsClarifyLoading(true);
 setClarifyError(false);
 const questions = await evaluateFactsGaps(caseId);
 if (questions.length > 0) {
 setClarifyQuestions(questions);
 setClarifyAnswers({});
 resetClarifyState();
 } else {
 setClarifyQuestions([]);
 markClarifyDone(false, 0);
 sileo.success({ title:'الوقائع مكتملة دائمًا، يمكنك المتابعة.' });
 }
 } catch {
		
 setClarifyError(true);
 sileo.error({ title:'تعذّر مراجعة الوقائع بواسطة الذكاء الاصطناعي. اضغط لإعادة المحاولة.' });
 } finally {
 setIsClarifyLoading(false);
 }
 };

 const handleClarifySelect = (qIndex: number, option: string) => {
 setClarifyAnswers((prev) => ({
 ...prev,
 [qIndex]: { selected: option, custom: undefined },
 }));
 };

 const handleClarifyCustomToggle = (qIndex: number) => {
 setClarifyAnswers((prev) => ({
 ...prev,
 [qIndex]: { selected:'__custom__', custom: prev[qIndex]?.custom ??'' },
 }));
 };

 const handleClarifyCustomChange = (qIndex: number, text: string) => {
 setClarifyAnswers((prev) => ({
 ...prev,
 [qIndex]: { selected:'__custom__', custom: text },
 }));
 };

 const allQuestionsAnswered = clarifyQuestions.length > 0 && clarifyQuestions.every((_, idx) => {
 const a = clarifyAnswers[idx];
 if (!a) return false;
 if (a.selected ==='__custom__') return (a.custom?.trim().length ?? 0) > 0;
 return a.selected.length > 0;
 });

 const handleClarifyConfirm = () => {
 const lines = clarifyQuestions.map((q, idx) => {
 const a = clarifyAnswers[idx];
 const answer = a?.selected ==='__custom__' ? a.custom?.trim() : a?.selected;
 return `سؤال: ${q.questionText}\nالإجابة: ${answer ??'لم يتم الإجابة'}`;
 });
 const enrichment ='\n\n--- توضيحات إضافية من المحامي ---\n' + lines.join('\n\n');

 const enrichedFacts = facts.map((f) => f === selectedFacts[0] ? f + enrichment : f);
 const enrichedSelected = selectedFacts.map((f, i) => i === 0 ? f + enrichment : f);

 setFacts(enrichedFacts);
 setSelectedFacts(enrichedSelected);

 if (caseId) {
 dispatch(thunkUpdateCaseFacts({
 caseId,
 facts: enrichedFacts.join('\n\n'),
 }));
 }

 markClarifyDone(false, clarifyQuestions.length);
 sileo.success({ title:'تم حفظ التوضيحات في وقائع القضية، يمكنك المتابعة الآن.' });
 };

 const handleClarifySkip = () => {
 markClarifyDone(true, clarifyQuestions.length);
 };

 // If there is no caseId passed or continueLabel exists indicating the step is already passed in a workflow...
 // Also, if they've answered/skipped, they can proceed.
 // NOTE: `continueLabel` usually means they already have data for the NEXT step, so they might not need to clarify again.
 // We'll enforce clarification if it's the first time (`continueLabel` === `startLabel` usually or just use clarifyDone)
 const hasAlreadyProceededInWorkflow = continueLabel && continueLabel !== startLabel;
 const canProceed = !caseId || hasAlreadyProceededInWorkflow || clarifyState.done || clarifyState.skipped;

 return (
 <AnalysisStageLayout
 title={title}
 actions={
 <button
 type="button"
 className="inline-flex items-center gap-2 bg-[var(--main-color)] text-white px-5 py-2.5 rounded-full font-bold hover:bg-opacity-90 transition-colors text-sm shadow-sm cursor-pointer"
 onClick={onOpen}
 >
 <IoAdd className="text-lg" />
 إضافة واقعة
 </button>
 }
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label={metricLabel}
 value={selectedFacts.length}
 valueClassName="text-5xl"
 description={sidebarDescription}
 />

 {!canProceed && clarifyQuestions.length === 0 && !clarifyState.done && (
 <AnalysisStageActionButton
 label={clarifyError
 ?'إعادة المحاولة'
 : isClarifyLoading
 ?'جاري مراجعة الوقائع...'
 :'مراجعة اكتمال الوقائع'}
 icon={IoHelpCircleOutline}
 onClick={handleEvaluateClarify}
 disabled={isClarifyLoading || selectedFacts.length === 0}
 variant={clarifyError ?'secondary' : undefined}
 />
 )}

 {clarifyError && !canProceed && (
 <p className="text-xs text-center text-[var(--danger-color)] font-medium">
 تعذّر مراجعة الوقائع. اضغط لإعادة المحاولة.
 </p>
 )}

 {clarifyState.done && !hasAlreadyProceededInWorkflow && selectedFacts.length > 0 && (
 <div className="flex items-center gap-2 bg-[var(--success-soft)]/50 justify-center border border-[var(--success-soft)] rounded-xl px-4 py-3 mb-2 w-full shadow-sm text-center">
 <IoShieldCheckmarkOutline className="text-xl text-[var(--success-color)] flex-shrink-0" />
 <span className="text-xs font-bold text-[var(--success-color)] leading-relaxed">
 {clarifyState.skipped 
 ? `تم تخطي المراجعة (${clarifyState.count} أسئلة)`
 : clarifyState.count === 0 
 ?'الوقائع مكتملة وتم التحقق منها' 
 : `تم إضافة التوضيحات بنجاح (${clarifyState.count} أسئلة)`}
 </span>
 </div>
 )}

 <AnalysisStageActionButton
 label={isStarting ? startingLabel : (continueLabel ?? startLabel)}
 icon={IoArrowBackOutline}
 onClick={onStart}
 disabled={isStarting || selectedFacts.length === 0 || !canProceed}
 />

 {!canProceed && selectedFacts.length > 0 && !isStarting && (
 <p className="text-xs text-center text-orange-600 font-medium flex items-center justify-center gap-1">
 <IoShieldCheckmarkOutline className="text-sm" />
 يجب مراجعة اكتمال الوقائع أولاً
 </p>
 )}

 {selectedFacts.length === 0 && !isStarting && (
 <p className="text-xs text-center text-[var(--danger-color)] font-medium">
 يجب اعتماد واقعة واحدة على الأقل للاستمرار
 </p>
 )}
 </>
 }
 >
 <div className="flex flex-col gap-5">
 {facts.length === 0 ? (
 <div className="rounded-[24px] border border-dashed app-border-strong dark:app-border-strong app-surface-soft/70 dark:app-surface-soft/50 p-6 text-sm leading-7 app-text-subtle dark:app-text-subtle">
 {emptyStateText}
 </div>
 ) : (
 facts.map((fact, idx) => {
 const isSelected = selectedFacts.includes(fact);

 return (
 <CustomCard
 key={`${fact}-${idx}`}
 onClick={() => toggleFact(fact)}
 className={`cursor-pointer transition-colors border-2 text-end p-6 relative overflow-hidden group ${
 isSelected
 ?'border-[var(--main-color)] bg-orange-50/30 dark:bg-orange-950/20 shadow-md'
 :'app-border dark:app-border-strong hover:app-border-strong dark:hover:border-gray-600 hover:shadow-sm'
 }`}
 >
 <div className={`absolute top-0 end-0 h-full w-[4px] transition-colors ${isSelected ?'bg-[var(--main-color)]' :'bg-transparent group-hover:app-surface-muted dark:group-hover:bg-gray-700'}`} />

 <div className="flex justify-between items-center mb-4 ps-2">
 <span className={`text-xs font-bold px-3 py-1 rounded-full ${isSelected ?'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300' :'app-surface-soft dark:app-surface-soft app-text-muted dark:app-text-subtle'}`}>
 الواقعة {String(idx + 1).padStart(2,'0')}
 </span>

 <div className="flex items-center gap-2">
 <span className={`text-xs font-bold ${isSelected ?'text-[var(--main-color)]' :'app-text-subtle'}`}>
 {isSelected ? selectionHint.selected : selectionHint.unselected}
 </span>
 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ?'border-[var(--main-color)] bg-[var(--main-color)] text-white' :'app-border-strong dark:border-gray-600 text-transparent'}`}>
 <IoCheckmarkCircle className="text-sm" />
 </div>
 </div>
 </div>

 <p className="text-sm leading-relaxed app-text-subtle dark:app-text-subtle mb-6">{fact}</p>

 <div className="flex items-center gap-2 text-xs font-medium app-text-subtle dark:app-text-subtle border-t app-border dark:app-border-strong pt-4">
 <IoDocumentTextOutline className="text-base" />
 <span>{isSelected ? selectionHint.footerSelected : selectionHint.footerUnselected}</span>
 </div>
 </CustomCard>
 );
 })
 )}

 {/* Inline Clarification Component */}
 {clarifyQuestions.length > 0 && !clarifyState.done && (
 <CustomCard className="border-2 border-orange-200 dark:border-orange-800/50 bg-orange-50/10 dark:bg-orange-950/10 p-6 mt-6 col-span-full">
 <div className="flex flex-col gap-5">
 <p className="text-sm app-text-subtle leading-relaxed">
 لضمان دقة التحليل القانوني، أجب على الأسئلة التالية. يمكنك اختيار إجابة جاهزة أو كتابة إجابة مخصصة.
 </p>

 {clarifyQuestions.map((q, qIdx) => {
 const currentAnswer = clarifyAnswers[qIdx];
 const isCustomActive = currentAnswer?.selected ==='__custom__';

 return (
 <div
 key={qIdx}
 className="app-surface-soft dark:bg-[#2A2A2A] rounded-2xl p-5 border app-border dark:app-border-strong"
 >
 <div className="flex items-start gap-3 mb-4">
 <span className="w-7 h-7 rounded-full bg-[var(--main-color)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
 {qIdx + 1}
 </span>
 <p className="text-sm font-semibold text-[var(--title-color)] dark:text-gray-200 leading-relaxed">
 {q.questionText}
 </p>
 </div>

 <div className="flex flex-col gap-2 me-10">
 {q.suggestedOptions.map((opt, optIdx) => {
 const isSelected = currentAnswer?.selected === opt;
 return (
 <button
 key={optIdx}
 type="button"
 onClick={() => handleClarifySelect(qIdx, opt)}
 className={`
 group flex items-center gap-3 w-full text-end px-4 py-3 rounded-xl
 border-2 transition-colors duration-200 text-sm
 ${isSelected
 ?'border-[var(--main-color)] bg-orange-50 dark:bg-orange-900/20 shadow-sm'
 :'app-border-strong dark:border-gray-600 bg-white dark:bg-[#1D1D1D] hover:app-border-strong hover:shadow-sm'
 }
 `}
 >
 <span className={`
 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
 ${isSelected
 ?'border-[var(--main-color)] bg-[var(--main-color)] text-white'
 :'app-border-strong dark:border-gray-500'
 }
 `}>
 {isSelected && <IoCheckmarkCircle className="text-xs" />}
 </span>
 <span className={`leading-relaxed ${isSelected ?'text-[var(--title-color)] font-medium' :'app-text-muted dark:app-text-subtle'}`}>
 {opt}
 </span>
 </button>
 );
 })}

 <button
 type="button"
 onClick={() => handleClarifyCustomToggle(qIdx)}
 className={`
 group flex items-center gap-3 w-full text-end px-4 py-3 rounded-xl
 border-2 transition-colors duration-200 text-sm
 ${isCustomActive
 ?'border-[var(--main-color)] bg-orange-50 dark:bg-orange-900/20 shadow-sm'
 :'border-dashed app-border-strong dark:border-gray-600 bg-white dark:bg-[#1D1D1D] hover:border-gray-400 hover:shadow-sm'
 }
 `}
 >
 <span className={`
 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
 ${isCustomActive
 ?'border-[var(--main-color)] bg-[var(--main-color)] text-white'
 :'app-border-strong dark:border-gray-500'
 }
 `}>
 {isCustomActive ? <IoCheckmarkCircle className="text-xs" /> : <IoCreateOutline className="text-xs app-text-subtle" />}
 </span>
 <span className={`${isCustomActive ?'text-[var(--title-color)] font-medium' :'app-text-subtle dark:app-text-subtle'}`}>
 إجابة مخصصة...
 </span>
 </button>

 {isCustomActive && (
 <textarea
 value={currentAnswer?.custom ??''}
 onChange={(e) => handleClarifyCustomChange(qIdx, e.target.value)}
 placeholder="اكتب إجابتك هنا..."
 rows={2}
 className="w-full mt-1 me-8 px-4 py-3 rounded-xl border-2 border-[var(--main-color)]/30
 bg-white dark:bg-[#1D1D1D] text-sm text-[var(--title-color)] dark:text-gray-200
 focus:outline-none focus:border-[var(--main-color)] focus:ring-1 focus:ring-[var(--main-color)]/20
 resize-none transition-colors placeholder:app-text-subtle"
 autoFocus
 />
 )}
 </div>
 </div>
 );
 })}

 <div className="flex items-center justify-between pt-3 border-t app-border dark:app-border-strong">
 <p className="text-xs app-text-subtle">
 {Object.keys(clarifyAnswers).length} من {clarifyQuestions.length} تم الإجابة عليها
 </p>
 <div className="flex gap-3">
 <button
 type="button"
 onClick={handleClarifySkip}
 className="px-5 py-2.5 rounded-full text-sm font-medium app-text-subtle hover:app-text-muted hover:app-surface-soft transition-colors"
 >
 تخطي والبدء مباشرة
 </button>
 <button
 type="button"
 onClick={handleClarifyConfirm}
 disabled={!allQuestionsAnswered}
 className={`
 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-colors shadow-sm
 ${allQuestionsAnswered
 ?'bg-[var(--main-color)] hover:bg-opacity-90 cursor-pointer'
 :'app-surface-muted dark:app-surface-soft cursor-not-allowed opacity-60'
 }
 `}
 >
 تأكيد التوضيحات
 </button>
 </div>
 </div>
 </div>
 </CustomCard>
 )}

 </div>

 <FormModal isOpen={isOpen} onOpenChange={onOpenChange} size="xl" title="إضافة واقعة جديدة">
 <div className="w-full">
 <AddNewFact setCaseFacts={handleAddFact} caseFacts={facts} onOpenChange={onOpenChange} />
 </div>
 </FormModal>
 </AnalysisStageLayout>
 );
};

export default AnalysisFactsSelectionStep;
