import { CustomButton } from'@mohamy/shared-ui';
import { useEffect, useState } from'react';
import { useAppDispatch, useAppSelector } from'../../../hooks/reduxHooks';
import {
 thunkGetDocumentHandoffs,
 thunkCreateDocumentHandoff,
 type TDocumentHandoff
} from'../../../redux/documentHandoff/documentHandoffSlice';

import { sileo } from"sileo";
import { format, parseISO } from'date-fns';
import { ar } from'date-fns/locale/ar';
import { FiPaperclip, FiX, FiCheck, FiUpload } from'react-icons/fi';



type Props = {
 clientId: string;
};

const DocumentHandoffTab = ({ clientId }: Props) => {
 const dispatch = useAppDispatch();
 const { items, loading } = useAppSelector((state) => state.documentHandoffs);

 const [showForm, setShowForm] = useState(false);
 const [docName, setDocName] = useState('');
 const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
 const [receiptFile, setReceiptFile] = useState<File | null>(null);
 const [submitting, setSubmitting] = useState(false);

 useEffect(() => {
 if (clientId) {
 dispatch(thunkGetDocumentHandoffs({ clientId }));
 }
 }, [clientId, dispatch]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!docName.trim()) return sileo.error({ title:'اسم المستند مطلوب' });
 setSubmitting(true);
 const formData = new FormData();
 formData.append('clientId', clientId);
 formData.append('documentName', docName);
 formData.append('deliveryDate', new Date(deliveryDate).toISOString());
 if (receiptFile) {
 formData.append('receiptFile', receiptFile);
 }
 try {
 await dispatch(thunkCreateDocumentHandoff(formData)).unwrap();
 sileo.success({ title:'تم تسجيل إخلاء الطرف بنجاح' });
 setShowForm(false);
 setDocName('');
 setReceiptFile(null);
 } catch {
 sileo.error({ title:'تعذّر حفظ إخلاء الطرف. أعد المحاولة.' });
 } finally {
 setSubmitting(false);
 }
 };

 return (
 <div className="cd-card overflow-hidden" dir="rtl">
 <div className="cd-section-bar">
 <div className="flex items-center gap-3">
 <div className="cd-accent-bar" style={{ background:'var(--cd-gold-mid)' }} />
 <h3 className="text-sm font-bold" style={{ color:'var(--cd-text)' }}>تسليمات المستندات</h3>
 </div>
 <CustomButton
 type="button"
 text={showForm ?'إغلاق' :'+ إضافة محضر تسليم'}
 size="sm"
 radius="full"
 onClick={() => setShowForm(!showForm)}
 />
 </div>

 <div className="p-4">
 {showForm && (
 <div className="cd-form-panel mb-4">
 <form dir="rtl" onSubmit={handleSubmit} className="flex flex-col gap-3">
 <div>
 <label className="block text-xs font-bold mb-1.5 app-text-muted">اسم المستند *</label>
 <input
 type="text"
 value={docName}
 onChange={(e) => setDocName(e.target.value)}
 placeholder="مثال: عقد الإيجار الأصلي"
 className="cd-input"
 required
 />
 </div>
 <div>
 <label className="block text-xs font-bold mb-1.5 app-text-muted">تاريخ التسليم *</label>
 <input
 type="date" aria-label="اختر التاريخ"
 value={deliveryDate}
 onChange={(e) => setDeliveryDate(e.target.value)}
 className="cd-input"
 dir="ltr"
 required
 />
 </div>
 <div>
 <label className="block text-xs font-bold mb-1.5 app-text-muted">إيصال الاستلام (اختياري)</label>
 <input
 type="file"
 accept="image/*,.pdf"
 onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
 className="cd-input"
 style={{ padding:'0.5rem 0.75rem' }}
 />
 </div>
 <div className="flex justify-end gap-2 pt-2" style={{ borderTop:'1px solid var(--cd-outline)' }}>
 <CustomButton
 type="button"
 text="إلغاء"
 size="sm"
 radius="full"
 color="danger"
 startContent={<FiX size={12} />}
 onClick={() => setShowForm(false)}
 />
 <CustomButton
 type="submit"
 text="حفظ"
 size="sm"
 radius="full"
 isLoading={submitting}
 startContent={<FiCheck size={12} />}
 />
 </div>
 </form>
 </div>
 )}

 {loading ==='pending' && (
 <div className="text-center py-6 text-sm" style={{ color:'var(--cd-text-muted)' }}>جاري التحميل...</div>
 )}

 {items.length === 0 && loading !=='pending' ? (
 <div className="cd-empty" style={{ padding:'2rem 1rem' }}>
 <FiPaperclip className="cd-empty-icon" style={{ fontSize:'1.8rem' }} />
 <p>لا توجد مستندات مُسلَّمة</p>
  <button type="button" onClick={() => setShowForm(true)} className="mt-3 text-xs font-bold text-[var(--main-color)] hover:underline">+ تسجيل أول تسليم</button>
 </div>
 ) : (
 <div className="flex flex-col gap-2">
 {items.map((doc: TDocumentHandoff) => (
 <div key={doc.id} className="cd-handoff-item">
 <div className="flex items-center gap-2.5">
 <div
 className="flex items-center justify-center flex-shrink-0"
 style={{
 width: 32,
 height: 32,
 borderRadius:'0.5rem',
 background:'var(--cd-gold-light)',
 color:'var(--cd-gold-dark)',
 fontSize:'0.875rem'
 }}
 >
 <FiPaperclip size={14} />
 </div>
 <div>
 <p className="text-[12px] font-bold" style={{ color:'var(--cd-text)' }}>{doc.documentName}</p>
 <p className="text-[10px] mt-0.5" style={{ color:'var(--cd-text-muted)' }}>
 سُلِّم في {format(parseISO(doc.deliveryDate),'d MMMM yyyy', { locale: ar })}
 </p>
 </div>
 </div>
 {doc.receiptFilePath && (
 <a
 href={`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/,'')}${doc.receiptFilePath}`}
 target="_blank"
 rel="noreferrer"
 className="cd-icon-btn"
 title="عرض الإيصال"
 >
 <FiUpload size={14} />
 </a>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
};

export default DocumentHandoffTab;
