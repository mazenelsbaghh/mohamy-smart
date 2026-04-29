import { Container } from '@mohamy/shared-ui';
import { Tabs, Tab } from '@heroui/react';
import { sileo } from 'sileo';
import { useWorkflowOrchestrator } from '../../../../../hooks/useWorkflowOrchestrator';
import { resetExecRequest, execRequestThunks, restoreExecRequestSnapshot } from '../../../../../redux/execRequest/execRequestSlice';
import ExecStep1Classification from './steps/ExecStep1Classification';
import ExecStep2Drafting from './steps/ExecStep2Drafting';
import ExecStep3Assembly from './steps/ExecStep3Assembly';
import AnalysisFactsSelectionStep from '../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import WorkflowStepBar from '../../../../../components/analysisWorkflow/WorkflowStepBar';
import CaseHeaderBanner from '../../../../../components/header/CaseHeaderBanner';
import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';
import { EXEC_REQUEST_STEP_DEFS } from '../../../../../components/analysisWorkflow/workflowConstants';

const EXEC_JOB_STEP_MAP = {
  ExecRequestClassification: 1,
  ExecRequestDrafting: 2,
  ExecRequestAssembly: 3,
} as const;

const ExecRequestPage = () => {
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
  } = useWorkflowOrchestrator({
    sliceSelector: (s: any) => s.execRequest,
    thunks: execRequestThunks,
    restoreSnapshot: restoreExecRequestSnapshot,
    resetWorkflow: resetExecRequest,
    workflowPrefix: 'exec',
    maxSteps: 3,
    steps: EXEC_REQUEST_STEP_DEFS,
    jobStepMap: EXEC_JOB_STEP_MAP,
    onError: (error) => { sileo.error({ title: typeof error === 'string' ? error : 'تعذر إتمام العملية' }); },
  });

  const classification = workflowState.outputs[1];

  const renderedStep = [
    <AnalysisFactsSelectionStep
      key="facts"
      caseId={caseId}
      facts={caseFacts}
      setFacts={setCaseFacts}
      selectedFacts={selectedFacts}
      setSelectedFacts={setSelectedFacts}
      sidebarDescription="اعتمد الوقائع أو المستندات التنفيذية الأقرب لموضوع السند حتى يكون التصنيف والصياغة أكثر دقة."
      startLabel="بدء تصنيف الطلب"
      continueLabel={classification ? 'الانتقال إلى التصنيف' : 'بدء تصنيف الطلب'}
      onStart={nextStep}
    />,
    <ExecStep1Classification key="step1" nextStep={nextStep} selectedFacts={selectedFacts} />,
    <ExecStep2Drafting key="step2" nextStep={nextStep} selectedFacts={selectedFacts} />,
    <ExecStep3Assembly key="step3" selectedFacts={selectedFacts} />,
  ];

  if (isLoading) {
    return (
      <section dir="rtl" className="py-8 min-h-screen">
        <Container>
          <div className="w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl">
            <SmartAnalysisLoader
              title="جاري تجهيز مساحة العمل"
              subtitle="يرجى الانتظار بينما نقوم باسترجاع بيانات القضية..."
              steps={EXEC_REQUEST_STEP_DEFS.map(s => s.label)}
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
              versionLabel={isReadOnly ? (workflowState.snapshotLabel ?? 'نسخة سابقة — طلب تنفيذي') : null}
            />
          )}

          <WorkflowStepBar
            steps={EXEC_REQUEST_STEP_DEFS}
            active={active}
            workflowTitle="الطلب التنفيذي"
            isAutoSaving={isAutoSaving}
            autoSaveError={autoSaveError}
            lastSavedAt={lastSavedAt}
            onManualSave={handleManualSave}
            isSavingStep={isSavingStep}
          />

          <div className="w-full">
            <Tabs
              aria-label="مراحل الطلب التنفيذي"
              selectedKey={active.toString()}
              onSelectionChange={handleTabChange}
              classNames={tabsClassNames}
              {...tabProps}
            >
              {EXEC_REQUEST_STEP_DEFS.map((step, index) => (
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

export default ExecRequestPage;
