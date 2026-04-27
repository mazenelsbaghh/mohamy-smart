import { Button, Chip, Divider } from"@heroui/react";
import type { AgendaItem } from"../../../types/agenda";
import { AGENDA_STATUS_OPTIONS } from"../../../types/agenda";
import {
 FaGavel,
 FaClipboardCheck,
 FaCalendarAlt,
 FaMapMarkerAlt,
 FaBalanceScale,
 FaInfoCircle,
 FaClock,
} from"react-icons/fa";
import FormModal from"../../../components/ui/form/FormModal";

type Props = {
 item: AgendaItem | null;
 isOpen: boolean;
 onClose: () => void;
};

const statusColor = (status: string) => {
 switch (status) {
 case"Scheduled": return"primary";
 case"Completed": return"success";
 case"Postponed": return"warning";
 case"Cancelled": return"danger";
 default: return"default";
 }
};

const getStatusLabel = (status: string) =>
 AGENDA_STATUS_OPTIONS.find((o) => o.key === status)?.label ?? status;

const DetailRow = ({
 icon,
 label,
 value,
}: {
 icon: React.ReactNode;
 label: string;
 value: string | undefined | null;
}) => {
 if (!value) return null;
 return (
 <div className="flex items-start gap-3 py-2.5 border-b border-default-200 dark:border-default-100" dir="rtl">
 <span className="mt-0.5 text-base flex-shrink-0" style={{ color:"var(--main-color)" }}>
 {icon}
 </span>
 <div>
 <p className="text-xs text-default-500 mb-0.5">{label}</p>
 <p className="text-[15px] font-medium text-[var(--title-color)]">{value}</p>
 </div>
 </div>
 );
};

const AgendaItemDetailModal = ({ item, isOpen, onClose }: Props) => {
 if (!item) return null;

 const isSession = item.type ==="Session";
 const formatDateTime = (dateStr: string | undefined | null) => {
 if (!dateStr) return "غير محدد";
 return new Date(dateStr).toLocaleString("ar-EG", {
 weekday: "long",
 year: "numeric",
 month: "long",
 day: "numeric",
 hour: "numeric",
 minute: "numeric",
 hour12: true,
 });
 };

 const formatTimeOnly = (dateStr: string) => {
 return new Date(dateStr).toLocaleTimeString("ar-EG", {
 hour: "numeric",
 minute: "numeric",
 hour12: true,
 });
 };

 let formattedDate = formatDateTime(item.date);
 if (item.date && item.endDate) {
 const startDay = new Date(item.date).toDateString();
 const endDay = new Date(item.endDate).toDateString();
 if (startDay === endDay) {
 formattedDate = `${formatDateTime(item.date)} حتي ${formatTimeOnly(item.endDate)}`;
 } else {
 formattedDate = `${formatDateTime(item.date)} حتي ${formatDateTime(item.endDate)}`;
 }
 }

 return (
 <FormModal
 isOpen={isOpen}
 onClose={onClose}
 size="lg"
 title={item.title}
 subtitle={
 <div className="flex gap-2 mt-1">
 <Chip size="sm" variant="bordered">
 {isSession ?"جلسة" :"إجراء"}
 </Chip>
 <Chip size="sm" variant="flat" color={statusColor(item.status)}>
 {getStatusLabel(item.status)}
 </Chip>
 </div>
 }
 icon={isSession ? <FaGavel /> : <FaClipboardCheck />}
 iconBg={isSession ?"var(--main-color)" :"#3b82f6"}
 >
 <div className="px-6 py-4" dir="rtl">
 <Divider className="mb-2" />

 <DetailRow icon={<FaCalendarAlt />} label="التاريخ" value={formattedDate} />

 {isSession && (
 <>
 <DetailRow icon={<FaInfoCircle />} label="نوع الجلسة" value={item.sessionType} />
 <DetailRow icon={<FaBalanceScale />} label="المحكمة" value={item.courtName} />
 {item.postponementReason && (
 <DetailRow icon={<FaClock />} label="سبب التأجيل" value={item.postponementReason} />
 )}
 </>
 )}

 {item.type ==="Action" && (
 <>
 <DetailRow
 icon={<FaInfoCircle />}
 label="نوع الإجراء"
 value={item.actionType ==="Inspection" ?"معاينة" :"تنفيذ"}
 />
 <DetailRow icon={<FaClipboardCheck />} label="تفاصيل الإجراء" value={item.executionDetails} />
 {item.location && (
 <DetailRow icon={<FaMapMarkerAlt />} label="الموقع" value={item.location} />
 )}
 </>
 )}

 <Divider className="mt-2 mb-3" />

 <p className="text-[11px] text-default-500">
 تم الإنشاء:{""}
 {item.createdAt ? formatDateTime(item.createdAt) : "—"}
 </p>

 <div className="flex justify-start mt-4">
 <Button color="primary" variant="light" onPress={onClose}>
 إغلاق
 </Button>
 </div>
 </div>
 </FormModal>
 );
};

export default AgendaItemDetailModal;
