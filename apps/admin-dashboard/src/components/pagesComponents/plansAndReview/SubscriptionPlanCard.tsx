import'./plansAndReview.css';
import { CustomCard, CustomButton } from'@mohamy/shared-ui';
import { FiEdit3 } from"react-icons/fi"
import { FaRegCircleCheck } from'react-icons/fa6';
import { MdArchive, MdSettingsBackupRestore } from 'react-icons/md';


type TSubscriptionPlanCard = {
  plan: {
  id: number,
  name: string,
  price: number,
  yearlyPrice?: number | null,
  duration: string,
  aiRequestsLimit: number,
  features: string[],
  isActive?: boolean,
  };
  onEdit?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
}

const SubscriptionPlanCard = ({ plan, onEdit, onArchive, onRestore }: TSubscriptionPlanCard) => {
 return (
 <CustomCard>
 <div className={`plan-card ${!plan.isActive ?'archived' :''}`}>
  <div className="badge flex flex-col items-center justify-center gap-1.5">
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <h4>{plan.name}</h4>
      {(plan.name === 'الباقة التجريبية' || plan.name === 'Free Trial') && (
        <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--main-color)] text-white font-medium">
          تجريبية
        </span>
      )}
    </div>
    {!plan.isActive && (
      <span className="text-[11px] px-2 py-0.5 rounded bg-red-500 text-white font-medium">
        مؤرشفة
      </span>
    )}
  </div>
  <h3><span>{plan.price}</span> / ج.م {plan.duration}</h3>
  {plan.yearlyPrice != null && plan.yearlyPrice > 0 && (
  <h3><span>{plan.yearlyPrice}</span> / ج.م سنوياً</h3>
  )}
  <p className="mt-3 text-sm font-semibold text-[var(--main-color)]">
    {plan.aiRequestsLimit} نقطة ذكاء اصطناعي
  </p>
 <ul>
 {plan.features.map((feature, idx) => (
 <li key={idx}>
 <FaRegCircleCheck />
 {feature}
 </li>
 ))}
 </ul>
 <div className="w-full flex gap-2 flex-col">
 <CustomButton
 type="button"
 text="تعديل الخطة"
 startContent={<FiEdit3 />}
 size="md"
 radius="md"
 color="primary"
 onClick={onEdit}
 />
 {plan.isActive && onArchive && (
 <CustomButton
 type="button"
 text="أرشفة الخطة"
 startContent={<MdArchive />}
 size="md"
 radius="md"
 color="danger"
 onClick={onArchive}
 />
 )}
 {!plan.isActive && onRestore && (
 <CustomButton
 type="button"
 text="استعادة الخطة"
 startContent={<MdSettingsBackupRestore />}
 size="md"
 radius="md"
 color="success"
 onClick={onRestore}
 />
 )}
 </div>
 </div>
 </CustomCard>
 );
};

export default SubscriptionPlanCard;
