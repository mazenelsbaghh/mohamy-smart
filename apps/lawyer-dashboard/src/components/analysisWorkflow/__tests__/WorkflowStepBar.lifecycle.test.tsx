import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

const mockDispatch = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({ id: 42 }), type: 'mock/dispatch' });

vi.mock('../../../hooks/reduxHooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => selector(mockRootState()),
}));

vi.mock('../../../redux/cases/thunk/thunkGetSingleCase', () => ({
  default: Object.assign(vi.fn(), {
    pending: { type: 'cases/thunkGetSingleCase/pending' },
    fulfilled: { type: 'cases/thunkGetSingleCase/fulfilled' },
    rejected: { type: 'cases/thunkGetSingleCase/rejected' },
  }),
}));

vi.mock('../../../hooks/useWorkflowSnapshotLoader', () => ({
  useWorkflowSnapshotLoader: () => ({ snapshotModeRef: { current: false } }),
}));

vi.mock('../../../hooks/useAiJobSignalR', () => ({
  useAiJobSignalR: vi.fn(),
}));

vi.mock('../../../hooks/useWorkflowFacts', () => ({
  useWorkflowFacts: () => ({
    caseFacts: [],
    setCaseFacts: vi.fn(),
    selectedFacts: [],
    setSelectedFacts: vi.fn(),
  }),
}));

vi.mock('../../../hooks/useWorkflowAutoSave', () => ({
  useWorkflowAutoSave: () => ({
    debouncedSave: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn(),
  }),
}));

vi.mock('../workflowConstants', () => ({
  WORKFLOW_TAB_CLASSNAMES: {},
  WORKFLOW_TAB_PROPS: {},
}));

vi.mock('../../../redux/aiJobs/aiJobsSlice', () => ({
  resetAiJobs: () => ({ type: 'aiJobs/resetAiJobs' }),
}));

vi.mock('@mohamy/shared-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mohamy/shared-utils')>();
  return { ...actual, isString: (v: unknown) => typeof v === 'string' };
});

let _overrides: Record<string, unknown> | null = null;

function mockRootState() {
  const adminComplaint = {
    workflowId: null,
    caseId: null,
    outputs: {},
    currentStep: 1,
    status: 'NotStarted' as const,
    loadingState: { isStarting: false, isGetting: false, isRunningStep: false, isSavingStep: false, isAutoSaving: false },
    errorState: { startError: null, getError: null, runError: null, saveError: null, autoSaveError: null, hasConcurrencyConflict: false },
    lastSavedAt: null,
    createdAt: null,
    isReadOnly: false,
    snapshotLabel: null,
    snapshotId: null,
    runId: null,
    currentAccessibleStep: 1,
    lastCompletedStep: 0,
    activeRequests: [] as unknown[],
    stageConflicts: [] as unknown[],
    workflowVersions: [] as unknown[],
    ..._overrides,
  };
  return {
    cases: { singleCase: null },
    aiJobs: { jobs: {}, loading: 'idle' as const, error: null, activeRunId: null },
    adminComplaint,
  };
}

function makeStore() {
  return configureStore({
    reducer: {
      cases: () => ({ singleCase: null }),
      aiJobs: () => ({ jobs: {}, loading: 'idle', error: null, activeRunId: null }),
      adminComplaint: (
        state = {
          workflowId: null,
          caseId: null,
          outputs: {},
          currentStep: 1,
          status: 'NotStarted',
          loadingState: { isStarting: false, isGetting: false, isRunningStep: false, isSavingStep: false, isAutoSaving: false },
          errorState: { startError: null, getError: null, runError: null, saveError: null, autoSaveError: null, hasConcurrencyConflict: false },
          lastSavedAt: null,
          createdAt: null,
          isReadOnly: false,
          snapshotLabel: null,
          snapshotId: null,
          runId: null,
          currentAccessibleStep: 1,
          lastCompletedStep: 0,
          activeRequests: [],
          stageConflicts: [],
          workflowVersions: [],
        },
      ) => state,
    },
  });
}

function sliceSelector(s: unknown) {
  const state = (s as Record<string, unknown>).adminComplaint as Record<string, unknown> | undefined;
  return {
    workflowId: (state?.workflowId as number | null) ?? null,
    caseId: (state?.caseId as string | null) ?? null,
    outputs: (state?.outputs as Record<number, unknown>) ?? {},
    loadingState: (state?.loadingState as Record<string, unknown>) ?? { isAutoSaving: false, isSavingStep: false },
    errorState: (state?.errorState as Record<string, unknown>) ?? { autoSaveError: null },
    lastSavedAt: (state?.lastSavedAt as string | null) ?? null,
    createdAt: (state?.createdAt as string | null) ?? null,
    isReadOnly: (state?.isReadOnly as boolean) ?? false,
    snapshotLabel: (state?.snapshotLabel as string | null) ?? null,
    currentAccessibleStep: (state?.currentAccessibleStep as number) ?? 1,
    runId: (state?.runId as string | number | null) ?? null,
  };
}

