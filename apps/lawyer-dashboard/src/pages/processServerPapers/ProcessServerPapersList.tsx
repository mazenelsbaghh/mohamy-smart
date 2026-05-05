import usePageTitle from '../../hooks/usePageTitle';
import { CustomButton, CustomCard } from '@mohamy/shared-ui';
import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { sileo } from "sileo";
import { MdCheckCircle, MdDelete, MdDownload, MdEdit, MdOutlineDescription, MdUploadFile } from 'react-icons/md';


import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Chip, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { SearchInput } from '@mohamy/shared-ui';
import { FilterSelect } from '@mohamy/shared-ui';
import { tableClassNames } from '@mohamy/shared-ui';
import NotFoundImage from '../../components/notFound/NotFoundImage';
import FormModal from '../../components/ui/form/FormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  PSP_STATUS_LABELS,
  PSP_TYPE_LABELS,
  thunkCreatePaper,
  thunkDeletePaper,
  thunkGetPapers,
  thunkMarkPaperServed,
  thunkUpdatePaper,
  thunkUploadPaperAttachment,
  type ProcessServerPaperStatus,
  type ProcessServerPaperType,
  type TCreatePSPPayload,
  type TProcessServerPaper,
} from '../../redux/processServerPapers/processServerPapersSlice';

const API_BASE = import.meta.env.VITE_API_URL || '';

type Props = {
  scope?: 'all' | 'client' | 'case';
  clientId?: string;
  caseId?: string;
  title?: string;
};

type FormState = {
  id?: string;
  clientId?: string | null;
  caseId?: string | null;
  targetName: string;
  processServerName: string;
  servedDate: string;
  deliveryNumber: string;
  paperType: ProcessServerPaperType;
  status: ProcessServerPaperStatus;
  notes: string;
};

const emptyForm = (clientId?: string, caseId?: string): FormState => ({
  clientId: clientId ?? null,
  caseId: caseId ?? null,
  targetName: '',
  processServerName: '',
  servedDate: '',
  deliveryNumber: '',
  paperType: 1,
  status: 1,
  notes: '',
});

