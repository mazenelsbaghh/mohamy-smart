export type WorkflowRunStatus =
  | "NotStarted"
  | "InProgress"
  | "Completed"
  | "Abandoned"
  | "Conflict";

export type WorkflowStageStatus =
  | "Locked"
  | "Current"
  | "Processing"
  | "Completed"
  | "Failed"
  | "Conflict";

export type WorkflowRequestStatus =
  | "Queued"
  | "Processing"
  | "Completed"
  | "Failed"
  | "Cancelled"
  | "Conflict";

export type WorkflowConflictCode =
  | "ConcurrencyConflict"
  | "ValidationFailure"
  | "ProviderFailure"
  | "UserCancelled";

export interface WorkflowRunIdentity {
  runId: string | number;
  workflowType: string;
  caseId: string;
}

export interface ActiveStageRequest {
  requestId: string;
  stepNumber: number;
  stepType: string;
  status: WorkflowRequestStatus;
  createdAt: string;
  startedAt?: string;
}

export interface WorkflowStageConflict {
  requestId: string;
  stepNumber: number;
  errorCode: WorkflowConflictCode;
  message: string;
  availableActions: Array<"Reload" | "Retry">;
  detectedAt: string;
}

export interface WorkflowLifecycleSummary {
  id?: number;
  runId: string | number;
  caseId: string;
  workflowType: string;
  status: WorkflowRunStatus;
  createdAt: string;
  updatedAt: string;
  currentAccessibleStep: number;
  lastCompletedStep: number;
  isReadOnly: boolean;
  snapshotLabel?: string;
  activeRequests: ActiveStageRequest[];
  stageConflicts: WorkflowStageConflict[];
  canStart?: boolean;
  canResumeCurrent?: boolean;
  canStartNew?: boolean;
  currentRunCreatedAt?: string | null;
}
