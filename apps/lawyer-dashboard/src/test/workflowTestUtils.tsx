import { configureStore } from "@reduxjs/toolkit";
import type { AiJob, AiStepType, AiJobStatus } from "../redux/aiJobs/aiJobsSlice";

type WorkflowRouteParams = {
  caseId: string;
  workflowId?: string;
  stepNumber?: string;
};

type HydratedRouteOptions = {
  params?: WorkflowRouteParams;
  state?: Record<string, unknown>;
  pathname?: string;
};

export function createWorkflowRouteState(
  overrides?: HydratedRouteOptions
): {
  params: WorkflowRouteParams;
  state: Record<string, unknown>;
  pathname: string;
} {
  return {
    params: {
      caseId: overrides?.params?.caseId ?? "00000000-0000-0000-0000-000000000001",
      workflowId: overrides?.params?.workflowId,
      stepNumber: overrides?.params?.stepNumber,
    },
    state: overrides?.state ?? {},
    pathname: overrides?.pathname ?? "/workflows/test",
  };
}

type WorkflowStoreOverrides = {
  aiJobs?: Partial<Record<AiStepType, AiJob>>;
  loading?: "idle" | "pending" | "succeeded" | "failed";
  error?: string | null;
};

export function createWorkflowTestStore(overrides?: WorkflowStoreOverrides) {
  const jobs = overrides?.aiJobs ?? {};
  const loading = overrides?.loading ?? "idle";
  const error = overrides?.error ?? null;

  return configureStore({
    reducer: {
      aiJobs: () => ({
        jobs,
        loading,
        error,
      }),
    },
  });
}

export type FakeAiJobEvent = {
  id: string;
  caseId: string;
  stepType: AiStepType;
  status: AiJobStatus;
  resultJson: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  runId?: string | number;
  stepNumber?: number;
};

type FakeAiJobEventOverrides = Partial<FakeAiJobEvent>;

export function createFakeAiJobEvent(
  overrides?: FakeAiJobEventOverrides
): FakeAiJobEvent {
  return {
    id: overrides?.id ?? "00000000-0000-0000-0000-000000000099",
    caseId:
      overrides?.caseId ?? "00000000-0000-0000-0000-000000000001",
    stepType: overrides?.stepType ?? "FactAnalysis",
    status: overrides?.status ?? "Completed",
    resultJson: overrides?.resultJson ?? null,
    errorMessage: overrides?.errorMessage ?? null,
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
    completedAt: overrides?.completedAt ?? new Date().toISOString(),
    runId: overrides?.runId,
    stepNumber: overrides?.stepNumber,
  };
}
