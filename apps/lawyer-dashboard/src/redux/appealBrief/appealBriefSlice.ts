import { createWorkflowSlice } from'../shared/createWorkflowSlice';
import { createWorkflowThunks } from'../shared/createWorkflowThunks';

export type {
 TAppealJudgmentData,
 TAppealReasoningAnalysis,
 TAppealGrounds,
 TAppealRequests,
 TAppealLegalBasis,
 TAppealFinalAssembly,
 TAppealBriefOutputs,
} from'../shared/workflowTypes';

import type { TAppealBriefOutputs, TAppealJudgmentData, TAppealReasoningAnalysis, TAppealGrounds, TAppealRequests, TAppealLegalBasis, TAppealFinalAssembly } from'../shared/workflowTypes';

export const appealBriefThunks = createWorkflowThunks('AppealBrief');

export const appealBriefSlice = createWorkflowSlice<TAppealBriefOutputs>({
 name:'appealBrief',
 initialOutputs: {
 1: null,
 2: null,
 3: null,
 4: null,
 5: null,
 6: null,
 },
 thunks: appealBriefThunks,
 stepHydrators: {
 1: (state, result) => { state.outputs[1] = result as TAppealJudgmentData; },
 2: (state, result) => { state.outputs[2] = result as TAppealReasoningAnalysis; },
 3: (state, result) => { state.outputs[3] = result as TAppealGrounds; },
 4: (state, result) => { state.outputs[4] = result as TAppealRequests; },
 5: (state, result) => { state.outputs[5] = result as TAppealLegalBasis; },
 6: (state, result) => { state.outputs[6] = result as TAppealFinalAssembly; },
 },
 maxSteps: 6,
});

export const { hydrateStep, resetWorkflow: resetAppealBrief, restoreSnapshot: restoreAppealBriefSnapshot } = appealBriefSlice.actions;

export default appealBriefSlice.reducer;
