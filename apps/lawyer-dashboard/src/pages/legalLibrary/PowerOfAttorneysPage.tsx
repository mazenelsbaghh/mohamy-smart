import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { CustomButton, CustomInput, Container, SearchInput } from '@mohamy/shared-ui';
import { Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Radio, RadioGroup } from '@heroui/react';
import { tableClassNames } from '@mohamy/shared-ui';
import { FiPlus, FiSave, FiX } from 'react-icons/fi';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { MdOutlineAssignmentInd } from 'react-icons/md';
import { sileo } from 'sileo';
import api from '../../APIs/api';
import HeadTitle from '../../components/headTitle/HeadTitle';
import usePageTitle from '../../hooks/usePageTitle';
import './PowerOfAttorneysPage.css';

type PowerOfAttorney = {
 id: string;
 clientId?: string | null;
 clientName?: string | null;
 serialNumber: number;
 number: string;
 title: string;
 issuingAuthority: string;
 issueDate: string;
 poaType: string;
 isCanceled: boolean;
 cancellationDate?: string | null;
 cancellationReason?: string | null;
 createdAt?: string;
};

type ClientOption = {
 id: string;
 clientName: string;
 phoneNumber?: string;
};

type ClientsResponse = {
 data?: {
  items?: ClientOption[];
 };
 items?: ClientOption[];
};

type ApiResult<T> = {
 data?: T;
 succeeded?: boolean;
};

const schema = z.object({
 clientId: z.string().optional(),
 poaType: z.string().min(1, 'نوع التوكيل مطلوب'),
 number: z.string().min(1, 'رقم التوكيل مطلوب'),
 title: z.string().min(1, 'عنوان التوكيل مطلوب'),
 issuingAuthority: z.string().min(1, 'جهة الإصدار مطلوبة'),
 issueDate: z.string().min(1, 'تاريخ الإصدار مطلوب'),
});

type FormData = z.infer<typeof schema>;

const unwrapData = <T,>(payload: T | ApiResult<T>): T => {
 if (payload && typeof payload === 'object' && 'data' in payload) {
  return (payload as ApiResult<T>).data as T;
 }
 return payload as T;
};

const unwrapList = <T,>(payload: T[] | ApiResult<T[]>): T[] => {
 const data = unwrapData<T[]>(payload);
 return Array.isArray(data) ? data : [];
};

const CANCEL_REASONS = [
 { key: 'death', label: 'وفاة الموكل' },
 { key: 'revoked', label: 'إلغاء من الموكل' },
 { key: 'expired', label: 'انتهاء المدة' },
 { key: 'other', label: 'سبب آخر' },
] as const;

const POA_TYPES = [
 { key: 'general', label: 'عام (لي)' },
 { key: 'specific', label: 'خاص (لموكل)' },
] as const;

