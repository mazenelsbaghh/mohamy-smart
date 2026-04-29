import type { PayloadAction } from'@reduxjs/toolkit';
import { createWorkflowSlice } from'../shared/createWorkflowSlice';
import { createWorkflowThunks } from'../shared/createWorkflowThunks';
import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../APIs/api';
import { axiosErrorHandler } from"@mohamy/shared-api";

export type {
 TDefense,
 TDefenses,
 TFactAnalysis,
 TFinalRequirements,
 TFinalRequirementsWrapper,
 TDefenseMemorandum,
 TAnalysisDefenses,
} from'../shared/workflowTypes';

import type { TFactAnalysis, TDefenses, TDefense, TFinalRequirementsWrapper, TAnalysisDefenses } from'../shared/workflowTypes';

const smartAnalysisBaseThunks = createWorkflowThunks('SmartAnalysis');

const startSmartAnalysisWorkflow = createAsyncThunk(
 'smartAnalysis/startWorkflow',
 async ({ caseId }: { caseId: string }) => ({
 id: undefined,
 caseId,
 currentStep: 1,
 status:'InProgress',
 createdAt: new Date().toISOString(),
 })
);

export const smartAnalysisThunks = {
 ...smartAnalysisBaseThunks,
 startWorkflow: startSmartAnalysisWorkflow,
};

