import { describe, expect, it } from 'vitest';
import { buildWorkflowSnapshotPayload, compactWorkflowOutputs, getSnapshotCurrentStep } from '../workflowSnapshotUtils';
import type { DraftWorkflowState } from '../workflowTypes';

const makeState = (overrides: Partial<DraftWorkflowState>): DraftWorkflowState => ({
  workflowId: 1,
  caseId: 'case-1',
  currentStep: 1,
  status: 'InProgress',
  createdAt: null,
  lastSavedAt: null,
  workflowVersions: [],
  isReadOnly: false,
  snapshotId: null,
  snapshotLabel: null,
  runId: 'run-1',
  currentAccessibleStep: 0,
  lastCompletedStep: 0,
  activeRequests: [],
  stageConflicts: [],
  outputs: {},
  loadingState: {
    isStarting: false,
    isGetting: false,
    isRunningStep: false,
    isSavingStep: false,
    isAutoSaving: false,
    isAdvancingStage: false,
  },
  errorState: {
    startError: null,
    getError: null,
    runError: null,
    saveError: null,
    autoSaveError: null,
    hasConcurrencyConflict: false,
  },
  ...overrides,
});

describe('workflowSnapshotUtils', () => {
  it('should compact outputs before creating a snapshot', () => {
    const outputs = compactWorkflowOutputs({
      1: { warningType: 'إنذار' },
      2: null,
      3: {},
      4: { emptyList: [] },
      5: { requests: ['طلب'] },
    });

    expect(outputs).toEqual({
      '1': { warningType: 'إنذار' },
      '5': { requests: ['طلب'] },
    });
  });

  it('should use the highest non-empty output step as the snapshot current step', () => {
    const state = makeState({
      currentStep: 1,
      outputs: {
        1: { requestType: 'تنفيذ' },
        3: { documentText: 'طلب نهائي' },
      },
    });

    expect(getSnapshotCurrentStep(state)).toBe(3);
  });

  it('should return null when there is no snapshot-worthy output', () => {
    const state = makeState({
      outputs: {
        1: null,
        2: {},
        3: { empty: [] },
      },
    });

    expect(buildWorkflowSnapshotPayload('exec-request', 'case-1', state)).toBeNull();
  });

  it('should build a database snapshot payload for any workflow type', () => {
    const state = makeState({
      outputs: {
        1: { judgmentData: { courtName: 'محكمة النقض' } },
        2: null,
      },
    });

    expect(buildWorkflowSnapshotPayload('appeal-brief', 'case-1', state)).toEqual({
      caseId: 'case-1',
      workflowType: 'appeal-brief',
      outputsJson: JSON.stringify({ '1': { judgmentData: { courtName: 'محكمة النقض' } } }),
      currentStep: 1,
    });
  });
});
