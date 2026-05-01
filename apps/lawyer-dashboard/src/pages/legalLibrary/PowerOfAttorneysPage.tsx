import { useEffect, useState } from'react';
import { Controller, useForm } from'react-hook-form';
import { zodResolver } from'@hookform/resolvers/zod';
import { z } from'zod';
import { format, parseISO } from'date-fns';
import { CustomButton, CustomInput, Container } from'@mohamy/shared-ui';
import { Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from'@heroui/react';
import { tableClassNames } from'@mohamy/shared-ui';
import { FiPlus, FiSave, FiX } from'react-icons/fi';
import { MdOutlineAssignmentInd } from'react-icons/md';
import { sileo } from'sileo';
import api from'../../APIs/api';
import HeadTitle from'../../components/headTitle/HeadTitle';
import ConfirmDialog from'../../components/common/ConfirmDialog';
import usePageTitle from'../../hooks/usePageTitle';
import'./PowerOfAttorneysPage.css';

type PowerOfAttorney = {
 id: string;
 clientId?: string | null;
 clientName?: string | null;
 number: string;
 title: string;
 issuingAuthority: string;
 issueDate: string;
 isCanceled: boolean;
 cancellationDate?: string | null;
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
 number: z.string().min(1, 'رقم التوكيل مطلوب'),
 title: z.string().min(1, 'عنوان التوكيل مطلوب'),
 issuingAuthority: z.string().min(1, 'جهة الإصدار مطلوبة'),
 issueDate: z.string().min(1, 'تاريخ الإصدار مطلوب'),
});

type FormData = z.infer<typeof schema>;

const unwrapData = <T,>(payload: T | ApiResult<T>): T => {
 if (payload && typeof payload ==='object' && 'data' in payload) {
 return (payload as ApiResult<T>).data as T;
 }
 return payload as T;
};

const unwrapList = <T,>(payload: T[] | ApiResult<T[]>): T[] => {
 const data = unwrapData<T[]>(payload);
 return Array.isArray(data) ? data : [];
};

const PowerOfAttorneysPage = () => {
 usePageTitle('توكيلاتي');
 const [items, setItems] = useState<PowerOfAttorney[]>([]);
 const [clients, setClients] = useState<ClientOption[]>([]);
 const [loading, setLoading] = useState(false);
 const [saving, setSaving] = useState(false);
 const [isAdding, setIsAdding] = useState(false);
 const [cancelTarget, setCancelTarget] = useState<PowerOfAttorney | null>(null);

 const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
 resolver: zodResolver(schema),
 defaultValues: {
 clientId: '',
 number: '',
 title: '',
 issuingAuthority: '',
 issueDate: new Date().toISOString().slice(0, 10),
 },
 });

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
 };
 const response = data.clientId
 ? await api.post<PowerOfAttorney | ApiResult<PowerOfAttorney>>('/PowerOfAttorney', { ...requestBody, clientId: data.clientId })
 : await api.post<PowerOfAttorney | ApiResult<PowerOfAttorney>>('/PowerOfAttorney/mine', requestBody);
 const saved = unwrapData<PowerOfAttorney>(response.data);
 const client = clients.find((item) => item.id === data.clientId);
 setItems((current) => [{ ...saved, clientName: saved.clientName ?? client?.clientName ?? null }, ...current]);
 reset({
 clientId: '',
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
 if (!cancelTarget) return;
 setSaving(true);
 try {
 const response = await api.put<PowerOfAttorney | ApiResult<PowerOfAttorney>>(`/PowerOfAttorney/${cancelTarget.id}/cancel`);
 const canceled = unwrapData<PowerOfAttorney>(response.data);
 setItems((current) => current.map((item) => item.id === canceled.id ? { ...item, ...canceled } : item));
 sileo.success({ title: 'تم إلغاء التوكيل' });
 } catch {
 sileo.error({ title: 'تعذّر إلغاء التوكيل' });
 } finally {
 setSaving(false);
 setCancelTarget(null);
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
 <Controller name="clientId" control={control} render={({ field }) => (
 <Select
 label="الموكل"
 placeholder="بدون موكل"
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
 <Table aria-label="جدول توكيلاتي" classNames={tableClassNames} removeWrapper>
 <TableHeader>
 <TableColumn>الموكل</TableColumn>
 <TableColumn>عنوان التوكيل</TableColumn>
 <TableColumn>رقم التوكيل</TableColumn>
 <TableColumn>جهة الإصدار</TableColumn>
 <TableColumn>تاريخ الإصدار</TableColumn>
 <TableColumn>الحالة</TableColumn>
 <TableColumn align="center">إجراءات</TableColumn>
 </TableHeader>
 <TableBody isLoading={loading} items={items}>
 {(item) => (
 <TableRow key={item.id}>
 <TableCell>{item.clientName || 'بدون موكل'}</TableCell>
 <TableCell><span className="pa-title">{item.title}</span></TableCell>
 <TableCell>{item.number}</TableCell>
 <TableCell>{item.issuingAuthority}</TableCell>
 <TableCell>{format(parseISO(item.issueDate), 'yyyy/MM/dd')}</TableCell>
 <TableCell>
 <span className={`pa-badge ${item.isCanceled ? 'pa-badge-canceled' : 'pa-badge-active'}`}>
 {item.isCanceled ? 'ملغى' : 'ساري'}
 </span>
 </TableCell>
 <TableCell>
 <div className="pa-table-actions">
 {!item.isCanceled && (
 <CustomButton type="button" text="إلغاء" size="sm" variant="flat" color="danger" radius="full" onClick={() => setCancelTarget(item)} />
 )}
 </div>
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 )}
 </div>

 <ConfirmDialog
 isOpen={cancelTarget !== null}
 onClose={() => setCancelTarget(null)}
 onConfirm={() => void confirmCancel()}
 title="إلغاء التوكيل"
 description={cancelTarget ? `هل أنت متأكد من إلغاء التوكيل رقم ${cancelTarget.number}؟` : ''}
 confirmText="إلغاء التوكيل"
 cancelText="تراجع"
 danger
 />
 </Container>
 </section>
 );
};

export default PowerOfAttorneysPage;
