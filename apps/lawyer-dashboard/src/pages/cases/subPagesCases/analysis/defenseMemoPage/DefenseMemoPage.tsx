import { Container } from'@mohamy/shared-ui';
import'./DefenseMemoPage.css';
import { useLocation, useSearchParams, useNavigate } from"react-router-dom";
import { useState, useEffect, useCallback, useMemo, useRef } from"react";
import { sileo } from"sileo";
import { useAppDispatch, useAppSelector } from"../../../../../hooks/reduxHooks";
import { hydrateStep, resetAnalysis, restoreWorkflowSnapshot, smartAnalysisThunks } from"../../../../../redux/analysis/smartAnalysisSlice";
import { resetAiJobs } from"../../../../../redux/aiJobs/aiJobsSlice";
import thunkSubmitAiJob from"../../../../../redux/aiJobs/thunk/thunkSubmitAiJob";
import thunkGetSingleCase from"../../../../../redux/cases/thunk/thunkGetSingleCase";
import {  parseJobResult, parseWorkflowJobResult  } from"@mohamy/shared-utils";

import AnalysisFactsSelectionStep from"../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep";
import LegalAnalysis from'./steps/LegalAnalysis';
import DefensesList from'./steps/DefensesList';
import FinalRequirements from'./steps/FinalRequirements';
import FinalNote from'./steps/FinalNote';
import CaseHeaderBanner from'../../../../../components/header/CaseHeaderBanner';
import { Tabs, Tab } from'@heroui/react';
import { IoCheckmarkCircle, IoDocumentTextOutline, IoFlash, IoList, IoBriefcaseOutline } from'react-icons/io5';
import { LuHistory } from'react-icons/lu';
import { useAiJobSignalR } from'../../../../../hooks/useAiJobSignalR';
import { useWorkflowAutoSave } from'../../../../../hooks/useWorkflowAutoSave';
import WorkflowStepBar from'../../../../../components/analysisWorkflow/WorkflowStepBar';
import api from'../../../../../APIs/api';
import { useWorkflowSnapshotLoader } from'../../../../../hooks/useWorkflowSnapshotLoader';
import { useWorkflowFacts } from'../../../../../hooks/useWorkflowFacts';



/**
 * @component DefenseMemoPage
 * @description Orchestrates the Smart Analysis workflow for defense memo generation.
 * This workflow is structurally different from standard AI pipelines (like Admin Complaints) 
 * as it allows dynamic background job polling via SignalR without tracking a strict sequence 
 * through WorkflowServiceBase database abstractions.
 *
 * Architecture & Data Handoffs:
 * 1. FactsReview (Step 1): Dispatches case facts. Background job'FactAnalysis' triggers. State updates `outputs[1]`.
 * 2. LegalAnalysis (Step 2): Displays the result of FactAnalysis. No direct job submission - acts as an approval stage.
 * 3. DefensesList (Step 3): Triggers'GenerateDefenses' job feeding facts + Analysis output data. Populates `outputs[2]`.
 * - Note: This step also allows individual'AnalyzeDefense' triggers per generated defense node natively.
 * 4. FinalRequirements (Step 4): Triggers'FinalRequirements' job aggregating facts, analysis, and selected defenses. Populates `outputs[4]`.
 * 5. FinalNote (Step 5): Assembles and renders final unified response.
 */
