import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { AiJob } from'../aiJobsSlice';
import { isActiveAiJob, workflowMatchesFilter } from '../workflowJobMetadata';

/** Prevents concurrent duplicate fetches for the same case. */
const inflightFetches = new Set<string>();

const thunkGetAllAiJobs = createAsyncThunk('aiJobs/getAll',
 async ({ caseId, since, runId, workflowType, stepNumber, includeLegacyActive = true }: { caseId: string; since?: string | null; runId?: string | number | null; workflowType?: string | null; stepNumber?: number | null; includeLegacyActive?: boolean }, { rejectWithValue }) => {
  inflightFetches.add(caseId);
  try {
  const params = new URLSearchParams();
  if (runId !== undefined && runId !== null) params.append('runId', String(runId));
  if (workflowType) params.append('workflowType', workflowType);
  if (since) params.append('since', since.endsWith("Z") ? since : `${since}Z`);
  if (stepNumber != null) params.append('stepNumber', String(stepNumber));
  params.append('includeLegacyActive', String(includeLegacyActive));
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await api.get(`/cases/${caseId}/ai-jobs${query}`);
  let jobs = res.data.data as AiJob[];
  if (workflowType) {
  jobs = jobs.filter((job) => workflowMatchesFilter(job, workflowType));
  }
  if (runId != null) {
  jobs = jobs.filter((job) => {
  if (job.runId != null) return String(job.runId) === String(runId);
  return includeLegacyActive && isActiveAiJob(job) && workflowMatchesFilter(job, workflowType);
  });
  }
  if (since) {
  const sinceTime = new Date(since.endsWith("Z") ? since : `${since}Z`).getTime();
  jobs = jobs.filter((job) => new Date(job.createdAt.endsWith("Z") ? job.createdAt : `${job.createdAt}Z`).getTime() >= sinceTime - 10000);
  }
  if (runId != null && workflowType) {
  const activeParams = new URLSearchParams();
  activeParams.append('runId', String(runId));
  activeParams.append('workflowType', workflowType);
  if (stepNumber != null) activeParams.append('stepNumber', String(stepNumber));
  try {
  const activeRes = await api.get(`/cases/${caseId}/ai-jobs/active?${activeParams.toString()}`);
  const activePayload = activeRes.data?.data ?? activeRes.data;
  const activeJobs = (Array.isArray(activePayload) ? activePayload : activePayload ? [activePayload] : []) as AiJob[];
  const existingIds = new Set(jobs.map((j) => j.id));
  for (const aj of activeJobs) {
  if (!existingIds.has(aj.id)) jobs.push(aj);
  }
  } catch { /* active endpoint optional */ }
  }
  return jobs;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 } finally {
 inflightFetches.delete(caseId);
 }
 },
 {
 // Drop the dispatch silently if a fetch for this case is already in-flight
  condition: ({ caseId }: { caseId: string; since?: string | null; runId?: string | number | null; workflowType?: string | null; stepNumber?: number | null; includeLegacyActive?: boolean }) => {
 if (inflightFetches.has(caseId)) return false;
 return true;
 },
 }
);

export default thunkGetAllAiJobs;
