import usePageTitle from '../../hooks/usePageTitle';
import { CustomButton } from'@mohamy/shared-ui';
import React, { useEffect, useState } from'react';
import { useNavigate } from'react-router-dom';
import { useDispatch, useSelector } from'react-redux';
import type { AppDispatch, RootState } from'../../redux/store';
import { fetchLegalContracts } from'../../redux/legalContracts/legalContractsSlice';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Button, Chip, Spinner } from'@heroui/react';
import { motion } from'framer-motion';
import { FiPlus, FiEye } from'react-icons/fi';
import { tableClassNames } from'@mohamy/shared-ui';
import { SearchInput } from'@mohamy/shared-ui';
import { FilterSelect } from'@mohamy/shared-ui';
import type { TLegalContract } from'../../types/types';

import NotFoundImage from'../../components/notFound/NotFoundImage';

const LegalContractsList: React.FC = () => {
 const dispatch = useDispatch<AppDispatch>();
  usePageTitle('العقود القانونية');
 const navigate = useNavigate();
 
 const [page, setPage] = useState(1);
 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const rowsPerPage = 10;

 const { contracts, totalContracts, isLoadingContracts, error } = useSelector((state: RootState) => state.legalContracts);

 useEffect(() => {
 dispatch(fetchLegalContracts({ page, pageSize: rowsPerPage }));
 }, [dispatch, page]);

 const pages = Math.ceil(totalContracts / rowsPerPage) || 1;

 const STUCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

 const isStuckDrafting = (contract: TLegalContract) => {
 if (contract.status !=='DraftingRequested') return false;
 const age = Date.now() - new Date(contract.createdAt).getTime();
 return age > STUCK_THRESHOLD_MS;
 };

 const renderStatus = (status: string, contract?: TLegalContract) => {
 if (status ==='DraftingRequested' && contract && isStuckDrafting(contract)) {
 return <Chip color="danger" variant="flat">فشل (انتهت المهلة)</Chip>;
 }
 switch (status) {
 case'Generated':
 return <Chip color="success" variant="flat">مكتمل</Chip>;
 case'DraftingRequested':
 return <Chip color="warning" variant="flat">جاري الصياغة</Chip>;
 case'Failed':
 return <Chip color="danger" variant="flat">فشل</Chip>;
 default:
 return <Chip variant="flat">{status}</Chip>;
 }
 };

 const safeContracts = Array.isArray(contracts) ? contracts : [];
 const filteredContracts = safeContracts.filter((c: TLegalContract) => {
 if (statusFilter && c.status !== statusFilter) return false;
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 return c.contractType?.toLowerCase().includes(q) || c.clientName?.toLowerCase().includes(q);
 }
 return true;
 });

 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="w-full py-4 px-4 sm:px-10"
 >
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
 <div>
 <h1 className="text-2xl font-bold text-[var(--title-color)]">صياغة العقود</h1>
 <p className="text-sm app-text-subtle">استعرض وسجل مسودات العقود المنجزة عبر الذكاء الاصطناعي</p>
 </div>
 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
 <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
 <SearchInput
 placeholder="ابحث بنوع العقد أو الموكل..."
 value={searchQuery}
 onValueChange={setSearchQuery}
 />
 <FilterSelect
 label="الحالة"
 options={[
 { value:'', label:'الكل' },
 { value:'Generated', label:'مكتمل' },
 { value:'DraftingRequested', label:'جاري الصياغة' },
 { value:'Failed', label:'فشل' }
 ]}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-48"
 />
 </div>
 <CustomButton 
 type="button"
 color="primary" 
 startContent={<FiPlus />}
 onClick={() => navigate('/legal-contracts/new')}
 text="إنشاء عقد جديد"
 radius="full"
 size="md"
 />
 </div>
 </div>

 {error && (
 <div className="mb-4 p-4 bg-[var(--danger-soft)] text-[var(--danger-color)] dark:text-[var(--danger-color)] rounded-lg text-sm">
 {error}
 </div>
 )}

 <Table 
 aria-label="قائمة العقود القانونية"
 color="primary" 
 selectionMode="single"
 classNames={tableClassNames}
 bottomContent={
 pages > 1 ? (
 <div className="flex w-full justify-center">
 <Pagination
 isCompact
 showControls
 showShadow
 color="primary"
 page={page}
 total={pages}
 onChange={(p) => setPage(p)}
 />
 </div>
 ) : null
 }
 >
 <TableHeader>
 <TableColumn>نوع العقد</TableColumn>
 <TableColumn>الموكل</TableColumn>
 <TableColumn>تاريخ الإنشاء</TableColumn>
 <TableColumn>الحالة</TableColumn>
 <TableColumn align="center">الإجراءات</TableColumn>
 </TableHeader>
 <TableBody 
 items={filteredContracts} 
 isLoading={isLoadingContracts}
 loadingContent={<Spinner label="جاري تحميل العقود..." />}
 emptyContent={
 !isLoadingContracts && safeContracts.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-10 gap-3">
 <NotFoundImage text="لا توجد عقود مسجلة بعد." variant="cases" />
 <CustomButton 
 type="button"
 color="primary" 
 onClick={() => navigate('/legal-contracts/new')} 
 text="إنشاء عقد جديد"
 size="md"
 radius="full"
 />
 </div>
 ) :""
 }
 >
 {(item) => (
 <TableRow key={item.contractId}>
 <TableCell className="font-medium">{item.contractType}</TableCell>
 <TableCell>{item.clientName}</TableCell>
 <TableCell>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</TableCell>
 <TableCell>{renderStatus(item.status, item)}</TableCell>
 <TableCell>
 <div className="flex justify-center">
 <Button 
 isIconOnly
 variant="light" 
 color="primary"
 onPress={() => navigate(`/legal-contracts/${item.contractId}`)}
 isDisabled={!item.detailAvailable && !isStuckDrafting(item)}
 >
 <FiEye size={18} />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 </motion.div>
 );
};

export default LegalContractsList;
