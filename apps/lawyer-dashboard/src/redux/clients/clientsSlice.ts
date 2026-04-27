import { createSlice } from"@reduxjs/toolkit";
import type { TClient, TLoading } from"../../types/types";
import thunkGetAllClients from"./thunk/thunkGetAllClients";
import { isString } from"@mohamy/shared-utils";
import thunkGetClientDetails from"./thunk/thunkGetClientDetails";
import thunkAddNewClient from"./thunk/thunkAddNewClient";
import thunkUpdateClient from"./thunk/thunkUpdateClient";
import thunkGetClientPOAs from"./thunk/thunkGetClientPOAs";
import thunkCancelPOA from"./thunk/thunkCancelPOA";

type TClientCaseSummary = {
 id: string;
 title: string;
 number: string;
 court: string;
 status:'Active' |'Closed';
 creationDate: string;
};

type TClientFile = {
 id: string;
 fileName: string;
 filePath: string;
 contentType: string;
 fileSize: number;
 creationDate: string;
};

type TClientDetails = {
 id: string;
 clientName: string;
 phoneNumber: string;
 email: string | null;
 notes: string | null;
 address: string | null;
 nationalId: string | null;
 governorate: string | null;
 lawyerId: string;
 caseId: string | null;
 creationDate: string;
 cases: TClientCaseSummary[];
 files: TClientFile[];
}

export type TClientPOA = {
 id: string;
 number: string;
 title: string;
 issuingAuthority: string;
 issueDate: string;
 cancellationDate?: string;
 isCanceled: boolean;
};

type TInitialState = {
 clients: TClient[];
 pageNumber: number;
 totalRecords: number;
 totalPages: number;
 clientDetails: TClientDetails | null;
 clientPOAs: TClientPOA[];
 loading: TLoading;
 updateLoading: TLoading;
 poaLoading: TLoading;
 error: string | null;
 lastFetchedAt: number | null;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
 typeof v ==='object' && v !== null && !Array.isArray(v);

const normalizePaginatedClients = (payload: unknown) => {
 if (payload != null && !isPlainObject(payload) && !Array.isArray(payload)) {
		return { data: [], totalCount: 0 };
	}
 const page = (isPlainObject(payload) ? payload : {}) as {
 data?: unknown;
 items?: unknown;
 page?: number;
 pageNumber?: number;
 totalCount?: number;
 totalRecords?: number;
 totalPages?: number;
 };
 const clients = Array.isArray(page?.items)
 ? page.items
 : Array.isArray(page?.data)
 ? page.data
 : Array.isArray(payload)
 ? payload
 : [];

 return {
 clients: clients as TClient[],
 pageNumber: page?.page ?? page?.pageNumber ?? 1,
 totalPages: page?.totalPages ?? 1,
 totalRecords: page?.totalCount ?? page?.totalRecords ?? clients.length,
 };
};

const normalizeClientDetails = (payload: TClientDetails): TClientDetails => ({
 ...payload,
 cases: Array.isArray(payload?.cases) ? payload.cases : [],
 files: Array.isArray(payload?.files) ? payload.files : [],
});


const initialState: TInitialState = {
 clients: [],
 pageNumber: 1,
 totalRecords: 0,
 totalPages: 0,
 clientDetails: null,
 clientPOAs: [],
 loading:'idle',
 updateLoading:'idle',
 poaLoading:'idle',
 error: null,
 lastFetchedAt: null,
}

const clientsSlice = createSlice({
 name:'clients',
 initialState,
 reducers: {},
 extraReducers(builder) {
 builder
 .addCase(thunkGetAllClients.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetAllClients.fulfilled, (state, action) => {
 const result = normalizePaginatedClients(action.payload);
 state.loading ='succeeded';
 state.clients = result.clients;
 state.pageNumber = result.pageNumber;
 state.totalRecords = result.totalRecords;
 state.totalPages = result.totalPages;
 state.lastFetchedAt = Date.now();
 })
 .addCase(thunkGetAllClients.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Get Client Details
 .addCase(thunkGetClientDetails.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetClientDetails.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.clientDetails = normalizeClientDetails(action.payload);
 })
 .addCase(thunkGetClientDetails.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Add New Client
 .addCase(thunkAddNewClient.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkAddNewClient.fulfilled, (state) => {
 state.loading ='succeeded';
 })
 .addCase(thunkAddNewClient.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Update Client
 .addCase(thunkUpdateClient.pending, (state) => {
 state.updateLoading ='pending';
 state.error = null;
 })
 .addCase(thunkUpdateClient.fulfilled, (state, action) => {
 state.updateLoading ='succeeded';
 if (state.clientDetails && state.clientDetails.id === action.payload.id) {
 state.clientDetails = {
 ...state.clientDetails,
 ...action.payload
 };
 }
 })
 .addCase(thunkUpdateClient.rejected, (state, action) => {
 state.updateLoading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Get Client POAs
 .addCase(thunkGetClientPOAs.pending, (state) => {
 state.poaLoading ='pending';
 state.error = null;
 })
 .addCase(thunkGetClientPOAs.fulfilled, (state, action) => {
 state.poaLoading ='succeeded';
 state.clientPOAs = action.payload;
 })
 .addCase(thunkGetClientPOAs.rejected, (state, action) => {
 state.poaLoading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Cancel POA
 .addCase(thunkCancelPOA.pending, (state) => {
 state.poaLoading ='pending';
 state.error = null;
 })
 .addCase(thunkCancelPOA.fulfilled, (state, action) => {
 state.poaLoading ='succeeded';
 // Update the POA in the list to be canceled
 const idx = state.clientPOAs.findIndex((p) => p.id === action.payload.id);
 if (idx !== -1) {
 state.clientPOAs[idx] = action.payload;
 }
 })
 .addCase(thunkCancelPOA.rejected, (state, action) => {
 state.poaLoading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })

 },
});

export default clientsSlice.reducer;
