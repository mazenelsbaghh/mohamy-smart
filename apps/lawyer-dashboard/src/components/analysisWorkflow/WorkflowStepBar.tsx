import { AutoSaveButton } from'./AutoSaveButton';
import { useNavigate, useParams } from'react-router-dom';
import { IoArrowBackOutline } from'react-icons/io5';

type Step = { label: string };

type WorkflowStepBarProps = {
 steps: Step[];
 active: number; // 0-based
 workflowTitle?: string;
 isAutoSaving: boolean;
 autoSaveError: string | null;
 lastSavedAt: string | null;
 onManualSave: () => void;
 isSavingStep: boolean;
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
}: WorkflowStepBarProps) => {
 const { id } = useParams();
 const navigate = useNavigate();
 const currentLabel = steps[active]?.label ??'';
 const total = steps.length;
 const humanStep = active + 1;

 return (
 <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 app-surface border app-border dark:app-border-strong rounded-xl shadow-sm overflow-x-auto">
 {/* Step indicator */}
 <div className="flex items-center gap-2 sm:gap-3 min-w-0">
 {/* Step dots */}
 <div className="flex items-center gap-1 shrink-0 hidden sm:flex">
 {steps.map((_, idx) => {
 const done = idx < active;
 const current = idx === active;
 return (
 <span
 key={idx}
 className={`rounded-full transition-colors duration-300 ${
 current
 ?'w-4 h-2 bg-[var(--main-color)]'
 : done
 ?'w-2 h-2 bg-[var(--main-color)] opacity-40'
 :'w-2 h-2 app-surface-muted dark:app-surface-soft'
 }`}
 />
 );
 })}
 </div>

 {/* Step text */}
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

 {/* Right side: return button + workflow title + save status */}
 <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
