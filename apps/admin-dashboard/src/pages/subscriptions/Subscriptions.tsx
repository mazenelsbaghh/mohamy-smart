import { CustomButton, CustomCard, Container, CustomTable } from'@mohamy/shared-ui';
import { useEffect } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";

import HeadTitle from"../../components/public/headTitle/HeadTitle";
import StatsCards from"../../components/public/statsCards/StatsCards";
import { RiExchangeDollarLine } from"react-icons/ri";
import { IoMdCheckmarkCircleOutline } from"react-icons/io";
import { IoCloseCircleOutline } from"react-icons/io5";
import SubTitle from"../../components/public/subTitle/SubTitle";

import SubscriptionsChart from"../../components/charts/SubscriptionsChart";

import { Link } from"react-router-dom";
import { GoArrowLeft } from"react-icons/go";

import fetchSubscriptionsReport from"../../redux/reports/thunk/fetchSubscriptionsReport";
import api from"../../APIs/api";
import SkeletonStatsCards from"../../components/skeleton/SkeletonStatsCards";
import SkeletonTable from"../../components/skeleton/SkeletonTable";

const columns = [
 { key:"lawyerName", label:"اسم المستخدم" },
 { key:"planName", label:"الخطة" },
 { key:"endDate", label:"تاريخ الانتهاء" },
 { key:"isActive", label:"الحالة" },
];

const Subscriptions = () => {
 const dispatch = useAppDispatch();
 const { subscriptionsReport, isLoadingSubscriptionsReport } = useAppSelector(
 (state) => state.reports
 );
 const { records, isLoading: subscriptionsLoading } = useAppSelector(
 (state) => state.subscriptions
 );

 useEffect(() => {
 dispatch(fetchSubscriptionsReport({}));
 }, [dispatch]);

 const tableData = records.slice(0, 5).map((r) => ({
 key: r.lawyerId,
 lawyerName: r.lawyerName ||"-",
 planName: r.planName === 'الباقة التجريبية' || r.planName === 'Free Trial' ? (
    <div className="flex items-center gap-1.5 justify-start">
      <span>{r.planName}</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--main-color)]/10 text-[var(--main-color)] font-medium">تجريبية</span>
    </div>
  ) : r.planName ||"-",
 endDate: r.endDate ? new Date(r.endDate).toLocaleDateString("ar-EG") :"-",
 isActive: r.isActive ?"نشطة" :"منتهية",
 }));

 const handleDownloadReport = async () => {
 try {
 const res = await api.get("/admin/reports/subscriptions", {
 params: { pageNumber: 1, pageSize: 1000 },
 responseType:"blob",
 });
 const url = window.URL.createObjectURL(new Blob([res.data]));
 const link = document.createElement("a");
 link.href = url;
 link.setAttribute("download","subscriptions-report.xlsx");
 document.body.appendChild(link);
 link.click();
 link.remove();
 window.URL.revokeObjectURL(url);
  } catch {
		return;
	}
 };

  if (isLoadingSubscriptionsReport || subscriptionsLoading) {
  return (
  <section className="subscriptions">
  <Container>
  <HeadTitle title="إدارة الاشتراكات" />
  <SkeletonStatsCards />
  <div className="w-full mt-8">
  <SkeletonTable rows={5} cols={4} />
  </div>
  </Container>
  </section>
  );
  }

 return (
 <section className="subscriptions">
 <Container>
 <HeadTitle title="إدارة الاشتراكات" />
 <StatsCards
 card1={{
 icon: <RiExchangeDollarLine />,
 iconColor:"#8B5CF6",
 text:"إجمالي الاشتراكات",
 number: subscriptionsReport?.totalSubscriptions ?? 0,
 }}
 card2={{
 icon: <IoMdCheckmarkCircleOutline />,
 iconColor:"#34BF49",
 text:"الاشتراكات النشطة",
 number: subscriptionsReport?.totalActive ?? 0,
 }}
 card3={{
 icon: <IoCloseCircleOutline />,
 iconColor:"#06B6D4",
 text:"المنتهية الصلاحية",
 number: subscriptionsReport?.totalInactive ?? 0,
 }}
 />
 <SubTitle title="لوحة الأرباح"
 components={
 <div>
 <CustomButton
 type="button"
 text="تحميل التقرير"
 radius="full"
 size="md"
 color="default"
 onClick={handleDownloadReport}
 startContent={<img src="/images/icons-excel.png" alt="excel" />}
 />
 </div>
 }
 />
 <CustomCard>
 <div className="w-full h-[35vh]">
 <SubscriptionsChart />
 </div>
 </CustomCard>
 <div className="w-full mt-12">
 <SubTitle title="آخر الاشتراكات"
 components={
 <Link to="/subscriptions/subscription-reports" className="sub-title-link">
 التفاصيل
 <GoArrowLeft />
 </Link>
 }
 />
 <CustomTable data={tableData} columns={columns} />
 </div>
 </Container>
 </section>
 );
};

export default Subscriptions;