const mockThunks = {
  startWorkflow: Object.assign(vi.fn().mockImplementation(() => ({ type: 'test/startWorkflow' })), {
    pending: { type: 'test/startWorkflow/pending' },
    fulfilled: { type: 'test/startWorkflow/fulfilled' },
    rejected: { type: 'test/startWorkflow/rejected' },
  }),
  getWorkflow: Object.assign(vi.fn().mockImplementation(() => ({ type: 'test/getWorkflow' })), {
    pending: { type: 'test/getWorkflow/pending' },
    fulfilled: { type: 'test/getWorkflow/fulfilled' },
    rejected: { type: 'test/getWorkflow/rejected' },
  }),
  runStep: Object.assign(vi.fn(), {
    pending: { type: 'test/runStep/pending' },
    fulfilled: { type: 'test/runStep/fulfilled' },
    rejected: { type: 'test/runStep/rejected' },
  }),
  saveEditedStep: Object.assign(vi.fn(), {
    pending: { type: 'test/saveEditedStep/pending' },
    fulfilled: { type: 'test/saveEditedStep/fulfilled' },
    rejected: { type: 'test/saveEditedStep/rejected' },
  }),
  saveDraftStep: Object.assign(vi.fn(), {
    pending: { type: 'test/saveDraftStep/pending' },
    fulfilled: { type: 'test/saveDraftStep/fulfilled' },
    rejected: { type: 'test/saveDraftStep/rejected' },
  }),
  startNewRun: Object.assign(vi.fn(), {
    pending: { type: 'test/startNewRun/pending' },
    fulfilled: { type: 'test/startNewRun/fulfilled' },
    rejected: { type: 'test/startNewRun/rejected' },
  }),
  resumeCurrentRun: Object.assign(vi.fn(), {
    pending: { type: 'test/resumeCurrentRun/pending' },
    fulfilled: { type: 'test/resumeCurrentRun/fulfilled' },
    rejected: { type: 'test/resumeCurrentRun/rejected' },
  }),
  advanceStage: Object.assign(vi.fn(), {
    pending: { type: 'test/advanceStage/pending' },
    fulfilled: { type: 'test/advanceStage/fulfilled' },
    rejected: { type: 'test/advanceStage/rejected' },
  }),
};

describe('WorkflowStepBar lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({ id: 42 }), type: 'mock/dispatch' });
    _overrides = null;
  });

  it('future tabs should remain disabled after output completion until advance succeeds', async () => {
    _overrides = {
      workflowId: 10,
      currentAccessibleStep: 1,
      lastCompletedStep: 1,
      runId: 'run-stepbar-1',
      outputs: {
        1: { complaintType: 'grievance' },
        2: { factsSummary: 'saved but not yet accessible' },
      },
      status: 'InProgress',
    };

    const store = makeStore();
    const { useWorkflowOrchestrator } = await import('../../../hooks/useWorkflowOrchestrator');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/workflows/admin-complaint/case-123']}>
          <Routes>
            <Route path="/workflows/admin-complaint/:id" element={children} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const { result } = renderHook(
      () =>
        useWorkflowOrchestrator({
          sliceSelector,
          thunks: mockThunks as unknown as import('../../../hooks/useWorkflowOrchestrator').IWorkflowThunks,
          restoreSnapshot: vi.fn(),
          resetWorkflow: () => ({ type: 'test/resetWorkflow' }),
          workflowPrefix: 'adminComplaint',
          maxSteps: 5,
          steps: [
            { id: 1, label: 'Step 1', icon: null },
            { id: 2, label: 'Step 2', icon: null },
            { id: 3, label: 'Step 3', icon: null },
            { id: 4, label: 'Step 4', icon: null },
            { id: 5, label: 'Step 5', icon: null },
          ],
        }),
      { wrapper },
    );

    expect(result.current.isClickableTab(0)).toBe(true);
    expect(result.current.isClickableTab(1)).toBe(true);
    expect(result.current.isClickableTab(2)).toBe(false);
    expect(result.current.isClickableTab(3)).toBe(false);
    expect(result.current.isClickableTab(4)).toBe(false);
  });
});
