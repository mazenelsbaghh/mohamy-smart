import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { API_ROUTES } from"../../../APIs/routes";
import { axiosErrorHandler } from"@mohamy/shared-api";

type TRegisterResponse = {
 statusCode: number;
 meta: null;
 succeeded: boolean;
 message: string | null;
 errors: string[];
 data: {
 phone: string;
 requiresPhoneVerification: boolean;
 phoneNumberConfirmed: boolean;
 };
};

export type TRegisterResult = {
 phoneNumber: string;
 message: string;
};

type TRegisterPayload = {
 fullName: string;
 phoneNumber: string;
 email: string;
 password: string;
 passwordConfirmation: string;
 governorate: string;
 agreeToTerms: boolean;
};

const thunkAuthRegister = createAsyncThunk<
 TRegisterResult,
 TRegisterPayload
>('auth/thunkAuthRegister', async (data, thunkAPI) => {

 const { rejectWithValue } = thunkAPI;

 try {
 const res = await api.post<TRegisterResponse>(API_ROUTES.AUTH_REGISTER, {
 fullName: data.fullName,
 phoneNumber: data.phoneNumber,
 email: data.email,
 password: data.password,
 passwordConfirmation: data.passwordConfirmation,
 governorate: data.governorate,
 agreeToTerms: data.agreeToTerms,
 });
 return {
 phoneNumber: res.data.data.phone || data.phoneNumber,
 message: res.data.message ||'تم إنشاء الحساب وإرسال رمز تأكيد الرقم',
 };
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error))
 }
});

export default thunkAuthRegister;
