import usePageTitle from '../../hooks/usePageTitle';
import { Container } from'@mohamy/shared-ui';
import'./Agenda.css';
import { Calendar, dateFnsLocalizer, Views, type SlotInfo } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { arEG } from "date-fns/locale";
import "./components/shadcn-big-calendar.css";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, useDisclosure, Tabs, Tab, Spinner, Select, SelectItem } from "@heroui/react";
import { FilterSelect } from '@mohamy/shared-ui';
import FormModal from "../../components/ui/form/FormModal";


import HeadTitle from"../../components/headTitle/HeadTitle";

import AgendaItemDetailModal from"./components/AgendaItemDetailModal";
import SessionAgendaForm from"./components/SessionAgendaForm";
import ActionAgendaForm from"./components/ActionAgendaForm";
import { AgendaRollTable } from"./components/AgendaRollTable";
import { useAppDispatch, useAppSelector } from"../../hooks/reduxHooks";
import thunkGetAgendaByLawyerId from"../../redux/agenda/thunk/thunkGetAgendaByLawyerId";
import thunkGetAllCases from"../../redux/cases/thunk/thunkGetAllCases";
import { FaPlus } from "react-icons/fa";
import { LuScale, LuClipboardList } from "react-icons/lu";
import type { AgendaItem, SessionAgendaItem } from "../../types/agenda";

