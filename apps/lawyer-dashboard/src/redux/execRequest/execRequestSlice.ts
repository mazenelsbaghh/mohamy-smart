import { createWorkflowSlice } from'../shared/createWorkflowSlice';
import { createWorkflowThunks } from'../shared/createWorkflowThunks';

export type {
 TExecClassification as TExecRequestClassification,
 TExecDrafting as TExecRequestDrafting,
 TExecFinalAssembly,
 TExecRequestOutputs,
} from'../shared/workflowTypes';

import type { TExecRequestOutputs, TExecClassification, TExecDrafting, TExecFinalAssembly } from'../shared/workflowTypes';

export const execRequestThunks = createWorkflowThunks('ExecRequest');

export const execRequestSlice = createWorkflowSlice<TExecRequestOutputs>({
 name:'execRequest',
 initialOutputs: {
 1: null,
 2: null,
 3: null,
 },
 thunks: execRequestThunks,
 stepHydrators: {
 1: (state, result) => { state.outputs[1] = result as TExecClassification; },
 2: (state, result) => { state.outputs[2] = result as TExecDrafting; },
 3: (state, result) => { state.outputs[3] = result as TExecFinalAssembly; },
 },
 maxSteps: 3,
});

export const { hydrateStep, resetWorkflow: resetExecRequest, restoreSnapshot: restoreExecRequestSnapshot } = execRequestSlice.actions;

export default execRequestSlice.reducer;
