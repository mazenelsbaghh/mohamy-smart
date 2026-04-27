import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import type { NotificationItem } from'../../../types';
import { ADMIN_ROUTES } from'../../../APIs/routes';

export const fetchNotifications = createAsyncThunk<NotificationItem[], void, { rejectValue: string }>('notifications/fetchNotifications',
 async (_, { rejectWithValue }) => {
 try {
 const response = await api.get<{ data: NotificationItem[] }>(
 ADMIN_ROUTES.NOTIFICATION.BASE
 );
 return response.data.data;
 } catch (error) {
 const err = error as { response?: { data?: { message?: string } } };
 return rejectWithValue(err.response?.data?.message ||'فشل في تحميل الإشعارات');
 }
 }
);
