import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import { ADMIN_ROUTES } from'../../../APIs/routes';

export const markNotificationRead = createAsyncThunk<boolean, string, { rejectValue: string }>('notifications/markNotificationRead',
 async (notificationId, { rejectWithValue }) => {
 try {
 const response = await api.put<{ data: boolean }>(
 ADMIN_ROUTES.NOTIFICATION.READ(notificationId)
 );
 return response.data.data;
 } catch (error) {
 const err = error as { response?: { data?: { message?: string } } };
 return rejectWithValue(err.response?.data?.message ||'فشل في تحديث الإشعار');
 }
 }
);
