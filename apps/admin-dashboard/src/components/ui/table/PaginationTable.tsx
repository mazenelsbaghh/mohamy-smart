import { useNavigate, useLocation } from'react-router-dom';
import { useMemo, useState } from'react';
import { getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from'@heroui/react';
import { tableClassNames } from'@mohamy/shared-ui';


type Column = {
 key: string;
 label: string;
};

type DataTableProps<T> = {
 data: T[];
 columns: Column[];
};

const PaginationTable = <T extends { key: string }>({ data, columns }: DataTableProps<T>) => {
 const navigate = useNavigate();
 const [page, setPage] = useState<number>(1);
 const rowsPerPage = 5;

 const pages = Math.ceil(data.length / rowsPerPage);

 const items = useMemo(() => {
 const start = (page - 1) * rowsPerPage;
 const end = start + rowsPerPage;

 return data.slice(start, end);
 }, [page, data]);


 const { pathname } = useLocation();

 return (
 <>
 <Table
 aria-label="جدول البيانات"
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
 <TableBody items={items}>
 {(item) => (
 <TableRow key={item.key} >
 {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
 </TableRow>
 )}
 </TableBody>
 </Table>
 <div className="pagination-box flex mt-8 justify-end">
 <Pagination initialPage={1}
 // isCompact
 // showControls
 // showShadow
 color="primary"
 page={page}
 total={pages}
 onChange={(page) => setPage(page)}
 />
 </div>
 </>
 );
};

export default PaginationTable;