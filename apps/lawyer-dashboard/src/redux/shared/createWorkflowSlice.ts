import { createSlice } from"@reduxjs/toolkit";
import type { CaseReducer, Draft, PayloadAction, SliceCaseReducers, ValidateSliceCaseReducers } from"@reduxjs/toolkit";
import type { TypedWorkflowState, WorkflowStatus } from"./workflowTypes";
import type { IWorkflowThunks } from"./createWorkflowThunks";
import { isString } from"@mohamy/shared-utils";
import { deepCamelize } from"@mohamy/shared-utils";

export interface WorkflowSliceConfig<TStepOutputs, TReducers extends SliceCaseReducers<TypedWorkflowState<TStepOutputs>> = SliceCaseReducers<TypedWorkflowState<TStepOutputs>>> {
 name: string;
 initialOutputs: TStepOutputs;
 thunks: IWorkflowThunks;
 stepHydrators?: {
 [stepNumber: number]: (
 state: Draft<TypedWorkflowState<TStepOutputs>>,
 result: unknown
 ) => void;
 };
 maxSteps?: number;
 reducers?: ValidateSliceCaseReducers<TypedWorkflowState<TStepOutputs>, TReducers>;
}

export function createWorkflowSlice<TStepOutputs, TReducers extends SliceCaseReducers<TypedWorkflowState<TStepOutputs>> = SliceCaseReducers<TypedWorkflowState<TStepOutputs>>>(config: WorkflowSliceConfig<TStepOutputs, TReducers>) {
 const cloneInitialOutputs = (): TStepOutputs => JSON.parse(JSON.stringify(config.initialOutputs ?? {})) as TStepOutputs;
 const cloneInitialDraftOutputs = (): Draft<TStepOutputs> => cloneInitialOutputs() as Draft<TStepOutputs>;

 const createInitialState = (): TypedWorkflowState<TStepOutputs> => ({
 workflowId: null,
 caseId: null,
 currentStep: 1,
 status:"NotStarted",
 createdAt: null,
 lastSavedAt: null,
 workflowVersions: [],
 isReadOnly: false,
 snapshotId: null,
 snapshotLabel: null,
 outputs: cloneInitialOutputs(),
 loadingState: {
 isStarting: false,
 isGetting: false,
 isRunningStep: false,
 isSavingStep: false,
 isAutoSaving: false,
 },
 errorState: {
 startError: null,
 getError: null,
 runError: null,
 saveError: null,
 autoSaveError: null,
 hasConcurrencyConflict: false,
 },
 });

 const initialState: TypedWorkflowState<TStepOutputs> = createInitialState();

 const reducers = ({
 resetWorkflow: () => createInitialState(),
 restoreSnapshot: (
 state: Draft<TypedWorkflowState<TStepOutputs>>,
 action: PayloadAction<{ outputs: TStepOutputs; currentStep?: number; lastSavedAt?: string | null; snapshotId?: number; snapshotLabel?: string | null }>
 ) => {
 const { outputs, currentStep, lastSavedAt, snapshotId, snapshotLabel } = action.payload;
 state.outputs = outputs as Draft<TStepOutputs>;
 state.currentStep = currentStep ?? 1;
 state.createdAt = null;
 state.lastSavedAt = lastSavedAt ?? null;
 state.isReadOnly = true;
 state.snapshotId = snapshotId ?? null;
 state.snapshotLabel = snapshotLabel ?? null;
 state.status = 'Completed';
 },
 hydrateStep: (state: Draft<TypedWorkflowState<TStepOutputs>>, action: PayloadAction<{ stepNumber: number; result: unknown }>) => {
 const { stepNumber, result } = action.payload;

 let actualResult = result;
 if (result && typeof result ==='object' &&'output' in result && typeof (result as { output: unknown }).output ==='string' &&'stepNumber' in result && typeof (result as { stepNumber: unknown }).stepNumber ==='number') {
 try {
 actualResult = deepCamelize(JSON.parse((result as { output: string }).output));
 } catch { /* keep original */ }
 } else if (result && typeof result ==='object') {
 actualResult = deepCamelize(result);
 }

 // Use custom hydrator if provided, else fallback to standard assign
 if (config.stepHydrators && config.stepHydrators[stepNumber]) {
 config.stepHydrators[stepNumber](state, actualResult);
 } else {
 (state.outputs as Record<number, unknown>)[stepNumber] = actualResult;
 }

 // Auto-advance step if needed
 if (state.currentStep <= stepNumber) {
 state.currentStep = stepNumber + 1;
 if (config.maxSteps && state.currentStep > config.maxSteps) {
 state.currentStep = config.maxSteps;
 state.status ="Completed";
 }
 }
 },
 ...(config.reducers ?? {}),
 } as unknown) as ValidateSliceCaseReducers<TypedWorkflowState<TStepOutputs>, TReducers> & {
 resetWorkflow: CaseReducer<TypedWorkflowState<TStepOutputs>>;
 hydrateStep: CaseReducer<TypedWorkflowState<TStepOutputs>, PayloadAction<{ stepNumber: number; result: unknown }>>;
 };

 const slice = createSlice({
 name: config.name,
 initialState,
 reducers,
 extraReducers: (builder) => {
 const { thunks } = config;

 // Start Workflow
 const numToStatus: WorkflowStatus[] = ['NotStarted','InProgress','Completed','Abandoned'];
 const mapStatus = (status: number | string): WorkflowStatus => {
 if (typeof status ==='string') {
 return (['NotStarted','InProgress','Completed','Abandoned'] as const).includes(status as WorkflowStatus)
 ? status as WorkflowStatus
 :'InProgress';
 }

 return numToStatus[status] ??'InProgress';
 };

        const applyWorkflowPayload = (
          state: Draft<TypedWorkflowState<TStepOutputs>>,
          payload: Record<string, unknown>,
        ) => {
          state.workflowId = (payload.id as number | null | undefined) ?? null;
          state.caseId = (payload.caseId as string | null | undefined) ?? null;
          state.currentStep = (payload.currentStep as number | undefined) ?? 1;
          state.status = mapStatus((payload.status as number | string | undefined) ?? 'InProgress');
          state.createdAt = (payload.createdAt as string | null | undefined) ?? null;
          state.lastSavedAt = (payload.updatedAt as string | null | undefined) ?? (payload.createdAt as string | null | undefined) ?? null;
          state.isReadOnly = false;
          state.outputs = cloneInitialDraftOutputs();

 const maxStps = config.maxSteps || 10;
 for (let i = 1; i <= maxStps; i++) {
 const raw = payload[`step${i}Output` as `step${number}Output`];
 if (raw === null || raw === undefined || raw ==='') {
 continue;
 }

 let parsed: unknown = raw;
 try {
 if (typeof raw ==='string') parsed = deepCamelize(JSON.parse(raw));
 else if (typeof raw ==='object') parsed = deepCamelize(raw);
 } catch {
 // ignore
 }

 if (config.stepHydrators && config.stepHydrators[i]) {
 config.stepHydrators[i](state, parsed);
 } else {
 (state.outputs as Record<number, unknown>)[i] = parsed;
 }
 }
 };

 builder
 .addCase(thunks.startWorkflow.pending, (state) => {
 state.loadingState.isStarting = true;
 state.errorState.startError = null;
 })
  .addCase(thunks.startWorkflow.fulfilled, (state, action) => {
  state.loadingState.isStarting = false;
  state.workflowId = action.payload.id ?? null;
  state.caseId = action.payload.caseId ?? null;
  state.currentStep = action.payload.currentStep ?? 1;
  state.status = mapStatus(action.payload.status);
  state.createdAt = action.payload.createdAt ?? action.payload.updatedAt ?? null;
  state.lastSavedAt = action.payload.updatedAt ?? action.payload.createdAt ?? null;
  state.outputs = cloneInitialDraftOutputs();
  state.isReadOnly = false;
  state.snapshotId = null;
  state.snapshotLabel = null;
  })
 .addCase(thunks.startWorkflow.rejected, (state, action) => {
 state.loadingState.isStarting = false;
 state.errorState.startError = isString(action.payload) ? action.payload :"Unknown error";
 });

 // Get Workflow
 builder
 .addCase(thunks.getWorkflow.pending, (state) => {
 state.loadingState.isGetting = true;
 state.errorState.getError = null;
 })
 .addCase(thunks.getWorkflow.fulfilled, (state, action) => {
 state.loadingState.isGetting = false;
 applyWorkflowPayload(state, action.payload as unknown as Record<string, unknown>);
 })
 .addCase(thunks.getWorkflow.rejected, (state, action) => {
 state.loadingState.isGetting = false;
 state.errorState.getError = isString(action.payload) ? action.payload :"Unknown error";
 });

 if (thunks.getWorkflowVersions) {
 builder.addCase(thunks.getWorkflowVersions.fulfilled, (state, action) => {
 state.workflowVersions = action.payload.map((item) => ({
 id: item.id,
 caseId: item.caseId,
 lawyerId: item.lawyerId,
 currentStep: item.currentStep,
 status: item.status,
 createdAt: item.createdAt ?? null,
 updatedAt: item.updatedAt ?? null,
 }));
 });
 }

 if (thunks.getWorkflowById) {
 builder
 .addCase(thunks.getWorkflowById.pending, (state) => {
 state.loadingState.isGetting = true;
 state.errorState.getError = null;
 })
 .addCase(thunks.getWorkflowById.fulfilled, (state, action) => {
 state.loadingState.isGetting = false;
 applyWorkflowPayload(state, action.payload as unknown as Record<string, unknown>);
 })
 .addCase(thunks.getWorkflowById.rejected, (state, action) => {
 state.loadingState.isGetting = false;
 state.errorState.getError = isString(action.payload) ? action.payload :"Unknown error";
 });
 }

 // Run Step
 builder
 .addCase(thunks.runStep.pending, (state) => {
 state.loadingState.isRunningStep = true;
 state.errorState.runError = null;
 })
  .addCase(thunks.runStep.fulfilled, (state, action) => {
  state.loadingState.isRunningStep = false;
  state.errorState.hasConcurrencyConflict = false;
 
 const stepNumber = action.meta.arg.stepNumber;
 if (config.stepHydrators && config.stepHydrators[stepNumber]) {
 config.stepHydrators[stepNumber](state, action.payload);
 } else {
 (state.outputs as Record<number, unknown>)[stepNumber] = action.payload;
 }

 if (state.currentStep === stepNumber && config.maxSteps) {
 if (stepNumber < config.maxSteps) {
 state.currentStep = stepNumber + 1;
 } else {
 state.status ="Completed";
 }
 } else if (!config.maxSteps) {
 state.currentStep = stepNumber + 1;
 }
 })
 .addCase(thunks.runStep.rejected, (state, action) => {
 state.loadingState.isRunningStep = false;
 const errorMsg = isString(action.payload) ? action.payload :"Unknown error";
 state.errorState.runError = errorMsg;
 if (errorMsg.includes("تم تحديث سير العمل من قبل مستخدم آخر") || action.error?.message?.includes("409")) {
 state.errorState.hasConcurrencyConflict = true;
 }
 });

 // Save Edited Step
 builder
 .addCase(thunks.saveEditedStep.pending, (state) => {
 state.loadingState.isSavingStep = true;
 state.errorState.saveError = null;
 })
  .addCase(thunks.saveEditedStep.fulfilled, (state, action) => {
  state.loadingState.isSavingStep = false;
  state.errorState.hasConcurrencyConflict = false;
 
 const stepNumber = action.meta.arg.stepNumber;
 state.currentStep = stepNumber;
 
 // Invalidate futures
 const maxStps = config.maxSteps || 10;
 for (let i = stepNumber + 1; i <= maxStps; i++) {
 (state.outputs as Record<number, unknown>)[i] = undefined;
 }
 })
 .addCase(thunks.saveEditedStep.rejected, (state, action) => {
 state.loadingState.isSavingStep = false;
 const errorMsg = isString(action.payload) ? action.payload :"Unknown error";
 state.errorState.saveError = errorMsg;
 if (errorMsg.includes("تم تحديث سير العمل من قبل مستخدم آخر") || action.error?.message?.includes("409")) {
 state.errorState.hasConcurrencyConflict = true;
 }
 });

 // Save Draft Step
 if (thunks.saveDraftStep) {
 builder
 .addCase(thunks.saveDraftStep.pending, (state) => {
 state.loadingState.isAutoSaving = true;
 state.errorState.autoSaveError = null;
 })
  .addCase(thunks.saveDraftStep.fulfilled, (state, action) => {
  state.loadingState.isAutoSaving = false;
  state.errorState.hasConcurrencyConflict = false;
 
 if (action.payload?.lastSavedAt) {
 state.lastSavedAt = action.payload.lastSavedAt;
 }
 })
 .addCase(thunks.saveDraftStep.rejected, (state, action) => {
 state.loadingState.isAutoSaving = false;
 const errorMsg = isString(action.payload) ? action.payload :"Unknown error";
 state.errorState.autoSaveError = errorMsg;
 if (errorMsg.includes("تم تحديث سير العمل من قبل مستخدم آخر") || action.error?.message?.includes("409")) {
 state.errorState.hasConcurrencyConflict = true;
 }
 });
 }
 }
 });

 return slice;
}
