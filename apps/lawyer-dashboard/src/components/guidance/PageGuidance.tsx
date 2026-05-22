import { useCallback, useEffect, useId, useMemo, useState } from'react';
import { createPortal } from'react-dom';
import {
 BookOpenCheck,
 CheckCircle2,
 ChevronLeft,
 ChevronRight,
 CirclePlay,
 EyeOff,
 Info,
 ShieldCheck,
 Sparkles,
 X,
} from'lucide-react';
import type { GuidedTourStep, PageGuidanceContent } from'./guidanceContent';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import thunkDismissGuidance from '../../redux/auth/thunk/thunkDismissGuidance';
import'./PageGuidance.css';

const YOUTUBE_VIDEO_ID = 'RLO_qRNAu0s';

type PageGuidanceProps = {
 content: PageGuidanceContent;
 className?: string;
};

const buildGuidanceVideoUrl = (start: number, end?: number) => {
 const params = new URLSearchParams({
 start: String(start),
 rel: '0',
 modestbranding: '1',
 });

 if (end) {
 params.set('end', String(end));
 }

 return `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?${params.toString()}`;
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

const getSessionClosedValue = (key: string) => {
 try {
 if (sessionStorage.getItem(key) === 'true') return true;
 } catch {
 // Session storage is optional UI state.
 }
 return false;
};

const setSessionClosedValue = (key: string, value: boolean) => {
 try {
 if (value) {
 sessionStorage.setItem(key, 'true');
 } else {
 sessionStorage.removeItem(key);
 }
 } catch {
 // Ignore browser storage failures.
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
 const dispatch = useAppDispatch();
 const user = useAppSelector((state) => state.auth.user);
 const titleId = useId();
 const descriptionId = useId();
 const dismissStorageKey = useMemo(() => `mohamy:page-guidance:${content.key}:dismissed`, [content.key]);
 const sessionClosedKey = useMemo(() => `${dismissStorageKey}:closed`, [dismissStorageKey]);
 const steps = useMemo(() => content.tourSteps?.length ? content.tourSteps : buildFallbackSteps(content), [content]);
 const videoUrl = useMemo(
 () => content.video ? buildGuidanceVideoUrl(content.video.start, content.video.end) : undefined,
 [content.video]
 );
 
 const [isDismissed, setIsDismissed] = useState(() => {
   const local = getDismissedValue(dismissStorageKey);
   const server = user?.dismissedGuidanceKeys?.includes(content.key) ?? false;
   return local || server;
 });
 
 const [isOpen, setIsOpen] = useState(() => {
   const local = getDismissedValue(dismissStorageKey);
   const server = user?.dismissedGuidanceKeys?.includes(content.key) ?? false;
   return !local && !server && !getSessionClosedValue(sessionClosedKey);
 });
 
 const [activeStepIndex, setActiveStepIndex] = useState(0);

 const activeStep = steps[Math.min(activeStepIndex, steps.length - 1)];
 const isFirstStep = activeStepIndex <= 0;
 const isLastStep = activeStepIndex >= steps.length - 1;

 useEffect(() => {
 const dismissed = getDismissedValue(dismissStorageKey) || (user?.dismissedGuidanceKeys?.includes(content.key) ?? false);
 const sessionClosed = getSessionClosedValue(sessionClosedKey);
 setIsDismissed(dismissed);
 setIsOpen(!dismissed && !sessionClosed);
 setActiveStepIndex(0);
 }, [dismissStorageKey, sessionClosedKey, user?.dismissedGuidanceKeys, content.key]);

 const closeForNow = useCallback(() => {
 setSessionClosedValue(sessionClosedKey, true);
 setIsOpen(false);
 }, [sessionClosedKey]);

 const dismissPermanently = useCallback(() => {
 setDismissedValue(dismissStorageKey);
 setIsDismissed(true);
 setIsOpen(false);
 if (user) {
   dispatch(thunkDismissGuidance(content.key));
 }
 }, [dismissStorageKey, user, content.key, dispatch]);

 useEffect(() => {
 if (!isOpen) return;

 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.key ==='Escape') {
 closeForNow();
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
 }, [isOpen, steps.length, closeForNow]);

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

 if (typeof document ==='undefined') return null;

 if (isDismissed || !isOpen) {
 return createPortal(
 <button
 type="button"
 className="page-guidance-launcher"
 onClick={() => {
 setSessionClosedValue(sessionClosedKey, false);
 setIsDismissed(false);
 setIsOpen(true);
 }}
 aria-label={content.video ?'فتح فيديو شرح الصفحة' :'فتح إرشاد الصفحة'}
 >
 <CirclePlay size={18} aria-hidden="true" />
 <span>{content.video ?'فيديو الصفحة' :'إرشاد الصفحة'}</span>
 </button>,
 document.body
 );
 }

 if (!activeStep) return null;

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
 {content.video && videoUrl ? (
 <section className="page-guidance-dialog__video" aria-labelledby={`${titleId}-video`}>
 <div className="page-guidance-dialog__video-header">
 <h3 id={`${titleId}-video`}>{content.video.title}</h3>
 <span>فيديو الصفحة</span>
 </div>
 <div className="page-guidance-dialog__video-frame">
 <iframe
 src={videoUrl}
 title={content.video.title}
 loading="lazy"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
 referrerPolicy="strict-origin-when-cross-origin"
 allowFullScreen
 />
 </div>
 </section>
 ) : null}

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
