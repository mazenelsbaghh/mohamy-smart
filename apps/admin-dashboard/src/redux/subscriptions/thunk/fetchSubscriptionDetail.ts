import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import { ADMIN_ROUTES } from"../../../APIs/routes";

export type TSubscriptionDetail = {
 lawyerId: string;
 lawyerName: string;
 planName: string;
 startDate: string;
 endDate: string;
 amount: number;
 paymentMethod: string;
 isActive: boolean;
 usedAiRequests: number;
 limit: number;
};

const fetchSubscriptionDetail = createAsyncThunk<
 TSubscriptionDetail,
 string,
 { rejectValue: string }
>("subscriptions/fetchSubscriptionDetail",
 async (lawyerId, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get<{ data: TSubscriptionDetail }>(
 ADMIN_ROUTES.LAWYER_DETAIL(lawyerId)
 );
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchSubscriptionDetail;
