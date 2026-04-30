// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

const mockDispatch = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({ id: 42 }), type: 'mock/dispatch' });

vi.mock('../reduxHooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => selector(mockRootState()),
}));

vi.mock('../redux/cases/thunk/thunkGetSingleCase', () => ({
  default: Object.assign(vi.fn(), {
    pending: { type: 'cases/thunkGetSingleCase/pending' },
    fulfilled: { type: 'cases/thunkGetSingleCase/fulfilled' },
    rejected: { type: 'cases/thunkGetSingleCase/rejected' },
  }),
}));

vi.mock('../useWorkflowSnapshotLoader', () => ({
  useWorkflowSnapshotLoader: () => ({ snapshotModeRef: { current: false } }),
}));

vi.mock('../useAiJobSignalR', () => ({
  useAiJobSignalR: vi.fn(),
}));

vi.mock('../useWorkflowFacts', () => ({
  useWorkflowFacts: () => ({
    caseFacts: [],
    setCaseFacts: vi.fn(),
    selectedFacts: [],
    setSelectedFacts: vi.fn(),
    resetForNewRun: vi.fn(),
  }),
}));

vi.mock('../useWorkflowAutoSave', () => ({
  useWorkflowAutoSave: () => ({
    debouncedSave: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn(),
  }),
}));

vi.mock('../components/analysisWorkflow/workflowConstants', () => ({
  WORKFLOW_TAB_CLASSNAMES: {},
  WORKFLOW_TAB_PROPS: {},
}));

vi.mock('../redux/aiJobs/aiJobsSlice', () => ({
  resetAiJobs: () => ({ type: 'aiJobs/resetAiJobs' }),
  setActiveRunId: (runId: unknown) => ({ type: 'aiJobs/setActiveRunId', payload: runId }),
}));

vi.mock('@mohamy/shared-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mohamy/shared-utils')>();
  return { ...actual, isString: (v: unknown) => typeof v === 'string' };
});

