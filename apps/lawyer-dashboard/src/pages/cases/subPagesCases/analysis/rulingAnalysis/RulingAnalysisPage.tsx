import { Container } from'@mohamy/shared-ui';
import { useLocation, useNavigate, useParams, useSearchParams } from"react-router-dom";
import { useState, useEffect, useCallback } from"react";

import { useAppDispatch, useAppSelector } from"../../../../../hooks/reduxHooks";
import thunkGetSingleCase from"../../../../../redux/cases/thunk/thunkGetSingleCase";

import CaseHeaderBanner from'../../../../../components/header/CaseHeaderBanner';
import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';
import { Tabs, Tab } from'@heroui/react';
import { IoCheckmarkCircle, IoDocumentTextOutline, IoFlash, IoListOutline } from'react-icons/io5';
import { useAiJobSignalR } from'../../../../../hooks/useAiJobSignalR';
import { resetAiJobs } from'../../../../../redux/aiJobs/aiJobsSlice';
import { resetRulingAnalysis, rulingAnalysisThunks, restoreRulingAnalysisSnapshot } from"../../../../../redux/rulingAnalysis/rulingAnalysisWorkflowSlice";
import { useWorkflowSnapshotLoader } from"../../../../../hooks/useWorkflowSnapshotLoader";
import AnalysisFactsSelectionStep from'../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import { useWorkflowFacts } from'../../../../../hooks/useWorkflowFacts';
import { useWorkflowAutoSave } from'../../../../../hooks/useWorkflowAutoSave';
import WorkflowStepBar from'../../../../../components/analysisWorkflow/WorkflowStepBar';
import RulingStep1VerdictAnalysis from'./steps/RulingStep1VerdictAnalysis';
import RulingStep2ReasonsAnalysis from'./steps/RulingStep2ReasonsAnalysis';
import RulingStep3DefectsEvaluation from'./steps/RulingStep3DefectsEvaluation';
import RulingStep4AppealViability from'./steps/RulingStep4AppealViability';

