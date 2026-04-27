import { Container, CustomTable } from'@mohamy/shared-ui';
import { useEffect, useRef } from"react";
import { Link } from"react-router-dom";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";

import HeadTitle from"../../components/public/headTitle/HeadTitle";
import StatsCards from"../../components/public/statsCards/StatsCards";
import SubTitle from"../../components/public/subTitle/SubTitle";

import { GoArrowLeft } from"react-icons/go";
import { FaUsers, FaUserCheck } from"react-icons/fa";
import { RiExchangeDollarLine } from"react-icons/ri";
import fetchLawyersReport from"../../redux/reports/thunk/fetchLawyersReport";
import fetchRevenueReport from"../../redux/reports/thunk/fetchRevenueReport";
import fetchLawyers from"../../redux/lawyers/thunk/fetchLawyers";
import SkeletonStatsCards from"../../components/skeleton/SkeletonStatsCards";
import SkeletonTable from"../../components/skeleton/SkeletonTable";
import"./Home.css";

const columns = [
  { key:"fullName", label:"الاسم" },
  { key:"lawFirmName", label:"المكتب" },
  { key:"specialization", label:"التخصص" },
  { key:"barNumber", label:"رقم النقابة" },
  { key:"numberOfCases", label:"عدد القضايا" },
  { key:"subscriptionPlanName", label:"الاشتراك" },
];

const Home = () => {
  const dispatch = useAppDispatch();
  const { lawyersReport, revenueReport, isLoadingLawyersReport, isLoadingRevenueReport } = useAppSelector(
  (state) => state.reports
  );
  const { list: lawyers, isLoading: lawyersLoading } = useAppSelector(
  (state) => state.lawyers
  );
  const lawyersList = Array.isArray(lawyers) ? lawyers : [];
  const lawyersListLengthRef = useRef(lawyersList.length);
  lawyersListLengthRef.current = lawyersList.length;
  const hasFetchedRef = useRef(false);

  useEffect(() => {
  if (hasFetchedRef.current) return;
  hasFetchedRef.current = true;
  if (!lawyersReport) dispatch(fetchLawyersReport());
  if (!revenueReport) dispatch(fetchRevenueReport("Weekly"));
  if (lawyersListLengthRef.current === 0) dispatch(fetchLawyers({ pageNumber: 1, pageSize: 5 }));
  }, [dispatch, lawyersReport, revenueReport]);

 const tableData = lawyersList.map((l) => ({
 key: l.id,
 fullName: l.fullName ||"-",
 lawFirmName: l.lawFirmName ||"-",
 specialization: l.specialization ||"-",
 barNumber: l.barNumber ||"-",
 numberOfCases: l.numberOfCases,
 subscriptionPlanName: l.subscriptionPlanName ||"-",
 }));

  if ((isLoadingLawyersReport || isLoadingRevenueReport) || lawyersLoading) {
  return (
  <section className="home">
  <Container>
  <HeadTitle title="الصفحة الرئيسية" />
  <SkeletonStatsCards />
  <div className="w-full mt-5">
  <SkeletonTable rows={5} cols={6} />
  </div>
  </Container>
  </section>
  );
  }

 return (
 <section className="home">
 <Container>
 <HeadTitle title="الصفحة الرئيسية" />
 <StatsCards
 card1={{
 icon: <FaUsers />,
 iconColor:"var(--main-color)",
 text:"إجمالي المحامين",
 number: lawyersReport?.totalLawyers ?? 0,
 }}
 card2={{
 icon: <FaUserCheck />,
 iconColor:"#34BF49",
 text:"المحامين النشطين",
 number: lawyersReport?.totalActive ?? 0,
 }}
 card3={{
 icon: <RiExchangeDollarLine />,
 iconColor:"#06B6D4",
 text:"إجمالي الإيرادات",
 number: revenueReport?.totalRevenue != null ? revenueReport.totalRevenue.toFixed(2) :"0.00",
 }}
 />

 <div className="w-full mt-5">
 <SubTitle
 title="إدارة المحامين :"
 components={
 <Link to="/lawyers" className="sub-title-link">
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

export default Home;
