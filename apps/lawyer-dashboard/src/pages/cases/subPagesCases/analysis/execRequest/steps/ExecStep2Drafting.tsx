import { parseJobResult } from"@mohamy/shared-utils";
import { useParams } from'react-router-dom';
import { IoArrowBackOutline } from'react-icons/io5';
import { useAppDispatch, useAppSelector } from'../../../../../../hooks/reduxHooks';
import { hydrateStep } from'../../../../../../redux/execRequest/execRequestSlice';
import { useAnalysisStep } from'../../../../../../hooks/useAnalysisStep';
import {
 UnifiedStepShell,
 AnalysisStageActionButton,
 AnalysisStageNumberedList,
 AnalysisStageSectionCard,
 AnalysisStageSidebarCard,
} from'../../../../../../components/analysisWorkflow/UnifiedStepShell';
import { buildAnalysisInput } from'../../../../../../components/analysisWorkflow/analysisFacts';
import { useWorkflowAutoSave } from'../../../../../../hooks/useWorkflowAutoSave';
import { execRequestThunks } from'../../../../../../redux/execRequest/execRequestSlice';
import { useState, useEffect } from'react';

type TExecStep2Props = {
 nextStep: () => void;
 selectedFacts: string[];
};

const ExecStep2Drafting = ({ nextStep, selectedFacts }: TExecStep2Props) => {
 const { id: caseId } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 
 const classification = useAppSelector((s) => s.execRequest.outputs[1]);
 const drafting = useAppSelector((s) => s.execRequest.outputs[2]);


 const { isLoading, hasFailed, errorMessage, retry, charge } = useAnalysisStep({
 parseResult: parseJobResult,
 caseId: caseId as string,
 stepType:'ExecRequestDrafting',
 autoSubmit: Boolean(classification), // Only run if Phase 1 classification is there
 inputJson: buildAnalysisInput(caseId ||'', selectedFacts),
 onHydrate: (parsed) => dispatch(hydrateStep({ stepNumber: 2, result: parsed })),
 });

 const [localText, setLocalText] = useState('');
 const workflowId = useAppSelector(s => s.execRequest.workflowId);
 const lastSavedAt = useAppSelector(s => s.execRequest.lastSavedAt);
 const lastSaved = lastSavedAt
 ? new Date(lastSavedAt).toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' })
 : null;

 useEffect(() => {
 if (drafting?.requestBody && !localText) {
 setLocalText(drafting.requestBody);
 }
 }, [drafting?.requestBody, localText]);

 const { isAutoSaving } = useAppSelector(s => s.execRequest.loadingState);

 const { debouncedSave } = useWorkflowAutoSave({
 mode:'immediate',
 onSave: async (payload) => {
 if (!workflowId || !drafting) return;
 await dispatch(execRequestThunks.saveDraftStep({
 routeId: workflowId,
 stepNumber: 2,
 payload: { ...drafting, requestBody: payload }
 })).unwrap();
 }
 });

 return (
 <UnifiedStepShell
 isLoading={isLoading && !drafting}
 hasFailed={hasFailed && !drafting}
 errorMessage={errorMessage}
 onRetry={retry}
 charge={charge}
 title={drafting ? "مسودة موضوع الطلب التنفيذي" : undefined}
 sidebar={drafting ? (
 <>
 <AnalysisStageSidebarCard
 label={isAutoSaving ?'جارِ الحفظ...' : (lastSaved ?'المبررات القانونية' :'المبررات القانونية')}
 value={drafting.keyArguments?.length || 0}
 valueClassName="text-5xl"
 description={lastSaved ? `آخر حفظ ${lastSaved}` :"تم استكمال المبررات ومتن الطلب التنفيذي بنجاح. الخطوة التالية هي دمج المخرجات في مسودة واحدة نهائية."}
 />
 <AnalysisStageActionButton
 label="الطلب النهائي ومرفقاته"
 icon={IoArrowBackOutline}
 onClick={nextStep}
 />
 </>
 ) : undefined}
 >
 {drafting && (
 <>
 <AnalysisStageSectionCard label="متن الطلب وموضوعه">
 <textarea
 className="text-sm leading-[2.2] app-text-muted w-full outline-none bg-transparent resize-none border border-transparent hover:app-border-strong focus:border-[var(--main-color)] focus:ring-1 focus:ring-[var(--main-color)]/20 rounded p-2 transition-colors min-h-[300px]"

 value={localText}
 onChange={(e) => {
 setLocalText(e.target.value);
 debouncedSave(e.target.value);
 }}
 />
 </AnalysisStageSectionCard>

 {drafting.keyArguments?.length > 0 && (
 <AnalysisStageSectionCard label="المبررات القانونية والعملية لتنفيذ الطلب">
 <AnalysisStageNumberedList items={drafting.keyArguments} />
 </AnalysisStageSectionCard>
 )}
 </>
 )}
 </UnifiedStepShell>
 );
};

export default ExecStep2Drafting;
