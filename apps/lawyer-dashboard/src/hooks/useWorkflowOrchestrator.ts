import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { AsyncThunk, ActionCreatorWithoutPayload } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import thunkGetSingleCase from '../redux/cases/thunk/thunkGetSingleCase';
import type { IWorkflowThunks } from '../redux/shared/createWorkflowThunks';
import { useWorkflowSnapshotLoader } from './useWorkflowSnapshotLoader';
import { useAiJobSignalR } from './useAiJobSignalR';
import { useWorkflowFacts } from './useWorkflowFacts';
import { useWorkflowAutoSave } from './useWorkflowAutoSave';
import { WORKFLOW_TAB_CLASSNAMES, WORKFLOW_TAB_PROPS } from '../components/analysisWorkflow/workflowConstants';
import { resetAiJobs } from '../redux/aiJobs/aiJobsSlice';
import type { TCase } from '../redux/cases/casesSlice';

export interface StepMeta {
  id: number;
  label: string;
  icon: ReactNode;
}

export interface UseWorkflowOrchestratorConfig<
  TOutputs extends Record<number, unknown>,
  TJobKeys extends string = string,
> {
  sliceSelector: (state: ReturnType<typeof useAppSelector>) => {
    workflowId: number | null;
    caseId: string | null;
    outputs: TOutputs;
    loadingState: { isFetchingWorkflow: boolean; isAutoSaving: boolean; isSavingStep: boolean };
    errorState: { autoSaveError: string | null };
    lastSavedAt: string | null;
    createdAt: string | null;
    isReadOnly: boolean;
    snapshotLabel: string | null;
  };
  thunks: IWorkflowThunks;
  restoreSnapshot: (payload: unknown) => { type: string };
  resetWorkflow: ActionCreatorWithoutPayload | (() => { type: string });
  workflowPrefix: string;
  maxSteps: number;
  steps: StepMeta[];
  isCaseIdBased?: boolean;
  abandonThunk?: AsyncThunk<unknown, string, object>;
  stepNumberMapFn?: (activeStep: number) => number | null;
  computeMaxStepAllowed?: (outputs: TOutputs, jobs: Record<string, { status?: string } | undefined>) => number;
  jobStepMap?: Record<TJobKeys, number>;
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

  useAiJobSignalR(caseId, isFreshRun, workflowState.createdAt);

  const { caseFacts, setCaseFacts, selectedFacts, setSelectedFacts } = useWorkflowFacts({
    workflowPrefix,
    caseId,
  });

  const [active, setActive] = useState(0);
  const nextStep = useCallback(() => setActive((c) => (c < maxSteps ? c + 1 : c)), [maxSteps]);
  const prevStep = useCallback(() => setActive((c) => (c > 0 ? c - 1 : c)), []);
  const [initialAutoJumpDone, setInitialAutoJumpDone] = useState(false);

  const isActiveJob = useCallback(
    (job: { status?: string } | undefined | null) =>
      job?.status === 'Completed' || job?.status === 'Processing' || job?.status === 'Queued',
    [],
  );

  const maxStepAllowed = useMemo(() => {
    if (computeMaxStepAllowed) {
      return computeMaxStepAllowed(workflowState.outputs, aiJobs.jobs);
    }

    const outputs = workflowState.outputs;
    const jobs = aiJobs.jobs;

    for (let i = maxSteps; i >= 1; i--) {
      if (outputs[i as keyof TOutputs]) return i;
    }

    if (jobStepMap) {
      for (const [jobKey, stepIdx] of Object.entries(jobStepMap)) {
        if (isActiveJob((jobs as Record<string, { status?: string } | undefined>)[jobKey])) {
          return stepIdx;
        }
      }
    }

    return 0;
  }, [workflowState.outputs, aiJobs.jobs, maxSteps, computeMaxStepAllowed, jobStepMap, isActiveJob]);

  useEffect(() => {
    if (isFreshRun) return;
    if (!initialAutoJumpDone && maxStepAllowed > 0) {
      setActive(maxStepAllowed);
      setInitialAutoJumpDone(true);
    }
  }, [maxStepAllowed, initialAutoJumpDone, isFreshRun]);

  const { debouncedSave, flush: flushAutoSave, cancel: cancelAutoSave } = useWorkflowAutoSave({
    mode: 'immediate',
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
    dispatch(resetWorkflow());

    if (isFreshRun) {
      dispatch(resetAiJobs());

      if (isCaseIdBased && abandonThunk) {
        dispatch(abandonThunk(caseId))
          .unwrap()
          .then(() => {
            navigate(pathname, { replace: true, state: undefined });
          })
          .catch(() => { });
      } else {
        dispatch(thunks.startWorkflow({ caseId }))
          .unwrap()
          .then((created) => {
            navigate(`${pathname}?workflowId=${created.id}`, { replace: true });
          })
          .catch(() => { });
      }
      return;
    }

    if (selectedWorkflowId && thunks.getWorkflowById) {
      dispatch(thunks.getWorkflowById({ workflowId: selectedWorkflowId }));
      return;
    }

    dispatch(thunks.getWorkflow({ caseId }))
      .unwrap()
      .catch((error: unknown) => {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : '';

        if (errorMessage === WORKFLOW_NOT_FOUND_ERROR) {
          void dispatch(thunks.startWorkflow({ caseId }));
        }
      });
  }, [dispatch, caseId, selectedWorkflowId, snapshotIdParam, isFreshRun, isCaseIdBased, abandonThunk, thunks, navigate, pathname, snapshotModeRef]);

  const isLoading = workflowState.loadingState.isFetchingWorkflow ||
    (!workflowState.workflowId && !isCaseIdBased);

  const handleTabChange = useCallback(
    (key: string | number) => {
      const step = typeof key === 'number' ? key : Number(key);
      if (step <= Math.max(active, maxStepAllowed)) {
        setActive(step);
      }
    },
    [active, maxStepAllowed],
  );

  const isClickableTab = useCallback(
    (index: number) => index <= Math.max(active, maxStepAllowed),
    [active, maxStepAllowed],
  );

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
  };
}
