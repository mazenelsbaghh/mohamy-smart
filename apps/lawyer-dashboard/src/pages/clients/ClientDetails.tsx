import usePageTitle from '../../hooks/usePageTitle';
import { CustomButton, CustomInput, Container } from '@mohamy/shared-ui';
import './ClientDetails.css';
import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale/ar';


import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import thunkGetClientDetails from '../../redux/clients/thunk/thunkGetClientDetails';
import thunkUpdateClient from '../../redux/clients/thunk/thunkUpdateClient';
import thunkGetClientPOAs from '../../redux/clients/thunk/thunkGetClientPOAs';
import thunkCancelPOA from '../../redux/clients/thunk/thunkCancelPOA';
import { useParams, Link } from 'react-router-dom';
import SkeletonForm from '../../components/skeleton/SkeletonForm';
import { useForm, Controller } from 'react-hook-form';
import { getInitials, getAvatarColor } from '../../utils/avatar';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sileo } from "sileo";
import HeadTitle from '../../components/headTitle/HeadTitle';
import { FiEdit2, FiPhone, FiMail, FiSave, FiX, FiMapPin, FiCreditCard, FiMessageSquare, FiEye, FiTrash2, FiUpload } from 'react-icons/fi';
import { LuCalendar, LuArrowRight } from 'react-icons/lu';
import { MdOutlineGavel, MdOutlineFilePresent, MdOutlineReceipt } from 'react-icons/md';
import { HiOutlineDocumentText } from 'react-icons/hi';
import DocumentHandoffTab from './tabs/DocumentHandoffTab';
import FinancialsTab from './tabs/FinancialsTab';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Radio, RadioGroup } from '@heroui/react';
import { tableClassNames } from '@mohamy/shared-ui';
import { IoAlertCircleOutline } from 'react-icons/io5';
import ConfirmDialog from '../../components/common/ConfirmDialog';



