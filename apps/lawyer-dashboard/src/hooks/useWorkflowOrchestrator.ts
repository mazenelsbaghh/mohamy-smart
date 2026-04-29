import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { AsyncThunk, ActionCreatorWithoutPayload, ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import thunkGetSingleCase from '../redux/cases/thunk/thunkGetSingleCase';
import type { IWorkflowThunks } from '../redux/shared/createWorkflowThunks';
import { useWorkflowSnapshotLoader } from './useWorkflowSnapshotLoader';
import { useAiJobSignalR } from './useAiJobSignalR';
import { useWorkflowFacts } from './useWorkflowFacts';
import { useWorkflowAutoSave } from './useWorkflowAutoSave';
import { WORKFLOW_TAB_CLASSNAMES, WORKFLOW_TAB_PROPS } from '../components/analysisWorkflow/workflowConstants';
import { resetAiJobs, setActiveRunId } from '../redux/aiJobs/aiJobsSlice';
import thunkGetAllAiJobs from '../redux/aiJobs/thunk/thunkGetAllAiJobs';
import type { TCase } from '../redux/cases/casesSlice';
import type { AppDispatch, RootState } from '../redux/store';

export type { IWorkflowThunks } from '../redux/shared/createWorkflowThunks';

export interface StepMeta {
  id: number;
  label: string;
  icon: ReactNode;
}

export interface UseWorkflowOrchestratorConfig<
  TOutputs extends Record<number, unknown>,
  TJobKeys extends string = string,
> {
  sliceSelector: (state: RootState) => {
    workflowId: number | null;
    caseId: string | null;
    outputs: TOutputs;
    loadingState: { isFetchingWorkflow?: boolean; isGetting?: boolean; isStarting?: boolean; isAutoSaving: boolean; isSavingStep: boolean; isAdvancingStage?: boolean };
    errorState: { autoSaveError: string | null };
    lastSavedAt: string | null;
    createdAt: string | null;
    isReadOnly: boolean;
    snapshotLabel: string | null;
    currentAccessibleStep: number;
    lastCompletedStep?: number;
    activeRequests?: { stepNumber: number; status: string }[];
    runId: string | number | null;
  };
  thunks: IWorkflowThunks;
  restoreSnapshot: ActionCreatorWithoutPayload | ActionCreatorWithPayload<unknown, string> | ((payload: unknown) => { type: string });
  resetWorkflow: ActionCreatorWithoutPayload | (() => { type: string });
  workflowPrefix: string;
  maxSteps: number;
  steps: StepMeta[];
  isCaseIdBased?: boolean;
  abandonThunk?: AsyncThunk<any, string, any>;
  stepNumberMapFn?: (activeStep: number) => number | null;
  computeMaxStepAllowed?: (outputs: TOutputs, jobs: Record<string, { status?: string } | undefined>) => number;
  jobStepMap?: Record<TJobKeys, number>;
  onJobCompleted?: (jobKey: string, job: { status?: string; resultJson?: string; id?: string; completedAt?: string; createdAt?: string }, outputs: TOutputs, dispatch: AppDispatch) => void;
  onStepSave?: (stepNumber: number, payload: unknown, dispatch: AppDispatch) => Promise<void>;
  onError?: (error: unknown, context: string) => void;
  computeAutoResumeTarget?: (outputs: TOutputs, jobs: Record<string, { status?: string } | undefined>) => number;
}

export interface UseWorkflowOrchestratorReturn<TOutputs extends Record<number, unknown>> {
  active: number;
  setActive: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  maxStepAllowed: number;
  handleTabChange: (key: string | number) => void;
  caseId: string | undefined;
  isFreshRun: boolean;
  isReadOnly: boolean;
  snapshotModeRef: React.MutableRefObject<boolean>;
  workflowState: ReturnType<UseWorkflowOrchestratorConfig<TOutputs>['sliceSelector']> extends infer S ? S : never;
  singleCase: TCase | null;
  caseFacts: string[];
  setCaseFacts: React.Dispatch<React.SetStateAction<string[]>>;
  selectedFacts: string[];
  setSelectedFacts: React.Dispatch<React.SetStateAction<string[]>>;
  handleManualSave: () => Promise<void>;
  isLoading: boolean;
  isSavingStep: boolean;
  isAutoSaving: boolean;
  autoSaveError: string | null;
  lastSavedAt: string | null;
  tabsClassNames: typeof WORKFLOW_TAB_CLASSNAMES;
  tabProps: typeof WORKFLOW_TAB_PROPS;
  isClickableTab: (index: number) => boolean;
  handleAdvanceStage: (fromStep: number, toStep: number) => Promise<void>;
  isAdvancingStage: boolean;
}

const WORKFLOW_NOT_FOUND_ERROR = 'Workflow not found';

export function useWorkflowOrchestrator<
  TOutputs extends Record<number, unknown>,
  TJobKeys extends string = string,
>(
  config: UseWorkflowOrchestratorConfig<TOutputs, TJobKeys>,
): UseWorkflowOrchestratorReturn<TOutputs> {
  const {
    sliceSelector,
    thunks,
    restoreSnapshot,
    resetWorkflow,
    workflowPrefix,
    maxSteps,
    isCaseIdBased = false,
    abandonThunk,
    stepNumberMapFn,
    computeMaxStepAllowed,
    jobStepMap,
    onJobCompleted,
    onError,
    computeAutoResumeTarget,
  } = config;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { id: caseIdParam } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const parts = pathname.split('/');
  const caseIdFromPath = parts[2] || parts[3];
  const caseId = caseIdParam || caseIdFromPath;

  const workflowIdParam = Number(searchParams.get('workflowId') || '');
  const selectedWorkflowId = Number.isFinite(workflowIdParam) && workflowIdParam > 0 ? workflowIdParam : null;
  const snapshotIdParam = searchParams.get('snapshot');
  const isFreshRun = searchParams.get('fresh') === '1';

  const workflowState = useAppSelector(sliceSelector) as ReturnType<typeof sliceSelector>;
  const { singleCase } = useAppSelector((rootState) => rootState.cases);
  const aiJobs = useAppSelector((state) => state.aiJobs);

  const { snapshotModeRef } = useWorkflowSnapshotLoader<TOutputs>({
    snapshotId: snapshotIdParam,
    restoreSnapshot,
    resetWorkflow: typeof resetWorkflow === 'function' ? resetWorkflow : undefined,
    fallbackStep: maxSteps,
    onLoaded: (step: number) => setActive(Math.min(step, maxSteps)),
  });

  useAiJobSignalR(caseId, isFreshRun, workflowState.createdAt, workflowState.runId);

  const { caseFacts, setCaseFacts, selectedFacts, setSelectedFacts, resetForNewRun } = useWorkflowFacts({
    workflowPrefix,
    caseId,
    runId: workflowState.runId,
  });

  const [active, setActive] = useState(0);
  const nextStep = useCallback(() => setActive((c) => (c < maxSteps ? c + 1 : c)), [maxSteps]);
  const prevStep = useCallback(() => setActive((c) => (c > 0 ? c - 1 : c)), []);
  const [initialAutoJumpDone, setInitialAutoJumpDone] = useState(false);
  const freshRunInProgressRef = useRef(false);
  const freshSessionRef = useRef(false);

  const isActiveJob = useCallback(
    (job: { status?: string } | undefined | null) =>
      job?.status === 'Completed' || job?.status === 'Processing' || job?.status === 'Queued',
    [],
  );

  const maxStepAllowed = useMemo<number>(() => {
    if (workflowState.runId != null) {
      const cas = workflowState.currentAccessibleStep ?? 0;
      if (cas > 0) return cas;
    }

    if (computeMaxStepAllowed) {
      const computed = computeMaxStepAllowed(workflowState.outputs, aiJobs.jobs);
      return typeof computed === 'number' ? computed : 0;
    }

    const outputs = workflowState.outputs;
    const jobs = aiJobs.jobs;

    for (let i = maxSteps; i >= 1; i--) {
      if (outputs[i as keyof TOutputs]) return i;
    }

    if (jobStepMap) {
      for (const [jobKey, stepIdx] of Object.entries(jobStepMap)) {
        if (isActiveJob((jobs as Record<string, { status?: string } | undefined>)[jobKey])) {
          return Number(stepIdx);
        }
      }
    }

    return 0;
  }, [workflowState.outputs, aiJobs.jobs, maxSteps, computeMaxStepAllowed, jobStepMap, isActiveJob, workflowState.runId, workflowState.currentAccessibleStep]);

  useEffect(() => {
    if (isFreshRun) return;
    if (!initialAutoJumpDone && maxStepAllowed > 0) {
      if (computeAutoResumeTarget) {
        const target = computeAutoResumeTarget(workflowState.outputs, aiJobs.jobs);
        if (target > 0) setActive(target);
      } else {
        setActive(maxStepAllowed);
      }
      setInitialAutoJumpDone(true);
    }
  }, [maxStepAllowed, initialAutoJumpDone, isFreshRun]);

  const hasActiveAiJobs = Object.values(aiJobs.jobs).some(
    (j) => j && (j.status === 'Queued' || j.status === 'Processing')
  );

  const getActiveJobStep = useCallback(
    (jobs: Array<{ stepType?: string; stepNumber?: number | null; status?: string }> | Record<string, { stepNumber?: number | null; status?: string } | undefined>) => {
      const entries = Array.isArray(jobs)
        ? jobs.map((job) => [job.stepType ?? '', job] as const)
        : Object.entries(jobs);

      for (const [jobKey, job] of entries) {
        if (!job || (job.status !== 'Queued' && job.status !== 'Processing')) continue;
        if (typeof job.stepNumber === 'number' && job.stepNumber > 0) return job.stepNumber;
        if (jobStepMap && jobKey in jobStepMap) return jobStepMap[jobKey as TJobKeys];
      }

      return null;
    },
    [jobStepMap],
  );

  const hasStageConflicts = (workflowState as Record<string, unknown>).stageConflicts != null &&
    Array.isArray((workflowState as Record<string, unknown>).stageConflicts) &&
    ((workflowState as Record<string, unknown>).stageConflicts as unknown[]).length > 0;

  const { debouncedSave, flush: flushAutoSave, cancel: cancelAutoSave } = useWorkflowAutoSave({
    mode: 'immediate',
    disabled: hasActiveAiJobs || hasStageConflicts,
    onSave: async (payload) => {
      const routeId = isCaseIdBased
        ? (workflowState.caseId ?? caseId)
        : workflowState.workflowId;
      if (!routeId) return;

      const stepNumber = stepNumberMapFn ? stepNumberMapFn(active) : active;
      if (stepNumber === null) return;

      await dispatch(thunks.saveDraftStep({ routeId, stepNumber, payload })).unwrap();
    },
  });

  const currentStepOutput = (() => {
    const stepNumber = stepNumberMapFn ? stepNumberMapFn(active) : active;
    if (stepNumber === null) return null;
    return workflowState.outputs[stepNumber as keyof TOutputs];
  })();

  const handleManualSave = useCallback(async () => {
    cancelAutoSave();
    await flushAutoSave(currentStepOutput);
  }, [cancelAutoSave, flushAutoSave, currentStepOutput]);

  useEffect(() => {
    if (workflowState.isReadOnly) return;
    if (currentStepOutput && active > 0) {
      const routeId = isCaseIdBased
        ? (workflowState.caseId ?? caseId)
        : workflowState.workflowId;
      if (routeId) {
        debouncedSave(currentStepOutput);
      }
    }
  }, [currentStepOutput, debouncedSave, isCaseIdBased, workflowState.caseId, workflowState.workflowId, caseId, active, workflowState.isReadOnly]);

  useEffect(() => {
    if (caseId && (!singleCase || singleCase.id.toString() !== caseId)) {
      dispatch(thunkGetSingleCase({ id: caseId }));
    }
  }, [dispatch, caseId, singleCase]);

  useEffect(() => {
    return () => {
      dispatch(resetWorkflow());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!caseId) return;
    if (snapshotModeRef.current || snapshotIdParam) return;

    if (isFreshRun) {
      freshRunInProgressRef.current = true;
      freshSessionRef.current = true;
      setInitialAutoJumpDone(false);
    }

    dispatch(resetWorkflow());

    if (isFreshRun) {
      dispatch(resetAiJobs());

      dispatch(thunks.startNewRun({ caseId }))
        .unwrap()
        .then((result) => {
          freshRunInProgressRef.current = false;
          setActive(0);
          setInitialAutoJumpDone(true);
          dispatch(setActiveRunId(result.runId));
          resetForNewRun(result.runId);
          freshSessionRef.current = false;
          const targetPath = isCaseIdBased ? pathname : `${pathname}?workflowId=${result.id ?? ''}`;
          navigate(targetPath, { replace: true });
        })
        .catch((e: unknown) => {
          freshRunInProgressRef.current = false;
          onError?.(e, 'start');
        });
      return;
    }

    freshRunInProgressRef.current = false;

    if (freshSessionRef.current) {
      dispatch(resetWorkflow());
      return;
    }

    if (selectedWorkflowId && thunks.getWorkflowById) {
      dispatch(thunks.getWorkflowById({ workflowId: selectedWorkflowId }));
      return;
    }

    dispatch(thunks.resumeCurrentRun({ caseId }))
      .unwrap()
      .then(async (result) => {
        dispatch(setActiveRunId(result.runId));
        const jobs = await dispatch(thunkGetAllAiJobs({
          caseId,
          runId: result.runId,
          workflowType: result.workflowType,
        })).unwrap().catch(() => []);
        const activeJobStep = getActiveJobStep(jobs);
        const targetStep = activeJobStep ?? (result.currentAccessibleStep > 0 ? result.currentAccessibleStep : 0);
        setActive(targetStep);
        setInitialAutoJumpDone(true);
      })
      .catch((error: unknown) => {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : '';

        if (errorMessage === WORKFLOW_NOT_FOUND_ERROR) {
          void dispatch(thunks.startWorkflow({ caseId }));
        } else {
          onError?.(error, 'fetch');
        }
      });
  }, [dispatch, caseId, selectedWorkflowId, snapshotIdParam, isFreshRun, isCaseIdBased, abandonThunk, thunks, navigate, pathname, snapshotModeRef, resetForNewRun, getActiveJobStep]);

  const ls = workflowState.loadingState as Record<string, unknown>;
  const isLoading = ls.isFetchingWorkflow === true || ls.isGetting === true || ls.isStarting === true ||
    (!workflowState.workflowId && !isCaseIdBased && workflowState.runId == null) ||
    freshRunInProgressRef.current;

  const isClickableTab = useCallback(
    (index: number) => {
      if (index === 0) return true;
      if (workflowState.runId != null) {
        const stepNumber = stepNumberMapFn ? stepNumberMapFn(index) : index;
        if (stepNumber === null) return false;
        if (stepNumber <= (workflowState.currentAccessibleStep ?? 0)) return true;
        const activeReqs = workflowState.activeRequests ?? [];
        const hasActiveRequest = activeReqs.some(
          (r) => r.stepNumber === stepNumber && (r.status === 'Queued' || r.status === 'Processing')
        );
        if (hasActiveRequest) return true;
        return false;
      }
      return index <= Math.max(active, maxStepAllowed);
    },
    [active, maxStepAllowed, stepNumberMapFn, workflowState.runId, workflowState.currentAccessibleStep, workflowState.activeRequests],
  );

  const handleTabChange = useCallback(
    (key: string | number) => {
      const step = typeof key === 'number' ? key : Number(key);
      if (isClickableTab(step)) {
        setActive(step);
      }
    },
    [isClickableTab],
  );

  const advancingRef = useRef(false);

  const handleAdvanceStage = useCallback(
    async (fromStep: number, toStep: number) => {
      if (advancingRef.current) return;
      const wid = workflowState.workflowId;
      if (wid) {
        advancingRef.current = true;
        try {
          await dispatch(thunks.advanceStage({
            workflowId: wid,
            fromStep,
            toStep,
          })).unwrap();
          setActive(toStep);
        } catch (e) {
          onError?.(e, 'advance');
        } finally {
          advancingRef.current = false;
        }
      } else {
        setActive(toStep);
      }
    },
    [dispatch, thunks, workflowState.workflowId, onError],
  );

  const isAdvancingStage = (workflowState.loadingState as Record<string, unknown>).isAdvancingStage === true;

  const onJobCompletedRef = useRef(onJobCompleted);
  onJobCompletedRef.current = onJobCompleted;

  useEffect(() => {
    if (!onJobCompletedRef.current) return;
    if (freshRunInProgressRef.current) return;
    const jobs = aiJobs.jobs as Record<string, { status?: string; resultJson?: string; id?: string; completedAt?: string; createdAt?: string } | undefined>;
    for (const [jobKey, job] of Object.entries(jobs)) {
      if (job?.status === 'Completed' && job.resultJson) {
        onJobCompletedRef.current(jobKey, job, workflowState.outputs, dispatch);
      }
    }
  }, [aiJobs.jobs, workflowState.outputs, dispatch]);

  return {
    active,
    setActive,
    nextStep,
    prevStep,
    maxStepAllowed,
    handleTabChange,
    caseId,
    isFreshRun,
    isReadOnly: workflowState.isReadOnly,
    snapshotModeRef,
    workflowState,
    singleCase,
    caseFacts,
    setCaseFacts,
    selectedFacts,
    setSelectedFacts,
    handleManualSave,
    isLoading,
    isSavingStep: workflowState.loadingState.isSavingStep,
    isAutoSaving: workflowState.loadingState.isAutoSaving,
    autoSaveError: workflowState.errorState.autoSaveError,
    lastSavedAt: workflowState.lastSavedAt,
    tabsClassNames: WORKFLOW_TAB_CLASSNAMES,
    tabProps: WORKFLOW_TAB_PROPS,
    isClickableTab,
    handleAdvanceStage,
    isAdvancingStage,
  };
}
