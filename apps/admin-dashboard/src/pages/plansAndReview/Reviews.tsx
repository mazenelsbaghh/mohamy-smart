import { Container } from'@mohamy/shared-ui';
import { useEffect } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import ReviewCard from"../../components/pagesComponents/plansAndReview/ReviewCard";
import HeadTitle from"../../components/public/headTitle/HeadTitle";
import { Spinner } from"@heroui/react";
import fetchReviews from"../../redux/reviews/thunk/fetchReviews";

const Reviews = () => {
 const dispatch = useAppDispatch();
 const { list: reviews, isLoading, error } = useAppSelector(
 (state) => state.reviews
 );

 useEffect(() => {
 dispatch(fetchReviews(undefined));
 }, [dispatch]);

 if (isLoading) {
 return (
 <section className="reviews">
 <Container>
 <HeadTitle title="إدارة آراء عملاء" />
 <div className="flex justify-center items-center min-h-[50vh]">
 <Spinner size="lg" color="primary" />
 </div>
 </Container>
 </section>
 );
 }

 if (error) {
 return (
 <section className="reviews">
 <Container>
 <HeadTitle title="إدارة آراء عملاء" />
 <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
 <p className="text-lg app-text-subtle">{error}</p>
 <button
 className="text-primary underline"
 onClick={() => dispatch(fetchReviews(undefined))}
 >
 إعادة المحاولة
 </button>
 </div>
 </Container>
 </section>
 );
 }

 if (reviews.length === 0) {
 return (
 <section className="reviews">
 <Container>
 <HeadTitle title="إدارة آراء عملاء" />
 <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
 <p className="text-lg app-text-subtle">لا توجد تقييمات حتى الآن</p>
 <p className="text-sm app-text-subtle">ستظهر التقييمات هنا عندما يرسل العملاء آراءهم</p>
 </div>
 </Container>
 </section>
 );
 }

 return (
 <section className="reviews">
 <Container>
 <HeadTitle title="إدارة آراء عملاء" />
 <div className="flex flex-wrap">
 {reviews.map((review) => (
 <div key={review.id} className="w-full md:w-6/12 lg:w-4/12 p-4">
 <ReviewCard review={review} />
 </div>
 ))}
 </div>
 </Container>
 </section>
 );
};

export default Reviews;
