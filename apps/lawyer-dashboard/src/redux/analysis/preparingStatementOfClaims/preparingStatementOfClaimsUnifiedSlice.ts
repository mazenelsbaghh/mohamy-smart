import { createWorkflowSlice } from'../../shared/createWorkflowSlice';
import { createWorkflowThunks } from'../../shared/createWorkflowThunks';

export type {
 TCaseDetails,
 TLawsuitParty,
 TLawsuitParties,
 TLawsuitSubjects,
 TLawsuitLegalBasis,
 TLawsuitRequests,
 TStatementOfClaimsOutputs,
} from'../../shared/workflowTypes';

import type {
 TCaseDetails,
 TLawsuitSubjects as TLawsuitSubjectsType,
 TLawsuitLegalBasis as TLawsuitLegalBasisType,
 TLawsuitRequests as TLawsuitRequestsType,
 TStatementOfClaimsOutputs,
} from'../../shared/workflowTypes';

type TStepOutputs = TStatementOfClaimsOutputs;

export const statementOfClaimsThunks = createWorkflowThunks('PreparingStatementOfClaims', { supportsVersions: false });

import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

export const abandonStatementOfClaimsWorkflow = createAsyncThunk('preparingStatementOfClaims/abandonWorkflow',
 async (caseId: string, { rejectWithValue }) => {
 try {
 await api.post(`/PreparingStatementOfClaims/${caseId}/abandon`);
 return caseId;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const statementOfClaimsSlice = createWorkflowSlice<TStepOutputs>({
 name:'preparingStatementOfClaims',
 initialOutputs: {
 1: null,
 2: null,
 3: null,
 4: null,
 5: null,
 6: null,
 7:'',
 },
 thunks: statementOfClaimsThunks,
 stepHydrators: {
 1: (state, result) => {
 const r = result as Record<string, unknown>;
 state.outputs[1] = {
 caseId: r.caseId as string,
 caseMainType: (r.caseMainType ?? r.case_main_type ??'') as string,
 caseSubType: (r.caseSubType ?? r.case_sub_type ??'') as string,
 courtType: (r.courtType ?? r.court_type ??'') as string,
 proceduralNature: (r.proceduralNature ?? r.procedural_nature ??'') as string,
 isUrgentOrSummary: (r.isUrgentOrSummary ?? r.is_urgent_or_summary ??'') as string,
 justificationSummary: (r.justificationSummary ?? r.justification_summary ??'') as string,
 } as TCaseDetails;
 },
 3: (state, result) => {
 const r = result as Record<string, unknown>;
 state.outputs[3] = {
 caseId: r.caseId as string,
 subjectTitle: (r.subjectTitle ?? r.subject_title ??'') as string,
 subjectFullText: (r.subjectFullText ?? r.subject_full_text ??'') as string,
 } as TLawsuitSubjectsType;
 },
 4: (state, result) => {
 const r = result as Record<string, unknown>;
 state.outputs[4] = {
 factsNarrative: (r.factsNarrative ?? r.facts_narrative ??'') as string,
 };
 },
 5: (state, result) => {
 const r = result as Record<string, unknown>;
 state.outputs[5] = {
 caseId: r.caseId as string,
 legalTexts: ((r.legalTexts ?? r.legal_texts ?? []) as Record<string, unknown>[])?.map((lt) => ({
 id: lt.id as string,
 lawName: (lt.lawName ?? lt.law_name ??'') as string,
 articleNumber: (lt.articleNumber ?? lt.article_number ??'') as string,
 articleText: (lt.articleText ?? lt.article_text ??'') as string,
 applicationNotes: (lt.applicationNotes ?? lt.application_notes ??'') as string,
 })),
 cassationRulings: ((r.cassationRulings ?? r.cassation_rulings ?? []) as Record<string, unknown>[])?.map((cr) => ({
 id: cr.id as string,
 court: (cr.court ??'') as string,
 appealNumber: (cr.appealNumber ?? cr.appeal_number ??'') as string,
 judicialYear: (cr.judicialYear ?? cr.judicial_year ??'') as string,
 sessionDate: (cr.sessionDate ?? cr.session_date ??'') as string,
 rulingText: (cr.rulingText ?? cr.ruling_text ??'') as string,
 applicationNotes: (cr.applicationNotes ?? cr.application_notes ??'') as string,
 })),
 } as TLawsuitLegalBasisType;
 },
 6: (state, result) => {
 const r = result as Record<string, unknown>;
 state.outputs[6] = {
 caseId: r.caseId as string,
 principalRequests: ((r.principalRequests ?? r.principal_requests ?? []) as Record<string, unknown>[])?.map((pr) => ({
 id: pr.id as string,
 requestNumber: (pr.requestNumber ?? pr.request_number ?? 0) as number,
 requestText: (pr.requestText ?? pr.request_text ??'') as string,
 legalReference: (pr.legalReference ?? pr.legal_reference ??'') as string,
 })),
 subsidiaryRequests: ((r.subsidiaryRequests ?? r.subsidiary_requests ?? []) as Record<string, unknown>[])?.map((sr) => ({
 id: sr.id as string,
 requestNumber: (sr.requestNumber ?? sr.request_number ?? 0) as number,
 requestText: (sr.requestText ?? sr.request_text ??'') as string,
 legalReference: (sr.legalReference ?? sr.legal_reference ??'') as string,
 })),
 proceduralRequests: ((r.proceduralRequests ?? r.procedural_requests ?? []) as Record<string, unknown>[])?.map((pr) => ({
 id: pr.id as string,
 requestNumber: (pr.requestNumber ?? pr.request_number ?? 0) as number,
 requestText: (pr.requestText ?? pr.request_text ??'') as string,
 legalReference: (pr.legalReference ?? pr.legal_reference ??'') as string,
 })),
 } as TLawsuitRequestsType;
 },
 7: (state, result) => {
 const r = result as Record<string, unknown>;
 state.outputs[7] = (r.draftHtml ?? r.draft_html ??'') as string;
 },
 },
  maxSteps: 7,
  reducers: {
    restoreStatementSnapshot: (state: import('@reduxjs/toolkit').Draft<import('../../shared/workflowTypes').TypedWorkflowState<TStepOutputs>>, action: import('@reduxjs/toolkit').PayloadAction<{
      outputs: Record<number, unknown>;
      currentStep?: number;
      lastSavedAt?: string | null;
    }>) => {
      state.workflowId = null;
      state.caseId = state.caseId ?? null;
      state.currentStep = action.payload.currentStep ?? 7;
      state.status = 'Completed' as import('../../shared/workflowTypes').WorkflowStatus;
      state.lastSavedAt = action.payload.lastSavedAt ?? null;
      state.isReadOnly = true;
      for (let i = 1; i <= 7; i++) {
        (state.outputs as Record<number, unknown>)[i] = action.payload.outputs[i] ?? null;
      }
    },
  },
});

export const { hydrateStep: hydrateStatementStep, resetWorkflow: resetStatementOfClaims, restoreStatementSnapshot } = statementOfClaimsSlice.actions;
export default statementOfClaimsSlice.reducer;
