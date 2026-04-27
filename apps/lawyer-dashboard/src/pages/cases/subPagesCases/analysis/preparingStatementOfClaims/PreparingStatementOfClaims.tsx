import { Container } from'@mohamy/shared-ui';
import { useState, useEffect, useRef, useCallback } from"react";
import { Tabs, Tab } from"@heroui/react";
import {
 IoDocumentTextOutline,
 IoFlash,
 IoPeopleOutline,
 IoList,
 IoShieldCheckmarkOutline,
 IoBriefcaseOutline,
 IoCheckmarkCircle,
 IoReaderOutline,
} from"react-icons/io5";
import { sileo } from'sileo';
import { useLocation, useSearchParams, useNavigate } from'react-router-dom';

import LawsuitCaseType from'./steps/LawsuitCaseType';
import LawsuitParties from'./steps/LawsuitParties';
import LawsuitSubjects from'./steps/LawsuitSubjects';
import LawsuitFacts from'./steps/LawsuitFacts';
import LawsuitLegalBasis from'./steps/LawsuitLegalBasis';
import LawsuitRequests from'./steps/LawsuitRequests';
import FinalStatementOfClaims from'./steps/FinalStatementOfClaims';
import { useAppDispatch, useAppSelector } from'../../../../../hooks/reduxHooks';
import thunkGetSingleCase from'../../../../../redux/cases/thunk/thunkGetSingleCase';

import CaseHeaderBanner from'../../../../../components/header/CaseHeaderBanner';
import { useAiJobSignalR } from'../../../../../hooks/useAiJobSignalR';
import AnalysisFactsSelectionStep from'../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import { useWorkflowFacts } from'../../../../../hooks/useWorkflowFacts';
import { useWorkflowAutoSave } from'../../../../../hooks/useWorkflowAutoSave';
import WorkflowStepBar from'../../../../../components/analysisWorkflow/WorkflowStepBar';
import { abandonStatementOfClaimsWorkflow, resetStatementOfClaims, restoreStatementSnapshot, statementOfClaimsThunks } from'../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import { resetAiJobs } from'../../../../../redux/aiJobs/aiJobsSlice';
import { useWorkflowSnapshotLoader } from'../../../../../hooks/useWorkflowSnapshotLoader';

