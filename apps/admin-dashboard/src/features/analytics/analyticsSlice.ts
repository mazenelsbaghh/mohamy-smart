import { createSlice, createAsyncThunk } from'@reduxjs/toolkit';
import analyticsService from'./analyticsService';
import type { FinancialMetricsDto, SubscriptionLifecycleDto, UserEngagementDto, CohortDataDto } from'./analyticsService';

interface AnalyticsState {
  financialMetrics: FinancialMetricsDto | null;
  subscriptionMetrics: SubscriptionLifecycleDto | null;
  engagementMetrics: UserEngagementDto | null;
  cohortMetrics: CohortDataDto[] | null;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  isLoadingFinancial: boolean;
  isLoadingSubscription: boolean;
  isLoadingEngagement: boolean;
  isLoadingCohort: boolean;
  message: string;
}

const initialState: AnalyticsState = {
  financialMetrics: null,
  subscriptionMetrics: null,
  engagementMetrics: null,
  cohortMetrics: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  isLoadingFinancial: false,
  isLoadingSubscription: false,
  isLoadingEngagement: false,
  isLoadingCohort: false,
  message:'',
};

export const fetchFinancialMetrics = createAsyncThunk('analytics/fetchFinancialMetrics',
 async (_, thunkAPI) => {
 try {
 return await analyticsService.getFinancialMetrics();
 } catch (error: unknown) {
 const err = error as { response?: { data?: { message?: string } }, message?: string };
 const message = (err.response && err.response.data && err.response.data.message) || err.message || String(error);
 return thunkAPI.rejectWithValue(message);
 }
 }
);

export const fetchSubscriptionMetrics = createAsyncThunk('analytics/fetchSubscriptionMetrics',
 async (_, thunkAPI) => {
 try {
 return await analyticsService.getSubscriptionMetrics();
 } catch (error: unknown) {
 const err = error as { response?: { data?: { message?: string } }, message?: string };
 const message = (err.response && err.response.data && err.response.data.message) || err.message || String(error);
 return thunkAPI.rejectWithValue(message);
 }
 }
);

export const fetchEngagementMetrics = createAsyncThunk('analytics/fetchEngagementMetrics',
 async (_, thunkAPI) => {
 try {
 return await analyticsService.getEngagementMetrics();
 } catch (error: unknown) {
 const err = error as { response?: { data?: { message?: string } }, message?: string };
 const message = (err.response && err.response.data && err.response.data.message) || err.message || String(error);
 return thunkAPI.rejectWithValue(message);
 }
 }
);

export const fetchCohortMetrics = createAsyncThunk('analytics/fetchCohortMetrics',
 async (_, thunkAPI) => {
 try {
 return await analyticsService.getCohortMetrics();
 } catch (error: unknown) {
 const err = error as { response?: { data?: { message?: string } }, message?: string };
 const message = (err.response && err.response.data && err.response.data.message) || err.message || String(error);
 return thunkAPI.rejectWithValue(message);
 }
 }
);

const analyticsSlice = createSlice({
 name:'analytics',
 initialState,
 reducers: {
 reset: (state) => {
 state.isLoading = false;
 state.isSuccess = false;
 state.isError = false;
 state.message ='';
 },
 },
 extraReducers: (builder) => {
 builder
  .addCase(fetchFinancialMetrics.pending, (state) => {
  state.isLoadingFinancial = true;
  })
  .addCase(fetchFinancialMetrics.fulfilled, (state, action) => {
  state.isLoadingFinancial = false;
  state.isSuccess = true;
  state.financialMetrics = action.payload;
  state.isLoading = state.isLoadingSubscription || state.isLoadingEngagement || state.isLoadingCohort;
  })
  .addCase(fetchFinancialMetrics.rejected, (state, action) => {
  state.isLoadingFinancial = false;
  state.isError = true;
  state.message = action.payload as string;
  state.isLoading = state.isLoadingSubscription || state.isLoadingEngagement || state.isLoadingCohort;
  })
  .addCase(fetchSubscriptionMetrics.pending, (state) => {
  state.isLoadingSubscription = true;
  })
  .addCase(fetchSubscriptionMetrics.fulfilled, (state, action) => {
  state.isLoadingSubscription = false;
  state.isSuccess = true;
  state.subscriptionMetrics = action.payload;
  state.isLoading = state.isLoadingFinancial || state.isLoadingEngagement || state.isLoadingCohort;
  })
  .addCase(fetchSubscriptionMetrics.rejected, (state, action) => {
  state.isLoadingSubscription = false;
  state.isError = true;
  state.message = action.payload as string;
  state.isLoading = state.isLoadingFinancial || state.isLoadingEngagement || state.isLoadingCohort;
  })
  .addCase(fetchEngagementMetrics.pending, (state) => {
  state.isLoadingEngagement = true;
  })
  .addCase(fetchEngagementMetrics.fulfilled, (state, action) => {
  state.isLoadingEngagement = false;
  state.isSuccess = true;
  state.engagementMetrics = action.payload;
  state.isLoading = state.isLoadingFinancial || state.isLoadingSubscription || state.isLoadingCohort;
  })
  .addCase(fetchEngagementMetrics.rejected, (state, action) => {
  state.isLoadingEngagement = false;
  state.isError = true;
  state.message = action.payload as string;
  state.isLoading = state.isLoadingFinancial || state.isLoadingSubscription || state.isLoadingCohort;
  })
  .addCase(fetchCohortMetrics.pending, (state) => {
  state.isLoadingCohort = true;
  })
  .addCase(fetchCohortMetrics.fulfilled, (state, action) => {
  state.isLoadingCohort = false;
  state.isSuccess = true;
  state.cohortMetrics = action.payload;
  state.isLoading = state.isLoadingFinancial || state.isLoadingSubscription || state.isLoadingEngagement;
  })
  .addCase(fetchCohortMetrics.rejected, (state, action) => {
  state.isLoadingCohort = false;
  state.isError = true;
  state.message = action.payload as string;
  state.isLoading = state.isLoadingFinancial || state.isLoadingSubscription || state.isLoadingEngagement;
  });
 },
});

export const { reset } = analyticsSlice.actions;
export default analyticsSlice.reducer;
