import { createWorkflowSlice } from'../shared/createWorkflowSlice';
import { createWorkflowThunks } from'../shared/createWorkflowThunks';

export type {
 TWarningClassification as TLegalWarningClassification,
 TWarningDraft as TLegalWarningBodyDraft,
 TWarningFinalDocument,
 TLegalWarningOutputs,
} from'../shared/workflowTypes';

import type { TLegalWarningOutputs, TWarningClassification, TWarningDraft, TWarningFinalDocument } from'../shared/workflowTypes';

export const legalWarningThunks = createWorkflowThunks('LegalWarning');

export const legalWarningSlice = createWorkflowSlice<TLegalWarningOutputs>({
 name:'legalWarning',
 initialOutputs: {
 1: null,
 2: null,
 3: null,
 },
 thunks: legalWarningThunks,
 stepHydrators: {
 1: (state, result) => { state.outputs[1] = result as TWarningClassification; },
 2: (state, result) => { state.outputs[2] = result as TWarningDraft; },
 3: (state, result) => { state.outputs[3] = result as TWarningFinalDocument; },
 },
 maxSteps: 3,
});

export const { hydrateStep, resetWorkflow: resetLegalWarning, restoreSnapshot: restoreLegalWarningSnapshot } = legalWarningSlice.actions;

export default legalWarningSlice.reducer;
