import usePageTitle from '../../hooks/usePageTitle';
import { CustomButton, Container } from'@mohamy/shared-ui';
import'./Cases.css';
import StatsCards from'../../components/statsCards/StatsCards';


import { GoLaw } from'react-icons/go';
import { FiArchive, FiCheckCircle, FiInbox, FiPlus, FiRefreshCw } from'react-icons/fi';
import { IoCloseCircleOutline } from'react-icons/io5';
import HeadTitle from'../../components/headTitle/HeadTitle';
import NotFoundImage from'../../components/notFound/NotFoundImage';
import thunkGetReports from'../../redux/reports/thunkGetReports';
import { Skeleton } from 'boneyard-js/react';
import { SearchInput } from'@mohamy/shared-ui';
import { FilterSelect } from'@mohamy/shared-ui';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from'@heroui/react';
import { tableClassNames } from'@mohamy/shared-ui';

import { useNavigate } from'react-router-dom';
import { useAppDispatch, useAppSelector } from'../../hooks/reduxHooks';
import { useEffect, useMemo, useState } from'react';
import thunkGetAllCases from'../../redux/cases/thunk/thunkGetAllCases';
import thunkSetCaseArchived from'../../redux/cases/thunk/thunkSetCaseArchived';
import { setPageNumber } from'../../redux/cases/casesSlice';
import { format, parseISO } from'date-fns';
import { sileo } from'sileo';
import { caseMatchesSearch } from'./caseSearch';

const safeFormatDate = (dateStr: string | null | undefined): string => {
  try { return dateStr ? format(parseISO(dateStr), 'yyyy/MM/dd') : '--'; }
  catch { return '--'; }
};

const isOpenCase = (status: number | string): boolean => status === 0 || status ==='Open';