const ProcessServerPapersList = ({ scope = 'all', clientId, caseId, title }: Props) => {
  const dispatch = useAppDispatch();
   usePageTitle('أوراق المحضرين');
  const { items, loading, mutationLoading, error } = useAppSelector((state) => state.processServerPapers);
  const [statusFilter, setStatusFilter] = useState<ProcessServerPaperStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ProcessServerPaperType | ''>('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(clientId, caseId));
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const filters: Record<string, string | number> = {};
    if (statusFilter) filters.status = statusFilter;
    if (typeFilter) filters.type = typeFilter;
    if (search.trim()) filters.search = search.trim();
    if (scope === 'client' && clientId) filters.clientId = clientId;
    if (scope === 'case' && caseId) filters.caseId = caseId;
    dispatch(thunkGetPapers(filters));
  }, [caseId, clientId, dispatch, scope, search, statusFilter, typeFilter]);

  const filteredItems = useMemo(() => Array.isArray(items) ? items : [], [items]);

  const openCreate = () => {
    setForm(emptyForm(clientId, caseId));
    setShowForm(true);
  };

  const openEdit = (paper: TProcessServerPaper) => {
    setForm({
      id: paper.id,
      clientId: paper.clientId ?? null,
      caseId: paper.caseId ?? null,
      targetName: paper.targetName,
      processServerName: paper.processServerName || '',
      servedDate: paper.servedDate ? paper.servedDate.split('T')[0] : '',
      deliveryNumber: paper.deliveryNumber || '',
      paperType: paper.paperType,
      status: paper.status,
      notes: paper.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.targetName.trim()) {
      sileo.error({ title: 'بيان الورقة مطلوب' });
      return;
    }
    if (!form.processServerName.trim()) {
      sileo.error({ title: 'اسم المحضرين مطلوب' });
      return;
    }

    const payload: TCreatePSPPayload = {
      clientId: form.clientId || null,
      caseId: form.caseId || null,
      targetName: form.targetName,
      processServerName: form.processServerName,
      servedDate: form.servedDate ? new Date(form.servedDate).toISOString() : null,
      deliveryNumber: form.deliveryNumber || null,
      paperType: form.paperType,
      status: form.status,
      notes: form.notes || undefined,
    };

    try {
      if (form.id) {
        await dispatch(thunkUpdatePaper({ id: form.id, payload })).unwrap();
        sileo.success({ title: 'تم تحديث الورقة' });
      } else {
        await dispatch(thunkCreatePaper(payload)).unwrap();
        sileo.success({ title: 'تم إنشاء الورقة' });
      }
      setShowForm(false);
    } catch (err) {
      sileo.error({ title: String(err || 'فشل حفظ ورقة المحضرين') });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const toastId = sileo.show({ type: "loading", title: 'جاري الحذف...' });
    try {
      await dispatch(thunkDeletePaper({ id: deleteTarget })).unwrap();
      sileo.success({ title: 'تم حذف الورقة' });
    } catch (err) {
      sileo.error({ title: String(err || 'فشل حذف الورقة') });
    } finally {
      sileo.dismiss(toastId);
      setDeleteTarget(null);
    }
  };

  const handleMarkServed = async (id: string) => {
    const toastId = sileo.show({ type: "loading", title: 'جاري تحديث الحالة...' });
    try {
      await dispatch(thunkMarkPaperServed({ id })).unwrap();
      sileo.success({ title: 'تم تعليم الورقة كمُعلنة' });
    } catch (err) {
      sileo.error({ title: String(err || 'فشل تحديث الحالة') });
    } finally {
      sileo.dismiss(toastId);
    }
  };

  const handleUpload = async (id: string, file: File) => {
    const toastId = sileo.show({ type: "loading", title: 'جاري رفع المرفق...' });
    try {
      await dispatch(thunkUploadPaperAttachment({ id, file })).unwrap();
      sileo.success({ title: 'تم رفع المرفق' });
    } catch (err) {
      sileo.error({ title: String(err || 'فشل رفع المرفق') });
    } finally {
      sileo.dismiss(toastId);
    }
  };

  return (
    <CustomCard className="process-server-papers-card">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MdOutlineDescription size={22} style={{ color: 'var(--main-color)' }} />
          <h3 className="text-lg font-bold m-0" style={{ color: 'var(--title-color)' }}>
            {title || 'أوراق المحضرين'}
          </h3>
        </div>
        <CustomButton
          type="button"
          text="إضافة ورقة"
          radius="full"
          size="md"
          color="primary"
          onClick={openCreate}
        />
      </div>

      <div className="flex flex-col gap-4 mb-4 mt-6 px-1">
        <div className="flex flex-col md:flex-row gap-3 w-full">
          <div className="flex-1 w-full md:max-w-xs shrink-0">
            <SearchInput
              placeholder="بحث ببيان الورقة أو المحضرين"
              value={search}
              onValueChange={setSearch}
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto justify-end flex-1 md:flex-initial">
            <div className="w-full sm:w-auto flex-1 md:flex-initial shrink-0">
              <FilterSelect
                placeholder="حالة الإعلان..."
                options={[
                  { label: 'كل الحالات', value: '' },
                  ...Object.entries(PSP_STATUS_LABELS).map(([key, label]) => ({ label, value: key }))
                ]}
                selectedKeys={statusFilter ? [statusFilter.toString()] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys as Iterable<unknown>)[0] as string;
                  setStatusFilter(val ? Number(val) as ProcessServerPaperStatus : '');
                }}
              />
            </div>
            <div className="w-full sm:w-auto flex-1 md:flex-initial shrink-0">
              <FilterSelect
                placeholder="نوع الورقة..."
                options={[
                  { label: 'كل الأنواع', value: '' },
                  ...Object.entries(PSP_TYPE_LABELS).map(([key, label]) => ({ label, value: key }))
                ]}
                selectedKeys={typeFilter ? [typeFilter.toString()] : []}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys as Iterable<unknown>)[0] as string;
                  setTypeFilter(val ? Number(val) as ProcessServerPaperType : '');
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <FormModal
        isOpen={showForm}
        onOpenChange={setShowForm}
        title={form.id ? 'تعديل الورقة' : 'إضافة ورقة'}
        icon={<MdOutlineDescription size={20} />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <Textarea 
            label="بيان الورقة" 
            variant="bordered"
            labelPlacement="outside"
            placeholder="أدخل بيان الورقة"
            minRows={3}
            value={form.targetName} 
            onValueChange={(val) => setForm({ ...form, targetName: val })} 
            isRequired
          />
          
          <Input 
            label="المحضرين" 
            variant="bordered"
            labelPlacement="outside"
            placeholder="اسم المحضرين"
            value={form.processServerName} 
            onValueChange={(val) => setForm({ ...form, processServerName: val })} 
            isRequired
          />

          <Input 
            type="date" aria-label="اختر التاريخ" 
            label="تاريخ التسليم للمحضرين" 
            variant="bordered"
            labelPlacement="outside"
            value={form.servedDate} 
            onValueChange={(val) => setForm({ ...form, servedDate: val })} 
          />

          <Input 
            label="رقم التسليم" 
            variant="bordered"
            labelPlacement="outside"
            placeholder="رقم التسليم (اختياري)"
            value={form.deliveryNumber} 
            onValueChange={(val) => setForm({ ...form, deliveryNumber: val })} 
          />
          
          <div className="flex justify-end gap-3 mt-4">
            <CustomButton type="button" text="إلغاء" radius="full" size="md" variant="bordered" color="default" onClick={() => setShowForm(false)} />
            <CustomButton type="submit" text="حفظ" radius="full" size="md" color="primary" isLoading={mutationLoading === 'pending'} />
          </div>
        </form>
      </FormModal>

      {loading === 'failed' && (
        <div className="py-6 text-center">
          <p className="text-sm mb-3" style={{ color: 'var(--danger-color)' }}>
            {error || 'تعذر تحميل أوراق المحضرين حالياً.'}
          </p>
        </div>
      )}

      <Table 
        aria-label="قائمة أوراق المحضرين"
        color="primary" 
        selectionMode="none"
        classNames={tableClassNames}
      >
        <TableHeader>
          <TableColumn>بيان الورقة</TableColumn>
          <TableColumn>المحضرين</TableColumn>
          <TableColumn>تاريخ التسليم</TableColumn>
          <TableColumn>رقم التسليم</TableColumn>
          <TableColumn>الحالة</TableColumn>
          <TableColumn align="center">الإجراءات</TableColumn>
        </TableHeader>
        <TableBody 
          items={filteredItems} 
          isLoading={loading === 'pending'}
          loadingContent={<Spinner label="جاري تحميل الأوراق..." />}
          emptyContent={
            loading !== 'pending' && filteredItems?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <NotFoundImage text="لا توجد أوراق محضرين لعرضها." variant="cases" />
                <CustomButton 
                  type="button"
                  color="primary" 
                  onClick={openCreate} 
                  text="إضافة ورقة محضرين"
                  size="md"
                  radius="full"
                />
              </div>
            ) : ""
          }
        >
          {(paper) => (
            <TableRow key={paper.id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[var(--title-color)]">{paper.targetName}</span>
                  <Chip size="sm" color="primary" variant="flat">{PSP_TYPE_LABELS[paper.paperType]}</Chip>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">{paper.processServerName || '-'}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {paper.servedDate ? format(parseISO(paper.servedDate), 'yyyy/MM/dd') : '-'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{paper.deliveryNumber || '-'}</span>
              </TableCell>
              <TableCell>
                <Chip 
                  size="sm" 
                  color={paper.status === 3 ? "success" : paper.status === 4 ? "danger" : "warning"} 
                  variant="dot"
                >
                  {PSP_STATUS_LABELS[paper.status]}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {paper.attachmentUrl ? (
                    <a
                      href={`${API_BASE}${paper.attachmentUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--main-color)] text-white hover:opacity-80 transition-opacity"
                    >
                      <MdDownload size={14} /> المرفق
                    </a>
                  ) : (
                    <label className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer border border-[var(--main-color)] text-[var(--main-color)] hover:bg-[var(--main-color)] hover:text-white transition-colors">
                      <MdUploadFile size={14} /> رفع صورة
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(paper.id, file);
                        }}
                      />
                    </label>
                  )}

                  {paper.status !== 3 && (
                    <button type="button" onClick={() => handleMarkServed(paper.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-green-500 text-[var(--success-color)] hover:bg-[var(--success-soft)] transition-colors dark:hover:bg-green-900/20">
                      <MdCheckCircle size={12} /> إعلان
                    </button>
                  )}

                  <button type="button" onClick={() => openEdit(paper)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-[var(--main-color)] text-[var(--main-color)] hover:bg-[var(--main-color)] hover:text-white transition-colors">
                    <MdEdit size={12} /> تعديل
                  </button>

                  <button type="button" onClick={() => setDeleteTarget(paper.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-red-500 text-[var(--danger-color)] hover:bg-[var(--danger-soft)] transition-colors dark:hover:bg-red-900/20 cursor-pointer">
                    <MdDelete size={12} /> حذف
                  </button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
       isOpen={deleteTarget !== null}
       onClose={() => setDeleteTarget(null)}
       onConfirm={() => void handleDeleteConfirm()}
       title="حذف ورقة المحضرين"
       description="هل أنت متأكد من حذف هذه الورقة؟ لا يمكن التراجع عن هذا الإجراء."
       confirmText="حذف"
       cancelText="إلغاء"
       danger
      />
    </CustomCard>
  );
};

export default ProcessServerPapersList;
