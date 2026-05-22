import { createSlice } from"@reduxjs/toolkit";
import fetchPlans from"./thunk/fetchPlans";
import updatePlan from"./thunk/updatePlan";
import createPlan from"./thunk/createPlan";
import archivePlan from"./thunk/archivePlan";
import restorePlan from"./thunk/restorePlan";
import { showErrorToast } from"../../utils/toastHelpers";
import type { TSubscription } from"./thunk/fetchPlans";

type TPlansState = {
 list: TSubscription[];
 isLoading: boolean;
 error: string | null;
};

const initialState: TPlansState = {
 list: [],
 isLoading: false,
 error: null,
};

const plansSlice = createSlice({
 name:"plans",
 initialState,
 reducers: {},
 extraReducers: (builder) => {
 builder
 .addCase(fetchPlans.pending, (state) => {
 state.isLoading = true;
 })
 .addCase(fetchPlans.fulfilled, (state, action) => {
 state.isLoading = false;
 state.list = action.payload;
 })
 .addCase(fetchPlans.rejected, (state, action) => {
 state.isLoading = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(updatePlan.fulfilled, (state, action) => {
 const idx = state.list.findIndex((p) => p.id === action.payload.id);
 if (idx !== -1) {
 state.list[idx] = action.payload;
 }
 })
 .addCase(updatePlan.rejected, (state, action) => {
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(createPlan.pending, (state) => {
 state.isLoading = true;
 })
 .addCase(createPlan.fulfilled, (state, action) => {
 state.isLoading = false;
 state.list.push(action.payload);
 })
 .addCase(createPlan.rejected, (state, action) => {
 state.isLoading = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(archivePlan.fulfilled, (state, action) => {
 const idx = state.list.findIndex((p) => p.id === action.payload);
 if (idx !== -1) {
 state.list[idx].isActive = false;
 }
 })
 .addCase(archivePlan.rejected, (state, action) => {
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(restorePlan.fulfilled, (state, action) => {
 const idx = state.list.findIndex((p) => p.id === action.payload);
 if (idx !== -1) {
 state.list[idx].isActive = true;
 }
 })
 .addCase(restorePlan.rejected, (state, action) => {
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 });
 },
});

export default plansSlice.reducer;
