import { createAsyncThunk, createSlice } from'@reduxjs/toolkit';
import api from'../../APIs/api';
import { API_ROUTES } from'../../APIs/routes';
import { axiosErrorHandler } from"@mohamy/shared-api";
import type {
 TCreateInternalRegulationFromOcrRequest,
 TCreateInternalRegulationRequest,
 TInternalRegulation,
 TUpdateInternalRegulationRequest,
} from'../../types/types';
import type { TCase } from'../cases/casesSlice';

type PagedResponse<T> = {
 data: T[];
 pageNumber: number;
 pageSize: number;
 totalRecords: number;
 totalPages: number;
};

type ApiResponse<T> = {
 succeeded: boolean;
 data: T;
 message?: string;
};

type FetchArgs = {
 search?: string;
 includeArchived?: boolean;
 page?: number;
 pageSize?: number;
};

type InternalRegulationsState = {
 regulations: TInternalRegulation[];
 totalRecords: number;
 pageNumber: number;
 totalPages: number;
 loading: 'idle' | 'pending' | 'succeeded' | 'failed';
 saving: boolean;
 ocrSaving: boolean;
 error: string | null;
};

const initialState: InternalRegulationsState = {
 regulations: [],
 totalRecords: 0,
 pageNumber: 1,
 totalPages: 1,
 loading:'idle',
 saving: false,
 ocrSaving: false,
 error: null,
};

