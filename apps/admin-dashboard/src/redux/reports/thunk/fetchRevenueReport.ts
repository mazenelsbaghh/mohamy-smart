import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";

export type TRevenueDataPoint = {
 label: string;
 amount: number;
};

export type TRevenueReport = {
 totalRevenue: number;
 dataPoints: TRevenueDataPoint[];
};

const fetchRevenueReport = createAsyncThunk('reports/fetchRevenueReport',
 async (period:'Weekly' |'Monthly' |'Yearly' ='Weekly', thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get<{ data: TRevenueReport }>(`/admin/reports/revenue?period=${period}`);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchRevenueReport;
