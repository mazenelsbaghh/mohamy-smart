import { Container } from '@mohamy/shared-ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { sileo } from 'sileo';
import { useAppDispatch, useAppSelector } from '../../../../../hooks/reduxHooks';
import {
  hydrateStep,
  resetAnalysis,
  setCurrentAccessibleStep,
  setLastCompletedStep,
  smartAnalysisThunks,
  abandonSmartAnalysisWorkflow,
  restoreWorkflowSnapshot as restoreSnapshot,
} from '../../../../../redux/analysis/smartAnalysisSlice';
import thunkSubmitAiJob from '../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import { parseJobResult, parseWorkflowJobResult } from '@mohamy/shared-utils';

import AnalysisFactsSelectionStep from '../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import LegalAnalysis from './steps/LegalAnalysis';
import DefensesList from './steps/DefensesList';
import FinalRequirements from './steps/FinalRequirements';
import FinalNote from './steps/FinalNote';
import CaseHeaderBanner from '../../../../../components/header/CaseHeaderBanner';
import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';
import { Tabs, Tab } from '@heroui/react';
import { LuHistory } from 'react-icons/lu';
import WorkflowStepBar from '../../../../../components/analysisWorkflow/WorkflowStepBar';
import api from '../../../../../APIs/api';
import { DEFENSE_MEMO_STEP_DEFS, WORKFLOW_TAB_CLASSNAMES, WORKFLOW_TAB_PROPS } from '../../../../../components/analysisWorkflow/workflowConstants';
import { useWorkflowOrchestrator } from '../../../../../hooks/useWorkflowOrchestrator';


const DEFENSE_JOB_STEP_MAP = {
  FactAnalysis: 1,
  GenerateDefenses: 2,
  AnalysisDefense: 2,
  FinalRequirements: 3,
  DefenseMemoDraft: 4,
} as const;

type DefenseJobKey = keyof typeof DEFENSE_JOB_STEP_MAP;
type DefenseJobMap = Partial<Record<DefenseJobKey, { status?: string } | undefined>>;
type DefenseAnalysisJobResult = {
  defenseId?: string;
  clientDefenseId?: string;
  memorandum?: Record<string, unknown>;
  explanation?: Record<string, unknown>;
  data?: {
    defenseId?: string;
    clientDefenseId?: string;
    memorandum?: Record<string, unknown>;
    explanation?: Record<string, unknown>;
  };
};

const isRunningDefenseJob = (job: { status?: string } | undefined | null) =>
  job?.status === 'Queued' || job?.status === 'Processing';

const getRunningDefenseTargetStep = (jobs: DefenseJobMap) => {
  if (isRunningDefenseJob(jobs.DefenseMemoDraft)) return 4;
  if (isRunningDefenseJob(jobs.FinalRequirements)) return 3;
  if (isRunningDefenseJob(jobs.GenerateDefenses) || isRunningDefenseJob(jobs.AnalysisDefense)) return 2;
  if (isRunningDefenseJob(jobs.FactAnalysis)) return 1;
  return 0;
};

const DefenseMemoPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { state, pathname } = useLocation();
  const parts = pathname.split('/');
  const caseId = parts[2];

  const [snapshotCount, setSnapshotCount] = useState(0);
  const [finalFacts, setFinalFacts] = useState<string>('');
  const freshRunRef = useRef(false);

  const aiJobs = useAppSelector((s) => s.aiJobs);
  const { singleCase } = useAppSelector((s) => s.cases);

  const {
    active,
    setActive,
    nextStep,
    isClickableTab,
    caseFacts,
    setCaseFacts,
    selectedFacts,
    setSelectedFacts,
    handleManualSave,
    isLoading,
    isAutoSaving,
    autoSaveError,
    lastSavedAt,
    isSavingStep,
    isReadOnly,
    workflowState: orchestratorState,
  } = useWorkflowOrchestrator({
    sliceSelector: (s) => s.smartAnalysis,
    thunks: smartAnalysisThunks,
    restoreSnapshot,
    resetWorkflow: resetAnalysis,
    workflowPrefix: 'defense-memo',
    maxSteps: 4,
    steps: DEFENSE_MEMO_STEP_DEFS,
    isCaseIdBased: true,
    abandonThunk: abandonSmartAnalysisWorkflow,
    stepNumberMapFn: (activeStep) => {
      if (activeStep === 1) return 1;
      if (activeStep === 2) return 2;
      if (activeStep === 3) return 4;
      if (activeStep === 4) return 5;
      return null;
    },
    computeMaxStepAllowed: (outputs, jobs) => {
      const isActive = (job: { status?: string } | undefined | null) =>
        job?.status === 'Completed' || job?.status === 'Processing' || job?.status === 'Queued';

      if (outputs[5]) return 4;
      if (outputs[4]) return 3;
      if (outputs[3]) return 2;
      if (outputs[2]) return 2;
      if (outputs[1]) return 1;

      if (isActive((jobs as Record<string, { status?: string } | undefined>).DefenseMemoDraft)) return 4;
      if (isActive((jobs as Record<string, { status?: string } | undefined>).FinalRequirements)) return 3;
      if (isActive((jobs as Record<string, { status?: string } | undefined>).GenerateDefenses) || isActive((jobs as Record<string, { status?: string } | undefined>).AnalysisDefense)) return 2;
      if (isActive((jobs as Record<string, { status?: string } | undefined>).FactAnalysis)) return 1;

      return 0;
    },
    jobStepMap: DEFENSE_JOB_STEP_MAP,
    computeAutoResumeTarget: (outputs, jobs) => {
      const runningTarget = getRunningDefenseTargetStep(jobs as DefenseJobMap);
      if (runningTarget) return runningTarget;

      if (outputs[5]) return 4;
      if (outputs[4]) return 3;
      if (outputs[3]) return 2;
      if (outputs[2]) return 2;
      if (outputs[1]) return 1;

      return 0;
    },
    onJobCompleted: (jobKey, job, outputs, dispatch) => {
      if (jobKey === 'AnalysisDefense') {
        const parsed = parseWorkflowJobResult<DefenseAnalysisJobResult>(job.resultJson!) ?? parseJobResult<DefenseAnalysisJobResult>(job.resultJson!);
        const defenseId = parsed?.clientDefenseId || parsed?.defenseId || parsed?.data?.clientDefenseId || parsed?.data?.defenseId;
        const memorandum = parsed?.memorandum || parsed?.explanation || parsed?.data?.memorandum || parsed?.data?.explanation;
        if (!defenseId || !memorandum) return;

        const cache = (outputs[3] || {}) as Record<string, unknown>;
        const hydratedKey = `__job:${job.id}:${job.completedAt ?? job.createdAt}`;
        if (cache[hydratedKey]) return;

        dispatch(hydrateStep({ stepNumber: 3, result: { defenseId, explanation: memorandum } }));
        dispatch(hydrateStep({ stepNumber: 3, result: { defenseId: hydratedKey, explanation: memorandum } }));
        return;
      }

      const stepMap: Record<string, number> = { FactAnalysis: 1, GenerateDefenses: 2, FinalRequirements: 4, DefenseMemoDraft: 5 };
      const stepNumber = stepMap[jobKey];
      if (!stepNumber || outputs[stepNumber as keyof typeof outputs]) return;

      const parsed = parseWorkflowJobResult(job.resultJson!);
      if (parsed) dispatch(hydrateStep({ stepNumber, result: parsed }));
    },
    onStepSave: async (stepNumber, _payload, dispatch) => {
      if (stepNumber !== 2) return;
      const saveCaseId = orchestratorState.caseId ?? caseId;
      const defensesOutput = orchestratorState.outputs[2];
      if (!saveCaseId || !defensesOutput) return;
      await dispatch(smartAnalysisThunks.saveDraftStep({
        routeId: saveCaseId,
        stepNumber: 2,
        payload: defensesOutput,
      })).unwrap();
    },
    onError: (error) => {
      sileo.error({ title: typeof error === 'string' ? error : 'تعذر إتمام العملية' });
    },
  });



  useEffect(() => {
    if (!caseId) return;
    api.get(`/WorkflowSnapshots/case/${caseId}`)
      .then((res) => {
        const data = res?.data?.data;
        if (Array.isArray(data)) {
          const defenseSnapshots = data.filter((s: { workflowType: string }) => s.workflowType === 'defense-memo');
          setSnapshotCount(defenseSnapshots.length);
        }
      })
      .catch(() => {});
  }, [caseId]);

  const facts = state?.facts ? state.facts : (typeof state === 'string' && state !== '' ? state : (singleCase?.facts || ''));
  const factAnalysisJob = aiJobs.jobs?.FactAnalysis;
  const isFactJobActive = factAnalysisJob?.status === 'Queued' || factAnalysisJob?.status === 'Processing';

  const normalizedFacts = useMemo(() => facts ? [facts] : [], [facts]);

  useEffect(() => {
    if (normalizedFacts.length > 0 && !finalFacts) {
      setFinalFacts(normalizedFacts.join('\n\n'));
    }
  }, [normalizedFacts, finalFacts]);

  const handleStartFactAnalysis = useCallback(() => {
    const factsText = selectedFacts.join('\n\n');

    if (isFactJobActive) {
      setFinalFacts(factsText || finalFacts || caseFacts.join('\n\n') || facts);
      setActive(1);
      return;
    }

    if (factAnalysisJob?.status === 'Completed' && !freshRunRef.current) {
      setFinalFacts(factsText);
      setActive(1);
      return;
    }

    freshRunRef.current = false;

    setFinalFacts(factsText);

    if (caseId) {
      dispatch(thunkSubmitAiJob({
        caseId,
        stepType: 'FactAnalysis',
        inputJson: JSON.stringify({ caseId, caseFacts: factsText, runId: orchestratorState.runId })
      })).unwrap().then(() => {
        setActive(1);
      }).catch((error: unknown) => {
        sileo.error({ title: `حدث خطأ: ${typeof error === 'string' ? error : 'مشكلة بالاتصال'}` });
      });
    }
  }, [caseFacts, caseId, dispatch, factAnalysisJob?.status, finalFacts, facts, isFactJobActive, orchestratorState.runId, selectedFacts, setActive]);

  useEffect(() => {
    const runningTarget = getRunningDefenseTargetStep(aiJobs.jobs as DefenseJobMap);
    if (!runningTarget || active >= runningTarget) return;

    if (runningTarget === 1 && !finalFacts) {
      const factsText = selectedFacts.length
        ? selectedFacts.join('\n\n')
        : caseFacts.length
          ? caseFacts.join('\n\n')
          : facts;
      setFinalFacts(factsText);
    }

    setActive(runningTarget);
  }, [active, aiJobs.jobs, caseFacts, facts, finalFacts, selectedFacts, setActive]);

  useEffect(() => {
    const { FactAnalysis, GenerateDefenses, FinalRequirements, DefenseMemoDraft } = aiJobs.jobs;

    if (isRunningDefenseJob(FactAnalysis) && orchestratorState.outputs[1])
      dispatch(hydrateStep({ stepNumber: 1, result: null }));
    if (isRunningDefenseJob(GenerateDefenses) && orchestratorState.outputs[2])
      dispatch(hydrateStep({ stepNumber: 2, result: null }));
    if (isRunningDefenseJob(FinalRequirements) && orchestratorState.outputs[4])
      dispatch(hydrateStep({ stepNumber: 4, result: null }));
    if (isRunningDefenseJob(DefenseMemoDraft) && orchestratorState.outputs[5])
      dispatch(hydrateStep({ stepNumber: 5, result: null }));
  }, [aiJobs.jobs, orchestratorState.outputs, dispatch]);

  const saveDefensesStep = useCallback(async () => {
    const saveCaseId = orchestratorState.caseId ?? caseId;
    const defensesOutput = orchestratorState.outputs[2];
    if (!saveCaseId || !defensesOutput) return;
    try {
      await dispatch(smartAnalysisThunks.saveDraftStep({
        routeId: saveCaseId,
        stepNumber: 2,
        payload: defensesOutput,
      })).unwrap();
    } catch { /* ignore */ }
  }, [dispatch, orchestratorState.caseId, orchestratorState.outputs, caseId]);

  const goToDefenses = useCallback(() => {
    dispatch(setCurrentAccessibleStep(Math.max(orchestratorState.currentAccessibleStep ?? 0, 2)));
    dispatch(setLastCompletedStep(Math.max(orchestratorState.lastCompletedStep ?? 0, 2)));
    setActive(2);
  }, [dispatch, orchestratorState.currentAccessibleStep, orchestratorState.lastCompletedStep, setActive]);

  const renderedStep = [
    <AnalysisFactsSelectionStep
      key="facts"
      caseId={caseId}
      facts={caseFacts}
      setFacts={setCaseFacts}
      selectedFacts={selectedFacts}
      setSelectedFacts={setSelectedFacts}
      sidebarDescription="اختر الوقائع المستخرجة من المستندات ليتم استخدامها كمرجع ثابت أثناء التوليد."
      startLabel="بدء التحليل القانوني"
      continueLabel={factAnalysisJob?.status === 'Completed' ? 'الانتقال إلى التحليل القانوني' : 'بدء التحليل القانوني'}
      onStart={handleStartFactAnalysis}
      isStarting={isFactJobActive}
    />,
    <LegalAnalysis key="analysis" finalFacts={finalFacts} caseFacts={facts} goToDefenses={goToDefenses} caseId={caseId} />,
    <DefensesList
      key="defenses"
      caseId={caseId}
      finalFacts={finalFacts}
      nextStep={nextStep}
      onDefensesMutated={saveDefensesStep}
    />,
    <FinalRequirements key="final-req" caseId={caseId} finalFacts={finalFacts} nextStep={nextStep} />,
    <FinalNote key="final-note" caseId={caseId} isActiveTab={active === 4} />,
  ];

  return (
    <section className="py-8 min-h-screen" dir="rtl">
      <Container>
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <div className="w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl">
              <SmartAnalysisLoader
                title="جاري تجهيز مساحة العمل"
                subtitle="يرجى الانتظار بينما نقوم باسترجاع بيانات القضية..."
                steps={DEFENSE_MEMO_STEP_DEFS.map(s => s.label)}
                activeStepIndex={0}
              />
            </div>
          ) : (
            <>
              {snapshotCount > 0 && (
                <button
                  onClick={() => navigate(`/cases/${caseId}`, { state: { activeTab: 'history' } })}
                  className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-[var(--main-color)] hover:text-[var(--main-color)] bg-[var(--accent-soft)] hover:bg-orange-100 px-3 py-1 rounded-full border border-[var(--accent-soft-strong)] transition-colors cursor-pointer mt-1"
                >
                  <LuHistory className="text-sm" />
                  {snapshotCount} نسخة سابقة
                </button>
              )}

              {singleCase && (
                <CaseHeaderBanner
                  caseId={singleCase.id.toString()}
                  title={singleCase.title}
                  status={singleCase.status}
                  facts={singleCase.facts}
                  hideDocsButton={true}
                  versionLabel={isReadOnly ? (orchestratorState.snapshotLabel ?? 'نسخة سابقة — مذكرة دفاع') : null}
                />
              )}

              <WorkflowStepBar
                steps={DEFENSE_MEMO_STEP_DEFS}
                active={active}
                workflowTitle="مذكرة الدفاع"
                isAutoSaving={isAutoSaving}
                autoSaveError={autoSaveError}
                lastSavedAt={lastSavedAt}
                onManualSave={handleManualSave}
                isSavingStep={isSavingStep}
                currentAccessibleStep={orchestratorState.currentAccessibleStep}
                lastCompletedStep={orchestratorState.lastCompletedStep}
              />

              <div className="w-full">
                <Tabs
                  aria-label="مراحل التحليل الذكي"
                  selectedKey={active.toString()}
                  onSelectionChange={(key) => {
                    const step = Number(key);
                    if (isClickableTab(step)) setActive(step);
                  }}
                  classNames={WORKFLOW_TAB_CLASSNAMES}
                  {...WORKFLOW_TAB_PROPS}
                >
                  {DEFENSE_MEMO_STEP_DEFS.map((step, index) => (
                    <Tab key={index.toString()} title={
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{step.icon}</span>
                        <span className="hidden md:inline text-nowrap">{step.label}</span>
                      </div>
                    } isDisabled={active !== index && !isClickableTab(index)}>
                      {renderedStep[index]}
                    </Tab>
                  ))}
                </Tabs>
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
};

export default DefenseMemoPage;
