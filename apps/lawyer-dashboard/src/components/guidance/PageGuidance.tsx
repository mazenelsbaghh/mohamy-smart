import { useEffect, useId, useMemo, useState } from'react';
import { createPortal } from'react-dom';
import {
 BookOpenCheck,
 CheckCircle2,
 ChevronLeft,
 ChevronRight,
 EyeOff,
 Info,
 ShieldCheck,
 Sparkles,
 X,
} from'lucide-react';
import type { GuidedTourStep, PageGuidanceContent } from'./guidanceContent';
import'./PageGuidance.css';

type PageGuidanceProps = {
 content: PageGuidanceContent;
 className?: string;
};

const getDismissedValue = (key: string) => {
 try {
 if (localStorage.getItem(key) ==='true') return true;
 } catch {
 // Local storage is optional UI state; fall back to cookie below.
 }

 try {
 return document.cookie
 .split(';')
 .some((cookie) => cookie.trim() === `${encodeURIComponent(key)}=true`);
 } catch {
 return false;
 }
};

const setDismissedValue = (key: string) => {
 try {
 localStorage.setItem(key,'true');
 } catch {
 // Local storage is optional UI state; ignore browser storage failures.
 }

 try {
 document.cookie = `${encodeURIComponent(key)}=true; Max-Age=31536000; Path=/; SameSite=Lax`;
 } catch {
 // Cookie persistence is a fallback only.
 }
};

const buildFallbackSteps = (content: PageGuidanceContent): GuidedTourStep[] => [
 ...content.primaryActions.map((action) => ({
 title:`شرح: ${action}`,
 body:`استخدم هذا الجزء عندما تكون البيانات المطلوبة جاهزة، وراجع ما يظهر حوله قبل المتابعة.`,
 targetText: action,
 })),
 {
 title:'الخطوة التالية المقترحة',
 body:`بعد مراجعة العناصر السابقة: ${content.nextStep}`,
 targetText: content.nextStep,
 tone: content.ai ?'ai' :'default',
 } satisfies GuidedTourStep,
];

