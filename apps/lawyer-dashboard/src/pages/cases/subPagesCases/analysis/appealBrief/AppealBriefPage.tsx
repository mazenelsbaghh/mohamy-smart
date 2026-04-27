import { Container } from'@mohamy/shared-ui';
import { useLocation, useNavigate, useParams, useSearchParams } from"react-router-dom";
import { useState, useEffect, useCallback } from"react";
import { useAppDispatch, useAppSelector } from"../../../../../hooks/reduxHooks";
import thunkGetSingleCase from"../../../../../redux/cases/thunk/thunkGetSingleCase";

import CaseHeaderBanner from'../../../../../components/header/CaseHeaderBanner';
import { Tabs, Tab } from'@heroui/react';
import { IoCheckmarkCircle, IoDocumentTextOutline, IoFlash, IoListOutline, IoBriefcaseOutline, IoLibraryOutline } from'react-icons/io5';
import { useAiJobSignalR } from'../../../../../hooks/useAiJobSignalR';
import { resetAiJobs } from'../../../../../redux/aiJobs/aiJobsSlice';
import { resetAppealBrief, appealBriefThunks, restoreAppealBriefSnapshot } from"../../../../../redux/appealBrief/appealBriefSlice";
import { useWorkflowSnapshotLoader } from"../../../../../hooks/useWorkflowSnapshotLoader";
import AppealStep1JudgmentData from'./steps/AppealStep1JudgmentData';
import AppealStep2Analysis from'./steps/AppealStep2Analysis';
import AppealStep3Grounds from'./steps/AppealStep3Grounds';
import AppealStep4Requests from'./steps/AppealStep4Requests';
import AppealStep5LegalBasis from'./steps/AppealStep5LegalBasis';
import AppealStep6Assembly from'./steps/AppealStep6Assembly';
import AnalysisFactsSelectionStep from'../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import { useWorkflowFacts } from'../../../../../hooks/useWorkflowFacts';
import { useWorkflowAutoSave } from'../../../../../hooks/useWorkflowAutoSave';
import WorkflowStepBar from'../../../../../components/analysisWorkflow/WorkflowStepBar';

const WORKFLOW_NOT_FOUND_ERROR ="Workflow not found";

