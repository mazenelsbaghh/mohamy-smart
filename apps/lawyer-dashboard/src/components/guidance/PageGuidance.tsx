import { useCallback, useEffect, useId, useMemo, useState, type CSSProperties } from'react';
import { createPortal } from'react-dom';
import {
 BookOpenCheck,
 CheckCircle2,
 ChevronLeft,
 ChevronRight,
 EyeOff,
 Info,
 LocateFixed,
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

type SpotlightRect = {
 top: number;
 left: number;
 width: number;
 height: number;
 label: string;
 placement: 'target-upper' |'target-lower';
};

const targetCandidatesSelector = [
 'button',
 'a',
 '[role="button"]',
 'input',
 'select',
 'textarea',
 '[aria-label]',
 '[title]',
 '[placeholder]',
 '[data-guidance-target]',
 'h1',
 'h2',
 'h3',
 '[class*="card"]',
].join(',');

const focusableTargetSelector = [
 'a[href]',
 'button:not([disabled])',
 'input:not([disabled])',
 'select:not([disabled])',
 'textarea:not([disabled])',
 '[role="button"]',
 '[tabindex]:not([tabindex="-1"])',
].join(',');

const getDismissedValue = (key: string) => {
 try {
 return localStorage.getItem(key) ==='true';
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
};

const normalizeText = (value: string) =>
 value
 .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
 .replace(/\s+/g,' ')
 .trim()
 .toLowerCase();

const getElementLabel = (element: HTMLElement) => [
 element.getAttribute('data-guidance-target'),
 element.getAttribute('aria-label'),
 element.getAttribute('title'),
 element.getAttribute('placeholder'),
 element.textContent,
 element instanceof HTMLInputElement ? element.value : '',
].filter(Boolean).join(' ');

const isVisibleTarget = (element: HTMLElement) => {
 const rect = element.getBoundingClientRect();
 const style = window.getComputedStyle(element);
 return rect.width > 4
 && rect.height > 4
 && style.display !=='none'
 && style.visibility !=='hidden'
 && Number(style.opacity) !== 0;
};

const findTargetElement = (step: GuidedTourStep): HTMLElement | null => {
 if (step.targetSelector) {
 const directTarget = document.querySelector<HTMLElement>(step.targetSelector);
 if (directTarget && isVisibleTarget(directTarget)) return directTarget;
 }

 if (!step.targetText) return null;

 const targetText = normalizeText(step.targetText);
 const candidates = Array.from(document.querySelectorAll<HTMLElement>(targetCandidatesSelector))
 .filter(isVisibleTarget);

 return candidates.find((candidate) => {
 const label = normalizeText(getElementLabel(candidate));
 return label === targetText || label.includes(targetText) || targetText.includes(label);
 }) ?? null;
};

const getDocumentScroller = () =>
 (document.scrollingElement || document.documentElement) as HTMLElement;

const getScrollParent = (element: HTMLElement): HTMLElement => {
 let parent = element.parentElement;

 while (parent && parent !== document.body) {
 const style = window.getComputedStyle(parent);
 const canScrollY = /(auto|scroll|overlay)/.test(`${style.overflowY}${style.overflow}`);
 if (canScrollY && parent.scrollHeight > parent.clientHeight + 8) {
 return parent;
 }
 parent = parent.parentElement;
 }

 return getDocumentScroller();
};

const scrollTargetToGuidePosition = (target: HTMLElement, reducedMotion: boolean) => {
 const scrollParent = getScrollParent(target);
 const behavior: ScrollBehavior = reducedMotion ?'auto' :'smooth';
 const documentScroller = getDocumentScroller();
 const isDocumentScroller = scrollParent === documentScroller
 || scrollParent === document.documentElement
 || scrollParent === document.body;
 const targetRect = target.getBoundingClientRect();
 const parentRect = isDocumentScroller
 ? { top: 0, height: window.innerHeight }
 : scrollParent.getBoundingClientRect();
 const desiredTop = parentRect.top + Math.min(
 Math.max(96, parentRect.height * 0.18),
 Math.max(96, parentRect.height - 280),
 );
 const delta = targetRect.top - desiredTop;

 if (Math.abs(delta) < 4) return;

 if (isDocumentScroller) {
 window.scrollBy({
 top: delta,
 left: 0,
 behavior,
 });
 return;
 }

 scrollParent.scrollBy({
 top: delta,
 left: 0,
 behavior,
 });
};

const focusGuidanceTarget = (target: HTMLElement) => {
 const hadTabIndex = target.hasAttribute('tabindex');
 const previousTabIndex = target.getAttribute('tabindex');
 const needsTemporaryTabIndex = !target.matches(focusableTargetSelector);

 if (needsTemporaryTabIndex) {
 target.setAttribute('tabindex','-1');
 }

 target.classList.add('page-guidance-focus-target');
 target.setAttribute('data-guidance-focused','true');

 try {
 target.focus({ preventScroll: true });
 } catch {
 target.focus();
 }

 return () => {
 target.classList.remove('page-guidance-focus-target');
 target.removeAttribute('data-guidance-focused');

 if (!needsTemporaryTabIndex) return;
 if (hadTabIndex && previousTabIndex !== null) {
 target.setAttribute('tabindex', previousTabIndex);
 return;
 }
 target.removeAttribute('tabindex');
 };
};

const buildFallbackSteps = (content: PageGuidanceContent): GuidedTourStep[] => [
 ...content.primaryActions.map((action) => ({
 title:`شرح: ${action}`,
 body:`الجولة ستحاول التركيز على "${action}" داخل الصفحة. استخدم هذا الجزء عندما تكون البيانات المطلوبة جاهزة، وراجع ما يظهر حوله قبل المتابعة.`,
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
 const [isOpen, setIsOpen] = useState(() => !getDismissedValue(dismissStorageKey));
 const [activeStepIndex, setActiveStepIndex] = useState(0);
 const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);

 const activeStep = steps[Math.min(activeStepIndex, steps.length - 1)];
 const isFirstStep = activeStepIndex <= 0;
 const isLastStep = activeStepIndex >= steps.length - 1;

 useEffect(() => {
 setIsOpen(!getDismissedValue(dismissStorageKey));
 setActiveStepIndex(0);
 setSpotlightRect(null);
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

 const updateSpotlight = useCallback(() => {
 if (!isOpen || !activeStep || typeof document ==='undefined') {
 setSpotlightRect(null);
 return;
 }

 const target = findTargetElement(activeStep);
 if (!target) {
 setSpotlightRect(null);
 return;
 }

 const rect = target.getBoundingClientRect();
 setSpotlightRect({
 top: rect.top,
 left: rect.left,
 width: rect.width,
 height: rect.height,
 label: getElementLabel(target) || activeStep.title,
 placement: rect.top < window.innerHeight * 0.48 ?'target-upper' :'target-lower',
 });
 }, [activeStep, isOpen]);

 useEffect(() => {
 if (!isOpen || !activeStep || typeof document ==='undefined') return;

 const target = findTargetElement(activeStep);
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let cleanupTargetFocus: (() => void) | undefined;

 if (target) {
 scrollTargetToGuidePosition(target, reducedMotion);
 }

 const frame = window.setTimeout(() => {
 if (target) {
 scrollTargetToGuidePosition(target, reducedMotion);
 }
 updateSpotlight();
 if (target) {
 cleanupTargetFocus = focusGuidanceTarget(target);
 }
 }, target ? 360 : 0);
 const followUpFrame = window.setTimeout(() => {
 if (target) {
 scrollTargetToGuidePosition(target, reducedMotion);
 }
 updateSpotlight();
 }, target ? 760 : 0);
 window.addEventListener('resize', updateSpotlight);
 window.addEventListener('scroll', updateSpotlight, true);

 return () => {
 window.clearTimeout(frame);
 window.clearTimeout(followUpFrame);
 cleanupTargetFocus?.();
 window.removeEventListener('resize', updateSpotlight);
 window.removeEventListener('scroll', updateSpotlight, true);
 };
 }, [activeStep, isOpen, updateSpotlight]);

 const closeForNow = () => {
 setIsOpen(false);
 };

 const dismissPermanently = () => {
 setDismissedValue(dismissStorageKey);
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

 if (!isOpen || !activeStep || typeof document ==='undefined') return null;

 const rootClassName = [
 'page-guidance-overlay',
 spotlightRect ? `page-guidance-overlay--${spotlightRect.placement}` :'',
 className,
 ].filter(Boolean).join(' ');
 const hasTarget = Boolean(spotlightRect);
 const aiGuidance = activeStep.tone ==='ai' ? content.ai : undefined;

 return createPortal(
 <div className={rootClassName} role="presentation" onClick={closeForNow}>
 {spotlightRect ? (
 <div
 className="page-guidance-spotlight"
 aria-hidden="true"
 style={{
 '--guide-x': `${spotlightRect.left - 8}px`,
 '--guide-y': `${spotlightRect.top - 8}px`,
 '--guide-w': `${spotlightRect.width + 16}px`,
 '--guide-h': `${spotlightRect.height + 16}px`,
 } as CSSProperties}
 />
 ) : null}

 <div
 className={`page-guidance-dialog ${hasTarget ?'page-guidance-dialog--with-target' :''}`}
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
 {hasTarget ? (
 <span className="page-guidance-dialog__target-label">
 <LocateFixed size={14} aria-hidden="true" />
 يتم شرح: {spotlightRect?.label}
 </span>
 ) : (
 <span className="page-guidance-dialog__target-label page-guidance-dialog__target-label--muted">
 يظهر الشرح حتى لو لم يكن الزر متاحا الآن
 </span>
 )}
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
