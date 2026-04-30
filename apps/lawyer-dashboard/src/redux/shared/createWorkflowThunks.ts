import { createAsyncThunk, type AsyncThunk } from"@reduxjs/toolkit";
import api from"../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { WorkflowLifecycleSummary } from"../../types/workflowLifecycle";

export interface IWorkflowDto {
 id?: number;
 caseId: string;
 lawyerId?: string;
 currentStep: number;
 status: number | string;
 createdAt?: string | null;
 updatedAt?: string | null;
 workflowType?: string | null;
 runId?: string | number | null;
 currentAccessibleStep?: number;
 lastCompletedStep?: number;
 activeRequests?: WorkflowLifecycleSummary['activeRequests'];
 stageConflicts?: WorkflowLifecycleSummary['stageConflicts'];
 isReadOnly?: boolean;
}

type WorkflowWithSteps = IWorkflowDto & Record<`step${number}Output`, string | null>;

type CreateWorkflowThunksOptions = {
 supportsVersions?: boolean;
};

function normalizeWorkflowResponse(data: WorkflowWithSteps | WorkflowWithSteps[]): WorkflowWithSteps {
 if (!Array.isArray(data)) {
 return data;
 }

 if (data.length === 0) {
 throw new Error("Workflow not found");
 }

 return [...data].sort((a, b) => {
 const aTime = Date.parse(a.updatedAt ?? a.createdAt ??"");
 const bTime = Date.parse(b.updatedAt ?? b.createdAt ??"");
 return bTime - aTime;
 })[0];
}

function getWorkflowThunkErrorMessage(error: unknown): string {
 if (error instanceof Error && error.message) {
 return error.message;
 }

 return axiosErrorHandler(error);
}

export interface IWorkflowThunks {
	 startWorkflow: AsyncThunk<IWorkflowDto, { caseId: string }, { rejectValue: unknown }>;
	 getWorkflow: AsyncThunk<WorkflowWithSteps, { caseId: string }, { rejectValue: unknown }>;
	 getWorkflowVersions?: AsyncThunk<WorkflowWithSteps[], { caseId: string }, { rejectValue: unknown }>;
	 getWorkflowById?: AsyncThunk<WorkflowWithSteps, { workflowId: number }, { rejectValue: unknown }>;
	 runStep: AsyncThunk<unknown, { workflowId: number; stepNumber: number; input?: string }, { rejectValue: unknown }>;
	 saveEditedStep: AsyncThunk<{ success: boolean }, { workflowId: number; stepNumber: number; parsedOutput: unknown }, { rejectValue: unknown }>;
	  saveDraftStep: AsyncThunk<{ lastSavedAt?: string }, { routeId: number | string; stepNumber: number; payload: unknown }, { rejectValue: unknown }>;
	  startNewRun: AsyncThunk<WorkflowLifecycleSummary, { caseId: string }, { rejectValue: unknown }>;
	  resumeCurrentRun: AsyncThunk<WorkflowLifecycleSummary, { caseId: string }, { rejectValue: unknown }>;
	  advanceStage: AsyncThunk<WorkflowLifecycleSummary, { workflowId: number; fromStep: number; toStep: number }, { rejectValue: unknown }>;
	  recoverConflict: AsyncThunk<WorkflowLifecycleSummary, { routeId: number | string; stepNumber: number }, { rejectValue: unknown }>;
}

