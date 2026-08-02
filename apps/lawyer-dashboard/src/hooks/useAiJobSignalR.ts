import { useEffect, useRef } from'react';
import * as signalR from'@microsoft/signalr';
import { useAppDispatch, useAppSelector } from'./reduxHooks';
import { upsertJob, type AiJob, type AiJobStatus } from'../redux/aiJobs/aiJobsSlice';
import thunkGetAllAiJobs from'../redux/aiJobs/thunk/thunkGetAllAiJobs';

const HUB_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/,'') +'/hubs/ai-jobs';

/** Statuses that indicate a job is still in-flight and worth polling for. */
const ACTIVE_STATUSES: AiJobStatus[] = ['Queued','Processing'];

/** Reconcile active jobs quickly enough that a missed hub event never leaves the UI stuck. */
const ACTIVE_JOB_POLL_MS = 5_000;

export function useAiJobSignalR(caseId: string | null, skipInitialFetch = false, workflowCreatedAt?: string | null, activeRunId?: string | number | null) {
 const dispatch = useAppDispatch();
 const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
 const jobs = useAppSelector((state) => state.aiJobs.jobs);
 const runIdRef = useRef(activeRunId);
 runIdRef.current = activeRunId;

 // Check if there are any active (Queued/Processing) jobs worth polling for
 const hasActiveJobs = Object.values(jobs).some(
 (j) => j && ACTIVE_STATUSES.includes(j.status)
 );

 useEffect(() => {
 if (!caseId) return;

 let cancelled = false;

 // Always do an initial fetch when the page mounts — UNLESS we are in a
 // fresh-run mode where old completed jobs would pollute the new session.
 if (!skipInitialFetch && workflowCreatedAt) {
 dispatch(thunkGetAllAiJobs({ caseId, since: workflowCreatedAt }));
 }

 // T029: withCredentials sends the httpOnly session cookie on the WebSocket upgrade.
 // No accessTokenFactory / ?access_token= query-string — those were the old pattern
 // that logged tokens in proxy access logs. Cookie auth replaces it.
 const connection = new signalR.HubConnectionBuilder()
 .withUrl(HUB_URL, { withCredentials: true })
 .withAutomaticReconnect()
 .configureLogging(signalR.LogLevel.Error)
 .build();

  const handleStatusChanged = (job: AiJob) => {
  if (workflowCreatedAt && new Date(job.createdAt.endsWith("Z") ? job.createdAt : `${job.createdAt}Z`).getTime() < new Date(workflowCreatedAt.endsWith("Z") ? workflowCreatedAt : `${workflowCreatedAt}Z`).getTime() - 10000) {
  return;
  }
  if (runIdRef.current != null && job.runId != null && String(job.runId) !== String(runIdRef.current)) {
    if (job.stepType !== 'AnalysisDefense') {
      return;
    }
  }
  if (job.status === 'Conflict') {
  dispatch(upsertJob({ ...job, status: 'Failed' }));
  return;
  }
  dispatch(upsertJob(job));
  };

 connection.on('JobStatusChanged', handleStatusChanged);
 connection.on('JobCompleted', handleStatusChanged);
 connection.on('JobFailed', handleStatusChanged);

 // After reconnection, rejoin the case group and fetch any missed updates.
 connection.onreconnected(() => {
 if (cancelled) return;
 connection.invoke('JoinCase', caseId).catch(() => {});
 if (workflowCreatedAt) {
  dispatch(thunkGetAllAiJobs({
  caseId,
  since: workflowCreatedAt,
  runId: runIdRef.current ?? undefined,
  }));
 }
 });

 // Small delay to let React Strict Mode's immediate unmount happen
 // before starting the connection handshake.
 const startTimeout = setTimeout(() => {
 if (cancelled) return;

 connection.start()
 .then(() => {
 if (cancelled) {
 connection.stop();
 return;
 }
 return connection.invoke('JoinCase', caseId);
 })
 .then(() => {
 // Reconciliation fetch after successfully joining the group —
 // covers the race window between connection start and group join.
 if (!cancelled && workflowCreatedAt) {
  dispatch(thunkGetAllAiJobs({
  caseId,
  since: workflowCreatedAt,
  runId: runIdRef.current ?? undefined,
  }));
 }
 })
 .catch(() => {
 // Active-job reconciliation below covers missed hub events.
 });
 }, 100);

 return () => {
 cancelled = true;
 clearTimeout(startTimeout);
 connection.stop().catch(() => {});
 };
 }, [caseId, dispatch, skipInitialFetch, workflowCreatedAt]);

 // SignalR remains the fast path; polling reconciles only while a job is active.
 useEffect(() => {
 if (!caseId || !hasActiveJobs || !workflowCreatedAt) {
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 intervalRef.current = null;
 }
 return;
 }

 if (intervalRef.current) return;

 intervalRef.current = setInterval(() => {
 dispatch(thunkGetAllAiJobs({
  caseId,
  since: workflowCreatedAt,
  runId: runIdRef.current ?? undefined,
 }));
 }, ACTIVE_JOB_POLL_MS);

 return () => {
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 intervalRef.current = null;
 }
 };
 }, [caseId, hasActiveJobs, dispatch, workflowCreatedAt]);
}
