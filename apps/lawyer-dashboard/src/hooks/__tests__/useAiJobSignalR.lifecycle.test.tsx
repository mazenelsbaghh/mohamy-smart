import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { ReactNode } from 'react';

const eventHandlers: Record<string, (...args: unknown[]) => void> = {};

vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5000/api/v1');

vi.mock('@microsoft/signalr', () => {
  const conn = {
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      eventHandlers[event] = handler;
    }),
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    invoke: vi.fn().mockResolvedValue(undefined),
    state: 'Connected',
  };
  return {
    HubConnectionBuilder: vi.fn().mockReturnValue({
      withUrl: vi.fn().mockReturnThis(),
      withAutomaticReconnect: vi.fn().mockReturnThis(),
      configureLogging: vi.fn().mockReturnThis(),
      build: vi.fn().mockReturnValue(conn),
    }),
    LogLevel: { Error: 2 },
    HubConnectionState: { Connected: 'Connected' },
  };
});

vi.mock('../../redux/aiJobs/thunk/thunkGetAllAiJobs', () => ({
  default: Object.assign(vi.fn().mockReturnValue({ type: 'aiJobs/getAll/mock' }), {
    pending: { type: 'aiJobs/getAll/pending' },
    fulfilled: { type: 'aiJobs/getAll/fulfilled' },
    rejected: { type: 'aiJobs/getAll/rejected' },
  }),
}));

vi.mock('../../redux/aiJobs/thunk/thunkCancelAiJob', () => ({
  default: Object.assign(vi.fn().mockReturnValue({ type: 'aiJobs/cancel/mock' }), {
    pending: { type: 'aiJobs/cancel/pending' },
    fulfilled: { type: 'aiJobs/cancel/fulfilled' },
    rejected: { type: 'aiJobs/cancel/rejected' },
  }),
}));

vi.mock('../../redux/aiJobs/thunk/thunkSubmitAiJob', () => ({
  default: Object.assign(vi.fn().mockReturnValue({ type: 'aiJobs/submit/mock' }), {
    pending: { type: 'aiJobs/submit/pending' },
    fulfilled: { type: 'aiJobs/submit/fulfilled' },
    rejected: { type: 'aiJobs/submit/rejected' },
  }),
}));

import reducer, { type AiJob } from '../../redux/aiJobs/aiJobsSlice';
import thunkGetAllAiJobs from '../../redux/aiJobs/thunk/thunkGetAllAiJobs';

function createTestStore(activeRunId: string | number | null = null, jobs: Record<string, AiJob> = {}) {
  return configureStore({
    reducer: {
      aiJobs: reducer,
    },
    preloadedState: {
      aiJobs: {
        jobs,
        loading: 'idle' as const,
        error: null,
        activeRunId,
      },
    },
  });
}

describe('useAiJobSignalR lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(eventHandlers).forEach((key) => delete eventHandlers[key]);
  });

  it('completion event should update only matching runId and stepNumber', async () => {
    const store = createTestStore('run-123');
    const caseId = 'case-456';

    const { useAiJobSignalR } = await import('../useAiJobSignalR');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useAiJobSignalR(caseId, true, null), { wrapper });

    await vi.waitFor(() => {
      expect(eventHandlers['JobCompleted']).toBeDefined();
    });

    const job: AiJob = {
      id: 'job-1',
      caseId,
      stepType: 'FactAnalysis',
      status: 'Completed',
      resultJson: '{"result":true}',
      errorMessage: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      runId: 'run-123',
      stepNumber: 1,
    };

    await act(async () => {
      eventHandlers['JobCompleted']!(job);
    });

    const state = store.getState();
    expect(state.aiJobs.jobs['FactAnalysis']).toBeDefined();
    expect(state.aiJobs.jobs['FactAnalysis']!.status).toBe('Completed');
    expect(state.aiJobs.jobs['FactAnalysis']!.runId).toBe('run-123');
    expect(state.aiJobs.jobs['FactAnalysis']!.stepNumber).toBe(1);
  });

  it('completion event should be ignored for different runId', async () => {
    const store = createTestStore('run-123');
    const caseId = 'case-456';

    const { useAiJobSignalR } = await import('../useAiJobSignalR');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useAiJobSignalR(caseId, true, null), { wrapper });

    await vi.waitFor(() => {
      expect(eventHandlers['JobCompleted']).toBeDefined();
    });

    const job: AiJob = {
      id: 'job-stale',
      caseId,
      stepType: 'FactAnalysis',
      status: 'Completed',
      resultJson: '{"stale":true}',
      errorMessage: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      runId: 'run-old',
      stepNumber: 1,
    };

    await act(async () => {
      eventHandlers['JobCompleted']!(job);
    });

    const state = store.getState();
    expect(state.aiJobs.jobs['FactAnalysis']).toBeUndefined();
  });

  it('polls active jobs even when SignalR is connected', async () => {
    vi.useFakeTimers();
    const caseId = 'case-456';
    const workflowCreatedAt = new Date().toISOString();
    const activeJob: AiJob = {
      id: 'job-active',
      caseId,
      stepType: 'GenerateDefenses',
      status: 'Processing',
      resultJson: null,
      errorMessage: null,
      createdAt: workflowCreatedAt,
      completedAt: null,
      runId: 'run-123',
      stepNumber: 2,
    };
    const store = createTestStore('run-123', { GenerateDefenses: activeJob });

    const { useAiJobSignalR } = await import('../useAiJobSignalR');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { unmount } = renderHook(() => useAiJobSignalR(caseId, true, workflowCreatedAt, 'run-123'), { wrapper });

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(thunkGetAllAiJobs).toHaveBeenCalledWith({
      caseId,
      since: workflowCreatedAt,
      runId: 'run-123',
    });

    unmount();
    vi.useRealTimers();
  });
});
