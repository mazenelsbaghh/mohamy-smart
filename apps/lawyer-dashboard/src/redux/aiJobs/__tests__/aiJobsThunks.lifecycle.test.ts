import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AiJob } from '../aiJobsSlice';

vi.mock('../../../APIs/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from '../../../APIs/api';
import thunkGetAllAiJobs from '../thunk/thunkGetAllAiJobs';
import thunkSubmitAiJob from '../thunk/thunkSubmitAiJob';

const makeJob = (overrides: Partial<AiJob> & Pick<AiJob, 'id' | 'stepType' | 'status'>): AiJob => ({
  caseId: 'case-1',
  resultJson: null,
  errorMessage: null,
  createdAt: '2026-04-30T00:00:00.000Z',
  completedAt: null,
  ...overrides,
});

describe('ai job thunks lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submit should not let a legacy null-run active job block a fresh run request', async () => {
    const legacyActiveJob = makeJob({
      id: 'legacy-active',
      stepType: 'FactAnalysis',
      status: 'Processing',
      runId: null,
      workflowType: null,
      stepNumber: null,
    });
    const freshJob = makeJob({
      id: 'fresh-job',
      stepType: 'FactAnalysis',
      status: 'Queued',
      runId: 'fresh-run',
      workflowType: 'SmartAnalysis',
      stepNumber: 1,
    });

    vi.mocked(api.post).mockResolvedValue({ data: { data: freshJob } });

    const action = await thunkSubmitAiJob({
      caseId: 'case-1',
      stepType: 'FactAnalysis',
      inputJson: '{}',
    })(
      vi.fn(),
      () => ({
        aiJobs: {
          activeRunId: 'fresh-run',
          jobs: { FactAnalysis: legacyActiveJob },
        },
      }) as never,
      undefined,
    );

    expect(api.post).toHaveBeenCalledWith('/cases/case-1/ai-jobs', expect.objectContaining({
      runId: 'fresh-run',
      workflowType: 'SmartAnalysis',
      stepNumber: 1,
    }));
    expect(action.type).toBe('aiJobs/submit/fulfilled');
  });

  it('submit should still block a duplicate active job on the same run', async () => {
    const sameRunJob = makeJob({
      id: 'same-run',
      stepType: 'FactAnalysis',
      status: 'Queued',
      runId: 'fresh-run',
      workflowType: 'SmartAnalysis',
      stepNumber: 1,
    });

    const action = await thunkSubmitAiJob({
      caseId: 'case-1',
      stepType: 'FactAnalysis',
      inputJson: '{}',
    })(
      vi.fn(),
      () => ({
        aiJobs: {
          activeRunId: 'fresh-run',
          jobs: { FactAnalysis: sameRunJob },
        },
      }) as never,
      undefined,
    );

    expect(api.post).not.toHaveBeenCalled();
    expect(action.type).toBe('aiJobs/submit/rejected');
    expect(action.meta.condition).toBe(true);
  });

  it('getAll should surface active legacy SmartAnalysis jobs while filtering stale completed legacy jobs', async () => {
    const matchingRunJob = makeJob({
      id: 'fresh-run-job',
      stepType: 'FactAnalysis',
      status: 'Queued',
      runId: 'fresh-run',
      workflowType: 'SmartAnalysis',
      stepNumber: 1,
    });
    const activeLegacyJob = makeJob({
      id: 'legacy-active',
      stepType: 'GenerateDefenses',
      status: 'Processing',
      runId: null,
      workflowType: null,
      stepNumber: null,
    });
    const completedLegacyJob = makeJob({
      id: 'legacy-completed',
      stepType: 'FinalRequirements',
      status: 'Completed',
      runId: null,
      workflowType: null,
      stepNumber: null,
    });
    const otherWorkflowJob = makeJob({
      id: 'other-active',
      stepType: 'AdminComplaintClassification',
      status: 'Processing',
      runId: null,
      workflowType: null,
      stepNumber: null,
    });

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes('/active?')) return Promise.reject(new Error('optional endpoint unavailable'));
      return Promise.resolve({
        data: {
          data: [matchingRunJob, activeLegacyJob, completedLegacyJob, otherWorkflowJob],
        },
      });
    });

    const action = await thunkGetAllAiJobs({
      caseId: 'case-1',
      runId: 'fresh-run',
      workflowType: 'SmartAnalysis',
    })(vi.fn(), vi.fn() as never, undefined);

    expect(action.type).toBe('aiJobs/getAll/fulfilled');
    expect(action.payload).toEqual([matchingRunJob, activeLegacyJob]);
  });

  it('getAll should exclude active legacy null-run jobs when a specific clean run is requested', async () => {
    const matchingRunJob = makeJob({
      id: 'fresh-run-job',
      stepType: 'FactAnalysis',
      status: 'Queued',
      runId: 'fresh-run',
      workflowType: 'SmartAnalysis',
      stepNumber: 1,
    });
    const activeLegacyJob = makeJob({
      id: 'legacy-active',
      stepType: 'GenerateDefenses',
      status: 'Processing',
      runId: null,
      workflowType: null,
      stepNumber: null,
    });

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes('/active?')) return Promise.reject(new Error('optional endpoint unavailable'));
      return Promise.resolve({
        data: {
          data: [matchingRunJob, activeLegacyJob],
        },
      });
    });

    const action = await thunkGetAllAiJobs({
      caseId: 'case-1',
      runId: 'fresh-run',
      workflowType: 'SmartAnalysis',
      includeLegacyActive: false,
    })(vi.fn(), vi.fn() as never, undefined);

    expect(action.type).toBe('aiJobs/getAll/fulfilled');
    expect(action.payload).toEqual([matchingRunJob]);
  });
});
