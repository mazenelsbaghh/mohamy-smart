import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { API_ROUTES } from"../../../APIs/routes";
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkRequestPhoneVerification = createAsyncThunk<
 string,
 { phoneNumber: string },
 { rejectValue: string }
>('auth/thunkRequestPhoneVerification', async (payload, thunkAPI) => {
 try {
 const res = await api.post(API_ROUTES.AUTH_REQUEST_PHONE_VERIFICATION, payload);
 return res.data.message ||'تم إرسال رمز تأكيد الرقم';
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkRequestPhoneVerification;