const DefenseMemoPage = () => {
 const [active, setActive] = useState(0);
 const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
 const [hasAutoResumed, setHasAutoResumed] = useState(false);
 const [snapshotCount, setSnapshotCount] = useState(0);
 const navigate = useNavigate();
 // When true, blocks hydration of OLD completed jobs fetched by useAiJobSignalR.
 // Cleared when the user submits a NEW job in this session.
 const freshRunRef = useRef(false);
 // Mirror freshRunRef into state so JSX can react to it (refs don't cause re-renders)
 const [isFreshMode, setIsFreshMode] = useState(false);
 // When true, we are viewing a read-only historical snapshot — block all AiJob hydration
 const snapshotModeRef = useRef(false);

  const { state, pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const parts = pathname.split('/');
  const caseId = parts[2];
  const isFreshRun = searchParams.get('fresh') === '1';
  const snapshotId = searchParams.get('snapshot');
  const workflowIdParam = Number(searchParams.get('workflowId') || '');
  const selectedWorkflowId = Number.isFinite(workflowIdParam) && workflowIdParam > 0 ? workflowIdParam : null;

  const [finalFacts, setFinalFacts] = useState<string>('');
  const dispatch = useAppDispatch();
  const smartAnalysisState = useAppSelector(state => state.smartAnalysis);

  const { caseFacts, setCaseFacts, selectedFacts, setSelectedFacts } = useWorkflowFacts({
  workflowPrefix: 'defense-memo',
  caseId,
  });

  useWorkflowSnapshotLoader({
  snapshotId,
  restoreSnapshot: restoreWorkflowSnapshot,
  resetWorkflow: resetAnalysis,
  fallbackStep: 5,
  stepMapFn: (s) => s <= 2 ? s : Math.min(s - 1, 4),
  onLoaded: (mappedStep) => {
  snapshotModeRef.current = true;
  setActive(mappedStep);
  setHasAutoResumed(true);
  },
  });

 // SignalR hook — skip initial fetch while in fresh-mode to prevent stale jobs
 // from polluting the new session. isFreshMode is reactive: it becomes false when
 // the user submits their first real job, which re-triggers this hook.
 useAiJobSignalR(caseId, isFreshMode, smartAnalysisState.createdAt);

 const { debouncedSave, flush: flushAutoSave, cancel: cancelAutoSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 const autoSaveCaseId = smartAnalysisState.caseId ?? caseId;
 if (!autoSaveCaseId) return;
 await dispatch(smartAnalysisThunks.saveDraftStep({
 routeId: autoSaveCaseId,
 stepNumber: active + 1,
 payload,
 })).unwrap();
 },
 });

 const currentStepOutput = smartAnalysisState.outputs[(active + 1) as keyof typeof smartAnalysisState.outputs];

 const handleManualSave = useCallback(async () => {
 cancelAutoSave();
 await flushAutoSave(currentStepOutput);
 }, [cancelAutoSave, flushAutoSave, currentStepOutput]);

 // Persist defenses (outputs[2]) to the workflow's step 2 after CRUD mutations.
 // Without this, defense edits only live in Redux and are lost on refresh
 // because getWorkflow re-hydrates step2Output from the DB (still the original AI result).
 const saveDefensesStep = useCallback(async () => {
 const saveCaseId = smartAnalysisState.caseId ?? caseId;
 const defensesOutput = smartAnalysisState.outputs[2];
 if (!saveCaseId || !defensesOutput) return;
 try {
 await dispatch(smartAnalysisThunks.saveDraftStep({
 routeId: saveCaseId,
 stepNumber: 2,
 payload: defensesOutput,
 })).unwrap();
 } catch {
 // Silently swallow — user already got feedback from the CRUD operation itself
 }
 }, [dispatch, smartAnalysisState.caseId, smartAnalysisState.outputs, caseId]);

  useEffect(() => {
  if (smartAnalysisState.isReadOnly) return;
  if (active > 0 && currentStepOutput && (smartAnalysisState.caseId ?? caseId)) {
  debouncedSave(currentStepOutput);
  }
  }, [currentStepOutput, debouncedSave, smartAnalysisState.caseId, caseId, smartAnalysisState.isReadOnly, active]);
 
 // Fetch single case for the banner
 const { singleCase } = useAppSelector((rootState) => rootState.cases);

  useEffect(() => {
  if (caseId && (!singleCase || singleCase.id.toString() !== caseId)) {
  dispatch(thunkGetSingleCase({ id: caseId }));
  }
  }, [dispatch, caseId, singleCase]);

  useEffect(() => {
  return () => {
  dispatch(resetAnalysis());
  };
  }, [dispatch]);

 // Fetch snapshot count for this workflow
 useEffect(() => {
  if (!caseId) return;
  api.get(`/WorkflowSnapshots/case/${caseId}`)
   .then((res) => {
    const data = res?.data?.data;
    if (Array.isArray(data)) {
     const defenseSnapshots = data.filter((s: { workflowType: string }) => s.workflowType === 'defense-memo');
     setSnapshotCount(defenseSnapshots.length);
    }
   })
   .catch(() => { /* ignore */ });
 }, [caseId]);

  // Hydrate existing workflow data
  useEffect(() => {
  if (!caseId) return;

  if (snapshotId) return;

  if (isFreshRun) {
  dispatch(resetAnalysis());
  dispatch(resetAiJobs());
  freshRunRef.current = true;
  setIsFreshMode(true);
  setActive(0);
  setHasAutoResumed(true);
  return;
  }

  if (selectedWorkflowId && smartAnalysisThunks.getWorkflowById) {
  dispatch(smartAnalysisThunks.getWorkflowById({ workflowId: selectedWorkflowId }));
  return;
  }

  dispatch(smartAnalysisThunks.getWorkflow({ caseId }));
  }, [dispatch, caseId, isFreshRun, snapshotId, selectedWorkflowId]);

 const facts = (state?.facts ? state.facts : (typeof state ==='string' && state !=='' ? state : (singleCase?.facts ||'')));

 const aiJobs = useAppSelector(state => state.aiJobs);

 const factAnalysisJob = aiJobs.jobs?.FactAnalysis;
 const isFactJobActive = factAnalysisJob?.status ==='Queued' || factAnalysisJob?.status ==='Processing';

  const normalizedFacts = useMemo(() => facts ? [facts] : [], [facts]);

  useEffect(() => {
  if (normalizedFacts.length > 0 && !finalFacts) {
  setFinalFacts(normalizedFacts.join('\n\n'));
  }
  }, [normalizedFacts, finalFacts]);

  const handleStartFactAnalysis = useCallback(() => {
  if (factAnalysisJob?.status ==='Completed' && !freshRunRef.current) {
  const factsText = selectedFacts.join('\n\n');
  setFinalFacts(factsText);
  nextStep();
  return;
  }

  freshRunRef.current = false;
  setIsFreshMode(false);

  const factsText = selectedFacts.join('\n\n');
  setFinalFacts(factsText);
  
  if (caseId) {
  dispatch(thunkSubmitAiJob({
  caseId: caseId as string,
  stepType:'FactAnalysis',
  inputJson: JSON.stringify({ caseId, caseFacts: factsText })
  })).unwrap().then(() => {
  nextStep();
  }).catch((error: unknown) => {
  sileo.error({ title: `حدث خطأ: ${typeof error ==='string' ? error :'مشكلة بالاتصال'}` });
  });
  }
  }, [factAnalysisJob?.status, selectedFacts, caseId, dispatch]);

 // When a step job becomes active again (re-analysis triggered), clear the stale output
 // so that once the job completes, hydration fires with the fresh result.
 useEffect(() => {
  if (snapshotModeRef.current) return;
  const { FactAnalysis, GenerateDefenses, FinalRequirements, DefenseMemoDraft } = aiJobs.jobs;
  const isActive = (s?: string) => s ==='Queued' || s ==='Processing';

 if (isActive(FactAnalysis?.status) && smartAnalysisState.outputs[1])
 dispatch(hydrateStep({ stepNumber: 1, result: null }));
 if (isActive(GenerateDefenses?.status) && smartAnalysisState.outputs[2])
 dispatch(hydrateStep({ stepNumber: 2, result: null }));
 if (isActive(FinalRequirements?.status) && smartAnalysisState.outputs[4])
 dispatch(hydrateStep({ stepNumber: 4, result: null }));
 if (isActive(DefenseMemoDraft?.status) && smartAnalysisState.outputs[5])
 dispatch(hydrateStep({ stepNumber: 5, result: null }));
 }, [aiJobs.jobs, smartAnalysisState.outputs, dispatch]);

 useEffect(() => {
 // Skip hydration from old jobs when in a fresh run or snapshot mode
 if (freshRunRef.current || snapshotModeRef.current) return;

 const hydrateFromJob = (stepNumber: 1 | 2 | 4 | 5, job: typeof aiJobs.jobs[keyof typeof aiJobs.jobs]) => {
 if (job?.status !=='Completed' || !job.resultJson || smartAnalysisState.outputs[stepNumber]) return;

 const parsed = parseWorkflowJobResult(job.resultJson);
 if (parsed) dispatch(hydrateStep({ stepNumber, result: parsed }));
 };

 hydrateFromJob(1, aiJobs.jobs.FactAnalysis);
 hydrateFromJob(2, aiJobs.jobs.GenerateDefenses);
 hydrateFromJob(4, aiJobs.jobs.FinalRequirements);
 hydrateFromJob(5, aiJobs.jobs.DefenseMemoDraft);
 }, [aiJobs, smartAnalysisState.outputs, dispatch]);

 // AnalysisDefense hydration: step 3 is a cache keyed by defenseId,
 // so we hydrate only the specific defense that isn't already cached.
 const analysisDefenseJob = aiJobs.jobs.AnalysisDefense;
 const defenseExplanationCache = smartAnalysisState.outputs[3];

 useEffect(() => {
 if (analysisDefenseJob?.status !=='Completed' || !analysisDefenseJob.resultJson) return;

 const parsed = parseJobResult<{ defenseId?: string; clientDefenseId?: string; memorandum?: Record<string, unknown> }>(analysisDefenseJob.resultJson);
 const defenseId = parsed?.clientDefenseId || parsed?.defenseId;
 if (!defenseId || !parsed?.memorandum) return;

 const cache = defenseExplanationCache || {};
 const hydratedKey = `__job:${analysisDefenseJob.id}:${analysisDefenseJob.completedAt ?? analysisDefenseJob.createdAt}`;
 if ((cache as Record<string, unknown>)[hydratedKey]) return;

 dispatch(hydrateStep({
 stepNumber: 3,
 result: { defenseId, explanation: parsed.memorandum }
 }));
 dispatch(hydrateStep({
 stepNumber: 3,
 result: { defenseId: hydratedKey, explanation: parsed.memorandum }
 }));
 }, [analysisDefenseJob, defenseExplanationCache, dispatch]);

 useEffect(() => {
   if (hasAutoResumed || snapshotModeRef.current) return;
   if (freshRunRef.current) return;

  const outputs = smartAnalysisState.outputs;

  if (outputs[5]) { setActive(4); setHasAutoResumed(true); return; }
  if (outputs[4]) { setActive(3); setHasAutoResumed(true); return; }
  if (outputs[2]) { setActive(2); setHasAutoResumed(true); return; }
  if (outputs[1]) { setActive(1); setHasAutoResumed(true); return; }

  const jobs = aiJobs.jobs;
  if (!jobs.FactAnalysis && !jobs.GenerateDefenses && !jobs.FinalRequirements && !jobs.DefenseMemoDraft) return;

  const isActive = (job: typeof jobs.FactAnalysis) => job?.status === 'Completed' || job?.status === 'Processing' || job?.status === 'Queued';

  if (isActive(jobs.DefenseMemoDraft)) setActive(4);
  else if (isActive(jobs.FinalRequirements)) setActive(3);
  else if (isActive(jobs.GenerateDefenses)) setActive(2);
  else if (isActive(jobs.FactAnalysis)) setActive(1);

  setHasAutoResumed(true);
  }, [smartAnalysisState.outputs, aiJobs.jobs, hasAutoResumed]);

 const steps = [
 { id: 1, label:'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
 { id: 2, label:'التحليل القانوني', icon: <IoFlash /> },
 { id: 3, label:'الدفوع', icon: <IoList /> },
 { id: 4, label:'الطلبات', icon: <IoBriefcaseOutline /> },
 { id: 5, label:'المذكرة النهائية', icon: <IoCheckmarkCircle /> },
 ];

 const renderedStep = [
 <AnalysisFactsSelectionStep
 key="facts"
 caseId={caseId}
 facts={caseFacts}
 setFacts={setCaseFacts}
 selectedFacts={selectedFacts}
 setSelectedFacts={setSelectedFacts}
 sidebarDescription="اختر الوقائع المستخرجة من المستندات ليتم استخدامها كمرجع ثابت أثناء التوليد."
 startLabel="بدء التحليل القانوني"
 continueLabel={(!isFreshMode && factAnalysisJob?.status === 'Completed') ? 'الانتقال إلى التحليل القانوني' : 'بدء التحليل القانوني'}
 onStart={handleStartFactAnalysis}
 isStarting={isFactJobActive}
 />,
 <LegalAnalysis key="analysis" finalFacts={finalFacts} caseFacts={facts} nextStep={nextStep} caseId={caseId} />,
 <DefensesList
 key="defenses"
 caseId={caseId}
 finalFacts={finalFacts}
 nextStep={nextStep}
 onDefensesMutated={saveDefensesStep}
 />,
 <FinalRequirements key="final-req" caseId={caseId} finalFacts={finalFacts} nextStep={nextStep} />,
 <FinalNote key="final-note" caseId={caseId} />,
 ];

 return (
 <section className="defense-memo py-8 min-h-screen">
 <Container>
 <div className="flex flex-col gap-6">
 {/* Vertical breadcrumb column */}
 <div className="flex flex-col gap-1">
 
 {snapshotCount > 0 && (
 <button
 onClick={() => navigate(`/cases/${caseId}`, { state: { activeTab: 'history' } })}
 className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-[var(--main-color)] hover:text-[var(--main-color)] bg-[var(--accent-soft)] hover:bg-orange-100 px-3 py-1 rounded-full border border-[var(--accent-soft-strong)] transition-colors cursor-pointer mt-1"
 >
 <LuHistory className="text-sm" />
 {snapshotCount} نسخة سابقة
 </button>
 )}
 </div>

 {singleCase && (
 <CaseHeaderBanner
 caseId={singleCase.id.toString()}
 title={singleCase.title}
 status={singleCase.status}
 facts={singleCase.facts}
 hideDocsButton={true}
 versionLabel={smartAnalysisState.isReadOnly ? (smartAnalysisState.snapshotLabel ?? 'نسخة سابقة — مذكرة دفاع') : null}
 />
 )}
 <WorkflowStepBar
 steps={steps}
 active={active}
 workflowTitle="مذكرة الدفاع"
 isAutoSaving={smartAnalysisState.loadingState.isAutoSaving}
 autoSaveError={smartAnalysisState.errorState.autoSaveError}
 lastSavedAt={smartAnalysisState.lastSavedAt}
 onManualSave={handleManualSave}
 isSavingStep={smartAnalysisState.loadingState.isSavingStep}
 />

 <div className="w-full">
 <Tabs disableAnimation={true}
 aria-label="مراحل التحليل الذكي"
 selectedKey={active.toString()}
 onSelectionChange={(key) => {
 const step = Number(key);
 let maxStepAllowed = 0;
 if (smartAnalysisState.outputs[5]) {
 maxStepAllowed = 4;
 } else if (smartAnalysisState.outputs[4]) {
 maxStepAllowed = 3;
 } else if (smartAnalysisState.outputs[2]) {
 maxStepAllowed = 2;
 } else if (smartAnalysisState.outputs[1]) {
 maxStepAllowed = 1;
 }

 if (step <= Math.max(active, maxStepAllowed)) {
 setActive(step);
 }
 }}
 variant="light"
 color="primary"
 classNames={{
 base:"w-full overflow-x-auto",
 tabList:"w-full p-1 bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl mb-4 gap-1",
 tab:"flex-1 px-3 py-3 min-h-[44px] justify-center rounded-lg data-[hover=true]:app-surface-soft dark:data-[hover=true]:app-surface-soft transition-colors z-0",
 tabContent:"font-bold text-[13px] app-text-subtle dark:text-white/70 group-data-[selected=true]:text-[var(--main-color)] dark:group-data-[selected=true]:text-white relative z-10",
 panel:"pt-4 pb-2 px-0",
 cursor:"w-full h-full bg-orange-50 dark:bg-orange-950/40 rounded-lg shadow-none border-0"
 }}
 >
 {steps.map((step, index) => {
 let maxStepAllowed = 0;
 if (smartAnalysisState.outputs[5]) {
 maxStepAllowed = 4;
 } else if (smartAnalysisState.outputs[4]) {
 maxStepAllowed = 3;
 } else if (smartAnalysisState.outputs[2]) {
 maxStepAllowed = 2;
 } else if (smartAnalysisState.outputs[1]) {
 maxStepAllowed = 1;
 }
 
 const isClickable = index <= Math.max(active, maxStepAllowed);

 return (
 <Tab key={index.toString()} title={
 <div className="flex items-center gap-2">
 <span className="text-lg">{step.icon}</span>
 <span className="hidden md:inline text-nowrap">{step.label}</span>
 </div>
 } isDisabled={!isClickable}>
 {renderedStep[index]}
 </Tab>
 );
 })}
 </Tabs>
 </div>
 </div>
 </Container>
 </section>
 );
};

export default DefenseMemoPage;
