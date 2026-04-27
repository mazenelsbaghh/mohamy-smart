import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { AiJob, AiStepType } from'../aiJobsSlice';

const thunkCancelAiJob = createAsyncThunk('aiJobs/cancel',
 async ({ caseId, stepType }: { caseId: string; stepType: AiStepType }, { rejectWithValue }) => {
 try {
 const res = await api.post(`/cases/${caseId}/ai-jobs/${stepType}/cancel`);
 return res.data.data as AiJob;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkCancelAiJob;
