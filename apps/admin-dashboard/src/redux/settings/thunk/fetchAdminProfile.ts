import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import type { AdminProfile } from'../../../types';
import { ADMIN_ROUTES } from'../../../APIs/routes';

export const fetchAdminProfile = createAsyncThunk<AdminProfile, void, { rejectValue: string }>('settings/fetchAdminProfile',
 async (_, { rejectWithValue }) => {
 try {
 const response = await api.get<{ data: AdminProfile }>(
 ADMIN_ROUTES.ACCOUNT.PROFILE
 );
 return response.data.data;
 } catch (error) {
 const err = error as { response?: { data?: { message?: string } } };
 return rejectWithValue(err.response?.data?.message ||'فشل في تحميل بيانات الملف الشخصي');
 }
 }
);
