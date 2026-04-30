import type { DraftWorkflowState } from './workflowTypes';

type SnapshotPayload = {
  caseId: string;
  workflowType: string;
  outputsJson: string;
  currentStep: number;
};

const hasSnapshotValue = (value: unknown): boolean => {
  if (value == null || value === '') return false;
  if (Array.isArray(value)) return value.some(hasSnapshotValue);
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).some(hasSnapshotValue);
  return true;
};

export const compactWorkflowOutputs = (outputs: Record<number, unknown>) => {
  const compact: Record<string, unknown> = {};

  for (const [step, value] of Object.entries(outputs)) {
    if (hasSnapshotValue(value)) compact[step] = value;
  }

  return compact;
};

export const getSnapshotCurrentStep = (state: DraftWorkflowState) => {
  const compactOutputs = compactWorkflowOutputs(state.outputs);
  const highestOutputStep = Object.keys(compactOutputs).reduce((highest, key) => {
    const step = Number(key);
    return Number.isFinite(step) ? Math.max(highest, step) : highest;
  }, 0);

  return Math.max(1, highestOutputStep, state.currentStep ?? 1);
};

export const buildWorkflowSnapshotPayload = (
  workflowType: string,
  caseId: string,
  state: DraftWorkflowState,
): SnapshotPayload | null => {
  const outputs = compactWorkflowOutputs(state.outputs);
  if (Object.keys(outputs).length === 0) return null;

  return {
    caseId,
    workflowType,
    outputsJson: JSON.stringify(outputs),
    currentStep: getSnapshotCurrentStep(state),
  };
};
