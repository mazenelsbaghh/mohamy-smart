import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { createWorkflowSlice } from '../createWorkflowSlice';
import type { TypedWorkflowState } from '../workflowTypes';

vi.mock('@mohamy/shared-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mohamy/shared-utils')>();
  return { ...actual, isString: (v: unknown) => typeof v === 'string' };
});

function makeThunks(prefix: string) {
  const makeThunk = (suffix: string) =>
    Object.assign(vi.fn(), {
      pending: { type: `${prefix}/${suffix}/pending` },
      fulfilled: { type: `${prefix}/${suffix}/fulfilled` },
      rejected: { type: `${prefix}/${suffix}/rejected` },
    });

  return {
    startWorkflow: makeThunk('startWorkflow'),
    getWorkflow: makeThunk('getWorkflow'),
    runStep: makeThunk('runStep'),
    saveEditedStep: makeThunk('saveEditedStep'),
    saveDraftStep: makeThunk('saveDraftStep'),
    startNewRun: makeThunk('startNewRun'),
    resumeCurrentRun: makeThunk('resumeCurrentRun'),
    advanceStage: makeThunk('advanceStage'),
    recoverConflict: makeThunk('recoverConflict'),
  };
}

type TestOutputs = Record<number, unknown>;

function makeStore() {
  const thunks = makeThunks('testWorkflow');
  const slice = createWorkflowSlice<TestOutputs>({
    name: 'testWorkflow',
    initialOutputs: {},
    thunks: thunks as unknown as ReturnType<typeof makeThunks> extends infer T
      ? T extends Record<string, infer V>
        ? { [K in keyof T]: V }
        : never
      : never,
    maxSteps: 3,
  });

  const store = configureStore({
    reducer: { testWorkflow: slice.reducer },
  });

  return { store, slice, thunks };
}

describe('startNewRun.fulfilled lifecycle reducer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('startNew.fulfilled should clear old outputs', () => {
    const { store, thunks } = makeStore();

    store.dispatch({
      type: thunks.getWorkflow.fulfilled.type,
      payload: {
        id: 1,
        caseId: 'case-1',
        currentStep: 3,
        status: 'InProgress',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
        step1Output: '{"old":true}',
        step2Output: '{"old":true}',
      },
    });

    const stateAfterOld = store.getState().testWorkflow as TypedWorkflowState<TestOutputs>;
    expect(stateAfterOld.outputs[1]).toBeDefined();

    store.dispatch({
      type: thunks.startNewRun.fulfilled.type,
      payload: {
        runId: 'run-new-1',
        caseId: 'case-1',
        workflowType: 'test',
        status: 'InProgress',
        createdAt: '2025-01-03T00:00:00Z',
        updatedAt: '2025-01-03T00:00:00Z',
        currentAccessibleStep: 0,
        lastCompletedStep: 0,
        isReadOnly: false,
        activeRequests: [],
        stageConflicts: [],
      },
    });

    const state = store.getState().testWorkflow as TypedWorkflowState<TestOutputs>;
    expect(state.outputs).toEqual({});
  });

  it('startNew.fulfilled should clear old active jobs', () => {
    const { store, thunks } = makeStore();

    store.dispatch({
      type: thunks.startNewRun.fulfilled.type,
      payload: {
        runId: 'run-1',
        caseId: 'case-1',
        workflowType: 'test',
        status: 'InProgress',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        currentAccessibleStep: 0,
        lastCompletedStep: 0,
        isReadOnly: false,
        activeRequests: [],
        stageConflicts: [],
      },
    });

    const state = store.getState().testWorkflow as TypedWorkflowState<TestOutputs>;
    expect(state.activeRequests).toEqual([]);
    expect(state.stageConflicts).toEqual([]);
  });

  it('startNew.fulfilled should reset currentAccessibleStep to 0', () => {
    const { store, thunks } = makeStore();

    store.dispatch({
      type: thunks.getWorkflow.fulfilled.type,
      payload: {
        id: 1,
        caseId: 'case-1',
        currentStep: 2,
        status: 'InProgress',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        step1Output: '{"data":true}',
      },
    });

    store.dispatch({
      type: thunks.startNewRun.fulfilled.type,
      payload: {
        runId: 'run-2',
        caseId: 'case-1',
        workflowType: 'test',
        status: 'InProgress',
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
        currentAccessibleStep: 0,
        lastCompletedStep: 0,
        isReadOnly: false,
        activeRequests: [],
        stageConflicts: [],
      },
    });

    const state = store.getState().testWorkflow as TypedWorkflowState<TestOutputs>;
    expect(state.currentAccessibleStep).toBe(0);
  });

  it('startNew.fulfilled should set new runId', () => {
    const { store, thunks } = makeStore();

    store.dispatch({
      type: thunks.startNewRun.fulfilled.type,
      payload: {
        runId: 'run-abc-123',
        caseId: 'case-1',
        workflowType: 'test',
        status: 'InProgress',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        currentAccessibleStep: 0,
        lastCompletedStep: 0,
        isReadOnly: false,
        activeRequests: [],
        stageConflicts: [],
      },
    });

    const state = store.getState().testWorkflow as TypedWorkflowState<TestOutputs>;
    expect(state.runId).toBe('run-abc-123');
  });
});

