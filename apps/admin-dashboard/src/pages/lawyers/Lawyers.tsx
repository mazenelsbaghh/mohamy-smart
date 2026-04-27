import { Container } from'@mohamy/shared-ui';
import { useEffect, useState } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import HeadTitle from"../../components/public/headTitle/HeadTitle";
import StatsCards from"../../components/public/statsCards/StatsCards";

import SubTitle from"../../components/public/subTitle/SubTitle";
import ServerPaginationTable from"../../components/ui/table/ServerPaginationTable";
import { FaUsers, FaUserCheck } from"react-icons/fa";
import fetchLawyers from"../../redux/lawyers/thunk/fetchLawyers";
import updateLawyerStatus from"../../redux/lawyers/thunk/updateLawyerStatus";
import fetchLawyersReport from"../../redux/reports/thunk/fetchLawyersReport";
import SkeletonStatsCards from"../../components/skeleton/SkeletonStatsCards";
import SkeletonTable from"../../components/skeleton/SkeletonTable";

const columns = [
 { key:"fullName", label:"الاسم" },
 { key:"lawFirmName", label:"المكتب" },
 { key:"specialization", label:"التخصص" },
 { key:"barNumber", label:"رقم النقابة" },
 { key:"numberOfCases", label:"عدد القضايا" },
 { key:"subscriptionPlanName", label:"الاشتراك" },
 { key:"status", label:"الحالة" },
];

const Lawyers = () => {
 const dispatch = useAppDispatch();
 const [page, setPage] = useState(1);
 const { list, isLoading, totalPages } = useAppSelector(
 (state) => state.lawyers
 );
 const { lawyersReport } = useAppSelector(
 (state) => state.reports
 );
 const lawyersList = Array.isArray(list) ? list : [];

 useEffect(() => {
 dispatch(fetchLawyersReport());
 }, [dispatch]);

 useEffect(() => {
 dispatch(fetchLawyers({ pageNumber: page }));
 }, [dispatch, page]);

 const handleToggleStatus = (id: string, currentIsActive: boolean) => {
 dispatch(updateLawyerStatus({ id, isActive: !currentIsActive }));
 };

 const tableData = lawyersList.map((l) => ({
 key: l.id,
 fullName: l.fullName ||"-",
 lawFirmName: l.lawFirmName ||"-",
 specialization: l.specialization ||"-",
 barNumber: l.barNumber ||"-",
 numberOfCases: l.numberOfCases,
 subscriptionPlanName: l.subscriptionPlanName ||"-",
 status: (
 <span
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 handleToggleStatus(l.id, l.isActive);
 }}
 className={`cursor-pointer px-3 py-1 rounded-full text-sm ${
 l.isActive
 ?"bg-[var(--success-soft)] text-[var(--success-color)]"
 :"bg-[var(--danger-soft)] text-[var(--danger-color)]"
 }`}
 >
 {l.isActive ?"نشط" :"موقوف"}
 </span>
 ),
 }));

  if (isLoading && lawyersList.length === 0) {
  return (
  <section className="lawyers">
  <Container>
  <HeadTitle title="إدارة المحامين" />
  <SkeletonStatsCards />
  <div className="w-full">
  <SkeletonTable rows={7} cols={7} />
  </div>
  </Container>
  </section>
  );
  }

 return (
 <section className="lawyers">
 <Container>
 <HeadTitle title="إدارة المحامين" />

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
 icon: <FaUsers />,
 iconColor:"#06B6D4",
 text:"المحامين الموقوفين",
 number: lawyersReport?.totalInactive ?? 0,
 }}
 />

 <SubTitle title="تقارير تفصيلية :" />
 <div className="w-full">
 <ServerPaginationTable
 data={tableData}
 columns={columns}
 page={page}
 totalPages={totalPages}
 onPageChange={setPage}
 isLoading={isLoading}
 />
 </div>
 </Container>
 </section>
 );
};

export default Lawyers;
