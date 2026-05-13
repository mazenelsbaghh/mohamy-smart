import { configureStore } from'@reduxjs/toolkit';
import authSlice from'./auth/authSlice';
import ocrSlice, { OCR_STORAGE_KEY } from'./ocr/ocrSlice';
import clientsSlice from'./clients/clientsSlice';
import casesSlice from'./cases/casesSlice';
import smartAnalysisReducer from'./analysis/smartAnalysisSlice';
import preparingStatementOfClaimsSlice from'./analysis/preparingStatementOfClaims/preparingStatementOfClaimsUnifiedSlice';
import reportSlice from'./reports/reportSlice';
import caseTypeSlice from'./caseType/caseTypeSlice';
import subscriptionSlice from'./subscription/subscriptionSlice';
import taskSlice from'./task/taskSlice';
import settingsSlice from'./settings/settingsSlice';
import aiJobsReducer from'./aiJobs/aiJobsSlice';
import agendaSlice from'./agenda/agendaSlice';
import documentHandoffReducer from'./documentHandoff/documentHandoffSlice';
import clientTransactionReducer from'./clientTransactions/clientTransactionSlice';
import appealBriefReducer from'./appealBrief/appealBriefSlice';
import adminComplaintReducer from'./adminComplaint/adminComplaintSlice';

import rulingAnalysisReducer from'./rulingAnalysis/rulingAnalysisWorkflowSlice';
import legalWarningReducer from'./legalWarning/legalWarningSlice';
import execRequestReducer from'./execRequest/execRequestSlice';
import processServerPapersReducer from'./processServerPapers/processServerPapersSlice';
import legalContractsReducer from'./legalContracts/legalContractsSlice';
import internalRegulationsReducer from'./internalRegulations/internalRegulationsSlice';

export const store = configureStore({
 reducer: {
 auth: authSlice,
 ocr: ocrSlice,
 clients: clientsSlice,
 cases: casesSlice,
 caseType: caseTypeSlice,
 reports: reportSlice,
 tasks: taskSlice,
 smartAnalysis: smartAnalysisReducer,
 preparingStatementOfClaimsSlice: preparingStatementOfClaimsSlice,
 subscription: subscriptionSlice,
 settings: settingsSlice,
 aiJobs: aiJobsReducer,
 agenda: agendaSlice,
 documentHandoffs: documentHandoffReducer,
 clientTransactions: clientTransactionReducer,
 appealBrief: appealBriefReducer,
 adminComplaint: adminComplaintReducer,

 legalWarning: legalWarningReducer,
 execRequest: execRequestReducer,
 rulingAnalysis: rulingAnalysisReducer,
 processServerPapers: processServerPapersReducer,
 legalContracts: legalContractsReducer,
 internalRegulations: internalRegulationsReducer,
 },
});

type TOcrSlice = {
 ocrResults?: Array<Record<string, unknown> & { imageUrl?: string }>;
 generatedCase?: unknown;
 extractedText?: unknown;
 manualText?: unknown;
};

const MAX_PERSISTED_OCR_IMAGE_CHARS = 3_500_000;

function sanitizeOcrResultsForStorage(ocrResults: TOcrSlice['ocrResults']) {
 let imageChars = 0;

 return ocrResults?.map((result) => {
 const imageUrl = typeof result.imageUrl ==='string' ? result.imageUrl :'';
 if (!imageUrl) return result;

 imageChars += imageUrl.length;
 if (imageChars > MAX_PERSISTED_OCR_IMAGE_CHARS) {
 return { ...result, imageUrl:'' };
 }

 return result;
 }) ?? [];
}

function saveOcrToStorage(ocr: TOcrSlice) {
 try {
 const { ocrResults, generatedCase, extractedText, manualText } = ocr;
 if (!ocrResults?.length && !generatedCase && !extractedText && !manualText) {
 localStorage.removeItem(OCR_STORAGE_KEY);
 return;
 }
 localStorage.setItem(OCR_STORAGE_KEY, JSON.stringify({
 ocrResults: sanitizeOcrResultsForStorage(ocrResults),
 generatedCase,
 extractedText,
 manualText,
 }));
 } catch {
 try {
 const fallback = {
 ocrResults: sanitizeOcrResultsForStorage(ocr.ocrResults).map((r: Record<string, unknown>) => ({ ...r, imageUrl:'' })),
 generatedCase: ocr.generatedCase,
 extractedText: ocr.extractedText,
 manualText: ocr.manualText,
 };
 localStorage.setItem(OCR_STORAGE_KEY, JSON.stringify(fallback));
 } catch { /* swallow */ }
 }
}

let prevOcrRef = store.getState().ocr;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
store.subscribe(() => {
 const current = store.getState().ocr;
 if (current === prevOcrRef) return;
 prevOcrRef = current;
 if (saveTimer) clearTimeout(saveTimer);
 saveTimer = setTimeout(() => saveOcrToStorage(current as unknown as TOcrSlice), 300);
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type for the store dispatch
export type AppDispatch = typeof store.dispatch;