export function createWorkflowThunks(controllerName: string, options?: CreateWorkflowThunksOptions): IWorkflowThunks {
 const lowercaseName = controllerName.charAt(0).toLowerCase() + controllerName.slice(1);
 const supportsVersions = options?.supportsVersions ?? controllerName !=="SmartAnalysis";
 const startPath = ["ExecRequest","LegalWarning","RulingAnalysis"].includes(controllerName)
 ? `/${controllerName}/start`
 : `/${controllerName}`;

 const startWorkflow = createAsyncThunk(
 `${lowercaseName}/startWorkflow`,
 async ({ caseId }: { caseId: string }, { rejectWithValue }) => {
 try {
 const res = await api.post(startPath, { caseId });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
 );

 const getWorkflow = createAsyncThunk(
 `${lowercaseName}/getWorkflow`,
 async ({ caseId }: { caseId: string }, { rejectWithValue }) => {
 try {
 const res = await api.get(`/${controllerName}/case/${caseId}`);
 return normalizeWorkflowResponse(res.data.data as WorkflowWithSteps | WorkflowWithSteps[]);
 } catch (error) {
 return rejectWithValue(getWorkflowThunkErrorMessage(error));
 }
 }
 );

 const getWorkflowVersions = supportsVersions
 ? createAsyncThunk(
 `${lowercaseName}/getWorkflowVersions`,
 async ({ caseId }: { caseId: string }, { rejectWithValue }) => {
 try {
 const res = await api.get(`/${controllerName}/case/${caseId}`);
 const data = res.data.data as WorkflowWithSteps | WorkflowWithSteps[];
 const workflows = Array.isArray(data) ? data : [data];

 return [...workflows].sort((a, b) => {
 const aTime = Date.parse(a.updatedAt ?? a.createdAt ??"");
 const bTime = Date.parse(b.updatedAt ?? b.createdAt ??"");
 return bTime - aTime;
 });
 } catch (error) {
 return rejectWithValue(getWorkflowThunkErrorMessage(error));
 }
 }
 )
 : undefined;

 const getWorkflowById = supportsVersions
 ? createAsyncThunk(
 `${lowercaseName}/getWorkflowById`,
 async ({ workflowId }: { workflowId: number }, { rejectWithValue }) => {
 try {
 const res = await api.get(`/${controllerName}/${workflowId}`);
 return res.data.data as WorkflowWithSteps;
 } catch (error) {
 return rejectWithValue(getWorkflowThunkErrorMessage(error));
 }
 }
 )
 : undefined;

 const runStep = createAsyncThunk(
 `${lowercaseName}/runStep`,
 async ({ workflowId, stepNumber, input }: { workflowId: number; stepNumber: number; input?: string }, { rejectWithValue }) => {
 try {
 const res = await api.post(
 `/${controllerName}/${workflowId}/step/${stepNumber}`,
 { input }
 );
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
 );

 const saveEditedStep = createAsyncThunk(
 `${lowercaseName}/saveEditedStep`,
 async ({ workflowId, stepNumber, parsedOutput }: { workflowId: number; stepNumber: number; parsedOutput: unknown }, { rejectWithValue }) => {
 try {
 const res = await api.put(
 `/${controllerName}/${workflowId}/step/${stepNumber}`,
 parsedOutput
 );
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
 );

  const saveDraftStep = createAsyncThunk(
  `${lowercaseName}/saveDraftStep`,
  async ({ routeId, stepNumber, payload }: { routeId: number | string; stepNumber: number; payload: unknown }, { rejectWithValue }) => {
  try {
  const res = await api.patch(
  `/${controllerName}/${routeId}/step/${stepNumber}/auto-save`,
  { stepIndex: stepNumber, isDraft: true, payload }
  );
  return res.data.data;
  } catch (error) {
  return rejectWithValue(axiosErrorHandler(error));
  }
  }
  );

  const startNewRun = createAsyncThunk(
  `${lowercaseName}/startNewRun`,
  async ({ caseId }: { caseId: string }, { rejectWithValue }) => {
  try {
  const res = await api.post(`/${controllerName}/${caseId}/start-new`);
  return res.data.data as WorkflowLifecycleSummary;
  } catch (error) {
  return rejectWithValue(axiosErrorHandler(error));
  }
  }
  );

  const resumeCurrentRun = createAsyncThunk(
  `${lowercaseName}/resumeCurrentRun`,
  async ({ caseId }: { caseId: string }, { rejectWithValue }) => {
  try {
  const res = await api.get(`/${controllerName}/case/${caseId}/resume`);
  return res.data.data as WorkflowLifecycleSummary;
  } catch (error) {
  return rejectWithValue(axiosErrorHandler(error));
  }
  }
  );

   const advancingWorkflowIds = new Set<number>();

   const advanceStage = createAsyncThunk(
   `${lowercaseName}/advanceStage`,
   async ({ workflowId, fromStep, toStep }: { workflowId: number; fromStep: number; toStep: number }, { rejectWithValue }) => {
   try {
   const res = await api.post(`/${controllerName}/${workflowId}/advance-stage`, { fromStep, toStep });
   return res.data.data as WorkflowLifecycleSummary;
   } catch (error) {
   return rejectWithValue(axiosErrorHandler(error));
   } finally {
   advancingWorkflowIds.delete(workflowId);
   }
   },
   {
   condition: ({ workflowId }) => {
   if (advancingWorkflowIds.has(workflowId)) return false;
   advancingWorkflowIds.add(workflowId);
   return true;
   },
   }
   );

   const recoverConflict = createAsyncThunk(
   `${lowercaseName}/recoverConflict`,
   async ({ routeId, stepNumber }: { routeId: number | string; stepNumber: number }, { rejectWithValue }) => {
   try {
   const res = await api.post(`/${controllerName}/${routeId}/recover-conflict`, { stepNumber });
   return res.data.data as WorkflowLifecycleSummary;
   } catch (error) {
   return rejectWithValue(axiosErrorHandler(error));
   }
   }
   );

   return {
   startWorkflow,
   getWorkflow,
   getWorkflowVersions,
   getWorkflowById,
   runStep,
   saveEditedStep,
   saveDraftStep,
   startNewRun,
   resumeCurrentRun,
   advanceStage,
   recoverConflict,
   };
}
