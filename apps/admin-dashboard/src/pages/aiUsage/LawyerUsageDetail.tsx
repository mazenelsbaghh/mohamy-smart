import { Container, CustomTable } from'@mohamy/shared-ui';
import { useEffect, useState } from"react";
import { useParams, useNavigate } from"react-router-dom";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";

import HeadTitle from"../../components/public/headTitle/HeadTitle";
import StatsCard from"../../components/public/statsCards/StatsCard";
import SubTitle from"../../components/public/subTitle/SubTitle";

import { Spinner } from"@heroui/react";
import { FaDollarSign, FaRobot, FaFileAlt, FaChartBar } from"react-icons/fa";
import { GoArrowRight } from"react-icons/go";
import { IoChevronDownOutline } from"react-icons/io5";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from"recharts";
import fetchLawyerUsageDetail from"../../redux/aiUsage/thunk/fetchLawyerUsageDetail";
import { clearLawyerDetail } from"../../redux/aiUsage/aiUsageSlice";
import"./AiUsage.css";

const fmtCost = (v: number) => `$${v.toFixed(4)}`;
const fmtDate = (d: string) => d?.split("T")[0] ??"-";
const getWorkflowCopyLabel = (workflow: { workflowId?: number | null; workflowRunId?: string | null; isLegacyAggregate?: boolean }) => {
 if (workflow.isLegacyAggregate || !workflow.workflowRunId) return "إجمالي قديم";
 return workflow.workflowId ? `نسخة #${workflow.workflowId}` : `نسخة ${workflow.workflowRunId.slice(0, 8)}`;
};

const dailyColumns = [
 { key:"date", label:"التاريخ" },
 { key:"aiCost", label:"تكلفة AI" },
 { key:"ocrCost", label:"تكلفة OCR" },
 { key:"requests", label:"الطلبات" },
];

const modelColumns = [
 { key:"displayName", label:"النموذج" },
 { key:"requestCount", label:"عدد الطلبات" },
 { key:"totalCostUsd", label:"التكلفة ($)" },
];

