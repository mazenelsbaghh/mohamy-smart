import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomCard } from '@mohamy/shared-ui';
import { sileo } from 'sileo';
import { IoArrowBackOutline, IoTrashOutline, IoCreateOutline, IoCheckmarkCircle, IoTimeOutline, IoFlash } from 'react-icons/io5';
import api from '../../../APIs/api';
import { WORKFLOW_CATALOG } from './analysis/workflowCatalog';
import { useAppSelector } from '../../../hooks/reduxHooks';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

type DbSnapshot = {
 id: number;
 caseId: string;
 workflowType: string;
 outputsJson: string;
 currentStep: number;
 label: string | null;
 createdAt: string;
};

interface Props {
 caseId: string;
}

type CurrentVersion = {
 workflowType: string;
 currentStep: number;
 lastSavedAt: string | null;
};

const SnapshotsHistory = ({ caseId }: Props) => {
 const [snapshots, setSnapshots] = useState<DbSnapshot[]>([]);
 const [loading, setLoading] = useState(true);
 const [editingId, setEditingId] = useState<number | null>(null);
 const [editValue, setEditValue] = useState('');
 const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
 const navigate = useNavigate();

 // Pull active workflow state from Redux for all 7 workflow types so the user can also see
 // the IN-PROGRESS version (not yet abandoned) alongside historical snapshots.
 const smartAnalysis = useAppSelector(s => s.smartAnalysis);
 const statementOfClaims = useAppSelector(s => s.preparingStatementOfClaimsSlice);
 const appealBrief = useAppSelector(s => s.appealBrief);
 const adminComplaint = useAppSelector(s => s.adminComplaint);
 const rulingAnalysis = useAppSelector(s => s.rulingAnalysis);
 const legalWarning = useAppSelector(s => s.legalWarning);
 const execRequest = useAppSelector(s => s.execRequest);

 const currentVersions: CurrentVersion[] = useMemo(() => {
 const list: CurrentVersion[] = [];
 const hasOutputs = (outputs: Record<number, unknown>) =>
 Object.values(outputs).some(v => v != null && v !== '' && (typeof v !== 'object' || Object.keys(v as object).length > 0));
 const candidates = [
 { type: 'defense-memo', state: smartAnalysis },
 { type: 'preparing-statement-of-claims', state: statementOfClaims },
 { type: 'appeal-brief', state: appealBrief },
 { type: 'admin-complaint', state: adminComplaint },
 { type: 'ruling-analysis', state: rulingAnalysis },
 { type: 'legal-warning', state: legalWarning },
 { type: 'exec-request', state: execRequest },
 ];
 for (const { type, state } of candidates) {
 if (state.isReadOnly) continue; // Snapshot view, not the live workflow
 if (state.status === 'Abandoned') continue;
 if (!hasOutputs(state.outputs as Record<number, unknown>)) continue;
 list.push({
 workflowType: type,
 currentStep: state.currentStep,
 lastSavedAt: state.lastSavedAt,
 });
 }
 return list;
 }, [smartAnalysis, statementOfClaims, appealBrief, adminComplaint, rulingAnalysis, legalWarning, execRequest]);

 const refresh = async () => {
 try {
 const res = await api.get(`/WorkflowSnapshots/case/${caseId}`);
 if (Array.isArray(res?.data?.data)) setSnapshots(res.data.data);
 } catch {
 sileo.error({ title: 'تعذر تحميل النسخ السابقة' });
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { void refresh();   }, [caseId]);

 const grouped = useMemo(() => {
 const map = new Map<string, DbSnapshot[]>();
 for (const s of snapshots) {
 const arr = map.get(s.workflowType) ?? [];
 arr.push(s);
 map.set(s.workflowType, arr);
 }
 for (const arr of map.values()) {
 arr.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
 }
 return map;
 }, [snapshots]);

 const handleSaveLabel = async (id: number) => {
 try {
 await api.patch(`/WorkflowSnapshots/${id}/label`, { label: editValue || '' });
 setSnapshots((prev) => prev.map((s) => (s.id === id ? { ...s, label: editValue || null } : s)));
 setEditingId(null);
 sileo.success({ title: 'تم تحديث اسم النسخة' });
 } catch {
 sileo.error({ title: 'تعذر تحديث الاسم' });
 }
 };

 const handleDeleteConfirm = async () => {
 if (deleteTarget === null) return;
 try {
  await api.delete(`/WorkflowSnapshots/${deleteTarget}`);
  setSnapshots((prev) => prev.filter((s) => s.id !== deleteTarget));
  sileo.success({ title: 'تم حذف النسخة' });
 } catch {
  sileo.error({ title: 'تعذر حذف النسخة' });
 } finally {
  setDeleteTarget(null);
 }
 };

 const handleOpen = (snapshot: DbSnapshot) => {
 const catalog = WORKFLOW_CATALOG.find((w) => w.id === snapshot.workflowType);
 if (!catalog) {
 sileo.error({ title: 'نوع المسار غير معروف' });
 return;
 }
 navigate(`/cases/${caseId}/document-selection/${catalog.route}?snapshot=${snapshot.id}`);
 };

 if (loading) {
 return <div className="text-center py-8 app-text-muted">جارٍ تحميل النسخ السابقة…</div>;
 }

 if (snapshots.length === 0 && currentVersions.length === 0) {
 return (
 <CustomCard className="border app-border shadow-sm text-center py-12 px-4">
 <IoTimeOutline className="mx-auto text-5xl app-text-muted mb-4" />
 <h3 className="text-lg font-bold text-[var(--title-color)] mb-2">لا توجد نسخ سابقة</h3>
 <p className="app-text-muted text-sm">عند بدء مسار جديد فوق مسار قائم، يتم حفظ نسخة من السابق هنا تلقائياً.</p>
 </CustomCard>
 );
 }

 const totalCount = snapshots.length + currentVersions.length;

 return (
 <div className="flex flex-col gap-6 mt-2">
 <CustomCard className="border app-border shadow-sm">
 <div className="flex items-center justify-between flex-wrap gap-2">
 <div>
 <h2 className="text-lg font-bold text-[var(--title-color)]">النسخ السابقة المحفوظة</h2>
 <p className="text-sm app-text-muted mt-1">جميع النسخ السابقة لكل مسارات هذه القضية. اضغط "مراجعة" لفتح أي نسخة للقراءة.</p>
 </div>
 <span className="text-sm font-bold text-[var(--main-color)] bg-[var(--accent-soft)] px-3 py-1 rounded-full border border-[var(--accent-soft-strong)]">
 {totalCount} نسخة
 </span>
 </div>
 </CustomCard>

 {WORKFLOW_CATALOG.map((catalog) => {
 const list = grouped.get(catalog.id) ?? [];
 const current = currentVersions.find(c => c.workflowType === catalog.id);
 if (list.length === 0 && !current) return null;
 const totalForType = list.length + (current ? 1 : 0);
 return (
 <CustomCard key={catalog.id} className="border app-border shadow-sm overflow-hidden p-0">
 <div className="px-6 py-4 border-b app-border app-surface-soft flex items-center justify-between gap-3">
 <div className="flex items-center gap-3 min-w-0">
 <catalog.icon className="text-[var(--main-color)] text-xl shrink-0" />
 <div className="min-w-0">
 <h3 className="font-bold text-[var(--title-color)] truncate">{catalog.label}</h3>
 <p className="text-xs app-text-muted">{totalForType} نسخة{current ? ' (منها النسخة الحالية)' : ''}</p>
 </div>
 </div>
 </div>
 <div className="divide-y app-border">
 {current && (
 <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--success-soft)] border-r-4 border-[var(--success-color)]">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="font-bold text-[var(--title-color)]">النسخة الحالية</span>
 <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--success-color)] text-white">
 <IoFlash className="text-[10px]" />
 قيد العمل
 </span>
 </div>
 <p className="text-xs app-text-muted mt-1">
 {current.lastSavedAt
 ? `آخر تعديل: ${new Date(current.lastSavedAt).toLocaleDateString('ar-EG')} الساعة ${new Date(current.lastSavedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`
 : 'لم يتم الحفظ بعد'}
 {' • '}وصلت إلى المرحلة {current.currentStep}
 </p>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 onClick={() => navigate(`/cases/${caseId}/document-selection/${catalog.route}`)}
 className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[var(--main-color)] text-white text-xs font-bold hover:bg-opacity-90 transition-colors cursor-pointer"
 >
 <IoArrowBackOutline />
 استكمال
 </button>
 </div>
 </div>
 )}
 {list.map((s, idx) => {
 const date = new Date(s.createdAt);
 const dateStr = date.toLocaleDateString('ar-EG');
 const timeStr = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
 const defaultName = `نسخة ${list.length - idx}`;
 const displayName = s.label || defaultName;
 const isEditing = editingId === s.id;
 return (
 <div key={s.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[var(--accent-soft)] transition-colors">
 <div className="flex-1 min-w-0">
 {isEditing ? (
 <div className="flex items-center gap-2">
 <input
 type="text"
 autoFocus
 value={editValue}
 onChange={(e) => setEditValue(e.target.value)}
 onKeyDown={(e) => { if (e.key === 'Enter') handleSaveLabel(s.id); if (e.key === 'Escape') setEditingId(null); }}
 placeholder={defaultName}
 className="text-sm font-bold px-3 py-1.5 border app-border rounded-lg outline-none focus:border-[var(--main-color)] bg-white dark:bg-transparent app-text-strong"
 />
 <button onClick={() => handleSaveLabel(s.id)} className="text-[var(--main-color)] hover:text-green-600">
 <IoCheckmarkCircle className="text-xl" />
 </button>
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <span className="font-bold text-[var(--title-color)] truncate">{displayName}</span>
 <button
 onClick={() => { setEditingId(s.id); setEditValue(s.label || ''); }}
 className="opacity-60 hover:opacity-100 text-[var(--main-color)]"
 title="تغيير الاسم"
 >
 <IoCreateOutline className="text-base" />
 </button>
 </div>
 )}
 <p className="text-xs app-text-muted mt-1">
 محفوظة في {dateStr} الساعة {timeStr} • وصلت إلى المرحلة {s.currentStep}
 </p>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 onClick={() => handleOpen(s)}
 className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[var(--main-color)] text-white text-xs font-bold hover:bg-opacity-90 transition-colors cursor-pointer"
 >
 <IoArrowBackOutline />
 مراجعة
 </button>
 <button
 onClick={() => setDeleteTarget(s.id)}
 className="inline-flex items-center gap-1 px-3 py-2 rounded-full border app-border text-[var(--danger-color)] text-xs font-bold hover:bg-[var(--danger-soft)] transition-colors cursor-pointer"
 title="حذف النسخة"
 >
 <IoTrashOutline />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 </CustomCard>
 );
 })}

 <ConfirmDialog
  isOpen={deleteTarget !== null}
  onClose={() => setDeleteTarget(null)}
  onConfirm={() => void handleDeleteConfirm()}
  title="حذف النسخة"
  description="هل أنت متأكد من حذف هذه النسخة؟ لا يمكن التراجع عن هذا الإجراء."
  confirmText="حذف"
  cancelText="إلغاء"
  danger
 />
 </div>
 );
};

export default SnapshotsHistory;
