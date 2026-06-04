import { Container, CustomTable } from'@mohamy/shared-ui';
import { useEffect, useState } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import HeadTitle from"../../components/public/headTitle/HeadTitle";

import { Spinner, Chip, Button } from"@heroui/react";

import fetchContactRequests from"../../redux/contacts/thunk/fetchContactRequests";
import updateContactStatus from"../../redux/contacts/thunk/updateContactStatus";
import AdminFilterToolbar from"../../components/adminFilters/AdminFilterToolbar";
import { recordMatchesAdminSearch } from"../../components/adminFilters/adminFilterUtils";

const statusOptions = [
 { key:"", label:"الكل" },
 { key:"New", label:"جديد" },
 { key:"Read", label:"مقروء" },
 { key:"Replied", label:"تم الرد" },
];

const statusColorMap: Record<string,"default" |"primary" |"success" |"warning"> = {"New":"warning","Read":"primary","Replied":"success",
};

const statusLabelMap: Record<string, string> = {"New":"جديد","Read":"مقروء","Replied":"تم الرد",
};

const ContactRequests = () => {
 const dispatch = useAppDispatch();
 const { list: contacts, isLoading, error } = useAppSelector(
 (state) => state.contacts
 );
 const [statusFilter, setStatusFilter] = useState<string>("");
 const [searchQuery, setSearchQuery] = useState<string>("");

 useEffect(() => {
 dispatch(fetchContactRequests(statusFilter || undefined));
 }, [dispatch, statusFilter]);

 const handleStatusChange = (contactId: string, newStatus: string) => {
 dispatch(updateContactStatus({ id: contactId, status: newStatus }));
 };

 const handleRetry = () => {
 dispatch(fetchContactRequests(statusFilter || undefined));
 };

 const filteredContacts = contacts.filter((contact) =>
 recordMatchesAdminSearch(searchQuery, [
 contact.name,
 contact.phone,
 contact.message,
 statusLabelMap[contact.status] || contact.status,
 ])
 );

 const isFiltering = Boolean(searchQuery.trim() || statusFilter);

 return (
 <section className="pb-20">
 <Container>
 <HeadTitle title="طلبات التواصل" />

 <AdminFilterToolbar
 searchValue={searchQuery}
 onSearchChange={setSearchQuery}
 searchPlaceholder="ابحث بالاسم، الهاتف، الرسالة..."
 totalCount={contacts.length}
 filteredCount={filteredContacts.length}
 isFiltering={isFiltering}
 onReset={() => {
 setSearchQuery("");
 setStatusFilter("");
 }}
 filters={[
 {
 key:"status",
 label:"الحالة",
 value: statusFilter,
 onChange: setStatusFilter,
 options: statusOptions.map((option) => ({ value: option.key, label: option.label })),
 },
 ]}
 />

 {isLoading && contacts.length === 0 ? (
 <div className="flex justify-center items-center min-h-[50vh]">
 <Spinner size="lg" color="primary" />
 </div>
 ) : error ? (
 <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
 <p className="text-lg app-text-subtle">{error}</p>
 <button
 className="text-primary underline"
 onClick={handleRetry}
 >
 إعادة المحاولة
 </button>
 </div>
 ) : contacts.length === 0 ? (
 <div className="flex flex-col items-center justify-center min-h-[30vh] gap-2">
 <p className="text-lg app-text-subtle">لا توجد طلبات تواصل</p>
 {statusFilter && (
 <p className="text-sm app-text-subtle">جرب تغيير فلتر الحالة</p>
 )}
 </div>
 ) : filteredContacts.length === 0 ? (
 <div className="flex flex-col items-center justify-center min-h-[30vh] gap-2">
 <p className="text-lg app-text-subtle">لا توجد طلبات مطابقة للفلاتر الحالية</p>
 </div>
 ) : (
 <CustomTable
 columns={[
 { key:"name", label:"الاسم" },
 { key:"phone", label:"الهاتف" },
 { key:"message", label:"الرسالة" },
 { key:"date", label:"التاريخ" },
 { key:"status", label:"الحالة" },
 { key:"actions", label:"الإجراءات" },
 ]}
 data={filteredContacts.map(contact => ({
 key: contact.id,
 name: contact.name,
 phone: <span dir="ltr">{contact.phone}</span>,
 message: <span className="max-w-xs truncate block">{contact.message}</span>,
 date: new Date(contact.submittedAt).toLocaleDateString("ar-EG"),
 status: (
 <Chip
 color={statusColorMap[contact.status] ||"default"}
 size="sm"
 variant="flat"
 >
 {statusLabelMap[contact.status] || contact.status}
 </Chip>
 ),
 actions: (
 <div className="flex gap-1">
 {contact.status !=="Read" && (
 <Button
 size="sm"
 color="primary"
 variant="flat"
 onPress={() => handleStatusChange(contact.id,"Read")}
 >
 مقروء
 </Button>
 )}
 {contact.status !=="Replied" && (
 <Button
 size="sm"
 color="success"
 variant="flat"
 onPress={() => handleStatusChange(contact.id,"Replied")}
 >
 تم الرد
 </Button>
 )}
 </div>
 )
 }))}
 />
 )}
 </Container>
 </section>
 );
};

export default ContactRequests;
