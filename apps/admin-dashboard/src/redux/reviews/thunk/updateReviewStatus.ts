import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import { ADMIN_ROUTES } from"../../../APIs/routes";
import type { TReview } from"./fetchReviews";

const updateReviewStatus = createAsyncThunk<
 TReview,
 { id: string; status: string },
 { rejectValue: string }
>("reviews/updateReviewStatus",
 async ({ id, status }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.patch<{ data: TReview }>(
 ADMIN_ROUTES.REVIEW_STATUS(id),
 { status }
 );
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default updateReviewStatus;
