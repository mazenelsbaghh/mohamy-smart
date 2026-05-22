import { CustomButton } from'@mohamy/shared-ui';
import { useEffect, useState } from'react';
import { useAppDispatch, useAppSelector } from'../../../hooks/reduxHooks';
import {
 thunkGetClientTransactions,
 thunkCreateClientTransaction,
 type TClientTransaction
} from'../../../redux/clientTransactions/clientTransactionSlice';

import { sileo } from"sileo";
import { format, parseISO } from'date-fns';
import { ar } from'date-fns/locale/ar';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiX, FiCheck, FiDownload } from'react-icons/fi';



type Props = {
 clientId: string;
 clientName: string;
};

const FinancialsTab = ({ clientId, clientName }: Props) => {
 const dispatch = useAppDispatch();
 const { transactions, loading } = useAppSelector((state) => state.clientTransactions);

 const [showForm, setShowForm] = useState(false);
 const [type, setType] = useState<'Income' |'Expense'>('Income');
 const [amount, setAmount] = useState('');
 const [description, setDescription] = useState('');
 const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
 const [submitting, setSubmitting] = useState(false);

 useEffect(() => {
 if (clientId) {
 dispatch(thunkGetClientTransactions({ clientId }));
 }
 }, [clientId, dispatch]);

 const totalIncome = transactions.filter(t => t.type ==='Income').reduce((s, t) => s + t.amount, 0);
 const totalExpense = transactions.filter(t => t.type ==='Expense').reduce((s, t) => s + t.amount, 0);
 const balance = totalIncome - totalExpense;

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!description.trim() || !amount) return;
 setSubmitting(true);
 try {
 await dispatch(thunkCreateClientTransaction({
 clientId,
 type,
 amount: parseFloat(amount),
 description,
 transactionDate: new Date(transactionDate).toISOString(),
 })).unwrap();
 sileo.success({ title:'تمت إضافة المعاملة بنجاح' });
 setShowForm(false);
 setAmount('');
 setDescription('');
 } catch {
 sileo.error({ title:'تعذّر إضافة المعاملة. أعد المحاولة.' });
 } finally {
 setSubmitting(false);
 }
 };

 const exportToExcel = async () => {
 try {
 const XLSX = await import('xlsx');
 const data = transactions.map((t) => ({'النوع': t.type ==='Income' ?'دخل' :'مصروف','المبلغ (ج.م)': t.amount,'الوصف': t.description,'التاريخ': format(parseISO(t.transactionDate),'yyyy/MM/dd'),
 }));
 const summary = [
 {'النوع':'','المبلغ (ج.م)':'','الوصف':'','التاريخ':'' },
 {'النوع':'إجمالي الدخل','المبلغ (ج.م)': totalIncome,'الوصف':'','التاريخ':'' },
 {'النوع':'إجمالي المصروفات','المبلغ (ج.م)': totalExpense,'الوصف':'','التاريخ':'' },
 {'النوع':'الرصيد','المبلغ (ج.م)': balance,'الوصف':'','التاريخ':'' },
 ];
 const ws = XLSX.utils.json_to_sheet([...data, ...summary]);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws,'كشف الحساب');
 XLSX.writeFile(wb, `كشف_حساب_${clientName}_${format(new Date(),'yyyy-MM-dd')}.xlsx`);
 sileo.success({ title:'تم تصدير الملف بنجاح' });
 } catch {
 sileo.error({ title:'تعذّر تصدير الملف. اتصل بالدعم الفني.' });
 }
 };

    return (
        <div className="cd-card overflow-hidden" dir="rtl">
            <div className="cd-section-bar">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-4 rounded-full bg-[var(--main-color)] flex-shrink-0" />
                    <h3 className="text-sm font-bold text-[var(--title-color)]">الملخص المالي</h3>
                </div>
                <div className="flex gap-2">
                    {transactions.length > 0 && (
                        <CustomButton
                            type="button"
                            text="تصدير"
                            size="sm"
                            radius="full"
                            startContent={<FiDownload size={13} />}
                            onClick={exportToExcel}
                        />
                    )}
                    <CustomButton
                        type="button"
                        text="تسجيل معاملة مالية"
                        size="sm"
                        radius="full"
                        onClick={() => setShowForm(!showForm)}
                    />
                </div>
            </div>

            <div className="p-4">
                <div className="cd-fin-gradient mb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-[var(--text-color)] opacity-70">الرصيد الصافي</p>
                            <p className={`text-xl font-black ${balance >= 0 ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}`}>
                                {balance.toLocaleString('en-US')} ج.م
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--main-color)]/10 text-[var(--main-color)]">
                            <FiDollarSign size={18} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3 mb-4">
                    <div className="cd-fin-income">
                        <div className="flex items-center gap-1.5 mb-1">
                            <FiTrendingUp size={12} className="text-[var(--success-color)]" />
                            <span className="text-xs font-bold text-[var(--success-color)]">إجمالي الدخل</span>
                        </div>
                        <p className="text-sm font-black text-[var(--success-color)]">{totalIncome.toLocaleString('en-US')}</p>
                    </div>
                    <div className="cd-fin-expense">
                        <div className="flex items-center gap-1.5 mb-1">
                            <FiTrendingDown size={12} className="text-[var(--danger-color)]" />
                            <span className="text-xs font-bold text-[var(--danger-color)]">إجمالي المصروفات</span>
                        </div>
                        <p className="text-sm font-black text-[var(--danger-color)]">{totalExpense.toLocaleString('en-US')}</p>
                    </div>
                </div>

                {showForm && (
                    <div className="cd-form-panel mb-4">
                        <form dir="rtl" onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 app-text-muted">النوع</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as 'Income' | 'Expense')}
                                        className="cd-input"
                                    >
                                        <option value="Income">دخل (إيراد)</option>
                                        <option value="Expense">مصروف</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 app-text-muted">المبلغ (ج.م) *</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="cd-input"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1.5 app-text-muted">الوصف *</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="مثال: أتعاب جلسة 8 أبريل"
                                    className="cd-input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1.5 app-text-muted">التاريخ *</label>
                                <input
                                    type="date" aria-label="اختر التاريخ"
                                    value={transactionDate}
                                    onChange={(e) => setTransactionDate(e.target.value)}
                                    className="cd-input"
                                    dir="ltr"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t app-border">
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

                {loading === 'pending' && (
                    <div className="text-center py-6 text-sm app-text-muted">جاري التحميل...</div>
                )}

                {transactions.length === 0 && loading !== 'pending' ? (
                    <div className="cd-empty py-8 px-4">
                        <FiDollarSign className="cd-empty-icon text-[1.8rem]" />
                        <p>لا توجد معاملات مالية</p>
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="mt-3 text-xs font-bold text-[var(--main-color)] hover:underline"
                        >
                            + تسجيل أول معاملة
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto">
                        {transactions.map((t: TClientTransaction) => (
                            <div key={t.id} className="cd-tx-item">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className={`w-[30px] min-h-[30px] rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
                                            t.type === 'Income'
                                                ? 'bg-[var(--success-color)]/10 text-[var(--success-color)]'
                                                : 'bg-[var(--danger-color)]/10 text-[var(--danger-color)]'
                                        }`}
                                    >
                                        {t.type === 'Income' ? <FiTrendingUp size={13} /> : <FiTrendingDown size={13} />}
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold text-[var(--title-color)]">{t.description}</p>
                                        <p className="text-xs mt-0.5 app-text-muted">{format(parseISO(t.transactionDate), 'd MMMM yyyy', { locale: ar })}</p>
                                    </div>
                                </div>
                                <span className={`text-[13px] font-bold ${t.type === 'Income' ? 'text-[var(--success-color)]' : 'text-[var(--danger-color)]'}`}>
                                    {t.type === 'Income' ? '+' : '-'}{t.amount.toLocaleString('en-US')} ج.م
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialsTab;
