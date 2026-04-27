import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import type { ReactNode } from 'react';
import { tableClassNames } from './TableConfig';

type Column = {
    key: string;
    label: string;
};

type DataTableProps<T extends Record<string, ReactNode>> = {
    data: T[];
    columns: Column[];
    emptyContent?: ReactNode;
};

const CustomTable = <T extends Record<string, ReactNode> & { key: string }>({ data, columns, emptyContent }: DataTableProps<T>) => {
    return (
        <Table
            aria-label="جدول البيانات"
            color="primary"
            selectionMode="single"
            classNames={tableClassNames}
        >
            <TableHeader>
                {columns.map((col) => (
                    <TableColumn key={col.key}>{col.label}</TableColumn>
                ))}
            </TableHeader>
            <TableBody emptyContent={emptyContent || "لا توجد بيانات لعرضها"}>
                {data.map((item) => (
                    <TableRow key={item.key}>
                        {columns.map((column) => (
                            <TableCell key={column.key}>
                                {item[column.key] ?? "-"}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default CustomTable;
