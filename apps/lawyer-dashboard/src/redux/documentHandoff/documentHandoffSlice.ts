import { createSlice } from"@reduxjs/toolkit";
import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { TLoading } from"../../types/types";

export type TDocumentHandoff = {
 id: string;
 clientId: string;
 documentName: string;
 deliveryDate: string;
 receiptFilePath?: string;
 createdAt: string;
};

type ApiResult<T> = {
 data?: T;
};

const unwrapData = <T,>(payload: T | ApiResult<T>): T => {
 if (payload && typeof payload ==='object' && 'data' in payload) {
 return (payload as ApiResult<T>).data as T;
 }
 return payload as T;
};

const unwrapList = <T,>(payload: T[] | ApiResult<T[]>): T[] => {
 const data = unwrapData<T[]>(payload);
 return Array.isArray(data) ? data : [];
};

// Thunks
export const thunkGetDocumentHandoffs = createAsyncThunk<TDocumentHandoff[], { clientId: string }, { rejectValue: string }>('documentHandoffs/getByClient',
 async ({ clientId }: { clientId: string }, thunkAPI) => {
 try {
 const response = await api.get<TDocumentHandoff[] | ApiResult<TDocumentHandoff[]>>(`/ClientDocuments/client/${clientId}`);
 return unwrapList(response.data);
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkCreateDocumentHandoff = createAsyncThunk<TDocumentHandoff, FormData, { rejectValue: string }>('documentHandoffs/create',
 async (formData: FormData, thunkAPI) => {
 try {
 const response = await api.post<TDocumentHandoff | ApiResult<TDocumentHandoff>>('/ClientDocuments', formData, {
 headers: {'Content-Type':'multipart/form-data' }
 });
 return unwrapData(response.data);
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

type TState = {
 items: TDocumentHandoff[];
 loading: TLoading;
 error: string | null;
};

const initialState: TState = {
 items: [],
 loading:'idle',
 error: null,
};

const documentHandoffSlice = createSlice({
 name:'documentHandoffs',
 initialState,
 reducers: {},
 extraReducers(builder) {
 builder
 .addCase(thunkGetDocumentHandoffs.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetDocumentHandoffs.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.items = Array.isArray(action.payload) ? action.payload : [];
 })
 .addCase(thunkGetDocumentHandoffs.rejected, (state, action) => {
 state.loading ='failed';
 state.error = action.payload as string;
 })
 .addCase(thunkCreateDocumentHandoff.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkCreateDocumentHandoff.fulfilled, (state, action) => {
 state.loading ='succeeded';
 if (!action.payload?.id) return;
 state.items.unshift(action.payload);
 })
 .addCase(thunkCreateDocumentHandoff.rejected, (state, action) => {
 state.loading ='failed';
 state.error = action.payload as string;
 });
 },
});

export default documentHandoffSlice.reducer;
