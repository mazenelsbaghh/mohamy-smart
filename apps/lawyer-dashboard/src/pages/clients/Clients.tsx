import usePageTitle from '../../hooks/usePageTitle';
import { CustomButton, Container } from'@mohamy/shared-ui';
import'./Clients.css';
import { useNavigate } from 'react-router-dom';
import HeadTitle from'../../components/headTitle/HeadTitle';
import SubTitle from'../../components/subTitle/SubTitle';
import { getInitials, getAvatarColor } from'../../utils/avatar';


import StatsCard from'../../components/statsCards/StatsCard';

import { Pagination, useDisclosure, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from'@heroui/react';

import { FiPlus, FiRefreshCw } from'react-icons/fi';
import { MdOutlineStars } from'react-icons/md';
import { FaUsers } from'react-icons/fa';
import FormModal from'../../components/ui/form/FormModal';
import NotFoundImage from'../../components/notFound/NotFoundImage';
import AddNewClientForm from'../../components/forms/AddNewClientForm';
import { SearchInput } from'@mohamy/shared-ui';
import { tableClassNames } from'@mohamy/shared-ui';
import { useAppDispatch, useAppSelector } from'../../hooks/reduxHooks';
import { Skeleton } from 'boneyard-js/react';
import { useEffect, useState } from'react';
import thunkGetAllClients from'../../redux/clients/thunk/thunkGetAllClients';
import { format, parseISO } from'date-fns';



const safeFormatDate = (dateStr: string | null | undefined): string => {
  try { return dateStr ? format(parseISO(dateStr), 'yyyy/MM/dd') : '--'; }
  catch { return '--'; }
};

const Clients = () => {
 const navigate = useNavigate();
  usePageTitle('الموكلون');
 const dispatch = useAppDispatch();
 const { clients, pageNumber, totalPages, loading } = useAppSelector((state) => state.clients);
 const { user } = useAppSelector((state) => state.auth);

 const [activePage, setActivePage] = useState(pageNumber || 1);
 const [searchQuery, setSearchQuery] = useState('');

 const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
 const safeClients = Array.isArray(clients) ? clients : [];

 const filteredClients = safeClients.filter(client => {
 const search = searchQuery.toLowerCase();
 return client.clientName.toLowerCase().includes(search) || 
 (client.phoneNumber && client.phoneNumber.includes(search));
 });

 useEffect(() => {
 if (user) {
 dispatch(thunkGetAllClients({ pageNumber: activePage, pageSize: 10, lawyerId: user.userId }));
 }
 }, [dispatch, user, activePage]);

 return (
 <section className='clients'>
 <Container>
 <HeadTitle title='إدارة الموكلين' />

 {/* Insights Cards */}
 <Skeleton
 name="clients-stats"
 loading={loading === 'pending' || loading === 'idle'}
 fixture={
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
 <StatsCard icon={<FaUsers />} iconColor="var(--main-color)" text="إجمالي الموكلين" number={0} />
 <StatsCard icon={<MdOutlineStars />} iconColor="var(--success-color)" text="موكلون نشطون" number={0} />
 </div>
 }
 >
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
 <StatsCard
 icon={<FaUsers />}
 iconColor="var(--main-color)"
 text="إجمالي الموكلين"
 number={safeClients.length}
 />
 <StatsCard
 icon={<MdOutlineStars />}
 iconColor="var(--success-color)"
 text="موكلون نشطون"
 number={safeClients.filter(c => c.caseId).length}
 />
 </div>
 </Skeleton>

 <SubTitle
 title='قائمة الموكلين'
 components={
 <div className='flex flex-wrap items-center justify-end gap-3 w-full'>
 <SearchInput
 placeholder="ابحث بالاسم أو الهاتف..."
 value={searchQuery}
 onValueChange={setSearchQuery}
 />
 <CustomButton
 type='button'
 text='إضافة موكل'
 startContent={<FiPlus />}
 size='md'
 color='primary'
 radius='full'
 onClick={onOpen}
 />
 </div>
 }
 />

 <div className="flex flex-wrap w-full">
 {loading ==='failed' ? (
 <div className="w-full flex flex-col items-center justify-center py-16 gap-4">
 <p className="text-lg font-bold" style={{ color:'var(--danger-color)' }}>تعذر تحميل بيانات الموكلين</p>
 <CustomButton
 type="button"
 text="إعادة المحاولة"
 size="md"
 radius="full"
 color="primary"
 startContent={<FiRefreshCw size={14} />}
 onClick={() => user && dispatch(thunkGetAllClients({ pageNumber: activePage, pageSize: 10, lawyerId: user.userId }))}
 />
 </div>
 ) : (
 <div className="w-full">
 <Skeleton
 name="clients-table"
 loading={loading === 'pending' || loading === 'idle'}
 fixture={
 <Table aria-label="جدول الموكلين" color="primary" selectionMode="single" classNames={tableClassNames}>
 <TableHeader>
 <TableColumn>الموكل</TableColumn>
 <TableColumn>الحالة</TableColumn>
 <TableColumn>القضايا</TableColumn>
 <TableColumn>تاريخ الانضمام</TableColumn>
 <TableColumn>الإجراءات</TableColumn>
 </TableHeader>
 <TableBody>
 {[1, 2, 3, 4, 5].map((i) => (
 <TableRow key={i}>
 <TableCell>
 <div className="flex items-center gap-3">
 <div className="client-avatar small" className="bg-[var(--surface-muted,#e5e7eb)]">م</div>
 <div>
 <span className="block font-semibold text-transparent">اسم موكل تجريبي</span>
 <span className="block text-xs text-transparent">0123456789</span>
 </div>
 </div>
 </TableCell>
 <TableCell><span className="client-badge text-transparent">موكل نشط</span></TableCell>
 <TableCell>
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-gray-300"></span>
 <span className="text-sm font-medium text-transparent">مرتبط بقضية</span>
 </div>
 </TableCell>
 <TableCell><span className="font-medium text-transparent">2026/04/25</span></TableCell>
 <TableCell><CustomButton type="button" text="عرض التفاصيل" size="sm" color="primary" radius="md" /></TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 }
 >
 <Table 
 aria-label="جدول الموكلين" 
 color="primary" 
 selectionMode="single"
 classNames={tableClassNames}
 >
 <TableHeader>
 <TableColumn>الموكل</TableColumn>
 <TableColumn>الحالة</TableColumn>
 <TableColumn>القضايا</TableColumn>
 <TableColumn>تاريخ الانضمام</TableColumn>
 <TableColumn>الإجراءات</TableColumn>
 </TableHeader>
 <TableBody 
 items={filteredClients}
 emptyContent={
 <div className="flex flex-col items-center justify-center py-10 gap-3">
 <NotFoundImage text="لا توجد بيانات موكلين لعرضها." variant="clients" />
 <CustomButton 
 type="button"
 color="primary" 
 onClick={onOpen} 
 startContent={<FiPlus />}
 text="إضافة موكل"
 size="md"
 radius="full"
 />
 </div>
 }
 >
 {(client) => (
 <TableRow key={client.id}>
 <TableCell>
 <div className="flex items-center gap-3">
 <div className="client-avatar small" style={{ backgroundColor: getAvatarColor(client.id) }}>
 {getInitials(client.clientName)}
 </div>
 <div>
 <span className="block font-semibold" style={{ color:'var(--title-color)' }}>{client.clientName}</span>
 <span className="block text-xs app-text-subtle" dir="ltr">{client.phoneNumber ||'-'}</span>
 </div>
 </div>
 </TableCell>
 <TableCell>
 <span className={`client-badge ${client.caseId ?'active' :'unlinked'}`}>
 {client.caseId ?'موكل نشط' :'فرد عادي'}
 </span>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-2">
 <span className={`w-2 h-2 rounded-full ${client.caseId ?'pulse-dot' :'inactive-dot'}`}></span>
 <span className="text-sm font-medium" style={{ color:'var(--text-color)' }}>{client.caseId ?'مرتبط بقضية' :'لا توجد'}</span>
 </div>
 </TableCell>
  <TableCell><span className="font-medium" style={{ color:'var(--text-color)' }}>{safeFormatDate(client.creationDate)}</span></TableCell>
 <TableCell>
 <CustomButton
 type="button"
 text="عرض التفاصيل"
 size="sm"
 color="primary"
 radius="md"
 onClick={() => navigate(`/clients/${client.id}`)}
 />
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 </Skeleton>
 </div>
 )}
 </div>

 {loading !=='pending' && filteredClients.length > 0 && (
 <div className="pagination-box mt-6 flex justify-center">
 <Pagination
 initialPage={1}
 page={activePage}
 total={totalPages}
 onChange={(page) => setActivePage(page)}
 color='primary'
 className='cursor-pointer'
 />
 </div>
 )}

 </Container>
 <FormModal isOpen={isOpen} onOpenChange={onOpenChange} title='إضافة موكل جديد' size='3xl'>
 <AddNewClientForm onClose={onClose} />
 </FormModal>
 </section>
 );
};

export default Clients;
