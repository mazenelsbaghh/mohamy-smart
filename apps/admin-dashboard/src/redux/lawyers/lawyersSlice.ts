import { createSlice } from"@reduxjs/toolkit";
import fetchLawyers from"./thunk/fetchLawyers";
import fetchLawyerById from"./thunk/fetchLawyerById";
import updateLawyerStatus from"./thunk/updateLawyerStatus";
import verifyLawyerPhoneManually from"./thunk/verifyLawyerPhoneManually";
import { showErrorToast, showSuccessToast } from"../../utils/toastHelpers";
import type { TLawyerDetail, TUser } from"./thunk/fetchLawyers";

type TLawyersState = {
 list: TUser[];
 selectedLawyer: TLawyerDetail | null;
 isLoading: boolean;
 isLoadingDetail: boolean;
 isVerifyingPhone: boolean;
 isUpdatingStatus: boolean;
 totalPages: number;
 totalCount: number;
 currentFetchRequestId: string | null;
 error: string | null;
};

const initialState: TLawyersState = {
 list: [],
 selectedLawyer: null,
 isLoading: false,
 isLoadingDetail: false,
 isVerifyingPhone: false,
 isUpdatingStatus: false,
 totalPages: 1,
 totalCount: 0,
 currentFetchRequestId: null,
 error: null,
};

const lawyersSlice = createSlice({
 name:"lawyers",
 initialState,
 reducers: {},
 extraReducers: (builder) => {
 builder
 .addCase(fetchLawyers.pending, (state, action) => {
 state.isLoading = true;
 state.currentFetchRequestId = action.meta?.requestId ?? null;
 state.error = null;
 })
 .addCase(fetchLawyers.fulfilled, (state, action) => {
 const requestId = action.meta?.requestId;
 if (requestId && state.currentFetchRequestId !== requestId) return;
 state.isLoading = false;
 state.currentFetchRequestId = null;
 state.list = Array.isArray(action.payload.items) ? action.payload.items : [];
 state.totalPages = action.payload.totalPages ?? 1;
 state.totalCount = action.payload.totalCount ?? 0;
 })
 .addCase(fetchLawyers.rejected, (state, action) => {
 const requestId = action.meta?.requestId;
 if (requestId && state.currentFetchRequestId !== requestId) return;
 state.isLoading = false;
 state.currentFetchRequestId = null;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(updateLawyerStatus.pending, (state) => {
 state.isUpdatingStatus = true;
 state.error = null;
 })
 .addCase(updateLawyerStatus.fulfilled, (state, action) => {
 state.isUpdatingStatus = false;
 const idx = state.list.findIndex((u) => u.id === action.payload.id);
 if (idx !== -1) {
 state.list[idx].isActive = action.payload.isActive;
 }
 if (state.selectedLawyer && state.selectedLawyer.id === action.payload.id) {
 state.selectedLawyer.isActive = action.payload.isActive;
 }
 showSuccessToast("تم تحديث حالة المحامي بنجاح");
 })
 .addCase(updateLawyerStatus.rejected, (state, action) => {
 state.isUpdatingStatus = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(fetchLawyerById.pending, (state) => {
 state.isLoadingDetail = true;
 state.error = null;
 })
 .addCase(fetchLawyerById.fulfilled, (state, action) => {
 state.isLoadingDetail = false;
 state.selectedLawyer = action.payload;
 })
 .addCase(fetchLawyerById.rejected, (state, action) => {
 state.isLoadingDetail = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(verifyLawyerPhoneManually.pending, (state) => {
 state.isVerifyingPhone = true;
 state.error = null;
 })
 .addCase(verifyLawyerPhoneManually.fulfilled, (state, action) => {
 state.isVerifyingPhone = false;
 if (state.selectedLawyer?.id === action.payload.id) {
 state.selectedLawyer.phoneNumber = action.payload.phoneNumber;
 state.selectedLawyer.phoneNumberConfirmed = action.payload.phoneNumberConfirmed;
 state.selectedLawyer.latestManualPhoneVerification = action.payload.latestManualPhoneVerification;
 }
 showSuccessToast("تم توثيق رقم الهاتف يدويًا");
 })
 .addCase(verifyLawyerPhoneManually.rejected, (state, action) => {
 state.isVerifyingPhone = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 });
 },
});

export default lawyersSlice.reducer;
