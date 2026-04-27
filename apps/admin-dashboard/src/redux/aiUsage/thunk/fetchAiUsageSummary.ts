import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { AiUsageSummary } from"../../../types";
import { ADMIN_ROUTES } from"../../../APIs/routes";
import type { RootState } from"../../store";

const CACHE_TTL_MS = 30_000; // 30 seconds

const fetchAiUsageSummary = createAsyncThunk('aiUsage/fetchAiUsageSummary',
 async (params: { from?: string; to?: string; forceRefresh?: boolean } | void, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const queryParams = new URLSearchParams();
 if (params?.from) queryParams.append('from', params.from);
 if (params?.to) queryParams.append('to', params.to);
 const query = queryParams.toString();
 const url = query
 ? `${ADMIN_ROUTES.AI_USAGE.SUMMARY}?${query}`
 : ADMIN_ROUTES.AI_USAGE.SUMMARY;
 const res = await api.get<{ data: AiUsageSummary }>(url);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 },
 {
 condition: (params, { getState }) => {
 if (params?.forceRefresh) return true;
 const { aiUsage } = (getState() as RootState);
 const { lastFetchedAt } = aiUsage;
 if (lastFetchedAt && Date.now() - lastFetchedAt < CACHE_TTL_MS) {
 return false;
 }
 return true;
 },
 }
);

export default fetchAiUsageSummary;
