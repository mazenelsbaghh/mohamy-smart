import { useCallback } from 'react';
import { Container } from '@mohamy/shared-ui';
import { Tabs, Tab } from '@heroui/react';
import { sileo } from 'sileo';
import { useAppDispatch } from '../../../../../hooks/reduxHooks';
import { useWorkflowOrchestrator } from '../../../../../hooks/useWorkflowOrchestrator';
import { abandonStatementOfClaimsWorkflow, resetStatementOfClaims, restoreStatementSnapshot, statementOfClaimsThunks } from '../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import LawsuitCaseType from './steps/LawsuitCaseType';
import LawsuitParties from './steps/LawsuitParties';
import LawsuitSubjects from './steps/LawsuitSubjects';
import LawsuitLegalBasis from './steps/LawsuitLegalBasis';
import LawsuitRequests from './steps/LawsuitRequests';
import FinalStatementOfClaims from './steps/FinalStatementOfClaims';
import AnalysisFactsSelectionStep from '../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import WorkflowStepBar from '../../../../../components/analysisWorkflow/WorkflowStepBar';
import { AutoRunProgressOverlay } from '../../../../../components/analysisWorkflow/AutoRunProgressOverlay';
import CaseHeaderBanner from '../../../../../components/header/CaseHeaderBanner';
import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';
import { STATEMENT_OF_CLAIMS_STEP_DEFS } from '../../../../../components/analysisWorkflow/workflowConstants';
import type { RootState } from '../../../../../redux/store';
import type { TCaseDetails, TStatementOfClaimsOutputs } from '../../../../../redux/shared/workflowTypes';

const STATEMENT_JOB_STEP_MAP = {
  LawsuitCaseType: 1,
  LawsuitParties: 2,
  LawsuitSubjects: 3,
  LawsuitFacts: 4,
  LawsuitLegalBasis: 5,
  LawsuitRequests: 6,
} as const;

const AUTO_RUN_STEP_MAP: Record<number, string> = {
  1: 'LawsuitCaseType',
  2: 'LawsuitParties',
  3: 'LawsuitSubjects',
  // Step 4 (LawsuitFacts) is hidden/null — skipped by orchestrator
  5: 'LawsuitLegalBasis',
  6: 'LawsuitRequests',
};

const STATEMENT_COMPUTE_MAX_STEP = (
  outputs: TStatementOfClaimsOutputs,
  jobs: Record<string, { status?: string } | undefined>,
) => {
  const isActive = (job: { status?: string } | undefined | null) =>
    job?.status === 'Completed' || job?.status === 'Processing' || job?.status === 'Queued';

  if (outputs[7]) return 7;
  if (outputs[6]) return 6;
  if (outputs[5]) return 5;
  if (outputs[4]) return 4;
  if (outputs[3]) return 3;
  if (outputs[2]) return 2;
  if (outputs[1]) return 1;

  if (isActive(jobs.LawsuitRequests)) return 6;
  if (isActive(jobs.LawsuitLegalBasis)) return 5;
  if (isActive(jobs.LawsuitFacts)) return 4;
  if (isActive(jobs.LawsuitSubjects)) return 3;
  if (isActive(jobs.LawsuitParties)) return 2;
  if (isActive(jobs.LawsuitCaseType)) return 1;

  return 0;
};

const STATEMENT_VISIBLE_STEP_INDEXES = [0, 1, 2, 3, 5, 6, 7] as const;
const STATEMENT_VISIBLE_STEP_DEFS = STATEMENT_VISIBLE_STEP_INDEXES.map((stepIndex) => {
  const step = STATEMENT_OF_CLAIMS_STEP_DEFS[stepIndex];
  return stepIndex === 3 ? { ...step, label: 'موضوع الدعوى ووقائعها' } : step;
});

const mapStatementStepToVisibleIndex = (step: number) => {
  if (step <= 3) return step;
  if (step === 4) return 3;
  return step - 1;
};

