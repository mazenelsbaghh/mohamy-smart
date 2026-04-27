import { Container } from'@mohamy/shared-ui';
import { useEffect } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import {
 fetchFinancialMetrics,
 fetchSubscriptionMetrics,
 fetchEngagementMetrics,
 fetchCohortMetrics,
} from"../../features/analytics/analyticsSlice";


import HeadTitle from"../../components/public/headTitle/HeadTitle";
import StatsCards from"../../components/public/statsCards/StatsCards";
import SubTitle from"../../components/public/subTitle/SubTitle";
import { Spinner } from"@heroui/react";

import { RiExchangeDollarLine } from"react-icons/ri";
import { FaChartLine } from"react-icons/fa";
import { MdTrendingDown } from"react-icons/md";

import SubscriptionLifecycle from"./components/SubscriptionLifecycle";
import UserEngagement from"./components/UserEngagement";
import CohortRetentionTable from"./components/CohortRetentionTable";

const AnalyticsDashboard = () => {
 const dispatch = useAppDispatch();
 const {
 financialMetrics,
 subscriptionMetrics,
 engagementMetrics,
 cohortMetrics,
 isLoading,
 } = useAppSelector((state) => state.analytics);

 useEffect(() => {
 dispatch(fetchFinancialMetrics());
 dispatch(fetchSubscriptionMetrics());
 dispatch(fetchEngagementMetrics());
 dispatch(fetchCohortMetrics());
 }, [dispatch]);

 // Handle both camelCase and PascalCase from API
 const fm = financialMetrics as Record<string, unknown> | null;
 const totalRevenue = fm?.totalRevenue ?? fm?.TotalRevenue ?? 0;
 const mrr = fm?.monthlyRecurringRevenue ?? fm?.MonthlyRecurringRevenue ?? 0;
 const totalRefunds = fm?.totalRefunds ?? fm?.TotalRefunds ?? 0;

 if (isLoading && !financialMetrics) {
 return (
 <section>
 <Container>
 <HeadTitle title="تحليل الأداء" />
 <div className="flex justify-center items-center min-h-[50vh]">
 <Spinner size="lg" color="primary" />
 </div>
 </Container>
 </section>
 );
 }

 return (
 <section>
 <Container>
 <HeadTitle title="تحليل الأداء" />

 <StatsCards
 card1={{
 icon: <RiExchangeDollarLine />,
 iconColor:"var(--main-color)",
 text:"إجمالي الإيرادات",
 number: `${Number(totalRevenue).toFixed(2)} ج.م`,
 }}
 card2={{
 icon: <FaChartLine />,
 iconColor:"#34BF49",
 text:"الإيرادات الشهرية (MRR)",
 number: `${Number(mrr).toFixed(2)} ج.م`,
 }}
 card3={{
 icon: <MdTrendingDown />,
 iconColor:"#EF4444",
 text:"المبالغ المسترجعة",
 number: `${Number(totalRefunds).toFixed(2)} ج.م`,
 }}
 />

 <div className="w-full mt-5">
 <SubTitle title="دورة حياة الاشتراكات :" />
 <SubscriptionLifecycle data={subscriptionMetrics} isLoading={isLoading} />
 </div>

 <div className="w-full mt-5">
 <SubTitle title="تفاعل المحامين :" />
 <UserEngagement data={engagementMetrics} isLoading={isLoading} />
 </div>

 <div className="w-full mt-5">
 <SubTitle title="تحليل المجموعات (Cohort) :" />
 <CohortRetentionTable data={cohortMetrics} isLoading={isLoading} />
 </div>
 </Container>
 </section>
 );
};

export default AnalyticsDashboard;
