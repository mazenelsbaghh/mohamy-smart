import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../APIs/api";
import { axiosErrorHandler } from "@mohamy/shared-api";
import type { AiJob } from '../aiJobsSlice';
import { upsertJob } from '../aiJobsSlice';

export type DefenseSubmission = {
  defenseId: string;
  clientDefenseId: string;
  defenseTitle: string;
  basisFromCase: string;
  scope: string;
};

type ParallelDefenseArgs = {
  caseId: string;
  defenses: DefenseSubmission[];
};

type ParallelDefenseResult = {
  submitted: Array<{ defenseId: string; jobId: string }>;
  failed: Array<{ defenseId: string; error: string }>;
};

const LOCAL_DEFENSE_GUID = '00000000-0000-0000-0000-000000000000';

const thunkSubmitParallelDefenseAnalyses = createAsyncThunk<ParallelDefenseResult, ParallelDefenseArgs>(
  'aiJobs/submitParallelDefenseAnalyses',
  async ({ caseId, defenses }, { dispatch, rejectWithValue, signal }) => {
    try {
      const delay = (ms: number) => new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
      });

      const promises = defenses.map(async (defense, index) => {
        // Check if aborted before starting this defense
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

        // Stagger submissions sequentially to guarantee no overlap — prevents SQL deadlocks
        if (index > 0) await delay(index * 800);

        // Check again after the delay
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

        const isLocal = defense.defenseId.startsWith('local-');
        const inputJson = JSON.stringify({
          defenseId: isLocal ? LOCAL_DEFENSE_GUID : defense.defenseId,
          clientDefenseId: defense.clientDefenseId,
          caseId,
          defenseTitle: defense.defenseTitle,
          basisFromCase: defense.basisFromCase,
          scope: defense.scope,
        });

        const res = await api.post(`/cases/${caseId}/ai-jobs`, {
          stepType: 'AnalysisDefense',
          inputJson,
          runId: defense.clientDefenseId,
        }, { signal });

        return {
          defenseId: defense.defenseId,
          job: res.data.data as AiJob,
        };
      });

      const results = await Promise.allSettled(promises);

      const submitted: ParallelDefenseResult['submitted'] = [];
      const failed: ParallelDefenseResult['failed'] = [];

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const defense = defenses[i];

        if (result.status === 'fulfilled') {
          dispatch(upsertJob(result.value.job));
          submitted.push({
            defenseId: result.value.defenseId,
            jobId: result.value.job.id,
          });
        } else {
          failed.push({
            defenseId: defense.defenseId,
            error: axiosErrorHandler(result.reason),
          });
        }
      }

      return { submitted, failed };
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);

export default thunkSubmitParallelDefenseAnalyses;
