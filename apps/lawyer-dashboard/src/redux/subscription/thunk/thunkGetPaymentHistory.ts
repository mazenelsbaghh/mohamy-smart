import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import { API_ROUTES } from'../../../APIs/routes';
import type { TPaymentAttempt } from'../../../types/types';
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkGetPaymentHistory = createAsyncThunk<TPaymentAttempt[], void, { rejectValue: string }>('subscription/getPaymentHistory',
 async (_, thunkAPI) => {
 try {
 const response = await api.get(API_ROUTES.GET_PAYMENT_HISTORY, {
 params: { pageNumber: 1, pageSize: 20 },
 });
 return response.data.data.items;
 } catch (error) {
 return thunkAPI.rejectWithValue(
 axiosErrorHandler(error)
 );
 }
 }
);

export default thunkGetPaymentHistory;
