import { useEffect, useMemo, useState } from"react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Chip, Input, Button } from"@heroui/react";
import { useDispatch, useSelector } from"react-redux";
import type { AppDispatch, RootState } from"../../../redux/store";
import thunkGetAgendaRoll from"../../../redux/agenda/thunk/thunkGetAgendaRoll";
import { tableClassNames } from"@mohamy/shared-ui";
import NotFoundImage from"../../../components/notFound/NotFoundImage";
import { FaChevronRight, FaChevronLeft } from"react-icons/fa";

type RollItem = {
 id: string | number;
 sessionDate?: string;
 caseNumber: string;
 courtName: string;
 plaintiffName: string;
 defendantName: string;
 previousDecision?: string;
 assignedLawyerName: string;
};

const addDays = (iso: string, days: number) => {
 const d = new Date(iso);
 d.setDate(d.getDate() + days);
 return d.toISOString().split("T")[0];
};

const todayIso = () => new Date().toISOString().split("T")[0];

export const AgendaRollTable = () => {
 const dispatch = useDispatch<AppDispatch>();
 const { rollItems, rollLoading } = useSelector((state: RootState) => state.agenda);

 const [selectedDate, setSelectedDate] = useState<string>(todayIso());

 useEffect(() => {
 dispatch(thunkGetAgendaRoll({ date: selectedDate }));
 }, [dispatch, selectedDate]);

 const formattedDate = useMemo(
 () =>
 new Date(selectedDate +"T12:00:00").toLocaleDateString("ar-EG", {
 weekday:"long",
 year:"numeric",
 month:"long",
 day:"numeric",
 }),
 [selectedDate]
 );

 const rows = (rollItems ?? []) as RollItem[];
 const isToday = selectedDate === todayIso();

 return (
 <div className="w-full mt-2">
 {/* Header bar: date nav + count + date picker */}
 <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
 <div className="flex items-center gap-2">
 <Button
 isIconOnly
 size="sm"
 variant="flat"
 aria-label="اليوم السابق"
 onPress={() => setSelectedDate(addDays(selectedDate, -1))}
 >
 <span dir="ltr"><FaChevronRight size={12} /></span>
 </Button>
 <Button
 isIconOnly
 size="sm"
 variant="flat"
 aria-label="اليوم التالي"
 onPress={() => setSelectedDate(addDays(selectedDate, 1))}
 >
 <span dir="ltr"><FaChevronLeft size={12} /></span>
 </Button>
 <Button
 size="sm"
 className={isToday ? "bg-[var(--main-color)] text-white" : "bg-default-100 text-default-700"}
 onPress={() => setSelectedDate(todayIso())}
 >
 اليوم
 </Button>
 </div>

 <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
 <h2 className="text-lg md:text-xl font-bold truncate text-[var(--title-color)]">
 رول الجلسات
 </h2>
 <span className="text-sm app-text-muted truncate">— {formattedDate}</span>
 <Chip size="sm" variant="flat" color="primary">
 {rows.length} جلسة
 </Chip>
 </div>

 <Input
 type="date" aria-label="اختر التاريخ"
 value={selectedDate}
 onValueChange={setSelectedDate}
 variant="bordered"
 className="w-44"
 aria-label="تغيير التاريخ"
 />
 </div>

 {rollLoading ==="pending" ? (
 <div className="flex justify-center p-8">
 <Spinner label="جارِ تحميل رول الجلسات..." color="primary" />
 </div>
 ) : (
 <Table
 aria-label="جدول رول الجلسات"
 color="primary"
 selectionMode="single"
 classNames={tableClassNames}
 >
 <TableHeader>
 <TableColumn>رقم القضية والمحكمة</TableColumn>
 <TableColumn>الخصوم</TableColumn>
 <TableColumn>القرار السابق</TableColumn>
 <TableColumn>المحامي المكلف</TableColumn>
 </TableHeader>
 <TableBody
 emptyContent={
 <div className="flex flex-col items-center justify-center py-10 gap-3">
 <NotFoundImage text="لا توجد جلسات لهذا اليوم." variant="cases" />
 </div>
 }
 >
 {rows.map((item) => (
 <TableRow key={item.id}>
 <TableCell>
 <div className="flex flex-col">
 <span className="font-bold">{item.caseNumber}</span>
 <span className="text-sm app-text-muted">{item.courtName}</span>
 </div>
 </TableCell>
 <TableCell>
 <div className="flex flex-col">
 <span className="truncate max-w-xs text-[var(--success-color,var(--main-color))] font-medium">
 {item.plaintiffName}
 </span>
 <span className="truncate max-w-xs text-[var(--danger-color,#ef4444)] text-sm">
 ضد: {item.defendantName}
 </span>
 </div>
 </TableCell>
 <TableCell>
 <Chip color="primary" variant="flat" size="sm">
 {item.previousDecision ||"تأجيل"}
 </Chip>
 </TableCell>
 <TableCell>{item.assignedLawyerName}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </div>
 );
};
