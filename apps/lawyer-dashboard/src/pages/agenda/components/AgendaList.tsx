import type { AgendaItem } from"../../../types/agenda";
import { AGENDA_STATUS_OPTIONS } from"../../../types/agenda";
import { LuScale, LuClipboardList, LuCalendarClock, LuBuilding2, LuMapPin, LuFileText, LuClock } from"react-icons/lu";
import { motion } from"framer-motion";

type Props = {
 items: AgendaItem[];
 onItemClick?: (item: AgendaItem) => void;
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  Scheduled: { bg: "color-mix(in srgb, var(--main-color) 12%, transparent)", color: "var(--main-color)", label: "مجدول" },
  Completed: { bg: "color-mix(in srgb, var(--success-color, #10b981) 12%, transparent)", color: "var(--success-color, #10b981)", label: "مكتمل" },
  Postponed: { bg: "color-mix(in srgb, var(--warning-color, #f59e0b) 12%, transparent)", color: "var(--warning-color, #f59e0b)", label: "مؤجل" },
  Cancelled: { bg: "color-mix(in srgb, var(--danger-color, #ef4444) 12%, transparent)", color: "var(--danger-color, #ef4444)", label: "ملغي" },
};

const getStatusLabel = (status: string) =>
 AGENDA_STATUS_OPTIONS.find((o) => o.key === status)?.label ?? status;

const StatusBadge = ({ status }: { status: string }) => {
 const style = STATUS_STYLES[status];
 if (!style) return (
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor:'var(--opacity-color)', color:'var(--text-color)' }}>
 {getStatusLabel(status)}
 </span>
 );
 return (
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.color }}>
 {style.label}
 </span>
 );
};

const DetailRow = ({ icon, text }: { icon: React.ReactNode; text?: string | null }) => {
 if (!text) return null;
 return (
 <span className="inline-flex items-center gap-1" style={{ color:'var(--text-color)' }}>
 <span style={{ color:'var(--main-color)', opacity: 0.7 }}>{icon}</span>
 {text}
 </span>
 );
};

const containerVariants = {
 hidden: { opacity: 0 },
 show: {
 opacity: 1,
 transition: {
 staggerChildren: 0.08
 }
 }
};

const itemVariants = {
 hidden: { opacity: 0, y: 10, scale: 0.98 },
 show: { opacity: 1, y: 0, scale: 1, transition: { type:"spring", stiffness: 350, damping: 25 } }
};

const AgendaList = ({ items, onItemClick }: Props) => {
 if (items.length === 0) {
 return (
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3 }}
 className="flex flex-col items-center justify-center py-10 gap-3 text-center" dir="rtl"
 >
 <div className="w-12 h-12 rounded-2xl flex items-center justify-center app-accent-soft">
 <LuCalendarClock className="text-xl" style={{ color:'var(--main-color)' }} />
 </div>
 <p className="text-sm font-semibold" style={{ color:'var(--title-color)' }}>لا توجد بنود مسجلة</p>
 <p className="text-xs" style={{ color:'var(--text-color)' }}>اضغط"إضافة لهذا اليوم" لإضافة جلسة أو إجراء</p>
 </motion.div>
 );
 }

 return (
 <motion.div 
 variants={containerVariants}
 initial="hidden"
 animate="show"
 className="flex flex-col gap-2.5" dir="rtl"
 >
 {items.map((item) => (
 <motion.div
 variants={itemVariants as unknown as import('framer-motion').Variants}
 key={item.id}
  className="app-surface border app-border rounded-xl p-3.5 flex flex-col gap-2 transition-colors duration-200"
  style={{
  cursor: onItemClick ? "pointer" : "default",
  boxShadow: 'var(--surface-shadow, 0 1px 3px rgba(0,0,0,0.05))',
  }}
  whileHover={onItemClick ? { 
  scale: 1.015, 
  borderColor: 'var(--main-color)', 
  boxShadow: '0 4px 12px color-mix(in srgb, var(--main-color) 15%, transparent)' 
  } : {}}
 whileTap={onItemClick ? { scale: 0.98 } : {}}
 onClick={() => onItemClick?.(item)}
 >
 {/* Top row: icon + title + badges */}
 <div className="flex items-start gap-2.5">
 <div
  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
  style={{
  backgroundColor: item.type === "Session" ? "color-mix(in srgb, var(--main-color) 15%, transparent)" : "rgba(59, 130, 246, 0.15)",
  color: item.type === "Session" ? "var(--main-color)" : "#3b82f6",
  }}
 >
 {/* dir=ltr prevents RTL mirroring of icons */}
 <span dir="ltr" style={{ display:'inline-flex' }}>
 {item.type ==="Session" ? (
 <LuScale size={14} />
 ) : (
 <LuClipboardList size={14} />
 )}
 </span>
 </div>

 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold leading-snug mb-1" style={{ color:'var(--title-color)' }}>
 {item.title}
 </p>
 <div className="flex items-center gap-1.5 flex-wrap">
 <StatusBadge status={item.status} />
 <span
 className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
 style={{ backgroundColor:'var(--opacity-color)', color:'var(--text-color)' }}
 >
 {item.type ==="Session" ?"جلسة" :"إجراء"}
 </span>
 </div>
 </div>
 </div>

 {/* Detail rows */}
 {item.type ==="Session" && (
 <div className="flex flex-col gap-1 text-xs pe-10">
 <DetailRow icon={<LuClipboardList style={{ fontSize:'11px' }} />} text={item.sessionType} />
 <DetailRow icon={<LuBuilding2 style={{ fontSize:'11px' }} />} text={item.courtName} />
 {item.postponementReason && (
 <DetailRow icon={<LuClock style={{ fontSize:'11px' }} />} text={`سبب التأجيل: ${item.postponementReason}`} />
 )}
 </div>
 )}

 {item.type ==="Action" && (
 <div className="flex flex-col gap-1 text-xs pe-10">
 <DetailRow icon={<LuClipboardList style={{ fontSize:'11px' }} />} text={item.actionType ==="Inspection" ?"معاينة" :"تنفيذ"} />
 <DetailRow icon={<LuFileText style={{ fontSize:'11px' }} />} text={item.executionDetails} />
 <DetailRow icon={<LuMapPin style={{ fontSize:'11px' }} />} text={item.location} />
 </div>
 )}

 {/* Date */}
 <div className="flex items-center gap-1 pe-10 text-xs" style={{ color:'var(--text-color)' }}>
 <LuCalendarClock style={{ fontSize:'11px', color:'var(--main-color)', opacity: 0.7 }} />
 {new Date(item.date).toLocaleDateString("ar-EG", {
 year:"numeric",
 month:"long",
 day:"numeric",
 })}
 </div>
 </motion.div>
 ))}
 </motion.div>
 );
};

export default AgendaList;
