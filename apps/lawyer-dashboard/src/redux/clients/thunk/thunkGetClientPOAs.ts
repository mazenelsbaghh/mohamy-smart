import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { TClientPOA } from"../clientsSlice";

type ApiResult<T> = {
 data?: T;
};

const unwrapList = <T,>(payload: T[] | ApiResult<T[]>): T[] => {
 if (Array.isArray(payload)) return payload;
 return Array.isArray(payload?.data) ? payload.data : [];
};

export const thunkGetClientPOAs = createAsyncThunk<TClientPOA[], { clientId: string }>('clients/thunkGetClientPOAs',
 async ({ clientId }, thunkAPI) => {
 try {
 const response = await api.get<TClientPOA[] | ApiResult<TClientPOA[]>>(`/PowerOfAttorney/client/${clientId}`);
 return unwrapList(response.data);
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkGetClientPOAs;
