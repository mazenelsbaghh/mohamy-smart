import { createSlice } from"@reduxjs/toolkit";
import fetchReviews from"./thunk/fetchReviews";
import updateReviewStatus from"./thunk/updateReviewStatus";
import { showErrorToast, showSuccessToast } from"../../utils/toastHelpers";
import type { TReview } from"./thunk/fetchReviews";

type TReviewsState = {
 list: TReview[];
 isLoading: boolean;
 error: string | null;
};

const initialState: TReviewsState = {
 list: [],
 isLoading: false,
 error: null,
};

const reviewsSlice = createSlice({
 name:"reviews",
 initialState,
 reducers: {},
 extraReducers: (builder) => {
 builder
 .addCase(fetchReviews.pending, (state) => {
 state.isLoading = true;
 state.error = null;
 })
 .addCase(fetchReviews.fulfilled, (state, action) => {
 state.isLoading = false;
 state.list = action.payload;
 })
 .addCase(fetchReviews.rejected, (state, action) => {
 state.isLoading = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(updateReviewStatus.fulfilled, (state, action) => {
 const idx = state.list.findIndex((r) => r.id === action.payload.id);
 if (idx !== -1) {
 state.list[idx] = action.payload;
 }
 showSuccessToast(
 action.payload.status ==="Approved"
 ?"تم قبول التقييم"
 :"تم رفض التقييم"
 );
 })
 .addCase(updateReviewStatus.rejected, (state, action) => {
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 });
 },
});

export default reviewsSlice.reducer;
