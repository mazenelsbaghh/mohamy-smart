import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../APIs/api';
import { API_ROUTES } from '../../../APIs/routes';

type TChangePhoneRequestArgs = {
  currentPassword: string;
  newPhoneNumber: string;
};

const thunkChangePhoneRequest = createAsyncThunk(
  'settings/changePhoneRequest',
  async (args: TChangePhoneRequestArgs, thunkAPI) => {
    try {
      const response = await api.post(API_ROUTES.REQUEST_CHANGE_PHONE, args);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        return thunkAPI.rejectWithValue(error.response.data.message);
      }
      return thunkAPI.rejectWithValue('حدث خطأ أثناء طلب تغيير رقم الهاتف');
    }
  }
);

export default thunkChangePhoneRequest;
