import { useCallback } from 'react';
import { Container } from '@mohamy/shared-ui';
import { Tabs, Tab } from '@heroui/react';
import { sileo } from 'sileo';
import { useWorkflowOrchestrator } from '../../../../../hooks/useWorkflowOrchestrator';
import { resetAdminComplaint, adminComplaintThunks, restoreAdminComplaintSnapshot } from '../../../../../redux/adminComplaint/adminComplaintSlice';
import ComplaintStep1Classification from './steps/ComplaintStep1Classification';
import ComplaintStep2FactsDraft from './steps/ComplaintStep2FactsDraft';
import ComplaintStep3ViolationAnalysis from './steps/ComplaintStep3ViolationAnalysis';
import ComplaintStep4RequestsDraft from './steps/ComplaintStep4RequestsDraft';
import ComplaintStep5FinalAssembly from './steps/ComplaintStep5FinalAssembly';
import AnalysisFactsSelectionStep from '../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import WorkflowStepBar from '../../../../../components/analysisWorkflow/WorkflowStepBar';
import { AutoRunProgressOverlay } from '../../../../../components/analysisWorkflow/AutoRunProgressOverlay';
import CaseHeaderBanner from '../../../../../components/header/CaseHeaderBanner';
import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';
import { ADMIN_COMPLAINT_STEP_DEFS } from '../../../../../components/analysisWorkflow/workflowConstants';
import type { RootState } from '../../../../../redux/store';

const COMPLAINT_JOB_STEP_MAP = {
  AdminComplaintClassification: 1,
  AdminComplaintFacts: 2,
  AdminComplaintViolation: 3,
  AdminComplaintRequests: 4,
  AdminComplaintAssembly: 5,
} as const;

const AUTO_RUN_STEP_MAP: Record<number, string> = {
  1: 'AdminComplaintClassification',
  2: 'AdminComplaintFacts',
  3: 'AdminComplaintViolation',
  4: 'AdminComplaintRequests',
  5: 'AdminComplaintAssembly',
};

const AdminComplaintPage = () => {
  const {
    active,
    setActive,
    nextStep,
    handleTabChange,
    caseId,
    isReadOnly,
    workflowState,
    singleCase,
    caseFacts,
    setCaseFacts,
    selectedFacts,
    setSelectedFacts,
    handleManualSave,
    isLoading,
    isSavingStep,
    isAutoSaving,
    autoSaveError,
    lastSavedAt,
    tabsClassNames,
    tabProps,
    isClickableTab,
    handleAdvanceStage,
    isAutoRunning,
    startAutoRun,
    stopAutoRun,
    autoRunCompletedSteps,
    autoRunJustCompleted,
    autoRunFailedStep,
    dismissAutoRunOverlay,
  } = useWorkflowOrchestrator({
    sliceSelector: (s: RootState) => s.adminComplaint,
    thunks: adminComplaintThunks,
    restoreSnapshot: restoreAdminComplaintSnapshot,
    resetWorkflow: resetAdminComplaint,
    workflowPrefix: 'admin-complaint',
    maxSteps: 5,
    steps: ADMIN_COMPLAINT_STEP_DEFS,
    jobStepMap: COMPLAINT_JOB_STEP_MAP,
    autoRunStepMap: AUTO_RUN_STEP_MAP,
    onAutoRunComplete: () => { sileo.success({ title: 'اكتملت جميع مراحل الشكوى الإدارية بنجاح' }); },
    onAutoRunError: (step, error) => { sileo.error({ title: error ?? `فشل التشغيل التلقائي في المرحلة ${step}` }); },
    onError: (error) => { sileo.error({ title: typeof error === 'string' ? error : 'تعذر إتمام العملية' }); },
  });

  const classification = workflowState.outputs[1];

  const advanceToNextStep = useCallback(() => {
    handleAdvanceStage(active, active + 1);
  }, [active, handleAdvanceStage]);

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
      continueLabel={classification ? 'الانتقال إلى التصنيف' : 'بدء التصنيف'}
      onStart={nextStep}
      onRunAll={() => startAutoRun(0)}
      isAutoRunning={isAutoRunning}
      estimatedSteps={5}
    />,
    <ComplaintStep1Classification key="step1" nextStep={advanceToNextStep} selectedFacts={selectedFacts} />,
    <ComplaintStep2FactsDraft key="step2" nextStep={advanceToNextStep} selectedFacts={selectedFacts} />,
    <ComplaintStep3ViolationAnalysis key="step3" nextStep={advanceToNextStep} selectedFacts={selectedFacts} />,
    <ComplaintStep4RequestsDraft key="step4" nextStep={advanceToNextStep} selectedFacts={selectedFacts} />,
    <ComplaintStep5FinalAssembly key="step5" selectedFacts={selectedFacts} />,
  ];

  const maxSteps = 5;
  const showAutoRunOverlay = isAutoRunning || autoRunJustCompleted || autoRunFailedStep !== null;

  if (isLoading) {
    return (
      <section dir="rtl" className="py-8 min-h-screen">
        <Container>
          <div className="w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl">
            <SmartAnalysisLoader
              title="جاري تجهيز مساحة العمل"
              subtitle="يرجى الانتظار بينما نقوم باسترجاع بيانات القضية..."
              steps={ADMIN_COMPLAINT_STEP_DEFS.map(s => s.label)}
              activeStepIndex={0}
            />
          </div>
        </Container>
      </section>
    );
  }

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
              versionLabel={isReadOnly ? (workflowState.snapshotLabel ?? 'نسخة سابقة — شكوى إدارية') : null}
            />
          )}

          <WorkflowStepBar
            steps={ADMIN_COMPLAINT_STEP_DEFS}
            active={active}
            workflowTitle="الشكوى الإدارية"
            isAutoSaving={isAutoSaving}
            autoSaveError={autoSaveError}
            lastSavedAt={lastSavedAt}
            onManualSave={handleManualSave}
            isSavingStep={isSavingStep}
            currentAccessibleStep={workflowState.currentAccessibleStep}
            lastCompletedStep={workflowState.lastCompletedStep}
            isAutoRunning={isAutoRunning}
            onStopAutoRun={stopAutoRun}
          />

          <div className="w-full">
            {showAutoRunOverlay ? (
              <AutoRunProgressOverlay
                steps={ADMIN_COMPLAINT_STEP_DEFS}
                activeStep={active}
                maxSteps={maxSteps}
                completedSteps={autoRunCompletedSteps}
                failedStep={autoRunFailedStep}
                onStop={() => { stopAutoRun(); dismissAutoRunOverlay(); }}
                isComplete={autoRunJustCompleted}
                onViewResults={() => { dismissAutoRunOverlay(); setActive(maxSteps); }}
              />
            ) : (
              <Tabs
                aria-label="مراحل الشكوى"
                selectedKey={active.toString()}
                onSelectionChange={handleTabChange}
                classNames={tabsClassNames}
                {...tabProps}
              >
                {ADMIN_COMPLAINT_STEP_DEFS.map((step, index) => (
                  <Tab
                    key={index.toString()}
                    title={
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{step.icon}</span>
                        <span className="hidden md:inline text-nowrap">{step.label}</span>
                      </div>
                    }
                    isDisabled={!isClickableTab(index)}
                  >
                    {renderedStep[index]}
                  </Tab>
                ))}
              </Tabs>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default AdminComplaintPage;
