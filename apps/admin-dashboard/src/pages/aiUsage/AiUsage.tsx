import { CustomButton, Container, CustomTable } from'@mohamy/shared-ui';
import { useEffect, useState } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import { useNavigate } from"react-router-dom";
import type { ReactNode } from"react";

import HeadTitle from"../../components/public/headTitle/HeadTitle";
import StatsCard from"../../components/public/statsCards/StatsCard";
import SubTitle from"../../components/public/subTitle/SubTitle";

import { Spinner } from"@heroui/react";
import { FaDollarSign, FaRobot, FaFileAlt, FaChartBar, FaCoins } from"react-icons/fa";
import { setDateRange } from"../../redux/aiUsage/aiUsageSlice";
import { Input } from"@heroui/react";

import fetchAiUsageSummary from"../../redux/aiUsage/thunk/fetchAiUsageSummary";
import fetchModelUsage from"../../redux/aiUsage/thunk/fetchModelUsage";
import fetchLawyerUsage from"../../redux/aiUsage/thunk/fetchLawyerUsage";
import"./AiUsage.css";
import AdminFilterToolbar from"../../components/adminFilters/AdminFilterToolbar";
import { recordMatchesAdminSearch } from"../../components/adminFilters/adminFilterUtils";

const lawyerColumns = [
 { key:"lawyerName", label:"الاسم" },
 { key:"aiCostUsd", label:"تكلفة AI" },
 { key:"ocrCostUsd", label:"تكلفة OCR" },
 { key:"totalCostUsd", label:"الإجمالي" },
 { key:"totalRequests", label:"الطلبات" },
];

const modelColumns = [
 { key:"displayName", label:"النموذج" },
 { key:"requestCount", label:"عدد الطلبات" },
 { key:"totalCostUsd", label:"التكلفة ($)" },
];

const formatCost = (value: number) => `$${value.toFixed(4)}`;

