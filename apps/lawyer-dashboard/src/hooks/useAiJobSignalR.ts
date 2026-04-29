import { useEffect, useRef } from'react';
import * as signalR from'@microsoft/signalr';
import { useAppDispatch, useAppSelector } from'./reduxHooks';
import { upsertJob, type AiJob, type AiJobStatus } from'../redux/aiJobs/aiJobsSlice';
import thunkGetAllAiJobs from'../redux/aiJobs/thunk/thunkGetAllAiJobs';

const HUB_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/,'') +'/hubs/ai-jobs';

/** Statuses that indicate a job is still in-flight and worth polling for. */
const ACTIVE_STATUSES: AiJobStatus[] = ['Queued','Processing'];

export function useAiJobSignalR(caseId: string | null, skipInitialFetch = false, workflowCreatedAt?: string | null, activeRunId?: string | number | null) {
 const dispatch = useAppDispatch();
 const connectionRef = useRef<signalR.HubConnection | null>(null);
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

 connectionRef.current = connection;

  const handleStatusChanged = (job: AiJob) => {
  if (workflowCreatedAt && new Date(job.createdAt.endsWith("Z") ? job.createdAt : `${job.createdAt}Z`).getTime() < new Date(workflowCreatedAt.endsWith("Z") ? workflowCreatedAt : `${workflowCreatedAt}Z`).getTime() - 10000) {
  return;
  }
  if (runIdRef.current != null && job.runId != null && String(job.runId) !== String(runIdRef.current)) {
  return;
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
 .catch(() => {
 // SignalR failed — fallback polling handles it
 });
 }, 100);

 return () => {
 cancelled = true;
 clearTimeout(startTimeout);
 connection.stop().catch(() => {});
 connectionRef.current = null;
 };
 }, [caseId, dispatch, skipInitialFetch, workflowCreatedAt]);

 // Fallback polling: only when SignalR is down AND there are active jobs
 useEffect(() => {
 if (!caseId || !hasActiveJobs || !workflowCreatedAt) {
 // No active jobs or workflow not loaded → stop any existing polling
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 intervalRef.current = null;
 }
 return;
 }

 // Don't start a second interval if one is already running
 if (intervalRef.current) return;

 // Check if SignalR is connected — if so, no need to poll
 const conn = connectionRef.current;
 if (conn && conn.state === signalR.HubConnectionState.Connected) return;

 // SignalR is not connected and we have active jobs → poll every 5 seconds
 intervalRef.current = setInterval(() => {
 dispatch(thunkGetAllAiJobs({ caseId, since: workflowCreatedAt }));
 }, 5000);

 return () => {
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 intervalRef.current = null;
 }
 };
 }, [caseId, hasActiveJobs, dispatch, workflowCreatedAt]);
}
