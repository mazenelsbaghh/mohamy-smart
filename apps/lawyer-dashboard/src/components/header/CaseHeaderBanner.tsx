import { useNavigate } from"react-router-dom";
import { CustomCard } from'@mohamy/shared-ui';

export type TCaseHeaderBanner = {
 caseId: string;
 title: string;
 status: number | string;
 facts: string;
 hideDocsButton?: boolean;
 versionLabel?: string | null;
};

const CaseHeaderBanner = ({ caseId, title, status, facts, hideDocsButton = false, versionLabel }: TCaseHeaderBanner) => {
 const navigate = useNavigate();

 return (
 <CustomCard className="border app-border dark:app-border-strong shadow-sm">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div className="flex-1 min-w-0">
 <h1 className="text-xl md:text-2xl font-bold text-[var(--title-color)] mb-2 break-words">
 {title}
 </h1>
 {versionLabel && (
 <div className="flex items-center gap-2 mb-2 mt-1">
 <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--main-color)] bg-[var(--accent-soft)] px-3 py-1 rounded-full border border-[var(--accent-soft-strong)]">
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
 {versionLabel}
 </span>
 </div>
 )}
 <p className="text-sm app-text-subtle dark:app-text-subtle">
 راجع بيانات القضية الأساسية، ثم انتقل مباشرة إلى التفاصيل أو ابدأ مسار العمل المناسب.
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
 {!hideDocsButton && (
 <button type="button" onClick={() => {
 navigate(`/cases/${caseId}/document-selection`, { state: facts });
 }}
 aria-label="عرض مستندات القضية" className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 px-5 py-2 bg-[var(--main-color)] text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors shadow-sm text-sm shrink-0"
 >
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
 </svg>
 ابدء التحليل الذكي
 </button>
 )}
 <span className={`shrink-0 flex items-center justify-center text-sm px-4 py-2 rounded-lg font-bold border ${status === 0 || status ==='Open'
 ?'bg-[var(--success-soft)] dark:bg-green-950/40 text-[var(--success-color)] dark:text-green-400 border-[var(--success-soft)] dark:border-green-800/50'
 :'bg-[var(--danger-soft)] dark:bg-red-950/40 text-[var(--danger-color)] dark:text-[var(--danger-color)] border-[var(--danger-soft)] dark:border-red-800/50'
 }`}>
 {status === 0 || status ==='Open' ?'متداولة' :'منتهية'}
 </span>
 </div>
 </div>
 </CustomCard>
 );
};

export default CaseHeaderBanner;
