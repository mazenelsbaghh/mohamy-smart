import { useCallback } from 'react';
import { Container } from '@mohamy/shared-ui';
import { Tabs, Tab } from '@heroui/react';
import { sileo } from 'sileo';
import { useWorkflowOrchestrator } from '../../../../../hooks/useWorkflowOrchestrator';
import { resetAppealBrief, appealBriefThunks, restoreAppealBriefSnapshot } from '../../../../../redux/appealBrief/appealBriefSlice';
import AppealStep1JudgmentData from './steps/AppealStep1JudgmentData';
import AppealStep2Analysis from './steps/AppealStep2Analysis';
import AppealStep3Grounds from './steps/AppealStep3Grounds';
import AppealStep4Requests from './steps/AppealStep4Requests';
import AppealStep5LegalBasis from './steps/AppealStep5LegalBasis';
import AppealStep6Assembly from './steps/AppealStep6Assembly';
import AnalysisFactsSelectionStep from '../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import WorkflowStepBar from '../../../../../components/analysisWorkflow/WorkflowStepBar';
import { AutoRunProgressOverlay } from '../../../../../components/analysisWorkflow/AutoRunProgressOverlay';
import CaseHeaderBanner from '../../../../../components/header/CaseHeaderBanner';
import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';
import { APPEAL_BRIEF_STEP_DEFS } from '../../../../../components/analysisWorkflow/workflowConstants';
import type { RootState } from '../../../../../redux/store';

const APPEAL_JOB_STEP_MAP = {
  AppealBriefJudgmentData: 1,
  AppealBriefReasoningAnalysis: 2,
  AppealBriefGrounds: 3,
  AppealBriefRequests: 4,
  AppealBriefLegalBasis: 5,
  AppealBriefAssembly: 6,
} as const;

const AUTO_RUN_STEP_MAP: Record<number, string> = {
  1: 'AppealBriefJudgmentData',
  2: 'AppealBriefReasoningAnalysis',
  3: 'AppealBriefGrounds',
  4: 'AppealBriefRequests',
  5: 'AppealBriefLegalBasis',
  6: 'AppealBriefAssembly',
};

const AppealBriefPage = () => {
  const {
    active,
    setActive,
    nextStep,
    prevStep,
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
    sliceSelector: (s: RootState) => s.appealBrief,
    thunks: appealBriefThunks,
    restoreSnapshot: restoreAppealBriefSnapshot,
    resetWorkflow: resetAppealBrief,
    workflowPrefix: 'appeal',
    maxSteps: 6,
    steps: APPEAL_BRIEF_STEP_DEFS,
    jobStepMap: APPEAL_JOB_STEP_MAP,
    autoRunStepMap: AUTO_RUN_STEP_MAP,
    onAutoRunComplete: () => { sileo.success({ title: 'اكتملت جميع مراحل صحيفة الاستئناف بنجاح' }); },
    onAutoRunError: (step, error) => { sileo.error({ title: error ?? `فشل التشغيل التلقائي في المرحلة ${step}` }); },
    onError: (error) => { sileo.error({ title: typeof error === 'string' ? error : 'تعذر إتمام العملية' }); },
  });

  const judgmentData = workflowState.outputs[1];

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
      sidebarDescription="اعتمد الوقائع أو مقتطفات الحكم والأسباب الأكثر أهمية ليتم استخدامها كمرجع ثابت أثناء كتابة الطعن."
      startLabel="بدء استخراج بيانات الحكم"
      continueLabel={judgmentData ? 'الانتقال إلى بيانات الحكم' : 'بدء استخراج بيانات الحكم'}
      onStart={nextStep}
      onRunAll={() => startAutoRun(0)}
      isAutoRunning={isAutoRunning}
      estimatedSteps={6}
    />,
    <AppealStep1JudgmentData key="step1" nextStep={advanceToNextStep} selectedFacts={selectedFacts} />,
    <AppealStep2Analysis key="step2" nextStep={advanceToNextStep} prevStep={prevStep} selectedFacts={selectedFacts} />,
    <AppealStep3Grounds key="step3" nextStep={advanceToNextStep} prevStep={prevStep} selectedFacts={selectedFacts} />,
    <AppealStep4Requests key="step4" nextStep={advanceToNextStep} prevStep={prevStep} selectedFacts={selectedFacts} />,
    <AppealStep5LegalBasis key="step5" nextStep={advanceToNextStep} prevStep={prevStep} selectedFacts={selectedFacts} />,
    <AppealStep6Assembly key="step6" prevStep={prevStep} selectedFacts={selectedFacts} />,
  ];

  const maxSteps = 6;
  const showAutoRunOverlay = isAutoRunning || autoRunJustCompleted || autoRunFailedStep !== null;

  if (isLoading) {
    return (
      <section dir="rtl" className="py-8 min-h-screen">
        <Container>
          <div className="w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl">
            <SmartAnalysisLoader
              title="جاري تجهيز مساحة العمل"
              subtitle="يرجى الانتظار بينما نقوم باسترجاع بيانات القضية..."
              steps={APPEAL_BRIEF_STEP_DEFS.map(s => s.label)}
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
              versionLabel={isReadOnly ? (workflowState.snapshotLabel ?? 'نسخة سابقة — صحيفة طعن') : null}
            />
          )}

          <WorkflowStepBar
            steps={APPEAL_BRIEF_STEP_DEFS}
            active={active}
            workflowTitle="صحيفة الاستئناف"
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
                steps={APPEAL_BRIEF_STEP_DEFS}
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
                aria-label="مراحل صحيفة الاستئناف"
                selectedKey={active.toString()}
                onSelectionChange={handleTabChange}
                classNames={tabsClassNames}
                {...tabProps}
              >
                {APPEAL_BRIEF_STEP_DEFS.map((step, index) => (
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

export default AppealBriefPage;
