import { Container } from '@mohamy/shared-ui';
import './DefenseMemoPage.css';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { sileo } from 'sileo';
import { useAppDispatch, useAppSelector } from '../../../../../hooks/reduxHooks';
import { abandonSmartAnalysisWorkflow, hydrateStep, resetAnalysis, restoreWorkflowSnapshot, smartAnalysisThunks } from '../../../../../redux/analysis/smartAnalysisSlice';
import { resetAiJobs } from '../../../../../redux/aiJobs/aiJobsSlice';
import thunkSubmitAiJob from '../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import thunkGetSingleCase from '../../../../../redux/cases/thunk/thunkGetSingleCase';
import { parseJobResult, parseWorkflowJobResult } from '@mohamy/shared-utils';

import AnalysisFactsSelectionStep from '../../../../../components/analysisWorkflow/AnalysisFactsSelectionStep';
import LegalAnalysis from './steps/LegalAnalysis';
import DefensesList from './steps/DefensesList';
import FinalRequirements from './steps/FinalRequirements';
import FinalNote from './steps/FinalNote';
import CaseHeaderBanner from '../../../../../components/header/CaseHeaderBanner';
import SmartAnalysisLoader from '../../../../../components/skeleton/SmartAnalysisLoader';
import { Tabs, Tab } from '@heroui/react';
import { IoCheckmarkCircle, IoDocumentTextOutline, IoFlash, IoList, IoBriefcaseOutline } from 'react-icons/io5';
import { LuHistory } from 'react-icons/lu';
import { useAiJobSignalR } from '../../../../../hooks/useAiJobSignalR';
import { useWorkflowAutoSave } from '../../../../../hooks/useWorkflowAutoSave';
import WorkflowStepBar from '../../../../../components/analysisWorkflow/WorkflowStepBar';
import api from '../../../../../APIs/api';
import { useWorkflowSnapshotLoader } from '../../../../../hooks/useWorkflowSnapshotLoader';
import { useWorkflowFacts } from '../../../../../hooks/useWorkflowFacts';
import { WORKFLOW_TAB_CLASSNAMES, WORKFLOW_TAB_PROPS } from '../../../../../components/analysisWorkflow/workflowConstants';

const DEFENSE_STEPS = [
  { id: 1, label: 'مراجعة الوقائع', icon: <IoDocumentTextOutline /> },
  { id: 2, label: 'التحليل القانوني', icon: <IoFlash /> },
  { id: 3, label: 'الدفوع', icon: <IoList /> },
  { id: 4, label: 'الطلبات', icon: <IoBriefcaseOutline /> },
  { id: 5, label: 'المذكرة النهائية', icon: <IoCheckmarkCircle /> },
];

