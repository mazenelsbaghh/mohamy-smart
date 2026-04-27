import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import { API_ROUTES } from'../../../APIs/routes';
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkVerifyAccountOtp = createAsyncThunk<string, { code: string }, { rejectValue: string }>('settings/verifyAccountOtp',
 async (payload, thunkAPI) => {
 try {
 const response = await api.post(API_ROUTES.ACCOUNT_VERIFY_OTP, { ...payload, purpose:'change-password' });
 return response.data.message ||'تم التحقق من الرمز';
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkVerifyAccountOtp;
