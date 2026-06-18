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
  startParallelDefenseTracking,
  setParallelDefenseCounts,
  clearParallelDefenseTracking,
} from '../../../../../redux/analysis/smartAnalysisSlice';
import type { ParallelDefenseTracking } from '../../../../../redux/analysis/smartAnalysisSlice';
import thunkSubmitAiJob from '../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import thunkSubmitParallelDefenseAnalyses from '../../../../../redux/aiJobs/thunk/thunkSubmitParallelDefenseAnalyses';
import type { DefenseSubmission } from '../../../../../redux/aiJobs/thunk/thunkSubmitParallelDefenseAnalyses';
import { clearDefenseAnalysisJobs } from '../../../../../redux/aiJobs/aiJobsSlice';
import { parseJobResult, parseWorkflowJobResult } from '@mohamy/shared-utils';
import type { TDefenses, TFactAnalysis } from '../../../../../redux/shared/workflowTypes';

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
import { AutoRunProgressOverlay } from '../../../../../components/analysisWorkflow/AutoRunProgressOverlay';
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

const AUTO_RUN_STEP_MAP: Record<number, string> = {
  1: 'FactAnalysis',
  2: 'GenerateDefenses',
  3: 'FinalRequirements',
  4: 'DefenseMemoDraft',
};

type DefenseJobKey = keyof typeof DEFENSE_JOB_STEP_MAP;
type DefenseJobMap = Partial<Record<DefenseJobKey, { status?: string } | undefined>>;
type DefenseMemoJob = { status?: string; resultJson?: string | null };
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

const isSettledDefenseJob = (job: { status?: string } | undefined | null) =>
  job?.status === 'Completed' || job?.status === 'Queued' || job?.status === 'Processing';

