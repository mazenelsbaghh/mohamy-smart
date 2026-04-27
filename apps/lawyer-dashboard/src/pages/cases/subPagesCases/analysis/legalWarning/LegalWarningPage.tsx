import { Container } from'@mohamy/shared-ui';
import { useLocation, useNavigate, useParams, useSearchParams } from"react-router-dom";
import { useState, useEffect, useCallback } from"react";

import { useAppDispatch, useAppSelector } from"../../../../../hooks/reduxHooks";
import thunkGetSingleCase from"../../../../../redux/cases/thunk/thunkGetSingleCase";

import CaseHeaderBanner from'../../../../../components/header/CaseHeaderBanner';
import { Tabs, Tab } from'@heroui/react';
import { IoCheckmarkCircle, IoDocumentTextOutline, IoFlash } from'react-icons/io5';
import { useAiJobSignalR } from'../../../../../hooks/useAiJobSignalR';
import { resetAiJobs } from'../../../../../redux/aiJobs/aiJobsSlice';
import WarningStep1Classification from'./steps/WarningStep1Classification';
import WarningStep2WarningDraft from'./steps/WarningStep2WarningDraft';
import WarningStep3FinalAssembly from'./steps/WarningStep3FinalAssembly';
import { resetLegalWarning, legalWarningThunks, restoreLegalWarningSnapshot } from"../../../../../redux/legalWarning/legalWarningSlice";
import { useWorkflowSnapshotLoader } from"../../../../../hooks/useWorkflowSnapshotLoader";
import AnalysisFactsSelectionStep from'../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import { useWorkflowFacts } from'../../../../../hooks/useWorkflowFacts';
import { useWorkflowAutoSave } from'../../../../../hooks/useWorkflowAutoSave';
import WorkflowStepBar from'../../../../../components/analysisWorkflow/WorkflowStepBar';