const PowerOfAttorneysPage = () => {
 usePageTitle('توكيلاتي');
 const [items, setItems] = useState<PowerOfAttorney[]>([]);
 const [clients, setClients] = useState<ClientOption[]>([]);
 const [loading, setLoading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [isAdding, setIsAdding] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [cancelTarget, setCancelTarget] = useState<PowerOfAttorney | null>(null);
 const [cancelReason, setCancelReason] = useState('');

 const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
   clientId: '',
   poaType: 'general',
   number: '',
   title: '',
   issuingAuthority: '',
   issueDate: new Date().toISOString().slice(0, 10),
  },
 });

 const watchedPoaType = watch('poaType');

 const filteredItems = useMemo(() => {
  if (!searchQuery.trim()) return items;
  const q = searchQuery.toLowerCase();
  return items.filter((item) =>
   item.title.toLowerCase().includes(q) ||
   item.number.toLowerCase().includes(q) ||
   (item.clientName || '').toLowerCase().includes(q) ||
   item.issuingAuthority.toLowerCase().includes(q) ||
   String(item.serialNumber).includes(q)
  );
 }, [items, searchQuery]);

 const loadItems = async () => {
  setLoading(true);
  try {
   const response = await api.get<PowerOfAttorney[] | ApiResult<PowerOfAttorney[]>>('/PowerOfAttorney/mine');
   setItems(unwrapList(response.data));
  } catch {
   sileo.error({ title: 'تعذّر تحميل التوكيلات' });
  } finally {
   setLoading(false);
  }
 };

 const loadClients = async () => {
  try {
   const response = await api.get<ClientsResponse>('/Client', {
    params: { pageNumber: 1, pageSize: 200 },
   });
   const payload = response.data;
   setClients(payload.data?.items ?? payload.items ?? []);
  } catch {
   sileo.error({ title: 'تعذّر تحميل قائمة الموكلين' });
  }
 };

 useEffect(() => {
  void loadItems();
  void loadClients();
 }, []);

 const onSubmit = async (data: FormData) => {
  setSaving(true);
  try {
   const requestBody = {
    number: data.number,
    title: data.title,
    issuingAuthority: data.issuingAuthority,
    issueDate: `${data.issueDate}T00:00:00`,
    poaType: data.poaType,
   };
   const response = data.clientId
    ? await api.post<PowerOfAttorney | ApiResult<PowerOfAttorney>>('/PowerOfAttorney', { ...requestBody, clientId: data.clientId })
    : await api.post<PowerOfAttorney | ApiResult<PowerOfAttorney>>('/PowerOfAttorney/mine', requestBody);
   const saved = unwrapData<PowerOfAttorney>(response.data);
   const client = clients.find((item) => item.id === data.clientId);
   setItems((current) => [{ ...saved, clientName: saved.clientName ?? client?.clientName ?? null }, ...current]);
   reset({
    clientId: '',
    poaType: 'general',
    number: '',
    title: '',
    issuingAuthority: '',
    issueDate: new Date().toISOString().slice(0, 10),
   });
   setIsAdding(false);
   sileo.success({ title: 'تم حفظ التوكيل' });
  } catch {
   sileo.error({ title: 'تعذّر حفظ التوكيل. راجع البيانات وحاول مرة أخرى.' });
  } finally {
   setSaving(false);
  }
 };

 const confirmCancel = async () => {
  if (!cancelTarget || !cancelReason) return;
  setSaving(true);
  try {
   const response = await api.put<PowerOfAttorney | ApiResult<PowerOfAttorney>>(`/PowerOfAttorney/${cancelTarget.id}/cancel`, { reason: cancelReason });
   const canceled = unwrapData<PowerOfAttorney>(response.data);
   setItems((current) => current.map((item) => item.id === canceled.id ? { ...item, ...canceled } : item));
   sileo.success({ title: 'تم إلغاء التوكيل' });
  } catch {
   sileo.error({ title: 'تعذّر إلغاء التوكيل' });
  } finally {
   setSaving(false);
   setCancelTarget(null);
   setCancelReason('');
  }
 };

 return (
  <section className="power-attorneys-page">
  <Container>
  <div className="pa-header">
  <div>
  <HeadTitle title="توكيلاتي" />
  <p className="pa-subtitle">اختر موكل عند الحفظ لو عايز التوكيل يظهر داخل ملف الموكل.</p>
  </div>
  <CustomButton
  type="button"
  text={isAdding ? 'إغلاق' : 'إضافة توكيل'}
  color={isAdding ? 'default' : 'primary'}
  variant={isAdding ? 'flat' : 'solid'}
  radius="full"
  startContent={isAdding ? <FiX size={14} /> : <FiPlus size={14} />}
  onClick={() => setIsAdding((value) => !value)}
  />
  </div>

  {isAdding && (
  <form className="pa-form" dir="rtl" onSubmit={handleSubmit(onSubmit)}>
  <div className="pa-form-grid">
  <Controller name="poaType" control={control} render={({ field }) => (
   <Select
   label="نوع التوكيل"
   variant="bordered"
   radius="md"
   selectedKeys={new Set([field.value])}
   onSelectionChange={(keys) => {
    if (keys === 'all') return;
    const selected = Array.from(keys)[0];
    field.onChange(selected ? String(selected) : 'general');
   }}
   >
   {POA_TYPES.map((t) => (
    <SelectItem key={t.key} textValue={t.label}>{t.label}</SelectItem>
   ))}
   </Select>
  )} />
  {watchedPoaType === 'specific' && (
   <Controller name="clientId" control={control} render={({ field }) => (
   <Select
   label="الموكل"
   placeholder="اختر الموكل"
   variant="bordered"
   radius="md"
   selectedKeys={field.value ? new Set([field.value]) : new Set([])}
   onSelectionChange={(keys) => {
    if (keys === 'all') return;
    const selected = Array.from(keys)[0];
    field.onChange(selected ? String(selected) : '');
   }}
   >
   {clients.map((client) => (
    <SelectItem key={client.id} textValue={client.clientName}>
    {client.phoneNumber ? `${client.clientName} - ${client.phoneNumber}` : client.clientName}
    </SelectItem>
   ))}
   </Select>
   )} />
  )}
  <Controller name="number" control={control} render={({ field }) => (
  <CustomInput label="رقم التوكيل" placeholder="مثال: 1234 لسنة 2026" {...field} isInvalid={!!errors.number} errorMessage={errors.number?.message} />
  )} />
  <Controller name="title" control={control} render={({ field }) => (
  <CustomInput label="عنوان التوكيل" placeholder="توكيل رسمي عام قضايا" {...field} isInvalid={!!errors.title} errorMessage={errors.title?.message} />
  )} />
  <Controller name="issuingAuthority" control={control} render={({ field }) => (
  <CustomInput label="جهة الإصدار" placeholder="مكتب توثيق..." {...field} isInvalid={!!errors.issuingAuthority} errorMessage={errors.issuingAuthority?.message} />
  )} />
  <Controller name="issueDate" control={control} render={({ field }) => (
  <CustomInput label="تاريخ الإصدار" type="date" {...field} isInvalid={!!errors.issueDate} errorMessage={errors.issueDate?.message} />
  )} />
  </div>
  <div className="pa-form-actions">
  <CustomButton type="button" text="إلغاء" variant="flat" radius="full" onClick={() => setIsAdding(false)} />
  <CustomButton type="submit" text="حفظ التوكيل" color="primary" radius="full" startContent={<FiSave size={14} />} isLoading={saving} />
  </div>
  </form>
  )}

  <div className="pa-card">
  {items.length === 0 && !loading ? (
  <div className="pa-empty">
  <MdOutlineAssignmentInd />
  <p>لا توجد توكيلات خاصة بك حتى الآن</p>
  {!isAdding && <button type="button" onClick={() => setIsAdding(true)}>+ إضافة أول توكيل</button>}
  </div>
  ) : (
  <>
  <div className="flex items-center justify-end mb-4">
   <SearchInput
   placeholder="ابحث بالعنوان أو الرقم أو الموكل..."
   value={searchQuery}
   onValueChange={setSearchQuery}
   />
  </div>
  <Table aria-label="جدول توكيلاتي" classNames={tableClassNames} removeWrapper>
   <TableHeader>
   <TableColumn>#</TableColumn>
   <TableColumn>النوع</TableColumn>
   <TableColumn>الموكل</TableColumn>
   <TableColumn>عنوان التوكيل</TableColumn>
   <TableColumn>رقم التوكيل</TableColumn>
  <TableColumn>جهة الإصدار</TableColumn>
  <TableColumn>تاريخ الإصدار</TableColumn>
  <TableColumn>الحالة</TableColumn>
  <TableColumn align="center">إجراءات</TableColumn>
  </TableHeader>
  <TableBody isLoading={loading} items={filteredItems}>
  {(item) => (
   <TableRow key={item.id}>
   <TableCell><span className="font-bold text-[var(--main-color)]">{item.serialNumber}</span></TableCell>
   <TableCell>
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
     item.poaType === 'general' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
    }`}>
    {item.poaType === 'general' ? 'عام' : 'خاص'}
    </span>
   </TableCell>
   <TableCell>{item.clientName || '—'}</TableCell>
  <TableCell><span className="pa-title">{item.title}</span></TableCell>
  <TableCell>{item.number}</TableCell>
  <TableCell>{item.issuingAuthority}</TableCell>
  <TableCell>{format(parseISO(item.issueDate), 'yyyy/MM/dd')}</TableCell>
  <TableCell>
  <span className={`pa-badge ${item.isCanceled ? 'pa-badge-canceled' : 'pa-badge-active'}`}>
  {item.isCanceled ? 'ملغى' : 'ساري'}
  </span>
  {item.isCanceled && item.cancellationReason && (
  <span className="text-[10px] block mt-0.5 app-text-muted">({item.cancellationReason})</span>
  )}
  </TableCell>
  <TableCell>
  <div className="pa-table-actions">
  {!item.isCanceled && (
  <CustomButton type="button" text="إلغاء" size="sm" variant="flat" color="danger" radius="full" onClick={() => { setCancelTarget(item); setCancelReason(''); }} />
  )}
  </div>
  </TableCell>
  </TableRow>
  )}
  </TableBody>
  </Table>
  </>
  )}
  </div>

  <Modal
  isOpen={cancelTarget !== null}
  onClose={() => { setCancelTarget(null); setCancelReason(''); }}
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
  <span className="text-base font-bold text-[var(--title-color)]">إلغاء التوكيل رقم {cancelTarget?.serialNumber}</span>
  </div>
  </ModalHeader>
  <ModalBody dir="rtl" className="pb-2">
  <p className="text-sm app-text-muted">
  التوكيل: {cancelTarget?.title} ({cancelTarget?.number})
  </p>
  <RadioGroup
  label="سبب الإلغاء"
  value={cancelReason}
  onValueChange={setCancelReason}
  classNames={{ label: 'text-sm font-bold text-[var(--title-color)]' }}
  >
  {CANCEL_REASONS.map((r) => (
   <Radio key={r.key} value={r.key} classNames={{ label: 'text-sm' }}>{r.label}</Radio>
  ))}
  </RadioGroup>
  </ModalBody>
  <ModalFooter dir="rtl" className="flex gap-2 justify-end pt-2">
  <Button
  variant="flat"
  onPress={() => { setCancelTarget(null); setCancelReason(''); }}
  isDisabled={saving}
  className="font-bold text-sm bg-gray-100 hover:bg-gray-200 text-[var(--title-color)]"
  >
  تراجع
  </Button>
  <Button
  onPress={() => void confirmCancel()}
  isLoading={saving}
  isDisabled={!cancelReason}
  className="font-bold text-sm text-white bg-[var(--danger-color)] hover:opacity-90"
  >
  إلغاء التوكيل
  </Button>
  </ModalFooter>
  </ModalContent>
  </Modal>
  </Container>
  </section>
 );
};

export default PowerOfAttorneysPage;
