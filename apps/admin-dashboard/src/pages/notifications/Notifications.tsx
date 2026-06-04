import { CustomButton, Container } from'@mohamy/shared-ui';
import { useEffect, useState } from'react';
import { Card, CardBody, Chip, Spinner } from'@heroui/react';

import HeadTitle from'../../components/public/headTitle/HeadTitle';
import { useAppDispatch, useAppSelector } from'../../hooks/reduxHooks';
import { fetchNotifications } from'../../redux/notifications/thunk/fetchNotifications';
import { markNotificationRead } from'../../redux/notifications/thunk/markNotificationRead';
import { markAllNotificationsRead } from'../../redux/notifications/thunk/markAllNotificationsRead';
import { deleteNotification } from'../../redux/notifications/thunk/deleteNotification';
import { clearNotificationsError } from'../../redux/notifications/notificationsSlice';
import { showSuccessToast, showErrorToast } from'../../utils/toastHelpers';
import AdminFilterToolbar from'../../components/adminFilters/AdminFilterToolbar';
import { recordMatchesAdminSearch } from'../../components/adminFilters/adminFilterUtils';

import { FaBell, FaCheckDouble, FaTrash, FaEnvelopeOpen } from'react-icons/fa';

const typeColorMap: Record<string,'primary' |'success' |'warning' |'danger' |'default'> = {
 info:'primary',
 success:'success',
 warning:'warning',
 error:'danger',
};

const typeLabelMap: Record<string, string> = {
 info:'معلومات',
 success:'نجاح',
 warning:'تحذير',
 error:'خطأ',
};

