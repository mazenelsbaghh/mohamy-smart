import { Container } from'@mohamy/shared-ui';
import { useEffect, useState } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import ReviewCard from"../../components/pagesComponents/plansAndReview/ReviewCard";
import HeadTitle from"../../components/public/headTitle/HeadTitle";
import { Spinner } from"@heroui/react";
import fetchReviews from"../../redux/reviews/thunk/fetchReviews";
import AdminFilterToolbar from"../../components/adminFilters/AdminFilterToolbar";
import { recordMatchesAdminSearch } from"../../components/adminFilters/adminFilterUtils";

const Reviews = () => {
 const dispatch = useAppDispatch();
 const { list: reviews, isLoading, error } = useAppSelector(
 (state) => state.reviews
 );
 const [searchQuery, setSearchQuery] = useState("");
 const [statusFilter, setStatusFilter] = useState("");

 useEffect(() => {
 dispatch(fetchReviews(undefined));
 }, [dispatch]);

 const filteredReviews = reviews.filter((review) => {
 const matchesStatus = statusFilter ? review.status === statusFilter : true;
 const matchesSearch = recordMatchesAdminSearch(searchQuery, [
 review.reviewerName,
 review.reviewerRole,
 review.lawyerName,
 review.comment,
 review.rating,
 review.status ==="Approved" ?"تم القبول" : review.status ==="Rejected" ?"تم الرفض" : review.status,
 ]);
 return matchesStatus && matchesSearch;
 });

 const isFiltering = Boolean(searchQuery.trim() || statusFilter);

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
 <AdminFilterToolbar
 searchValue={searchQuery}
 onSearchChange={setSearchQuery}
 searchPlaceholder="ابحث بالمراجع، المحامي، التعليق..."
 totalCount={reviews.length}
 filteredCount={filteredReviews.length}
 isFiltering={isFiltering}
 onReset={() => {
 setSearchQuery("");
 setStatusFilter("");
 }}
 filters={[
 {
 key:"status",
 label:"الحالة",
 value: statusFilter,
 onChange: setStatusFilter,
 options: [
 { value:"", label:"الكل" },
 { value:"Approved", label:"مقبولة" },
 { value:"Rejected", label:"مرفوضة" },
 { value:"Pending", label:"قيد المراجعة" },
 ],
 },
 ]}
 />
 {filteredReviews.length === 0 ? (
 <div className="flex flex-col items-center justify-center min-h-[30vh] gap-2">
 <p className="text-lg app-text-subtle">لا توجد تقييمات مطابقة للفلاتر الحالية</p>
 </div>
 ) : (
 <div className="flex flex-wrap">
 {filteredReviews.map((review) => (
 <div key={review.id} className="w-full md:w-6/12 lg:w-4/12 p-4">
 <ReviewCard review={review} />
 </div>
 ))}
 </div>
 )}
 </Container>
 </section>
 );
};

export default Reviews;