export const thunkGetDefenseAnalysis = createAsyncThunk('smartAnalysis/getDefenseAnalysis',
 async ({ defenseId }: { defenseId: string }, { rejectWithValue }) => {
 try {
 const res = await api.get(`/SmartAnalysis/defense-analysis/${defenseId}`);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkCreateDefense = createAsyncThunk('smartAnalysis/createDefense',
 async ({ caseId, defenseTitle }: { caseId: string; defenseTitle: string }, { rejectWithValue }) => {
 try {
 const res = await api.post('/SmartAnalysis/defenses', {
 caseId,
 defenseTitle,
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkUpdateDefenseTitle = createAsyncThunk('smartAnalysis/updateDefenseTitle',
 async ({ defenseId, defenseTitle }: { defenseId: string; defenseTitle: string }, { rejectWithValue }) => {
 try {
 const res = await api.put(`/SmartAnalysis/defenses/${defenseId}`, {
 defenseTitle,
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkDeleteDefense = createAsyncThunk('smartAnalysis/deleteDefense',
 async ({ defenseId }: { defenseId: string }, { rejectWithValue }) => {
 try {
 await api.delete(`/SmartAnalysis/defenses/${defenseId}`);
 return defenseId;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const abandonSmartAnalysisWorkflow = createAsyncThunk('smartAnalysis/abandonWorkflow',
 async (caseId: string, { rejectWithValue }) => {
 try {
 await api.post(`/SmartAnalysis/${caseId}/abandon`);
 return caseId;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

// Unified Slice
const emptyDefenses = (): NonNullable<TDefenses> => ({
 defensesFormal: [],
 defensesSubstantive: [],
 defensesEvidentiary: [],
});

const removeDefenseFromGroups = (defenses: NonNullable<TDefenses>, defenseId: string) => {
 defenses.defensesFormal = defenses.defensesFormal.filter((d) => d.id !== defenseId);
 defenses.defensesSubstantive = defenses.defensesSubstantive.filter((d) => d.id !== defenseId);
 defenses.defensesEvidentiary = defenses.defensesEvidentiary.filter((d) => d.id !== defenseId);
};

export const smartAnalysisSlice = createWorkflowSlice<{
 1?: TFactAnalysis;
 2?: TDefenses;
 3?: TAnalysisDefenses; // Depending on how the backend mapped it.
 4?: TFinalRequirementsWrapper;
 5?: string; // Defense Memo Draft
}>({
 name:'smartAnalysis',
 initialOutputs: {
 1: null,
 2: null,
 3: null,
 4: null,
 5:'',
 },
 thunks: smartAnalysisThunks,
 stepHydrators: {
 1: (state, result) => {
 if (!result) { state.outputs[1] = null; return; }
 const r = result as Record<string, unknown>;
 const plc = (r.potentialLegalCharacterization ?? r.potential_legal_characterization ?? {}) as Record<string, unknown>;
 state.outputs[1] = {
 caseType: (r.caseType ?? r.case_type ??'') as string,
 caseNumber: (r.caseNumber ?? r.case_number ??'') as string,
 courtName: (r.courtName ?? r.court_name ??'') as string,
 legalFactsSummary: (r.legalFactsSummary ?? r.legal_facts_summary ?? []) as string[],
 defendantsPositions: ((r.defendantsPositions ?? r.defendants_positions ?? r.opposingPartiesPositions ?? r.opposing_parties_positions ?? []) as Record<string, unknown>[]).map((p) => ({
 defendantName: (p.defendantName ?? p.defendant_name ?? p.partyName ?? p.party_name ??'') as string,
 relationshipToClient: (p.relationshipToClient ?? p.relationship_to_client ??'') as string,
 positionSummary: (p.positionSummary ?? p.position_summary ??'') as string,
 })),
 evidenceMap: ((r.evidenceMap ?? r.evidence_map ?? []) as Record<string, unknown>[]).map((e) => ({
 source: (e.source ??'') as string,
 proves: (e.proves ??'') as string,
 doesNotProve: (e.doesNotProve ?? e.does_not_prove ??'') as string,
 limitations: (e.limitations ??'') as string,
 })),
 legalAndTechnicalReviewPoints: (r.legalAndTechnicalReviewPoints ?? r.legal_and_technical_review_points ?? []) as string[],
 potentialLegalCharacterization: {
 chargeDescription: (plc.chargeDescription ?? plc.charge_description ??'') as string,
 elementsReliedUpon: (plc.elementsReliedUpon ?? plc.elements_relied_upon ?? []) as string[],
 elementsLackingProof: (plc.elementsLackingProof ?? plc.elements_lacking_proof ?? []) as string[],
 },
 } as TFactAnalysis;
 },
 2: (state, result) => {
 if (!result) { state.outputs[2] = null; return; }
 const r = result as Record<string, unknown>;
 const normalizeDefense = (d: Record<string, unknown>): TDefense => ({
 id: (d.id ??'') as string,
 defenseTitle: (d.defenseTitle ?? d.defense_title ??'') as string,
 basisFromCase: (d.basisFromCase ?? d.basis_from_case ??'') as string,
 scope: (d.scope ??'') as string,
 strength: (d.strength ??'Medium') as TDefense['strength'],
 });
 state.outputs[2] = {
 defensesFormal: ((r.defensesFormal ?? r.defenses_formal ?? []) as Record<string, unknown>[]).map(normalizeDefense),
 defensesSubstantive: ((r.defensesSubstantive ?? r.defenses_substantive ?? []) as Record<string, unknown>[]).map(normalizeDefense),
 defensesEvidentiary: ((r.defensesEvidentiary ?? r.defenses_evidentiary ?? []) as Record<string, unknown>[]).map(normalizeDefense),
 } as TDefenses;
 },
 3: (state, result) => {
 const r = result as Record<string, unknown> | null;
 const currentCache = state.outputs[3] || {};

 if (Array.isArray(r)) {
 for (const item of r as Record<string, unknown>[]) {
 const defenseId = (item.defenseId ?? item.defense_id) as string | undefined;
 if (!defenseId) continue;

 const rawJson = (item.explanationJson ?? item.explanation_json) as string | undefined;
 if (!rawJson) continue;

 let parsed: Record<string, unknown>;
 try {
 const obj = JSON.parse(rawJson);
 parsed = typeof obj ==='object' && obj !== null ? obj as Record<string, unknown> : {};
 } catch {
 continue;
 }

 const memo = (parsed.memorandum ?? parsed.explanation) as Record<string, unknown> | undefined;
 if (!memo) continue;

 (currentCache as Record<string, unknown>)[defenseId] = {
 introduction: (memo.introduction ??'') as string,
 factualBasis: (memo.factualBasis ?? memo.factual_basis ??'') as string,
 legalTextsFull: ((memo.legalTextsFull ?? memo.legal_texts_full ?? []) as Record<string, unknown>[]).map((t) => ({
 lawName: (t.lawName ?? t.law_name ??'') as string,
 articleNumber: (t.articleNumber ?? t.article_number ??'') as string,
 fullText: (t.fullText ?? t.full_text ??'') as string
 })),
 legalTextsUnavailableReason: (memo.legalTextsUnavailableReason ?? memo.legal_texts_unavailable_reason ??'') as string,
 linkingTextsToFacts: (memo.linkingTextsToFacts ?? memo.linking_texts_to_facts ??'') as string,
 cassationPrecedentsFull: ((memo.cassationPrecedentsFull ?? memo.cassation_precedents_full ?? []) as Record<string, unknown>[]).map((p) => ({
 appealNumber: (p.appealNumber ?? p.appeal_number ??'') as string,
 judicialYear: (p.judicialYear ?? p.judicial_year ??'') as string,
 sessionDate: (p.sessionDate ?? p.session_date ??'') as string,
 fullText: (p.fullText ?? p.full_text ??'') as string
 })),
 cassationPrecedentsUnavailableReason: (memo.cassationPrecedentsUnavailableReason ?? memo.cassation_precedents_unavailable_reason ??'') as string,
 legalApplication: (memo.legalApplication ?? memo.legal_application ??'') as string,
 counterArgumentsAndResponse: (memo.counterArgumentsAndResponse ?? memo.counter_arguments_and_response ??'') as string,
 legalEffectOfAcceptance: (memo.legalEffectOfAcceptance ?? memo.legal_effect_of_acceptance ??'') as string,
 strengthsAndRisks: (memo.strengthsAndRisks ?? memo.strengths_and_risks ??'') as string
 };
 }
 state.outputs[3] = currentCache;
 return;
 }

 if (r && (r.clientDefenseId || r.client_defense_id || r.defenseId || r.defense_id)) {
 const defenseId = (r.clientDefenseId ?? r.client_defense_id ?? r.defenseId ?? r.defense_id) as string;
 const memo = (r.memorandum || r.explanation) as Record<string, unknown> | undefined;
 if (memo) {
 state.outputs[3] = {
 ...currentCache,
 [defenseId]: {
 introduction: (memo.introduction ??'') as string,
 factualBasis: (memo.factualBasis ?? memo.factual_basis ??'') as string,
 legalTextsFull: ((memo.legalTextsFull ?? memo.legal_texts_full ?? []) as Record<string, unknown>[]).map((t) => ({
 lawName: (t.lawName ?? t.law_name ??'') as string,
 articleNumber: (t.articleNumber ?? t.article_number ??'') as string,
 fullText: (t.fullText ?? t.full_text ??'') as string
 })),
 legalTextsUnavailableReason: (memo.legalTextsUnavailableReason ?? memo.legal_texts_unavailable_reason ??'') as string,
 linkingTextsToFacts: (memo.linkingTextsToFacts ?? memo.linking_texts_to_facts ??'') as string,
 cassationPrecedentsFull: ((memo.cassationPrecedentsFull ?? memo.cassation_precedents_full ?? []) as Record<string, unknown>[]).map((p) => ({
 appealNumber: (p.appealNumber ?? p.appeal_number ??'') as string,
 judicialYear: (p.judicialYear ?? p.judicial_year ??'') as string,
 sessionDate: (p.sessionDate ?? p.session_date ??'') as string,
 fullText: (p.fullText ?? p.full_text ??'') as string
 })),
 cassationPrecedentsUnavailableReason: (memo.cassationPrecedentsUnavailableReason ?? memo.cassation_precedents_unavailable_reason ??'') as string,
 legalApplication: (memo.legalApplication ?? memo.legal_application ??'') as string,
 counterArgumentsAndResponse: (memo.counterArgumentsAndResponse ?? memo.counter_arguments_and_response ??'') as string,
 legalEffectOfAcceptance: (memo.legalEffectOfAcceptance ?? memo.legal_effect_of_acceptance ??'') as string,
 strengthsAndRisks: (memo.strengthsAndRisks ?? memo.strengths_and_risks ??'') as string
 }
 };
 }
 }
 },
 4: (state, result) => {
 if (!result) { state.outputs[4] = null; return; }
 const r = result as Record<string, unknown>;
 state.outputs[4] = {
 finalPrayers: ((r.finalPrayers ?? r.final_prayers ?? []) as Record<string, unknown>[]).map((p) => ({
 id: (p.id ??'') as string,
 requestLevel: (p.requestLevel ?? p.request_level ??'') as string,
 requestText: (p.requestText ?? p.request_text ??'') as string,
 })),
 } as TFinalRequirementsWrapper;
 },
 5: (state, result) => {
 if (!result) { state.outputs[5] =''; return; }
 if (typeof result ==='string') { state.outputs[5] = result; return; }
 const r = result as Record<string, unknown>;
 state.outputs[5] = (r.memoHtml ?? r.MemoHtml ??'') as string;
 },
 },
 reducers: {
 updateDefenseTitle: (state, action: PayloadAction<{ defenseId: string; title: string }>) => {
 const defenses = state.outputs[2];
 if (!defenses) return;
 const all = [...defenses.defensesFormal, ...defenses.defensesSubstantive, ...defenses.defensesEvidentiary];
 const target = all.find((d) => d.id === action.payload.defenseId);
 if (!target) return;
 target.defenseTitle = action.payload.title;
 state.outputs[4] = null;
 state.outputs[5] = '';
 },
 deleteDefense: (state, action: PayloadAction<{ defenseId: string }>) => {
 const defenses = state.outputs[2];
 if (!defenses) return;
 removeDefenseFromGroups(defenses, action.payload.defenseId);
 if (state.outputs[3]) delete state.outputs[3][action.payload.defenseId];
 state.outputs[4] = null;
 state.outputs[5] = '';
 },
 addDefense: (state, action: PayloadAction<TDefense>) => {
 const defenses = state.outputs[2] ?? emptyDefenses();
 defenses.defensesSubstantive.push(action.payload);
 state.outputs[2] = defenses;
 state.outputs[4] = null;
 state.outputs[5] = '';
 },
 restoreWorkflowSnapshot: (state, action: PayloadAction<{
 outputs: {
 1?: TFactAnalysis | null;
 2?: TDefenses;
 3?: TAnalysisDefenses;
 4?: TFinalRequirementsWrapper;
 5?: string;
 };
 currentStep?: number;
 lastSavedAt?: string | null;
 }>) => {
 state.workflowId = null;
 state.caseId = state.caseId ?? null;
 state.currentStep = action.payload.currentStep ?? 5;
 state.status ="Completed";
 state.lastSavedAt = action.payload.lastSavedAt ?? null;
 state.isReadOnly = true;
 state.outputs[1] = action.payload.outputs[1] ?? null;
 state.outputs[2] = action.payload.outputs[2] ?? null;
 state.outputs[3] = action.payload.outputs[3] ?? null;
 state.outputs[4] = action.payload.outputs[4] ?? null;
 state.outputs[5] = action.payload.outputs[5] ??'';
 },
 clearDefenseAnalysis: (state, action: PayloadAction<{ defenseId: string }>) => {
 if (state.outputs[3]) delete state.outputs[3][action.payload.defenseId];
 state.outputs[4] = null;
 state.outputs[5] = '';
 },
 },
 maxSteps: 5,
});

export const {
 hydrateStep,
 resetWorkflow: resetAnalysis,
 updateDefenseTitle,
 deleteDefense,
 addDefense,
 restoreWorkflowSnapshot,
 clearDefenseAnalysis,
} = smartAnalysisSlice.actions;

export default smartAnalysisSlice.reducer;
