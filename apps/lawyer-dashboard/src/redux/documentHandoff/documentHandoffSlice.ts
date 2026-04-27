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

// Thunks
export const thunkGetDocumentHandoffs = createAsyncThunk('documentHandoffs/getByClient',
 async ({ clientId }: { clientId: string }, thunkAPI) => {
 try {
 const response = await api.get(`/ClientDocuments/client/${clientId}`);
 return response.data;
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkCreateDocumentHandoff = createAsyncThunk('documentHandoffs/create',
 async (formData: FormData, thunkAPI) => {
 try {
 const response = await api.post('/ClientDocuments', formData, {
 headers: {'Content-Type':'multipart/form-data' }
 });
 return response.data;
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
 state.items = action.payload;
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
 state.items.unshift(action.payload);
 })
 .addCase(thunkCreateDocumentHandoff.rejected, (state, action) => {
 state.loading ='failed';
 state.error = action.payload as string;
 });
 },
});

export default documentHandoffSlice.reducer;
