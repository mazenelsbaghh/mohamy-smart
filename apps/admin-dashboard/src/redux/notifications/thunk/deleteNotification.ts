import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import { ADMIN_ROUTES } from'../../../APIs/routes';

export const deleteNotification = createAsyncThunk<boolean, string, { rejectValue: string }>('notifications/deleteNotification',
 async (notificationId, { rejectWithValue }) => {
 try {
 const response = await api.delete<{ data: boolean }>(
 ADMIN_ROUTES.NOTIFICATION.DELETE(notificationId)
 );
 return response.data.data;
 } catch (error) {
 const err = error as { response?: { data?: { message?: string } } };
 return rejectWithValue(err.response?.data?.message ||'فشل في حذف الإشعار');
 }
 }
);
