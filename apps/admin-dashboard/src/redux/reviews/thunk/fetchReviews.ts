import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import { ADMIN_ROUTES } from"../../../APIs/routes";

export type TReview = {
 id: string;
 lawyerId: string;
 lawyerName: string;
 reviewerName: string;
 reviewerRole: string | null;
 rating: number;
 comment: string;
 status: string;
 created: string;
};

const fetchReviews = createAsyncThunk<
 TReview[],
 string | undefined,
 { rejectValue: string }
>("reviews/fetchReviews",
 async (status, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const params = status ? { status } : {};
 const res = await api.get<{ data: TReview[] }>(ADMIN_ROUTES.REVIEWS, { params });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchReviews;
