import { createWorkflowSlice } from'../shared/createWorkflowSlice';
import { createWorkflowThunks } from'../shared/createWorkflowThunks';

export type {
 TComplaintClassification as TAdminComplaintClassification,
 TComplaintFactsDraft as TAdminComplaintFacts,
 TComplaintViolationAnalysis as TAdminComplaintViolation,
 TComplaintRequestsDraft as TAdminComplaintRequests,
 TComplaintFinalDocument,
 TAdminComplaintOutputs,
} from'../shared/workflowTypes';

import type { TAdminComplaintOutputs, TComplaintClassification, TComplaintFactsDraft, TComplaintViolationAnalysis, TComplaintRequestsDraft, TComplaintFinalDocument } from'../shared/workflowTypes';

export const adminComplaintThunks = createWorkflowThunks('AdminComplaint');

export const adminComplaintSlice = createWorkflowSlice<TAdminComplaintOutputs>({
 name:'adminComplaint',
 initialOutputs: {
 1: null,
 2: null,
 3: null,
 4: null,
 5: null,
 },
 thunks: adminComplaintThunks,
 stepHydrators: {
 1: (state, result) => { state.outputs[1] = result as TComplaintClassification; },
 2: (state, result) => { state.outputs[2] = result as TComplaintFactsDraft; },
 3: (state, result) => { state.outputs[3] = result as TComplaintViolationAnalysis; },
 4: (state, result) => { state.outputs[4] = result as TComplaintRequestsDraft; },
 5: (state, result) => { state.outputs[5] = result as TComplaintFinalDocument; },
 },
 maxSteps: 5,
});

export const { hydrateStep, resetWorkflow: resetAdminComplaint, restoreSnapshot: restoreAdminComplaintSnapshot } = adminComplaintSlice.actions;

export default adminComplaintSlice.reducer;
