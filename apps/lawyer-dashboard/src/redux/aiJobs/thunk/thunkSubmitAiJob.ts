import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { AiJob, AiStepType } from'../aiJobsSlice';
import type { RootState } from'../../store';

type SubmitAiJobArgs = { caseId: string; stepType: AiStepType; inputJson: string };

const inflightSubmissions = new Set<string>();

const buildSubmissionKey = ({ caseId, stepType }: Pick<SubmitAiJobArgs,'caseId' |'stepType'>) =>
 `${caseId}:${stepType}`;

const thunkSubmitAiJob = createAsyncThunk('aiJobs/submit',
 async (
 { caseId, stepType, inputJson }: SubmitAiJobArgs,
 { rejectWithValue }
 ) => {
 const submissionKey = buildSubmissionKey({ caseId, stepType });

 try {
 const res = await api.post(`/cases/${caseId}/ai-jobs`, {
 stepType,
 inputJson,
 });
 return res.data.data as AiJob;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 } finally {
 inflightSubmissions.delete(submissionKey);
 }
 },
 {
 condition: ({ caseId, stepType }: SubmitAiJobArgs, { getState }) => {
 const submissionKey = buildSubmissionKey({ caseId, stepType });
 if (inflightSubmissions.has(submissionKey)) return false;

 const state = getState() as RootState;
 const existingJob = state.aiJobs.jobs[stepType];
 if (
 existingJob &&
 existingJob.caseId === caseId &&
 (existingJob.status ==='Queued' || existingJob.status ==='Processing')
 ) {
 return false;
 }

 inflightSubmissions.add(submissionKey);
 return true;
 },
 }
);

export default thunkSubmitAiJob;
