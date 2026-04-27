import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { TClient } from"../../../types/types";
import type { RootState } from"../../store";

type TResponse = {
 statusCode: number;
 meta: null;
 succeeded: boolean;
 message: string;
 errors: string[];
 data: {
 items: TClient[];
 page: number;
 pageSize: number;
 totalCount: number;
 totalPages: number;
 };
};

type TPropsData = {
 pageNumber: number;
 pageSize: number;
 lawyerId: string;
 forceRefresh?: boolean;
}

const CACHE_TTL_MS = 30_000; // 30 seconds

const thunkGetAllClients = createAsyncThunk('clients/thunkGetAllClients', async ({ pageNumber, pageSize, lawyerId }: TPropsData, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get<TResponse>('/Client', {
 params: {
 pageNumber,
 pageSize,
 lawyerId,
 }
 });
 return res.data.data
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
}, {
 condition: ({ forceRefresh }, { getState }) => {
 if (forceRefresh) return true;
 const { clients } = (getState() as RootState);
 const { lastFetchedAt } = clients;
 if (lastFetchedAt && Date.now() - lastFetchedAt < CACHE_TTL_MS) {
 return false; // skip fetch — data is fresh
 }
 return true;
 },
});

export default thunkGetAllClients;