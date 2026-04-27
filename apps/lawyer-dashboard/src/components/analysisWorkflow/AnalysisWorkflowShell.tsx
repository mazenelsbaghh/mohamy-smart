import'./AnalysisWorkflow.css';
import { LuCheck } from'react-icons/lu';

export type AnalysisWorkflowStep = {
 id: number;
 label: string;
 hint?: string;
};

type TAnalysisWorkflowShell = {
 title: string;
 eyebrow?: string;
 description: string;
 steps: AnalysisWorkflowStep[];
 activeStep: number;
 onStepClick?: (step: number) => void;
 sideTitle?: string;
 sideDescription?: string;
 sideBadge?: string;
 sideMeta?: string[];
 children: React.ReactNode;
};

const AnalysisWorkflowShell = ({
 steps,
 activeStep,
 onStepClick,
 children,
}: TAnalysisWorkflowShell) => {
 return (
 <section
 className="analysis-workflow-shell"
 style={{ ['--analysis-steps-count' as string]: steps.length }}
 >
 <nav className="analysis-workflow-shell__steps" aria-label="مراحل إنشاء المذكرة">
 <div className="analysis-workflow-shell__steps-track" />
 {steps.map((step, index) => {
 const isActive = index === activeStep;
 const isCompleted = index < activeStep;
 const isClickable = !!onStepClick && index <= activeStep;

 return (
 <button
 key={step.id}
 type="button"
 className={`analysis-workflow-shell__step ${isActive ?'is-active' :''} ${isCompleted ?'is-completed' :''}`}
 onClick={() => isClickable && onStepClick(index)}
 disabled={!isClickable}
 >
 <span className="analysis-workflow-shell__step-index">
 {isCompleted ? <LuCheck size={14} /> : step.id}
 </span>
 <span className="analysis-workflow-shell__step-copy">
 <strong>{step.label}</strong>
 {step.hint && <small>{step.hint}</small>}
 </span>
 </button>
 );
 })}
 </nav>

 <div className="analysis-workflow-shell__content">
 {children}
 </div>
 </section>
 );
};

export default AnalysisWorkflowShell;
