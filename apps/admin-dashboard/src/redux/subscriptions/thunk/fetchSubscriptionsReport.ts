import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";

export type TLawyerSubscription = {
 lawyerId: string;
 lawyerName: string;
 planName: string;
 price: number;
 isTrial: boolean;
 isPaid: boolean;
 startDate: string;
 endDate: string;
 limit: number;
 usedAiRequests: number;
 isActive: boolean;
};

const fetchSubscriptionsReport = createAsyncThunk<
 TLawyerSubscription[],
 { isActive?: boolean; isPaid?: boolean } | undefined,
 { rejectValue: string }
>("subscriptions/fetchLawyerSubscriptions",
 async (params = {}, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get<{ data: TLawyerSubscription[] }>("/Subscription/lawyers", {
 params: {
 ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
 ...(params?.isPaid !== undefined ? { isPaid: params.isPaid } : {}),
 },
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchSubscriptionsReport;
