import { createSlice } from"@reduxjs/toolkit";
import type { PayloadAction } from"@reduxjs/toolkit";
import type { TLoading } from"../../types/types";
import thunkAddNewCase from"./thunk/thunkAddNewCase";
import { isString } from"@mohamy/shared-utils";
import thunkGetAllCases from"./thunk/thunkGetAllCases";
import thunkGetSingleCase from"./thunk/thunkGetSingleCase";
import thunkSetCaseArchived from"./thunk/thunkSetCaseArchived";
import thunkUpdateCase from"./thunk/thunkUpdateCase";
import type { TInternalRegulationSummary } from"../../types/types";


export type TCase = {
 id: string | number;
 title: string;
 number: string;
 caseTypeId: number,
 caseTypeIds?: number[];
 caseTypeName: string;
 caseTypeNames?: string[];
 court: string;
 clientName: string;
 apponentName: string;
 defendingParty: string;
 description: string;
 facts: string;
 legalClaims: string;
 status: number | string;
 clientId: string,
 powerOfAttorneyId?: string | null,
 internalRegulations?: TInternalRegulationSummary[];
 isActive?: boolean;
 creationDate: string;
};


type TInitialState = {
 cases: TCase[];
 singleCase: TCase | null;
 pageNumber: number;
 totalPages: number;
 totalRecords: number;
 loading: TLoading;
 error: string | null;
 lastFetchedAt: number | null;
}

const normalizePaginatedCases = (payload: unknown) => {
 const page = payload as {
 data?: unknown;
 items?: unknown;
 page?: number;
 pageNumber?: number;
 totalCount?: number;
 totalRecords?: number;
 totalPages?: number;
 };
 const cases = Array.isArray(page?.data)
 ? page.data
 : Array.isArray(page?.items)
 ? page.items
 : Array.isArray(payload)
 ? payload
 : [];

 return {
 cases: cases as TCase[],
 pageNumber: page?.pageNumber ?? page?.page ?? 1,
 totalPages: page?.totalPages ?? 1,
 totalRecords: page?.totalRecords ?? page?.totalCount ?? cases.length,
 };
};

const initialState: TInitialState = {
 cases: [],
 singleCase: null,
 pageNumber: 1,
 totalPages: 1,
 totalRecords: 0,
 loading:'idle',
 error: null,
 lastFetchedAt: null,
}

const casesSlice = createSlice({
 name:'cases',
 initialState,
 reducers: {
 setPageNumber(state, action) {
 state.pageNumber = action.payload;
 },
 clearSingleCase(state) {
 state.singleCase = null;
 state.loading ='idle';
 state.error = null;
 },
 setSingleCase(state, action: PayloadAction<TCase>) {
 state.singleCase = action.payload;
 state.loading ='succeeded';
 state.error = null;
 },
 },
 extraReducers(builder) {
 builder
 // Add New Case
 .addCase(thunkAddNewCase.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkAddNewCase.fulfilled, (state) => {
 state.loading ='succeeded';
 // state.cases.unshift(action.payload);
 })
 .addCase(thunkAddNewCase.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Get All Cases
 .addCase(thunkGetAllCases.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 state.cases = [];
 })
 .addCase(thunkGetAllCases.fulfilled, (state, action) => {
 const result = normalizePaginatedCases(action.payload);
 state.loading ='succeeded';
 state.cases = result.cases;
 state.pageNumber = result.pageNumber;
 state.totalPages = result.totalPages;
 state.totalRecords = result.totalRecords;
 state.lastFetchedAt = Date.now();
 })
 .addCase(thunkGetAllCases.rejected, (state, action) => {
 state.loading ='failed';
 state.cases = [];
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Get single Cases
 .addCase(thunkGetSingleCase.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetSingleCase.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.singleCase = action.payload;

 })
 .addCase(thunkGetSingleCase.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Archive/restore case
 .addCase(thunkSetCaseArchived.fulfilled, (state, action) => {
 const updatedCase = action.payload;
 const updatedCaseId = updatedCase.id.toString();
 state.cases = state.cases.filter((caseItem) => caseItem.id.toString() !== updatedCaseId);
 if (state.singleCase?.id.toString() === updatedCaseId) {
 state.singleCase = updatedCase;
 }
 })
 .addCase(thunkSetCaseArchived.rejected, (state, action) => {
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 .addCase(thunkUpdateCase.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkUpdateCase.fulfilled, (state, action) => {
 const updatedCase = action.payload;
 const updatedCaseId = updatedCase.id.toString();
 state.loading ='succeeded';
 state.singleCase = updatedCase;
 state.cases = state.cases.map((caseItem) => caseItem.id.toString() === updatedCaseId ? updatedCase : caseItem);
 })
 .addCase(thunkUpdateCase.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 },
});

export const { setPageNumber, clearSingleCase, setSingleCase } = casesSlice.actions;

export default casesSlice.reducer;
