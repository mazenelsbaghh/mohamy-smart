import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { AiJob, AiStepType } from'../aiJobsSlice';
import type { AiRepeatIntent } from '../aiPointTypes';
import type { RootState } from'../../store';
import { WORKFLOW_STEP_METADATA, isActiveAiJob } from '../workflowJobMetadata';

type SubmitAiJobArgs = { caseId: string; stepType: AiStepType; inputJson: string; runId?: string | number | null; workflowType?: string | null; stepNumber?: number | null; repeatIntent?: AiRepeatIntent | null; confirmationAcceptedAt?: string | null };

const inflightSubmissions = new Set<string>();

const buildSubmissionKey = ({
 caseId,
 stepType,
 runId,
 repeatIntent,
 confirmationAcceptedAt,
}: Pick<SubmitAiJobArgs,'caseId' |'stepType' | 'runId' | 'repeatIntent' | 'confirmationAcceptedAt'>) =>
 `${caseId}:${runId ?? 'case'}:${stepType}:${repeatIntent ?? 'initial'}:${confirmationAcceptedAt ?? 'none'}`;

const thunkSubmitAiJob = createAsyncThunk('aiJobs/submit',
 async (
  { caseId, stepType, inputJson, runId, workflowType, stepNumber, repeatIntent, confirmationAcceptedAt }: SubmitAiJobArgs,
 { rejectWithValue, getState }
 ) => {
 const state = getState() as RootState;
 const metadata = WORKFLOW_STEP_METADATA[stepType];
 const effectiveRunId = runId ?? state.aiJobs.activeRunId;
 const effectiveWorkflowType = workflowType ?? metadata?.workflowType ?? null;
 const effectiveStepNumber = stepNumber ?? metadata?.stepNumber ?? null;
 const submissionKey = buildSubmissionKey({ caseId, stepType, runId: effectiveRunId, repeatIntent, confirmationAcceptedAt });

 try {
  const res = await api.post(`/cases/${caseId}/ai-jobs`, {
  stepType,
  inputJson,
  runId: effectiveRunId,
  workflowType: effectiveWorkflowType,
  stepNumber: effectiveStepNumber,
  repeatIntent: repeatIntent ?? null,
  confirmationAcceptedAt: confirmationAcceptedAt ?? null,
  });
 return res.data.data as AiJob;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 } finally {
 inflightSubmissions.delete(submissionKey);
 }
 },
 {
 condition({ caseId, stepType, runId, repeatIntent, confirmationAcceptedAt }: SubmitAiJobArgs, { getState }) {
 const state = getState() as RootState;
 const effectiveRunId = runId ?? state.aiJobs.activeRunId;
 const submissionKey = buildSubmissionKey({ caseId, stepType, runId: effectiveRunId, repeatIntent, confirmationAcceptedAt });
 if (inflightSubmissions.has(submissionKey)) return false;

 const existingJob = state.aiJobs.jobs[stepType];
 const sameRun = existingJob && (
 effectiveRunId == null
  ? existingJob.runId == null
  : existingJob.runId != null && String(existingJob.runId) === String(effectiveRunId)
 );

 if (existingJob && existingJob.caseId === caseId && sameRun && isActiveAiJob(existingJob)) {
 return false;
 }

 inflightSubmissions.add(submissionKey);
 return true;
 },
 }
);

export default thunkSubmitAiJob;
