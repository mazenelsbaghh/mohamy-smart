import { createAsyncThunk, createSlice } from'@reduxjs/toolkit';
import api from'../../APIs/api';
import type { TLoading } from'../../types/types';
import { axiosErrorHandler } from"@mohamy/shared-api";

export type ProcessServerPaperType = 1 | 2 | 3 | 4 | 99;
export type ProcessServerPaperStatus = 1 | 2 | 3 | 4;

export const PSP_TYPE_LABELS: Record<ProcessServerPaperType, string> = {
 1:'إنذار',
 2:'إعلان',
 3:'تكليف بالحضور',
 4:'تنفيذ',
 99:'أخرى',
};

export const PSP_STATUS_LABELS: Record<ProcessServerPaperStatus, string> = {
 1:'قيد التنفيذ',
 2:'تم الإعلان',
 3:'فشل الإعلان',
 4:'معاد',
};

export type TProcessServerPaper = {
 id: string;
 lawyerId: string;
 clientId?: string | null;
 clientName?: string | null;
 caseId?: string | null;
 caseTitle?: string | null;
 paperNumber: string;
 paperType: ProcessServerPaperType;
 subject: string;
 issueDate: string;
 servedDate?: string | null;
 processServerName: string;
 recipientName: string;
 recipientAddress: string;
 status: ProcessServerPaperStatus;
 notes: string;
 filePath?: string | null;
 fileName?: string | null;
 contentType?: string | null;
 fileSize?: number | null;
 creationDate: string;
};

export type TPSPFilters = {
 status?: ProcessServerPaperStatus;
 type?: ProcessServerPaperType;
 clientId?: string;
 caseId?: string;
 search?: string;
};

export type TCreatePSPPayload = {
 clientId?: string | null;
 caseId?: string | null;
 paperNumber: string;
 paperType: ProcessServerPaperType;
 subject: string;
 issueDate: string;
 servedDate?: string | null;
 processServerName: string;
 recipientName: string;
 recipientAddress: string;
 status?: ProcessServerPaperStatus;
 notes?: string;
};

export const thunkGetPapers = createAsyncThunk('processServerPapers/getAll',
 async (filters: TPSPFilters | undefined, thunkAPI) => {
 try {
 const response = await api.get('/ProcessServerPaper', { params: filters });
 return response.data as TProcessServerPaper[];
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkCreatePaper = createAsyncThunk('processServerPapers/create',
 async (payload: TCreatePSPPayload, thunkAPI) => {
 try {
 const response = await api.post('/ProcessServerPaper', payload);
 return response.data as TProcessServerPaper;
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkUpdatePaper = createAsyncThunk('processServerPapers/update',
 async ({ id, payload }: { id: string; payload: TCreatePSPPayload }, thunkAPI) => {
 try {
 const response = await api.put(`/ProcessServerPaper/${id}`, payload);
 return response.data as TProcessServerPaper;
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkDeletePaper = createAsyncThunk('processServerPapers/delete',
 async ({ id }: { id: string }, thunkAPI) => {
 try {
 await api.delete(`/ProcessServerPaper/${id}`);
 return id;
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkUploadPaperAttachment = createAsyncThunk('processServerPapers/uploadAttachment',
 async ({ id, file }: { id: string; file: File }, thunkAPI) => {
 try {
 const formData = new FormData();
 formData.append('file', file);
 const response = await api.post(`/ProcessServerPaper/${id}/attachment`, formData, {
 headers: {'Content-Type':'multipart/form-data' },
 });
 return response.data as TProcessServerPaper;
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkMarkPaperServed = createAsyncThunk('processServerPapers/markServed',
 async ({ id, servedDate }: { id: string; servedDate?: string }, thunkAPI) => {
 try {
 const response = await api.post(`/ProcessServerPaper/${id}/mark-served`, { servedDate });
 return response.data as TProcessServerPaper;
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

type TState = {
 items: TProcessServerPaper[];
 loading: TLoading;
 mutationLoading: TLoading;
 error: string | null;
};

const initialState: TState = {
 items: [],
 loading:'idle',
 mutationLoading:'idle',
 error: null,
};

const processServerPapersSlice = createSlice({
 name:'processServerPapers',
 initialState,
 reducers: {},
 extraReducers: (builder) => {
 const replaceItem = (state: TState, payload: TProcessServerPaper) => {
 const idx = state.items.findIndex((paper) => paper.id === payload.id);
 if (idx !== -1) {
 state.items[idx] = payload;
 return;
 }
 state.items.unshift(payload);
 };

 builder
 .addCase(thunkGetPapers.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetPapers.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.items = action.payload;
 })
 .addCase(thunkGetPapers.rejected, (state, action) => {
 state.loading ='failed';
 state.error = action.payload as string;
 })
 .addCase(thunkCreatePaper.pending, (state) => {
 state.mutationLoading ='pending';
 })
 .addCase(thunkCreatePaper.fulfilled, (state, action) => {
 state.mutationLoading ='succeeded';
 state.items.unshift(action.payload);
 })
 .addCase(thunkCreatePaper.rejected, (state, action) => {
 state.mutationLoading ='failed';
 state.error = action.payload as string;
 })
 .addCase(thunkUpdatePaper.pending, (state) => {
 state.mutationLoading ='pending';
 })
 .addCase(thunkUpdatePaper.fulfilled, (state, action) => {
 state.mutationLoading ='succeeded';
 replaceItem(state, action.payload);
 })
 .addCase(thunkUpdatePaper.rejected, (state, action) => {
 state.mutationLoading ='failed';
 state.error = action.payload as string;
 })
 .addCase(thunkUploadPaperAttachment.pending, (state) => {
 state.mutationLoading ='pending';
 })
 .addCase(thunkUploadPaperAttachment.fulfilled, (state, action) => {
 state.mutationLoading ='succeeded';
 replaceItem(state, action.payload);
 })
 .addCase(thunkUploadPaperAttachment.rejected, (state, action) => {
 state.mutationLoading ='failed';
 state.error = action.payload as string;
 })
 .addCase(thunkMarkPaperServed.pending, (state) => {
 state.mutationLoading ='pending';
 })
 .addCase(thunkMarkPaperServed.fulfilled, (state, action) => {
 state.mutationLoading ='succeeded';
 replaceItem(state, action.payload);
 })
 .addCase(thunkMarkPaperServed.rejected, (state, action) => {
 state.mutationLoading ='failed';
 state.error = action.payload as string;
 })
 .addCase(thunkDeletePaper.pending, (state) => {
 state.mutationLoading ='pending';
 })
 .addCase(thunkDeletePaper.fulfilled, (state, action) => {
 state.mutationLoading ='succeeded';
 state.items = state.items.filter((paper) => paper.id !== action.payload);
 })
 .addCase(thunkDeletePaper.rejected, (state, action) => {
 state.mutationLoading ='failed';
 state.error = action.payload as string;
 });
 },
});

export default processServerPapersSlice.reducer;