const PageGuidance = ({ content, className ='' }: PageGuidanceProps) => {
 const titleId = useId();
 const descriptionId = useId();
 const dismissStorageKey = useMemo(() => `mohamy:page-guidance:${content.key}:dismissed`, [content.key]);
 const steps = useMemo(() => content.tourSteps?.length ? content.tourSteps : buildFallbackSteps(content), [content]);
 const [isDismissed, setIsDismissed] = useState(() => getDismissedValue(dismissStorageKey));
 const [isOpen, setIsOpen] = useState(() => !getDismissedValue(dismissStorageKey));
 const [activeStepIndex, setActiveStepIndex] = useState(0);

 const activeStep = steps[Math.min(activeStepIndex, steps.length - 1)];
 const isFirstStep = activeStepIndex <= 0;
 const isLastStep = activeStepIndex >= steps.length - 1;

 useEffect(() => {
 const dismissed = getDismissedValue(dismissStorageKey);
 setIsDismissed(dismissed);
 setIsOpen(!dismissed);
 setActiveStepIndex(0);
 }, [dismissStorageKey]);

 useEffect(() => {
 if (!isOpen) return;

 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.key ==='Escape') {
 setIsOpen(false);
 }
 if (event.key ==='ArrowLeft') {
 setActiveStepIndex((current) => Math.min(current + 1, steps.length - 1));
 }
 if (event.key ==='ArrowRight') {
 setActiveStepIndex((current) => Math.max(current - 1, 0));
 }
 };

 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [isOpen, steps.length]);



 const closeForNow = () => {
 setIsOpen(false);
 };

 const dismissPermanently = () => {
 setDismissedValue(dismissStorageKey);
 setIsDismissed(true);
 setIsOpen(false);
 };

 const goPrevious = () => {
 setActiveStepIndex((current) => Math.max(current - 1, 0));
 };

 const goNext = () => {
 if (isLastStep) {
 closeForNow();
 return;
 }
 setActiveStepIndex((current) => Math.min(current + 1, steps.length - 1));
 };

 if (isDismissed || !isOpen || !activeStep || typeof document ==='undefined') return null;

 const rootClassName = [
 'page-guidance-overlay',
 className,
 ].filter(Boolean).join(' ');
 const aiGuidance = activeStep.tone ==='ai' ? content.ai : undefined;

 return createPortal(
 <div className={rootClassName} role="presentation" onClick={closeForNow}>
 <div
 className="page-guidance-dialog"
 role="dialog"
 aria-modal="true"
 aria-labelledby={titleId}
 aria-describedby={descriptionId}
 onClick={(event) => event.stopPropagation()}
 >
 <div className="page-guidance-dialog__header">
 <div className="page-guidance-dialog__title-wrap">
 <span className="page-guidance-dialog__icon" aria-hidden="true">
 <BookOpenCheck size={21} />
 </span>
 <div>
 <span className="page-guidance-dialog__eyebrow">
 <Info size={13} aria-hidden="true" />
 {content.eyebrow ||'جولة إرشادية'}
 </span>
 <h2 id={titleId} className="page-guidance-dialog__title">{content.title}</h2>
 </div>
 </div>

 <button
 type="button"
 className="page-guidance-dialog__icon-button"
 onClick={closeForNow}
 aria-label="إغلاق الإرشاد الآن"
 >
 <X size={18} aria-hidden="true" />
 </button>
 </div>

 <div className="page-guidance-dialog__body">
 <p id={descriptionId} className="page-guidance-dialog__summary">{content.summary}</p>

 <section className={`page-guidance-dialog__active-step page-guidance-dialog__active-step--${activeStep.tone ||'default'}`} aria-live="polite">
 <div className="page-guidance-dialog__step-kicker">
 <span>{activeStepIndex + 1} من {steps.length}</span>
 </div>
 <h3 className="page-guidance-dialog__active-title">{activeStep.title}</h3>
 <p className="page-guidance-dialog__active-body">{activeStep.body}</p>
 </section>

 {aiGuidance ? (
 <section className="page-guidance-dialog__panel page-guidance-dialog__panel--ai" aria-labelledby={`${titleId}-ai`}>
 <h3 id={`${titleId}-ai`} className="page-guidance-dialog__ai-title">
 <Sparkles size={17} aria-hidden="true" />
 استخدام الذكاء الاصطناعي
 </h3>
 <p className="page-guidance-dialog__text">{aiGuidance.whenToUse}</p>

 <h4 className="page-guidance-dialog__mini-title">جهز قبل التشغيل</h4>
 <ul className="page-guidance-dialog__check-list">
 {aiGuidance.requiredInputs.map((input) => (
 <li key={input}>
 <CheckCircle2 size={14} aria-hidden="true" />
 <span>{input}</span>
 </li>
 ))}
 </ul>

 <p className="page-guidance-dialog__text">
 <strong>الناتج المتوقع: </strong>
 {aiGuidance.expectedOutput}
 </p>
 <p className="page-guidance-dialog__review-note">
 <ShieldCheck size={17} aria-hidden="true" />
 <span>{aiGuidance.reviewNote}</span>
 </p>
 </section>
 ) : null}

 {content.details?.length && !aiGuidance ? (
 <section className="page-guidance-dialog__panel" aria-labelledby={`${titleId}-notes`}>
 <h3 id={`${titleId}-notes`} className="page-guidance-dialog__section-title">
 <Info size={16} aria-hidden="true" />
 ملاحظات مهمة
 </h3>
 <ul className="page-guidance-dialog__check-list">
 {content.details.map((detail) => (
 <li key={detail}>
 <CheckCircle2 size={14} aria-hidden="true" />
 <span>{detail}</span>
 </li>
 ))}
 </ul>
 </section>
 ) : null}
 </div>

 <div className="page-guidance-dialog__footer">
 <button
 type="button"
 className="page-guidance-dialog__button page-guidance-dialog__button--muted"
 onClick={dismissPermanently}
 >
 <EyeOff size={15} aria-hidden="true" />
 عدم الإظهار مرة أخرى
 </button>

 <div className="page-guidance-dialog__nav">
 <button
 type="button"
 className="page-guidance-dialog__button"
 onClick={goPrevious}
 disabled={isFirstStep}
 >
 <ChevronRight size={15} aria-hidden="true" />
 السابق
 </button>
 <button
 type="button"
 className="page-guidance-dialog__button page-guidance-dialog__button--primary"
 onClick={goNext}
 >
 {isLastStep ?'ابدأ العمل' :'التالي'}
 {!isLastStep ? <ChevronLeft size={15} aria-hidden="true" /> : null}
 </button>
 </div>
 </div>
 </div>
 </div>
 , document.body);
};

export default PageGuidance;
