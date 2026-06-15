import { useEffect, useState } from 'react';
import { AutoSaveButton } from './AutoSaveButton';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IoArrowBackOutline, IoStopOutline } from 'react-icons/io5';

type Step = { label: string };

type WorkflowStepBarProps = {
 steps: Step[];
 active: number;
 workflowTitle?: string;
 isAutoSaving: boolean;
 autoSaveError: string | null;
 lastSavedAt: string | null;
 onManualSave: () => void;
 isSavingStep: boolean;
 currentAccessibleStep?: number;
 lastCompletedStep?: number;
 stageConflicts?: { stepNumber: number }[];
 isAutoRunning?: boolean;
 onStopAutoRun?: () => void;
 justFinishedAutoRun?: boolean;
};

const WorkflowStepBar = ({
  steps,
  active,
  workflowTitle,
  isAutoSaving,
  autoSaveError,
  lastSavedAt,
  onManualSave,
 isSavingStep,
 currentAccessibleStep,
 lastCompletedStep,
 stageConflicts,
 isAutoRunning = false,
 onStopAutoRun,
 justFinishedAutoRun = false,
}: WorkflowStepBarProps) => {
 const { id } = useParams();
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const currentLabel = steps[active]?.label ??'';
 const total = steps.length;
 const humanStep = active + 1;
 const hasConflicts = Array.isArray(stageConflicts) && stageConflicts.length > 0;

  // Auto-dismiss success badge after 3 seconds
  const [showFinishedBadge, setShowFinishedBadge] = useState(false);
  useEffect(() => {
    if (justFinishedAutoRun) {
      setShowFinishedBadge(true);
      const timer = setTimeout(() => setShowFinishedBadge(false), 3000);
      return () => clearTimeout(timer);
    }
    setShowFinishedBadge(false);
  }, [justFinishedAutoRun]);

  const resolvedRunStatus = searchParams.get('fresh') === '1'
    ? 'new' as const
    : searchParams.get('snapshot')
      ? (searchParams.get('editable') === '1' ? 'restored' as const : 'readonly' as const)
      : 'current' as const;

  const statusLabel: Record<string, { text: string; className: string }> = {
    current: {
      text: 'إصدار حالي',
      className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50',
    },
    new: {
      text: 'إصدار جديد',
      className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/50',
    },
    readonly: {
      text: 'عرض فقط — لقطة',
      className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/50',
    },
    restored: {
      text: 'نسخة مستعادة قابلة للتعديل',
      className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/50',
    },
  };

  const status = statusLabel[resolvedRunStatus] ?? statusLabel.current;

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 app-surface border app-border dark:app-border-strong rounded-xl shadow-sm overflow-x-auto">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1 shrink-0 hidden sm:flex">
          {steps.map((_, idx) => {
   const isCompleted = lastCompletedStep != null && idx > 0 && idx <= lastCompletedStep;
   const isCurrent = idx === active;
   const isLocked = currentAccessibleStep != null && idx > 0 && idx > currentAccessibleStep;
   const hasLifecycle = currentAccessibleStep != null || lastCompletedStep != null || hasConflicts;
            let dotStyle: string;

            if (isAutoRunning) {
              // Enhanced dots during auto-run
              if (idx < active) {
                dotStyle = 'w-2 h-2 bg-[var(--success-color)]';
              } else if (isCurrent) {
                dotStyle = 'w-5 h-2 bg-[var(--main-color)] animate-pulse';
              } else {
                dotStyle = 'w-2 h-2 app-surface-muted dark:app-surface-soft opacity-50';
              }
            } else if (isCurrent) {
              dotStyle = 'w-4 h-2 bg-[var(--main-color)]';
            } else if (hasLifecycle) {
              if (isCompleted) {
                dotStyle = 'w-2 h-2 bg-[var(--main-color)] opacity-60';
              } else if (isLocked) {
                dotStyle = 'w-2 h-2 bg-gray-300 dark:bg-gray-600';
              } else {
                dotStyle = 'w-2 h-2 app-surface-muted dark:app-surface-soft';
              }
            } else {
              dotStyle = idx < active
                ? 'w-2 h-2 bg-[var(--main-color)] opacity-40'
                : 'w-2 h-2 app-surface-muted dark:app-surface-soft';
            }
            return (
              <span
                key={idx}
                className={`rounded-full transition-colors duration-300 ${dotStyle}`}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-[var(--main-color)] dark:text-white shrink-0">
            {humanStep}/{total}
          </span>
          <span className="app-text-subtle shrink-0">·</span>
          <span className="text-xs sm:text-sm font-bold text-[var(--title-color)] truncate">
            {currentLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Auto-run live status badge */}
        {isAutoRunning && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            جاري التشغيل التلقائي
          </span>
        )}
        {isAutoRunning && onStopAutoRun && (
          <button
            type="button"
            onClick={onStopAutoRun}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-[var(--danger-color)] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <IoStopOutline className="text-sm" />
            إيقاف
          </button>
        )}
        {/* Auto-run finished badge */}
        {showFinishedBadge && !isAutoRunning && (
          <span
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50"
            style={{ animation: 'checkIn 0.3s ease-out' }}
          >
            ✓ اكتمل التشغيل التلقائي
          </span>
        )}
        <span className={`hidden sm:inline text-xs font-bold px-2.5 py-1 rounded-lg border ${status.className}`}>
          {status.text}
        </span>
        {id && (
          <button
            type="button"
            aria-label="عودة لملف القضية"
            onClick={() => navigate(`/cases/${id}`)}
            className="flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors app-surface text-[var(--title-color)] hover:app-surface-muted border app-border dark:app-border-strong hover:shadow-sm"
          >
            <IoArrowBackOutline className="text-base sm:text-sm" />
            <span className="hidden sm:inline">عودة للقضية</span>
          </button>
        )}
        {workflowTitle && (
          <span className="hidden sm:inline text-xs font-bold app-text-subtle dark:app-text-subtle border app-border-strong dark:app-border-strong rounded-lg px-2.5 py-1">
            {workflowTitle}
          </span>
        )}
        <AutoSaveButton
          isAutoSaving={isAutoSaving}
          autoSaveError={autoSaveError}
          lastSavedAt={lastSavedAt}
          onManualSave={onManualSave}
          isSavingStep={isSavingStep}
        />
      </div>
    </div>
  );
};

export default WorkflowStepBar;