const AiUsage = () => {
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const { summary, lawyers, modelUsage, dateFrom, dateTo } = useAppSelector(
 (state) => state.aiUsage
 );
 const [localFrom, setLocalFrom] = useState(dateFrom ||"");
 const [localTo, setLocalTo] = useState(dateTo ||"");
 const [initialLoad, setInitialLoad] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");

 useEffect(() => {
 dispatch(fetchAiUsageSummary({ from: dateFrom || undefined, to: dateTo || undefined }));
 dispatch(fetchModelUsage({ from: dateFrom || undefined, to: dateTo || undefined }));
 dispatch(fetchLawyerUsage({ page: 1, pageSize: 50, from: dateFrom || undefined, to: dateTo || undefined }));
 setInitialLoad(false);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleFilter = () => {
 dispatch(setDateRange({ from: localFrom || null, to: localTo || null }));
 dispatch(fetchAiUsageSummary({ from: localFrom || undefined, to: localTo || undefined }));
 dispatch(fetchModelUsage({ from: localFrom || undefined, to: localTo || undefined }));
 dispatch(fetchLawyerUsage({ page: 1, pageSize: 50, from: localFrom || undefined, to: localTo || undefined }));
 };

 const filteredLawyers = lawyers.filter((l) =>
 recordMatchesAdminSearch(searchQuery, [
 l.lawyerName,
 l.aiCostUsd,
 l.ocrCostUsd,
 l.totalCostUsd,
 l.totalRequests,
 ])
 );

 const filteredModelUsage = modelUsage.filter((m) =>
 recordMatchesAdminSearch(searchQuery, [
 m.displayName,
 m.modelIdentifier,
 m.requestCount,
 m.totalCostUsd,
 ])
 );

 const lawyerTableData = filteredLawyers.map((l) => ({
 key: String(l.lawyerId),
 lawyerName: (
 <span
 className="cursor-pointer text-[var(--blue-color)] hover:underline"
 onClick={() => navigate(`/ai-usage/${l.lawyerId}`)}
 >
 {l.lawyerName ||"غير معروف"}
 </span>
 ) as ReactNode,
 aiCostUsd: formatCost(l.aiCostUsd),
 ocrCostUsd: formatCost(l.ocrCostUsd),
 totalCostUsd: formatCost(l.totalCostUsd),
 totalRequests: l.totalRequests,
 }));

 const modelTableData = filteredModelUsage.map((m, idx) => ({
 key: String(m.modelIdentifier || idx),
 displayName: m.displayName || m.modelIdentifier,
 requestCount: m.requestCount,
 totalCostUsd: formatCost(m.totalCostUsd),
 }));
 const totalBreakdownRows = lawyers.length + modelUsage.length;
 const filteredBreakdownRows = filteredLawyers.length + filteredModelUsage.length;
 const isFiltering = Boolean(searchQuery.trim());

 if (initialLoad && !summary) {
 return (
 <section className="ai-usage">
 <Container>
 <HeadTitle title="تكاليف الذكاء الاصطناعي" />
 <div className="flex justify-center items-center min-h-[50vh]">
 <Spinner size="lg" color="primary" />
 </div>

 <AdminFilterToolbar
 searchValue={searchQuery}
 onSearchChange={setSearchQuery}
 searchPlaceholder="ابحث باسم المحامي أو النموذج..."
 totalCount={totalBreakdownRows}
 filteredCount={filteredBreakdownRows}
 isFiltering={isFiltering}
 onReset={() => setSearchQuery("")}
 />
 </Container>
 </section>
 );
 }

 return (
 <section className="ai-usage">
 <Container>
 <HeadTitle title="تكاليف الذكاء الاصطناعي" />

 <div className="flex flex-wrap items-end gap-3 mb-6 p-4 rounded-xl border app-border app-surface-soft shadow-sm">
 <div className="flex-1 min-w-[200px]">
 <Input
 type="date"
 label="من تاريخ"
 labelPlacement="outside"
 value={localFrom}
 onValueChange={setLocalFrom}
 variant="bordered"
 />
 </div>
 <div className="flex-1 min-w-[200px]">
 <Input
 type="date"
 label="إلى تاريخ"
 labelPlacement="outside"
 value={localTo}
 onValueChange={setLocalTo}
 variant="bordered"
 />
 </div>
 <div className="flex-shrink-0">
 <CustomButton
 type="button"
 text="تطبيق الفلتر"
 onClick={handleFilter}
 color="primary"
 radius="md"
 size="md"
 />
 </div>
 </div>

 <div className="stats-grid">
 <div className="stats-grid-item">
 <StatsCard
 icon={<FaDollarSign />}
 iconColor="var(--main-color)"
 text="إجمالي التكلفة"
 number={summary?.totalCostUsd ?? 0}
 />
 </div>
 <div className="stats-grid-item">
 <StatsCard
 icon={<FaRobot />}
 iconColor="#34BF49"
 text="تكلفة AI"
 number={summary?.aiCostUsd ?? 0}
 />
 </div>
 <div className="stats-grid-item">
 <StatsCard
 icon={<FaFileAlt />}
 iconColor="#06B6D4"
 text="تكلفة OCR"
 number={summary?.ocrCostUsd ?? 0}
 />
 </div>
 <div className="stats-grid-item">
 <StatsCard
 icon={<FaChartBar />}
 iconColor="#F59E0B"
 text="إجمالي الطلبات"
 number={summary?.totalRequests ?? 0}
 />
 </div>
 <div className="stats-grid-item">
 <StatsCard
 icon={<FaCoins />}
 iconColor="#8B5CF6"
 text="النقاط المخصومة"
 number={summary?.chargedPoints ?? 0}
 />
 </div>
 <div className="stats-grid-item">
 <StatsCard
 icon={<FaCoins />}
 iconColor="#06B6D4"
 text="محاولات بدون خصم"
 number={summary?.noChargePointTransactions ?? 0}
 />
 </div>
 </div>

 <div className="ai-usage-table-section">
 <SubTitle title="تفصيل النماذج :" />
 {modelTableData.length > 0 ? (
 <div className="ai-usage-panel">
 <CustomTable data={modelTableData} columns={modelColumns} />
 </div>
 ) : (
 <div className="ai-usage-panel empty-state">لا توجد بيانات للنماذج</div>
 )}
 </div>

 <div className="ai-usage-table-section">
 <SubTitle title="تكاليف المحامين :" />
 {lawyerTableData.length > 0 ? (
 <div className="ai-usage-panel">
 <CustomTable data={lawyerTableData} columns={lawyerColumns} />
 </div>
 ) : (
 <div className="ai-usage-panel empty-state">لا توجد بيانات للمحامين</div>
 )}
 </div>
 </Container>
 </section>
 );
};

export default AiUsage;