const PreparingStatementOfClaims = () => {
 const { pathname } = useLocation();
 const [searchParams] = useSearchParams();
 const parts = pathname.split('/');
 const caseId = parts[2];
 const workflowIdParam = Number(searchParams.get('workflowId') || '');
 const selectedWorkflowId = Number.isFinite(workflowIdParam) && workflowIdParam > 0 ? workflowIdParam : null;
 const isFreshRun = searchParams.get('fresh') === '1';
 const snapshotId = searchParams.get('snapshot');

 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const singleCase = useAppSelector((rootState) => rootState.cases.singleCase);
 const preparingStatementOfClaimsState = useAppSelector((rootState) => rootState.preparingStatementOfClaimsSlice);
 const aiJobsState = useAppSelector((rootState) => rootState.aiJobs);

 const [active, setActive] = useState(0);
 const hasInitializedActive = useRef(false);
 const snapshotModeRef = useRef(false);
 const freshRunRef = useRef(false);

 function getMaxStepAllowed() {
 const jobs = aiJobsState.jobs;
 const outputs = preparingStatementOfClaimsState.outputs;
 const isActive = (job: { status?: string } | undefined | null) => job?.status ==='Completed' || job?.status ==='Processing' || job?.status ==='Queued';

 if (outputs[7]) return 7;
 if (outputs[6]) return 7;
 if (outputs[5]) return 6;
 if (outputs[4]) return 5;
 if (outputs[3]) return 4;
 if (outputs[2]) return 3;
 if (outputs[1]) return 2;

 if (isActive(jobs.LawsuitRequests)) return 6;
 if (isActive(jobs.LawsuitLegalBasis)) return 5;
 if (isActive(jobs.LawsuitFacts)) return 4;
 if (isActive(jobs.LawsuitSubjects)) return 3;
 if (isActive(jobs.LawsuitParties)) return 2;
 if (isActive(jobs.LawsuitCaseType)) return 1;

 return 0;
 }

  useWorkflowSnapshotLoader({
    snapshotId,
    restoreSnapshot: restoreStatementSnapshot,
    resetWorkflow: resetStatementOfClaims,
    fallbackStep: 7,
    onLoaded: (step) => {
      snapshotModeRef.current = true;
      hasInitializedActive.current = true;
      setActive(Math.min(step, 7));
    },
  });

 // ── Facts management (persisted selection + API-backed adding) ──
 const { caseFacts, setCaseFacts, selectedFacts, setSelectedFacts } = useWorkflowFacts({
 workflowPrefix:'statement',
 caseId,
 });

 const nextStep = () => setActive((current) => (current < 7 ? current + 1 : current));

 useAiJobSignalR(caseId, isFreshRun, preparingStatementOfClaimsState.createdAt);

 const { debouncedSave: debouncedSaveSoC, flush: flushSoC, cancel: cancelSoC } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 const autoSaveCaseId = preparingStatementOfClaimsState.caseId ?? caseId;
 if (!autoSaveCaseId) return;
 await dispatch(statementOfClaimsThunks.saveDraftStep({
 routeId: autoSaveCaseId,
 stepNumber: active,
 payload,
 })).unwrap();
 },
 });

 const currentStepOutput = preparingStatementOfClaimsState.outputs[(active) as keyof typeof preparingStatementOfClaimsState.outputs];

 const handleManualSave = useCallback(async () => {
 cancelSoC();
 await flushSoC(currentStepOutput);
 }, [cancelSoC, flushSoC, currentStepOutput]);

 useEffect(() => {
 if (preparingStatementOfClaimsState.isReadOnly) return;
 if (currentStepOutput && (preparingStatementOfClaimsState.caseId ?? caseId) && active > 0) {
 debouncedSaveSoC(currentStepOutput);
 }
 }, [currentStepOutput, debouncedSaveSoC, preparingStatementOfClaimsState.caseId, caseId, active, preparingStatementOfClaimsState.isReadOnly]);

  useEffect(() => {
  if (caseId && (!singleCase || singleCase.id.toString() !== caseId)) {
  dispatch(thunkGetSingleCase({ id: caseId }));
  }
  }, [caseId, dispatch, singleCase]);

  useEffect(() => {
  return () => {
  dispatch(resetStatementOfClaims());
  };
  }, [dispatch]);

  // Hydrate existing workflow data, or handle fresh/snapshot modes
  useEffect(() => {
  if (!caseId) return;

  if (snapshotId) return;

  if (isFreshRun) {
 freshRunRef.current = true;
 hasInitializedActive.current = true;
 setActive(0);
 dispatch(resetStatementOfClaims());
 dispatch(resetAiJobs());
 dispatch(abandonStatementOfClaimsWorkflow(caseId))
 .unwrap()
 .then(() => {
 freshRunRef.current = false;
 hasInitializedActive.current = false;
 navigate(pathname, { replace: true, state: undefined });
 })
 .catch((error: unknown) => {
 sileo.error({ title: typeof error === 'string' ? error : 'تعذر بدء صحيفة دعوى جديدة' });
 });
 return;
 }

 dispatch(resetStatementOfClaims());
 if (selectedWorkflowId && statementOfClaimsThunks.getWorkflowById) {
 dispatch(statementOfClaimsThunks.getWorkflowById({ workflowId: selectedWorkflowId }));
 return;
 }
 dispatch(statementOfClaimsThunks.getWorkflow({ caseId }))
 .unwrap()
 .catch(() => dispatch(statementOfClaimsThunks.startWorkflow({ caseId })));
 }, [dispatch, caseId, selectedWorkflowId, isFreshRun, snapshotId, navigate, pathname]);

 // Restore active step on load
 const output1 = preparingStatementOfClaimsState.outputs[1];
 const output2 = preparingStatementOfClaimsState.outputs[2];
 const output3 = preparingStatementOfClaimsState.outputs[3];
 const output4 = preparingStatementOfClaimsState.outputs[4];
 const output5 = preparingStatementOfClaimsState.outputs[5];
 const output6 = preparingStatementOfClaimsState.outputs[6];
 const output7 = preparingStatementOfClaimsState.outputs[7];
 useEffect(() => {
 if (hasInitializedActive.current) return;
 if (snapshotModeRef.current) return;
 if (freshRunRef.current) return;

 const step = getMaxStepAllowed();

 setActive(step);
 hasInitializedActive.current = true;
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [
 aiJobsState.loading,
 aiJobsState.jobs,
 output1,
 output2,
 output3,
 output4,
 output5,
 output6,
 output7,
 ]);

 const steps = [
 { id: 1, label:'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
 { id: 2, label:'نوع الدعوى', icon: <IoFlash /> },
 { id: 3, label:'الأطراف', icon: <IoPeopleOutline /> },
 { id: 4, label:'الموضوع', icon: <IoReaderOutline /> },
 { id: 5, label:'الوقائع', icon: <IoList /> },
 { id: 6, label:'الأساس القانوني', icon: <IoShieldCheckmarkOutline /> },
 { id: 7, label:'الطلبات', icon: <IoBriefcaseOutline /> },
 { id: 8, label:'الصحيفة', icon: <IoCheckmarkCircle /> },
 ];

 const caseType = preparingStatementOfClaimsState.outputs[1] as import('../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice').TCaseDetails | undefined;

 // Step 0 — مراجعة الوقائع
 const factsReviewStep = (
 <AnalysisFactsSelectionStep
 caseId={caseId}
 facts={caseFacts}
 setFacts={setCaseFacts}
 selectedFacts={selectedFacts}
 setSelectedFacts={setSelectedFacts}
 sidebarDescription="اختر الوقائع الأكثر صلة حتى تكون نتيجة إعداد الصحيفة أدق وأشمل."
 startLabel="إعداد نوع الدعوى"
 continueLabel={preparingStatementOfClaimsState.outputs[1] ?'الانتقال إلى نوع الدعوى' :'إعداد نوع الدعوى'}
 onStart={nextStep}
 emptyStateText="لا توجد وقائع محفوظة داخل القضية الحالية. أضف البيانات أولاً من تفاصيل القضية."
 />
 );

 const renderedSteps = [
 factsReviewStep,
 <LawsuitCaseType key="lawsuit-case-type" caseId={caseId} nextStep={nextStep} selectedFacts={selectedFacts} />,
 <LawsuitParties key="lawsuit-parties" caseId={caseId} nextStep={nextStep} caseType={caseType} selectedFacts={selectedFacts} />,
 <LawsuitSubjects key="lawsuit-subjects" caseId={caseId} nextStep={nextStep} caseType={caseType} selectedFacts={selectedFacts} />,
 <LawsuitFacts key="lawsuit-facts" caseId={caseId} nextStep={nextStep} caseType={caseType} selectedFacts={selectedFacts} />,
 <LawsuitLegalBasis key="lawsuit-legal-basis" caseId={caseId} nextStep={nextStep} caseType={caseType} selectedFacts={selectedFacts} />,
 <LawsuitRequests key="lawsuit-requests" caseId={caseId} nextStep={nextStep} caseType={caseType} selectedFacts={selectedFacts} />,
 <FinalStatementOfClaims key="final-statement-of-claims" caseId={caseId} />,
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
 hideDocsButton
 versionLabel={preparingStatementOfClaimsState.isReadOnly ? (preparingStatementOfClaimsState.snapshotLabel ?? 'نسخة سابقة — صحيفة دعوى') : null}
 />
 )}
 <WorkflowStepBar
 steps={steps}
 active={active}
 workflowTitle="إعداد الصحيفة"
 isAutoSaving={preparingStatementOfClaimsState.loadingState.isAutoSaving}
 autoSaveError={preparingStatementOfClaimsState.errorState.autoSaveError}
 lastSavedAt={preparingStatementOfClaimsState.lastSavedAt}
 onManualSave={handleManualSave}
 isSavingStep={preparingStatementOfClaimsState.loadingState.isSavingStep}
 />

 <div className="w-full">
 <Tabs disableAnimation={true}
 aria-label="مراحل إعداد صحيفة الدعوى"
 selectedKey={active.toString()}
 onSelectionChange={(key) => {
 const step = Number(key);
 const maxAllowed = getMaxStepAllowed();
 if (step <= Math.max(active, maxAllowed)) {
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
 cursor:"w-full h-full bg-orange-50 dark:bg-orange-950/40 rounded-lg shadow-none border-0",
 }}
 >
 {steps.map((step, index) => {
 const maxAllowed = getMaxStepAllowed();
 const isClickable = index <= Math.max(active, maxAllowed);

 return (
 <Tab
 key={index.toString()}
 title={
 <div className="flex items-center gap-2">
 <span className="text-lg">{step.icon}</span>
 <span className="hidden md:inline text-nowrap">{step.label}</span>
 </div>
 }
 isDisabled={!isClickable}
 >
 {renderedSteps[index]}
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

export default PreparingStatementOfClaims;
