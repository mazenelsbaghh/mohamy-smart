import FormModal from'../ui/form/FormModal';
import { CustomButton } from'@mohamy/shared-ui';
import { useState } from'react';
import { LuWallet, LuCreditCard, LuCheck, LuCreditCard as LuCardIcon } from'react-icons/lu';

type TPaymentModal = {
 isOpen: boolean;
 onClose: () => void;
 planName: string;
 planPrice: number;
 onConfirm: (method:'wallet' |'card') => void;
 loading: boolean;
}

const PaymentModal = ({ isOpen, onClose, planName, planPrice, onConfirm, loading }: TPaymentModal) => {
 const [selected, setSelected] = useState<'wallet' |'card' | null>(null);

 const handleConfirm = () => {
 if (!selected) return;
 onConfirm(selected);
 };

 return (
 <FormModal
 isOpen={isOpen}
 onClose={onClose}
 size="lg"
 title="اختر طريقة الدفع"
 subtitle={
 <span>
 الاشتراك في خطة{''}
 <span className="font-semibold text-[var(--main-color)]">{planName}</span>
 {''}بسعر{''}
 <span className="font-semibold text-[var(--title-color)]">{planPrice} ج.م</span>
 </span>
 }
 icon={<LuCardIcon />}
 >
 <div className="px-6 pb-6 pt-5">
 <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-6">
 {/* Wallet */}
 <div
 onClick={() => !loading && setSelected('wallet')}
 className={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-colors duration-200
 ${selected ==='wallet'
 ?'border-[var(--main-color)] bg-[var(--main-color)]/5 shadow-md'
 :'app-border-strong hover:border-[var(--main-color)]/50 hover:shadow-sm'
 } ${loading ?'opacity-50 cursor-not-allowed' :''}`}
 >
 <div className={`p-3 rounded-full transition-colors ${selected ==='wallet' ?'bg-[var(--main-color)]/10' :'app-surface-soft'}`}>
 <LuWallet size={32} className={selected ==='wallet' ?'text-[var(--main-color)]' :'text-gray-500'} />
 </div>
 <div className="text-center">
 <h4 className="font-bold text-[var(--title-color)]">محفظة إلكترونية</h4>
 <p className="text-xs app-text-subtle mt-1">كل المحافظ المدعومة</p>
 </div>
 {selected ==='wallet' && (
 <span className="flex items-center gap-1 text-xs bg-[var(--main-color)] text-white px-3 py-1 rounded-full">
 <LuCheck size={11} /> محدد
 </span>
 )}
 </div>

 {/* Card */}
 <div
 onClick={() => !loading && setSelected('card')}
 className={`cursor-pointer rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-colors duration-200
 ${selected ==='card'
 ?'border-[var(--main-color)] bg-[var(--main-color)]/5 shadow-md'
 :'app-border-strong hover:border-[var(--main-color)]/50 hover:shadow-sm'
 } ${loading ?'opacity-50 cursor-not-allowed' :''}`}
 >
 <div className={`p-3 rounded-full transition-colors ${selected ==='card' ?'bg-[var(--main-color)]/10' :'app-surface-soft'}`}>
 <LuCreditCard size={32} className={selected ==='card' ?'text-[var(--main-color)]' :'text-gray-500'} />
 </div>
 <div className="text-center">
 <h4 className="font-bold text-[var(--title-color)]">بطاقة ائتمان</h4>
 <p className="text-xs app-text-subtle mt-1">Visa / Mastercard</p>
 </div>
 {selected ==='card' && (
 <span className="flex items-center gap-1 text-xs bg-[var(--main-color)] text-white px-3 py-1 rounded-full">
 <LuCheck size={11} /> محدد
 </span>
 )}
 </div>
 </div>

 <div className="flex gap-3">
 <CustomButton
 type="button"
 text={loading ?'جاري تحويلك للدفع...' :'متابعة الدفع'}
 size="md"
 radius="lg"
 color="primary"
 variant="solid"
 onClick={handleConfirm}
 isDisabled={!selected || loading}
 isLoading={loading}
 />
 <CustomButton
 type="button"
 text="إلغاء"
 size="md"
 radius="lg"
 color="danger"
 variant="flat"
 onClick={onClose}
 isDisabled={loading}
 />
 </div>
 </div>
 </FormModal>
 );
};

export default PaymentModal;
