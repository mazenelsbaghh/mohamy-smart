import React, { useMemo, useState } from'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner } from'@heroui/react';
import { FiPlus } from'react-icons/fi';
import { CustomButton, tableClassNames } from'@mohamy/shared-ui';
import { SearchInput } from'@mohamy/shared-ui';
import NotFoundImage from'../../notFound/NotFoundImage';

type Column = {
 uid: string;
 name: string;
 sortable?: boolean;
};

type DataTableProps<T> = {
 columns: Column[];
 data: T[];
 renderCell: (item: T, columnKey: React.Key) => React.ReactNode;
 keyField: keyof T;
 
 // Top Content Props
 searchPlaceholder?: string;
 searchKeys?: (keyof T)[];
 onAdd?: () => void;
 addLabel?: string;
 
 // Loading State
 isLoading?: boolean;
 
 // Actions
 onRowAction?: (key: React.Key) => void;
 
 // Custom View Toggle (optional)
 customTopContent?: React.ReactNode;
 
 // Alternative Card View
 renderCard?: (item: T) => React.ReactNode;
 viewMode?:'table' |'card';
};

export function DataTable<T extends Record<string, unknown>>({
 columns,
 data,
 renderCell,
 keyField,
 searchPlaceholder,
 searchKeys,
 onAdd,
 addLabel,
 isLoading,
 onRowAction,
 customTopContent,
 renderCard,
 viewMode ='table'
}: DataTableProps<T>) {
 const [searchQuery, setSearchQuery] = useState('');
 const [page, setPage] = useState(1);
 const rowsPerPage = 10;
 const safeData = useMemo(() => Array.isArray(data) ? data : [], [data]);

 // Search Logic
 const filteredData = useMemo(() => {
 if (!searchQuery || !searchKeys || searchKeys.length === 0) return safeData;
 const lowerQuery = searchQuery.toLowerCase();
 return safeData.filter((item) => {
 return searchKeys.some((key) => {
 const val = item[key];
 return val && String(val).toLowerCase().includes(lowerQuery);
 });
 });
 }, [safeData, searchQuery, searchKeys]);

 // Pagination Logic
 const pages = Math.ceil(filteredData.length / rowsPerPage) || 1;
 const items = useMemo(() => {
 const start = (page - 1) * rowsPerPage;
 const end = start + rowsPerPage;
 return filteredData.slice(start, end);
 }, [page, filteredData, rowsPerPage]);

 // Top Content (Search, Filters, Add Button)
 const topContent = useMemo(() => {
 if (!searchPlaceholder && !onAdd && !customTopContent) return null;
 
 return (
 <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-4">
 <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
 {searchPlaceholder && (
 <SearchInput
 placeholder={searchPlaceholder}
 value={searchQuery}
 onValueChange={setSearchQuery}
 />
 )}
 {customTopContent}
 </div>
 {onAdd && addLabel && (
 <CustomButton
 type="button"
 text={addLabel}
 startContent={<FiPlus />}
 color="primary"
 radius="full"
 size="md"
 onClick={onAdd}
 />
 )}
 </div>
 );
 }, [searchQuery, searchPlaceholder, onAdd, addLabel, customTopContent]);

 if (viewMode ==='card' && renderCard) {
 return (
 <div className="w-full">
 {topContent}
 <div className="flex flex-wrap">
 {items.map((item) => renderCard(item))}
 </div>
 {pages > 1 && (
 <div className="flex w-full justify-center mt-6">
 <Pagination
 isCompact
 showControls
 showShadow
 color="primary"
 page={page}
 total={pages}
 onChange={setPage}
 />
 </div>
 )}
 </div>
 );
 }

 return (
 <div className="w-full">
 {topContent}
 <Table
 aria-label="Data Table"
 color="primary"
 selectionMode={onRowAction ?"single" :"none"}
 onRowAction={onRowAction}
 classNames={tableClassNames}
 >
 <TableHeader columns={columns}>
 {(column) => (
 <TableColumn key={column.uid} align={column.uid ==='actions' ?'center' :'start'}>
 {column.name}
 </TableColumn>
 )}
 </TableHeader>
 <TableBody
 items={items}
 isLoading={isLoading}
 loadingContent={<Spinner label="جاري تحميل البيانات..." />}
 emptyContent={isLoading ? "" : <NotFoundImage text="لا توجد بيانات مطابقة للبحث الحالي." />}
 >
 {(item) => (
 <TableRow key={String(item[keyField])}>
 {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
 </TableRow>
 )}
 </TableBody>
 </Table>
 
 {pages > 1 && (
 <div className="flex w-full justify-center mt-6">
 <Pagination
 isCompact
 showControls
 showShadow
 color="primary"
 page={page}
 total={pages}
 onChange={setPage}
 />
 </div>
 )}
 </div>
 );
}
