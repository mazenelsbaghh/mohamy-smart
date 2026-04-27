import { createSlice } from'@reduxjs/toolkit';
import type { NotificationState } from'../../types';
import { fetchNotifications } from'./thunk/fetchNotifications';
import { markNotificationRead } from'./thunk/markNotificationRead';
import { markAllNotificationsRead } from'./thunk/markAllNotificationsRead';
import { deleteNotification } from'./thunk/deleteNotification';

const initialState: NotificationState = {
 items: [],
 unreadCount: 0,
 lastSyncedAt: null,
 isLoading: false,
 error: null,
};

const notificationsSlice = createSlice({
 name:'notifications',
 initialState,
 reducers: {
 clearNotificationsError: (state) => {
 state.error = null;
 },
 },
 extraReducers: (builder) => {
 builder
 .addCase(fetchNotifications.pending, (state) => {
 state.isLoading = true;
 state.error = null;
 })
 .addCase(fetchNotifications.fulfilled, (state, action) => {
 state.isLoading = false;
 state.items = action.payload;
 state.unreadCount = action.payload.filter((n) => !n.isRead).length;
 state.lastSyncedAt = new Date().toISOString();
 })
 .addCase(fetchNotifications.rejected, (state, action) => {
 state.isLoading = false;
 state.error = action.payload as string;
 })
 .addCase(markNotificationRead.fulfilled, (state, action) => {
 const notificationId = action.meta.arg;
 const item = state.items.find((n) => n.notificationId === notificationId);
 if (item) {
 item.isRead = true;
 state.unreadCount = Math.max(0, state.unreadCount - 1);
 }
 })
 .addCase(markAllNotificationsRead.fulfilled, (state) => {
 state.items.forEach((n) => {
 n.isRead = true;
 });
 state.unreadCount = 0;
 })
 .addCase(deleteNotification.fulfilled, (state, action) => {
 const notificationId = action.meta.arg;
 const item = state.items.find((n) => n.notificationId === notificationId);
 if (item && !item.isRead) {
 state.unreadCount = Math.max(0, state.unreadCount - 1);
 }
 state.items = state.items.filter((n) => n.notificationId !== notificationId);
 });
 },
});

export const { clearNotificationsError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
