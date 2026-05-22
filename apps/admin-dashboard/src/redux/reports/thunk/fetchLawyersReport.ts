import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";

export type TLawyersReport = {
  totalLawyers: number;
  totalActive: number;
  totalInactive: number;
  activeSubscribers: number;
  activePaidSubscribers: number;
  expiredSubscribers: number;
};

const fetchLawyersReport = createAsyncThunk('reports/fetchLawyersReport',
 async (_, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get<{ data: TLawyersReport }>('/admin/reports/lawyers');
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchLawyersReport;
