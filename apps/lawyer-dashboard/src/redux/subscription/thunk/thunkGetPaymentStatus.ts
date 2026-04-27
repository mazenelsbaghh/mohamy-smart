import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import { API_ROUTES } from'../../../APIs/routes';
import { axiosErrorHandler } from"@mohamy/shared-api";

export type TPaymentStatusResponse = {
 paymentId: string;
 amount: number;
 paymentMethod:'card' |'wallet';
 status:'Pending' |'Success' |'Failed' |'Expired';
 subscriptionActivated: boolean;
 activePlanName: string;
 createdAt: string;
};

const thunkGetPaymentStatus = createAsyncThunk<TPaymentStatusResponse, string, { rejectValue: string }>('subscription/getPaymentStatus',
 async (paymentId, thunkAPI) => {
 try {
 const response = await api.get(API_ROUTES.GET_PAYMENT_STATUS(paymentId));
 return response.data.data;
 } catch (error) {
 return thunkAPI.rejectWithValue(
 axiosErrorHandler(error)
 );
 }
 }
);

export default thunkGetPaymentStatus;