export const fetchInternalRegulations = createAsyncThunk(
 'internalRegulations/fetchAll',
 async ({ search, includeArchived = false, page = 1, pageSize = 10 }: FetchArgs = {}, { rejectWithValue }) => {
 try {
 const params = new URLSearchParams({
 pageNumber: String(page),
 pageSize: String(pageSize),
 includeArchived: String(includeArchived),
 });
 if (search?.trim()) params.set('search', search.trim());

 const response = await api.get<ApiResponse<PagedResponse<TInternalRegulation>>>(`${API_ROUTES.GET_INTERNAL_REGULATIONS}?${params.toString()}`);
 if (response.data.succeeded) return response.data.data;
 return rejectWithValue(response.data.message ||'تعذّر جلب اللوائح الداخلية');
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const createInternalRegulation = createAsyncThunk(
 'internalRegulations/create',
 async (request: TCreateInternalRegulationRequest, { rejectWithValue }) => {
 try {
 const response = await api.post<ApiResponse<TInternalRegulation>>(API_ROUTES.CREATE_INTERNAL_REGULATION, request);
 if (response.data.succeeded) return response.data.data;
 return rejectWithValue(response.data.message ||'تعذّر حفظ اللائحة الداخلية');
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const createInternalRegulationFromOcr = createAsyncThunk(
 'internalRegulations/createFromOcr',
 async (request: TCreateInternalRegulationFromOcrRequest, { rejectWithValue }) => {
 try {
 const formData = new FormData();
 formData.append('Title', request.title);
 if (request.regulationNumber) formData.append('RegulationNumber', request.regulationNumber);
 if (request.issuingAuthority) formData.append('IssuingAuthority', request.issuingAuthority);
 if (request.summary) formData.append('Summary', request.summary);
 request.files.forEach((file) => formData.append('Files', file, file.name));

 const response = await api.post<ApiResponse<TInternalRegulation>>(API_ROUTES.CREATE_INTERNAL_REGULATION_FROM_OCR, formData, {
 headers: { 'Content-Type':'multipart/form-data' },
 });
 if (response.data.succeeded) return response.data.data;
 return rejectWithValue(response.data.message ||'تعذّر استخراج وحفظ اللائحة الداخلية');
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const updateInternalRegulation = createAsyncThunk(
 'internalRegulations/update',
 async ({ id, request }: { id: string; request: TUpdateInternalRegulationRequest }, { rejectWithValue }) => {
 try {
 const response = await api.put<ApiResponse<TInternalRegulation>>(API_ROUTES.UPDATE_INTERNAL_REGULATION(id), request);
 if (response.data.succeeded) return response.data.data;
 return rejectWithValue(response.data.message ||'تعذّر تحديث اللائحة الداخلية');
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const archiveInternalRegulation = createAsyncThunk(
 'internalRegulations/archive',
 async (id: string, { rejectWithValue }) => {
 try {
 const response = await api.patch<ApiResponse<TInternalRegulation>>(API_ROUTES.ARCHIVE_INTERNAL_REGULATION(id));
 if (response.data.succeeded) return response.data.data;
 return rejectWithValue(response.data.message ||'تعذّر أرشفة اللائحة الداخلية');
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const restoreInternalRegulation = createAsyncThunk(
 'internalRegulations/restore',
 async (id: string, { rejectWithValue }) => {
 try {
 const response = await api.patch<ApiResponse<TInternalRegulation>>(API_ROUTES.RESTORE_INTERNAL_REGULATION(id));
 if (response.data.succeeded) return response.data.data;
 return rejectWithValue(response.data.message ||'تعذّر استعادة اللائحة الداخلية');
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const updateCaseInternalRegulations = createAsyncThunk(
 'internalRegulations/updateCaseLinks',
 async ({ caseId, internalRegulationIds }: { caseId: string; internalRegulationIds: string[] }, { rejectWithValue }) => {
 try {
 const response = await api.put<ApiResponse<TCase>>(API_ROUTES.UPDATE_CASE_INTERNAL_REGULATIONS(caseId), {
 internalRegulationIds,
 });
 if (response.data.succeeded) return response.data.data;
 return rejectWithValue(response.data.message ||'تعذّر تحديث لوائح القضية');
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

const upsertRegulation = (items: TInternalRegulation[], item: TInternalRegulation) => {
 const index = items.findIndex((existing) => existing.id === item.id);
 if (index === -1) return [item, ...items];
 const next = [...items];
 next[index] = item;
 return next;
};

const internalRegulationsSlice = createSlice({
 name:'internalRegulations',
 initialState,
 reducers: {
 clearInternalRegulationError: (state) => {
 state.error = null;
 },
 },
 extraReducers: (builder) => {
 builder
 .addCase(fetchInternalRegulations.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(fetchInternalRegulations.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.regulations = action.payload.data;
 state.totalRecords = action.payload.totalRecords;
 state.pageNumber = action.payload.pageNumber;
 state.totalPages = action.payload.totalPages;
 })
 .addCase(fetchInternalRegulations.rejected, (state, action) => {
 state.loading ='failed';
 state.error = action.payload as string;
 })
 .addCase(createInternalRegulation.pending, (state) => {
 state.saving = true;
 state.error = null;
 })
 .addCase(createInternalRegulation.fulfilled, (state, action) => {
 state.saving = false;
 state.regulations = upsertRegulation(state.regulations, action.payload);
 state.totalRecords += 1;
 })
 .addCase(createInternalRegulation.rejected, (state, action) => {
 state.saving = false;
 state.error = action.payload as string;
 })
 .addCase(createInternalRegulationFromOcr.pending, (state) => {
 state.ocrSaving = true;
 state.error = null;
 })
 .addCase(createInternalRegulationFromOcr.fulfilled, (state, action) => {
 state.ocrSaving = false;
 state.regulations = upsertRegulation(state.regulations, action.payload);
 state.totalRecords += 1;
 })
 .addCase(createInternalRegulationFromOcr.rejected, (state, action) => {
 state.ocrSaving = false;
 state.error = action.payload as string;
 })
 .addCase(updateInternalRegulation.pending, (state) => {
 state.saving = true;
 state.error = null;
 })
 .addCase(updateInternalRegulation.fulfilled, (state, action) => {
 state.saving = false;
 state.regulations = upsertRegulation(state.regulations, action.payload);
 })
 .addCase(updateInternalRegulation.rejected, (state, action) => {
 state.saving = false;
 state.error = action.payload as string;
 })
 .addCase(archiveInternalRegulation.fulfilled, (state, action) => {
 state.regulations = upsertRegulation(state.regulations, action.payload);
 })
 .addCase(archiveInternalRegulation.rejected, (state, action) => {
 state.error = action.payload as string;
 })
 .addCase(restoreInternalRegulation.fulfilled, (state, action) => {
 state.regulations = upsertRegulation(state.regulations, action.payload);
 })
 .addCase(restoreInternalRegulation.rejected, (state, action) => {
 state.error = action.payload as string;
 });
 },
});

export const { clearInternalRegulationError } = internalRegulationsSlice.actions;
export default internalRegulationsSlice.reducer;
