import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { API_ROUTES } from"../../../APIs/routes";
import { axiosErrorHandler } from"@mohamy/shared-api";

type TPropsData = {
  planId: number;
  paymentMethod:'card' |'wallet';
  billingCycle?:'monthly' |'yearly';
}

type TInitiatePaymentResponse = {
 paymentId: string;
 paymentUrl: string;
 status: string;
};

const thunkAddSubscriptionPlan = createAsyncThunk<TInitiatePaymentResponse, TPropsData, { rejectValue: string }>('subscription/thunkInitiatePayment',
  async ({ planId, paymentMethod, billingCycle }, thunkAPI) => {
  try {
  const res = await api.post(API_ROUTES.INITIATE_PAYMENT, null, {
  params: {
  subscriptionId: planId,
  paymentMethod,
  billingCycle: billingCycle || 'monthly',
  }
  });
 return res.data.data;
 } catch (error) {
 return thunkAPI.rejectWithValue(
 axiosErrorHandler(error)
 );
 }
 }
);

export default thunkAddSubscriptionPlan;