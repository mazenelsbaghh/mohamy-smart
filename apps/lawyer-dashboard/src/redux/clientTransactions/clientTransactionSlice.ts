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

// Thunks
export const thunkGetClientTransactions = createAsyncThunk('clientTransactions/getByClient',
 async ({ clientId }: { clientId: string }, thunkAPI) => {
 try {
 const response = await api.get(`/ClientTransactions/client/${clientId}`);
 return response.data;
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export const thunkCreateClientTransaction = createAsyncThunk('clientTransactions/create',
 async (dto: Omit<TClientTransaction,'id' |'createdAt'>, thunkAPI) => {
 try {
 const response = await api.post('/ClientTransactions', dto);
 return response.data;
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
 state.transactions = action.payload;
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
 state.transactions.unshift(action.payload);
 })
 .addCase(thunkCreateClientTransaction.rejected, (state, action) => {
 state.loading ='failed';
 state.error = action.payload as string;
 });
 },
});

export default clientTransactionSlice.reducer;
