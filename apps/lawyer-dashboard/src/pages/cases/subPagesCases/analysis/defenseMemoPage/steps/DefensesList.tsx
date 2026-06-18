import { CustomCard } from'@mohamy/shared-ui';
import { useEffect, useMemo, useRef, useState } from"react";
import { IoAddOutline, IoArrowBackOutline, IoFlash, IoPencilOutline, IoReload, IoSparklesOutline, IoTrashOutline } from"react-icons/io5";
import { LuCheck } from'react-icons/lu';
import { useDisclosure } from"@heroui/react";
import FormModal from'../../../../../../components/ui/form/FormModal';
import { HiOutlineDocumentDuplicate, HiOutlineArrowDownTray } from"react-icons/hi2";
import { sileo } from"sileo";
import { parseWorkflowJobResult } from"@mohamy/shared-utils";
import { useAppDispatch, useAppSelector } from"../../../../../../hooks/reduxHooks";
import NotFoundImage from"../../../../../../components/notFound/NotFoundImage";
import ConfirmDialog from'../../../../../../components/common/ConfirmDialog';
import { DEFENSE_MEMO_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';
import ParallelDefenseProgress from '../../../../../../components/analysisWorkflow/ParallelDefenseProgress';

import {
 addDefense,
 clearDefenseAnalysis,
 deleteDefense,
 hydrateStep,
 thunkCreateDefense,
 thunkDeleteDefense,
 thunkGetDefenseAnalysis,
 thunkUpdateDefenseTitle,
 updateDefenseTitle,
} from'../../../../../../redux/analysis/smartAnalysisSlice';
import thunkCancelAiJob from'../../../../../../redux/aiJobs/thunk/thunkCancelAiJob';
import thunkSubmitAiJob from'../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import thunkSubmitParallelDefenseAnalyses from'../../../../../../redux/aiJobs/thunk/thunkSubmitParallelDefenseAnalyses';
import { clearDefenseAnalysisJobs } from'../../../../../../redux/aiJobs/aiJobsSlice';
import {
  startParallelDefenseTracking,
  setParallelDefenseCounts,
} from'../../../../../../redux/analysis/smartAnalysisSlice';
import type { ParallelDefenseTracking } from'../../../../../../redux/analysis/smartAnalysisSlice';
import {
 UnifiedStepShell,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
 AnalysisStageActionButton,
 AnalysisStageDocumentCard,
 AnalysisStageBanner,
} from"../../../../../../components/analysisWorkflow/UnifiedStepShell";
import { AnalysisStageLayout } from"../../../../../../components/analysisWorkflow/AnalysisStageLayout";
import { AnalysisStepShell } from"../../../../../../components/analysisWorkflow/AnalysisStepShell";
import type { TDefense, TDefenseMemorandum } from"../../../../../../redux/shared/workflowTypes";

type TDefensesList = {
 caseId: string;
 finalFacts: string;
 nextStep: () => void;
 onDefensesMutated?: () => Promise<void>;
};

type TDefenseWithCategory = TDefense & {
 categoryLabel: string;
 categoryTone:'formal' |'substantive' |'evidentiary';
 matchScore: number;
};

type CompletedDefenseAnalysisPayload = {
 defenseId?: string;
 clientDefenseId?: string;
 memorandum?: TDefenseMemorandum;
 explanation?: TDefenseMemorandum;
 data?: {
 defenseId?: string;
 clientDefenseId?: string;
 memorandum?: TDefenseMemorandum;
 explanation?: TDefenseMemorandum;
 };
};

const makeLocalDefenseId = (
 item: Pick<TDefense, 'id' | 'defenseTitle'>,
 categoryTone: TDefenseWithCategory['categoryTone'],
 index: number,
) => {
 if (item.id?.trim()) return item.id;
 const normalizedTitle = item.defenseTitle
 .trim()
 .replace(/\s+/g, '-')
 .slice(0, 48);
 return `local-${categoryTone}-${index}-${normalizedTitle || 'untitled'}`;
};

const getCompletedDefenseAnalysis = (resultJson: string | null | undefined) => {
 const parsed = parseWorkflowJobResult<CompletedDefenseAnalysisPayload>(resultJson);
 if (!parsed) return null;

 const defenseId = parsed.clientDefenseId ?? parsed.defenseId ?? parsed.data?.clientDefenseId ?? parsed.data?.defenseId;
 const memorandum = parsed.memorandum ?? parsed.explanation ?? parsed.data?.memorandum ?? parsed.data?.explanation;
 if (!defenseId || !memorandum) return null;

 return { defenseId, memorandum };
};

const DefensesList = ({ caseId, finalFacts, nextStep, onDefensesMutated }: TDefensesList) => {
 const singleCase = useAppSelector((state) => state.cases.singleCase);
 const dispatch = useAppDispatch();
 const { loadingState, outputs } = useAppSelector((state) => state.smartAnalysis);
 const loading = loadingState?.isGetting ?'pending' :'idle';
 const factAnalysis = outputs[1];
 const defenses = outputs[2];
 const explanationsCache = useMemo(() => (outputs[3] || {}) as Record<string, TDefenseMemorandum>, [outputs]);

 const finalRequirementsObj = outputs[4];
 const finalRequirements = finalRequirementsObj?.finalPrayers || null;
 const aiJobs = useAppSelector((state) => state.aiJobs);
 const currentJob = aiJobs.jobs['AnalysisDefense'];
 const generateDefensesJob = aiJobs.jobs['GenerateDefenses'];
 const finalReqJob = aiJobs.jobs['FinalRequirements'];
 const [isLoading, setIsLoading] = useState(false);
 const [isSubmittingParallel, setIsSubmittingParallel] = useState(false);
 const [isCancellingAnalysis, setIsCancellingAnalysis] = useState(false);
 const [activeDefenseId, setActiveDefenseId] = useState<string>('');
 const [approvedDefenses, setApprovedDefenses] = useState<string[]>([]);
 const [isNavigating, setIsNavigating] = useState(false);
 const [editingTitle, setEditingTitle] = useState('');
 const [newDefenseTitle, setNewDefenseTitle] = useState('');
 const [newDefenseType, setNewDefenseType] = useState<'Substantive' | 'Formal' | 'Evidentiary'>('Substantive');
 const [isSavingTitle, setIsSavingTitle] = useState(false);
 const [isAddingDefense, setIsAddingDefense] = useState(false);
 const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
 const [isDeletingDefense, setIsDeletingDefense] = useState(false);
 const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
 const pendingDeleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 const fetchingIdsRef = useRef<Set<string>>(new Set());
 const analysisToastRef = useRef<string | undefined>(undefined);
 const lastAnnouncedAnalysisStateRef = useRef<string | null>(null);
 const handledCompletedAnalysisJobRef = useRef<string | null>(null);
 const hydratedParallelJobIds = useRef<Set<string>>(new Set());

 const defenseAnalysisJobs = useAppSelector((state) => state.aiJobs.defenseAnalysisJobs);
 const parallelTracking = useAppSelector(
   (state) => (state.smartAnalysis as unknown as { parallelDefenseTracking: ParallelDefenseTracking | null }).parallelDefenseTracking,
 );

 const isGeneratingFinalReq = isNavigating || (!!finalReqJob && (finalReqJob.status ==='Queued' || finalReqJob.status ==='Processing'));

 const activeExplanation = (activeDefenseId && explanationsCache[activeDefenseId])
 ? explanationsCache[activeDefenseId]
 : null;

 const toggleApprove = () => {
 if (!activeDefenseId) return;
 setApprovedDefenses((prev) =>
 prev.includes(activeDefenseId)
 ? prev.filter((id) => id !== activeDefenseId)
 : [...prev, activeDefenseId]
 );
 };

 const toggleApproveForId = (id: string) => {
   setApprovedDefenses((prev) =>
     prev.includes(id)
       ? prev.filter((itemId) => itemId !== id)
       : [...prev, id]
   );
 };

 const allDefenses = useMemo<TDefenseWithCategory[]>(() => {
 if (!defenses) return [];
	 const enrich = (
	 items: TDefense[] | undefined | null,
	 categoryLabel: string,
	 categoryTone:'formal' |'substantive' |'evidentiary',
	 baseScore: number,
	 ) => (items ?? []).map((item, index) => ({
	 ...item,
	 id: makeLocalDefenseId(item, categoryTone, index),
	 isLocal: item.isLocal || !item.id?.trim(),
	 categoryLabel,
	 categoryTone,
	 matchScore: Math.max(66, Math.min(baseScore - index * 6, 98)),
	 }));
 return [
 ...enrich(defenses.defensesFormal,'دفع شكلي','formal', 98),
 ...enrich(defenses.defensesSubstantive,'دفع موضوعي','substantive', 90),
 ...enrich(defenses.defensesEvidentiary,'دفع متعلق بالأدلة','evidentiary', 84),
 ];
 }, [defenses]);

 const activeDefense = useMemo(
 () => allDefenses.find((item) => item.id === activeDefenseId) || allDefenses[0] || null,
 [activeDefenseId, allDefenses],
 );

 useEffect(() => {
 setEditingTitle(activeDefense?.defenseTitle ?? '');
 }, [activeDefense?.id, activeDefense?.defenseTitle]);

 useEffect(() => {
 if (!activeDefenseId && allDefenses.length > 0) {
 setActiveDefenseId(allDefenses[0].id);
 }
 }, [activeDefenseId, allDefenses]);

 useEffect(() => {
 if (!activeDefenseId || activeDefenseId.startsWith('local-') || explanationsCache[activeDefenseId] || fetchingIdsRef.current.has(activeDefenseId)) return;
 const id = activeDefenseId;
 fetchingIdsRef.current.add(id);
 dispatch(thunkGetDefenseAnalysis({ defenseId: id })).unwrap()
 .then((response: { memorandum?: TDefenseMemorandum }) => {
 dispatch(hydrateStep({
 stepNumber: 3,
 result: { defenseId: id, explanation: response.memorandum }
 }));
 })
 .catch(() => { /* swallow */ })
 .finally(() => { fetchingIdsRef.current.delete(id); });
 }, [activeDefenseId, explanationsCache, dispatch]);

 // Pre-load analyses for all non-local defenses on page load/refresh
 const batchFetchedRef = useRef(false);
 useEffect(() => {
 if (!allDefenses.length || batchFetchedRef.current) return;
 batchFetchedRef.current = true;
 const toFetch = allDefenses.filter(
  (d) => !d.isLocal && !d.id.startsWith('local-') && !explanationsCache[d.id] && !fetchingIdsRef.current.has(d.id)
 );
 for (const d of toFetch) {
  fetchingIdsRef.current.add(d.id);
  dispatch(thunkGetDefenseAnalysis({ defenseId: d.id })).unwrap()
  .then((response: { memorandum?: TDefenseMemorandum }) => {
   if (response?.memorandum) {
   dispatch(hydrateStep({
    stepNumber: 3,
    result: { defenseId: d.id, explanation: response.memorandum },
   }));
   }
  })
  .catch(() => { /* defense has no analysis yet, that's OK */ })
  .finally(() => { fetchingIdsRef.current.delete(d.id); });
 }
 }, [allDefenses, explanationsCache, dispatch]);

 useEffect(() => {
 if (currentJob?.status ==='Queued' || currentJob?.status ==='Processing') return;
 setIsLoading(false);
 }, [currentJob?.status]);

 useEffect(() => {
 if (currentJob?.status !=='Completed') return;

 const completedAnalysis = getCompletedDefenseAnalysis(currentJob.resultJson);
 if (completedAnalysis) {
 const completedJobKey = `${currentJob.id}:${currentJob.resultJson ??''}`;
 if (handledCompletedAnalysisJobRef.current === completedJobKey) return;
 handledCompletedAnalysisJobRef.current = completedJobKey;
 if (!explanationsCache[completedAnalysis.defenseId]) {
 dispatch(hydrateStep({
 stepNumber: 3,
 result: {
 defenseId: completedAnalysis.defenseId,
 explanation: completedAnalysis.memorandum,
 },
 }));
 }
 setActiveDefenseId(completedAnalysis.defenseId);
 return;
 }

 if (!activeDefenseId || activeDefenseId.startsWith('local-') || explanationsCache[activeDefenseId] || fetchingIdsRef.current.has(activeDefenseId)) return;
 const id = activeDefenseId;
 fetchingIdsRef.current.add(id);
 dispatch(thunkGetDefenseAnalysis({ defenseId: id })).unwrap()
 .then((response: { memorandum?: TDefenseMemorandum }) => {
 if (!response.memorandum) return;
 dispatch(hydrateStep({
 stepNumber: 3,
 result: { defenseId: id, explanation: response.memorandum }
 }));
 })
 .catch(() => { /* fallback is best-effort */ })
 .finally(() => { fetchingIdsRef.current.delete(id); });
 }, [activeDefenseId, currentJob?.id, currentJob?.resultJson, currentJob?.status, dispatch, explanationsCache]);

 useEffect(() => {
 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 e.preventDefault();
 e.returnValue ="";
 };
 window.addEventListener("beforeunload", handleBeforeUnload);
 return () => window.removeEventListener("beforeunload", handleBeforeUnload);
 }, []);

 useEffect(() => {
 const currentAnalysisStateKey = currentJob
 ? `${currentJob.id}:${currentJob.status}:${currentJob.errorMessage ??''}`
 : null;
 if (currentJob?.status ==='Queued' || currentJob?.status ==='Processing') {
 if (!analysisToastRef.current && lastAnnouncedAnalysisStateRef.current !== currentAnalysisStateKey) {
 analysisToastRef.current = sileo.show({
 type:'loading',
 title: currentJob.status ==='Queued' ?'مساعدك الذكي شغال الآن...' :'جاري تحليل الدفع...',
 });
 lastAnnouncedAnalysisStateRef.current = currentAnalysisStateKey;
 }
 } else if (currentJob) {
 if (analysisToastRef.current) {
 sileo.dismiss(analysisToastRef.current);
 analysisToastRef.current = undefined;
 }
 if (lastAnnouncedAnalysisStateRef.current !== currentAnalysisStateKey) {
 if (currentJob.status ==='Completed') {
 sileo.success({ title:'تم تحليل الدفع بنجاح' });
 }
 if (currentJob.status ==='Failed') {
 sileo.error({ title: `فشل تحليل الدفع: ${currentJob.errorMessage ??'خطأ غير معروف'}` });
 }
 lastAnnouncedAnalysisStateRef.current = currentAnalysisStateKey;
 }
 }
 return () => {
 if (analysisToastRef.current) {
 sileo.dismiss(analysisToastRef.current);
 analysisToastRef.current = undefined;
 }
 };
 }, [currentJob]);

 // ── Parallel defense job tracking: hydrate results as they complete ──
 useEffect(() => {
   if (!parallelTracking) return;
   const jobMap = parallelTracking.defenseJobMap;
   if (!jobMap) return;

   let completedCount = 0;
   let failedCount = 0;

   for (const jobId of Object.values(jobMap)) {
     const job = defenseAnalysisJobs[jobId];
     if (!job) continue;

     if (job.status === 'Completed') {
       completedCount++;
       if (!hydratedParallelJobIds.current.has(jobId)) {
         hydratedParallelJobIds.current.add(jobId);
         const completedAnalysis = getCompletedDefenseAnalysis((job as { resultJson?: string }).resultJson);
         if (completedAnalysis && !explanationsCache[completedAnalysis.defenseId]) {
           dispatch(hydrateStep({
             stepNumber: 3,
             result: {
               defenseId: completedAnalysis.defenseId,
               explanation: completedAnalysis.memorandum,
             },
           }));
         }
       }
     } else if (job.status === 'Failed') {
       failedCount++;
       if (!hydratedParallelJobIds.current.has(jobId)) {
         hydratedParallelJobIds.current.add(jobId);
       }
     }
   }

   dispatch(setParallelDefenseCounts({ completedCount, failedCount }));
 }, [defenseAnalysisJobs, parallelTracking, explanationsCache, dispatch]);

 const reGenerateDefenses = async () => {
 if (!factAnalysis) {
 sileo.error({ title:'التحليل القانوني غير متوفر' });
 return;
 }
 const effectiveFacts = finalFacts || singleCase?.facts || factAnalysis?.legalFactsSummary?.join('\n') ||'';
 const loadingToast = sileo.show({ type:"loading", title:'جاري توليد قائمة الدفوع...' });
 setIsLoading(true);
 try {
 await dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'GenerateDefenses',
 inputJson: JSON.stringify({ caseId, caseFacts: effectiveFacts, legalAnalysis: factAnalysis })
 })).unwrap();
 sileo.success({ title:'مساعدك الذكي بدأ في توليد قائمة دفوع جديدة...' });
 } catch (error) {
 sileo.error({ title: `حدث خطأ: ${typeof error ==='string' ? error :'مشكلة بالاتصال'}` });
 } finally {
 sileo.dismiss(loadingToast);
 setIsLoading(false);
 }
 };

 const generateDetailedExplanation = async (defenseId: string, options?: { titleOverride?: string }) => {
 if (currentJob && (currentJob.status ==='Queued' || currentJob.status ==='Processing')) {
 sileo.error({ title:'يوجد تحليل قيد التشغيل بالفعل. انتظر حتى ينتهي أولاً.' });
 return;
 }
 const target = allDefenses.find((item) => item.id === defenseId) ?? (options?.titleOverride ? {
 id: defenseId,
 defenseTitle: options.titleOverride,
 basisFromCase:'دفع مضاف يدويًا بواسطة المحامي',
 scope:'',
 strength:'Medium' as const,
 categoryLabel:'دفع موضوعي',
 categoryTone:'substantive' as const,
 matchScore: 80,
 isLocal: defenseId.startsWith('local-'),
	 } : null);
	 if (!target) return;
	 setActiveDefenseId(defenseId);
	 setIsLoading(true);
	 try {
	 dispatch(clearDefenseAnalysis({ defenseId }));
 await dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'AnalysisDefense',
 inputJson: JSON.stringify({
 defenseId: target.isLocal || options?.titleOverride ? '00000000-0000-0000-0000-000000000000' : defenseId,
 clientDefenseId: defenseId,
 caseId,
 defenseTitle: options?.titleOverride ?? target.defenseTitle,
 basisFromCase: target.basisFromCase,
 scope: target.scope,
 })
	 })).unwrap();
	 } catch (error) {
 sileo.error({ title: `حدث خطأ: ${typeof error ==='string' ? error :'مشكلة بالاتصال'}` });
 } finally {
 setIsLoading(false);
 }
 };

 const handleApplyTitle = async () => {
 if (!activeDefense) return;
 const nextTitle = editingTitle.trim();
 if (!nextTitle) {
 sileo.error({ title:'اكتب عنوان الدفع أولاً' });
 return;
 }
 if (nextTitle === activeDefense.defenseTitle) return;
 setIsSavingTitle(true);
 try {
 await dispatch(thunkUpdateDefenseTitle({
 defenseId: activeDefense.id,
 defenseTitle: nextTitle,
 })).unwrap();
 dispatch(updateDefenseTitle({ defenseId: activeDefense.id, title: nextTitle }));
 sileo.success({ title:'تم حفظ عنوان الدفع' });
 void onDefensesMutated?.();
 } catch (error) {
 sileo.error({ title: typeof error ==='string' ? error :'تعذر حفظ عنوان الدفع' });
 } finally {
 setIsSavingTitle(false);
 }
 };

 const handleDeleteDefense = () => {
 if (!activeDefense) return;
 setIsDeleteConfirmOpen(true);
 };

 const confirmDeleteDefense = () => {
 if (!activeDefense) return;
 const defenseToDelete = activeDefense;
 const nextDefense = allDefenses.find((item) => item.id !== defenseToDelete.id);
 // Optimistically remove from UI immediately
 dispatch(deleteDefense({ defenseId: defenseToDelete.id }));
 setApprovedDefenses((prev) => prev.filter((id) => id !== defenseToDelete.id));
 setActiveDefenseId(nextDefense?.id ?? '');
 setIsDeleteConfirmOpen(false);

 // Defer the actual API call by 5s so the user can undo
 if (pendingDeleteTimerRef.current) {
 clearTimeout(pendingDeleteTimerRef.current);
 }
 const timer = setTimeout(async () => {
 pendingDeleteTimerRef.current = null;
 setIsDeletingDefense(true);
 try {
 await dispatch(thunkDeleteDefense({ defenseId: defenseToDelete.id })).unwrap();
 void onDefensesMutated?.();
 } catch (error) {
 sileo.error({ title: typeof error ==='string' ? error :'تعذر حذف الدفع' });
 // Restore on failure
 dispatch(addDefense({
 id: defenseToDelete.id,
 defenseTitle: defenseToDelete.defenseTitle,
 basisFromCase: defenseToDelete.basisFromCase,
 scope: defenseToDelete.scope,
 strength: defenseToDelete.strength,
 }));
 } finally {
 setIsDeletingDefense(false);
 }
 }, 5000);
 pendingDeleteTimerRef.current = timer;

 sileo.show({
 type: 'success',
 title: 'تم حذف الدفع',
 description: 'اضغط هنا للتراجع (خلال 5 ثوانٍ)',
 onClick: () => {
 if (pendingDeleteTimerRef.current) {
 clearTimeout(pendingDeleteTimerRef.current);
 pendingDeleteTimerRef.current = null;
 }
 dispatch(addDefense({
 id: defenseToDelete.id,
 defenseTitle: defenseToDelete.defenseTitle,
 basisFromCase: defenseToDelete.basisFromCase,
 scope: defenseToDelete.scope,
 strength: defenseToDelete.strength,
 }));
 setActiveDefenseId(defenseToDelete.id);
 sileo.success({ title:'تم التراجع عن الحذف' });
 },
 } as Parameters<typeof sileo.show>[0]);
 };

 useEffect(() => {
 return () => {
 if (pendingDeleteTimerRef.current) {
 clearTimeout(pendingDeleteTimerRef.current);
 }
 };
 }, []);

 const handleAddDefense = async () => {
    const title = newDefenseTitle.trim();
    if (!title) {
      sileo.error({ title: 'اكتب عنوان الدفع الجديد أولاً' });
      return;
    }
    setIsAddingDefense(true);
    try {
      const createdDefense = await dispatch(
        thunkCreateDefense({
          caseId,
          defenseTitle: title,
          type: newDefenseType,
        })
      ).unwrap() as TDefense;
      dispatch(
        addDefense({
          id: createdDefense.id,
          defenseTitle: createdDefense.defenseTitle,
          basisFromCase: createdDefense.basisFromCase,
          scope: createdDefense.scope,
          strength: createdDefense.strength,
          type: newDefenseType,
        })
      );
      setNewDefenseTitle('');
      setNewDefenseType('Substantive');
      onClose();
      setActiveDefenseId(createdDefense.id);
      void onDefensesMutated?.();
      await generateDetailedExplanation(createdDefense.id);
    } catch (error) {
      sileo.error({ title: typeof error === 'string' ? error : 'تعذر إضافة الدفع' });
    } finally {
      setIsAddingDefense(false);
    }
  };

 const cancelCurrentDefenseAnalysis = async () => {
 setIsCancellingAnalysis(true);
 try {
 await dispatch(thunkCancelAiJob({ caseId, stepType:'AnalysisDefense' })).unwrap();
 sileo.success({ title:'تم إلغاء تحليل الدفع الجاري' });
 } catch (error) {
 sileo.error({ title: typeof error ==='string' ? error :'تعذر إلغاء تحليل الدفع' });
 } finally {
 setIsCancellingAnalysis(false);
 }
 };

 const sendData = async () => {
 setIsNavigating(true);
 const loadingToast = sileo.show({ type:"loading", title:'جاري إنشاء الطلبات الختامية...' });
 try {
 await dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'FinalRequirements',
 inputJson: JSON.stringify({
 caseId,
 defensesFormal: defenses?.defensesFormal,
 defensesSubstantive: defenses?.defensesSubstantive,
 defensesEvidentiary: defenses?.defensesEvidentiary
 })
 })).unwrap();
 sileo.success({ title:'مساعدك الذكي شغال الآن...' });
 // Navigation is handled by DefenseMemoPage's auto-jump effect which detects
 // the running FinalRequirements job and navigates to tab 3 automatically.
 // Calling nextStep() here would cause a double-navigation race condition
 // (effect sets active=3, then nextStep increments to 4, skipping Requests).
 } catch (error) {
 sileo.error({ title: `حدث خطأ: ${error}` });
 } finally {
 sileo.dismiss(loadingToast);
 setIsNavigating(false);
 }
 };

 const handleNext = () => {
 if (finalRequirements && finalRequirements.length > 0) {
 nextStep();
 return;
 }
 sendData();
 };

 const getHtmlContent = () => {
 if (!activeExplanation || !activeDefense) return'';
 return `
 <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; line-height: 1.8;">
 <h2 style="color: #9b6a00; margin-bottom: 20px;">تحليل الدفع: ${activeDefense.defenseTitle}</h2>
 <h3 style="color: #3b3b3b; margin-top: 15px;">التأصيل القانوني</h3>
 <p>${activeExplanation.introduction}</p>
 <h3 style="color: #3b3b3b; margin-top: 15px;">الأساس الواقعي</h3>
 <p>${activeExplanation.factualBasis}</p>
 ${activeExplanation.legalTextsFull.length > 0 ? `
 <h3 style="color: #3b3b3b; margin-top: 15px;">النصوص القانونية</h3>
 ${activeExplanation.legalTextsFull.map(t => `<p><strong>${t.lawName} - المادة ${t.articleNumber}</strong><br/>${t.fullText}</p>`).join('')}
 ` :''}
 <h3 style="color: #3b3b3b; margin-top: 15px;">ربط النصوص بالوقائع</h3>
 <p>${activeExplanation.linkingTextsToFacts || activeExplanation.legalTextsUnavailableReason}</p>
 ${activeExplanation.cassationPrecedentsFull.length > 0 ? `
 <h3 style="color: #3b3b3b; margin-top: 15px;">السوابق القضائية</h3>
 ${activeExplanation.cassationPrecedentsFull.map(t => `<p><strong>طعن ${t.appealNumber} لسنة ${t.judicialYear} (${t.sessionDate})</strong><br/>${t.fullText}</p>`).join('')}
 ` :''}
 <h3 style="color: #3b3b3b; margin-top: 15px;">التطبيق القانوني</h3>
 <p>${activeExplanation.legalApplication}</p>
 <h3 style="color: #3b3b3b; margin-top: 15px;">الحجج المضادة والرد</h3>
 <p>${activeExplanation.counterArgumentsAndResponse}</p>
 <h3 style="color: #3b3b3b; margin-top: 15px;">الأثر القانوني للقبول</h3>
 <p>${activeExplanation.legalEffectOfAcceptance}</p>
 <h3 style="color: #3b3b3b; margin-top: 15px;">نقاط القوة والمخاطر</h3>
 <p>${activeExplanation.strengthsAndRisks}</p>
 </div>
 `;
 };

 const getPlainTextContent = () => {
 if (!activeExplanation || !activeDefense) return'';
 return [
 `تحليل الدفع: ${activeDefense.defenseTitle}\n`,
 `التأصيل القانوني:\n${activeExplanation.introduction}`,
 `الأساس الواقعي:\n${activeExplanation.factualBasis}`,
 activeExplanation.legalTextsFull.length > 0
 ? `النصوص القانونية:\n` + activeExplanation.legalTextsFull.map(t => `${t.lawName} - المادة ${t.articleNumber}\n${t.fullText}`).join('\n')
 :'',
 `ربط النصوص بالوقائع:\n${activeExplanation.linkingTextsToFacts || activeExplanation.legalTextsUnavailableReason}`,
 activeExplanation.cassationPrecedentsFull.length > 0
 ? `السوابق القضائية:\n` + activeExplanation.cassationPrecedentsFull.map(t => `طعن ${t.appealNumber} لسنة ${t.judicialYear} (${t.sessionDate})\n${t.fullText}`).join('\n')
 :'',
 `التطبيق القانوني:\n${activeExplanation.legalApplication}`,
 `الحجج المضادة والرد:\n${activeExplanation.counterArgumentsAndResponse}`,
 `الأثر القانوني للقبول:\n${activeExplanation.legalEffectOfAcceptance}`,
 `نقاط القوة والمخاطر:\n${activeExplanation.strengthsAndRisks}`,
 ].filter(Boolean).join('\n\n');
 };

 const copyAnalysis = async () => {
 if (!activeExplanation) return;
 const plainText = getPlainTextContent();
 const html = getHtmlContent();
 try {
 if (typeof ClipboardItem !=='undefined') {
 await navigator.clipboard.write([
 new ClipboardItem({'text/html': new Blob([html], { type:'text/html' }),'text/plain': new Blob([plainText], { type:'text/plain' })
 })
 ]);
 } else {
 await navigator.clipboard.writeText(plainText);
 }
 sileo.success({ title:'تم النسخ بشكل يسهل لصقه في وورد' });
 } catch {
 await navigator.clipboard.writeText(plainText);
 sileo.success({ title:'تم النسخ كنص' });
 }
 };

 const downloadDoc = () => {
 if (!activeExplanation || !activeDefense) return;
 const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>تحليل الدفع</title></head><body>`;
 const footer ="</body></html>";
 const html = header + getHtmlContent() + footer;
 const blob = new Blob(['\ufeff', html], { type:'application/msword' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `تحليل_دفع_${activeDefense.defenseTitle.replace(/\s+/g,'_')}.doc`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 sileo.success({ title:'تم حفظ الملف' });
 };

 const isWaitingForDefenses = !defenses && generateDefensesJob && (generateDefensesJob.status ==='Queued' || generateDefensesJob.status ==='Processing');
 const isWaitingForSummaryAfterDefenses = generateDefensesJob?.status ==='Completed' && !defenses;
 const isShellLoading = isWaitingForDefenses || isWaitingForSummaryAfterDefenses || (loading ==='pending' && !defenses && !isGeneratingFinalReq);
 const isAnalyzingDefense = isLoading || currentJob?.status ==='Queued' || currentJob?.status ==='Processing';
 const isMutatingDefense = isSavingTitle || isAddingDefense || isDeletingDefense;
 const isDefenseLocked = isAnalyzingDefense || isMutatingDefense;
 const activeDefenseIsAnalyzing = isAnalyzingDefense && activeDefenseId === activeDefense?.id;
 const analyzedCount = allDefenses.filter((d) => explanationsCache[d.id]).length;

 const handleAnalyzeAll = async () => {
   const unanalyzed = allDefenses.filter((d) => !explanationsCache[d.id]);
   if (unanalyzed.length === 0) {
     sileo.success({ title: 'جميع الدفوع محللة بالفعل' });
     return;
   }
   setIsSubmittingParallel(true);
   const loadingToast = sileo.show({ type: 'loading', title: `جاري تحضير وبدء تحليل ${unanalyzed.length} دفع بالتوازي...` });
   dispatch(clearDefenseAnalysisJobs());
   const defenses = unanalyzed.map((d) => ({
     defenseId: d.id,
     clientDefenseId: d.id,
     defenseTitle: d.defenseTitle,
     basisFromCase: d.basisFromCase,
     scope: d.scope,
   }));
   try {
     const result = await dispatch(thunkSubmitParallelDefenseAnalyses({ caseId, defenses })).unwrap();
     const defenseJobMap: Record<string, string> = {};
     for (const s of result.submitted) {
       defenseJobMap[s.defenseId] = s.jobId;
     }
     dispatch(startParallelDefenseTracking({
       totalDefenses: unanalyzed.length,
       defenseJobMap,
     }));
     sileo.success({ title: `بدأ تحليل ${unanalyzed.length} دفع بالتوازي` });
   } catch (error) {
     sileo.error({ title: typeof error === 'string' ? error : 'فشل بدء التحليل المتوازي' });
   } finally {
     sileo.dismiss(loadingToast);
     setIsSubmittingParallel(false);
   }
 };

 const defenseNamesMap = useMemo(() => {
   const map: Record<string, string> = {};
   for (const d of allDefenses) {
     map[d.id] = d.defenseTitle;
   }
   return map;
 }, [allDefenses]);

 return (
 <UnifiedStepShell
 isLoading={isShellLoading}
 hasFailed={false}
 loadingTitle="جاري إنشاء الدفوع من الوقائع..."
 loadingSubtitle="يعمل المحرك الذكي على معالجة النص وبناء دفوع متينة وفق الأنظمة والسوابق القضائية."
 steps={DEFENSE_MEMO_STEPS}
 currentStepIndex={2}
 >
 {isGeneratingFinalReq && (
 <AnalysisStepShell
 isLoading
 hasFailed={false}
 loadingTitle="جاري تأسيس الطلبات الختامية..."
 loadingSubtitle="يقوم النظام الاستدلالي ببناء الطلبات الختامية المطلوبة استناداً إلى مسودة الدفوع المعتمدة."
 steps={DEFENSE_MEMO_STEPS}
 currentStepIndex={3}
 >
 <div />
 </AnalysisStepShell>
 )}

 {!isGeneratingFinalReq && (
 <>
 {!isLoading && finalReqJob?.status ==='Failed' && (
 <AnalysisStageBanner label="فشل العملية" tone="danger">
 {finalReqJob.errorMessage ||'تعذّر إنشاء المتطلبات النهائية. أعد المحاولة.'}
 </AnalysisStageBanner>
 )}

 {allDefenses.length > 0 && activeDefense && (
 <AnalysisStageLayout
 title="دفوع مقترحة من العقل الذكي"
 actions={
 <button
 type="button"
 disabled={isLoading}
 onClick={reGenerateDefenses}
 className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${
 isLoading
 ? 'app-surface-soft dark:app-surface-soft app-text-subtle dark:app-text-muted cursor-not-allowed'
 : 'bg-orange-50 dark:bg-orange-950/30 text-[var(--main-color)] dark:text-white hover:bg-orange-100 dark:hover:bg-orange-950/50 border border-orange-200 dark:border-orange-800/50'
 }`}
 >
 <IoReload className="text-base" />
 إعادة التوليد
 </button>
 }
 sidebar={
    <>
      <AnalysisStageSidebarCard
        label="إجمالي الدفوع"
        value={`${allDefenses.length} دفع`}
        description={`تم تحليل ${analyzedCount} من ${allDefenses.length} · معتمد ${approvedDefenses.length}`}
        tone="accent"
      />

      <CustomCard className="border app-border dark:app-border-strong shadow-sm p-5 app-surface-soft/40 dark:app-surface-muted/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-[var(--main-color)] to-orange-300 opacity-80" />

        <h3 className="text-sm font-bold text-[var(--title-color)] mb-4 text-right">إجراءات الدفوع</h3>
        <button
          type="button"
          onClick={onOpen}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed app-border-strong dark:app-border-strong text-sm font-bold text-[var(--main-color)] dark:text-white hover:bg-orange-50 dark:hover:bg-white/10 transition-colors"
        >
          <IoAddOutline className="text-lg" />
          إضافة دفع جديد
        </button>

        <FormModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          title="إضافة دفع جديد"
          icon={<IoAddOutline />}
        >
          <div className="p-6 flex flex-col gap-4">
            <input
              value={newDefenseTitle}
              onChange={(e) => setNewDefenseTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isAnalyzingDefense && !isAddingDefense) void handleAddDefense();
              }}
              placeholder="عنوان الدفع"
              className="w-full rounded-xl border app-border dark:app-border-strong app-surface-soft px-4 py-3 text-sm outline-none focus:border-[var(--main-color)] transition-colors text-right"
              dir="rtl"
              autoFocus
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold app-text-subtle text-right">نوع الدفع</label>
              <div className="grid grid-cols-3 gap-2" dir="rtl">
                <button
                  type="button"
                  onClick={() => setNewDefenseType('Substantive')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    newDefenseType === 'Substantive'
                      ? 'border-[var(--main-color)] bg-orange-50/30 dark:bg-orange-950/20 text-[var(--main-color)] font-extrabold'
                      : 'app-border dark:app-border-strong app-surface-soft app-text-subtle hover:border-orange-100 dark:hover:border-orange-900/50'
                  }`}
                >
                  موضوعي
                </button>
                <button
                  type="button"
                  onClick={() => setNewDefenseType('Formal')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    newDefenseType === 'Formal'
                      ? 'border-[var(--main-color)] bg-orange-50/30 dark:bg-orange-950/20 text-[var(--main-color)] font-extrabold'
                      : 'app-border dark:app-border-strong app-surface-soft app-text-subtle hover:border-orange-100 dark:hover:border-orange-900/50'
                  }`}
                >
                  شكلي
                </button>
                <button
                  type="button"
                  onClick={() => setNewDefenseType('Evidentiary')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    newDefenseType === 'Evidentiary'
                      ? 'border-[var(--main-color)] bg-orange-50/30 dark:bg-orange-950/20 text-[var(--main-color)] font-extrabold'
                      : 'app-border dark:app-border-strong app-surface-soft app-text-subtle hover:border-orange-100 dark:hover:border-orange-900/50'
                  }`}
                >
                  متعلق بالأدلة
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddDefense}
              disabled={isAnalyzingDefense || isAddingDefense || !newDefenseTitle.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--main-color)] text-white text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <IoAddOutline className="text-lg" />
              {isAddingDefense || isAnalyzingDefense ? 'جاري الإضافة والتحليل...' : 'إضافة وتحليل'}
            </button>
          </div>
        </FormModal>
      </CustomCard>

       <AnalysisStageActionButton
         label={finalRequirements && finalRequirements.length > 0 ? 'الذهاب للطلبات الختامية' : 'الطلبات الختامية'}
         icon={IoArrowBackOutline}
         onClick={handleNext}
         disabled={isLoading}
       />

       {allDefenses.length > 0 && !parallelTracking?.isRunning && (
         <button
           type="button"
           onClick={handleAnalyzeAll}
           disabled={isAnalyzingDefense || analyzedCount === allDefenses.length || isSubmittingParallel}
           className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-colors border ${
             analyzedCount === allDefenses.length || isSubmittingParallel
               ? 'app-surface-soft app-text-subtle app-border cursor-not-allowed'
               : 'border-[var(--main-color)] bg-orange-50/30 dark:bg-orange-950/20 text-[var(--main-color)] dark:text-white hover:bg-orange-50 dark:hover:bg-orange-950/40'
           }`}
         >
           <IoFlash className="text-lg" />
           {isSubmittingParallel 
             ? 'جاري بدء التحليل...' 
             : (analyzedCount === allDefenses.length ? 'تم تحليل جميع الدفوع' : `تحليل جميع الدفوع (${allDefenses.length - analyzedCount})`)}
         </button>
       )}

       {parallelTracking && (
         <ParallelDefenseProgress
           tracking={parallelTracking}
           defenseNames={defenseNamesMap}
           defenseAnalysisJobs={defenseAnalysisJobs}
         />
       )}
    </>
  }
  >
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--title-color)]">قائمة الدفوع المقترحة</h3>
        <span className="text-xs font-bold app-surface-soft app-text-subtle dark:app-text-subtle px-3 py-1.5 rounded-full border app-border-strong dark:app-border-strong">
          {allDefenses.length} نتائج
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scroll-smooth" dir="rtl">
        {allDefenses.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveDefenseId(item.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveDefenseId(item.id);
              }
            }}
            tabIndex={0}
            role="button"
            className={`flex-shrink-0 w-[280px] md:w-[320px] snap-start flex flex-col justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer text-right relative overflow-hidden
            ${activeDefense.id === item.id
              ? 'border-[var(--main-color)] bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-[var(--main-color)]'
              : 'app-border dark:app-border-strong bg-white dark:bg-zinc-900 hover:border-orange-100 dark:hover:border-orange-800/50 hover:shadow-sm'
            }`}
          >
            {activeDefense.id === item.id && (
              <div className="absolute top-0 right-0 h-full w-1 bg-[var(--main-color)]" />
            )}
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between w-full gap-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                  item.categoryTone === 'formal' ? 'bg-[var(--info-soft)] dark:bg-blue-950/40 text-[var(--blue-color)] dark:text-blue-300 border-blue-100 dark:border-blue-800/50' :
                  item.categoryTone === 'substantive' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800/50' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/50'
                }`}>
                  {item.categoryLabel}
                </span>
                <span className="text-xs app-text-subtle font-bold whitespace-nowrap">بنسبة {item.matchScore}%</span>
              </div>

              <h4 className="text-[14px] font-extrabold text-[var(--title-color)] leading-snug break-words line-clamp-2 min-h-[40px] text-right"
                  dir="rtl">
                {item.defenseTitle}
              </h4>

              <p className="text-xs app-text-subtle leading-relaxed line-clamp-2 min-h-[36px] text-right"
                 dir="rtl">
                {item.basisFromCase?.replace(/^[a-z_]+\s*[-:]\s*/i, '')}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-black/5" dir="rtl">
              {approvedDefenses.includes(item.id) ? (
                <button
                  type="button"
                  className="text-[10px] font-bold text-white bg-green-600 hover:bg-green-700 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-green-700 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDefenseId(item.id);
                    toggleApproveForId(item.id);
                  }}
                >
                  <LuCheck size={10}/> معتمد
                </button>
              ) : (
                <button
                  type="button"
                  className="text-[10px] font-bold text-gray-500 hover:text-[var(--main-color)] dark:text-gray-400 dark:hover:text-white bg-transparent hover:bg-orange-50 dark:hover:bg-orange-950/20 border border-gray-200 dark:border-zinc-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDefenseId(item.id);
                    toggleApproveForId(item.id);
                  }}
                >
                  اعتماد
                </button>
              )}

              {explanationsCache[item.id] ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[var(--success-color)] dark:text-green-300 bg-[var(--success-soft)] dark:bg-green-950/40 border border-[var(--success-soft)] dark:border-green-800/50 px-2 py-1 rounded flex items-center gap-0.5">
                    <LuCheck size={10} />
                    محلل
                  </span>
                  <button
                    type="button"
                    className="p-1 app-text-subtle hover:text-[var(--main-color)] dark:hover:text-white app-surface-soft border app-border dark:app-border-strong hover:border-orange-100 dark:hover:border-orange-800/50 rounded transition-colors"
                    title="إعادة التحليل"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAnalyzingDefense) void generateDetailedExplanation(item.id);
                    }}
                    disabled={isAnalyzingDefense}
                  >
                    <IoReload size={10} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="text-[10px] font-bold app-text-muted app-surface-soft border app-border dark:app-border-strong hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-[var(--main-color)] dark:hover:text-white hover:border-orange-100 px-2 py-1 rounded transition-colors flex items-center gap-1 whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAnalyzingDefense) void generateDetailedExplanation(item.id);
                  }}
                  disabled={isAnalyzingDefense}
                >
                  {isAnalyzingDefense && activeDefenseId === item.id ? (
                    <IoReload className="text-orange-500 text-xs animate-spin" />
                  ) : (
                    <IoSparklesOutline className={activeDefense.id === item.id ? "text-orange-500 text-xs" : "app-text-subtle text-xs"} />
                  )}
                  {isAnalyzingDefense && activeDefenseId === item.id ? 'جاري التحليل...' : 'تحليل'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
 <AnalysisStageDocumentCard
 label="مذكرة الدفع"
 badge={activeDefenseIsAnalyzing ? "جاري التحليل..." : activeExplanation ?"تم التحليل" :"في الانتظار"}
 badgeTone={activeExplanation && !activeDefenseIsAnalyzing ?"success" :"accent"}
 >
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
 <div className="flex-1 min-w-0 pr-4 border-r-4 border-r-[var(--main-color)] border-l-0 pl-0">
 <div className="flex flex-col gap-3">
 <label className="text-xs font-bold app-text-subtle text-right">عنوان الدفع</label>
 <div className="flex flex-col sm:flex-row gap-2">
 <input
 value={editingTitle}
 onChange={(e) => setEditingTitle(e.target.value)}
 disabled={isDefenseLocked}
 className="flex-1 rounded-xl border app-border dark:app-border-strong app-surface-soft px-4 py-3 text-sm font-bold text-[var(--title-color)] outline-none focus:border-[var(--main-color)] disabled:opacity-60 text-right"
 dir="rtl"
 />
 <button
 type="button"
 onClick={handleApplyTitle}
 disabled={isDefenseLocked || !editingTitle.trim() || editingTitle.trim() === activeDefense.defenseTitle}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--main-color)] dark:border-white/30 px-4 py-3 text-sm font-bold text-[var(--main-color)] dark:text-white transition-colors hover:bg-orange-50 dark:hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
 >
 {isSavingTitle ? <IoReload className="animate-spin" /> : <IoPencilOutline />}
 {isSavingTitle ?'جاري الحفظ...' :'حفظ التعديل'}
 </button>
 </div>
 </div>
 <div className="flex flex-wrap items-center gap-3 mt-3">
 <span className="text-xs font-bold bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-800/50 text-[var(--main-color)] dark:text-white px-2.5 py-1 rounded-md">
 مطابق بنسبة {activeDefense.matchScore}%
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 flex-shrink-0">
 <button
 type="button"
 className="p-2 lg:p-2.5 text-[var(--danger-color)] app-surface-soft border border-[var(--danger-soft)] dark:border-red-800/50 hover:bg-[var(--danger-soft)] dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 onClick={() => void handleDeleteDefense()}
 disabled={isDefenseLocked}
 title="حذف الدفع"
 >
 <IoTrashOutline className="text-xl" />
 </button>
 <button
 type="button"
 className="p-2 lg:p-2.5 app-text-subtle dark:app-text-subtle hover:text-[var(--main-color)] dark:hover:text-white app-surface-soft dark:app-surface-soft hover:bg-orange-50 dark:hover:bg-white/10 rounded-lg border app-border dark:app-border-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 onClick={downloadDoc}
 disabled={!activeExplanation || isLoading}
 title="تنزيل كملف Word"
 >
 <HiOutlineArrowDownTray className="text-xl" />
 </button>
 <button
 type="button"
 className="p-2 lg:p-2.5 app-text-subtle dark:app-text-subtle hover:text-[var(--main-color)] dark:hover:text-white app-surface-soft dark:app-surface-soft hover:bg-orange-50 dark:hover:bg-white/10 rounded-lg border app-border dark:app-border-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 onClick={copyAnalysis}
 disabled={!activeExplanation || isLoading}
 title="نسخ النص"
 >
 <HiOutlineDocumentDuplicate className="text-xl" />
 </button>
 <button
 type="button"
 className={`px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg font-bold text-sm transition-colors border ${
 approvedDefenses.includes(activeDefense.id)
 ?'bg-green-600 text-white border-green-700 hover:bg-green-700'
 :'bg-[var(--main-color)] text-white border-transparent hover:bg-opacity-90'
 }`}
 onClick={toggleApprove}
 >
 {approvedDefenses.includes(activeDefense.id) ?'تم الاعتماد' :'اعتماد الدفع'}
 </button>
 </div>
 </div>

 {approvedDefenses.includes(activeDefense.id) && (
 <AnalysisStageBanner label="معتمد" tone="success" icon={<LuCheck className="text-lg" />}>
 تم اعتماد هذا الدفع وسيُضمّن في الطلبات الختامية
 </AnalysisStageBanner>
 )}

 <div className="flex-1 flex flex-col">
 {!activeExplanation && activeDefenseIsAnalyzing && (
 <div className="flex flex-col gap-4">
 <AnalysisStepShell
 isLoading
 hasFailed={false}
 loadingTitle="جاري تحليل الدفع..."
 loadingSubtitle="يعمل المحرك الذكي على بناء التأصيل القانوني والسوابق القضائية لهذا الدفع."
 >
 <div />
 </AnalysisStepShell>
 <div className="flex justify-center">
 <button
 type="button"
 onClick={cancelCurrentDefenseAnalysis}
 disabled={isCancellingAnalysis}
 className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--danger-soft)] dark:border-red-800/50 bg-white dark:app-surface-muted text-[var(--danger-color)] dark:text-[var(--danger-color)] text-sm font-bold hover:bg-[var(--danger-soft)] dark:hover:bg-red-950/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
 >
 <IoTrashOutline className="text-base" />
 {isCancellingAnalysis ?'جاري الإلغاء...' :'إلغاء التحليل'}
 </button>
 </div>
 </div>
 )}

 {!activeExplanation && !activeDefenseIsAnalyzing && (
 <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-center p-8 app-surface-soft/50 dark:app-surface-soft/50 rounded-2xl border border-dashed app-border-strong dark:app-border-strong">
 <div className="w-16 h-16 app-surface-soft rounded-full flex items-center justify-center shadow-sm border app-border dark:app-border-strong mb-4">
 <IoSparklesOutline className="text-3xl text-orange-400" />
 </div>
 <h4 className="text-lg font-bold text-[var(--title-color)] mb-2">تحليل الدفع المختار</h4>
 <p className="app-text-subtle dark:app-text-subtle text-sm max-w-sm leading-relaxed mb-6">
 اضغط"تحليل الدفع" لإظهار الشرح القانوني التفصيلي والتأصيل لهذا الدفع مدعماً بالنصوص.
 </p>
 <button
 type="button"
 disabled={isAnalyzingDefense}
 onClick={() => void generateDetailedExplanation(activeDefense.id)}
 className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-colors ${
 isAnalyzingDefense
 ?'app-surface-soft dark:app-surface-soft app-text-subtle dark:app-text-muted cursor-not-allowed'
 :'bg-[var(--main-color)] text-white hover:bg-opacity-90'
 }`}
 >
 <IoSparklesOutline />
 تحليل
 </button>
 </div>
 )}

 {activeExplanation && (
 <div className="flex flex-col gap-6">
 <AnalysisStageSectionCard label="التأصيل القانوني">
 <p className="text-[14px] app-text-muted leading-loose">{activeExplanation.introduction}</p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="الأساس الواقعي">
 <p className="text-[14px] app-text-muted leading-loose">{activeExplanation.factualBasis}</p>
 </AnalysisStageSectionCard>

 {activeExplanation.legalTextsFull.length > 0 && (
 <AnalysisStageSectionCard label="النصوص القانونية">
 <div className="flex flex-col gap-4">
 {activeExplanation.legalTextsFull.map((item, idx) => (
 <div key={`${item.lawName}-${idx}`} className="app-surface-soft border app-border dark:app-border-strong hover:border-emerald-100 dark:hover:border-emerald-800/50 rounded-xl p-5 shadow-sm transition-colors">
 <strong className="block text-[15px] font-bold text-emerald-800 dark:text-emerald-300 mb-3 pb-3 border-b border-gray-50 dark:app-border-strong">
 {`${item.lawName} - المادة ${item.articleNumber}`}
 </strong>
 <p className="text-[14px] app-text-muted leading-loose">{item.fullText}</p>
 </div>
 ))}
 </div>
 </AnalysisStageSectionCard>
 )}

 <AnalysisStageSectionCard label="ربط النصوص بالوقائع">
 <p className="text-[14px] app-text-muted leading-loose">
 {activeExplanation.linkingTextsToFacts || activeExplanation.legalTextsUnavailableReason}
 </p>
 </AnalysisStageSectionCard>

 {activeExplanation.cassationPrecedentsFull.length > 0 && (
 <AnalysisStageSectionCard label="السوابق القضائية">
 <div className="flex flex-col gap-4">
 {activeExplanation.cassationPrecedentsFull.map((item, idx) => (
 <div key={`${item.appealNumber}-${idx}`} className="app-surface-soft border app-border dark:app-border-strong hover:border-orange-100 dark:hover:border-orange-800/50 rounded-xl p-5 shadow-sm transition-colors flex flex-col gap-2">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-3 border-b border-gray-50 dark:app-border-strong">
 <strong className="text-[15px] font-bold text-orange-800 dark:text-orange-300">{`طعن ${item.appealNumber} لسنة ${item.judicialYear}`}</strong>
 <span className="text-xs font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">{item.sessionDate}</span>
 </div>
 <p className="text-[14px] app-text-muted leading-loose">{item.fullText}</p>
 </div>
 ))}
 </div>
 </AnalysisStageSectionCard>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 <AnalysisStageSectionCard label="التطبيق القانوني">
 <p className="text-[13px] app-text-muted leading-loose">{activeExplanation.legalApplication}</p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="الحجج المضادة والرد">
 <p className="text-[13px] app-text-muted leading-loose">{activeExplanation.counterArgumentsAndResponse}</p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="الأثر القانوني للقبول">
 <p className="text-[13px] app-text-muted leading-loose">{activeExplanation.legalEffectOfAcceptance}</p>
 </AnalysisStageSectionCard>

 <AnalysisStageSectionCard label="نقاط القوة والمخاطر">
 <p className="text-[13px] app-text-muted leading-loose">{activeExplanation.strengthsAndRisks}</p>
 </AnalysisStageSectionCard>
 </div>
 </div>
 )}
 </div>
 </AnalysisStageDocumentCard>

 <div className="lg:hidden w-full mt-2">
 <AnalysisStageActionButton
 label={finalRequirements && finalRequirements.length > 0 ?'الذهاب للطلبات الختامية' :'الطلبات الختامية'}
 icon={IoArrowBackOutline}
 onClick={handleNext}
 disabled={isLoading}
 />
 </div>
 </AnalysisStageLayout>
 )}

 {!allDefenses.length && loading !=='pending' && !isWaitingForDefenses && !isWaitingForSummaryAfterDefenses && !isLoading && (
 <div className="flex flex-col items-center gap-4">
  <NotFoundImage text="لا توجد دفوع متوفرة. يجب إعادة التوليد" variant="defenses" />
  <button type="button" onClick={reGenerateDefenses} className="bg-[var(--main-color)] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-colors">إعادة توليد الدفوع</button>
  </div>
 )}

 <ConfirmDialog
 isOpen={isDeleteConfirmOpen}
 onClose={() => setIsDeleteConfirmOpen(false)}
 onConfirm={confirmDeleteDefense}
 title="حذف الدفع"
 description="سيتم حذف هذا الدفع من القائمة ومن المخرجات النهائية. هل تريد المتابعة؟ يمكنك التراجع خلال 5 ثوانٍ بعد الحذف."
 confirmText="حذف الدفع"
 cancelText="إلغاء"
 danger
 isLoading={isDeletingDefense}
 />
 </>
 )}
 </UnifiedStepShell>
 );
};

export default DefensesList;
