import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../APIs/api';
import { API_ROUTES } from '../../../APIs/routes';

type TChangePhoneVerifyArgs = {
  otpCode: string;
};

const thunkChangePhoneVerify = createAsyncThunk(
  'settings/changePhoneVerify',
  async (args: TChangePhoneVerifyArgs, thunkAPI) => {
    try {
      const response = await api.post(API_ROUTES.VERIFY_CHANGE_PHONE, args);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        return thunkAPI.rejectWithValue(error.response.data.message);
      }
      return thunkAPI.rejectWithValue('حدث خطأ أثناء التحقق من رمز OTP');
    }
  }
);

export default thunkChangePhoneVerify;
