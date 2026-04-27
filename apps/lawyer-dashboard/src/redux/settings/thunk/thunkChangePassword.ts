import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import { API_ROUTES } from'../../../APIs/routes';
import { axiosErrorHandler } from"@mohamy/shared-api";

export type TChangePasswordPayload = {
 currentPassword: string;
 otpCode: string;
 newPassword: string;
 confirmPassword: string;
};

const thunkChangePassword = createAsyncThunk<string, TChangePasswordPayload, { rejectValue: string }>('settings/changePassword',
 async (payload, thunkAPI) => {
 try {
 const response = await api.put(API_ROUTES.CHANGE_PASSWORD, payload);
 return response.data.message ||'تم تغيير كلمة المرور بنجاح';
 } catch (error) {
 return thunkAPI.rejectWithValue(
 axiosErrorHandler(error)
 );
 }
 }
);

export default thunkChangePassword;
