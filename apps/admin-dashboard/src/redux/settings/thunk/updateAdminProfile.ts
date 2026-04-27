import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import type { AdminProfile, UpdateAdminProfileDto } from'../../../types';
import { ADMIN_ROUTES } from'../../../APIs/routes';

export const updateAdminProfile = createAsyncThunk<AdminProfile, UpdateAdminProfileDto, { rejectValue: string }>('settings/updateAdminProfile',
 async (data, { rejectWithValue }) => {
 try {
 const response = await api.put<{ data: AdminProfile }>(
 ADMIN_ROUTES.ACCOUNT.PROFILE,
 data
 );
 return response.data.data;
 } catch (error) {
 const err = error as { response?: { data?: { message?: string } } };
 return rejectWithValue(err.response?.data?.message ||'فشل في تحديث بيانات الملف الشخصي');
 }
 }
);
