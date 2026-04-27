import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { ModelUsage } from"../../../types";
import { ADMIN_ROUTES } from"../../../APIs/routes";

const fetchModelUsage = createAsyncThunk('aiUsage/fetchModelUsage',
 async (params: { from?: string; to?: string } | void, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const queryParams = new URLSearchParams();
 if (params?.from) queryParams.append('from', params.from);
 if (params?.to) queryParams.append('to', params.to);
 const query = queryParams.toString();
 const url = query
 ? `${ADMIN_ROUTES.AI_USAGE.MODELS}?${query}`
 : ADMIN_ROUTES.AI_USAGE.MODELS;
 const res = await api.get<{ data: ModelUsage[] }>(url);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchModelUsage;
