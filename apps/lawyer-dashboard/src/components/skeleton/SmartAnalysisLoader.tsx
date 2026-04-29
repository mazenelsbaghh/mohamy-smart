import React from 'react';
import { IoAlertCircleOutline, IoDocumentTextOutline, IoInformationCircleOutline, IoSparklesOutline } from 'react-icons/io5';
import { Button, Progress } from "@heroui/react";

export type LoaderStage = {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'done';
};

interface SmartAnalysisLoaderProps {
    title?: string;
    subtitle?: string;
    steps?: string[];
    activeStepIndex?: number;
    stages?: LoaderStage[];
    showSafeNavigateBanner?: boolean;
    runId?: string | number | null;
    stageNumber?: number;
    hasConflict?: boolean;
    conflictMessage?: string;
    onRetry?: () => void;
    onReload?: () => void;
    jobStatus?: 'Queued' | 'Processing' | 'Completed' | 'Failed';
}

const SmartAnalysisLoader: React.FC<SmartAnalysisLoaderProps> = ({
    title = 'يتم الآن تحليل البيانات وإعداد المستند...',
    subtitle = 'يعمل المحرك الذكي على معالجة المعطيات القانونية ومطابقتها مع الأنظمة والسوابق القضائية لضمان أعلى جودة.',
    steps = ['تحليل وتصنيف البيانات الأولية', 'معالجة وصياغة المحتوى', 'المراجعة والتدقيق النهائي'],
    activeStepIndex = 1,
    stages,
    showSafeNavigateBanner = true,
    hasConflict,
    conflictMessage = 'حدث تعارض في تحديث سير العمل. يرجى إعادة المحاولة.',
    onRetry,
    onReload,
    jobStatus,
}) => {
    const useStages = Array.isArray(stages) && stages.length > 0;

    if (jobStatus === 'Failed' || (hasConflict && jobStatus !== 'Queued' && jobStatus !== 'Processing')) {
        return (
            <div className="w-full flex-1 flex flex-col items-center justify-center p-8 lg:p-12 min-h-[500px] border app-border shadow-sm app-surface rounded-2xl" dir="rtl">
                <IoAlertCircleOutline className="w-16 h-16 text-danger mb-4" />
                <h2 className="text-2xl font-bold text-danger mb-2">
                    {hasConflict ? 'حدث تعارض' : 'فشل التحليل'}
                </h2>
                <p className="text-sm app-text-muted mb-6 max-w-md text-center">
                    {conflictMessage || 'تعذّر إكمال التحليل بعد إعادة التحميل. يرجى إعادة المحاولة.'}
                </p>
                <div className="flex gap-3">
                    {onRetry && (
                        <Button color="primary" variant="flat" onPress={onRetry} size="lg" className="font-tajawal font-medium px-8">
                            إعادة المحاولة
                        </Button>
                    )}
                    {onReload && (
                        <Button color="default" variant="flat" onPress={onReload} size="lg" className="font-tajawal font-medium px-8">
                            إعادة التحميل
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    const displayTitle = hasConflict && jobStatus === 'Queued'
        ? 'جاري إعادة الاتصال بالتحليل...'
        : steps[activeStepIndex] || title;
    const displaySubtitle = hasConflict && jobStatus === 'Queued'
        ? 'يتم الآن إعادة الاتصال بالتحليل السابق. يرجى الانتظار...'
        : subtitle;
    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden min-h-[500px] border app-border shadow-sm app-surface rounded-2xl" dir="rtl">
            {showSafeNavigateBanner && (
                <div
                    role="status"
                    className="w-full max-w-5xl mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60"
                >
                    <IoInformationCircleOutline className="text-blue-600 dark:text-blue-300 text-2xl shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed m-0">
                        يستمر التحليل في الخلفية — يمكنك التنقل بأمان وسننبهك عند الاكتمال.
                    </p>
                </div>
            )}
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                {/* Right Side (Content): Process Information */}
                <div className="lg:col-span-6 flex flex-col gap-8 order-2 lg:order-1 text-start">
                    <div className="flex flex-col gap-3">
                        <span className="text-[var(--main-color)] font-semibold text-xs tracking-wide app-accent-soft px-4 py-1.5 rounded-full w-fit">
                            المعالجة الذكية نشطة
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--title-color)] leading-tight">
                            {displayTitle}
                        </h2>
                        <p className="app-text-muted text-sm mt-1 leading-relaxed">
                            {displaySubtitle}
                        </p>
                    </div>

                    {/* Clean Progress Indicator */}
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl app-accent-soft flex items-center justify-center shrink-0">
                                <IoSparklesOutline className="text-[var(--main-color)] text-xl animate-pulse" />
                            </div>
                            <div className="flex flex-col flex-1 gap-2">
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-sm font-semibold text-[var(--title-color)]">جاري التنفيذ...</span>
                                    <span className="text-[10px] app-text-muted font-medium">الرجاء الانتظار</span>
                                </div>
                                <Progress 
                                    size="sm"
                                    isIndeterminate={true}
                                    color="primary"
                                    className="w-full"
                                    classNames={{
                                        indicator: "bg-[var(--main-color)]",
                                        track: "app-surface-muted"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Status Checklist */}
                        <div className="flex flex-col gap-4 mt-4 pe-2">
                            {useStages
                                ? stages!.map((stage) => {
                                    const isCompleted = stage.status === 'done';
                                    const isActive = stage.status === 'active';
                                    const isPending = stage.status === 'pending';
                                    return (
                                        <div key={stage.id} className={`flex items-center gap-3 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-[var(--success-color)] text-white' : isActive ? 'app-accent-soft' : 'app-surface-muted'}`}>
                                                {isCompleted && (
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                                {isActive && <div className="w-2 h-2 rounded-full bg-[var(--main-color)] animate-pulse" />}
                                                {isPending && <div className="w-1.5 h-1.5 rounded-full app-text-subtle" />}
                                            </div>
                                            <span className={`text-sm font-medium ${isPending ? "app-text-muted dark:text-white/70" : "text-[var(--title-color)] dark:text-white"}`}>
                                                {stage.label}
                                            </span>
                                        </div>
                                    );
                                })
                                : steps.map((step, index) => {
                                    const isCompleted = index < activeStepIndex;
                                    const isActive = index === activeStepIndex;
                                    const isPending = index > activeStepIndex;
                                    return (
                                        <div key={index} className={`flex items-center gap-3 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-[var(--success-color)] text-white' : isActive ? 'app-accent-soft' : 'app-surface-muted'}`}>
                                                {isCompleted && (
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                                {isActive && <div className="w-2 h-2 rounded-full bg-[var(--main-color)] animate-pulse" />}
                                                {isPending && <div className="w-1.5 h-1.5 rounded-full app-text-subtle" />}
                                            </div>
                                            <span className={`text-sm font-medium ${isPending ? "app-text-muted dark:text-white/70" : "text-[var(--title-color)] dark:text-white"}`}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Left Side (Document): Clean Skeleton */}
                <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center lg:justify-end w-full">
                    <div className="relative app-surface rounded-xl shadow-lg p-6 w-full max-w-[340px] border app-border overflow-hidden">
                        
                        {/* Shimmer effect over the whole card */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent animate-[shimmer_2s_infinite] pointer-events-none z-10" />

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
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default SmartAnalysisLoader;
