import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { AiJob } from'../aiJobsSlice';

/** Prevents concurrent duplicate fetches for the same case. */
const inflightFetches = new Set<string>();

const thunkGetAllAiJobs = createAsyncThunk('aiJobs/getAll',
 async ({ caseId, since }: { caseId: string; since?: string | null }, { rejectWithValue }) => {
 inflightFetches.add(caseId);
 try {
 const res = await api.get(`/cases/${caseId}/ai-jobs`);
 let jobs = res.data.data as AiJob[];
 if (since) {
 const sinceTime = new Date(since.endsWith("Z") ? since : `${since}Z`).getTime();
 jobs = jobs.filter((job) => new Date(job.createdAt.endsWith("Z") ? job.createdAt : `${job.createdAt}Z`).getTime() >= sinceTime - 10000);
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
 condition: ({ caseId }: { caseId: string; since?: string | null }) => {
 if (inflightFetches.has(caseId)) return false;
 return true;
 },
 }
);

export default thunkGetAllAiJobs;
