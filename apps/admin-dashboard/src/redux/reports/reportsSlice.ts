import { createSlice } from"@reduxjs/toolkit";
import fetchLawyersReport from"./thunk/fetchLawyersReport";
import fetchSubscriptionsReport from"./thunk/fetchSubscriptionsReport";
import fetchRevenueReport from"./thunk/fetchRevenueReport";
import fetchAccountMessagingAudit from"./thunk/fetchAccountMessagingAudit";
import fetchLawyerCasesStats from"./thunk/fetchLawyerCasesStats";
import { showErrorToast } from"../../utils/toastHelpers";
import type { TLawyersReport } from"./thunk/fetchLawyersReport";
import type { TSubscriptionsReport } from"./thunk/fetchSubscriptionsReport";
import type { TRevenueReport } from"./thunk/fetchRevenueReport";
import type { TAccountMessagingAudit } from"./thunk/fetchAccountMessagingAudit";
import type { TPagedLawyerCasesStats } from"./thunk/fetchLawyerCasesStats";

type TReportsState = {
 lawyersReport: TLawyersReport | null;
 subscriptionsReport: TSubscriptionsReport | null;
 revenueReport: TRevenueReport | null;
 accountMessagingAudit: TAccountMessagingAudit | null;
 lawyerCasesStats: TPagedLawyerCasesStats | null;
 isLoadingLawyersReport: boolean;
 isLoadingSubscriptionsReport: boolean;
 isLoadingRevenueReport: boolean;
 isLoadingAccountMessaging: boolean;
 isLoadingLawyerCasesStats: boolean;
  errorLawyers: string | null;
  errorSubscriptions: string | null;
  errorRevenue: string | null;
  errorAccountMessaging: string | null;
  errorLawyerCasesStats: string | null;
  error: string | null;
};

const initialState: TReportsState = {
  lawyersReport: null,
  subscriptionsReport: null,
  revenueReport: null,
  accountMessagingAudit: null,
  lawyerCasesStats: null,
  isLoadingLawyersReport: false,
  isLoadingSubscriptionsReport: false,
  isLoadingRevenueReport: false,
  isLoadingAccountMessaging: false,
  isLoadingLawyerCasesStats: false,
  errorLawyers: null,
  errorSubscriptions: null,
  errorRevenue: null,
  errorAccountMessaging: null,
  errorLawyerCasesStats: null,
  error: null,
};

const reportsSlice = createSlice({
 name:"reports",
 initialState,
 reducers: {},
 extraReducers: (builder) => {
 builder
 .addCase(fetchLawyersReport.pending, (state) => {
 state.isLoadingLawyersReport = true;
 })
 .addCase(fetchLawyersReport.fulfilled, (state, action) => {
 state.isLoadingLawyersReport = false;
 state.lawyersReport = action.payload;
 })
  .addCase(fetchLawyersReport.rejected, (state, action) => {
  state.isLoadingLawyersReport = false;
  if (typeof action.payload ==="string") {
  state.errorLawyers = action.payload;
  state.error = action.payload;
  showErrorToast(action.payload);
  }
  })
 .addCase(fetchSubscriptionsReport.pending, (state) => {
 state.isLoadingSubscriptionsReport = true;
 })
 .addCase(fetchSubscriptionsReport.fulfilled, (state, action) => {
 state.isLoadingSubscriptionsReport = false;
 state.subscriptionsReport = action.payload;
 })
  .addCase(fetchSubscriptionsReport.rejected, (state, action) => {
  state.isLoadingSubscriptionsReport = false;
  if (typeof action.payload ==="string") {
  state.errorSubscriptions = action.payload;
  state.error = action.payload;
  showErrorToast(action.payload);
  }
  })
 .addCase(fetchRevenueReport.pending, (state) => {
 state.isLoadingRevenueReport = true;
 })
 .addCase(fetchRevenueReport.fulfilled, (state, action) => {
 state.isLoadingRevenueReport = false;
 state.revenueReport = action.payload;
 })
  .addCase(fetchRevenueReport.rejected, (state, action) => {
  state.isLoadingRevenueReport = false;
  if (typeof action.payload ==="string") {
  state.errorRevenue = action.payload;
  state.error = action.payload;
  showErrorToast(action.payload);
  }
  })
 .addCase(fetchAccountMessagingAudit.pending, (state) => {
 state.isLoadingAccountMessaging = true;
 })
 .addCase(fetchAccountMessagingAudit.fulfilled, (state, action) => {
 state.isLoadingAccountMessaging = false;
 state.accountMessagingAudit = action.payload;
 })
  .addCase(fetchAccountMessagingAudit.rejected, (state, action) => {
  state.isLoadingAccountMessaging = false;
  if (typeof action.payload ==="string") {
  state.errorAccountMessaging = action.payload;
  state.error = action.payload;
  showErrorToast(action.payload);
  }
  })
 .addCase(fetchLawyerCasesStats.pending, (state) => {
 state.isLoadingLawyerCasesStats = true;
 })
 .addCase(fetchLawyerCasesStats.fulfilled, (state, action) => {
 state.isLoadingLawyerCasesStats = false;
 state.lawyerCasesStats = action.payload;
 })
  .addCase(fetchLawyerCasesStats.rejected, (state, action) => {
  state.isLoadingLawyerCasesStats = false;
  if (typeof action.payload ==="string") {
  state.errorLawyerCasesStats = action.payload;
  state.error = action.payload;
  showErrorToast(action.payload);
  }
  });
 },
});

export default reportsSlice.reducer;
