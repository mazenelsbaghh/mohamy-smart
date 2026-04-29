import { useState, useEffect, useCallback, useRef } from'react';
import { useAppDispatch, useAppSelector } from'./reduxHooks';
import { parseCaseFacts } from'../components/analysisWorkflow/analysisFacts';
import thunkUpdateCaseFacts from'../redux/cases/thunk/thunkUpdateCaseFacts';
import thunkGetSingleCase from'../redux/cases/thunk/thunkGetSingleCase';

// ── localStorage helpers ──
const SELECTED_FACTS_KEY = (prefix: string, caseId: string, runId?: string | number | null) =>
 runId != null ? `${prefix}_selected_facts_${caseId}_${runId}` : `${prefix}_selected_facts_${caseId}`;

const KNOWN_FACTS_KEY = (prefix: string, caseId: string, runId?: string | number | null) =>
 runId != null ? `${prefix}_known_facts_${caseId}_${runId}` : `${prefix}_known_facts_${caseId}`;

const loadJson = <T,>(key: string, fallback: T): T => {
 try {
 const raw = localStorage.getItem(key);
 return raw ? (JSON.parse(raw) as T) : fallback;
 } catch {
 return fallback;
 }
};
const saveJson = (key: string, value: unknown) => {
 try {
 localStorage.setItem(key, JSON.stringify(value));
 } catch {
 /* quota exceeded – silently skip */
 }
};

type UseWorkflowFactsOptions = {
  workflowPrefix: string;
  caseId: string | undefined;
  runId?: string | number | null;
};

/**
 * Shared hook that manages facts state for any analysis workflow page.
 *
 * Handles:
 * - Parsing facts from the case API response
 * - Persisting selectedFacts in localStorage (survives refresh)
 * - Tracking knownFacts so newly added facts are auto-selected after re-fetch
 * - Adding a new fact calls the backend API to persist it permanently
 * - Refreshing the case from API after adding a fact
 */
export function useWorkflowFacts({ workflowPrefix, caseId, runId }: UseWorkflowFactsOptions) {
 const dispatch = useAppDispatch();
 const { singleCase } = useAppSelector((rootState) => rootState.cases);

 const [caseFacts, setCaseFacts] = useState<string[]>([]);
  const [selectedFacts, setSelectedFacts] = useState<string[]>([]);
  const activeRunIdRef = useRef<string | number | null | undefined>(runId);

  useEffect(() => {
  if (runId != null) {
  activeRunIdRef.current = runId;
  }
  }, [runId]);

 // Parse API facts, restore persisted selection, and auto-select newly added facts
 useEffect(() => {
 if (!caseId) return;
 const parsedFacts = parseCaseFacts(singleCase?.facts);
 setCaseFacts(parsedFacts);

  const selectionKey = SELECTED_FACTS_KEY(workflowPrefix, caseId, activeRunIdRef.current);
  const knownFactsKey = KNOWN_FACTS_KEY(workflowPrefix, caseId, activeRunIdRef.current);

 const savedSelection: string[] = loadJson(selectionKey, []);
 const knownFacts: string[] = loadJson(knownFactsKey, []);

 if (savedSelection.length > 0 || knownFacts.length > 0) {
 // Detect truly new facts (never seen before — not in knownFacts)
 const trulyNewFacts = parsedFacts.filter((f) => !knownFacts.includes(f));

 // Restore saved selection (only facts that still exist) + auto-select new facts
 const restoredSelection = [
 ...savedSelection.filter((f) => parsedFacts.includes(f)),
 ...trulyNewFacts,
 ];

 if (trulyNewFacts.length > 0) {
 // Persist the updated selection and known facts immediately
 // so the next re-fetch doesn't lose the new fact's selection
 saveJson(selectionKey, restoredSelection);
 saveJson(knownFactsKey, parsedFacts);
 }

 setSelectedFacts(restoredSelection);
 } else {
 // First time: select all facts
 setSelectedFacts(parsedFacts);
 }
 }, [singleCase?.facts, caseId, workflowPrefix]);

 // Persist selectedFacts + knownFacts whenever the user changes their selection
 const hasInitializedSelection = useRef(false);
 useEffect(() => {
 if (!caseId) return;
 if (!hasInitializedSelection.current) {
 if (caseFacts.length > 0) hasInitializedSelection.current = true;
 return;
 }
 saveJson(SELECTED_FACTS_KEY(workflowPrefix, caseId, activeRunIdRef.current), selectedFacts);
 saveJson(KNOWN_FACTS_KEY(workflowPrefix, caseId, activeRunIdRef.current), caseFacts);
 }, [selectedFacts, caseId, caseFacts, workflowPrefix]);

 // Wrapped setFacts that persists the new fact to the backend API
 const handleSetCaseFacts: React.Dispatch<React.SetStateAction<string[]>> = useCallback(
 (action) => {
 setCaseFacts((prev) => {
 const next = typeof action ==='function' ? action(prev) : action;

 // Determine the newly-added fact (last element after append)
 if (caseId && next.length > prev.length) {
 const newFact = next[next.length - 1];
 if (newFact) {
 // Build new full facts string and persist to backend
 const updatedFactsString = next.join('\n\n');
 dispatch(thunkUpdateCaseFacts({ caseId, facts: updatedFactsString }))
 .unwrap()
 .then(() => {
 // Re-fetch the case to sync the singleCase state
 dispatch(thunkGetSingleCase({ id: caseId }));
 })
 .catch(() => {
 /* API failed — fact lives in local state until next save */
 });
 }
 }

 return next;
 });
 },
 [caseId, dispatch]
 );

  const resetForNewRun = useCallback((newRunId: string | number) => {
    if (caseId) {
      localStorage.removeItem(SELECTED_FACTS_KEY(workflowPrefix, caseId, activeRunIdRef.current));
      localStorage.removeItem(KNOWN_FACTS_KEY(workflowPrefix, caseId, activeRunIdRef.current));
    }
    setSelectedFacts([]);
    activeRunIdRef.current = newRunId;
  }, [workflowPrefix, caseId]);

  return {
    caseFacts,
    setCaseFacts: handleSetCaseFacts,
    selectedFacts,
    setSelectedFacts,
    resetForNewRun,
  };
}
