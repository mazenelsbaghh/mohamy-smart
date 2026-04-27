import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { API_ROUTES } from"../../../APIs/routes";
import { axiosErrorHandler } from"@mohamy/shared-api";

export type TVerifyOtpPayload = {
 phoneNumber: string;
 code: string;
};

const thunkVerifyOtp = createAsyncThunk<string, TVerifyOtpPayload, { rejectValue: string }>('auth/thunkVerifyOtp',
 async (payload, thunkAPI) => {
 try {
 const response = await api.post(API_ROUTES.AUTH_VERIFY_OTP, payload);
 return response.data.message ??'تم التحقق من الرمز بنجاح.';
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkVerifyOtp;
