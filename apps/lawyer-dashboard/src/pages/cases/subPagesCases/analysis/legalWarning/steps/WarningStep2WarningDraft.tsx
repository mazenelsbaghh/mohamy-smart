import { useEffect, useState } from'react';
import {  parseWorkflowJobResult  } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoArrowBackOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import thunkSubmitAiJob from'../../../../../../redux/aiJobs/thunk/thunkSubmitAiJob';
import {
 hydrateStep,
 legalWarningThunks,
} from'../../../../../../redux/legalWarning/legalWarningSlice';
import {
 UnifiedStepShell,
 AnalysisStageActionButton,
 AnalysisStageNumberedList,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { useWorkflowAutoSave } from'../../../../../../hooks/useWorkflowAutoSave';
import { LEGAL_WARNING_STEPS } from '../../../../../../components/analysisWorkflow/workflowConstants';

type TWarningStep2Props = {
 nextStep: () => void;
 selectedFacts: string[];
};

const WarningStep2LegalWarningBodyDraft = ({ nextStep, selectedFacts }: TWarningStep2Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 const aiJobsState = useAppSelector((s) => s.aiJobs);
 const classification = useAppSelector((s) => s.legalWarning.outputs[1]);
 const warningDraft = useAppSelector((s) => s.legalWarning.outputs[2]);
 const job = aiJobsState.jobs['LegalWarningBodyDraft'];
 const [localText, setLocalText] = useState('');
 const workflowId = useAppSelector(s => s.legalWarning.workflowId);
 const lastSavedAt = useAppSelector(s => s.legalWarning.lastSavedAt);
 const lastSaved = lastSavedAt
 ? new Date(lastSavedAt).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' })
 : null;

 useEffect(() => {
 if (warningDraft?.warningBody && !localText) {
 setLocalText(warningDraft.warningBody);
 }
 }, [warningDraft?.warningBody, localText]);

 const { isAutoSaving } = useAppSelector(s => s.legalWarning.loadingState);

 const { debouncedSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 if (!workflowId || !warningDraft) return;
 await dispatch(legalWarningThunks.saveDraftStep({
 routeId: workflowId,
 stepNumber: 2,
 payload: { ...warningDraft, warningBody: payload }
 })).unwrap();
 }
 });

 const isProcessingJob = job?.status ==='Queued' || job?.status ==='Processing';
 const isWaitingForHydration = job?.status ==='Completed' && !warningDraft;
 const isLoading = isProcessingJob || isWaitingForHydration || (!job && !warningDraft);

 useEffect(() => {
 if (job?.status ==='Completed' && job.resultJson && !warningDraft) {
 try {
 const parsed = parseWorkflowJobResult(job.resultJson);
 dispatch(hydrateStep({ stepNumber: 2, result: parsed }));
 } catch { /* ignore */ }
 }
 }, [job?.status, job?.resultJson, warningDraft, dispatch]);

 useEffect(() => {
 if (warningDraft || job || !caseId || !classification) return;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'LegalWarningBodyDraft',
 inputJson: buildAnalysisInput(caseId, selectedFacts, {
 warningType: classification.warningType,
 legalBasis: classification.legalBasis,
 obligationDetails: classification.obligationDetails,
 }),
 }));
 }, [warningDraft, job, caseId, classification, dispatch, selectedFacts]);

 const handleRetry = () => {
 if (!caseId || !classification) return;
 dispatch(thunkSubmitAiJob({
 caseId,
 stepType:'LegalWarningBodyDraft',
 inputJson: buildAnalysisInput(caseId, selectedFacts, {
 warningType: classification.warningType,
 legalBasis: classification.legalBasis,
 obligationDetails: classification.obligationDetails,
 }),
 }));
 };

 return (
 <UnifiedStepShell
 isLoading={isLoading}
 hasFailed={job?.status === 'Failed'}
 errorMessage={job?.errorMessage || 'تعذّر صياغة الإنذار. أعد المحاولة.'}
 onRetry={handleRetry}
 loadingTitle="جاري صياغة متن الإنذار الرسمي..."
 loadingSubtitle="يعمل النظام على صياغة نص الإنذار بأسلوب قانوني رسمي استنادًا إلى التصنيف والأساس القانوني."
 steps={LEGAL_WARNING_STEPS}
 currentStepIndex={1}
 title="صياغة متن الإنذار"
 sidebar={
 <>
 <AnalysisStageSidebarCard
 label={isAutoSaving ?'جارِ الحفظ...' : (lastSaved ?'النقاط المستخرجة' :'النقاط المستخرجة')}
 value={warningDraft?.keyPoints?.length ?? 0}
 valueClassName="text-5xl"
 description={lastSaved ? `آخر حفظ ${lastSaved}` :"تمت صياغة متن الإنذار. يمكنك الانتقال لتجميع الوثيقة النهائية."}
 />
 <AnalysisStageActionButton
 label="الانتقال للإنذار النهائي"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 </>
 }
 >
 <AnalysisStageSectionCard label="متن الإنذار">
 <textarea
 className="text-sm leading-[2.2] app-text-muted w-full outline-none bg-transparent resize-none border border-transparent hover:app-border-strong focus:border-[var(--main-color)] focus:ring-1 focus:ring-[var(--main-color)]/20 rounded p-2 transition-colors min-h-[300px]"

 value={localText}
 onChange={(e) => {
 setLocalText(e.target.value);
 debouncedSave(e.target.value);
 }}
 />
 </AnalysisStageSectionCard>

	 {(warningDraft?.keyPoints ?? []).length > 0 && (
	 <AnalysisStageSectionCard label="النقاط الرئيسية">
	 <AnalysisStageNumberedList items={warningDraft?.keyPoints ?? []} />
	 </AnalysisStageSectionCard>
	 )}
 </UnifiedStepShell>
 );
};

export default WarningStep2LegalWarningBodyDraft;