const Notifications = () => {
 const dispatch = useAppDispatch();
 const { items, unreadCount, isLoading, error } = useAppSelector((state) => state.notifications);
 const [searchQuery, setSearchQuery] = useState('');
 const [readFilter, setReadFilter] = useState('');
 const [typeFilter, setTypeFilter] = useState('');

 useEffect(() => {
 dispatch(fetchNotifications());
 }, [dispatch]);

 useEffect(() => {
 if (error) {
 showErrorToast(error);
 dispatch(clearNotificationsError());
 }
 }, [error, dispatch]);

 const handleMarkRead = async (id: string) => {
 const result = await dispatch(markNotificationRead(id));
 if (markNotificationRead.fulfilled.match(result)) {
 showSuccessToast('تم تحديث الإشعار');
 }
 };

 const handleMarkAllRead = async () => {
 const result = await dispatch(markAllNotificationsRead());
 if (markAllNotificationsRead.fulfilled.match(result)) {
 showSuccessToast('تم تحديث جميع الإشعارات');
 }
 };

 const handleDelete = async (id: string) => {
 const result = await dispatch(deleteNotification(id));
 if (deleteNotification.fulfilled.match(result)) {
 showSuccessToast('تم حذف الإشعار');
 }
 };

 const formatDate = (dateStr: string) => {
 return new Date(dateStr).toLocaleDateString('ar-EG', {
 year:'numeric',
 month:'long',
 day:'numeric',
 hour:'2-digit',
 minute:'2-digit',
 });
 };

 const filteredItems = items.filter((notification) => {
 const matchesRead = readFilter ==='read'
 ? notification.isRead
 : readFilter ==='unread'
 ? !notification.isRead
 : true;
 const matchesType = typeFilter ? notification.type === typeFilter : true;
 const matchesSearch = recordMatchesAdminSearch(searchQuery, [
 notification.title,
 notification.message,
 typeLabelMap[notification.type] || notification.type,
 notification.isRead ?'مقروء' :'غير مقروء',
 formatDate(notification.createdAt),
 ]);
 return matchesRead && matchesType && matchesSearch;
 });

 const notificationTypes = Array.from(new Set(items.map((item) => item.type).filter(Boolean)));
 const isFiltering = Boolean(searchQuery.trim() || readFilter || typeFilter);

 return (
 <div className='notifications'>
 <Container>
 <HeadTitle title='الإشعارات' />

 <div className="flex justify-between items-center mb-6">
 <div className="flex items-center gap-2">
 <FaBell className="text-primary-500" />
 <p className="app-text-muted">
 {unreadCount > 0
 ? `${unreadCount} إشعار غير مقروء`
 :'لا توجد إشعارات غير مقروءة'}
 </p>
 </div>
 {unreadCount > 0 && (
 <CustomButton
 type='button'
 text='تحديد الكل كمقروء'
 radius='md'
 size='sm'
 color="primary"
 startContent={<FaCheckDouble />}
 onClick={handleMarkAllRead}
 />
 )}
 </div>

 <AdminFilterToolbar
 searchValue={searchQuery}
 onSearchChange={setSearchQuery}
 searchPlaceholder="ابحث في العنوان أو الرسالة..."
 totalCount={items.length}
 filteredCount={filteredItems.length}
 isFiltering={isFiltering}
 onReset={() => {
 setSearchQuery('');
 setReadFilter('');
 setTypeFilter('');
 }}
 filters={[
 {
 key:'read',
 label:'حالة القراءة',
 value: readFilter,
 onChange: setReadFilter,
 options: [
 { value:'', label:'الكل' },
 { value:'unread', label:'غير مقروء' },
 { value:'read', label:'مقروء' },
 ],
 },
 {
 key:'type',
 label:'النوع',
 value: typeFilter,
 onChange: setTypeFilter,
 options: [
 { value:'', label:'الكل' },
 ...notificationTypes.map((type) => ({ value: type, label: typeLabelMap[type] || type })),
 ],
 },
 ]}
 />

 {isLoading && (
 <div className="flex flex-col items-center justify-center py-20 gap-4">
 <Spinner size="lg" color="primary" />
 <p className="app-text-subtle">جاري تحميل الإشعارات...</p>
 </div>
 )}

 {!isLoading && items.length === 0 && (
 <div className="flex flex-col items-center justify-center py-20 gap-4">
 <FaBell className="text-gray-300 text-6xl" />
 <p className="app-text-subtle text-lg">لا توجد إشعارات حالياً</p>
 </div>
 )}

 {!isLoading && items.length > 0 && filteredItems.length === 0 && (
 <div className="flex flex-col items-center justify-center py-20 gap-4">
 <FaBell className="text-gray-300 text-6xl" />
 <p className="app-text-subtle text-lg">لا توجد إشعارات مطابقة للفلاتر الحالية</p>
 </div>
 )}

 <div className="flex flex-col gap-4">
 {filteredItems.map((notification) => (
 <Card
 key={notification.notificationId}
 className={`transition-colors ${
 notification.isRead
 ?'bg-white'
 :'bg-[var(--info-soft)] border border-[var(--info-soft)]'
 }`}
 >
 <CardBody className="p-4">
 <div className="flex justify-between items-start gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <h3 className="font-bold text-[var(--title-color)]">
 {notification.title}
 </h3>
 <Chip
 size="sm"
 variant="flat"
 color={typeColorMap[notification.type] ||'default'}
 >
 {typeLabelMap[notification.type] || notification.type}
 </Chip>
 {!notification.isRead && (
 <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
 )}
 </div>
 <p className="app-text-muted text-sm mb-2">
 {notification.message}
 </p>
 <p className="app-text-subtle text-xs">
 {formatDate(notification.createdAt)}
 </p>
 </div>
 <div className="flex flex-col gap-2">
 {!notification.isRead && (
 <button
 className="flex items-center gap-1 text-[var(--blue-color)] text-sm hover:underline"
 onClick={() => handleMarkRead(notification.notificationId)}
 >
 <FaEnvelopeOpen />
 تحديد كمقروء
 </button>
 )}
 <button
 className="flex items-center gap-1 text-[var(--danger-color)] text-sm hover:underline"
 onClick={() => handleDelete(notification.notificationId)}
 >
 <FaTrash />
 حذف
 </button>
 </div>
 </div>
 </CardBody>
 </Card>
 ))}
 </div>
 </Container>
 </div>
 );
};

export default Notifications;
