import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { TSubscription } from"./fetchPlans";
import { showSuccessToast } from"../../../utils/toastHelpers";

type TCreatePlanParams = {
  name: string;
  features: string;
  price: number;
  aiRequestsLimit: number;
  durationDays: number;
  isPopular?: boolean;
  showOnLanding?: boolean;
  yearlyPrice?: number | null;
  yearlyDurationDays?: number | null;
};

const createPlan = createAsyncThunk<TSubscription, TCreatePlanParams, { rejectValue: string }>("plans/createPlan",
 async (params, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.post<{ data: TSubscription }>("/Subscription/plan", params);
 showSuccessToast("تم إنشاء الخطة بنجاح");
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default createPlan;
