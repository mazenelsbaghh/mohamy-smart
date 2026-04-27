import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import type { ChangeAdminPasswordDto } from'../../../types';
import { ADMIN_ROUTES } from'../../../APIs/routes';

export const changeAdminPassword = createAsyncThunk<boolean, ChangeAdminPasswordDto, { rejectValue: string }>('settings/changeAdminPassword',
 async (data, { rejectWithValue }) => {
 try {
 const response = await api.put<{ data: boolean }>(
 ADMIN_ROUTES.ACCOUNT.CHANGE_PASSWORD,
 data
 );
 return response.data.data;
 } catch (error) {
 const err = error as { response?: { data?: { message?: string } } };
 return rejectWithValue(err.response?.data?.message ||'فشل في تغيير كلمة المرور');
 }
 }
);
