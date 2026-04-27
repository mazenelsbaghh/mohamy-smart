import { createSlice } from"@reduxjs/toolkit";
import fetchAiUsageSummary from"./thunk/fetchAiUsageSummary";
import fetchModelUsage from"./thunk/fetchModelUsage";
import fetchLawyerUsage from"./thunk/fetchLawyerUsage";
import fetchLawyerUsageDetail from"./thunk/fetchLawyerUsageDetail";
import { showErrorToast } from"../../utils/toastHelpers";
import type { AiUsageState } from"../../types";

const initialState: AiUsageState = {
 summary: null,
 lawyers: [],
 lawyerDetail: null,
 modelUsage: [],
 isLoadingSummary: false,
 isLoadingModels: false,
 isLoadingLawyers: false,
 isLoadingLawyerDetail: false,
 error: null,
 dateFrom: null,
 dateTo: null,
 lastFetchedAt: null,
};

const aiUsageSlice = createSlice({
 name:"aiUsage",
 initialState,
 reducers: {
 setDateRange: (state, action) => {
 state.dateFrom = action.payload.from;
 state.dateTo = action.payload.to;
 },
 clearLawyerDetail: (state) => {
 state.lawyerDetail = null;
 },
 },
 extraReducers: (builder) => {
 builder
 .addCase(fetchAiUsageSummary.pending, (state) => {
 state.isLoadingSummary = true;
 })
 .addCase(fetchAiUsageSummary.fulfilled, (state, action) => {
 state.isLoadingSummary = false;
 state.summary = action.payload;
 state.lastFetchedAt = Date.now();
 })
 .addCase(fetchAiUsageSummary.rejected, (state, action) => {
 state.isLoadingSummary = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(fetchModelUsage.pending, (state) => {
 state.isLoadingModels = true;
 })
 .addCase(fetchModelUsage.fulfilled, (state, action) => {
 state.isLoadingModels = false;
 state.modelUsage = action.payload;
 })
 .addCase(fetchModelUsage.rejected, (state, action) => {
 state.isLoadingModels = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(fetchLawyerUsage.pending, (state) => {
 state.isLoadingLawyers = true;
 })
 .addCase(fetchLawyerUsage.fulfilled, (state, action) => {
 state.isLoadingLawyers = false;
 state.lawyers = action.payload;
 })
 .addCase(fetchLawyerUsage.rejected, (state, action) => {
 state.isLoadingLawyers = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(fetchLawyerUsageDetail.pending, (state) => {
 state.isLoadingLawyerDetail = true;
 })
 .addCase(fetchLawyerUsageDetail.fulfilled, (state, action) => {
 state.isLoadingLawyerDetail = false;
 state.lawyerDetail = action.payload;
 })
 .addCase(fetchLawyerUsageDetail.rejected, (state, action) => {
 state.isLoadingLawyerDetail = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 });
 },
});

export const { setDateRange, clearLawyerDetail } = aiUsageSlice.actions;
export default aiUsageSlice.reducer;
