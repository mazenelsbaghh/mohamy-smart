import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { API_ROUTES } from"../../../APIs/routes";
import { axiosErrorHandler } from"@mohamy/shared-api";

export type TResetPasswordPayload = {
 phoneNumber: string;
 otpCode: string;
 newPassword: string;
};

const thunkResetPassword = createAsyncThunk<string, TResetPasswordPayload, { rejectValue: string }>('auth/thunkResetPassword',
 async (payload, thunkAPI) => {
 try {
 const response = await api.post(API_ROUTES.AUTH_RESET_PASSWORD, payload);
 return response.data.message ??'تمت إعادة تعيين كلمة المرور بنجاح.';
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkResetPassword;
