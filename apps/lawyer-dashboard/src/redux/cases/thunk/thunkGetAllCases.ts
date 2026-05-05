import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { RootState } from"../../store";
import { normalizeCaseSearchQueryForApi } from"../../../pages/cases/caseSearch";

type TParams = {
 pageNumber: number;
 pageSize?: number;
 lawyerId: string | undefined;
 isActive?: boolean;
 searchQuery?: string;
 forceRefresh?: boolean;
}

const CACHE_TTL_MS = 30_000; // 30 seconds

const thunkGetAllCases = createAsyncThunk('cases/thunkGetAllCases', async ({ pageNumber, pageSize = 10, lawyerId, isActive = true, searchQuery ='' }: TParams, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const normalizedSearchQuery = normalizeCaseSearchQueryForApi(searchQuery);

 const res = await api.get('/Case', {
 params: {
 pageNumber,
 pageSize,
 lawyerId,
 isActive,
 ...(normalizedSearchQuery ? { searchQuery: normalizedSearchQuery } : {}),
 }
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
}, {
 condition: ({ forceRefresh }, { getState }) => {
 if (forceRefresh) return true;
 const { cases } = (getState() as RootState);
 const { lastFetchedAt } = cases;
 if (lastFetchedAt && Date.now() - lastFetchedAt < CACHE_TTL_MS) {
 return false;
 }
 return true;
 },
});

export default thunkGetAllCases;
