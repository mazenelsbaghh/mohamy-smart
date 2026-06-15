import { useCallback } from 'react';
import { Container } from '@mohamy/shared-ui';
import { Tabs, Tab } from '@heroui/react';
import { sileo } from 'sileo';
import { useWorkflowOrchestrator } from '../../../../../hooks/useWorkflowOrchestrator';
import { resetLegalWarning, legalWarningThunks, restoreLegalWarningSnapshot } from '../../../../../redux/legalWarning/legalWarningSlice';
import WarningStep1Classification from './steps/WarningStep1Classification';
import WarningStep2WarningDraft from './steps/WarningStep2WarningDraft';
import WarningStep3FinalAssembly from './steps/WarningStep3FinalAssembly';
import AnalysisFactsSelectionStep from '../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import WorkflowStepBar from '../../../../../components/analysisWorkflow/WorkflowStepBar';
import CaseHeaderBanner from '../../../../../components/header/CaseHeaderBanner';
import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';
import { LEGAL_WARNING_STEP_DEFS } from '../../../../../components/analysisWorkflow/workflowConstants';
import type { RootState } from '../../../../../redux/store';

const WARNING_JOB_STEP_MAP = {
  LegalWarningClassification: 1,
  LegalWarningBodyDraft: 2,
  LegalWarningAssembly: 3,
} as const;

const AUTO_RUN_STEP_MAP: Record<number, string> = {
  1: 'LegalWarningClassification',
  2: 'LegalWarningBodyDraft',
  3: 'LegalWarningAssembly',
};

const LegalWarningPage = () => {
  const {
    active,
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
  } = useWorkflowOrchestrator({
    sliceSelector: (s: RootState) => s.legalWarning,
    thunks: legalWarningThunks,
    restoreSnapshot: restoreLegalWarningSnapshot,
    resetWorkflow: resetLegalWarning,
    workflowPrefix: 'warning',
    maxSteps: 3,
    steps: LEGAL_WARNING_STEP_DEFS,
    jobStepMap: WARNING_JOB_STEP_MAP,
    autoRunStepMap: AUTO_RUN_STEP_MAP,
    onAutoRunComplete: () => { sileo.success({ title: 'اكتملت جميع مراحل الإنذار الرسمي بنجاح' }); },
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
      sidebarDescription="اختر الوقائع الأكثر صلة حتى تكون صياغة الإنذار وربط الالتزام والامتناع أدق وأكثر اتساقًا."
      startLabel="بدء تصنيف الإنذار"
      continueLabel={classification ? 'الانتقال إلى التصنيف' : 'بدء تصنيف الإنذار'}
      onStart={nextStep}
      onRunAll={() => startAutoRun(0)}
      isAutoRunning={isAutoRunning}
    />,
    <WarningStep1Classification key="step1" nextStep={advanceToNextStep} selectedFacts={selectedFacts} />,
    <WarningStep2WarningDraft key="step2" nextStep={advanceToNextStep} selectedFacts={selectedFacts} />,
    <WarningStep3FinalAssembly key="step3" selectedFacts={selectedFacts} />,
  ];

  if (isLoading) {
    return (
      <section dir="rtl" className="py-8 min-h-screen">
        <Container>
          <div className="w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl">
            <SmartAnalysisLoader
              title="جاري تجهيز مساحة العمل"
              subtitle="يرجى الانتظار بينما نقوم باسترجاع بيانات القضية..."
              steps={LEGAL_WARNING_STEP_DEFS.map(s => s.label)}
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
              versionLabel={isReadOnly ? (workflowState.snapshotLabel ?? 'نسخة سابقة — إنذار رسمي') : null}
            />
          )}

          <WorkflowStepBar
            steps={LEGAL_WARNING_STEP_DEFS}
            active={active}
            workflowTitle="الإنذار الرسمي"
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
            <Tabs
              aria-label="مراحل الإنذار الرسمي"
              selectedKey={active.toString()}
              onSelectionChange={handleTabChange}
              classNames={tabsClassNames}
              {...tabProps}
            >
              {LEGAL_WARNING_STEP_DEFS.map((step, index) => (
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
          </div>
        </div>
      </Container>
    </section>
  );
};

export default LegalWarningPage;