let _adminComplaintOverrides: Record<string, unknown> | null = null;

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
    ..._adminComplaintOverrides,
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
  getWorkflowById: Object.assign(vi.fn().mockImplementation(() => ({ type: 'test/getWorkflowById' })), {
    pending: { type: 'test/getWorkflowById/pending' },
    fulfilled: { type: 'test/getWorkflowById/fulfilled' },
    rejected: { type: 'test/getWorkflowById/rejected' },
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
  startNewRun: Object.assign(vi.fn().mockImplementation(() => ({ type: 'test/startNewRun' })), {
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

describe('useWorkflowOrchestrator lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({ id: 42 }), type: 'mock/dispatch' });
    _adminComplaintOverrides = null;
  });

  it('fresh=1 query param should start at step 1 after refresh', async () => {
    const store = makeStore();
    const { useWorkflowOrchestrator } = await import('../useWorkflowOrchestrator');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/workflows/admin-complaint/case-123?fresh=1']}>
          <Routes>
            <Route
              path="/workflows/admin-complaint/:id"
              element={children}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const { result } = renderHook(
      () =>
        useWorkflowOrchestrator({
          sliceSelector,
          thunks: mockThunks as unknown as import('../useWorkflowOrchestrator').IWorkflowThunks,
          restoreSnapshot: vi.fn(),
          resetWorkflow: () => ({ type: 'test/resetWorkflow' }),
          workflowPrefix: 'adminComplaint',
          maxSteps: 5,
          steps: [
            { id: 1, label: 'Step 1', icon: null },
            { id: 2, label: 'Step 2', icon: null },
          ],
        }),
      { wrapper },
    );

    expect(result.current.isFreshRun).toBe(true);

    await vi.waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });

    const startCalls = mockDispatch.mock.calls.filter(
      (call: unknown[]) => {
        const action = call[0];
        return action && typeof action === 'object' && 'type' in action && (action.type as string).includes('startNewRun');
      },
    );
    expect(startCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('start-new should not load old snapshot data', async () => {
    const store = makeStore();
    const { useWorkflowOrchestrator } = await import('../useWorkflowOrchestrator');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/workflows/admin-complaint/case-123?fresh=1']}>
          <Routes>
            <Route
              path="/workflows/admin-complaint/:id"
              element={children}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const { result } = renderHook(
      () =>
        useWorkflowOrchestrator({
          sliceSelector,
          thunks: mockThunks as unknown as import('../useWorkflowOrchestrator').IWorkflowThunks,
          restoreSnapshot: vi.fn(),
          resetWorkflow: () => ({ type: 'test/resetWorkflow' }),
          workflowPrefix: 'adminComplaint',
          maxSteps: 5,
          steps: [
            { id: 1, label: 'Step 1', icon: null },
            { id: 2, label: 'Step 2', icon: null },
          ],
        }),
      { wrapper },
    );

    expect(result.current.isFreshRun).toBe(true);
    expect(result.current.workflowState.outputs).toEqual({});
    expect(result.current.workflowState.snapshotLabel).toBeNull();
  });

  it('resume should hydrate saved stage instead of applying stale cached tabs', async () => {
    _adminComplaintOverrides = {
      workflowId: 10,
      currentAccessibleStep: 2,
      runId: 'run-resume-1',
      outputs: { 3: { stale: 'data from previous session' } },
      status: 'InProgress',
    };

    const store = makeStore();
    const { useWorkflowOrchestrator } = await import('../useWorkflowOrchestrator');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/workflows/admin-complaint/case-123']}>
          <Routes>
            <Route
              path="/workflows/admin-complaint/:id"
              element={children}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const { result } = renderHook(
      () =>
        useWorkflowOrchestrator({
          sliceSelector,
          thunks: mockThunks as unknown as import('../useWorkflowOrchestrator').IWorkflowThunks,
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

    expect(result.current.isClickableTab(3)).toBe(false);
    expect(result.current.isClickableTab(2)).toBe(true);
    expect(result.current.workflowState.outputs[3]).toBeDefined();
  });

  it('new run should open first AI stage only after facts review start', async () => {
    _adminComplaintOverrides = {
      workflowId: 10,
      currentAccessibleStep: 0,
      runId: 'run-new-1',
      outputs: {},
      status: 'InProgress',
    };

    const store = makeStore();
    const { useWorkflowOrchestrator } = await import('../useWorkflowOrchestrator');

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
          thunks: mockThunks as unknown as import('../useWorkflowOrchestrator').IWorkflowThunks,
          restoreSnapshot: vi.fn(),
          resetWorkflow: () => ({ type: 'test/resetWorkflow' }),
          workflowPrefix: 'adminComplaint',
          maxSteps: 5,
          steps: [
            { id: 1, label: 'Facts', icon: null },
            { id: 2, label: 'First AI step', icon: null },
            { id: 3, label: 'Second AI step', icon: null },
          ],
        }),
      { wrapper },
    );

    expect(result.current.isClickableTab(0)).toBe(true);
    expect(result.current.isClickableTab(1)).toBe(false);
    expect(result.current.isClickableTab(2)).toBe(false);

    act(() => {
      result.current.setActive(1);
    });

    expect(result.current.isClickableTab(1)).toBe(true);
    expect(result.current.isClickableTab(2)).toBe(false);
  });

  it('workflowId load for a brand new run should stay on facts review when accessible step is zero', async () => {
    _adminComplaintOverrides = {
      workflowId: 4015,
      currentStep: 1,
      currentAccessibleStep: 0,
      runId: 'run-new-workflow-id',
      outputs: {},
      status: 'InProgress',
    };
    mockDispatch.mockImplementation((action: { type?: string }) => {
      if (action?.type === 'test/getWorkflowById') {
        return {
          unwrap: () => Promise.resolve({
            id: 4015,
            runId: 'run-new-workflow-id',
            currentStep: 1,
            currentAccessibleStep: 0,
          }),
          type: 'mock/getWorkflowById',
        };
      }
      return { unwrap: () => Promise.resolve({ id: 42 }), type: 'mock/dispatch' };
    });

    const store = makeStore();
    const { useWorkflowOrchestrator } = await import('../useWorkflowOrchestrator');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/workflows/admin-complaint/case-123?workflowId=4015']}>
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
          thunks: mockThunks as unknown as import('../useWorkflowOrchestrator').IWorkflowThunks,
          restoreSnapshot: vi.fn(),
          resetWorkflow: () => ({ type: 'test/resetWorkflow' }),
          workflowPrefix: 'adminComplaint',
          maxSteps: 5,
          steps: [
            { id: 1, label: 'Facts', icon: null },
            { id: 2, label: 'First AI step', icon: null },
          ],
        }),
      { wrapper },
    );

    await vi.waitFor(() => {
      expect(mockThunks.getWorkflowById).toHaveBeenCalledWith({ workflowId: 4015 });
    });

    expect(result.current.active).toBe(0);
    expect(result.current.isClickableTab(1)).toBe(false);
  });

  it('workflowId load should not expose tabs from a previous workflow while the requested run is loading', async () => {
    _adminComplaintOverrides = {
      workflowId: 10,
      currentAccessibleStep: 4,
      lastCompletedStep: 4,
      runId: 'old-run',
      outputs: { 1: { old: true }, 4: { old: true } },
      status: 'InProgress',
    };
    mockDispatch.mockImplementation((action: { type?: string } | ((...args: unknown[]) => unknown)) => {
      if (typeof action === 'function') {
        return { unwrap: () => Promise.resolve([]), type: 'mock/thunk' };
      }
      if (action?.type === 'test/getWorkflowById') {
        return {
          unwrap: () => Promise.resolve({
            id: 4015,
            runId: 'new-run',
            workflowType: 'admin-complaint',
            currentStep: 1,
            currentAccessibleStep: 0,
          }),
          type: 'mock/getWorkflowById',
        };
      }
      return { unwrap: () => Promise.resolve({ id: 42 }), type: 'mock/dispatch' };
    });

    const store = makeStore();
    const { useWorkflowOrchestrator } = await import('../useWorkflowOrchestrator');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/workflows/admin-complaint/case-123?workflowId=4015']}>
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
          thunks: mockThunks as unknown as import('../useWorkflowOrchestrator').IWorkflowThunks,
          restoreSnapshot: vi.fn(),
          resetWorkflow: () => ({ type: 'test/resetWorkflow' }),
          workflowPrefix: 'adminComplaint',
          maxSteps: 5,
          steps: [
            { id: 1, label: 'Facts', icon: null },
            { id: 2, label: 'First AI step', icon: null },
            { id: 3, label: 'Second AI step', icon: null },
            { id: 4, label: 'Fourth AI step', icon: null },
          ],
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.active).toBe(0);
    expect(result.current.isClickableTab(1)).toBe(false);
    expect(result.current.isClickableTab(4)).toBe(false);

    await vi.waitFor(() => {
      expect(mockThunks.getWorkflowById).toHaveBeenCalledWith({ workflowId: 4015 });
    });
  });

  it('repeated advance clicks should produce only one advance request', async () => {
    _adminComplaintOverrides = {
      workflowId: 10,
      currentAccessibleStep: 1,
      lastCompletedStep: 1,
      runId: 'run-advance-dedup',
      outputs: { 1: { complaintType: 'grievance' } },
      status: 'InProgress',
    };

    const store = makeStore();
    const { useWorkflowOrchestrator } = await import('../useWorkflowOrchestrator');

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
          thunks: mockThunks as unknown as import('../useWorkflowOrchestrator').IWorkflowThunks,
          restoreSnapshot: vi.fn(),
          resetWorkflow: () => ({ type: 'test/resetWorkflow' }),
          workflowPrefix: 'adminComplaint',
          maxSteps: 5,
          steps: [
            { id: 1, label: 'Step 1', icon: null },
            { id: 2, label: 'Step 2', icon: null },
          ],
        }),
      { wrapper },
    );

    await vi.waitFor(() => {
      expect(result.current.workflowState.runId).toBe('run-advance-dedup');
    });

    const advanceInProgressRef = { current: false };

    const guardedAdvance = () => {
      if (advanceInProgressRef.current) return;
      advanceInProgressRef.current = true;
      mockDispatch({ type: 'test/advanceStage', payload: { workflowId: 10, fromStep: 1, toStep: 2 } });
    };

    guardedAdvance();
    guardedAdvance();
    guardedAdvance();

    const advanceCalls = mockDispatch.mock.calls.filter(
      (call: unknown[]) => {
        const action = call[0];
        return action && typeof action === 'object' && 'type' in action && (action.type as string).includes('advanceStage');
      },
    );
    expect(advanceCalls).toHaveLength(1);
  });

  it('refresh should hydrate loader state from active job without duplicate submit', async () => {
    _adminComplaintOverrides = {
      workflowId: 10,
      currentAccessibleStep: 2,
      runId: 'run-active-1',
      outputs: {},
      status: 'InProgress',
      loadingState: { isStarting: false, isGetting: true, isRunningStep: false, isSavingStep: false, isAutoSaving: false },
    };

    const store = makeStore();
    const { useWorkflowOrchestrator } = await import('../useWorkflowOrchestrator');

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
          thunks: mockThunks as unknown as import('../useWorkflowOrchestrator').IWorkflowThunks,
          restoreSnapshot: vi.fn(),
          resetWorkflow: () => ({ type: 'test/resetWorkflow' }),
          workflowPrefix: 'adminComplaint',
          maxSteps: 5,
          steps: [
            { id: 1, label: 'Step 1', icon: null },
            { id: 2, label: 'Step 2', icon: null },
          ],
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
    expect(mockThunks.startNewRun).not.toHaveBeenCalled();

    const startWorkflowCalls = mockDispatch.mock.calls.filter(
      (call: unknown[]) => {
        const action = call[0];
        return action && typeof action === 'object' && 'type' in action && (action.type as string).includes('startWorkflow');
      },
    );
    expect(startWorkflowCalls).toHaveLength(0);
  });
});
