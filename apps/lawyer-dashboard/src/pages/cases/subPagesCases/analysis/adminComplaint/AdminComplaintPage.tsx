import { Container } from'@mohamy/shared-ui';
import { useLocation, useNavigate, useParams, useSearchParams } from"react-router-dom";
import { useState, useEffect, useCallback } from"react";
import { useAppDispatch, useAppSelector } from"../../../../../hooks/reduxHooks";
import thunkGetSingleCase from"../../../../../redux/cases/thunk/thunkGetSingleCase";

import CaseHeaderBanner from'../../../../../components/header/CaseHeaderBanner';
import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';
import { Tabs, Tab } from'@heroui/react';
import { IoCheckmarkCircle, IoDocumentTextOutline, IoFlash, IoListOutline, IoBriefcaseOutline } from'react-icons/io5';
import { useAiJobSignalR } from'../../../../../hooks/useAiJobSignalR';
import { resetAiJobs } from'../../../../../redux/aiJobs/aiJobsSlice';
import ComplaintStep1Classification from'./steps/ComplaintStep1Classification';
import ComplaintStep2FactsDraft from'./steps/ComplaintStep2FactsDraft';
import ComplaintStep3ViolationAnalysis from'./steps/ComplaintStep3ViolationAnalysis';
import ComplaintStep4RequestsDraft from'./steps/ComplaintStep4RequestsDraft';
import ComplaintStep5FinalAssembly from'./steps/ComplaintStep5FinalAssembly';
import { resetAdminComplaint, adminComplaintThunks, restoreAdminComplaintSnapshot } from"../../../../../redux/adminComplaint/adminComplaintSlice";
import { useWorkflowSnapshotLoader } from"../../../../../hooks/useWorkflowSnapshotLoader";
import AnalysisFactsSelectionStep from'../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import { useWorkflowFacts } from'../../../../../hooks/useWorkflowFacts';
import { useWorkflowAutoSave } from'../../../../../hooks/useWorkflowAutoSave';
import WorkflowStepBar from'../../../../../components/analysisWorkflow/WorkflowStepBar';