const getCompletedDefenseAnalysis = (resultJson: string | null | undefined) => {
  const parsed = parseWorkflowJobResult<DefenseAnalysisJobResult>(resultJson) ?? parseJobResult<DefenseAnalysisJobResult>(resultJson);
  if (!parsed) return null;

  const defenseId = parsed.clientDefenseId ?? parsed.defenseId ?? parsed.data?.clientDefenseId ?? parsed.data?.defenseId;
  const memorandum = parsed.memorandum ?? parsed.explanation ?? parsed.data?.memorandum ?? parsed.data?.explanation;
  if (!defenseId || !memorandum) return null;

  return { defenseId, memorandum };
};

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
  const autoSubmittedJobsRef = useRef<Set<string>>(new Set());
  const hydratedParallelJobIdsRef = useRef<Set<string>>(new Set());

  const aiJobs = useAppSelector((s) => s.aiJobs);
  const { singleCase } = useAppSelector((s) => s.cases);
  const parallelTracking = useAppSelector(
    (s) => (s.smartAnalysis as unknown as { parallelDefenseTracking: ParallelDefenseTracking | null }).parallelDefenseTracking,
  );

  const onAutoRunStepCompleted = useCallback((stepNumber: number): boolean => {
    // Pause auto-advance at step 2 (GenerateDefenses) to trigger parallel defense analysis
    if (stepNumber === 2) return false;
    return true;
  }, []);

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
    isAutoRunning,
    startAutoRun,
    stopAutoRun,
    handleAdvanceStage,
    autoRunCompletedSteps,
    autoRunJustCompleted,
    autoRunFailedStep,
    dismissAutoRunOverlay,
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
    autoRunStepMap: AUTO_RUN_STEP_MAP,
    onAutoRunStepCompleted,
    onAutoRunComplete: () => {
      sileo.success({ title: 'تم الانتهاء من جميع المراحل تلقائياً' });
    },
    onAutoRunError: (_step, error) => {
      sileo.error({ title: error || 'فشل التشغيل التلقائي' });
    },
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

  // ── Trigger parallel defense analysis when step 2 (GenerateDefenses) completes during auto-run ──
  const parallelTriggerRef = useRef(false);
  useEffect(() => {
    if (!isAutoRunning) {
      parallelTriggerRef.current = false;
      hydratedParallelJobIdsRef.current.clear();
      return;
    }
    // Only trigger when step 2 output is present and active step is 2
    const defensesOutput = orchestratorState.outputs[2] as TDefenses;
    if (!defensesOutput || active !== 2) return;
    if (parallelTriggerRef.current) return;
    parallelTriggerRef.current = true;

    // Extract all defenses from step 2 output
    const allDefenses: DefenseSubmission[] = [];
    const addDefenses = (items: Array<{ id: string; defenseTitle: string; basisFromCase: string; scope: string; isLocal?: boolean }> | undefined | null) => {
      (items ?? []).forEach((d) => {
        allDefenses.push({
          defenseId: d.id,
          clientDefenseId: d.id,
          defenseTitle: d.defenseTitle,
          basisFromCase: d.basisFromCase,
          scope: d.scope,
        });
      });
    };
    addDefenses(defensesOutput.defensesFormal);
    addDefenses(defensesOutput.defensesSubstantive);
    addDefenses(defensesOutput.defensesEvidentiary);

    if (allDefenses.length === 0) {
      stopAutoRun();
      sileo.error({ title: 'لا توجد دفوع لتحليلها تلقائياً' });
      return;
    }

    // Clear previous defense analysis jobs and start parallel tracking
    dispatch(clearDefenseAnalysisJobs());
    dispatch(thunkSubmitParallelDefenseAnalyses({ caseId, defenses: allDefenses }))
      .unwrap()
      .then((result) => {
        if (result.failed.length > 0) {
          sileo.error({ title: `تعذر بدء تحليل ${result.failed.length} دفع` });
        }
        if (result.submitted.length === 0) {
          stopAutoRun();
          return;
        }
        const defenseJobMap: Record<string, string> = {};
        for (const s of result.submitted) {
          defenseJobMap[s.defenseId] = s.jobId;
        }
        dispatch(startParallelDefenseTracking({
          totalDefenses: result.submitted.length,
          defenseJobMap,
        }));
      })
      .catch(() => {
        stopAutoRun();
        sileo.error({ title: 'فشل بدء التحليل المتوازي للدفوع' });
      });
  }, [isAutoRunning, active, orchestratorState.outputs, caseId, dispatch, stopAutoRun]);

  useEffect(() => {
    if (!parallelTracking?.defenseJobMap) return;

    let completedCount = 0;
    let failedCount = 0;

    for (const jobId of Object.values(parallelTracking.defenseJobMap)) {
      const job = aiJobs.defenseAnalysisJobs[jobId];
      if (!job) continue;

      if (job.status === 'Completed') {
        completedCount++;
        // Hydrate step 3 if not already done
        if (!hydratedParallelJobIdsRef.current.has(jobId)) {
          const completedAnalysis = getCompletedDefenseAnalysis(job.resultJson);
          if (completedAnalysis) {
            hydratedParallelJobIdsRef.current.add(jobId);
            const cache = (orchestratorState.outputs[3] || {}) as Record<string, unknown>;
            if (!cache[completedAnalysis.defenseId]) {
              dispatch(hydrateStep({
                stepNumber: 3,
                result: {
                  defenseId: completedAnalysis.defenseId,
                  explanation: completedAnalysis.memorandum,
                },
              }));
            }
          }
        }
      } else if (job.status === 'Failed') {
        failedCount++;
        if (!hydratedParallelJobIdsRef.current.has(jobId)) {
          hydratedParallelJobIdsRef.current.add(jobId);
        }
      }
    }

    dispatch(setParallelDefenseCounts({ completedCount, failedCount }));
  }, [aiJobs.defenseAnalysisJobs, dispatch, orchestratorState.outputs, parallelTracking]);

  // ── Watch parallel tracking: when all defenses are done, advance from step 2 → 3 → 4 ──
  useEffect(() => {
    if (!parallelTracking) return;
    if (parallelTracking.isRunning) return;
    if (!isAutoRunning) return;

    if (parallelTracking.failedCount > 0) {
      stopAutoRun();
      dispatch(clearParallelDefenseTracking(undefined));
      sileo.error({ title: `فشل تحليل ${parallelTracking.failedCount} دفع. أعد المحاولة قبل إكمال المسار.` });
      return;
    }

    // All parallel defenses completed — advance to FinalRequirements.
    // Use setTimeout to avoid dispatch during render
    const timer = setTimeout(async () => {
      dispatch(clearParallelDefenseTracking(undefined));
      // Advance from step 2 to step 3 (which maps to FinalRequirements in the UI)
      await handleAdvanceStage(2, 3);
    }, 500);
    return () => clearTimeout(timer);
  }, [parallelTracking, isAutoRunning, handleAdvanceStage, dispatch, stopAutoRun]);

  // ── Auto-submit step 5 (DefenseMemoDraft) during auto-run ──
  useEffect(() => {
    if (!isAutoRunning) return;
    if (active !== 4) return; // active === 4 maps to step 5 (DefenseMemoDraft) in stepNumberMapFn

    const memoOutput = orchestratorState.outputs[5];
    if (memoOutput) return; // Already have output, don't submit again

    const memoJob = aiJobs.jobs?.DefenseMemoDraft;
    if (memoJob?.status === 'Queued' || memoJob?.status === 'Processing' || memoJob?.status === 'Completed') return;

    // Gather all analyzed defenses (those with explanations in step 3 cache)
    const defensesOutput = orchestratorState.outputs[2] as TDefenses;
    const explanationsCache = (orchestratorState.outputs[3] || {}) as Record<string, unknown>;
    const finalRequirements = orchestratorState.outputs[4] as { finalPrayers?: Array<{ id: string; requestLevel: string; requestText: string }> } | null;
    if (!defensesOutput || !finalRequirements) return;

    const allDefIds: string[] = [];
    [...(defensesOutput.defensesFormal || []), ...(defensesOutput.defensesSubstantive || []), ...(defensesOutput.defensesEvidentiary || [])].forEach((d) => {
      if (explanationsCache[d.id]) allDefIds.push(d.id);
    });

    if (allDefIds.length === 0) return;

    // Auto-submit the memo draft job with all analyzed defenses approved
    const allRequestIds = (finalRequirements.finalPrayers || []).map((r) => r.id);

    // Build the same inputJson as FinalNote.buildAiInputJson
    const factAnalysis = orchestratorState.outputs[1] as { caseNumber?: string; caseType?: string; courtName?: string; legalFactsSummary?: string[]; defendantsPositions?: Array<{ defendantName: string; relationshipToClient: string; positionSummary: string }> } | null;
    const allDefenseItems = [
      ...(defensesOutput.defensesFormal || []).map((d) => ({ ...d, type: 'Formal' })),
      ...(defensesOutput.defensesSubstantive || []).map((d) => ({ ...d, type: 'Substantive' })),
      ...(defensesOutput.defensesEvidentiary || []).map((d) => ({ ...d, type: 'Evidentiary' })),
    ];
    const approvedDefenses = allDefenseItems
      .filter((d) => allDefIds.includes(d.id))
      .map((d) => {
        const exp = explanationsCache[d.id] as Record<string, unknown> | undefined;
        if (!exp) return null;
        return {
          defenseTitle: d.defenseTitle,
          basisFromCase: d.basisFromCase,
          type: d.type,
          explanation: {
            introduction: (exp.introduction as string) || '',
            factualBasis: (exp.factualBasis as string) || '',
            legalTexts: ((exp.legalTextsFull as Array<{ lawName: string; articleNumber: string; fullText: string }>) || []).map((t) => ({
              lawName: t.lawName,
              articleNumber: t.articleNumber,
              fullText: t.fullText,
            })),
            linkingTextsToFacts: (exp.linkingTextsToFacts as string) || '',
            cassationPrecedents: ((exp.cassationPrecedentsFull as Array<{ appealNumber: string; judicialYear: string; sessionDate: string; fullText: string }>) || []).map((p) => ({
              appealNumber: p.appealNumber,
              judicialYear: p.judicialYear,
              sessionDate: p.sessionDate,
              fullText: p.fullText,
            })),
            legalApplication: (exp.legalApplication as string) || '',
            counterArguments: (exp.counterArgumentsAndResponse as string) || '',
            legalEffectOfAcceptance: (exp.legalEffectOfAcceptance as string) || '',
          },
        };
      })
      .filter(Boolean);

    const requestPool = (finalRequirements.finalPrayers || []).filter((r) => allRequestIds.includes(r.id));

    const inputJson = JSON.stringify({
      caseId,
      caseNumber: factAnalysis?.caseNumber || singleCase?.number || '',
      caseType: factAnalysis?.caseType || '',
      courtName: factAnalysis?.courtName || singleCase?.court || '',
      clientName: singleCase?.clientName || '',
      apponentName: singleCase?.apponentName || '',
      defendingParty: (singleCase as unknown as { defendingParty?: string })?.defendingParty || 'client',
      legalFactsSummary: factAnalysis?.legalFactsSummary || [],
      defendantsPositions: (factAnalysis?.defendantsPositions || []).map((p) => ({
        defendantName: p.defendantName,
        relationshipToClient: p.relationshipToClient,
        positionSummary: p.positionSummary,
      })),
      approvedDefenses,
      finalRequests: requestPool.map((r) => ({
        requestLevel: r.requestLevel,
        requestText: r.requestText,
      })),
    });

    dispatch(thunkSubmitAiJob({ caseId, stepType: 'DefenseMemoDraft', inputJson }));
  }, [isAutoRunning, active, orchestratorState.outputs, aiJobs.jobs, caseId, dispatch, singleCase]);



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
  const buildFactsText = useCallback(() => (
    selectedFacts.join('\n\n') || finalFacts || caseFacts.join('\n\n') || facts || ''
  ), [caseFacts, facts, finalFacts, selectedFacts]);

  const defensesOutput = orchestratorState.outputs[2] as TDefenses;
  const allDefenseItems = useMemo(() => ([
    ...(defensesOutput?.defensesFormal || []),
    ...(defensesOutput?.defensesSubstantive || []),
    ...(defensesOutput?.defensesEvidentiary || []),
  ]), [defensesOutput]);
  const explanationsCache = useMemo(
    () => (orchestratorState.outputs[3] || {}) as Record<string, unknown>,
    [orchestratorState.outputs],
  );
  const analyzedDefenseCount = allDefenseItems.filter((defense) => explanationsCache[defense.id]).length;

  useEffect(() => {
    if (normalizedFacts.length > 0 && !finalFacts) {
      setFinalFacts(normalizedFacts.join('\n\n'));
    }
  }, [normalizedFacts, finalFacts]);

  useEffect(() => {
    if (!isAutoRunning) {
      autoSubmittedJobsRef.current.clear();
    }
  }, [isAutoRunning]);

  useEffect(() => {
    if (!isAutoRunning || active !== 1 || !caseId) return;
    if (orchestratorState.outputs[1]) return;
    if (isSettledDefenseJob(aiJobs.jobs.FactAnalysis as DefenseMemoJob | undefined)) return;
    if (autoSubmittedJobsRef.current.has('FactAnalysis')) return;

    const factsText = buildFactsText();
    if (!factsText.trim()) {
      stopAutoRun();
      sileo.error({ title: 'وقائع القضية مطلوبة لتشغيل المسار كاملاً' });
      return;
    }

    autoSubmittedJobsRef.current.add('FactAnalysis');
    setFinalFacts(factsText);
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'FactAnalysis',
      inputJson: JSON.stringify({ caseId, caseFacts: factsText }),
    })).unwrap()
      .catch(() => {
        autoSubmittedJobsRef.current.delete('FactAnalysis');
      });
  }, [active, aiJobs.jobs.FactAnalysis, buildFactsText, caseId, dispatch, isAutoRunning, orchestratorState.outputs, stopAutoRun]);

  useEffect(() => {
    if (!isAutoRunning || !caseId) return;
    if (active !== 1 && active !== 2) return;
    const factAnalysis = orchestratorState.outputs[1] as TFactAnalysis;
    if (!factAnalysis || orchestratorState.outputs[2]) return;
    if (isSettledDefenseJob(aiJobs.jobs.GenerateDefenses as DefenseMemoJob | undefined)) return;
    if (autoSubmittedJobsRef.current.has('GenerateDefenses')) return;

    const factsText = buildFactsText();
    if (!factsText.trim()) {
      stopAutoRun();
      sileo.error({ title: 'وقائع القضية مطلوبة لتوليد الدفوع' });
      return;
    }

    autoSubmittedJobsRef.current.add('GenerateDefenses');
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'GenerateDefenses',
      inputJson: JSON.stringify({ caseId, caseFacts: factsText, legalAnalysis: factAnalysis }),
    })).unwrap()
      .then(() => { void handleAdvanceStage(1, 2); })
      .catch(() => {
        autoSubmittedJobsRef.current.delete('GenerateDefenses');
      });
  }, [active, aiJobs.jobs.GenerateDefenses, buildFactsText, caseId, dispatch, handleAdvanceStage, isAutoRunning, orchestratorState.outputs, stopAutoRun]);

  useEffect(() => {
    if (!isAutoRunning || active !== 3 || !caseId) return;
    if (!defensesOutput || orchestratorState.outputs[4]) return;
    if (parallelTracking?.isRunning) return;
    if (allDefenseItems.length === 0) {
      stopAutoRun();
      sileo.error({ title: 'لا توجد دفوع لاستخراج الطلبات منها' });
      return;
    }
    if (analyzedDefenseCount < allDefenseItems.length) return;
    if (isSettledDefenseJob(aiJobs.jobs.FinalRequirements as DefenseMemoJob | undefined)) return;
    if (autoSubmittedJobsRef.current.has('FinalRequirements')) return;

    autoSubmittedJobsRef.current.add('FinalRequirements');
    dispatch(thunkSubmitAiJob({
      caseId,
      stepType: 'FinalRequirements',
      inputJson: JSON.stringify({
        caseId,
        defensesFormal: defensesOutput.defensesFormal,
        defensesSubstantive: defensesOutput.defensesSubstantive,
        defensesEvidentiary: defensesOutput.defensesEvidentiary,
      }),
    })).unwrap()
      .catch(() => {
        autoSubmittedJobsRef.current.delete('FinalRequirements');
      });
  }, [active, aiJobs.jobs.FinalRequirements, allDefenseItems.length, analyzedDefenseCount, caseId, defensesOutput, dispatch, isAutoRunning, orchestratorState.outputs, parallelTracking?.isRunning, stopAutoRun]);

  useEffect(() => {
    if (!isAutoRunning || active !== 3) return;
    if (!orchestratorState.outputs[4] || orchestratorState.outputs[5]) return;
    if (isRunningDefenseJob(aiJobs.jobs.FinalRequirements)) return;
    void handleAdvanceStage(3, 4);
  }, [active, aiJobs.jobs.FinalRequirements, handleAdvanceStage, isAutoRunning, orchestratorState.outputs]);

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
      onRunAll={() => startAutoRun(0)}
      isAutoRunning={isAutoRunning}
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
    <FinalNote key="final-note" caseId={caseId} isActiveTab={active === 4 && !isAutoRunning} />,
  ];

  const maxSteps = 4;
  const showAutoRunOverlay = isAutoRunning || autoRunJustCompleted || autoRunFailedStep !== null;

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
                isAutoRunning={isAutoRunning}
                onStopAutoRun={stopAutoRun}
              />

              <div className="w-full">
                {showAutoRunOverlay && (
                  <AutoRunProgressOverlay
                    steps={DEFENSE_MEMO_STEP_DEFS}
                    activeStep={active}
                    maxSteps={maxSteps}
                    completedSteps={autoRunCompletedSteps}
                    failedStep={autoRunFailedStep}
                    onStop={() => { stopAutoRun(); dismissAutoRunOverlay(); }}
                    isComplete={autoRunJustCompleted}
                    onViewResults={() => { dismissAutoRunOverlay(); setActive(maxSteps); }}
                    stepSubLabels={parallelTracking ? {
                      2: `تحليل الدفوع (${parallelTracking.completed + parallelTracking.failed}/${parallelTracking.total})`,
                    } : undefined}
                  />
                )}
                <div style={{ display: showAutoRunOverlay ? 'none' : undefined }}>
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
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
};

export default DefenseMemoPage;