const LegalWarningPage = () => {
 const [active, setActive] = useState(0);
 const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));

 const { id: caseIdParam } = useParams<{ id: string }>();
 const [searchParams] = useSearchParams();
 const { pathname } = useLocation();
 const parts = pathname.split('/');
 const caseIdFromPath = parts[2] || parts[3];
 const caseId = caseIdParam || caseIdFromPath;
 const workflowIdParam = Number(searchParams.get('workflowId') || '');
 const selectedWorkflowId = Number.isFinite(workflowIdParam) && workflowIdParam > 0 ? workflowIdParam : null;
 const snapshotIdParam = searchParams.get('snapshot');
 const isFreshRun = searchParams.get('fresh') === '1';

 const dispatch = useAppDispatch();
 const navigate = useNavigate();

 const { snapshotModeRef } = useWorkflowSnapshotLoader({
 snapshotId: snapshotIdParam,
 restoreSnapshot: restoreLegalWarningSnapshot,
 fallbackStep: 3,
 onLoaded: (step) => setActive(Math.min(step, 3)),
 });

 const WORKFLOW_STATE = useAppSelector(s => s.legalWarning);

 // SignalR hook — handles initial fetch + smart polling only when jobs are active
 useAiJobSignalR(caseId, isFreshRun, WORKFLOW_STATE.createdAt);

 const { debouncedSave, flush: flushAutoSave, cancel: cancelAutoSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 if (!WORKFLOW_STATE.workflowId) return;
 await dispatch(legalWarningThunks.saveDraftStep({
 routeId: WORKFLOW_STATE.workflowId,
 stepNumber: active,
 payload,
 })).unwrap();
 },
 });

 const currentStepOutput = WORKFLOW_STATE.outputs[(active) as keyof typeof WORKFLOW_STATE.outputs];

 const handleManualSave = useCallback(async () => {
 cancelAutoSave();
 await flushAutoSave(currentStepOutput);
 }, [cancelAutoSave, flushAutoSave, currentStepOutput]);

 useEffect(() => {
 if (currentStepOutput && WORKFLOW_STATE.workflowId && active > 0) {
 debouncedSave(currentStepOutput);
 }
 }, [currentStepOutput, debouncedSave, WORKFLOW_STATE.workflowId, active]);

 // Fetch single case for the banner
 const { singleCase } = useAppSelector((rootState) => rootState.cases);

 // ── Facts management (persisted selection + API-backed adding) ──
 const { caseFacts, setCaseFacts, selectedFacts, setSelectedFacts } = useWorkflowFacts({
 workflowPrefix:'warning',
 caseId,
 });

 useEffect(() => {
 if (caseId && (!singleCase || singleCase.id.toString() !== caseId)) {
 dispatch(thunkGetSingleCase({ id: caseId }));
 }
 }, [dispatch, caseId, singleCase]);

 // Reset slice on unmount to prevent state leakage
 useEffect(() => {
 return () => {
 dispatch(resetLegalWarning());
 };
 }, [dispatch]);

 // Hydrate existing workflow data, or create a new record if none exists
 useEffect(() => {
 if (!caseId) return;
 if (snapshotModeRef.current || snapshotIdParam) return;
 dispatch(resetLegalWarning());

 // Fresh run: start a brand-new workflow then redirect to ?workflowId=X
 // so isFreshRun becomes false and the SignalR hook can resume normally.
 if (isFreshRun) {
 dispatch(resetAiJobs());
 dispatch(legalWarningThunks.startWorkflow({ caseId }))
 .unwrap()
 .then((created) => {
 navigate(`${pathname}?workflowId=${created.id}`, { replace: true });
 })
 .catch(() => { /* stay on fresh=1 as fallback */ });
 return;
 }

 if (selectedWorkflowId && legalWarningThunks.getWorkflowById) {
 dispatch(legalWarningThunks.getWorkflowById({ workflowId: selectedWorkflowId }));
 return;
 }
 dispatch(legalWarningThunks.getWorkflow({ caseId }))
 .unwrap()
 .catch(() => dispatch(legalWarningThunks.startWorkflow({ caseId })));
 }, [dispatch, caseId, selectedWorkflowId, snapshotIdParam, isFreshRun]);

 const aiJobs = useAppSelector(state => state.aiJobs);
 const classification = WORKFLOW_STATE.outputs[1];
 const warningDraft = WORKFLOW_STATE.outputs[2];
 const finalDocument = WORKFLOW_STATE.outputs[3];

 const [initialAutoJumpDone, setInitialAutoJumpDone] = useState(false);

 let maxStepAllowed = 0;
 const jobs = aiJobs.jobs;
 const isActive = (job: { status?: string } | undefined | null) => job?.status ==='Completed' || job?.status ==='Processing' || job?.status ==='Queued';

 if (isActive(jobs.LegalWarningAssembly) || finalDocument) maxStepAllowed = 3;
 else if (isActive(jobs.LegalWarningBodyDraft) || warningDraft) maxStepAllowed = 2;
 else if (isActive(jobs.LegalWarningClassification) || classification) maxStepAllowed = 1;

 useEffect(() => {
 // Never auto-jump on a fresh run — the user should start from step 0
 if (isFreshRun) return;
 if (!initialAutoJumpDone && maxStepAllowed > 0) {
 setActive(maxStepAllowed);
 setInitialAutoJumpDone(true);
 }
 }, [maxStepAllowed, initialAutoJumpDone, isFreshRun]);

 const steps = [
 { id: 1, label:'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
 { id: 2, label:'تصنيف الإنذار', icon: <IoDocumentTextOutline /> },
 { id: 3, label:'صياغة المتن', icon: <IoFlash /> },
 { id: 4, label:'الإنذار النهائي', icon: <IoCheckmarkCircle /> },
 ];

 const renderedStep = [
 <AnalysisFactsSelectionStep
 key="facts"
 caseId={caseId}
 facts={caseFacts}
 setFacts={setCaseFacts}
 selectedFacts={selectedFacts}
 setSelectedFacts={setSelectedFacts}
 sidebarDescription="اختر الوقائع الأكثر صلة حتى تكون صياغة الإنذار وربط الالتزام والامتناع أدق وأكثر اتساقًا."
 startLabel="بدء تصنيف الإنذار"
 continueLabel={classification ?'الانتقال إلى التصنيف' :'بدء تصنيف الإنذار'}
 onStart={nextStep}
 />,
 <WarningStep1Classification key="step1" nextStep={nextStep} selectedFacts={selectedFacts} />,
 <WarningStep2WarningDraft key="step2" nextStep={nextStep} selectedFacts={selectedFacts} />,
 <WarningStep3FinalAssembly key="step3" selectedFacts={selectedFacts} />,
 ];



 return (
 <section dir="rtl" className="py-8 min-h-screen">
 <Container>
 <div className="flex flex-col gap-6">
 {singleCase && (
  <CaseHeaderBanner 
  caseId={singleCase.id.toString()}
  title={singleCase.title}
  status={singleCase.status}
  facts={singleCase.facts}
  hideDocsButton={true}
  versionLabel={WORKFLOW_STATE.isReadOnly ? (WORKFLOW_STATE.snapshotLabel ?? 'نسخة سابقة — إنذار رسمي') : null}
  />
 )}

 <WorkflowStepBar
 steps={steps}
 active={active}
 workflowTitle="الإنذار الرسمي"
 isAutoSaving={WORKFLOW_STATE.loadingState.isAutoSaving}
 autoSaveError={WORKFLOW_STATE.errorState.autoSaveError}
 lastSavedAt={WORKFLOW_STATE.lastSavedAt}
 onManualSave={handleManualSave}
 isSavingStep={WORKFLOW_STATE.loadingState.isSavingStep}
 />

 <div className="w-full">
 <Tabs disableAnimation={true}
 aria-label="مراحل الإنذار الرسمي"
 selectedKey={active.toString()}
 onSelectionChange={(key) => {
 const step = Number(key);
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

export default LegalWarningPage;
