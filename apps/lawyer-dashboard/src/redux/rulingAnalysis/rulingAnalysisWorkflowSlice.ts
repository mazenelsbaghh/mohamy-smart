import { createWorkflowSlice } from'../shared/createWorkflowSlice';
import { createWorkflowThunks } from'../shared/createWorkflowThunks';
import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../APIs/api';
import { axiosErrorHandler } from"@mohamy/shared-api";

export type {
 TVerdictAnalysis,
 TReasonsAnalysis,
 TDefectsEvaluation,
 TAppealViability,
} from'../shared/workflowTypes';

import type { TVerdictAnalysis, TReasonsAnalysis, TDefectsEvaluation, TAppealViability } from'../shared/workflowTypes';

export const rulingAnalysisThunks = createWorkflowThunks('RulingAnalysis');

export const abandonRulingAnalysisWorkflow = createAsyncThunk('rulingAnalysis/abandonWorkflow',
 async (caseId: string, { rejectWithValue }) => {
 try {
 await api.post(`/RulingAnalysis/${caseId}/abandon`);
 return caseId;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

type TRulingOutputs = {
 1?: TVerdictAnalysis;
 2?: TReasonsAnalysis;
 3?: TDefectsEvaluation;
 4?: TAppealViability;
};

export const rulingAnalysisWorkflowSlice = createWorkflowSlice<TRulingOutputs>({
 name:'rulingAnalysis',
 initialOutputs: { 1: null, 2: null, 3: null, 4: null },
 thunks: rulingAnalysisThunks,
 maxSteps: 4,
});

export const {
 hydrateStep: hydrateRulingStep,
 resetWorkflow: resetRulingAnalysis,
 restoreSnapshot: restoreRulingAnalysisSnapshot,
} = rulingAnalysisWorkflowSlice.actions;

export default rulingAnalysisWorkflowSlice.reducer;