const AppealBriefPage = () => {
 const [active, setActive] = useState(0);
 const nextStep = () => setActive((current) => (current < 6 ? current + 1 : current));
 const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

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
 restoreSnapshot: restoreAppealBriefSnapshot,
 fallbackStep: 6,
 onLoaded: (step) => setActive(Math.min(step, 6)),
 });

 const dispatch = useAppDispatch();
 const navigate = useNavigate();

 const WORKFLOW_STATE = useAppSelector(s => s.appealBrief);

 useAiJobSignalR(caseId, isFreshRun, WORKFLOW_STATE.createdAt);

 const { debouncedSave, flush: flushAutoSave, cancel: cancelAutoSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 if (!WORKFLOW_STATE.workflowId) return;
 await dispatch(appealBriefThunks.saveDraftStep({
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

 const { singleCase } = useAppSelector((state) => state.cases);

 // ── Facts management (persisted selection + API-backed adding) ──
 const { caseFacts, setCaseFacts, selectedFacts, setSelectedFacts } = useWorkflowFacts({
 workflowPrefix:'appeal',
 caseId,
 });

 useEffect(() => {
 if (caseId && (!singleCase || singleCase.id.toString() !== caseId)) {
 dispatch(thunkGetSingleCase({ id: caseId }));
 }
 }, [dispatch, caseId, singleCase]);

 // Reset slice on unmount
 useEffect(() => {
 return () => {
 dispatch(resetAppealBrief());
 };
 }, [dispatch]);

 // Hydrate existing workflow data, or create a new record if none exists
 useEffect(() => {
 if (!caseId) return;
 if (snapshotModeRef.current || snapshotIdParam) return; // Snapshot loader handles state.
 dispatch(resetAppealBrief());

 // Fresh run: start a brand-new workflow then redirect to ?workflowId=X
 // so isFreshRun becomes false and the SignalR hook can resume normally.
 if (isFreshRun) {
 dispatch(resetAiJobs());
 dispatch(appealBriefThunks.startWorkflow({ caseId }))
 .unwrap()
 .then((created) => {
 navigate(`${pathname}?workflowId=${created.id}`, { replace: true });
 })
 .catch(() => { /* stay on fresh=1 as fallback */ });
 return;
 }

 if (selectedWorkflowId && appealBriefThunks.getWorkflowById) {
 dispatch(appealBriefThunks.getWorkflowById({ workflowId: selectedWorkflowId }));
 return;
 }

 dispatch(appealBriefThunks.getWorkflow({ caseId }))
 .unwrap()
 .catch((error: unknown) => {
 const errorMessage =
 typeof error ==='string'
 ? error
 : error instanceof Error
 ? error.message
 :'';

 if (errorMessage === WORKFLOW_NOT_FOUND_ERROR) {
 void dispatch(appealBriefThunks.startWorkflow({ caseId }));
 } else if (errorMessage) {
 import('sileo').then(({ sileo }) => sileo.error({ title: errorMessage }));
 }
 });
 }, [dispatch, caseId, selectedWorkflowId, snapshotIdParam, isFreshRun]);

 const aiJobs = useAppSelector(state => state.aiJobs);
 const judgmentData = WORKFLOW_STATE.outputs[1];
 const analysisData = WORKFLOW_STATE.outputs[2];
 const groundsData = WORKFLOW_STATE.outputs[3];
 const requestsData = WORKFLOW_STATE.outputs[4];
 const legalBasisData = WORKFLOW_STATE.outputs[5];
 const finalAssemblyData = WORKFLOW_STATE.outputs[6];

 const [initialAutoJumpDone, setInitialAutoJumpDone] = useState(false);

 const jobs = aiJobs.jobs;
 const isActive = (job: { status?: string } | undefined | null) => job?.status ==='Completed' || job?.status ==='Processing' || job?.status ==='Queued';
 
 let maxStepAllowed = 0;
 if (finalAssemblyData) maxStepAllowed = 6;
 else if (legalBasisData) maxStepAllowed = 5;
 else if (requestsData) maxStepAllowed = 4;
 else if (groundsData) maxStepAllowed = 3;
 else if (analysisData) maxStepAllowed = 2;
 else if (judgmentData) maxStepAllowed = 1;
 else if (isActive(jobs.AppealBriefAssembly)) maxStepAllowed = 6;
 else if (isActive(jobs.AppealBriefLegalBasis)) maxStepAllowed = 5;
 else if (isActive(jobs.AppealBriefRequests)) maxStepAllowed = 4;
 else if (isActive(jobs.AppealBriefGrounds)) maxStepAllowed = 3;
 else if (isActive(jobs.AppealBriefReasoningAnalysis)) maxStepAllowed = 2;
 else if (isActive(jobs.AppealBriefJudgmentData)) maxStepAllowed = 1;

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
 { id: 2, label:'بيانات الحكم', icon: <IoDocumentTextOutline /> },
 { id: 3, label:'تحليل الأسباب', icon: <IoFlash /> },
 { id: 4, label:'أوجه الطعن', icon: <IoListOutline /> },
 { id: 5, label:'الطلبات', icon: <IoBriefcaseOutline /> },
 { id: 6, label:'السند القانوني', icon: <IoLibraryOutline /> },
 { id: 7, label:'صحيفة الاستئناف', icon: <IoCheckmarkCircle /> },
 ];

 const renderedStep = [
 <AnalysisFactsSelectionStep
 key="facts"
 caseId={caseId}
 facts={caseFacts}
 setFacts={setCaseFacts}
 selectedFacts={selectedFacts}
 setSelectedFacts={setSelectedFacts}
 sidebarDescription="اعتمد الوقائع أو مقتطفات الحكم والأسباب الأكثر أهمية ليتم استخدامها كمرجع ثابت أثناء كتابة الطعن."
 startLabel="بدء استخراج بيانات الحكم"
 continueLabel={judgmentData ?'الانتقال إلى بيانات الحكم' :'بدء استخراج بيانات الحكم'}
 onStart={nextStep}
 />,
 <AppealStep1JudgmentData key="step1" nextStep={nextStep} selectedFacts={selectedFacts} />,
 <AppealStep2Analysis key="step2" nextStep={nextStep} prevStep={prevStep} selectedFacts={selectedFacts} />,
 <AppealStep3Grounds key="step3" nextStep={nextStep} prevStep={prevStep} selectedFacts={selectedFacts} />,
 <AppealStep4Requests key="step4" nextStep={nextStep} prevStep={prevStep} selectedFacts={selectedFacts} />,
 <AppealStep5LegalBasis key="step5" nextStep={nextStep} prevStep={prevStep} selectedFacts={selectedFacts} />,
 <AppealStep6Assembly key="step6" prevStep={prevStep} selectedFacts={selectedFacts} />,
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
 versionLabel={WORKFLOW_STATE.isReadOnly ? (WORKFLOW_STATE.snapshotLabel ?? 'نسخة سابقة — صحيفة طعن') : null}
 />
 )}

 {WORKFLOW_STATE.loadingState.isFetchingWorkflow || !WORKFLOW_STATE.workflowId ? (
  <div className="w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl">
  <SmartAnalysisLoader 
  title="جاري تجهيز مساحة العمل" 
  subtitle="يرجى الانتظار بينما نقوم باسترجاع بيانات القضية..." 
  steps={steps.map(s => s.label)}
  activeStepIndex={0}
  />
  </div>
  ) : (
  <>
  <WorkflowStepBar
 steps={steps}
 active={active}
 workflowTitle="صحيفة الاستئناف"
 isAutoSaving={WORKFLOW_STATE.loadingState.isAutoSaving}
 autoSaveError={WORKFLOW_STATE.errorState.autoSaveError}
 lastSavedAt={WORKFLOW_STATE.lastSavedAt}
 onManualSave={handleManualSave}
 isSavingStep={WORKFLOW_STATE.loadingState.isSavingStep}
 />

 <div className="w-full">
 <Tabs disableAnimation={true}
 aria-label="مراحل صحيفة الاستئناف"
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
  </>
  )}
  </div>
 </Container>
 </section>
 );
};

export default AppealBriefPage;