const DefenseMemoPage = () => {
  const [active, setActive] = useState(0);
  const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
  const [hasAutoResumed, setHasAutoResumed] = useState(false);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const navigate = useNavigate();
  const freshRunRef = useRef(false);
  const [isFreshMode, setIsFreshMode] = useState(false);
  const snapshotModeRef = useRef(false);

  const { state, pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const parts = pathname.split('/');
  const caseId = parts[2];
  const isFreshRun = searchParams.get('fresh') === '1';
  const snapshotId = searchParams.get('snapshot');
  const workflowIdParam = Number(searchParams.get('workflowId') || '');
  const selectedWorkflowId = Number.isFinite(workflowIdParam) && workflowIdParam > 0 ? workflowIdParam : null;

  const [finalFacts, setFinalFacts] = useState<string>('');
  const dispatch = useAppDispatch();
  const smartAnalysisState = useAppSelector(state => state.smartAnalysis);
  const aiJobs = useAppSelector(state => state.aiJobs);

  const { caseFacts, setCaseFacts, selectedFacts, setSelectedFacts } = useWorkflowFacts({
    workflowPrefix: 'defense-memo',
    caseId,
  });

  useWorkflowSnapshotLoader({
    snapshotId,
    restoreSnapshot: restoreWorkflowSnapshot,
    resetWorkflow: resetAnalysis,
    fallbackStep: 5,
    stepMapFn: (s) => s <= 2 ? s : Math.min(s - 1, 4),
    onLoaded: (mappedStep) => {
      snapshotModeRef.current = true;
      setActive(mappedStep);
      setHasAutoResumed(true);
    },
  });

  useAiJobSignalR(caseId, isFreshMode, smartAnalysisState.createdAt);

  const maxStepAllowed = useMemo(() => {
    const jobs = aiJobs.jobs;
    const isActive = (job: typeof jobs.FactAnalysis) => job?.status === 'Completed' || job?.status === 'Processing' || job?.status === 'Queued';

    if (smartAnalysisState.outputs[5]) return 4;
    if (smartAnalysisState.outputs[4]) return 4;
    if (smartAnalysisState.outputs[2]) return 3;
    if (smartAnalysisState.outputs[1]) return 2;

    if (isActive(jobs.DefenseMemoDraft)) return 4;
    if (isActive(jobs.FinalRequirements)) return 3;
    if (isActive(jobs.GenerateDefenses)) return 2;
    if (isActive(jobs.FactAnalysis)) return 1;

    return 0;
  }, [aiJobs.jobs, smartAnalysisState.outputs]);

  const autoResumeTarget = useMemo(() => {
    const jobs = aiJobs.jobs;
    const isRunning = (job: typeof jobs.FactAnalysis) => job?.status === 'Queued' || job?.status === 'Processing';

    if (isRunning(jobs.DefenseMemoDraft)) return 4;
    if (isRunning(jobs.FinalRequirements)) return 3;
    if (isRunning(jobs.GenerateDefenses)) return 2;
    if (isRunning(jobs.FactAnalysis)) return 1;

    if (smartAnalysisState.outputs[5]) return 4;
    if (smartAnalysisState.outputs[4]) return 3;
    if (smartAnalysisState.outputs[2]) return 2;
    if (smartAnalysisState.outputs[1]) return 1;

    return 0;
  }, [aiJobs.jobs, smartAnalysisState.outputs]);

  const currentDraftStepNumber = active === 1
    ? 1
    : active === 2
    ? 2
    : active === 3
    ? 4
    : active === 4
    ? 5
    : null;

  const { debouncedSave, flush: flushAutoSave, cancel: cancelAutoSave } = useWorkflowAutoSave({
    mode: 'immediate',
    onSave: async (payload) => {
      const autoSaveCaseId = smartAnalysisState.caseId ?? caseId;
      if (!autoSaveCaseId || !currentDraftStepNumber) return;
      await dispatch(smartAnalysisThunks.saveDraftStep({
        routeId: autoSaveCaseId,
        stepNumber: currentDraftStepNumber,
        payload,
      })).unwrap();
    },
  });

  const currentStepOutput = currentDraftStepNumber
    ? smartAnalysisState.outputs[currentDraftStepNumber as keyof typeof smartAnalysisState.outputs]
    : null;

  const handleManualSave = useCallback(async () => {
    cancelAutoSave();
    await flushAutoSave(currentStepOutput);
  }, [cancelAutoSave, flushAutoSave, currentStepOutput]);

  const saveDefensesStep = useCallback(async () => {
    const saveCaseId = smartAnalysisState.caseId ?? caseId;
    const defensesOutput = smartAnalysisState.outputs[2];
    if (!saveCaseId || !defensesOutput) return;
    try {
      await dispatch(smartAnalysisThunks.saveDraftStep({
        routeId: saveCaseId,
        stepNumber: 2,
        payload: defensesOutput,
      })).unwrap();
    } catch {}
  }, [dispatch, smartAnalysisState.caseId, smartAnalysisState.outputs, caseId]);

  useEffect(() => {
    if (smartAnalysisState.isReadOnly) return;
    if (active > 0 && currentStepOutput && (smartAnalysisState.caseId ?? caseId)) {
      debouncedSave(currentStepOutput);
    }
  }, [currentStepOutput, debouncedSave, smartAnalysisState.caseId, caseId, smartAnalysisState.isReadOnly, active]);

  const { singleCase } = useAppSelector((rootState) => rootState.cases);

  useEffect(() => {
    if (caseId && (!singleCase || singleCase.id.toString() !== caseId)) {
      dispatch(thunkGetSingleCase({ id: caseId }));
    }
  }, [dispatch, caseId, singleCase]);

  useEffect(() => {
    return () => {
      dispatch(resetAnalysis());
    };
  }, [dispatch]);

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

  useEffect(() => {
    if (!caseId) return;
    if (snapshotId) return;

    if (isFreshRun) {
      freshRunRef.current = true;
      setIsFreshMode(true);
      setActive(0);
      setHasAutoResumed(false);
      dispatch(resetAnalysis());
      dispatch(resetAiJobs());
      dispatch(abandonSmartAnalysisWorkflow(caseId))
        .unwrap()
        .then(() => {
          freshRunRef.current = false;
          setIsFreshMode(false);
          navigate(pathname, { replace: true, state: undefined });
        })
        .catch((error: unknown) => {
          sileo.error({ title: typeof error === 'string' ? error : 'تعذر بدء مذكرة دفاع جديدة' });
        });
      return;
    }

    if (selectedWorkflowId && smartAnalysisThunks.getWorkflowById) {
      dispatch(smartAnalysisThunks.getWorkflowById({ workflowId: selectedWorkflowId }));
      return;
    }

    dispatch(smartAnalysisThunks.getWorkflow({ caseId }));
  }, [dispatch, caseId, isFreshRun, snapshotId, selectedWorkflowId, navigate, pathname]);

  const facts = (state?.facts ? state.facts : (typeof state === 'string' && state !== '' ? state : (singleCase?.facts || '')));
  const factAnalysisJob = aiJobs.jobs?.FactAnalysis;
  const isFactJobActive = factAnalysisJob?.status === 'Queued' || factAnalysisJob?.status === 'Processing';

  const normalizedFacts = useMemo(() => facts ? [facts] : [], [facts]);

  useEffect(() => {
    if (normalizedFacts.length > 0 && !finalFacts) {
      setFinalFacts(normalizedFacts.join('\n\n'));
    }
  }, [normalizedFacts, finalFacts]);

  const handleStartFactAnalysis = useCallback(() => {
    if (factAnalysisJob?.status === 'Completed' && !freshRunRef.current) {
      const factsText = selectedFacts.join('\n\n');
      setFinalFacts(factsText);
      setHasAutoResumed(true);
      nextStep();
      return;
    }

    freshRunRef.current = false;
    setIsFreshMode(false);

    const factsText = selectedFacts.join('\n\n');
    setFinalFacts(factsText);
    setHasAutoResumed(true);

    if (caseId) {
      dispatch(thunkSubmitAiJob({
        caseId: caseId as string,
        stepType: 'FactAnalysis',
        inputJson: JSON.stringify({ caseId, caseFacts: factsText })
      })).unwrap().then(() => {
        nextStep();
      }).catch((error: unknown) => {
        sileo.error({ title: `حدث خطأ: ${typeof error === 'string' ? error : 'مشكلة بالاتصال'}` });
      });
    }
  }, [factAnalysisJob?.status, selectedFacts, caseId, dispatch]);

  useEffect(() => {
    if (snapshotModeRef.current) return;
    const { FactAnalysis, GenerateDefenses, FinalRequirements, DefenseMemoDraft } = aiJobs.jobs;
    const isActive = (s?: string) => s === 'Queued' || s === 'Processing';

    if (isActive(FactAnalysis?.status) && smartAnalysisState.outputs[1])
      dispatch(hydrateStep({ stepNumber: 1, result: null }));
    if (isActive(GenerateDefenses?.status) && smartAnalysisState.outputs[2])
      dispatch(hydrateStep({ stepNumber: 2, result: null }));
    if (isActive(FinalRequirements?.status) && smartAnalysisState.outputs[4])
      dispatch(hydrateStep({ stepNumber: 4, result: null }));
    if (isActive(DefenseMemoDraft?.status) && smartAnalysisState.outputs[5])
      dispatch(hydrateStep({ stepNumber: 5, result: null }));
  }, [aiJobs.jobs, smartAnalysisState.outputs, dispatch]);

  useEffect(() => {
    if (freshRunRef.current || snapshotModeRef.current) return;

    const hydrateFromJob = (stepNumber: 1 | 2 | 4 | 5, job: typeof aiJobs.jobs[keyof typeof aiJobs.jobs]) => {
      if (job?.status !== 'Completed' || !job.resultJson || smartAnalysisState.outputs[stepNumber]) return;

      const parsed = parseWorkflowJobResult(job.resultJson);
      if (parsed) dispatch(hydrateStep({ stepNumber, result: parsed }));
    };

    hydrateFromJob(1, aiJobs.jobs.FactAnalysis);
    hydrateFromJob(2, aiJobs.jobs.GenerateDefenses);
    hydrateFromJob(4, aiJobs.jobs.FinalRequirements);
    hydrateFromJob(5, aiJobs.jobs.DefenseMemoDraft);
  }, [aiJobs, smartAnalysisState.outputs, dispatch]);

  const analysisDefenseJob = aiJobs.jobs.AnalysisDefense;
  const defenseExplanationCache = smartAnalysisState.outputs[3];

  useEffect(() => {
    if (analysisDefenseJob?.status !== 'Completed' || !analysisDefenseJob.resultJson) return;

    const parsed = parseJobResult<{ defenseId?: string; clientDefenseId?: string; memorandum?: Record<string, unknown> }>(analysisDefenseJob.resultJson);
    const defenseId = parsed?.clientDefenseId || parsed?.defenseId;
    if (!defenseId || !parsed?.memorandum) return;

    const cache = defenseExplanationCache || {};
    const hydratedKey = `__job:${analysisDefenseJob.id}:${analysisDefenseJob.completedAt ?? analysisDefenseJob.createdAt}`;
    if ((cache as Record<string, unknown>)[hydratedKey]) return;

    dispatch(hydrateStep({
      stepNumber: 3,
      result: { defenseId, explanation: parsed.memorandum }
    }));
    dispatch(hydrateStep({
      stepNumber: 3,
      result: { defenseId: hydratedKey, explanation: parsed.memorandum }
    }));
  }, [analysisDefenseJob, defenseExplanationCache, dispatch]);

  useEffect(() => {
    if (hasAutoResumed || snapshotModeRef.current) return;
    if (freshRunRef.current) return;

    const targetStep = autoResumeTarget;
    if (targetStep === 0) return;

    setActive(targetStep);
    setHasAutoResumed(true);
  }, [autoResumeTarget, hasAutoResumed]);

  const isLoading = smartAnalysisState.loadingState.isFetchingWorkflow;

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
      continueLabel={(!isFreshMode && factAnalysisJob?.status === 'Completed') ? 'الانتقال إلى التحليل القانوني' : 'بدء التحليل القانوني'}
      onStart={handleStartFactAnalysis}
      isStarting={isFactJobActive}
    />,
    <LegalAnalysis key="analysis" finalFacts={finalFacts} caseFacts={facts} nextStep={nextStep} caseId={caseId} />,
    <DefensesList
      key="defenses"
      caseId={caseId}
      finalFacts={finalFacts}
      nextStep={nextStep}
      onDefensesMutated={saveDefensesStep}
    />,
    <FinalRequirements key="final-req" caseId={caseId} finalFacts={finalFacts} nextStep={nextStep} />,
    <FinalNote key="final-note" caseId={caseId} />,
  ];

  return (
    <section className="defense-memo py-8 min-h-screen" dir="rtl">
      <Container>
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <div className="w-full min-h-[300px] flex items-center justify-center bg-white dark:bg-[var(--white-color)] border app-border dark:app-border-strong shadow-sm rounded-xl">
              <SmartAnalysisLoader
                title="جاري تجهيز مساحة العمل"
                subtitle="يرجى الانتظار بينما نقوم باسترجاع بيانات القضية..."
                steps={DEFENSE_STEPS.map(s => s.label)}
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
                  versionLabel={smartAnalysisState.isReadOnly ? (smartAnalysisState.snapshotLabel ?? 'نسخة سابقة — مذكرة دفاع') : null}
                />
              )}

              <WorkflowStepBar
                steps={DEFENSE_STEPS}
                active={active}
                workflowTitle="مذكرة الدفاع"
                isAutoSaving={smartAnalysisState.loadingState.isAutoSaving}
                autoSaveError={smartAnalysisState.errorState.autoSaveError}
                lastSavedAt={smartAnalysisState.lastSavedAt}
                onManualSave={handleManualSave}
                isSavingStep={smartAnalysisState.loadingState.isSavingStep}
              />

              <div className="w-full">
                <Tabs
                  aria-label="مراحل التحليل الذكي"
                  selectedKey={active.toString()}
                  onSelectionChange={(key) => {
                    const step = Number(key);
                    if (step <= Math.max(active, maxStepAllowed)) {
                      setActive(step);
                    }
                  }}
                  classNames={WORKFLOW_TAB_CLASSNAMES}
                  {...WORKFLOW_TAB_PROPS}
                >
                  {DEFENSE_STEPS.map((step, index) => {
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
            </>
          )}
        </div>
      </Container>
    </section>
  );
};

export default DefenseMemoPage;
