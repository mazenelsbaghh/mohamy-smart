import { useState, useEffect, useCallback } from'react';
import { IoCloudUploadOutline, IoCheckmarkCircle, IoAlertCircleOutline, IoCloudDoneOutline } from'react-icons/io5';

type AutoSaveButtonProps = {
 isAutoSaving: boolean;
 autoSaveError: string | null;
 lastSavedAt: string | null;
 onManualSave: () => void;
 isSavingStep: boolean;
};

type SaveState ='default' |'saving' |'saved' |'failed';

export const AutoSaveButton = ({
 isAutoSaving,
 autoSaveError,
 lastSavedAt,
 onManualSave,
 isSavingStep,
}: AutoSaveButtonProps) => {
 const [displayState, setDisplayState] = useState<SaveState>('default');

 useEffect(() => {
 if (isAutoSaving || isSavingStep) {
 setDisplayState('saving');
 return;
 }
 if (autoSaveError) {
 setDisplayState('failed');
 const t = setTimeout(() => setDisplayState('default'), 3000);
 return () => clearTimeout(t);
 }
 if (displayState ==='saving' && !isAutoSaving && !isSavingStep && !autoSaveError) {
 setDisplayState('saved');
 const t = setTimeout(() => setDisplayState('default'), 2000);
 return () => clearTimeout(t);
 }
 }, [isAutoSaving, autoSaveError, isSavingStep, displayState]);

 useEffect(() => {
 if (lastSavedAt && displayState ==='default') {
 setDisplayState('saved');
 const t = setTimeout(() => setDisplayState('default'), 2000);
 return () => clearTimeout(t);
 }
 }, [lastSavedAt, displayState]);

 const handleClick = useCallback(() => {
 if (displayState ==='saving') return;
 onManualSave();
 }, [displayState, onManualSave]);

 const config = {
 default: {
 icon: <IoCloudUploadOutline className="text-base shrink-0" />,
 label:'حفظ',
 className:'app-text-subtle bg-white app-border-strong hover:border-[var(--main-color)] hover:text-[var(--main-color)]',
 },
 saving: {
 icon: (
 <svg className="animate-spin text-[var(--main-color)] shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
 </svg>
 ),
 label:'جاري الحفظ التلقائي',
 className:'text-[var(--main-color)] bg-orange-50 border-orange-200 cursor-default',
 },
 saved: {
 icon: <IoCheckmarkCircle className="text-base text-[var(--success-color)] shrink-0" />,
 label:'تم الحفظ',
 className:'text-[var(--success-color)] bg-[var(--success-soft)] border-[var(--success-soft)] cursor-default',
 },
 failed: {
 icon: <IoAlertCircleOutline className="text-base text-[var(--danger-color)] shrink-0" />,
 label:'فشل الحفظ، انقر للمحاولة مجدداً',
 className:'text-[var(--danger-color)] bg-[var(--danger-soft)] border-[var(--danger-soft)] hover:bg-[var(--danger-soft)]',
 },
 }[displayState];

 // When saved and we have a timestamp, show the time
 const savedTime = displayState ==='default' && lastSavedAt
 ? new Date(lastSavedAt).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' })
 : null;

 if (savedTime) {
 return (
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold app-text-subtle bg-transparent select-none">
 <IoCloudDoneOutline className="text-sm app-text-subtle shrink-0" />
 آخر حفظ {savedTime}
 </span>
 );
 }

 return (
 <button
 type="button"
 onClick={handleClick}
 disabled={displayState ==='saving' || displayState ==='saved'}
 aria-label={config.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors duration-200 select-none font-tajawal ${config.className}`}

 >
 {config.icon}
 <span>{config.label}</span>
 </button>
 );
};
