import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import { ADMIN_ROUTES } from"../../../APIs/routes";
import type { LawyerUsage } from"../../../types";

type LawyerUsagePagedResponse = {
 data?: LawyerUsage[];
 Data?: LawyerUsage[];
};

const extractLawyerUsage = (payload: unknown): LawyerUsage[] => {
 if (Array.isArray(payload)) return payload;

 if (payload && typeof payload ==="object") {
 const response = payload as LawyerUsagePagedResponse;
 if (Array.isArray(response.data)) return response.data;
 if (Array.isArray(response.Data)) return response.Data;
 }

 return [];
};

const fetchLawyerUsage = createAsyncThunk('aiUsage/fetchLawyerUsage',
 async (params: { page: number; pageSize: number; from?: string; to?: string }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const queryParams = new URLSearchParams();
 queryParams.append('pageNumber', params.page.toString());
 queryParams.append('pageSize', params.pageSize.toString());
 if (params.from) queryParams.append('from', params.from);
 if (params.to) queryParams.append('to', params.to);
 const res = await api.get(
 `${ADMIN_ROUTES.AI_USAGE.LAWYERS}?${queryParams.toString()}`
 );
 const payload = res.data;
 return extractLawyerUsage(payload.data ?? payload.Data ?? payload);
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchLawyerUsage;
