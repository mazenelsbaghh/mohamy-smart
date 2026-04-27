import { CustomInput, Container } from'@mohamy/shared-ui';
import { useEffect } from"react";
import { useParams, useNavigate } from"react-router-dom";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import HeadTitle from"../../components/public/headTitle/HeadTitle";
import SubTitle from"../../components/public/subTitle/SubTitle";
import { Spinner, Button } from"@heroui/react";
import fetchSubscriptionDetail from"../../redux/subscriptions/thunk/fetchSubscriptionDetail";

const SubscriptionDetails = () => {
 const { id } = useParams();
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const { selectedDetail: detail, isLoadingDetail, error } = useAppSelector(
 (state) => state.subscriptions
 );

 useEffect(() => {
 if (id) {
 dispatch(fetchSubscriptionDetail(id));
 }
 }, [dispatch, id]);

 if (isLoadingDetail) {
 return (
 <section>
 <Container>
 <HeadTitle title="إدارة الاشتراكات" />
 <SubTitle title="تفاصيل الاشتراك" />
 <div className="flex justify-center items-center min-h-[50vh]">
 <Spinner size="lg" color="primary" />
 </div>
 </Container>
 </section>
 );
 }

 if (error || !detail) {
 return (
 <section>
 <Container>
 <HeadTitle title="إدارة الاشتراكات" />
 <SubTitle title="تفاصيل الاشتراك" />
 <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
 <p className="text-lg app-text-subtle">
 {error ||"الاشتراك غير موجود"}
 </p>
 <Button
 color="primary"
 variant="flat"
 onPress={() => navigate("/subscriptions/subscription-reports")}
 >
 العودة لتقارير الاشتراكات
 </Button>
 </div>
 </Container>
 </section>
 );
 }

 return (
 <section>
 <Container>
 <HeadTitle title="إدارة الاشتراكات" />
 <SubTitle title="تفاصيل الاشتراك" />
 <div className="flex flex-wrap">
 <div className="w-full p-4">
 <CustomInput
 type="text"
 label="الاسم"
 value={detail.lawyerName ||"--"}
 readOnly
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type="text"
 label="نوع الخطة"
 value={detail.planName ||"--"}
 readOnly
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type="text"
 label="طريقه الدفع"
 value={detail.paymentMethod ||"--"}
 readOnly
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type="text"
 label="تاريخ بدايه الخطة"
 value={detail.startDate ? new Date(detail.startDate).toLocaleDateString("ar-EG") :"--"}
 readOnly
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type="text"
 label="تاريخ نهايه الخطة"
 value={detail.endDate ? new Date(detail.endDate).toLocaleDateString("ar-EG") :"--"}
 readOnly
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type="text"
 label="المبلغ"
 value={detail.amount ? String(detail.amount) :"--"}
 readOnly
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type="text"
 label="حالة الحساب"
 value={detail.isActive ?"نشط" :"غير نشط"}
 readOnly
 />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput
 type="text"
 label="استخدام AI"
 value={`${detail.usedAiRequests} / ${detail.limit ||"غير محدود"}`}
 readOnly
 />
 </div>
 </div>
 </Container>
 </section>
 );
};

export default SubscriptionDetails;
