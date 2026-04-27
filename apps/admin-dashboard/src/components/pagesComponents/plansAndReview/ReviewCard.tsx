import'./plansAndReview.css';
import { CustomButton, CustomCard } from'@mohamy/shared-ui';
import { FaStar } from"react-icons/fa";
import { useDispatch } from"react-redux";
import type { AppDispatch } from"../../../redux/store";
import type { TReview } from"../../../redux/reviews/thunk/fetchReviews";
import updateReviewStatus from"../../../redux/reviews/thunk/updateReviewStatus";

type TReviewCardProps = {
 review: TReview;
};

const ReviewCard = ({ review }: TReviewCardProps) => {
 const dispatch = useDispatch<AppDispatch>();

 return (
 <div>
 <CustomCard>
 <div className="review-card">
 <h4>{review.reviewerName}</h4>
 {review.reviewerRole && <h5>{review.reviewerRole}</h5>}
 <div className="stars">
 {[1, 2, 3, 4, 5].map((star) => (
 <FaStar
 key={star}
 color={star <= review.rating ?"#FFD700" :"#ccc"}
 />
 ))}
 </div>
 <p>{review.comment}</p>
 <p className="text-xs app-text-subtle mt-1">
 بواسطة: {review.lawyerName ||"غير معروف"}
 </p>
 <div className="flex">
 {review.status !=="Approved" && (
 <div className="w-6/12 px-4">
 <CustomButton
 type="button"
 text="قبول"
 size="md"
 radius="md"
 color="primary"
 onClick={() =>
 dispatch(updateReviewStatus({ id: review.id, status:"Approved" }))
 }
 />
 </div>
 )}
 {review.status !=="Rejected" && (
 <div className="w-6/12 px-4">
 <CustomButton
 type="button"
 text="رفض"
 size="md"
 radius="md"
 color="danger"
 onClick={() =>
 dispatch(updateReviewStatus({ id: review.id, status:"Rejected" }))
 }
 />
 </div>
 )}
 {review.status ==="Approved" && (
 <div className="w-full px-4">
 <span className="text-[var(--success-color)] text-sm font-medium">تم القبول</span>
 </div>
 )}
 {review.status ==="Rejected" && (
 <div className="w-full px-4">
 <span className="text-[var(--danger-color)] text-sm font-medium">تم الرفض</span>
 </div>
 )}
 </div>
 </div>
 </CustomCard>
 </div>
 );
};

export default ReviewCard;