const mapStatementStepToVisibleStep = (step: number) => {
  if (step === 4) return 3;
  return step;
};

const PreparingStatementOfClaims = () => {
  const dispatch = useAppDispatch();
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
    sliceSelector: (s: RootState) => s.preparingStatementOfClaimsSlice,
    thunks: statementOfClaimsThunks,
    restoreSnapshot: restoreStatementSnapshot,
    resetWorkflow: resetStatementOfClaims,
    workflowPrefix: 'statement',
    maxSteps: 7,
    steps: STATEMENT_OF_CLAIMS_STEP_DEFS,
    isCaseIdBased: true,
    abandonThunk: abandonStatementOfClaimsWorkflow,
    computeMaxStepAllowed: STATEMENT_COMPUTE_MAX_STEP,
    jobStepMap: STATEMENT_JOB_STEP_MAP,
    autoRunStepMap: AUTO_RUN_STEP_MAP,
    autoRunSkipSteps: [4], // Step 4 (LawsuitFacts) is hidden — auto-advance skips it
    onAutoRunComplete: () => { sileo.success({ title: 'اكتملت جميع مراحل إعداد الصحيفة بنجاح' }); },
    onAutoRunError: (step, error) => { sileo.error({ title: error ?? `فشل التشغيل التلقائي في المرحلة ${step}` }); },
    onError: (error) => { sileo.error({ title: typeof error === 'string' ? error : 'تعذر إتمام العملية' }); },
  });

  const caseType = workflowState.outputs[1] as TCaseDetails | null | undefined;
  const safeCaseId = caseId ?? '';

  const advanceToNextStep = useCallback(() => {
    handleAdvanceStage(active, active + 1);
  }, [active, handleAdvanceStage]);

  const advanceToNextVisibleStep = useCallback(async () => {
    if (active !== 3) {
      await handleAdvanceStage(active, active + 1);
      return;
    }

    const workflowId = workflowState.workflowId;
    if (!workflowId) {
      setActive(5);
      return;
    }

    try {
      await dispatch(statementOfClaimsThunks.advanceStage({ workflowId, fromStep: 3, toStep: 4 })).unwrap();
      await dispatch(statementOfClaimsThunks.advanceStage({ workflowId, fromStep: 4, toStep: 5 })).unwrap();
      setActive(5);
    } catch (error) {
      sileo.error({ title: typeof error === 'string' ? error : 'تعذر الانتقال إلى الأساس القانوني' });
    }
  }, [active, dispatch, handleAdvanceStage, setActive, workflowState.workflowId]);

  const visibleActive = mapStatementStepToVisibleIndex(active);
  const selectedVisibleStep = mapStatementStepToVisibleStep(active);
  const visibleCurrentAccessibleStep = mapStatementStepToVisibleIndex(workflowState.currentAccessibleStep);
  const visibleLastCompletedStep = mapStatementStepToVisibleIndex(workflowState.lastCompletedStep ?? 0);

  const renderedSteps = [
      <AnalysisFactsSelectionStep
      key="facts"
      caseId={safeCaseId}
      facts={caseFacts}
      setFacts={setCaseFacts}
      selectedFacts={selectedFacts}
      setSelectedFacts={setSelectedFacts}
      sidebarDescription="اختر الوقائع الأكثر صلة حتى تكون نتيجة إعداد الصحيفة أدق وأشمل."
      startLabel="إعداد نوع الدعوى"
      continueLabel={workflowState.outputs[1] ? 'الانتقال إلى نوع الدعوى' : 'إعداد نوع الدعوى'}
      onStart={nextStep}
      emptyStateText="لا توجد وقائع محفوظة داخل القضية الحالية. أضف البيانات أولاً من تفاصيل القضية."
      onRunAll={() => startAutoRun(0)}
      isAutoRunning={isAutoRunning}
      estimatedSteps={6}
    />,
      <LawsuitCaseType key="lawsuit-case-type" caseId={safeCaseId} nextStep={advanceToNextStep} selectedFacts={selectedFacts} />,
    <LawsuitParties key="lawsuit-parties" caseId={safeCaseId} nextStep={advanceToNextStep} caseType={caseType} selectedFacts={selectedFacts} />,
    <LawsuitSubjects key="lawsuit-subjects" caseId={safeCaseId} nextStep={advanceToNextVisibleStep} caseType={caseType} selectedFacts={selectedFacts} />,
    null,
    <LawsuitLegalBasis key="lawsuit-legal-basis" caseId={safeCaseId} nextStep={advanceToNextStep} caseType={caseType} selectedFacts={selectedFacts} />,
    <LawsuitRequests key="lawsuit-requests" caseId={safeCaseId} nextStep={advanceToNextStep} caseType={caseType} selectedFacts={selectedFacts} />,
    <FinalStatementOfClaims key="final-statement-of-claims" caseId={safeCaseId} />,
  ];

  const maxSteps = 7;
  const showAutoRunOverlay = isAutoRunning || autoRunJustCompleted || autoRunFailedStep !== null;

  if (isLoading) {
    return (
      <section dir="rtl" className="py-8 min-h-screen">
        <Container>
          <div className="w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl">
            <SmartAnalysisLoader
              title="جاري تجهيز مساحة العمل"
              subtitle="يرجى الانتظار بينما نقوم باسترجاع بيانات القضية..."
              steps={STATEMENT_VISIBLE_STEP_DEFS.map(s => s.label)}
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
              versionLabel={isReadOnly ? (workflowState.snapshotLabel ?? 'نسخة سابقة — صحيفة دعوى') : null}
            />
          )}

          <WorkflowStepBar
            steps={STATEMENT_VISIBLE_STEP_DEFS}
            active={visibleActive}
            workflowTitle="إعداد الصحيفة"
            isAutoSaving={isAutoSaving}
            autoSaveError={autoSaveError}
            lastSavedAt={lastSavedAt}
            onManualSave={handleManualSave}
            isSavingStep={isSavingStep}
            currentAccessibleStep={visibleCurrentAccessibleStep}
            lastCompletedStep={visibleLastCompletedStep}
            isAutoRunning={isAutoRunning}
            onStopAutoRun={stopAutoRun}
          />

          <div className="w-full">
            {showAutoRunOverlay && (
              <AutoRunProgressOverlay
                steps={STATEMENT_VISIBLE_STEP_DEFS}
                activeStep={mapStatementStepToVisibleIndex(active)}
                maxSteps={maxSteps}
                completedSteps={autoRunCompletedSteps.map(mapStatementStepToVisibleIndex)}
                failedStep={autoRunFailedStep != null ? mapStatementStepToVisibleIndex(autoRunFailedStep) : null}
                onStop={() => { stopAutoRun(); dismissAutoRunOverlay(); }}
                isComplete={autoRunJustCompleted}
                onViewResults={() => { dismissAutoRunOverlay(); setActive(maxSteps); }}
              />
            )}
            <div style={{ display: showAutoRunOverlay ? 'none' : undefined }}>
              <Tabs
                aria-label="مراحل إعداد صحيفة الدعوى"
                selectedKey={selectedVisibleStep.toString()}
                onSelectionChange={handleTabChange}
                classNames={tabsClassNames}
                {...tabProps}
              >
                {STATEMENT_VISIBLE_STEP_INDEXES.map((stepIndex, visibleIndex) => {
                  const step = STATEMENT_VISIBLE_STEP_DEFS[visibleIndex];
                  return (
                  <Tab
                    key={stepIndex.toString()}
                    title={
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{step.icon}</span>
                        <span className="hidden md:inline text-nowrap">{step.label}</span>
                      </div>
                    }
                    isDisabled={!isClickableTab(stepIndex)}
                  >
                    {renderedSteps[stepIndex]}
                  </Tab>
                  );
                })}
              </Tabs>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PreparingStatementOfClaims;
