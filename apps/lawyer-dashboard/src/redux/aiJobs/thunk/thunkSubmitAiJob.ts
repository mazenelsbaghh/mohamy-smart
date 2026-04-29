import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { AiJob, AiStepType } from'../aiJobsSlice';
import type { RootState } from'../../store';

type SubmitAiJobArgs = { caseId: string; stepType: AiStepType; inputJson: string; runId?: string | number | null; workflowType?: string | null; stepNumber?: number | null };

const inflightSubmissions = new Set<string>();

const WORKFLOW_STEP_METADATA: Partial<Record<AiStepType, { workflowType: string; stepNumber: number }>> = {
 LawsuitCaseType: { workflowType: 'preparing-statement-of-claims', stepNumber: 1 },
 LawsuitParties: { workflowType: 'preparing-statement-of-claims', stepNumber: 2 },
 LawsuitSubjects: { workflowType: 'preparing-statement-of-claims', stepNumber: 3 },
 LawsuitFacts: { workflowType: 'preparing-statement-of-claims', stepNumber: 4 },
 LawsuitLegalBasis: { workflowType: 'preparing-statement-of-claims', stepNumber: 5 },
 LawsuitRequests: { workflowType: 'preparing-statement-of-claims', stepNumber: 6 },
 AppealBriefJudgmentData: { workflowType: 'appeal-brief', stepNumber: 1 },
 AppealBriefReasoningAnalysis: { workflowType: 'appeal-brief', stepNumber: 2 },
 AppealBriefGrounds: { workflowType: 'appeal-brief', stepNumber: 3 },
 AppealBriefRequests: { workflowType: 'appeal-brief', stepNumber: 4 },
 AppealBriefLegalBasis: { workflowType: 'appeal-brief', stepNumber: 5 },
 AppealBriefAssembly: { workflowType: 'appeal-brief', stepNumber: 6 },
 AdminComplaintClassification: { workflowType: 'admin-complaint', stepNumber: 1 },
 AdminComplaintFacts: { workflowType: 'admin-complaint', stepNumber: 2 },
 AdminComplaintViolation: { workflowType: 'admin-complaint', stepNumber: 3 },
 AdminComplaintRequests: { workflowType: 'admin-complaint', stepNumber: 4 },
 AdminComplaintAssembly: { workflowType: 'admin-complaint', stepNumber: 5 },
 RulingAnalysisOperative: { workflowType: 'ruling-analysis', stepNumber: 1 },
 RulingAnalysisReasoning: { workflowType: 'ruling-analysis', stepNumber: 2 },
 RulingAnalysisDefectEvaluation: { workflowType: 'ruling-analysis', stepNumber: 3 },
 RulingAnalysisFeasibilityReport: { workflowType: 'ruling-analysis', stepNumber: 4 },
 LegalWarningClassification: { workflowType: 'legal-warning', stepNumber: 1 },
 LegalWarningBodyDraft: { workflowType: 'legal-warning', stepNumber: 2 },
 LegalWarningAssembly: { workflowType: 'legal-warning', stepNumber: 3 },
 ExecRequestClassification: { workflowType: 'exec-request', stepNumber: 1 },
 ExecRequestDrafting: { workflowType: 'exec-request', stepNumber: 2 },
 ExecRequestAssembly: { workflowType: 'exec-request', stepNumber: 3 },
};

const buildSubmissionKey = ({ caseId, stepType, runId }: Pick<SubmitAiJobArgs,'caseId' |'stepType' | 'runId'>) =>
 `${caseId}:${runId ?? 'case'}:${stepType}`;

const thunkSubmitAiJob = createAsyncThunk('aiJobs/submit',
 async (
  { caseId, stepType, inputJson, runId, workflowType, stepNumber }: SubmitAiJobArgs,
 { rejectWithValue, getState }
 ) => {
 const state = getState() as RootState;
 const metadata = WORKFLOW_STEP_METADATA[stepType];
 const effectiveRunId = runId ?? state.aiJobs.activeRunId;
 const effectiveWorkflowType = workflowType ?? metadata?.workflowType ?? null;
 const effectiveStepNumber = stepNumber ?? metadata?.stepNumber ?? null;
 const submissionKey = buildSubmissionKey({ caseId, stepType, runId: effectiveRunId });

 try {
  const res = await api.post(`/cases/${caseId}/ai-jobs`, {
  stepType,
  inputJson,
  runId: effectiveRunId,
  workflowType: effectiveWorkflowType,
  stepNumber: effectiveStepNumber,
  });
 return res.data.data as AiJob;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 } finally {
 inflightSubmissions.delete(submissionKey);
 }
 },
 {
 condition({ caseId, stepType, runId }: SubmitAiJobArgs, { getState }) {
 const state = getState() as RootState;
 const effectiveRunId = runId ?? state.aiJobs.activeRunId;
 const submissionKey = buildSubmissionKey({ caseId, stepType, runId: effectiveRunId });
 if (inflightSubmissions.has(submissionKey)) return false;

 const existingJob = state.aiJobs.jobs[stepType];
 if (
 existingJob &&
 existingJob.caseId === caseId &&
 (effectiveRunId == null || existingJob.runId == null || String(existingJob.runId) === String(effectiveRunId)) &&
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
