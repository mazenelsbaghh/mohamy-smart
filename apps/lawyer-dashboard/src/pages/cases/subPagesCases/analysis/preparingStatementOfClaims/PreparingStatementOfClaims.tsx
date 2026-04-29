import { useCallback } from 'react';
import { Container } from '@mohamy/shared-ui';
import { Tabs, Tab } from '@heroui/react';
import { sileo } from 'sileo';
import { useWorkflowOrchestrator } from '../../../../../hooks/useWorkflowOrchestrator';
import { abandonStatementOfClaimsWorkflow, resetStatementOfClaims, restoreStatementSnapshot, statementOfClaimsThunks } from '../../../../../redux/analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import LawsuitCaseType from './steps/LawsuitCaseType';
import LawsuitParties from './steps/LawsuitParties';
import LawsuitSubjects from './steps/LawsuitSubjects';
import LawsuitFacts from './steps/LawsuitFacts';
import LawsuitLegalBasis from './steps/LawsuitLegalBasis';
import LawsuitRequests from './steps/LawsuitRequests';
import FinalStatementOfClaims from './steps/FinalStatementOfClaims';
import AnalysisFactsSelectionStep from '../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import WorkflowStepBar from '../../../../../components/analysisWorkflow/WorkflowStepBar';
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

const PreparingStatementOfClaims = () => {
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
    onError: (error) => { sileo.error({ title: typeof error === 'string' ? error : 'تعذر إتمام العملية' }); },
  });

  const caseType = workflowState.outputs[1] as TCaseDetails | null | undefined;
  const safeCaseId = caseId ?? '';

  const advanceToNextStep = useCallback(() => {
    handleAdvanceStage(active, active + 1);
  }, [active, handleAdvanceStage]);

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
    />,
      <LawsuitCaseType key="lawsuit-case-type" caseId={safeCaseId} nextStep={advanceToNextStep} selectedFacts={selectedFacts} />,
    <LawsuitParties key="lawsuit-parties" caseId={safeCaseId} nextStep={advanceToNextStep} caseType={caseType} selectedFacts={selectedFacts} />,
    <LawsuitSubjects key="lawsuit-subjects" caseId={safeCaseId} nextStep={advanceToNextStep} caseType={caseType} selectedFacts={selectedFacts} />,
    <LawsuitFacts key="lawsuit-facts" caseId={safeCaseId} nextStep={advanceToNextStep} caseType={caseType} selectedFacts={selectedFacts} />,
    <LawsuitLegalBasis key="lawsuit-legal-basis" caseId={safeCaseId} nextStep={advanceToNextStep} caseType={caseType} selectedFacts={selectedFacts} />,
    <LawsuitRequests key="lawsuit-requests" caseId={safeCaseId} nextStep={advanceToNextStep} caseType={caseType} selectedFacts={selectedFacts} />,
    <FinalStatementOfClaims key="final-statement-of-claims" caseId={safeCaseId} />,
  ];

  if (isLoading) {
    return (
      <section dir="rtl" className="py-8 min-h-screen">
        <Container>
          <div className="w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl">
            <SmartAnalysisLoader
              title="جاري تجهيز مساحة العمل"
              subtitle="يرجى الانتظار بينما نقوم باسترجاع بيانات القضية..."
              steps={STATEMENT_OF_CLAIMS_STEP_DEFS.map(s => s.label)}
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
            steps={STATEMENT_OF_CLAIMS_STEP_DEFS}
            active={active}
            workflowTitle="إعداد الصحيفة"
            isAutoSaving={isAutoSaving}
            autoSaveError={autoSaveError}
            lastSavedAt={lastSavedAt}
            onManualSave={handleManualSave}
            isSavingStep={isSavingStep}
            currentAccessibleStep={workflowState.currentAccessibleStep}
            lastCompletedStep={workflowState.lastCompletedStep}
          />

          <div className="w-full">
            <Tabs
              aria-label="مراحل إعداد صحيفة الدعوى"
              selectedKey={active.toString()}
              onSelectionChange={handleTabChange}
              classNames={tabsClassNames}
              {...tabProps}
            >
              {STATEMENT_OF_CLAIMS_STEP_DEFS.map((step, index) => (
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
                  {renderedSteps[index]}
                </Tab>
              ))}
            </Tabs>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PreparingStatementOfClaims;