const LawyerUsageDetail = () => {
 const { id } = useParams<{ id: string }>();
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
 const [expandedWorkflowKey, setExpandedWorkflowKey] = useState<string | null>(null);
 const { lawyerDetail, isLoadingLawyerDetail, dateFrom, dateTo } = useAppSelector(
 (state) => state.aiUsage
 );

 useEffect(() => {
 if (id) {
 dispatch(fetchLawyerUsageDetail({
 lawyerId: id,
 from: dateFrom || undefined,
 to: dateTo || undefined,
 }));
 }
 return () => {
 dispatch(clearLawyerDetail());
 };
 }, [dispatch, id, dateFrom, dateTo]);

 if (isLoadingLawyerDetail || !lawyerDetail) {
 return (
 <section className="ai-usage">
 <Container>
 <HeadTitle title="تفاصيل استخدام المحامي" />
 <div className="flex justify-center items-center min-h-[50vh]">
 <Spinner size="lg" color="primary" />
 </div>
 </Container>
 </section>
 );
 }

 const dailyTableData = (lawyerDetail.dailyCosts || []).map((d, idx) => ({
 key: String(d.date || idx),
 date: fmtDate(d.date),
 aiCost: fmtCost(d.aiCost),
 ocrCost: fmtCost(d.ocrCost),
 requests: d.requests,
 }));

 const modelTableData = (lawyerDetail.perModel || []).map((m, idx) => ({
 key: String(m.modelIdentifier || idx),
 displayName: m.displayName || m.modelIdentifier,
 requestCount: m.requestCount,
 totalCostUsd: fmtCost(m.totalCostUsd),
 }));

 return (
 <section className="ai-usage">
 <Container>
 <div className="flex items-center gap-4 mb-5">
 <button
 className="back-btn"
 onClick={() => navigate("/ai-usage")}
 >
 <GoArrowRight />
 </button>
 <HeadTitle title={`تفاصيل: ${lawyerDetail.lawyerName}`} />
 </div>

 <div className="stats-grid">
 <div className="stats-grid-item">
 <StatsCard
 icon={<FaDollarSign />}
 iconColor="var(--main-color)"
 text="إجمالي التكلفة"
 number={lawyerDetail.totalCostUsd}
 />
 </div>
 <div className="stats-grid-item">
 <StatsCard
 icon={<FaRobot />}
 iconColor="#34BF49"
 text="تكلفة AI"
 number={lawyerDetail.aiCostUsd}
 />
 </div>
 <div className="stats-grid-item">
 <StatsCard
 icon={<FaFileAlt />}
 iconColor="#06B6D4"
 text="تكلفة OCR"
 number={lawyerDetail.ocrCostUsd}
 />
 </div>
 <div className="stats-grid-item">
 <StatsCard
 icon={<FaChartBar />}
 iconColor="#F59E0B"
 text="إجمالي الطلبات"
 number={lawyerDetail.totalRequests}
 />
 </div>
 </div>

 <div className="w-full mt-5">
 <SubTitle title="اتجاه التكاليف اليومية :" />
 {dailyTableData.length > 0 ? (
 <div className="daily-chart-container">
 <ResponsiveContainer width="100%" height="100%" minWidth={0}>
 <LineChart data={lawyerDetail.dailyCosts || []}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={fmtDate} />
 <YAxis tick={{ fontSize: 12 }} />
 <Tooltip formatter={(value: number) => `$${value.toFixed(4)}`} />
 <Legend />
 <Line type="monotone" dataKey="aiCost" name="AI" stroke="#34BF49" strokeWidth={2} dot={false} />
 <Line type="monotone" dataKey="ocrCost" name="OCR" stroke="#06B6D4" strokeWidth={2} dot={false} />
 </LineChart>
 </ResponsiveContainer>
 </div>
 ) : (
 <div className="empty-state">لا توجد بيانات يومية</div>
 )}
 </div>

 <div className="w-full mt-5">
 <SubTitle title="تفصيل التكاليف اليومية :" />
 {dailyTableData.length > 0 ? (
 <CustomTable data={dailyTableData} columns={dailyColumns} />
 ) : (
 <div className="empty-state">لا توجد بيانات يومية</div>
 )}
 </div>

 <div className="w-full mt-5">
 <SubTitle title="تفصيل القضايا والمسارات :" />
 {(lawyerDetail.perCaseWorkflows || []).length > 0 ? (
 <div className="flex flex-col gap-3">
 {(lawyerDetail.perCaseWorkflows || []).map((caseWorkflow) => {
 const isCaseExpanded = expandedCaseId === caseWorkflow.caseId;
 return (
 <div key={caseWorkflow.caseId} className="ai-usage-panel">
 <button
 type="button"
 className="w-full flex items-center justify-between gap-4 text-end"
 onClick={() => {
 setExpandedCaseId(isCaseExpanded ? null : caseWorkflow.caseId);
 setExpandedWorkflowKey(null);
 }}
 >
 <div className="flex flex-col items-start">
 <span className="font-bold text-[var(--title-color)]">{caseWorkflow.caseTitle ||"قضية بدون عنوان"}</span>
 <span className="text-xs app-text-subtle">{caseWorkflow.caseNumber ? `رقم القضية: ${caseWorkflow.caseNumber}` :"بدون رقم قضية"}</span>
 </div>
 <div className="flex items-center gap-6">
 <div className="text-sm app-text-muted">{caseWorkflow.usedWorkflowCount} / {caseWorkflow.totalWorkflowCount} مسارات</div>
 <div className="text-sm font-semibold text-[var(--title-color)]">{fmtCost(caseWorkflow.totalCostUsd)}</div>
 <IoChevronDownOutline className={`transition-transform ${isCaseExpanded ?"rotate-180" :""}`} />
 </div>
 </button>

 {isCaseExpanded && (
 <div className="mt-4 pt-4 border-t app-border flex flex-col gap-3">
 {caseWorkflow.workflows.map((workflow) => {
 const workflowId = `${caseWorkflow.caseId}-${workflow.workflowKey}`;
 const isWorkflowExpanded = expandedWorkflowKey === workflowId;
 return (
 <div key={workflowId} className="rounded-2xl border app-border bg-[#FCFCFD] p-4">
 <button
 type="button"
 className="w-full flex items-center justify-between gap-3 text-end"
 onClick={() => setExpandedWorkflowKey(isWorkflowExpanded ? null : workflowId)}
 >
 <div className="flex flex-col items-start">
	 <div className="flex items-center gap-2">
	 <span className="font-semibold text-[var(--title-color)]">{workflow.workflowName}</span>
	 <span className={`ai-usage-copy-badge ${workflow.isLegacyAggregate ?"legacy" :""}`}>{getWorkflowCopyLabel(workflow)}</span>
	 </div>
	 <span className="text-xs app-text-subtle">{workflow.requestCount} طلب</span>
 </div>
 <div className="flex items-center gap-4">
 <span className="font-semibold">{fmtCost(workflow.totalCostUsd)}</span>
 <IoChevronDownOutline className={`transition-transform ${isWorkflowExpanded ?"rotate-180" :""}`} />
 </div>
 </button>

 {isWorkflowExpanded && (
 <div className="mt-3">
 <CustomTable
 columns={[
 { key:"stepName", label:"الخطوة" },
 { key:"model", label:"النموذج" },
 { key:"requests", label:"عدد الطلبات" },
 { key:"cost", label:"التكلفة" },
 ]}
 data={workflow.steps.map(step => ({
 key: `${workflowId}-${step.stepType}`,
 stepName: step.stepName,
 model: step.modelDisplayName ||"-",
 requests: step.requestCount,
 cost: <span className="font-medium">{fmtCost(step.totalCostUsd)}</span>
 }))}
 />
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
 })}
 </div>
 ) : (
 <div className="empty-state">لا توجد بيانات للقضايا أو المسارات</div>
 )}
 </div>

 {/* ─── Standalone workflows (e.g., Contract Generation) ─── */}
 {(lawyerDetail.standaloneCosts || []).length > 0 && (
 <div className="w-full mt-5">
 <SubTitle title="مسارات مستقلة (العقود وغيرها) :" />
 <div className="flex flex-col gap-3">
 {(lawyerDetail.standaloneCosts || []).map((workflow) => {
 const workflowId = `standalone-${workflow.workflowKey}`;
 const isExpanded = expandedWorkflowKey === workflowId;
 return (
 <div key={workflowId} className="ai-usage-panel">
 <button
 type="button"
 className="w-full flex items-center justify-between gap-3 text-end"
 onClick={() => setExpandedWorkflowKey(isExpanded ? null : workflowId)}
 >
 <div className="flex flex-col items-start">
	 <div className="flex items-center gap-2">
	 <span className="font-bold text-[var(--title-color)]">{workflow.workflowName}</span>
	 <span className={`ai-usage-copy-badge ${workflow.isLegacyAggregate ?"legacy" :""}`}>{getWorkflowCopyLabel(workflow)}</span>
	 </div>
	 <span className="text-xs app-text-subtle">{workflow.requestCount} طلب</span>
 </div>
 <div className="flex items-center gap-4">
 <span className="font-semibold">{fmtCost(workflow.totalCostUsd)}</span>
 <IoChevronDownOutline className={`transition-transform ${isExpanded ?"rotate-180" :""}`} />
 </div>
 </button>

 {isExpanded && (
 <div className="mt-3">
 <CustomTable
 columns={[
 { key:"stepName", label:"الخطوة" },
 { key:"model", label:"النموذج" },
 { key:"requests", label:"عدد الطلبات" },
 { key:"cost", label:"التكلفة" },
 ]}
 data={workflow.steps.map(step => ({
 key: `${workflowId}-${step.stepType}`,
 stepName: step.stepName,
 model: step.modelDisplayName ||"-",
 requests: step.requestCount,
 cost: <span className="font-medium">{fmtCost(step.totalCostUsd)}</span>
 }))}
 />
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 )}

 <div className="w-full mt-5">
 <SubTitle title="تفصيل النماذج :" />
 {modelTableData.length > 0 ? (
 <CustomTable data={modelTableData} columns={modelColumns} />
 ) : (
 <div className="empty-state">لا توجد بيانات للنماذج</div>
 )}
 </div>
 </Container>
 </section>
 );
};

export default LawyerUsageDetail;