const schema = z.object({
 clientName: z.string().min(1, 'الاسم مطلوب'),
 phoneNumber: z.string().min(1, 'رقم الهاتف مطلوب'),
 email: z.string().email('البريد الإلكتروني غير صالح').or(z.string().length(0)).nullable(),
 notes: z.string().nullable(),
 nationalId: z.string().nullable().optional(),
 address: z.string().nullable().optional(),
 governorate: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

const ClientDetails = () => {
 const { id } = useParams();
  usePageTitle('بيانات الموكل');
 const dispatch = useAppDispatch();
 const { clientDetails, loading, updateLoading, clientPOAs, poaLoading } = useAppSelector((state) => state.clients);
 const { user } = useAppSelector((state) => state.auth);
 const [isEditing, setIsEditing] = useState(false);
  const [cancelPoaTarget, setCancelPoaTarget] = useState<{ id: string; serialNumber: number; number: string } | null>(null);
  const [cancelPoaReason, setCancelPoaReason] = useState('');
 const [deleteFileTarget, setDeleteFileTarget] = useState<{ id: string | number; fileName: string } | null>(null);

 const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
 resolver: zodResolver(schema),
 defaultValues: { clientName: '', phoneNumber: '', email: '', notes: '', nationalId: '', address: '', governorate: '' }
 });

 useEffect(() => {
 if (user && id) {
 dispatch(thunkGetClientDetails({ clientID: id }));
 dispatch(thunkGetClientPOAs({ clientId: id }));
 }
 }, [dispatch, user, id]);

 useEffect(() => {
 if (clientDetails) {
 reset({
 clientName: clientDetails.clientName || '',
 phoneNumber: clientDetails.phoneNumber || '',
 email: clientDetails.email || '',
 notes: clientDetails.notes || '',
 nationalId: clientDetails.nationalId || '',
 address: clientDetails.address || '',
 governorate: clientDetails.governorate || ''
 });
 }
 }, [clientDetails, reset]);

 const onSubmit = (data: FormData) => {
 if (id && clientDetails) {
 dispatch(thunkUpdateClient({ clientId: id, ...data, caseId: clientDetails.caseId }))
 .unwrap()
 .then(() => { sileo.success({ title: 'تم تحديث بيانات الموكل بنجاح' }); setIsEditing(false); })
 .catch(() => sileo.error({ title: 'تعذّر حفظ التغييرات. أعد المحاولة.' }));
 }
 };

  const confirmCancelPOA = () => {
  if (!cancelPoaTarget || !cancelPoaReason) return;
  dispatch(thunkCancelPOA({ poaId: cancelPoaTarget.id, reason: cancelPoaReason })).unwrap()
  .then(() => sileo.success({ title: 'تم إلغاء التوكيل بنجاح' }))
  .catch(() => sileo.error({ title: 'تعذّر إلغاء التوكيل. أعد المحاولة.' }));
  setCancelPoaTarget(null);
  setCancelPoaReason('');
  };

 const confirmDeleteFile = async () => {
 if (!deleteFileTarget || !clientDetails) return;
 const toastId = sileo.show({ type: "loading", title: 'جاري الحذف...' });
 try {
 const api = (await import('../../APIs/api')).default;
 await api.delete(`/Client/${clientDetails.id}/files/${deleteFileTarget.id}`);
 sileo.success({ title: 'تم حذف الملف بنجاح.' });
 dispatch(thunkGetClientDetails({ clientID: clientDetails.id }));
 } catch {
 sileo.error({ title: 'تعذّر حذف الملف. أعد المحاولة.' });
 } finally {
 sileo.dismiss(toastId);
 setDeleteFileTarget(null);
 }
 };

 if (loading === 'pending' || !clientDetails) {
 return (
 <div className="client-details">
 <Container>
 <HeadTitle title="إدارة الموكلين" />
 <SkeletonForm />
 </Container>
 </div>
 );
 }

 const activeCasesCount = clientDetails.cases?.filter(c => c.status === 'Active').length || 0;
 const closedCasesCount = clientDetails.cases?.filter(c => c.status === 'Closed').length || 0;
 const totalCases = clientDetails.cases?.length || 0;

 return (
 <div className="client-details">
 <Container>

 <div className="flex items-center justify-between mb-8" dir="rtl">
 <div className="flex items-center gap-2">
 <Link to="/clients" className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--cd-gold-dark)' }}>
 <LuArrowRight size={14} />
 <span>الموكلين</span>
 </Link>
 <span style={{ color: 'var(--cd-text-muted)', fontSize: '0.75rem' }}>/</span>
 <span className="font-semibold text-sm" style={{ color: 'var(--cd-text)' }}>{clientDetails.clientName}</span>
 </div>
 <div className="flex gap-2">
 {!isEditing ? (
 <CustomButton
 type="button"
 text="تعديل البيانات"
 startContent={<FiEdit2 size={14} />}
 color="primary"
 size="sm"
 radius="full"
 onClick={() => setIsEditing(true)}
 />
 ) : (
 <>
 <CustomButton
 type="button"
 text="إلغاء"
 startContent={<FiX size={14} />}
 color="danger"
 size="sm"
 radius="full"
 onClick={() => { setIsEditing(false); reset(); }}
 />
 <CustomButton
 type="button"
 text="حفظ التعديلات"
 startContent={<FiSave size={14} />}
 color="primary"
 size="sm"
 radius="full"
 isLoading={updateLoading === 'pending'}
 onClick={handleSubmit(onSubmit)}
 />
 </>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 cd-main-grid">

 <div className="lg:col-span-4 flex flex-col gap-6">

 <div className="cd-card p-8">
 <div className="flex flex-col items-center mb-6">
 <div
 className="flex items-center justify-center text-white text-3xl font-bold mb-4"
 style={{
 width: 112,
 height: 112,
 borderRadius: '50%',
 backgroundColor: getAvatarColor(clientDetails.id),
 boxShadow: '0 0 0 4px rgba(239,149,10,0.1), 0 8px 24px rgba(26,28,28,0.08)'
 }}
 >
 {getInitials(clientDetails.clientName)}
 </div>
 <h1 className="text-xl font-bold" style={{ color: 'var(--cd-text)' }}>{clientDetails.clientName}</h1>
 {clientDetails.nationalId && (
 <span
 className="text-[11px] font-bold mt-2 px-3 py-1 rounded-full flex items-center gap-1"
 style={{ color: 'var(--cd-gold-dark)', background: 'var(--cd-gold-soft)' }}
 >
 <FiCreditCard size={11} />
 {clientDetails.nationalId}
 </span>
 )}
 </div>

 <div
 className="flex justify-center gap-6 mb-6 py-4 rounded-xl"
 style={{ background: 'var(--cd-muted-bg)' }}
 >
 <div className="text-center px-3">
 <div className="text-2xl font-black" style={{ color: 'var(--cd-gold-dark)' }}>{activeCasesCount}</div>
 <div className="text-[10px] font-medium" style={{ color: 'var(--cd-text-secondary)' }}>قضية نشطة</div>
 </div>
 <div className="w-px self-stretch" style={{ background: 'var(--cd-outline)' }} />
 <div className="text-center px-3">
 <div className="text-2xl font-black" style={{ color: 'var(--cd-gold-dark)' }}>{closedCasesCount}</div>
 <div className="text-[10px] font-medium" style={{ color: 'var(--cd-text-secondary)' }}>قضية مغلقة</div>
 </div>
 <div className="w-px self-stretch" style={{ background: 'var(--cd-outline)' }} />
 <div className="text-center px-3">
 <div className="text-2xl font-black" style={{ color: 'var(--cd-gold-dark)' }}>{clientPOAs?.length || 0}</div>
 <div className="text-[10px] font-medium" style={{ color: 'var(--cd-text-secondary)' }}>توكيل</div>
 </div>
 </div>

 <div className="flex flex-col gap-2 mb-4">
 {clientDetails.phoneNumber && (
 <a href={`tel:${clientDetails.phoneNumber}`} className="cd-meta-row">
 <FiPhone size={13} style={{ color: 'var(--cd-gold-dark)' }} />
 <span dir="ltr">{clientDetails.phoneNumber}</span>
 </a>
 )}
 {clientDetails.email && (
 <a href={`mailto:${clientDetails.email}`} className="cd-meta-row">
 <FiMail size={13} style={{ color: 'var(--cd-gold-dark)' }} />
 <span>{clientDetails.email}</span>
 </a>
 )}
 {clientDetails.governorate && (
 <span className="cd-meta-row">
 <FiMapPin size={13} style={{ color: 'var(--cd-gold-dark)' }} />
 <span>{clientDetails.governorate}</span>
 </span>
 )}
 <span className="cd-meta-row" style={{ opacity: 0.7 }}>
 <LuCalendar size={13} style={{ color: 'var(--cd-gold-dark)' }} />
 <span>انضم {format(parseISO(clientDetails.creationDate), 'd MMMM yyyy', { locale: ar })}</span>
 </span>
 </div>

 <div className="cd-tonal-divider" />

 {isEditing ? (
 <form dir="rtl" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
 <Controller name="clientName" control={control} render={({ field }) => (
 <CustomInput
 label="الاسم الكامل"
 {...field}
 isInvalid={!!errors.clientName}
 errorMessage={errors.clientName?.message}
 />
 )} />
 <Controller name="phoneNumber" control={control} render={({ field }) => (
 <CustomInput
 label="رقم الهاتف"
 dir="ltr"
 {...field}
 isInvalid={!!errors.phoneNumber}
 errorMessage={errors.phoneNumber?.message}
 />
 )} />
 <Controller name="nationalId" control={control} render={({ field }) => (
 <CustomInput
 label="الرقم القومي"
 {...field}
 value={field.value || ''}
 />
 )} />
 <Controller name="email" control={control} render={({ field }) => (
 <CustomInput
 label="البريد الإلكتروني"
 type="email"
 dir="ltr"
 {...field}
 value={field.value || ''}
 isInvalid={!!errors.email}
 errorMessage={errors.email?.message}
 />
 )} />
 <Controller name="governorate" control={control} render={({ field }) => (
 <CustomInput
 label="المحافظة"
 {...field}
 value={field.value || ''}
 />
 )} />
 <Controller name="address" control={control} render={({ field }) => (
 <CustomInput
 label="العنوان التفصيلي"
 {...field}
 value={field.value || ''}
 />
 )} />
 <Controller name="notes" control={control} render={({ field }) => (
 <Textarea
 label="ملاحظات"
 variant="bordered"
 minRows={3}
 {...field}
 value={field.value || ''}
 />
 )} />
 </form>
 ) : (
 <div className="flex flex-col">
 <div className="cd-detail-row">
 <span className="cd-detail-label">الرقم القومي</span>
 <span className="cd-detail-val">{clientDetails.nationalId || '—'}</span>
 </div>
 <div className="cd-detail-row">
 <span className="cd-detail-label">المحافظة</span>
 <span className="cd-detail-val">{clientDetails.governorate || '—'}</span>
 </div>
 <div className="cd-detail-row">
 <span className="cd-detail-label">العنوان</span>
 <span className="cd-detail-val">{clientDetails.address || '—'}</span>
 </div>
 {clientDetails.notes && (
 <div className="mt-4 p-3 rounded-xl" style={{ background: 'var(--cd-gold-light)' }}>
 <span className="cd-detail-label flex items-center gap-1 mb-1">
 <FiMessageSquare size={11} /> ملاحظات
 </span>
 <p className="text-[13px] leading-relaxed" style={{ color: 'var(--cd-text)' }}>{clientDetails.notes}</p>
 </div>
 )}
 </div>
 )}
 </div>

 <div className="cd-card overflow-hidden">
 <div className="cd-section-bar">
 <div className="flex items-center gap-3">
 <div className="cd-accent-bar" style={{ background: 'var(--cd-gold-dark)' }} />
 <h2 className="text-sm font-bold" style={{ color: 'var(--cd-text)' }}>القضايا ({totalCases})</h2>
 </div>
 </div>
 <div className="p-4">
 {!clientDetails.cases || clientDetails.cases.length === 0 ? (
 <div className="cd-empty">
  <MdOutlineGavel className="cd-empty-icon" />
  <p>لا توجد قضايا مُسندة</p>
  <Link to="/cases" className="mt-3 text-xs font-bold text-[var(--main-color)] hover:underline">+ إضافة قضية</Link>
  </div>
 ) : (
 <div className="flex flex-col gap-2">
 {clientDetails.cases.map(courtCase => (
 <div key={courtCase.id} className="cd-tonal-item">
 <div className="flex items-center gap-2 mb-1">
 <span className={`cd-dot ${courtCase.status === 'Active' ? 'cd-dot-active' : 'cd-dot-closed'}`} />
 <span className="text-[13px] font-bold truncate flex-1" style={{ color: 'var(--cd-text)' }}>{courtCase.title}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-[11px]" style={{ color: 'var(--cd-text-muted)' }}>{courtCase.number} • {courtCase.court}</span>
 <Link to={`/cases/${courtCase.id}`} className="text-[11px] font-bold" style={{ color: 'var(--cd-gold-dark)' }}>عرض</Link>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="lg:col-span-8 flex flex-col gap-6">

 <div className="cd-card overflow-hidden">
 <div className="cd-section-bar">
 <div className="flex items-center gap-3">
 <div className="cd-accent-bar" style={{ background: 'var(--cd-gold-dark)' }} />
 <h2 className="text-sm font-bold" style={{ color: 'var(--cd-text)' }}>التوكيلات ({clientPOAs?.length || 0})</h2>
 </div>
 </div>
 <div className="p-5">
 {!clientPOAs || clientPOAs.length === 0 ? (
 <div className="cd-empty">
  <MdOutlineReceipt className="cd-empty-icon" />
  <p>لا توجد توكيلات مُسجلة لهذا الموكل</p>
  </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {clientPOAs.map((poa) => (
 <div key={poa.id} className={`cd-poa-card ${!poa.isCanceled ? 'cd-poa-card-active' : 'cd-poa-canceled'}`}>
  <div className="flex items-center justify-between gap-2 mb-3">
  <div className="flex items-center gap-2 flex-1 min-w-0">
  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--main-color)] border border-[var(--accent-soft-strong)] shrink-0">#{poa.serialNumber}</span>
  <h4 className="text-[13px] font-bold truncate" style={{ color: 'var(--cd-text)' }} title={poa.title}>{poa.title}</h4>
  </div>
  <span className={`cd-badge ${poa.isCanceled ? 'cd-badge-canceled' : 'cd-badge-active'}`}>
  {poa.isCanceled ? 'ملغى' : 'ساري'}
  </span>
  </div>
 <div className="flex flex-col gap-1.5 p-2.5 rounded-lg mb-3" style={{ background: 'var(--cd-card)' }}>
 <div className="flex justify-between items-center gap-2">
 <span className="text-[11px] font-medium" style={{ color: 'var(--cd-text-muted)' }}>رقم التوكيل</span>
 <span className="text-[12px] font-bold" style={{ color: 'var(--cd-text)' }}>{poa.number}</span>
 </div>
 <div className="flex justify-between items-center gap-2">
 <span className="text-[11px] font-medium" style={{ color: 'var(--cd-text-muted)' }}>جهة الإصدار</span>
 <span className="text-[12px] font-bold truncate max-w-[120px]" style={{ color: 'var(--cd-text)' }}>{poa.issuingAuthority}</span>
 </div>
 </div>
 <div className="flex items-center justify-between">
  <span className="text-[11px]" style={{ color: 'var(--cd-text-muted)' }}>
  {poa.isCanceled
  ? `أُلغي ${format(parseISO(poa.cancellationDate || ''), 'yyyy/MM/dd')}${poa.cancellationReason ? ` — ${poa.cancellationReason}` : ''}`
  : `أُصدر ${format(parseISO(poa.issueDate || ''), 'yyyy/MM/dd')}`}
  </span>
 {!poa.isCanceled && (
 <CustomButton
 type="button"
 text="إلغاء التوكيل"
 size="sm"
 variant="flat"
 color="danger"
 radius="sm"
 isLoading={poaLoading === 'pending'}
  onClick={() => { setCancelPoaTarget({ id: poa.id, serialNumber: poa.serialNumber, number: poa.number }); setCancelPoaReason(''); }}
 />
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 <div className="cd-card overflow-hidden">
 <div className="cd-section-bar">
 <div className="flex items-center gap-3">
 <div className="cd-accent-bar" style={{ background: 'var(--main-color)' }} />
 <h2 className="text-sm font-bold" style={{ color: 'var(--cd-text)' }}>المستندات والملفات ({clientDetails.files?.length || 0})</h2>
 </div>
 <div>
 <input
 type="file"
 id="clientFile"
 className="hidden"
 onChange={async (e) => {
 if (e.target.files && e.target.files[0]) {
 const file = e.target.files[0];
 const formData = new FormData();
 formData.append('file', file);
 const toastId = sileo.show({ type: "loading", title: 'جاري رفع الملف...' });
 try {
 const api = (await import('../../APIs/api')).default;
 await api.post(`/Client/${clientDetails.id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
 sileo.success({ title: 'تم رفع الملف بنجاح.' });
 dispatch(thunkGetClientDetails({ clientID: clientDetails.id }));
 } catch {
 sileo.error({ title: 'تعذّر رفع الملف. تحقق من حجمه وصيغته.' });
 } finally {
 sileo.dismiss(toastId);
 }
 e.target.value = '';
 }
 }}
 />
 <label htmlFor="clientFile">
 <CustomButton
 type="button"
 text="رفع ملف"
 size="sm"
 radius="full"
 startContent={<FiUpload size={13} />}
 onClick={() => document.getElementById('clientFile')?.click()}
 />
 </label>
 </div>
 </div>
 <div>
 {!Array.isArray(clientDetails.files) || clientDetails.files.length === 0 ? (
 <div className="cd-empty">
  <MdOutlineFilePresent className="cd-empty-icon" />
  <p>لا توجد ملفات مرتبطة بهذا الموكل</p>
  <button type="button" onClick={() => document.getElementById('clientFile')?.click()} className="mt-3 text-xs font-bold text-[var(--main-color)] hover:underline">+ رفع ملف</button>
  </div>
 ) : (
 <Table 
 aria-label="جدول ملفات الموكل"
 classNames={tableClassNames}
 removeWrapper
 >
 <TableHeader>
 <TableColumn>اسم الملف</TableColumn>
 <TableColumn>الحجم</TableColumn>
 <TableColumn>التاريخ</TableColumn>
 <TableColumn align="center">إجراءات</TableColumn>
 </TableHeader>
 <TableBody items={Array.isArray(clientDetails.files) ? clientDetails.files : []}>
 {(f: { id: string | number; fileName: string; filePath?: string; fileSize: number; creationDate: string }) => (
 <TableRow key={f.id}>
 <TableCell>
 <div className="flex items-center gap-2">
 <HiOutlineDocumentText size={16} style={{ color: 'var(--cd-gold-dark)' }} />
 <a
 href={f.filePath?.startsWith('http') ? f.filePath : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '')}${f.filePath}`}
 target="_blank"
 rel="noreferrer"
 className="text-[13px] font-semibold hover:underline"
 style={{ color: 'var(--cd-text)' }}
 >
 {f.fileName}
 </a>
 </div>
 </TableCell>
 <TableCell>
 <span className="text-[12px]" style={{ color: 'var(--cd-text-muted)' }}>{(f.fileSize / 1024).toFixed(1)} KB</span>
 </TableCell>
 <TableCell>
 <span className="text-[12px]" style={{ color: 'var(--cd-text-muted)' }}>{format(parseISO(f.creationDate), 'yyyy/MM/dd')}</span>
 </TableCell>
 <TableCell>
 <div className="flex justify-center gap-1">
 <Tooltip content="عرض الملف">
 <a
 href={f.filePath?.startsWith('http') ? f.filePath : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '')}${f.filePath}`}
 target="_blank"
 rel="noreferrer"
 className="cd-icon-btn"
 >
 <FiEye size={15} />
 </a>
 </Tooltip>
 <Tooltip content="حذف الملف" color="danger">
 <button type="button" className="cd-icon-btn cd-icon-btn-danger"
 onClick={() => setDeleteFileTarget({ id: f.id, fileName: f.fileName })}
 >
 <FiTrash2 size={15} />
 </button>
 </Tooltip>
 </div>
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 cd-bottom-grid">
 <DocumentHandoffTab clientId={clientDetails.id} />
 <FinancialsTab clientId={clientDetails.id} clientName={clientDetails.clientName} />
 </div>
 </div>
 </div>

  {/* Cancel POA Dialog */}
  <Modal
  isOpen={cancelPoaTarget !== null}
  onClose={() => { setCancelPoaTarget(null); setCancelPoaReason(''); }}
  placement="center"
  backdrop="blur"
  size="md"
  classNames={{
   base: 'bg-white dark:app-surface-soft border app-border dark:app-border-strong shadow-lg',
   backdrop: 'bg-black/40',
  }}
  >
  <ModalContent>
  <ModalHeader className="flex flex-col gap-1 pb-0" dir="rtl">
  <div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[var(--danger-soft)]">
  <IoAlertCircleOutline className="text-xl text-[var(--danger-color)]" />
  </div>
  <span className="text-base font-bold text-[var(--title-color)]">إلغاء التوكيل رقم {cancelPoaTarget?.serialNumber}</span>
  </div>
  </ModalHeader>
  <ModalBody dir="rtl" className="pb-2">
  <p className="text-sm app-text-muted">
  التوكيل: {cancelPoaTarget?.number}
  </p>
  <RadioGroup
  label="سبب الإلغاء"
  value={cancelPoaReason}
  onValueChange={setCancelPoaReason}
  classNames={{ label: 'text-sm font-bold text-[var(--title-color)]' }}
  >
  <Radio value="death" classNames={{ label: 'text-sm' }}>وفاة الموكل</Radio>
  <Radio value="revoked" classNames={{ label: 'text-sm' }}>إلغاء من الموكل</Radio>
  <Radio value="expired" classNames={{ label: 'text-sm' }}>انتهاء المدة</Radio>
  <Radio value="other" classNames={{ label: 'text-sm' }}>سبب آخر</Radio>
  </RadioGroup>
  </ModalBody>
  <ModalFooter dir="rtl" className="flex gap-2 justify-end pt-2">
  <Button
  variant="flat"
  onPress={() => { setCancelPoaTarget(null); setCancelPoaReason(''); }}
  isDisabled={poaLoading === 'pending'}
  className="font-bold text-sm bg-gray-100 hover:bg-gray-200 text-[var(--title-color)]"
  >
  تراجع
  </Button>
  <Button
  onPress={confirmCancelPOA}
  isLoading={poaLoading === 'pending'}
  isDisabled={!cancelPoaReason}
  className="font-bold text-sm text-white bg-[var(--danger-color)] hover:opacity-90"
  >
  إلغاء التوكيل
  </Button>
  </ModalFooter>
  </ModalContent>
  </Modal>
 <ConfirmDialog
  isOpen={deleteFileTarget !== null}
  onClose={() => setDeleteFileTarget(null)}
  onConfirm={() => void confirmDeleteFile()}
  title="حذف الملف"
  description={deleteFileTarget ? `هل أنت متأكد من حذف الملف "${deleteFileTarget.fileName}"؟` : ''}
  confirmText="حذف"
  cancelText="إلغاء"
  danger
 />

 </Container>
 </div>
 );
};

export default ClientDetails;
