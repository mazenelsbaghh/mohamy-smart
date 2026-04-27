import { createSlice, createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../APIs/api';
import { API_ROUTES } from'../../APIs/routes';
import { axiosErrorHandler } from"@mohamy/shared-api";
import type {
 TCreateLegalContractRequest,
 TLegalContractDetails,
 TContractTypeOption,
 TLegalContract,
} from'../../types/types';

export interface PagedResponse<T> {
 data: T[];
 pageNumber: number;
 pageSize: number;
 totalRecords: number;
 totalPages: number;
}

export interface LegalContractsState {
 // Catalog
 contractTypes: TContractTypeOption[];
 isLoadingTypes: boolean;
 
 // List
 contracts: TLegalContract[];
 totalContracts: number;
 isLoadingContracts: boolean;
 
 // Detail / Create
 currentContract: TLegalContractDetails | null;
 isGenerating: boolean;
 isFetchingDetail: boolean;
 
 // Errors
 error: string | null;
}

const initialState: LegalContractsState = {
 contractTypes: [],
 isLoadingTypes: false,
 contracts: [],
 totalContracts: 0,
 isLoadingContracts: false,
 currentContract: null,
 isGenerating: false,
 isFetchingDetail: false,
 error: null,
};

// Fetch available contract types
export const fetchContractTypes = createAsyncThunk('legalContracts/fetchTypes',
 async (_, { rejectWithValue }) => {
 try {
 const response = await api.get<{ succeeded: boolean; data: TContractTypeOption[]; message: string }>(API_ROUTES.GET_LEGAL_CONTRACT_TYPES);
 if (response.data.succeeded) {
 return response.data.data;
 }
 return rejectWithValue(response.data.message ||'فشل في جلب أنواع العقود');
 } catch (error: unknown) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

// Create and generate a new contract
export const createLegalContract = createAsyncThunk('legalContracts/create',
 async (request: TCreateLegalContractRequest, { rejectWithValue }) => {
 try {
 const response = await api.post<{ succeeded: boolean; data: TLegalContractDetails; message: string }>(API_ROUTES.CREATE_LEGAL_CONTRACT, request);
 if (response.data.succeeded) {
 return response.data.data;
 }
 return rejectWithValue(response.data.message ||'فشل في إنشاء العقد');
 } catch (error: unknown) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

// Fetch paginated list of contracts
export const fetchLegalContracts = createAsyncThunk('legalContracts/fetchList',
 async ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number }, { rejectWithValue }) => {
 try {
 const url = `${API_ROUTES.GET_LEGAL_CONTRACTS}?pageNumber=${page}&pageSize=${pageSize}`;
 const response = await api.get<{ succeeded: boolean; data: PagedResponse<TLegalContract>; message: string }>(url);
 if (response.data.succeeded) {
 return response.data.data;
 }
 return rejectWithValue(response.data.message ||'فشل في جلب قائمة العقود');
 } catch (error: unknown) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

// Fetch contract details
export const fetchContractDetails = createAsyncThunk('legalContracts/fetchDetails',
 async (contractId: string, { rejectWithValue }) => {
 try {
 const response = await api.get<{ succeeded: boolean; data: TLegalContractDetails; message: string }>(API_ROUTES.GET_LEGAL_CONTRACT_DETAILS(contractId));
 if (response.data.succeeded) {
 return response.data.data;
 }
 return rejectWithValue(response.data.message ||'فشل في جلب تفاصيل العقد');
 } catch (error: unknown) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

const legalContractsSlice = createSlice({
 name:'legalContracts',
 initialState,
 reducers: {
 clearCurrentContract: (state) => {
 state.currentContract = null;
 },
 clearErrors: (state) => {
 state.error = null;
 }
 },
 extraReducers: (builder) => {
 // fetchContractTypes
 builder.addCase(fetchContractTypes.pending, (state) => {
 state.isLoadingTypes = true;
 state.error = null;
 });
 builder.addCase(fetchContractTypes.fulfilled, (state, action) => {
 state.isLoadingTypes = false;
 state.contractTypes = action.payload;
 });
 builder.addCase(fetchContractTypes.rejected, (state, action) => {
 state.isLoadingTypes = false;
 state.error = action.payload as string;
 });

 // createLegalContract
 builder.addCase(createLegalContract.pending, (state) => {
 state.isGenerating = true;
 state.error = null;
 });
 builder.addCase(createLegalContract.fulfilled, (state, action) => {
 state.isGenerating = false;
 state.currentContract = action.payload;
 // Prepend to list if loaded
 state.contracts = [action.payload as unknown as TLegalContract, ...state.contracts];
 });
 builder.addCase(createLegalContract.rejected, (state, action) => {
 state.isGenerating = false;
 state.error = action.payload as string;
 });

 // fetchLegalContracts
 builder.addCase(fetchLegalContracts.pending, (state) => {
 state.isLoadingContracts = true;
 state.error = null;
 });
 builder.addCase(fetchLegalContracts.fulfilled, (state, action) => {
 state.isLoadingContracts = false;
 state.contracts = action.payload.data;
 state.totalContracts = action.payload.totalRecords;
 });
 builder.addCase(fetchLegalContracts.rejected, (state, action) => {
 state.isLoadingContracts = false;
 state.error = action.payload as string;
 });

 // fetchContractDetails
 builder.addCase(fetchContractDetails.pending, (state) => {
 state.isFetchingDetail = true;
 state.error = null;
 });
 builder.addCase(fetchContractDetails.fulfilled, (state, action) => {
 state.isFetchingDetail = false;
 state.currentContract = action.payload;
 });
 builder.addCase(fetchContractDetails.rejected, (state, action) => {
 state.isFetchingDetail = false;
 state.error = action.payload as string;
 });
 },
});

export const { clearCurrentContract, clearErrors } = legalContractsSlice.actions;
export default legalContractsSlice.reducer;
