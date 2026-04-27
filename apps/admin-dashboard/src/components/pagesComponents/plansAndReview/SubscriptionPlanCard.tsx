import'./plansAndReview.css';
import { CustomCard, CustomButton } from'@mohamy/shared-ui';
import { FiEdit3 } from"react-icons/fi"
import { FaRegCircleCheck } from'react-icons/fa6';
import { MdArchive } from'react-icons/md';


type TSubscriptionPlanCard = {
  plan: {
  id: number,
  name: string,
  price: number,
  yearlyPrice?: number | null,
  duration: string,
  features: string[],
  isActive?: boolean,
  };
  onEdit?: () => void;
  onArchive?: () => void;
}

const SubscriptionPlanCard = ({ plan, onEdit, onArchive }: TSubscriptionPlanCard) => {
 return (
 <CustomCard>
 <div className={`plan-card ${!plan.isActive ?'archived' :''}`}>
 <div className="badge">
 <h4>{plan.name}</h4>
 {!plan.isActive && (
 <span className="archived-badge">مؤرشفة</span>
 )}
 </div>
  <h3><span>{plan.price}</span> / ج.م {plan.duration}</h3>
  {plan.yearlyPrice != null && plan.yearlyPrice > 0 && (
  <h3><span>{plan.yearlyPrice}</span> / ج.م سنوياً</h3>
  )}
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
 </div>
 </div>
 </CustomCard>
 );
};

export default SubscriptionPlanCard;
