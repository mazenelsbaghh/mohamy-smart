import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";

export type TPlanCount = {
 planName: string;
 count: number;
};

export type TSubscriptionLedger = {
 transactionId: string;
 amount: number;
 date: string;
 status: string;
};

export type TSubscriptionsReport = {
 totalSubscriptions: number;
 totalActive: number;
 totalInactive: number;
 totalPaid: number;
 activePaid: number;
 totalTrial: number;
 countPerPlan: TPlanCount[];
 totalRevenue: number;
 churnedSubscriptions: number;
 ledger: {
 items: TSubscriptionLedger[];
 totalCount: number;
 page: number;
 pageSize: number;
 totalPages: number;
 };
};

const fetchSubscriptionsReport = createAsyncThunk('reports/fetchSubscriptionsReport',
 async ({ pageNumber = 1, pageSize = 10 }: { pageNumber?: number; pageSize?: number } = {}, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get<{ data: TSubscriptionsReport }>('/admin/reports/subscriptions', {
 params: { pageNumber, pageSize }
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchSubscriptionsReport;
