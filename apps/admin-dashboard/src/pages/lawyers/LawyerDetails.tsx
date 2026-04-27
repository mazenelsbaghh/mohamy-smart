import { CustomInput, Container } from'@mohamy/shared-ui';
import { useEffect } from"react";
import { useParams, useNavigate } from"react-router-dom";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";

import HeadTitle from"../../components/public/headTitle/HeadTitle";
import { Avatar, Spinner, Button } from"@heroui/react";

import fetchLawyerById from"../../redux/lawyers/thunk/fetchLawyerById";

const LawyerDetails = () => {
 const { id } = useParams();
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const { selectedLawyer: lawyer, isLoadingDetail, error } = useAppSelector(
 (state) => state.lawyers
 );

 useEffect(() => {
 if (id) {
 dispatch(fetchLawyerById(id));
 }
 }, [dispatch, id]);

 if (isLoadingDetail) {
 return (
 <section className="lawyer-details">
 <Container>
 <HeadTitle title="تفاصيل المحامي" />
 <div className="flex justify-center items-center min-h-[50vh]">
 <Spinner size="lg" color="primary" />
 </div>
 </Container>
 </section>
 );
 }

 if (error || !lawyer) {
 return (
 <section className="lawyer-details">
 <Container>
 <HeadTitle title="تفاصيل المحامي" />
 <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
 <p className="text-lg app-text-subtle">
 {error ||"المحامي غير موجود"}
 </p>
 <Button
 color="primary"
 variant="flat"
 onPress={() => navigate("/lawyers")}
 >
 العودة لقائمة المحامين
 </Button>
 </div>
 </Container>
 </section>
 );
 }

 return (
 <section className="lawyer-details">
 <Container>
 <HeadTitle title="تفاصيل المحامي" />
 <div className="flex flex-wrap">
 <div className="w-full md:w-2/12 mb-5 flex justify-center">
 <Avatar
 className="w-30 h-30 text-large"
 name={lawyer.fullName ||''}
 isBordered
 />
 </div>
 <div className="w-full md:w-10/12 mb-5">
 <form className="flex flex-wrap">
 <div className="w-full md:w-6/12 p-4">
 <CustomInput type="text" label="الاسم الكامل" value={lawyer.fullName ||"--"} readOnly />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput type="text" label="رقم الهاتف" value={lawyer.phoneNumber ||"--"} readOnly />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput type="email" label="البريد الإلكتروني" value={lawyer.email ||"--"} readOnly />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput type="text" label="اسم المكتب" value={lawyer.lawFirmName ||"--"} readOnly />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput type="text" label="نوع الاشتراك" value={lawyer.subscriptionPlanName ||"--"} readOnly />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput type="text" label="رقم القيد بالنقابة" value={lawyer.barNumber ||"--"} readOnly />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput type="text" label="سنوات الخبرة" value={lawyer.experienceNumber ||"--"} readOnly />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput type="text" label="التخصص القانوني" value={lawyer.specialization ||"--"} readOnly />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput type="text" label="حالة الحساب" value={lawyer.isActive ?"نشط" :"موقوف"} readOnly />
 </div>
 <div className="w-full md:w-6/12 p-4">
 <CustomInput type="text" label="عدد القضايا" value={String(lawyer.numberOfCases)} readOnly />
 </div>
 </form>
 </div>
 </div>
 </Container>
 </section>
 );
};

export default LawyerDetails;