const locales = {
  "ar-EG": arEG,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const calendarMessages = {
  allDay: "طوال اليوم",
  previous: "السابق",
  next: "التالي",
  today: "اليوم",
  month: "شهر",
  week: "أسبوع",
  day: "يوم",
  agenda: "أجندة",
  date: "التاريخ",
  time: "الوقت",
  event: "العنصر",
  noEventsInRange: "لا توجد عناصر في هذا النطاق",
  showMore: (total: number) => `+${total} المزيد`,
};

const STATUS_LABELS: Record<string, string> = {
 Scheduled: "متداولة",
 Completed: "منتهية",
 Postponed: "مؤجلة",
 Cancelled: "ملغاة",
 };




const AgendaPage = () => {
 const dispatch = useAppDispatch();
  usePageTitle('الأجندة');
 const { items, loading } = useAppSelector((state) => state.agenda);
 const { cases } = useAppSelector((state) => state.cases);
 const { user } = useAppSelector((state) => state.auth);

 const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
 const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

 const [formType, setFormType] = useState<"Session" |"Action">("Session");
 const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);
 const [viewMode, setViewMode] = useState<"calendar" |"roll">("calendar");

 const [filterCaseId, setFilterCaseId] = useState<string>("");
 const [selectedDate, setSelectedDate] = useState<string>("");
 const [selectedEndDate, setSelectedEndDate] = useState<string>("");
 const [selectedCaseIdForForm, setSelectedCaseIdForForm] = useState<string>("");

 const calendarContainerRef = useRef<HTMLDivElement | null>(null);
 
 useEffect(() => {
 if (user) {
 dispatch(thunkGetAgendaByLawyerId({ lawyerId: user.profileId }));
 dispatch(thunkGetAllCases({ pageNumber: 1, pageSize: 100, lawyerId: user.userId }));
 }
 }, [dispatch, user]);

 const filteredItems = useMemo(() => {
 if (!filterCaseId) return items;
 return items.filter((item) => item.caseId === filterCaseId);
 }, [items, filterCaseId]);

  // Convert agenda items to React Big Calendar events
  const rbcEvents = useMemo(() => {
    return filteredItems.map((item) => {
      const start = new Date(item.date);
      const end = item.endDate ? new Date(item.endDate) : new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
      return {
        id: item.id,
        title: item.title,
        start,
        end,
        allDay: false,
        resource: item,
      };
    });
  }, [filteredItems]);



 const handleAddClick = () => {
 if (cases.length > 0 && !selectedCaseIdForForm) {
 setSelectedCaseIdForForm(String(cases[0].id));
 }
 onAddOpen();
 };

 const refreshData = () => {
 if (user) dispatch(thunkGetAgendaByLawyerId({ lawyerId: user.profileId }));
 };

 const handleFormClose = () => {
 onAddClose();
 refreshData();
 };

 

 return (
 <section className="agenda-page" dir="rtl">
 <Container>
 {/* Header */}
 <div className="flex items-center justify-between mb-5">
 <HeadTitle title="أجندة الجلسات والأعمال" />
 <Button
 className="bg-[var(--main-color)] text-white font-medium shadow-sm"
 onPress={handleAddClick}
 startContent={<span dir="ltr"><FaPlus /></span>}
 >
 إضافة
 </Button>
 </div>

 {/* Filters + Legend */}
 <div className="flex items-center justify-between gap-3 mb-4" style={{ flexWrap:'nowrap' }}>
 <div className="flex items-center gap-2 flex-shrink-0">
 <FilterSelect
 label="فلتر القضية"
 placeholder="اختر القضية..."
 selectedKeys={filterCaseId ? [filterCaseId] : []}
 onSelectionChange={(keys) => {
 const val = Array.from(keys as Set<string>)[0];
 setFilterCaseId(val ||"");
 }}
 className="w-52"
 options={(cases || []).map((c: { id: number; title: string }) => ({
 value: String(c.id),
 label: c.title,
 }))}
 />
 {filterCaseId && (
 <Button size="sm" variant="flat" onPress={() => setFilterCaseId("")}>
 عرض الكل
 </Button>
 )}
 </div>

 <div className="flex gap-2 items-center flex-shrink-0">
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap text-[var(--main-color)] bg-[var(--main-color)]/10 border border-[var(--main-color)]/20">
 <span dir="ltr" style={{ display:'inline-flex', alignItems:'center' }}><LuScale size={13} /></span>
 جلسة
 </span>
 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
 <span dir="ltr" style={{ display:'inline-flex', alignItems:'center' }}><LuClipboardList size={13} /></span>
 إجراء
 </span>
 </div>

 <div className="flex app-toggle-shell p-1 rounded-lg">
 <button type="button" className={`px-4 py-1 text-sm rounded-md transition-colors ${viewMode ==='calendar' ?'app-toggle-active font-bold' :'app-text-muted hover:text-[var(--title-color)]'}`}
 onClick={() => setViewMode('calendar')}
 >
 التقويم
 </button>
 <button type="button" className={`px-4 py-1 text-sm rounded-md transition-colors ${viewMode ==='roll' ?'app-toggle-active font-bold' :'app-text-muted hover:text-[var(--title-color)]'}`}
 onClick={() => setViewMode('roll')}
 >
 الرول
 </button>
 </div>
 </div>

 {/* Calendar + Day Panel */}
 {loading ==="pending" ? (
 <div className="flex justify-center py-12">
 <Spinner size="lg" />
 </div>
 ) : (
 <div className="flex gap-5 items-start">
 <AnimatePresence mode="wait">
 {viewMode ==="calendar" ? (
 <>
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.98 }}
 transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
 className="calendar-box flex-1 min-w-0"
 ref={calendarContainerRef}
 >
 <div style={{ height: "720px", width: "100%" }}>
 <Calendar
 localizer={localizer}
 events={rbcEvents}
 startAccessor="start"
 endAccessor="end"
 style={{ height: "100%", width: "100%" }}
 culture="ar-EG"
 messages={calendarMessages}
 rtl={true}
 views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
 defaultView={Views.MONTH}
 selectable={true}
 onSelectSlot={(slotInfo: SlotInfo) => {
 const start = slotInfo.start;
 const end = slotInfo.end;
 const isoStart = format(start, "yyyy-MM-dd'T'HH:mm");
 let isoEnd = format(end, "yyyy-MM-dd'T'HH:mm");
 if (isoStart === isoEnd) {
 const endPlusOne = new Date(start.getTime() + 60 * 60 * 1000);
 isoEnd = format(endPlusOne, "yyyy-MM-dd'T'HH:mm");
 }
 setSelectedDate(isoStart);
 setSelectedEndDate(isoEnd);
 handleAddClick();
 }}
 onSelectEvent={(event: object) => {
 const rbcEvent = event as { resource?: AgendaItem };
 if (rbcEvent.resource) {
 setSelectedItem(rbcEvent.resource);
 onDetailOpen();
 }
 }}
 eventPropGetter={(event: object) => {
 const rbcEvent = event as { resource?: AgendaItem };
 const item = rbcEvent.resource;
 const isSession = item?.type === "Session";
 return {
 className: isSession ? "event-variant-primary" : "event-variant-secondary",
 style: { border: "none", padding: 0 }
 };
 }}
 components={{
 event: ({ event }) => {
 const rbcEvent = event as { title: string; resource?: AgendaItem };
 const item = rbcEvent.resource;
 const isSession = item?.type === "Session";
 const session = isSession ? (item as SessionAgendaItem) : null;
 return (
 <div
 className="flex flex-col h-full w-full overflow-hidden text-inherit p-0.5"
 style={{ direction: 'rtl' }}
 >
 <div className="flex items-center gap-1 mb-0.5">
 <span dir="ltr" className="hidden sm:inline-flex opacity-80">
 {isSession ? <LuScale size={10} /> : <LuClipboardList size={10} />}
 </span>
 <span className="font-semibold text-[11px] sm:text-xs truncate leading-tight">
 {event.title}
 </span>
 </div>
 {item && (
 <div className="hidden sm:flex flex-wrap gap-1 mt-0.5">
 <span className="px-1 py-0 text-[9px] font-medium rounded border border-current opacity-90 truncate max-w-[80px]">
 {STATUS_LABELS[item.status] ?? item.status}
 </span>
 {session?.courtName && (
 <span className="px-1 py-0 text-[9px] font-medium rounded border border-current opacity-90 truncate max-w-[80px]">
 {session.courtName}
 </span>
 )}
 </div>
 )}
 </div>
 );
 }
 }}
 />
 </div>
 </motion.div>
 </>
 ) : (
 <motion.div
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
 className="w-full"
 >
 <AgendaRollTable />
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )}

 {/* Detail Modal */}
 <AgendaItemDetailModal
 item={selectedItem}
 isOpen={isDetailOpen}
 onClose={onDetailClose}
 />

 {/* Add Agenda Item Modal */}
 <FormModal
 isOpen={isAddOpen}
 onClose={onAddClose}
 size="2xl"
 title="إضافة إلى الأجندة"
 subtitle="حدد القضية ونوع العنصر للمتابعة"
 icon={<span dir="ltr" style={{ display:'inline-flex' }}><LuScale size={18} /></span>}
 >
 <div className="px-6 pt-5 pb-4 app-surface-soft border-b app-border">
 <p className="text-[10px] font-bold text-[var(--main-color)] uppercase tracking-wider mb-2 text-end">القضية</p>
 <Select
 placeholder="اختر القضية"
 selectedKeys={selectedCaseIdForForm ? [selectedCaseIdForForm] : []}
 onSelectionChange={(keys) => {
 const val = Array.from(keys)[0] as string;
 setSelectedCaseIdForForm(val ||"");
 }}
 aria-label="اختر القضية"
 classNames={{
 trigger:"app-surface border app-border rounded-xl h-11",
 value:"text-[var(--title-color)] font-medium text-sm",
 }}
 dir="rtl"
 >
 {(cases || []).map((c: { id: number; title: string }) => (
 <SelectItem key={String(c.id)}>{c.title}</SelectItem>
 ))}
 </Select>
 </div>

 <div className="px-6 pt-4">
 <Tabs disableAnimation={true}
 aria-label="نوع العنصر"
 selectedKey={formType}
 onSelectionChange={(key) => setFormType(key as"Session" |"Action")}
 color="primary"
 variant="underlined"
 classNames={{
 tabList:"gap-6 w-full border-b app-border pb-0",
 tab:"text-sm font-medium pb-3 px-1",
 cursor:"bg-[var(--main-color)] h-0.5",
 tabContent:"group-data-[selected=true]:text-[var(--main-color)] group-data-[selected=true]:font-semibold app-text-muted",
 }}
 >
 <Tab key="Session" title="جلسة" />
 <Tab key="Action" title="إجراء (معاينة / تنفيذ)" />
 </Tabs>
 </div>

 {selectedCaseIdForForm ? (
 formType ==="Session" ? (
 <SessionAgendaForm
 key={`session-${selectedDate}`}
 caseId={selectedCaseIdForForm}
 previousSessions={items.filter((i) => i.caseId === selectedCaseIdForForm)}
 onClose={handleFormClose}
 defaultDate={selectedDate}
 defaultEndDate={selectedEndDate}
 />
 ) : (
 <ActionAgendaForm
 key={`action-${selectedDate}-${selectedEndDate}`}
 caseId={selectedCaseIdForForm}
 onClose={handleFormClose}
 defaultDate={selectedDate}
 defaultEndDate={selectedEndDate}
 />
 )
 ) : (
 <div className="flex flex-col items-center justify-center py-14 gap-3" dir="rtl">
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center app-accent-soft">
 <LuScale size={22} style={{ color:"var(--main-color)" }} />
 </div>
 <p className="app-text-muted text-sm font-medium">اختر قضية أولاً للمتابعة</p>
 </div>
 )}
 </FormModal>
 </Container>
 </section>
 );
};

export default AgendaPage;
