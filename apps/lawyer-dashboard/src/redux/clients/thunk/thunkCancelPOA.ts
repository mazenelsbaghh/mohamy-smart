import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { TClientPOA } from"../clientsSlice";

export const thunkCancelPOA = createAsyncThunk<TClientPOA, { poaId: string }>('clients/thunkCancelPOA',
 async ({ poaId }, thunkAPI) => {
 try {
 const response = await api.put<TClientPOA>(`/PowerOfAttorney/${poaId}/cancel`);
 return response.data;
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkCancelPOA;
