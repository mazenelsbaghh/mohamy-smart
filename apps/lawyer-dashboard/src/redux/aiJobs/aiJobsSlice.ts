import { createSlice, type PayloadAction } from"@reduxjs/toolkit";
import type { TLoading } from"../../types/types";
import { isString } from"@mohamy/shared-utils";
import thunkGetAllAiJobs from"./thunk/thunkGetAllAiJobs";
import thunkCancelAiJob from"./thunk/thunkCancelAiJob";
import thunkSubmitAiJob from"./thunk/thunkSubmitAiJob";
import type { AiChargeMetadata } from './aiPointTypes';

export type AiJobStatus ='Queued' |'Processing' |'Completed' |'Failed' |'Conflict';

export type AiStepType =
 |'FactAnalysis' |'GenerateDefenses' |'AnalysisDefense' |'FinalRequirements'
 |'DefenseMemoDraft'
 |'LawsuitCaseType' |'LawsuitParties' |'LawsuitSubjects'
 |'LawsuitFacts' |'LawsuitLegalBasis' |'LawsuitRequests'
 |'Ocr'
 // Legal Warning
 |'LegalWarningClassification' |'LegalWarningBodyDraft' |'LegalWarningAssembly'
 // Ruling Analysis
 |'RulingAnalysisOperative' |'RulingAnalysisReasoning'
 |'RulingAnalysisDefectEvaluation' |'RulingAnalysisFeasibilityReport'
 // Admin Complaint
 |'AdminComplaintClassification' |'AdminComplaintFacts'
 |'AdminComplaintViolation' |'AdminComplaintRequests' |'AdminComplaintAssembly'
 // Exec Request
 |'ExecRequestClassification' |'ExecRequestDrafting' |'ExecRequestAssembly'
 // Appeal Brief
 |'AppealBriefJudgmentData' |'AppealBriefReasoningAnalysis' |'AppealBriefGrounds'
 |'AppealBriefRequests' |'AppealBriefLegalBasis' |'AppealBriefAssembly';

export type AiJob = {
  id: string;
  caseId: string;
  stepType: AiStepType;
  status: AiJobStatus;
  resultJson: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  runId?: string | number | null;
  workflowType?: string | null;
  stepNumber?: number | null;
  errorCode?: string | null;
  conflictMessage?: string | null;
  charge?: AiChargeMetadata | null;
};

type TAiJobsState = {
  jobs: Partial<Record<AiStepType, AiJob>>;
  loading: TLoading;
  error: string | null;
  activeRunId: string | number | null;
};

const initialState: TAiJobsState = {
  jobs: {},
  loading:'idle',
  error: null,
  activeRunId: null,
};

const aiJobsSlice = createSlice({
 name:'aiJobs',
 initialState,
 reducers: {
  upsertJob(state, action: PayloadAction<AiJob>) {
  const job = action.payload;
  if (state.activeRunId !== null && job.runId !== undefined && job.runId !== null && String(job.runId) !== String(state.activeRunId)) {
  return;
  }
  state.jobs[job.stepType] = job;
  },
  setActiveRunId(state, action: PayloadAction<string | number | null>) {
  state.activeRunId = action.payload;
  },
  resetAiJobs(state) {
 state.jobs = {};
 state.loading ='idle';
 state.error = null;
 },
 },
 extraReducers: (builder) => {
 builder
 .addCase(thunkGetAllAiJobs.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetAllAiJobs.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.jobs = {};
 for (const job of action.payload) {
 state.jobs[job.stepType] = job;
 }
 })
 .addCase(thunkGetAllAiJobs.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) state.error = action.payload;
 })
 .addCase(thunkSubmitAiJob.fulfilled, (state, action) => {
 state.jobs[action.payload.stepType] = action.payload;
 })
 .addCase(thunkCancelAiJob.fulfilled, (state, action) => {
 state.jobs[action.payload.stepType] = action.payload;
 })
 .addCase(thunkSubmitAiJob.rejected, (state, action) => {
 if (isString(action.payload)) state.error = action.payload;
 })
 .addCase(thunkCancelAiJob.rejected, (state, action) => {
 if (isString(action.payload)) state.error = action.payload;
 });
 },
});

export const { upsertJob, resetAiJobs, setActiveRunId } = aiJobsSlice.actions;
export default aiJobsSlice.reducer;
