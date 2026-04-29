import { useState, useCallback } from'react';
import { IoHelpCircleOutline, IoCheckmarkCircle, IoCreateOutline } from'react-icons/io5';
import FormModal from'../ui/form/FormModal';
import type { ClarifyFactsQuestion } from'../../services/clarifyFacts/clarifyFactsApi';

type AnswerMap = Record<number, { selected: string; custom?: string }>;

interface ClarifyFactsModalProps {
 isOpen: boolean;
 onClose: () => void;
 questions: ClarifyFactsQuestion[];
 /** Called with the combined answers text. The parent should merge it with the case facts. */
 onSubmit: (answersText: string) => void;
 isSubmitting?: boolean;
}

/**
 * Pre-flight modal that shows 3–7 AI-generated clarification questions.
 * Each question has 3 suggested multiple-choice options + a 4th"custom input" option.
 */
const ClarifyFactsModal = ({
 isOpen,
 onClose,
 questions,
 onSubmit,
 isSubmitting = false,
}: ClarifyFactsModalProps) => {
 const [answers, setAnswers] = useState<AnswerMap>({});

 const handleSelect = useCallback((qIndex: number, option: string) => {
 setAnswers((prev) => ({
 ...prev,
 [qIndex]: { selected: option, custom: undefined },
 }));
 }, []);

 const handleCustomToggle = useCallback((qIndex: number) => {
 setAnswers((prev) => ({
 ...prev,
 [qIndex]: { selected:'__custom__', custom: prev[qIndex]?.custom ??'' },
 }));
 }, []);

 const handleCustomChange = useCallback((qIndex: number, text: string) => {
 setAnswers((prev) => ({
 ...prev,
 [qIndex]: { selected:'__custom__', custom: text },
 }));
 }, []);

 const allAnswered = questions.every((_, idx) => {
 const a = answers[idx];
 if (!a) return false;
 if (a.selected ==='__custom__') return (a.custom?.trim().length ?? 0) > 0;
 return a.selected.length > 0;
 });

 const handleSubmit = () => {
 const lines = questions.map((q, idx) => {
 const a = answers[idx];
 const answer = a?.selected ==='__custom__' ? a.custom?.trim() : a?.selected;
 return `سؤال: ${q.questionText}\nالإجابة: ${answer ??'لم يتم الإجابة'}`;
 });
 onSubmit(lines.join('\n\n'));
 };

 return (
 <FormModal
 isOpen={isOpen}
 onClose={onClose}
 title="استكمال البيانات قبل التحليل"
 subtitle="أجب على الأسئلة التالية لضمان دقة التحليل القانوني"
 icon={<IoHelpCircleOutline />}
 size="full"
 >
 <div dir="rtl" className="px-6 py-5 space-y-6 max-h-[65vh] overflow-y-auto">
 {questions.map((q, qIdx) => {
 const currentAnswer = answers[qIdx];
 const isCustomActive = currentAnswer?.selected ==='__custom__';

 return (
 <div
 key={qIdx}
 className="app-surface-soft dark:bg-[#2A2A2A] rounded-2xl p-5 border app-border dark:app-border-strong"
 >
 {/* Question header */}
 <div className="flex items-start gap-3 mb-4">
 <span className="w-7 h-7 rounded-full bg-[var(--main-color)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
 {qIdx + 1}
 </span>
 <p className="text-sm font-semibold text-[var(--title-color)] dark:text-gray-200 leading-relaxed">
 {q.questionText}
 </p>
 </div>

 {/* Options */}
 <div className="flex flex-col gap-2 me-10">
 {q.suggestedOptions.map((opt, optIdx) => {
 const isSelected = currentAnswer?.selected === opt;
 return (
 <button
 key={optIdx}
 type="button"
 onClick={() => handleSelect(qIdx, opt)}
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

 {/* Custom answer option */}
 <button
 type="button"
 onClick={() => handleCustomToggle(qIdx)}
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

 {/* Custom text input */}
 {isCustomActive && (
 <textarea
 value={currentAnswer?.custom ??''}
 onChange={(e) => handleCustomChange(qIdx, e.target.value)}
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
 </div>

 {/* Footer */}
 <div className="px-6 py-4 border-t app-border dark:app-border-strong flex items-center justify-between" dir="rtl">
 <p className="text-xs app-text-subtle">
 {Object.keys(answers).length} من {questions.length} تم الإجابة عليها
 </p>
 <div className="flex gap-3">
 <button
 type="button"
 onClick={onClose}
 className="px-5 py-2.5 rounded-full text-sm font-medium app-text-subtle hover:app-text-muted hover:app-surface-soft transition-colors"
 >
 تخطي والبدء مباشرة
 </button>
 <button
 type="button"
 onClick={handleSubmit}
 disabled={!allAnswered || isSubmitting}
 className={`
 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-colors shadow-sm
 ${allAnswered && !isSubmitting
 ?'bg-[var(--main-color)] hover:bg-opacity-90 cursor-pointer'
 :'app-surface-muted dark:app-surface-soft cursor-not-allowed opacity-60'
 }
 `}
 >
 {isSubmitting ?'جاري المعالجة...' :'تأكيد وبدء التحليل'}
 </button>
 </div>
 </div>
 </FormModal>
 );
};

export default ClarifyFactsModal;
