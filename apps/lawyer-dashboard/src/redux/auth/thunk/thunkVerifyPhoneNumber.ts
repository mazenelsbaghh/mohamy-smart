import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { API_ROUTES } from"../../../APIs/routes";
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkVerifyPhoneNumber = createAsyncThunk<
 string,
 { phoneNumber: string; code: string },
 { rejectValue: string }
>('auth/thunkVerifyPhoneNumber', async (payload, thunkAPI) => {
 try {
 const res = await api.post(API_ROUTES.AUTH_VERIFY_PHONE_NUMBER, payload);
 return res.data.message ||'تم تأكيد رقم الهاتف بنجاح';
 } catch (error) {
 return thunkAPI.rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkVerifyPhoneNumber;
