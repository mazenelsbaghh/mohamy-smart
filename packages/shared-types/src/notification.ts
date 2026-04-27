/** Notification item */
export interface NotificationItem {
  notificationId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
  receiverId?: string;
}