describe('conflict response reducer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('setStageConflicts should set conflict without unlocking next tab', () => {
    const { store, slice, thunks } = makeStore();

    store.dispatch({
      type: thunks.getWorkflow.fulfilled.type,
      payload: {
        id: 1,
        caseId: 'case-1',
        currentStep: 2,
        status: 'InProgress',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
        step1Output: '{"data":true}',
        currentAccessibleStep: 1,
        lastCompletedStep: 1,
      },
    });

    const stateBefore = store.getState().testWorkflow as TypedWorkflowState<TestOutputs>;
    expect(stateBefore.currentAccessibleStep).toBe(1);
    expect(stateBefore.stageConflicts).toEqual([]);

    store.dispatch(slice.actions.setStageConflicts([{
      requestId: 'req-1',
      stepNumber: 2,
      errorCode: 'ConcurrencyConflict',
      message: 'حدث تعارض',
      availableActions: ['Reload', 'Retry'],
      detectedAt: '2025-01-02T00:00:00Z',
    }]));

    const state = store.getState().testWorkflow as TypedWorkflowState<TestOutputs>;
    expect(state.stageConflicts).toHaveLength(1);
    expect(state.stageConflicts[0].stepNumber).toBe(2);
    expect(state.currentAccessibleStep).toBe(1);
  });
});

describe('restoreSnapshot reducer', () => {
  it('restores snapshots as read-only by default', () => {
    const { store, slice } = makeStore();

    store.dispatch(slice.actions.restoreSnapshot({
      outputs: { 1: { old: true } },
      currentStep: 1,
      snapshotId: 12,
      snapshotLabel: 'نسخة قديمة',
    }));

    const state = store.getState().testWorkflow as TypedWorkflowState<TestOutputs>;
    expect(state.isReadOnly).toBe(true);
    expect(state.status).toBe('Completed');
    expect(state.snapshotId).toBe(12);
    expect(state.currentAccessibleStep).toBe(1);
    expect(state.lastCompletedStep).toBe(1);
  });

  it('restores editable snapshots as an in-progress working copy', () => {
    const { store, slice } = makeStore();

    store.dispatch(slice.actions.restoreSnapshot({
      outputs: { 1: { old: true } },
      currentStep: 1,
      snapshotId: 12,
      readOnly: false,
    }));

    const state = store.getState().testWorkflow as TypedWorkflowState<TestOutputs>;
    expect(state.isReadOnly).toBe(false);
    expect(state.status).toBe('InProgress');
    expect(state.outputs[1]).toEqual({ old: true });
    expect(state.currentAccessibleStep).toBe(1);
  });
});
