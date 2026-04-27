import usePageTitle from '../../hooks/usePageTitle';
import { CustomButton, Container } from'@mohamy/shared-ui';
import'./Cases.css';
import StatsCards from'../../components/statsCards/StatsCards';


import { GoLaw } from'react-icons/go';
import { FiCheckCircle, FiPlus } from'react-icons/fi';
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
import { useEffect, useState } from'react';
import thunkGetAllCases from'../../redux/cases/thunk/thunkGetAllCases';
import { setPageNumber } from'../../redux/cases/casesSlice';
import { format, parseISO } from'date-fns';

const safeFormatDate = (dateStr: string | null | undefined): string => {
  try { return dateStr ? format(parseISO(dateStr), 'yyyy/MM/dd') : '--'; }
  catch { return '--'; }
};

const Cases = () => {
 const dispatch = useAppDispatch();
  usePageTitle('القضايا');
 const { cases, pageNumber, totalPages, loading } = useAppSelector((state) => state.cases);
 const { user } = useAppSelector((state) => state.auth);
 const { reports, loading: reportsLoading } = useAppSelector((state) => state.reports);
 const navigate = useNavigate();
 const safeCases = Array.isArray(cases) ? cases : [];
 
 const [searchQuery, setSearchQuery] = useState('');

 useEffect(() => {
 if (user) {
 dispatch(thunkGetAllCases({ pageNumber, pageSize: 10, lawyerId: user.userId }));
 }
 dispatch(thunkGetReports());
 }, [dispatch, user, pageNumber]);

 const filterCases = (status: string) => {
 const isActive = status ==='المنتهية' ? false : true;
 dispatch(thunkGetAllCases({ lawyerId: user?.userId, pageNumber, isActive }));
 }
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
 placeholder="ابحث برقم القضية أو المحكمة..."
 value={searchQuery}
 onValueChange={setSearchQuery}
 />
 <FilterSelect
 label="الحالة"
 options={[
 { value:'الكل', label:'الكل' },
 { value:'متداولة', label:'متداولة' },
 { value:'المنتهية', label:'المنتهية' }
 ]}
 onChange={(e) => filterCases(e.target.value)}
 className="w-48"
 />
 </div>
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
 <CustomButton type="button" text="عرض التفاصيل" size="sm" color="primary" radius="md" />
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
 items={safeCases}
 emptyContent={
 loading ==='succeeded' && safeCases.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-10 gap-3">
 <NotFoundImage text='لا توجد بيانات قضايا لعرضها.' variant='cases' />
 <CustomButton 
 type="button"
 color="primary" 
 onClick={() => navigate('/documents')} 
 startContent={<FiPlus />}
 text="إنشاء قضية"
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
 <span className={`case-status-badge ${caseItem.status === 0 || caseItem.status ==='Open' ?'active' :'closed'}`}>
 <span className="case-status-dot"></span>
 {caseItem.status === 0 || caseItem.status ==='Open' ?'متداولة' :'منتهية'}
 </span>
 </TableCell>
 <TableCell><span className="font-medium" style={{ color:'var(--text-color)' }}>{caseItem.court}</span></TableCell>
  <TableCell><span className="font-medium" style={{ color:'var(--text-color)' }}>{safeFormatDate(caseItem.creationDate)}</span></TableCell>
 <TableCell>
 <CustomButton
 type="button"
 text="عرض التفاصيل"
 size="sm"
 color="primary"
 radius="md"
 onClick={() => navigate(`/cases/${caseItem.id}`, { state: { caseItem } })}
 />
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
