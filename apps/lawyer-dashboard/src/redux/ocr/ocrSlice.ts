import { createSlice } from"@reduxjs/toolkit";
import type { TLoading } from"../../types/types";
import thunkOcrExtract from"./thunk/thunkOcrExtract";
import { isString } from"@mohamy/shared-utils";
import thunkGenerateCase from"./thunk/thunkGenerateCase";

type TCaseData = {
 title: string;
 number: string;
 CaseTypeIds: number[]; // legacy field (may be empty)
 caseTypeIds: number[]; // matched IDs returned by AI from the available types list
 types: string[]; // raw type names from AI (e.g. ["جنحة","مدني"])
 court: string;
 clientName: string;
 opponentName: string;
 apponentName: string;
 description: string;
 facts: string;
 legalClaims: string;
 IsExistedClient: boolean;
 clientId: string;
} | null;

export type TOcrPersistedResult = {
 fileName: string;
 text: string;
 fileType:'image' |'pdf' |'pdf-page' |'word';
 pageNumber?: number;
 totalPages?: number;
 imageUrl?: string;
};

type TInitialState = {
 image: string[],
 extractedText: string | null;
 generatedCase: TCaseData | null,
 ocrResults: TOcrPersistedResult[],
 manualText: string,
 loading: TLoading,
 error: string | null,
}

export const OCR_STORAGE_KEY ='mohamy_ocr_session';

const loadPersistedOcr = (): Partial<TInitialState> | null => {
 try {
 const raw = localStorage.getItem(OCR_STORAGE_KEY);
 if (!raw) return null;
 const data = JSON.parse(raw);
 return {
 ocrResults: data.ocrResults ?? [],
 generatedCase: data.generatedCase ?? null,
 extractedText: data.extractedText ?? null,
 manualText: data.manualText ??'',
 };
 } catch {
 return null;
 }
};

const persisted = loadPersistedOcr();

const initialState: TInitialState = {
 image: [],
 extractedText: persisted?.extractedText ?? null,
 generatedCase: persisted?.generatedCase ?? null,
 ocrResults: persisted?.ocrResults ?? [],
 manualText: persisted?.manualText ??'',
 loading:'idle',
 error: null,
}


const ocrSlice = createSlice({
 name:'ocr',
 initialState,
 reducers: {
 setImage: (state, action) => {
 state.image = action.payload;
 },
 setOcrResults: (state, action) => {
 state.ocrResults = action.payload;
 },
 setManualText: (state, action) => {
 state.manualText = action.payload;
 },
 clearOcrSession: (state) => {
 state.ocrResults = [];
 state.generatedCase = null;
 state.extractedText = null;
 state.manualText ='';
 },
 },
 extraReducers(builder) {
 builder
 // thunkOcrExtract
 .addCase(thunkOcrExtract.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkOcrExtract.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.extractedText = Array.isArray(action.payload) ? action.payload.join('\n') : (action.payload as unknown as string);
 })
 .addCase(thunkOcrExtract.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // thunkGenerateCase
 .addCase(thunkGenerateCase.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGenerateCase.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.generatedCase = action.payload
 })
 .addCase(thunkGenerateCase.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 },
});

export const { setImage, setOcrResults, setManualText, clearOcrSession } = ocrSlice.actions;

export default ocrSlice.reducer;