const Cases = () => {
 const dispatch = useAppDispatch();
  usePageTitle('القضايا');
 const { cases, pageNumber, totalPages, loading } = useAppSelector((state) => state.cases);
 const { user } = useAppSelector((state) => state.auth);
 const { reports, loading: reportsLoading } = useAppSelector((state) => state.reports);
 const navigate = useNavigate();
 const safeCases = useMemo(() => Array.isArray(cases) ? cases : [], [cases]);
 
 const [searchQuery, setSearchQuery] = useState('');
 const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState('الكل');
 const [showArchived, setShowArchived] = useState(false);
 const [mutatingCaseId, setMutatingCaseId] = useState<string | number | null>(null);

 useEffect(() => {
 const timer = window.setTimeout(() => {
 setDebouncedSearchQuery(searchQuery);
 }, 320);

 return () => window.clearTimeout(timer);
 }, [searchQuery]);

 useEffect(() => {
 if (user) {
 dispatch(thunkGetAllCases({
 pageNumber,
 pageSize: 10,
 lawyerId: user.userId,
 isActive: !showArchived,
 searchQuery: debouncedSearchQuery,
 forceRefresh: true,
 }));
 }
 }, [dispatch, user, pageNumber, showArchived, debouncedSearchQuery]);

 useEffect(() => {
 dispatch(thunkGetReports());
 }, [dispatch]);

 const filteredCases = useMemo(() => {
 return safeCases.filter((caseItem) => {
 const statusMatches =
 statusFilter ==='الكل' ||
 (statusFilter ==='متداولة' && isOpenCase(caseItem.status)) ||
 (statusFilter ==='المنتهية' && !isOpenCase(caseItem.status));

 return statusMatches && caseMatchesSearch(caseItem, searchQuery);
 });
 }, [safeCases, searchQuery, statusFilter]);

 const handleSearchChange = (value: string) => {
 setSearchQuery(value);
 if (pageNumber !== 1) {
 dispatch(setPageNumber(1));
 }
 };

 const toggleArchiveView = () => {
 setShowArchived((current) => !current);
 setStatusFilter('الكل');
 if (pageNumber !== 1) {
 dispatch(setPageNumber(1));
 }
 };

 const handleArchiveStatus = async (caseId: string | number, isArchived: boolean) => {
 setMutatingCaseId(caseId);
 try {
 await dispatch(thunkSetCaseArchived({ id: caseId, isArchived })).unwrap();
 sileo.success({ title: isArchived ?'تمت أرشفة القضية' :'تم استرجاع القضية' });
 if (user) {
 dispatch(thunkGetAllCases({
 pageNumber,
 pageSize: 10,
 lawyerId: user.userId,
 isActive: !showArchived,
 searchQuery: debouncedSearchQuery,
 forceRefresh: true,
 }));
 dispatch(thunkGetReports());
 }
 } catch (error) {
 sileo.error({ title: typeof error ==='string' ? error :'تعذر تحديث حالة القضية' });
 } finally {
 setMutatingCaseId(null);
 }
 };

 return (
 <section className='cases'>
 <Container>
 <HeadTitle title='إدارة القضايا' />
 <Skeleton
 name="cases-stats"
 loading={reportsLoading ==='pending' || reportsLoading === 'idle'}
 fixture={
 <StatsCards
 card1={{ icon: <GoLaw />, iconColor:'var(--main-color)', text:'إجمالي القضايا', number: 0 }}
 card2={{ icon: <FiCheckCircle />, iconColor:'var(--success-color)', text:'قضايا متداولة', number: 0 }}
 card3={{ icon: <IoCloseCircleOutline />, iconColor:'#8B5CF6', text:'القضايا المنتهية', number: 0 }}
 />
 }
 >
 {reports && reportsLoading ==='succeeded' ? (
 <StatsCards
 card1={{
 icon: <GoLaw />,
 iconColor:'var(--main-color)',
 text:'إجمالي القضايا',
 number: reports.totalCases,
 }}
 card2={{
 icon: <FiCheckCircle />,
 iconColor:'var(--success-color)',
 text:'قضايا متداولة',
 number: reports.totalActiveCases,
 }}
 card3={{
 icon: <IoCloseCircleOutline />,
 iconColor:'#8B5CF6',
 text:'القضايا المنتهية',
 number: 0,
 }}
 />
 ) : null}
 </Skeleton>

 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-8">
 <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
 <SearchInput
 placeholder="ابحث برقم القضية أو المحكمة أو اسم الموكل أو الخصم..."
 value={searchQuery}
 onValueChange={handleSearchChange}
 />
 <FilterSelect
 label="الحالة"
 options={[
 { value:'الكل', label:'الكل' },
 { value:'متداولة', label:'متداولة' },
 { value:'المنتهية', label:'المنتهية' }
 ]}
 selectedKeys={[statusFilter]}
 onSelectionChange={(keys) => {
 const value = Array.from(keys as Iterable<unknown>)[0];
 setStatusFilter(typeof value ==='string' ? value :'الكل');
 }}
 className="w-48"
 />
 </div>
 <div className="flex flex-wrap items-center gap-3">
 <CustomButton
 type='button'
 text={showArchived ?'عرض القضايا النشطة' :'عرض الأرشيف'}
 color={showArchived ?'primary' :'default'}
 variant={showArchived ?'solid' :'bordered'}
 radius='full'
 size='md'
 startContent={showArchived ? <FiInbox /> : <FiArchive />}
 onClick={toggleArchiveView}
 />
 <CustomButton
 type='button'
 text='إنشاء قضية'
 color='primary'
 radius='full'
 size='lg'
 startContent={<FiPlus />}
 onClick={() => navigate('/documents')}
 />
 </div>
 </div>

 <div className="w-full">
 <Skeleton
 name="cases-table"
 loading={loading === 'pending' || loading === 'idle'}
 fixture={
 <Table aria-label="جدول القضايا" color="primary" selectionMode="single" classNames={tableClassNames}>
 <TableHeader>
 <TableColumn>رقم القضية</TableColumn>
 <TableColumn>عنوان القضية</TableColumn>
 <TableColumn>الحالة</TableColumn>
 <TableColumn>المحكمة</TableColumn>
 <TableColumn>تاريخ الإنشاء</TableColumn>
 <TableColumn>الإجراءات</TableColumn>
 </TableHeader>
 <TableBody>
 {[1, 2, 3, 4, 5].map((i) => (
 <TableRow key={i}>
 <TableCell><span className="font-semibold text-transparent">12345</span></TableCell>
 <TableCell>
 <div>
 <span className="block font-semibold text-transparent">عنوان قضية تجريبي</span>
 <span className="block text-xs text-transparent">نوع القضية</span>
 </div>
 </TableCell>
 <TableCell><span className="case-status-badge text-transparent">متداولة</span></TableCell>
 <TableCell><span className="font-medium text-transparent">محكمة الإسكندرية</span></TableCell>
 <TableCell><span className="font-medium text-transparent">2026/04/25</span></TableCell>
 <TableCell>
 <div className="case-actions">
 <CustomButton type="button" text="عرض التفاصيل" size="sm" color="primary" radius="md" />
 <CustomButton type="button" text="أرشفة" size="sm" color="default" variant="bordered" radius="md" />
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 }
 >
 <Table 
 aria-label="جدول القضايا" 
 color="primary" 
 selectionMode="single"
 classNames={tableClassNames}
 >
 <TableHeader>
 <TableColumn>رقم القضية</TableColumn>
 <TableColumn>عنوان القضية</TableColumn>
 <TableColumn>الحالة</TableColumn>
 <TableColumn>المحكمة</TableColumn>
 <TableColumn>تاريخ الإنشاء</TableColumn>
 <TableColumn>الإجراءات</TableColumn>
 </TableHeader>
 <TableBody 
 items={filteredCases}
 emptyContent={
 loading ==='succeeded' && filteredCases.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-10 gap-3">
 <NotFoundImage text={showArchived ?'لا توجد قضايا مؤرشفة لعرضها.' :'لا توجد بيانات قضايا لعرضها.'} variant='cases' />
 <CustomButton 
 type="button"
 color="primary" 
 onClick={showArchived ? toggleArchiveView : () => navigate('/documents')} 
 startContent={showArchived ? <FiInbox /> : <FiPlus />}
 text={showArchived ?'عرض القضايا النشطة' :'إنشاء قضية'}
 size="md"
 radius="full"
 />
 </div>
 ) : (
 loading ==='failed' ? (
 <div className="text-center p-5">
 <p>حدث خطأ في تحميل البيانات، يرجى إعادة تسجيل الدخول.</p>
 <CustomButton type='button' radius='md' size='md' text="تسجيل الدخول" onClick={() => navigate('/auth/login')} />
 </div>
 ) : null
 )
 }
 >
 {(caseItem) => (
 <TableRow key={caseItem.id}>
 <TableCell>
 <span className="font-semibold" style={{ color:'var(--title-color)' }}>{caseItem.number}</span>
 </TableCell>
 <TableCell>
 <div>
 <span className="block font-semibold" style={{ color:'var(--title-color)' }}>{caseItem.title}</span>
 <span className="block text-xs app-text-subtle">{caseItem.caseTypeName}</span>
 </div>
 </TableCell>
 <TableCell>
 <span className={`case-status-badge ${caseItem.isActive === false ?'archived' : isOpenCase(caseItem.status) ?'active' :'closed'}`}>
 <span className="case-status-dot"></span>
 {caseItem.isActive === false ?'مؤرشفة' : isOpenCase(caseItem.status) ?'متداولة' :'منتهية'}
 </span>
 </TableCell>
 <TableCell><span className="font-medium" style={{ color:'var(--text-color)' }}>{caseItem.court}</span></TableCell>
  <TableCell><span className="font-medium" style={{ color:'var(--text-color)' }}>{safeFormatDate(caseItem.creationDate)}</span></TableCell>
 <TableCell>
 <div className="case-actions">
 <CustomButton
 type="button"
 text="عرض التفاصيل"
 size="sm"
 color="primary"
 radius="md"
 onClick={() => navigate(`/cases/${caseItem.id}`, { state: { caseItem } })}
 />
 <CustomButton
 type="button"
 text={showArchived ?'استرجاع' :'أرشفة'}
 size="sm"
 color={showArchived ?'success' :'default'}
 variant={showArchived ?'flat' :'bordered'}
 radius="md"
 startContent={showArchived ? <FiRefreshCw size={14} /> : <FiArchive size={14} />}
 isLoading={mutatingCaseId === caseItem.id}
 onClick={() => handleArchiveStatus(caseItem.id, !showArchived)}
 />
 </div>
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 </Skeleton>
 </div>

 {loading !=='pending' && safeCases.length > 0 && (
 <div className="flex w-full justify-center mt-6">
 <Pagination
 initialPage={1}
 page={pageNumber}
 total={totalPages}
 onChange={(page) => dispatch(setPageNumber(page))}
 color='primary'
 className='cursor-pointer'
 />
 </div>
 )}
 </Container>
 </section>
 );
};

export default Cases;
