import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { LawyerUsageDetail } from"../../../types";
import { ADMIN_ROUTES } from"../../../APIs/routes";

const fetchLawyerUsageDetail = createAsyncThunk('aiUsage/fetchLawyerUsageDetail',
 async (params: { lawyerId: string; from?: string; to?: string }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const queryParams = new URLSearchParams();
 if (params.from) queryParams.append('from', params.from);
 if (params.to) queryParams.append('to', params.to);
 const query = queryParams.toString();
 const url = query
 ? `${ADMIN_ROUTES.AI_USAGE.LAWYER_DETAIL(params.lawyerId)}?${query}`
 : ADMIN_ROUTES.AI_USAGE.LAWYER_DETAIL(params.lawyerId);
 const res = await api.get<{ data: LawyerUsageDetail }>(url);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchLawyerUsageDetail;
