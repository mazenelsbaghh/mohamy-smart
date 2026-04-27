import { Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Spinner } from'@heroui/react';
import { useNavigate, useLocation } from'react-router-dom';
import type { ReactNode } from'react';
import { tableClassNames } from'@mohamy/shared-ui';

type Column = {
 key: string;
 label: string;
};

type ServerPaginationTableProps<T extends { key: string }> = {
 data: T[];
 columns: Column[];
 page: number;
 totalPages: number;
 onPageChange: (page: number) => void;
 isLoading?: boolean;
 linkPrefix?: string;
};

const ServerPaginationTable = <T extends { key: string }>({
 data,
 columns,
 page,
 totalPages,
 onPageChange,
 isLoading,
}: ServerPaginationTableProps<T>) => {
 const { pathname } = useLocation();
 const navigate = useNavigate();

 return (
 <>
 <Table
 aria-label="Server paginated table"
 color="primary"
 selectionMode="single"
 onRowAction={(key) => navigate(`${pathname}/${key}`)}
 classNames={tableClassNames}
 >
 <TableHeader>
 {columns.map((col) => (
 <TableColumn key={col.key}>{col.label}</TableColumn>
 ))}
 </TableHeader>
 <TableBody
 items={data}
 isLoading={isLoading}
 loadingContent={<Spinner label="جاري التحميل..." />}
 >
 {(item) => (
 <TableRow key={item.key}>
 {(columnKey) => (
 <TableCell>
 {(item as Record<string, unknown>)[columnKey] as ReactNode}
 </TableCell>
 )}
 </TableRow>
 )}
 </TableBody>
 </Table>
 {totalPages > 1 && (
 <div className="pagination-box flex mt-8 justify-end">
 <Pagination
 initialPage={1}
 color="primary"
 page={page}
 total={totalPages}
 onChange={(p) => onPageChange(p)}
 />
 </div>
 )}
 </>
 );
};

export default ServerPaginationTable;
