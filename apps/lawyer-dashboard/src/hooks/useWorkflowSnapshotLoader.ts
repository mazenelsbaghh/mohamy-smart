import { useEffect, useRef } from 'react';

import { useAppDispatch } from './reduxHooks';
import api from '../APIs/api';

export type RestorePayload<TOutputs> = {
 outputs: TOutputs;
 currentStep?: number;
 lastSavedAt?: string | null;
 snapshotId?: number;
 snapshotLabel?: string | null;
};

/**
 * Loads a workflow snapshot from /WorkflowSnapshots/{id} and dispatches restoreSnapshot.
 * Sets snapshotModeRef.current = true once loaded, so callers can block hydration / auto-save.
 */
export function useWorkflowSnapshotLoader<TOutputs>(params: {
 snapshotId: string | null;
 // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
 restoreSnapshot: Function;
 resetWorkflow?: () => { type: string };
 fallbackStep?: number;
 onLoaded?: (currentStep: number) => void;
 stepMapFn?: (step: number) => number;
}): { snapshotModeRef: React.MutableRefObject<boolean> } {
 const { snapshotId, restoreSnapshot, resetWorkflow, fallbackStep = 1, onLoaded, stepMapFn } = params;
 const dispatch = useAppDispatch();
 const snapshotModeRef = useRef(false);

 useEffect(() => {
 if (!snapshotId) return;
 const numId = Number(snapshotId);
 if (!Number.isFinite(numId) || numId <= 0) return;

 let cancelled = false;
 api.get(`/WorkflowSnapshots/${numId}`)
 .then((res) => {
 if (cancelled) return;
 const snapshot = res?.data?.data;
 if (!snapshot?.outputsJson) return;
 let outputs: TOutputs;
 try { outputs = JSON.parse(snapshot.outputsJson); }
 catch { return; }
 if (resetWorkflow) dispatch(resetWorkflow());
  const rawStep = snapshot.currentStep ?? fallbackStep;
  const mappedStep = stepMapFn ? stepMapFn(rawStep) : rawStep;
  dispatch(restoreSnapshot({
  outputs,
  currentStep: rawStep,
  lastSavedAt: snapshot.createdAt ?? null,
  snapshotId: numId,
  snapshotLabel: snapshot.label ?? null,
  }));
  snapshotModeRef.current = true;
  onLoaded?.(mappedStep);
 })
 .catch(() => { /* ignore — fall back to normal load */ });

 return () => { cancelled = true; };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [snapshotId]);

 return { snapshotModeRef };
}
