import { createSlice } from"@reduxjs/toolkit";
import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { TLoading } from"../../types/types";

export type TClientTransaction = {
 id: string;
 clientId: string;
 type:'Income' |'Expense';
 amount: number;
 description: string;
 transactionDate: string;
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
export const thunkGetClientTransactions = createAsyncThunk<TClientTransaction[], { clientId: string }, { rejectValue: string }>('clientTransactions/getByClient',
 async ({ clientId }: { clientId: string }, thunkAPI) => {
 try {
 const response = await api.get<TClientTransaction[] | ApiResult<TClientTransaction[]>>(`/ClientTransactions/client/${clientId}`);
 return unwrapList(response.data);
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkCreateClientTransaction = createAsyncThunk<TClientTransaction, Omit<TClientTransaction,'id' |'createdAt'>, { rejectValue: string }>('clientTransactions/create',
 async (dto: Omit<TClientTransaction,'id' |'createdAt'>, thunkAPI) => {
 try {
 const response = await api.post<TClientTransaction | ApiResult<TClientTransaction>>('/ClientTransactions', dto);
 return unwrapData(response.data);
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

type TState = {
 transactions: TClientTransaction[];
 loading: TLoading;
 error: string | null;
};

const initialState: TState = {
 transactions: [],
 loading:'idle',
 error: null,
};

const clientTransactionSlice = createSlice({
 name:'clientTransactions',
 initialState,
 reducers: {},
 extraReducers(builder) {
 builder
 .addCase(thunkGetClientTransactions.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetClientTransactions.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.transactions = Array.isArray(action.payload) ? action.payload : [];
 })
 .addCase(thunkGetClientTransactions.rejected, (state, action) => {
 state.loading ='failed';
 state.error = action.payload as string;
 })
 .addCase(thunkCreateClientTransaction.pending, (state) => {
 state.loading ='pending';
 })
 .addCase(thunkCreateClientTransaction.fulfilled, (state, action) => {
 state.loading ='succeeded';
 if (!action.payload?.id) return;
 state.transactions.unshift(action.payload);
 })
 .addCase(thunkCreateClientTransaction.rejected, (state, action) => {
 state.loading ='failed';
 state.error = action.payload as string;
 });
 },
});

export default clientTransactionSlice.reducer;
