import { describe, it, expect, beforeEach } from 'vitest';
import reducer, {
  upsertJob,
  setActiveRunId,
  type AiJob,
} from '../aiJobsSlice';

type AiJobsState = ReturnType<typeof reducer>;

function makeInitialStateWithRun(runId: string): AiJobsState {
  const base = reducer(undefined, { type: '__INIT__' });
  return reducer(base, setActiveRunId(runId));
}

function makeJob(overrides: Partial<AiJob> & { stepType: AiJob['stepType']; runId: string }): AiJob {
  return {
    id: overrides.id ?? 'job-1',
    caseId: overrides.caseId ?? 'case-1',
    stepType: overrides.stepType,
    status: overrides.status ?? 'Queued',
    resultJson: overrides.resultJson ?? null,
    errorMessage: overrides.errorMessage ?? null,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    completedAt: overrides.completedAt ?? null,
    runId: overrides.runId,
  };
}

describe('aiJobsSlice resume lifecycle', () => {
  let state: AiJobsState;

  beforeEach(() => {
    state = makeInitialStateWithRun('run-A');
  });

  it('resume should keep active queued request attached to same run', () => {
    const queuedJob = makeJob({
      id: 'job-queued',
      stepType: 'AdminComplaintClassification',
      status: 'Queued',
      runId: 'run-A',
    });

    state = reducer(state, upsertJob(queuedJob));

    expect(state.jobs.AdminComplaintClassification).toBeDefined();
    expect(state.jobs.AdminComplaintClassification?.status).toBe('Queued');
    expect(state.jobs.AdminComplaintClassification?.id).toBe('job-queued');
  });

  it('resume should keep active processing request attached to same run', () => {
    const processingJob = makeJob({
      id: 'job-processing',
      stepType: 'AdminComplaintFacts',
      status: 'Processing',
      runId: 'run-A',
    });

    state = reducer(state, upsertJob(processingJob));

    expect(state.jobs.AdminComplaintFacts).toBeDefined();
    expect(state.jobs.AdminComplaintFacts?.status).toBe('Processing');
    expect(state.jobs.AdminComplaintFacts?.id).toBe('job-processing');
  });

  it('upsertJob during resume should reject jobs from different run', () => {
    state = reducer(state, upsertJob(makeJob({
      id: 'job-valid',
      stepType: 'AdminComplaintClassification',
      status: 'Completed',
      runId: 'run-A',
    })));

    expect(state.jobs.AdminComplaintClassification).toBeDefined();

    state = reducer(state, upsertJob(makeJob({
      id: 'job-stale',
      stepType: 'AdminComplaintClassification',
      status: 'Completed',
      runId: 'run-B',
    })));

    expect(state.jobs.AdminComplaintClassification?.id).toBe('job-valid');
  });
});
