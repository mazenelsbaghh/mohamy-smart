import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { API_ROUTES } from"../../../APIs/routes";
import { axiosErrorHandler } from"@mohamy/shared-api";

export type TForgotPasswordPayload = {
 phoneNumber: string;
};

const thunkForgotPassword = createAsyncThunk<string, TForgotPasswordPayload, { rejectValue: string }>('auth/thunkForgotPassword',
 async (payload, thunkAPI) => {
 try {
 const response = await api.post(API_ROUTES.AUTH_FORGOT_PASSWORD, payload);
 return response.data.message ??'إذا كان الحساب موجودًا، فسيتم إرسال رمز الاستعادة.';
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkForgotPassword;
