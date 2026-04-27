import { createSlice } from"@reduxjs/toolkit";
import fetchSubscriptionsReport from"./thunk/fetchSubscriptionsReport";
import fetchSubscriptionDetail from"./thunk/fetchSubscriptionDetail";
import { showErrorToast } from"../../utils/toastHelpers";
import type { TLawyerSubscription } from"./thunk/fetchSubscriptionsReport";
import type { TSubscriptionDetail } from"./thunk/fetchSubscriptionDetail";

type TSubscriptionsState = {
 records: TLawyerSubscription[];
 selectedDetail: TSubscriptionDetail | null;
 isLoading: boolean;
 isLoadingDetail: boolean;
 error: string | null;
};

const initialState: TSubscriptionsState = {
 records: [],
 selectedDetail: null,
 isLoading: false,
 isLoadingDetail: false,
 error: null,
};

const subscriptionsSlice = createSlice({
 name:"subscriptions",
 initialState,
 reducers: {},
 extraReducers: (builder) => {
 builder
 .addCase(fetchSubscriptionsReport.pending, (state) => {
 state.isLoading = true;
 })
 .addCase(fetchSubscriptionsReport.fulfilled, (state, action) => {
 state.isLoading = false;
 state.records = action.payload;
 })
 .addCase(fetchSubscriptionsReport.rejected, (state, action) => {
 state.isLoading = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(fetchSubscriptionDetail.pending, (state) => {
 state.isLoadingDetail = true;
 state.error = null;
 })
 .addCase(fetchSubscriptionDetail.fulfilled, (state, action) => {
 state.isLoadingDetail = false;
 state.selectedDetail = action.payload;
 })
 .addCase(fetchSubscriptionDetail.rejected, (state, action) => {
 state.isLoadingDetail = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 });
 },
});

export default subscriptionsSlice.reducer;
