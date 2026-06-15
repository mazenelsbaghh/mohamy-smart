import React, { useMemo } from 'react';
import {
  IoStopOutline,
  IoArrowBackOutline,
  IoCheckmarkCircle,
  IoInformationCircleOutline,
  IoSparklesOutline,
  IoCloseCircle,
} from 'react-icons/io5';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { Button, Progress } from '@heroui/react';

interface AutoRunProgressOverlayProps {
  steps: Array<{ label: string; icon: React.ReactNode }>;
  activeStep: number; // 1-based, the currently processing step
  maxSteps: number;
  completedSteps: Set<number> | number[]; // steps that have completed (1-based)
  failedStep?: number | null; // if a step failed
  onStop: () => void;
  isComplete?: boolean; // all steps done
  onViewResults?: () => void; // navigate to last step's results
}

/**
 * Full-card progress view displayed in place of tab content during auto-run.
 * Mirrors the SmartAnalysisLoader visual language but with determinate progress,
 * real step names, and completion / failure states.
 */
export const AutoRunProgressOverlay: React.FC<AutoRunProgressOverlayProps> = ({
  steps,
  activeStep,
  maxSteps,
  completedSteps: completedStepsProp,
  failedStep = null,
  onStop,
  isComplete = false,
  onViewResults,
}) => {
  // Normalise completedSteps to a Set for O(1) lookups
  const completedSet = useMemo<Set<number>>(
    () =>
      completedStepsProp instanceof Set
        ? completedStepsProp
        : new Set(completedStepsProp),
    [completedStepsProp],
  );

  const completedCount = completedSet.size;
  const progressValue = maxSteps > 0 ? (completedCount / maxSteps) * 100 : 0;

  const hasFailed = failedStep != null;

  // --------------- Title / Subtitle resolution ---------------
  const title = hasFailed
    ? `توقف المسار عند خطوة ${failedStep}`
    : isComplete
      ? 'اكتمل المسار بنجاح!'
      : 'جاري تنفيذ المسار تلقائياً...';

  const subtitle = hasFailed
    ? 'يمكنك إعادة تشغيل الخطوة يدوياً'
    : isComplete
      ? 'تم تنفيذ جميع الخطوات بنجاح. يمكنك الآن مراجعة النتائج.'
      : 'يتم الآن تنفيذ جميع الخطوات تلقائياً. يمكنك الانتظار أو إغلاق الصفحة والعودة لاحقاً.';

  // --------------- Badge styling ---------------
  const badgeClass = hasFailed
    ? 'text-[var(--danger-color)] bg-red-50 dark:bg-red-950/30'
    : isComplete
      ? 'text-[var(--success-color)] bg-emerald-50 dark:bg-emerald-950/30'
      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30';

  const badgeLabel = hasFailed
    ? 'فشل التشغيل التلقائي'
    : isComplete
      ? 'اكتملت المعالجة'
      : 'المعالجة التلقائية نشطة';

  // --------------- Helpers ---------------
  const stepStatus = (stepNumber: number) => {
    if (completedSet.has(stepNumber)) return 'completed' as const;
    if (hasFailed && stepNumber === failedStep) return 'failed' as const;
    if (stepNumber === activeStep && !isComplete && !hasFailed) return 'active' as const;
    return 'pending' as const;
  };

  return (
    <div
      className="w-full flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden min-h-[500px] border app-border shadow-sm app-surface rounded-2xl"
      dir="rtl"
    >
      {/* ── Safe-navigation banner ── */}
      {!isComplete && !hasFailed && (
        <div
          role="status"
          className="w-full max-w-5xl mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60"
        >
          <IoInformationCircleOutline className="text-blue-600 dark:text-blue-300 text-2xl shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed m-0">
            يستمر التحليل في الخلفية — يمكنك التنقل أو إغلاق الصفحة وسنكمل التحليل تلقائياً.
          </p>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* ─── Right side: process info ─── */}
        <div className="lg:col-span-6 flex flex-col gap-8 order-2 lg:order-1 text-start">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <span
              className={`font-semibold text-xs tracking-wide px-4 py-1.5 rounded-full w-fit ${badgeClass}`}
            >
              {badgeLabel}
            </span>

            <h2 className="text-2xl md:text-3xl font-bold text-[var(--title-color)] leading-tight">
              {title}
            </h2>

            <p className="app-text-muted text-sm mt-1 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl app-accent-soft flex items-center justify-center shrink-0">
                {isComplete ? (
                  <IoCheckmarkCircle className="text-[var(--success-color)] text-xl" />
                ) : hasFailed ? (
                  <IoCloseCircle className="text-[var(--danger-color)] text-xl" />
                ) : (
                  <IoSparklesOutline className="text-[var(--main-color)] text-xl animate-pulse motion-reduce:animate-none" />
                )}
              </div>

              <div className="flex flex-col flex-1 gap-2">
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-semibold text-[var(--title-color)]">
                    {isComplete
                      ? 'اكتمل التنفيذ'
                      : hasFailed
                        ? 'توقف التنفيذ'
                        : 'جاري التنفيذ...'}
                  </span>
                  <span className="text-[10px] app-text-muted font-medium">
                    {completedCount}/{maxSteps}
                  </span>
                </div>

                <Progress
                  size="sm"
                  value={progressValue}
                  color={hasFailed ? 'danger' : isComplete ? 'success' : 'primary'}
                  aria-label="تقدم التشغيل التلقائي"
                  className="w-full"
                  classNames={{
                    indicator: hasFailed
                      ? 'bg-[var(--danger-color)]'
                      : isComplete
                        ? 'bg-[var(--success-color)]'
                        : 'bg-[var(--main-color)]',
                    track: 'app-surface-muted',
                  }}
                />
              </div>
            </div>

            {/* Step checklist */}
            <div className="flex flex-col gap-4 mt-4 pe-2">
              {steps.map((step, idx) => {
                const stepNum = idx + 1; // 1-based
                const status = stepStatus(stepNum);

                const isCompleted = status === 'completed';
                const isActive = status === 'active';
                const isFailed = status === 'failed';
                const isPending = status === 'pending';

                // Circle colour
                const circleClass = isCompleted
                  ? 'bg-[var(--success-color)] text-white'
                  : isActive
                    ? 'app-accent-soft'
                    : isFailed
                      ? 'bg-[var(--danger-color)] text-white'
                      : 'app-surface-muted';

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}
                  >
                    {/* Status circle */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${circleClass}`}
                    >
                      {isCompleted && (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-[var(--main-color)] animate-pulse motion-reduce:animate-none" />
                      )}
                      {isFailed && (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      {isPending && (
                        <div className="w-1.5 h-1.5 rounded-full app-text-subtle" />
                      )}
                    </div>

                    {/* Step icon */}
                    <span
                      className={`text-base shrink-0 ${
                        isPending
                          ? 'app-text-muted dark:text-white/70'
                          : isFailed
                            ? 'text-[var(--danger-color)]'
                            : 'text-[var(--title-color)] dark:text-white'
                      }`}
                    >
                      {step.icon}
                    </span>

                    {/* Label */}
                    <span
                      className={`text-sm font-medium ${
                        isPending
                          ? 'app-text-muted dark:text-white/70'
                          : isFailed
                            ? 'text-[var(--danger-color)]'
                            : 'text-[var(--title-color)] dark:text-white'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-2">
            {!isComplete && !hasFailed && (
              <Button
                color="default"
                variant="flat"
                onPress={onStop}
                size="lg"
                className="font-tajawal font-medium px-8"
                startContent={<IoStopOutline className="text-lg" />}
              >
                إيقاف التشغيل التلقائي
              </Button>
            )}

            {hasFailed && (
              <Button
                color="danger"
                variant="flat"
                onPress={onStop}
                size="lg"
                className="font-tajawal font-medium px-8"
                startContent={<IoStopOutline className="text-lg" />}
              >
                إيقاف التشغيل التلقائي
              </Button>
            )}

            {isComplete && onViewResults && (
              <Button
                color="primary"
                variant="flat"
                onPress={onViewResults}
                size="lg"
                className="font-tajawal font-medium px-8"
                startContent={<IoArrowBackOutline className="text-lg" />}
              >
                عرض النتائج
              </Button>
            )}
          </div>
        </div>

        {/* ─── Left side: illustration ─── */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center lg:justify-end w-full">
          {isComplete ? (
            /* ── Success illustration ── */
            <div className="flex flex-col items-center gap-5">
              <div className="w-32 h-32 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-700/50 flex items-center justify-center">
                <IoCheckmarkCircle className="text-[var(--success-color)] text-6xl" />
              </div>
              <span className="text-sm font-semibold text-[var(--success-color)]">
                تم تنفيذ جميع الخطوات
              </span>
            </div>
          ) : hasFailed ? (
            /* ── Failure illustration ── */
            <div className="flex flex-col items-center gap-5">
              <div className="w-32 h-32 rounded-full bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-700/50 flex items-center justify-center">
                <IoCloseCircle className="text-[var(--danger-color)] text-6xl" />
              </div>
              <span className="text-sm font-semibold text-[var(--danger-color)]">
                فشل في الخطوة {failedStep}
              </span>
            </div>
          ) : (
            /* ── Document skeleton (same as SmartAnalysisLoader) ── */
            <div className="relative app-surface rounded-xl shadow-lg p-6 w-full max-w-[340px] border app-border overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent animate-[shimmer_2s_infinite] motion-reduce:animate-none pointer-events-none z-10" />

              {/* Mock Document Header */}
              <div className="flex justify-between items-center border-b app-border-strong pb-4 mb-6">
                <div className="h-3 w-24 app-surface-muted rounded-full" />
                <div className="h-3 w-12 app-surface-muted rounded-full" />
              </div>

              {/* Mock Document Body */}
              <div className="space-y-4">
                <div className="h-2.5 w-full app-surface-soft rounded-full" />
                <div className="h-2.5 w-[90%] app-surface-soft rounded-full" />
                <div className="h-2.5 w-[80%] app-surface-soft rounded-full" />
              </div>

              <div className="h-28 w-full app-surface-soft rounded-xl flex items-center justify-center my-8 border app-border border-dashed">
                <IoDocumentTextOutline className="text-2xl app-text-subtle opacity-50" />
              </div>

              <div className="space-y-4">
                <div className="h-2.5 w-full app-surface-soft rounded-full" />
                <div className="h-2.5 w-full app-surface-soft rounded-full" />
                <div className="h-2.5 w-[75%] app-surface-soft rounded-full" />
              </div>

              {/* Tag Chips */}
              <div className="flex gap-2 mt-8 pt-4 border-t app-border-strong">
                <div className="h-6 w-20 app-accent-soft rounded-full" />
                <div className="h-6 w-24 app-accent-soft rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shimmer keyframes (same as SmartAnalysisLoader) */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
