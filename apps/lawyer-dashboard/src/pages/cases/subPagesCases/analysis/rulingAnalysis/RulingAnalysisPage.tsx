import { Container } from '@mohamy/shared-ui';
import { Tabs, Tab } from '@heroui/react';
import { IoCheckmarkCircle, IoDocumentTextOutline, IoFlash, IoListOutline } from 'react-icons/io5';
import { useWorkflowOrchestrator } from '../../../../../hooks/useWorkflowOrchestrator';
import { resetRulingAnalysis, rulingAnalysisThunks, restoreRulingAnalysisSnapshot } from '../../../../../redux/rulingAnalysis/rulingAnalysisWorkflowSlice';
import RulingStep1VerdictAnalysis from './steps/RulingStep1VerdictAnalysis';
import RulingStep2ReasonsAnalysis from './steps/RulingStep2ReasonsAnalysis';
import RulingStep3DefectsEvaluation from './steps/RulingStep3DefectsEvaluation';
import RulingStep4AppealViability from './steps/RulingStep4AppealViability';
import AnalysisFactsSelectionStep from '../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import WorkflowStepBar from '../../../../../components/analysisWorkflow/WorkflowStepBar';
import CaseHeaderBanner from '../../../../../components/header/CaseHeaderBanner';
import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';

const RULING_STEPS = [
  { id: 1, label: 'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
  { id: 2, label: 'منطوق الحكم', icon: <IoDocumentTextOutline /> },
  { id: 3, label: 'أسباب الحكم', icon: <IoListOutline /> },
  { id: 4, label: 'تقييم العيوب', icon: <IoFlash /> },
  { id: 5, label: 'خلاصة الطعن', icon: <IoCheckmarkCircle /> },
];

const RULING_JOB_STEP_MAP = {
  RulingAnalysisOperative: 1,
  RulingAnalysisReasoning: 2,
  RulingAnalysisDefectEvaluation: 3,
  RulingAnalysisFeasibilityReport: 4,
} as const;

const RulingAnalysisPage = () => {
  const {
    active,
    nextStep,
    maxStepAllowed,
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
    sliceSelector: (s: any) => s.rulingAnalysis,
    thunks: rulingAnalysisThunks,
    restoreSnapshot: restoreRulingAnalysisSnapshot,
    resetWorkflow: resetRulingAnalysis,
    workflowPrefix: 'ruling',
    maxSteps: 4,
    steps: RULING_STEPS,
    jobStepMap: RULING_JOB_STEP_MAP,
  });

  const verdictAnalysis = workflowState.outputs[1];

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
      continueLabel={verdictAnalysis ? 'الانتقال إلى تحليل المنطوق' : 'بدء تحليل الحكم'}
      onStart={nextStep}
    />,
    <RulingStep1VerdictAnalysis key="step1" nextStep={nextStep} selectedFacts={selectedFacts} />,
    <RulingStep2ReasonsAnalysis key="step2" nextStep={nextStep} selectedFacts={selectedFacts} />,
    <RulingStep3DefectsEvaluation key="step3" nextStep={nextStep} selectedFacts={selectedFacts} />,
    <RulingStep4AppealViability key="step4" selectedFacts={selectedFacts} />,
  ];

  if (isLoading) {
    return (
      <section dir="rtl" className="py-8 min-h-screen">
        <Container>
          <div className="w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl">
            <SmartAnalysisLoader
              title="جاري تجهيز مساحة العمل"
              subtitle="يرجى الانتظار بينما نقوم باسترجاع بيانات القضية..."
              steps={RULING_STEPS.map(s => s.label)}
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
              versionLabel={isReadOnly ? (workflowState.snapshotLabel ?? 'نسخة سابقة — تحليل حكم') : null}
            />
          )}

          <WorkflowStepBar
            steps={RULING_STEPS}
            active={active}
            workflowTitle="تحليل الحكم"
            isAutoSaving={isAutoSaving}
            autoSaveError={autoSaveError}
            lastSavedAt={lastSavedAt}
            onManualSave={handleManualSave}
            isSavingStep={isSavingStep}
          />

          <div className="w-full">
            <Tabs
              aria-label="مراحل تحليل الحكم"
              selectedKey={active.toString()}
              onSelectionChange={handleTabChange}
              classNames={tabsClassNames}
              {...tabProps}
            >
              {RULING_STEPS.map((step, index) => (
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

export default RulingAnalysisPage;
