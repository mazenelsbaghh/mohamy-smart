import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { TClientPOA } from"../clientsSlice";

type ApiResult<T> = {
 data?: T;
};

const unwrapData = <T,>(payload: T | ApiResult<T>): T => {
 if (payload && typeof payload ==='object' && 'data' in payload) {
 return (payload as ApiResult<T>).data as T;
 }
 return payload as T;
};

export const thunkCancelPOA = createAsyncThunk<TClientPOA, { poaId: string }>('clients/thunkCancelPOA',
 async ({ poaId }, thunkAPI) => {
 try {
 const response = await api.put<TClientPOA | ApiResult<TClientPOA>>(`/PowerOfAttorney/${poaId}/cancel`);
 return unwrapData(response.data);
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkCancelPOA;
