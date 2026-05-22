import type { AiJob, AiJobStatus, AiStepType } from './aiJobsSlice';

export type WorkflowStepMetadata = {
  workflowType: string;
  workflowId: string;
  stepNumber: number;
  progressLabel: string;
};

export const ACTIVE_AI_JOB_STATUSES: AiJobStatus[] = ['Queued', 'Processing'];

export const WORKFLOW_STEP_METADATA: Partial<Record<AiStepType, WorkflowStepMetadata>> = {
  FactAnalysis: {
    workflowType: 'SmartAnalysis',
    workflowId: 'defense-memo',
    stepNumber: 1,
    progressLabel: 'جاري تحميل الخطوة الأولى',
  },
  GenerateDefenses: {
    workflowType: 'SmartAnalysis',
    workflowId: 'defense-memo',
    stepNumber: 2,
    progressLabel: 'جاري تحميل الدفوع',
  },
  AnalysisDefense: {
    workflowType: 'SmartAnalysis',
    workflowId: 'defense-memo',
    stepNumber: 3,
    progressLabel: 'جاري تحليل دفع',
  },
  FinalRequirements: {
    workflowType: 'SmartAnalysis',
    workflowId: 'defense-memo',
    stepNumber: 4,
    progressLabel: 'جاري تحميل الطلبات',
  },
  DefenseMemoDraft: {
    workflowType: 'SmartAnalysis',
    workflowId: 'defense-memo',
    stepNumber: 5,
    progressLabel: 'جاري صياغة الدفوع وتجميع المذكرة النهائية',
  },

  LawsuitCaseType: {
    workflowType: 'preparing-statement-of-claims',
    workflowId: 'preparing-statement-of-claims',
    stepNumber: 1,
    progressLabel: 'جاري تحديد نوع الدعوى',
  },
  LawsuitParties: {
    workflowType: 'preparing-statement-of-claims',
    workflowId: 'preparing-statement-of-claims',
    stepNumber: 2,
    progressLabel: 'جاري إعداد الأطراف',
  },
  LawsuitSubjects: {
    workflowType: 'preparing-statement-of-claims',
    workflowId: 'preparing-statement-of-claims',
    stepNumber: 3,
    progressLabel: 'جاري صياغة موضوع الدعوى ووقائعها',
  },
  LawsuitFacts: {
    workflowType: 'preparing-statement-of-claims',
    workflowId: 'preparing-statement-of-claims',
    stepNumber: 3,
    progressLabel: 'جاري صياغة موضوع الدعوى ووقائعها',
  },
  LawsuitLegalBasis: {
    workflowType: 'preparing-statement-of-claims',
    workflowId: 'preparing-statement-of-claims',
    stepNumber: 5,
    progressLabel: 'جاري تأسيس السند القانوني',
  },
  LawsuitRequests: {
    workflowType: 'preparing-statement-of-claims',
    workflowId: 'preparing-statement-of-claims',
    stepNumber: 6,
    progressLabel: 'جاري تجهيز الطلبات',
  },

  AppealBriefJudgmentData: {
    workflowType: 'appeal-brief',
    workflowId: 'appeal-brief',
    stepNumber: 1,
    progressLabel: 'جاري استخراج بيانات الحكم',
  },
  AppealBriefReasoningAnalysis: {
    workflowType: 'appeal-brief',
    workflowId: 'appeal-brief',
    stepNumber: 2,
    progressLabel: 'جاري تحليل الأسباب',
  },
  AppealBriefGrounds: {
    workflowType: 'appeal-brief',
    workflowId: 'appeal-brief',
    stepNumber: 3,
    progressLabel: 'جاري إعداد أوجه الطعن',
  },
  AppealBriefRequests: {
    workflowType: 'appeal-brief',
    workflowId: 'appeal-brief',
    stepNumber: 4,
    progressLabel: 'جاري صياغة الطلبات',
  },
  AppealBriefLegalBasis: {
    workflowType: 'appeal-brief',
    workflowId: 'appeal-brief',
    stepNumber: 5,
    progressLabel: 'جاري تأسيس السند القانوني',
  },
  AppealBriefAssembly: {
    workflowType: 'appeal-brief',
    workflowId: 'appeal-brief',
    stepNumber: 6,
    progressLabel: 'جاري تجميع صحيفة الطعن',
  },

  AdminComplaintClassification: {
    workflowType: 'admin-complaint',
    workflowId: 'admin-complaint',
    stepNumber: 1,
    progressLabel: 'جاري تصنيف الشكوى',
  },
  AdminComplaintFacts: {
    workflowType: 'admin-complaint',
    workflowId: 'admin-complaint',
    stepNumber: 2,
    progressLabel: 'جاري صياغة الوقائع',
  },
  AdminComplaintViolation: {
    workflowType: 'admin-complaint',
    workflowId: 'admin-complaint',
    stepNumber: 3,
    progressLabel: 'جاري تحليل المخالفات',
  },
  AdminComplaintRequests: {
    workflowType: 'admin-complaint',
    workflowId: 'admin-complaint',
    stepNumber: 4,
    progressLabel: 'جاري تجهيز الطلبات',
  },
  AdminComplaintAssembly: {
    workflowType: 'admin-complaint',
    workflowId: 'admin-complaint',
    stepNumber: 5,
    progressLabel: 'جاري تجميع الشكوى',
  },

  RulingAnalysisOperative: {
    workflowType: 'ruling-analysis',
    workflowId: 'ruling-analysis',
    stepNumber: 1,
    progressLabel: 'جاري تحليل منطوق الحكم',
  },
  RulingAnalysisReasoning: {
    workflowType: 'ruling-analysis',
    workflowId: 'ruling-analysis',
    stepNumber: 2,
    progressLabel: 'جاري تحليل أسباب الحكم',
  },
  RulingAnalysisDefectEvaluation: {
    workflowType: 'ruling-analysis',
    workflowId: 'ruling-analysis',
    stepNumber: 3,
    progressLabel: 'جاري تقييم العيوب',
  },
  RulingAnalysisFeasibilityReport: {
    workflowType: 'ruling-analysis',
    workflowId: 'ruling-analysis',
    stepNumber: 4,
    progressLabel: 'جاري إعداد تقرير الجدوى',
  },

  LegalWarningClassification: {
    workflowType: 'legal-warning',
    workflowId: 'legal-warning',
    stepNumber: 1,
    progressLabel: 'جاري تصنيف الإنذار',
  },
  LegalWarningBodyDraft: {
    workflowType: 'legal-warning',
    workflowId: 'legal-warning',
    stepNumber: 2,
    progressLabel: 'جاري صياغة متن الإنذار',
  },
  LegalWarningAssembly: {
    workflowType: 'legal-warning',
    workflowId: 'legal-warning',
    stepNumber: 3,
    progressLabel: 'جاري تجميع الإنذار',
  },

  ExecRequestClassification: {
    workflowType: 'exec-request',
    workflowId: 'exec-request',
    stepNumber: 1,
    progressLabel: 'جاري تصنيف الطلب التنفيذي',
  },
  ExecRequestDrafting: {
    workflowType: 'exec-request',
    workflowId: 'exec-request',
    stepNumber: 2,
    progressLabel: 'جاري صياغة الطلب التنفيذي',
  },
  ExecRequestAssembly: {
    workflowType: 'exec-request',
    workflowId: 'exec-request',
    stepNumber: 3,
    progressLabel: 'جاري تجميع الطلب التنفيذي',
  },
};

export function isActiveAiJob(job: Pick<AiJob, 'status'> | undefined | null): boolean {
  return Boolean(job && ACTIVE_AI_JOB_STATUSES.includes(job.status));
}

export function workflowMatchesFilter(job: AiJob, workflowType: string | null | undefined): boolean {
  if (!workflowType) return true;
  const metadata = WORKFLOW_STEP_METADATA[job.stepType];
  return job.workflowType === workflowType ||
    metadata?.workflowType === workflowType ||
    metadata?.workflowId === workflowType;
}

export function getWorkflowIdForAiJob(job: AiJob): string | null {
  return WORKFLOW_STEP_METADATA[job.stepType]?.workflowId ?? job.workflowType ?? null;
}

export function getAiJobProgressLabel(job: AiJob): string {
  return WORKFLOW_STEP_METADATA[job.stepType]?.progressLabel ?? 'جاري تنفيذ الخطوة الحالية';
}