const AdminComplaintPage = () => {
 const [active, setActive] = useState(0);
 const nextStep = () => setActive((current) => (current < 5 ? current + 1 : current));

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
 restoreSnapshot: restoreAdminComplaintSnapshot,
 fallbackStep: 5,
 onLoaded: (step) => setActive(Math.min(step, 5)),
 });

 const dispatch = useAppDispatch();
 const navigate = useNavigate();

 const WORKFLOW_STATE = useAppSelector(s => s.adminComplaint);

 useAiJobSignalR(caseId, isFreshRun, WORKFLOW_STATE.createdAt);

 const { debouncedSave, flush: flushAutoSave, cancel: cancelAutoSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 if (!WORKFLOW_STATE.workflowId) return;
 await dispatch(adminComplaintThunks.saveDraftStep({
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

  const { singleCase } = useAppSelector((rootState) => rootState.cases);

  const { caseFacts, setCaseFacts, selectedFacts, setSelectedFacts } = useWorkflowFacts({
  workflowPrefix: 'admin-complaint',
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
 dispatch(resetAdminComplaint());
 };
 }, [dispatch]);

 // Hydrate existing workflow data, or create a new record if none exists
 useEffect(() => {
 if (!caseId) return;
 if (snapshotModeRef.current || snapshotIdParam) return;
 dispatch(resetAdminComplaint());

 // Fresh run: start a brand-new workflow then redirect to ?workflowId=X
 // so isFreshRun becomes false and the SignalR hook can resume normally.
 if (isFreshRun) {
 dispatch(resetAiJobs());
 dispatch(adminComplaintThunks.startWorkflow({ caseId }))
 .unwrap()
 .then((created) => {
 navigate(`${pathname}?workflowId=${created.id}`, { replace: true });
 })
 .catch(() => { /* stay on fresh=1 as fallback */ });
 return;
 }

 if (selectedWorkflowId && adminComplaintThunks.getWorkflowById) {
 dispatch(adminComplaintThunks.getWorkflowById({ workflowId: selectedWorkflowId }));
 return;
 }
 dispatch(adminComplaintThunks.getWorkflow({ caseId }))
 .unwrap()
 .catch(() => dispatch(adminComplaintThunks.startWorkflow({ caseId })));
 }, [dispatch, caseId, selectedWorkflowId, snapshotIdParam, isFreshRun]);

 const aiJobs = useAppSelector(state => state.aiJobs);
 const classification = WORKFLOW_STATE.outputs[1];
 const factsDraft = WORKFLOW_STATE.outputs[2];
 const violationAnalysis = WORKFLOW_STATE.outputs[3];
 const requestsDraft = WORKFLOW_STATE.outputs[4];
 const finalDocument = WORKFLOW_STATE.outputs[5];

  const [initialAutoJumpDone, setInitialAutoJumpDone] = useState(false);

 const jobs = aiJobs.jobs;
 const isActive = (job: { status?: string } | undefined | null) => job?.status ==='Completed' || job?.status ==='Processing' || job?.status ==='Queued';

 let maxStepAllowed = 0;
 if (finalDocument) maxStepAllowed = 5;
 else if (requestsDraft) maxStepAllowed = 4;
 else if (violationAnalysis) maxStepAllowed = 3;
 else if (factsDraft) maxStepAllowed = 2;
 else if (classification) maxStepAllowed = 1;
 else if (isActive(jobs.AdminComplaintAssembly)) maxStepAllowed = 5;
 else if (isActive(jobs.AdminComplaintRequests)) maxStepAllowed = 4;
 else if (isActive(jobs.AdminComplaintViolation)) maxStepAllowed = 3;
 else if (isActive(jobs.AdminComplaintFacts)) maxStepAllowed = 2;
 else if (isActive(jobs.AdminComplaintClassification)) maxStepAllowed = 1;

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
 { id: 2, label:'بيانات الجهة والأساس', icon: <IoDocumentTextOutline /> },
 { id: 3, label:'سرد الوقائع', icon: <IoListOutline /> },
 { id: 4, label:'تحليل المخالفات', icon: <IoFlash /> },
 { id: 5, label:'صياغة الطلبات', icon: <IoBriefcaseOutline /> },
 { id: 6, label:'الشكوى النهائية', icon: <IoCheckmarkCircle /> },
 ];

 const renderedStep = [
 <AnalysisFactsSelectionStep
 key="facts"
 caseId={caseId}
 facts={caseFacts}
 setFacts={setCaseFacts}
 selectedFacts={selectedFacts}
 setSelectedFacts={setSelectedFacts}
 sidebarDescription="اختر الوقائع الأساسية للشكوى أو أضف وقائع جديدة، وسيتم استخدامها في التصنيف وصياغة كامل المسار."
 startLabel="بدء التصنيف"
 continueLabel={classification ?'الانتقال إلى التصنيف' :'بدء التصنيف'}
 onStart={nextStep}
 />,
 <ComplaintStep1Classification key="step1" nextStep={nextStep} selectedFacts={selectedFacts} />,
 <ComplaintStep2FactsDraft key="step2" nextStep={nextStep} selectedFacts={selectedFacts} />,
 <ComplaintStep3ViolationAnalysis key="step3" nextStep={nextStep} selectedFacts={selectedFacts} />,
 <ComplaintStep4RequestsDraft key="step4" nextStep={nextStep} selectedFacts={selectedFacts} />,
 <ComplaintStep5FinalAssembly key="step5" selectedFacts={selectedFacts} />,
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
 versionLabel={WORKFLOW_STATE.isReadOnly ? (WORKFLOW_STATE.snapshotLabel ?? 'نسخة سابقة — شكوى إدارية') : null}
 />
 )}

 <WorkflowStepBar
 steps={steps}
 active={active}
 workflowTitle="الشكوى الإدارية"
 isAutoSaving={WORKFLOW_STATE.loadingState.isAutoSaving}
 autoSaveError={WORKFLOW_STATE.errorState.autoSaveError}
 lastSavedAt={WORKFLOW_STATE.lastSavedAt}
 onManualSave={handleManualSave}
 isSavingStep={WORKFLOW_STATE.loadingState.isSavingStep}
 />

 <div className="w-full">
 <Tabs disableAnimation={true}
 aria-label="مراحل الشكوى"
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

export default AdminComplaintPage;
