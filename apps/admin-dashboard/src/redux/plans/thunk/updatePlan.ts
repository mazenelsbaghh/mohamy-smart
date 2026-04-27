import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { TSubscription } from"./fetchPlans";

import { showSuccessToast } from"../../../utils/toastHelpers";

type TUpdatePlanParams = {
  id: number;
  name?: string;
  features?: string;
  price?: number;
  aiRequestsLimit?: number;
  durationDays?: number;
  isActive?: boolean;
  isPopular?: boolean;
  showOnLanding?: boolean;
  yearlyPrice?: number | null;
  yearlyDurationDays?: number | null;
};

const updatePlan = createAsyncThunk<TSubscription, TUpdatePlanParams, { rejectValue: string }>("plans/updatePlan",
 async (params, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const requestBody: Partial<Omit<TUpdatePlanParams,"id">> = {};
 if (params.name !== undefined) requestBody.name = params.name;
 if (params.features !== undefined) requestBody.features = params.features;
 if (params.price !== undefined) requestBody.price = params.price;
 if (params.aiRequestsLimit !== undefined) requestBody.aiRequestsLimit = params.aiRequestsLimit;
 if (params.durationDays !== undefined) requestBody.durationDays = params.durationDays;
 if (params.isActive !== undefined) requestBody.isActive = params.isActive;
 if (params.isPopular !== undefined) requestBody.isPopular = params.isPopular;
  if (params.showOnLanding !== undefined) requestBody.showOnLanding = params.showOnLanding;
  if (params.yearlyPrice !== undefined) requestBody.yearlyPrice = params.yearlyPrice;
  if (params.yearlyDurationDays !== undefined) requestBody.yearlyDurationDays = params.yearlyDurationDays;

  const res = await api.put<{ data: TSubscription }>(
 `/Subscription/plan/${params.id}`,
 requestBody
 );
 showSuccessToast("تم تعديل الخطة بنجاح");
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default updatePlan;
