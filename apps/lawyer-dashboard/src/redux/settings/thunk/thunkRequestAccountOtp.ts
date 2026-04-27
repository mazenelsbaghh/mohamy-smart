import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import { API_ROUTES } from'../../../APIs/routes';
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkRequestAccountOtp = createAsyncThunk<string, void, { rejectValue: string }>('settings/requestAccountOtp',
 async (_, thunkAPI) => {
 try {
 const response = await api.post(API_ROUTES.ACCOUNT_REQUEST_OTP, { purpose:'change-password' });
 return response.data.message ||'تم إرسال رمز التحقق';
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkRequestAccountOtp;