const RulingAnalysisPage = () => {
 const [active, setActive] = useState(0);
 const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));

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

 const { snapshotModeRef } = useWorkflowSnapshotLoader({
 snapshotId: snapshotIdParam,
 restoreSnapshot: restoreRulingAnalysisSnapshot,
 fallbackStep: 4,
 onLoaded: (step) => setActive(Math.min(step, 4)),
 });

 const dispatch = useAppDispatch();
 const navigate = useNavigate();

 const WORKFLOW_STATE = useAppSelector(s => s.rulingAnalysis);
 const { outputs, workflowId, loadingState, errorState, lastSavedAt, createdAt } = WORKFLOW_STATE;

 useAiJobSignalR(caseId, isFreshRun, createdAt);

 const verdictAnalysis = outputs[1];
 const reasonsAnalysis = outputs[2];
 const defectsEvaluation = outputs[3];
 const appealViability = outputs[4];

 const { debouncedSave, flush: flushAutoSave, cancel: cancelAutoSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 if (!workflowId) return;
 await dispatch(rulingAnalysisThunks.saveDraftStep({
 routeId: workflowId,
 stepNumber: active,
 payload,
 })).unwrap();
 },
 });

 const currentStepOutput = outputs[active as keyof typeof outputs];

 const handleManualSave = useCallback(async () => {
 cancelAutoSave();
 await flushAutoSave(currentStepOutput);
 }, [cancelAutoSave, flushAutoSave, currentStepOutput]);

 useEffect(() => {
 if (currentStepOutput && workflowId && active > 0) {
 debouncedSave(currentStepOutput);
 }
 }, [currentStepOutput, debouncedSave, workflowId, active]);

 // Fetch single case for the banner
 const { singleCase } = useAppSelector((rootState) => rootState.cases);

 // ── Facts management (persisted selection + API-backed adding) ──
 const { caseFacts, setCaseFacts, selectedFacts, setSelectedFacts } = useWorkflowFacts({
 workflowPrefix:'ruling',
 caseId,
 });

 useEffect(() => {
 if (caseId && (!singleCase || singleCase.id.toString() !== caseId)) {
 dispatch(thunkGetSingleCase({ id: caseId }));
 }
 }, [dispatch, caseId, singleCase]);

 // Load workflow (to get workflowId for auto-save); create one if it doesn't exist yet
 useEffect(() => {
 if (!caseId) return;
 if (snapshotModeRef.current || snapshotIdParam) return;
 dispatch(resetRulingAnalysis());

 // Fresh run: start a brand-new workflow then redirect to ?workflowId=X
 // so isFreshRun becomes false and the SignalR hook can resume normally.
 if (isFreshRun) {
 dispatch(resetAiJobs());
 dispatch(rulingAnalysisThunks.startWorkflow({ caseId }))
 .unwrap()
 .then((created) => {
 navigate(`${pathname}?workflowId=${created.id}`, { replace: true });
 })
 .catch(() => { /* stay on fresh=1 as fallback */ });
 return;
 }

 if (selectedWorkflowId && rulingAnalysisThunks.getWorkflowById) {
 dispatch(rulingAnalysisThunks.getWorkflowById({ workflowId: selectedWorkflowId }));
 return;
 }
 dispatch(rulingAnalysisThunks.getWorkflow({ caseId }))
 .unwrap()
 .catch(() => {
 dispatch(rulingAnalysisThunks.startWorkflow({ caseId }));
 });
 }, [dispatch, caseId, selectedWorkflowId, snapshotIdParam, isFreshRun]);

 // Reset slice on unmount
 useEffect(() => {
 return () => {
 dispatch(resetRulingAnalysis());
 };
 }, [dispatch]);

 const aiJobs = useAppSelector(state => state.aiJobs);

 const [initialAutoJumpDone, setInitialAutoJumpDone] = useState(false);

 const jobs = aiJobs.jobs;
 const isActive = (job: typeof jobs[keyof typeof jobs]) =>
 job?.status ==='Completed' || job?.status ==='Processing' || job?.status ==='Queued';

 let maxStepAllowed = 0;
 if (appealViability) maxStepAllowed = 4;
 else if (defectsEvaluation) maxStepAllowed = 3;
 else if (reasonsAnalysis) maxStepAllowed = 2;
 else if (verdictAnalysis) maxStepAllowed = 1;
 else if (isActive(jobs.RulingAnalysisFeasibilityReport)) maxStepAllowed = 4;
 else if (isActive(jobs.RulingAnalysisDefectEvaluation)) maxStepAllowed = 3;
 else if (isActive(jobs.RulingAnalysisReasoning)) maxStepAllowed = 2;
 else if (isActive(jobs.RulingAnalysisOperative)) maxStepAllowed = 1;

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
 { id: 2, label:'منطوق الحكم', icon: <IoDocumentTextOutline /> },
 { id: 3, label:'أسباب الحكم', icon: <IoListOutline /> },
 { id: 4, label:'تقييم العيوب', icon: <IoFlash /> },
 { id: 5, label:'خلاصة الطعن', icon: <IoCheckmarkCircle /> },
 ];

 const renderedStep = [
 <AnalysisFactsSelectionStep
 key="facts"
 caseId={caseId}
 facts={caseFacts}
 setFacts={setCaseFacts}
 selectedFacts={selectedFacts}
 setSelectedFacts={setSelectedFacts}
 sidebarDescription="اعتمد الوقائع أو مقتطفات الحكم الأكثر أهمية حتى تكون قراءة المنطوق والأسباب والعيوب أدق."
 startLabel="بدء تحليل الحكم"
 continueLabel={verdictAnalysis ?'الانتقال إلى تحليل المنطوق' :'بدء تحليل الحكم'}
 onStart={nextStep}
 />,
 <RulingStep1VerdictAnalysis key="step1" nextStep={nextStep} selectedFacts={selectedFacts} />,
 <RulingStep2ReasonsAnalysis key="step2" nextStep={nextStep} selectedFacts={selectedFacts} />,
 <RulingStep3DefectsEvaluation key="step3" nextStep={nextStep} selectedFacts={selectedFacts} />,
 <RulingStep4AppealViability key="step4" selectedFacts={selectedFacts} />,
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
  hideDocsButton={false}
  versionLabel={WORKFLOW_STATE.isReadOnly ? (WORKFLOW_STATE.snapshotLabel ?? 'نسخة سابقة — تحليل حكم') : null}
  />
 )}
 <WorkflowStepBar
 steps={steps}
 active={active}
 workflowTitle="تحليل الحكم"
 isAutoSaving={loadingState.isAutoSaving}
 autoSaveError={errorState.autoSaveError}
 lastSavedAt={lastSavedAt}
 onManualSave={handleManualSave}
 isSavingStep={loadingState.isSavingStep}
 />

 <div className="w-full">
 <Tabs disableAnimation={true}
 aria-label="مراحل تحليل الحكم"
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

export default RulingAnalysisPage;
