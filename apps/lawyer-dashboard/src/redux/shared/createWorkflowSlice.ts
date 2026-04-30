import { createSlice } from"@reduxjs/toolkit";
import type { CaseReducer, Draft, PayloadAction, SliceCaseReducers, ValidateSliceCaseReducers } from"@reduxjs/toolkit";
import type { TypedWorkflowState, WorkflowStatus } from"./workflowTypes";
import type { IWorkflowThunks } from"./createWorkflowThunks";
import type { ActiveStageRequest, WorkflowStageConflict } from"../../types/workflowLifecycle";
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
  runId: null,
  currentAccessibleStep: 0,
  lastCompletedStep: 0,
  activeRequests: [],
  stageConflicts: [],
 outputs: cloneInitialOutputs(),
  loadingState: {
  isStarting: false,
  isGetting: false,
  isRunningStep: false,
  isSavingStep: false,
  isAutoSaving: false,
  isAdvancingStage: false,
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
 action: PayloadAction<{ outputs: TStepOutputs; currentStep?: number; lastSavedAt?: string | null; snapshotId?: number; snapshotLabel?: string | null; readOnly?: boolean }>
 ) => {
 const { outputs, currentStep, lastSavedAt, snapshotId, snapshotLabel, readOnly = true } = action.payload;
 const highestOutputStep = Object.entries(outputs as Record<string, unknown>).reduce((highest, [key, value]) => {
 const step = Number(key);
 if (!Number.isFinite(step) || value == null || value === '') return highest;
 if (typeof value === 'object' && Object.keys(value as object).length === 0) return highest;
 return Math.max(highest, step);
 }, 0);
 state.outputs = outputs as Draft<TStepOutputs>;
 state.currentStep = currentStep ?? 1;
 state.currentAccessibleStep = highestOutputStep;
 state.lastCompletedStep = highestOutputStep;
 state.createdAt = null;
 state.lastSavedAt = lastSavedAt ?? null;
 state.isReadOnly = readOnly;
 state.snapshotId = snapshotId ?? null;
 state.snapshotLabel = snapshotLabel ?? null;
 state.status = readOnly ? 'Completed' : 'InProgress';
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

  if (state.lastCompletedStep < stepNumber) {
  state.lastCompletedStep = stepNumber;
  }
  },
  setRunId: (state: Draft<TypedWorkflowState<TStepOutputs>>, action: PayloadAction<string | number | null>) => {
  state.runId = action.payload;
  },
  setCurrentAccessibleStep: (state: Draft<TypedWorkflowState<TStepOutputs>>, action: PayloadAction<number>) => {
  state.currentAccessibleStep = action.payload;
  },
  setLastCompletedStep: (state: Draft<TypedWorkflowState<TStepOutputs>>, action: PayloadAction<number>) => {
  state.lastCompletedStep = action.payload;
  },
  setActiveRequests: (state: Draft<TypedWorkflowState<TStepOutputs>>, action: PayloadAction<ActiveStageRequest[]>) => {
  state.activeRequests = action.payload;
  },
  setStageConflicts: (state: Draft<TypedWorkflowState<TStepOutputs>>, action: PayloadAction<WorkflowStageConflict[]>) => {
  state.stageConflicts = action.payload;
  },
   clearLifecycleState: (state: Draft<TypedWorkflowState<TStepOutputs>>) => {
   state.runId = null;
   state.currentAccessibleStep = 0;
   state.lastCompletedStep = 0;
   state.activeRequests = [];
   state.stageConflicts = [];
   },
   setStageConflict: (state: Draft<TypedWorkflowState<TStepOutputs>>, action: PayloadAction<import('../../types/workflowLifecycle').WorkflowStageConflict>) => {
   const existing = state.stageConflicts.findIndex(c => c.stepNumber === action.payload.stepNumber);
   if (existing >= 0) {
   state.stageConflicts[existing] = action.payload;
   } else {
   state.stageConflicts.push(action.payload);
   }
   },
   clearStageConflict: (state: Draft<TypedWorkflowState<TStepOutputs>>, action: PayloadAction<number>) => {
   state.stageConflicts = state.stageConflicts.filter(c => c.stepNumber !== action.payload);
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
          state.runId = (payload.runId as string | number | null | undefined) ?? null;
          state.currentAccessibleStep = (payload.currentAccessibleStep as number | undefined) ?? 0;
          state.lastCompletedStep = (payload.lastCompletedStep as number | undefined) ?? 0;
          state.activeRequests = (payload.activeRequests as Draft<ActiveStageRequest[]> | undefined) ?? [];
          state.stageConflicts = (payload.stageConflicts as Draft<WorkflowStageConflict[]> | undefined) ?? [];
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
  state.runId = action.payload.runId ?? null;
  state.currentAccessibleStep = action.payload.currentAccessibleStep ?? 0;
  state.lastCompletedStep = action.payload.lastCompletedStep ?? 0;
  state.activeRequests = action.payload.activeRequests ?? [];
  state.stageConflicts = action.payload.stageConflicts ?? [];
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

  if (state.lastCompletedStep < stepNumber) {
  state.lastCompletedStep = stepNumber;
  }

  if (config.maxSteps && stepNumber >= config.maxSteps) {
  state.status = "Completed";
  }
 })
 .addCase(thunks.runStep.rejected, (state, action) => {
 state.loadingState.isRunningStep = false;
 const errorMsg = isString(action.payload) ? action.payload :"Unknown error";
 state.errorState.runError = errorMsg;
	 if (errorMsg.includes("تم تحديث سير العمل من قبل مستخدم آخر") || (action.error as { message?: string } | undefined)?.message?.includes("409")) {
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
	 if (errorMsg.includes("تم تحديث سير العمل من قبل مستخدم آخر") || (action.error as { message?: string } | undefined)?.message?.includes("409")) {
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
	  if (errorMsg.includes("تم تحديث سير العمل من قبل مستخدم آخر") || (action.error as { message?: string } | undefined)?.message?.includes("409")) {
  state.errorState.hasConcurrencyConflict = true;
  }
  });
  }

  builder
  .addCase(thunks.startNewRun.pending, (state) => {
  state.loadingState.isStarting = true;
  state.errorState.startError = null;
  })
  .addCase(thunks.startNewRun.fulfilled, (state, action) => {
  state.loadingState.isStarting = false;
  state.outputs = cloneInitialDraftOutputs();
  state.runId = action.payload.runId;
  state.currentAccessibleStep = action.payload.currentAccessibleStep ?? 0;
  state.lastCompletedStep = action.payload.lastCompletedStep ?? 0;
  state.activeRequests = action.payload.activeRequests ?? [];
  state.stageConflicts = action.payload.stageConflicts ?? [];
  state.caseId = action.payload.caseId ?? null;
  state.status = mapStatus(action.payload.status);
  state.snapshotId = null;
  state.snapshotLabel = null;
  state.isReadOnly = action.payload.isReadOnly ?? false;
  state.createdAt = action.payload.createdAt ?? null;
  state.lastSavedAt = action.payload.updatedAt ?? null;
   state.workflowId = action.payload.id ?? null;
   state.currentStep = 1;
  state.loadingState.isStarting = false;
  state.errorState.hasConcurrencyConflict = false;
  })
   .addCase(thunks.startNewRun.rejected, (state, action) => {
   state.loadingState.isStarting = false;
   state.errorState.startError = isString(action.payload) ? action.payload :"Unknown error";
   })
   .addCase(thunks.resumeCurrentRun.pending, (state) => {
   state.loadingState.isGetting = true;
   state.errorState.getError = null;
   })
   .addCase(thunks.resumeCurrentRun.fulfilled, (state, action) => {
   state.loadingState.isGetting = false;
   const payload = action.payload;
   state.runId = payload.runId;
   state.currentAccessibleStep = payload.currentAccessibleStep ?? 0;
   state.lastCompletedStep = payload.lastCompletedStep ?? 0;
   state.activeRequests = payload.activeRequests ?? [];
   state.stageConflicts = payload.stageConflicts ?? [];
   state.caseId = payload.caseId ?? null;
   state.status = mapStatus(payload.status);
   state.isReadOnly = payload.isReadOnly ?? false;
   state.createdAt = payload.createdAt ?? null;
   state.lastSavedAt = payload.updatedAt ?? null;
   state.snapshotId = null;
   state.snapshotLabel = payload.snapshotLabel ?? null;
   if (payload.id) {
   state.workflowId = payload.id;
   }
   state.currentStep = payload.currentAccessibleStep ?? 1;
   state.outputs = cloneInitialDraftOutputs();
   const maxStps = config.maxSteps || 10;
   for (let i = 1; i <= maxStps; i++) {
   const raw = (payload as unknown as Record<string, unknown>)[`step${i}Output`];
   if (raw === null || raw === undefined || raw === '') continue;
   let parsed: unknown = raw;
   try {
   if (typeof raw === 'string') parsed = deepCamelize(JSON.parse(raw));
   else if (typeof raw === 'object') parsed = deepCamelize(raw);
    } catch { /* */ }
   if (config.stepHydrators && config.stepHydrators[i]) {
   config.stepHydrators[i](state, parsed);
   } else {
   (state.outputs as Record<number, unknown>)[i] = parsed;
   }
   }
   state.errorState.hasConcurrencyConflict = false;
   })
    .addCase(thunks.resumeCurrentRun.rejected, (state, action) => {
    state.loadingState.isGetting = false;
    state.errorState.getError = isString(action.payload) ? action.payload :"Unknown error";
    });

    if (thunks.advanceStage) {
    builder
    .addCase(thunks.advanceStage.pending, (state) => {
    state.loadingState.isAdvancingStage = true;
    })
    .addCase(thunks.advanceStage.fulfilled, (state, action) => {
    state.loadingState.isAdvancingStage = false;
    state.currentAccessibleStep = action.payload.currentAccessibleStep ?? state.currentAccessibleStep;
    state.activeRequests = action.payload.activeRequests ?? [];
    state.stageConflicts = action.payload.stageConflicts ?? [];
    state.lastSavedAt = action.payload.updatedAt ?? state.lastSavedAt;
    })
     .addCase(thunks.advanceStage.rejected, (state) => {
     state.loadingState.isAdvancingStage = false;
     });
     }

     if (thunks.recoverConflict) {
     builder
     .addCase(thunks.recoverConflict.pending, (state) => {
     state.loadingState.isAdvancingStage = true;
     })
     .addCase(thunks.recoverConflict.fulfilled, (state, action) => {
     state.loadingState.isAdvancingStage = false;
     state.stageConflicts = state.stageConflicts.filter(c => c.stepNumber !== action.meta.arg.stepNumber);
     state.errorState.hasConcurrencyConflict = false;
     })
     .addCase(thunks.recoverConflict.rejected, (state) => {
     state.loadingState.isAdvancingStage = false;
     });
     }
     }
   });

 return slice;
}
