import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { TClientPOA } from"../clientsSlice";

export const thunkGetClientPOAs = createAsyncThunk<TClientPOA[], { clientId: string }>('clients/thunkGetClientPOAs',
 async ({ clientId }, thunkAPI) => {
 try {
 const response = await api.get<TClientPOA[]>(`/PowerOfAttorney/client/${clientId}`);
 return response.data;
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkGetClientPOAs;
