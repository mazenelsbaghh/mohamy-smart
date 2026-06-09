import { Container } from '@mohamy/shared-ui';
import { useEffect, useState, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import HeadTitle from "../../components/public/headTitle/HeadTitle";
import StatsCards from "../../components/public/statsCards/StatsCards";
import { Button } from "@heroui/react";

import SubTitle from "../../components/public/subTitle/SubTitle";
import ServerPaginationTable from "../../components/ui/table/ServerPaginationTable";
import { FaUsers, FaUserCheck, FaCrown, FaUserClock } from "react-icons/fa";
import fetchLawyers from "../../redux/lawyers/thunk/fetchLawyers";
import updateLawyerStatus from "../../redux/lawyers/thunk/updateLawyerStatus";
import fetchLawyersReport from "../../redux/reports/thunk/fetchLawyersReport";
import fetchLawyerCasesStats, {
  type TLawyerCasesStats,
  type TPagedLawyerCasesStats,
} from "../../redux/reports/thunk/fetchLawyerCasesStats";
import api from "../../APIs/api";
import { sileo } from "sileo";
import SkeletonStatsCards from "../../components/skeleton/SkeletonStatsCards";
import SkeletonTable from "../../components/skeleton/SkeletonTable";
import AdminFilterToolbar from "../../components/adminFilters/AdminFilterToolbar";

const columns = [
  { key: "fullName", label: "الاسم" },
  { key: "lawFirmName", label: "المكتب" },
  { key: "specialization", label: "التخصص" },
  { key: "barNumber", label: "رقم النقابة" },
  { key: "numberOfCases", label: "عدد القضايا" },
  { key: "subscriptionPlanName", label: "الاشتراك" },
  { key: "status", label: "الحالة" },
  { key: "actions", label: "الإجراءات" },
];

const statsColumns = [
  { key: "fullName", label: "الاسم" },
  { key: "phoneNumber", label: "رقم الهاتف" },
  { key: "casesCount", label: "عدد القضايا" },
  { key: "completedStepsCount", label: "الخطوات المنفذة" },
  { key: "workflowVersionsCount", label: "عدد النسخ الاحتياطية" },
];

const REPORT_EXPORT_PAGE_SIZE = 100;

type LawyersTableRow = { key: string } & Record<string, ReactNode>;

const Lawyers = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"accounts" | "stats">("accounts");
  const [isExporting, setIsExporting] = useState(false);

  const { list, isLoading, totalPages, totalCount, isUpdatingStatus } = useAppSelector(
    (state) => state.lawyers
  );
  const { lawyersReport, lawyerCasesStats, isLoadingLawyerCasesStats } = useAppSelector(
    (state) => state.reports
  );
  
  const lawyersList = Array.isArray(list) ? list : [];
  const statsList = lawyerCasesStats?.items || [];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSubscriptionFilterChange = (value: string) => {
    setSubscriptionFilter(value);
    setPage(1);
  };

  const handleTabChange = (tab: "accounts" | "stats") => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery("");
  };

  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const requestParams = {
        pageSize: REPORT_EXPORT_PAGE_SIZE,
        search: searchQuery.trim() || undefined,
      };

      const firstPage = await api.get<{ data: TPagedLawyerCasesStats }>("/admin/reports/lawyers-cases-stats", {
        params: { ...requestParams, pageNumber: 1 },
      });

      const firstPageData = firstPage.data?.data;
      const stats: TLawyerCasesStats[] = [...(firstPageData?.items || [])];
      const totalPages = firstPageData?.totalPages || 1;

      for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
        const pageRes = await api.get<{ data: TPagedLawyerCasesStats }>("/admin/reports/lawyers-cases-stats", {
          params: { ...requestParams, pageNumber },
        });
        stats.push(...(pageRes.data?.data?.items || []));
      }

      if (stats.length === 0) {
        sileo.warning({ title: "لا توجد بيانات لتصديرها" });
        return;
      }

      const XLSX = await import('xlsx');
      const data = stats.map((item) => ({
        "الاسم": item.fullName || "-",
        "رقم الهاتف": item.phoneNumber || "-",
        "عدد القضايا": item.casesCount,
        "الخطوات المنفذة": item.completedStepsCount,
        "عدد النسخ الاحتياطية": item.workflowVersionsCount,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      ws['!dir'] = 'rtl'; // RTL support in Excel sheet

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "إحصائيات القضايا");
      XLSX.writeFile(wb, `تقرير_إحصائيات_القضايا_${new Date().toISOString().split('T')[0]}.xlsx`);
      sileo.success({ title: "تم تصدير الملف بنجاح" });
    } catch {
      sileo.error({ title: "تعذّر تصدير الملف. أعد المحاولة." });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    dispatch(fetchLawyersReport());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === "accounts") {
      const trimmedSearch = searchQuery.trim();
      dispatch(fetchLawyers({
        pageNumber: page,
        search: trimmedSearch || undefined,
        isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
        subscriptionIsActive: subscriptionFilter === "active" ? true : subscriptionFilter === "inactive" ? false : undefined,
      }));
    } else {
      dispatch(fetchLawyerCasesStats({
        pageNumber: page,
        pageSize: 50,
        search: searchQuery.trim() || undefined,
      }));
    }
  }, [dispatch, page, searchQuery, statusFilter, subscriptionFilter, activeTab]);

  const handleToggleStatus = (id: string, currentIsActive: boolean) => {
    dispatch(updateLawyerStatus({ id, isActive: !currentIsActive }));
  };

  const isFiltering = Boolean(searchQuery.trim() || statusFilter || subscriptionFilter);

  const tableData: LawyersTableRow[] = lawyersList.map((l) => ({
    key: l.id,
    fullName: l.fullName || "-",
    lawFirmName: l.lawFirmName || "-",
    specialization: l.specialization || "-",
    barNumber: l.barNumber || "-",
    numberOfCases: l.numberOfCases,
    subscriptionPlanName: l.subscriptionPlanName || "-",
    status: (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          l.isActive
            ? "bg-[var(--success-soft)] text-[var(--success-color)]"
            : "bg-[var(--danger-soft)] text-[var(--danger-color)]"
        }`}
      >
        {l.isActive ? "نشط" : "موقوف"}
      </span>
    ),
    actions: (
      <Button
        size="sm"
        color={l.isActive ? "danger" : "success"}
        variant="flat"
        className="h-8 min-w-[70px] px-2 text-xs font-bold rounded-lg"
        isDisabled={isUpdatingStatus}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggleStatus(l.id, l.isActive);
        }}
      >
        {l.isActive ? "إيقاف" : "تنشيط"}
      </Button>
    ),
  }));

  const statsTableData: LawyersTableRow[] = statsList.map((item) => ({
    key: item.lawyerId,
    fullName: item.fullName || "-",
    phoneNumber: item.phoneNumber || "-",
    casesCount: item.casesCount,
    completedStepsCount: item.completedStepsCount,
    workflowVersionsCount: item.workflowVersionsCount,
  }));

  if (isLoading && lawyersList.length === 0) {
    return (
      <section className="lawyers">
        <Container>
          <HeadTitle title="إدارة المحامين" />
          <SkeletonStatsCards />
          <SkeletonStatsCards />
          <div className="w-full">
            <SkeletonTable rows={7} cols={8} />
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
            iconColor: "var(--main-color)",
            text: "إجمالي المحامين",
            number: lawyersReport?.totalLawyers ?? 0,
          }}
          card2={{
            icon: <FaUserCheck />,
            iconColor: "#34BF49",
            text: "المحامين النشطين",
            number: lawyersReport?.totalActive ?? 0,
          }}
          card3={{
            icon: <FaUsers />,
            iconColor: "#06B6D4",
            text: "المحامين الموقوفين",
            number: lawyersReport?.totalInactive ?? 0,
          }}
        />

        <StatsCards
          card1={{
            icon: <FaUsers />,
            iconColor: "#3B82F6",
            text: "المشتركين في الباقة التجريبية",
            number: lawyersReport?.activeTrialSubscribers ?? 0,
          }}
          card2={{
            icon: <FaCrown />,
            iconColor: "#F59E0B",
            text: "المشتركين في الباقات المدفوعة",
            number: lawyersReport?.activePaidSubscribers ?? 0,
          }}
          card3={{
            icon: <FaUserClock />,
            iconColor: "#EF4444",
            text: "الاشتراكات المنتهية",
            number: lawyersReport?.expiredSubscribers ?? 0,
          }}
        />

        {/* Tab Sub-Navigation */}
        <div className="flex gap-4 mb-6 border-b border-[var(--border-color,#1B1B1B15)] pb-3 rtl">
          <button
            type="button"
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative ${
              activeTab === "accounts"
                ? "text-[var(--main-color)] bg-[var(--main-color)]/5 border-b-2 border-[var(--main-color)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--main-color)]/5 hover:text-[var(--main-color)]"
            }`}
            onClick={() => handleTabChange("accounts")}
          >
            إدارة الحسابات
          </button>
          <button
            type="button"
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative ${
              activeTab === "stats"
                ? "text-[var(--main-color)] bg-[var(--main-color)]/5 border-b-2 border-[var(--main-color)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--main-color)]/5 hover:text-[var(--main-color)]"
            }`}
            onClick={() => handleTabChange("stats")}
          >
            إحصائيات القضايا
          </button>
        </div>

        <SubTitle
          title="تقارير تفصيلية :"
          components={
            activeTab === "stats" && (
              <Button
                size="md"
                color="default"
                radius="full"
                variant="flat"
                className="font-bold border border-[var(--border-color,#1B1B1B15)] bg-white shadow-sm"
                isLoading={isExporting}
                onClick={handleDownloadReport}
                startContent={<img src="/images/icons-excel.png" alt="excel" className="w-5 h-5" />}
              >
                تحميل التقرير
              </Button>
            )
          }
        />
        
        <AdminFilterToolbar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder={
            activeTab === "accounts"
              ? "ابحث بالاسم، المكتب، البريد، الهاتف، رقم النقابة..."
              : "ابحث بالاسم أو رقم الهاتف..."
          }
          totalCount={activeTab === "accounts" ? totalCount : (lawyerCasesStats?.totalCount ?? 0)}
          filteredCount={activeTab === "accounts" ? totalCount : (lawyerCasesStats?.totalCount ?? 0)}
          isFiltering={activeTab === "accounts" ? isFiltering : Boolean(searchQuery.trim())}
          onReset={() => {
            setSearchQuery("");
            if (activeTab === "accounts") {
              setStatusFilter("");
              setSubscriptionFilter("");
            }
            setPage(1);
          }}
          filters={
            activeTab === "accounts"
              ? [
                  {
                    key: "status",
                    label: "حالة الحساب",
                    value: statusFilter,
                    onChange: handleStatusFilterChange,
                    options: [
                      { value: "", label: "الكل" },
                      { value: "active", label: "نشط" },
                      { value: "inactive", label: "موقوف" },
                    ],
                  },
                  {
                    key: "subscription",
                    label: "حالة الاشتراك",
                    value: subscriptionFilter,
                    onChange: handleSubscriptionFilterChange,
                    options: [
                      { value: "", label: "الكل" },
                      { value: "active", label: "اشتراك نشط" },
                      { value: "inactive", label: "بدون اشتراك نشط" },
                    ],
                  },
                ]
              : []
          }
        />
        
        <div className="w-full">
          <ServerPaginationTable
            data={activeTab === "accounts" ? tableData : statsTableData}
            columns={activeTab === "accounts" ? columns : statsColumns}
            page={page}
            totalPages={activeTab === "accounts" ? totalPages : (lawyerCasesStats?.totalPages ?? 1)}
            onPageChange={setPage}
            isLoading={activeTab === "accounts" ? isLoading : isLoadingLawyerCasesStats}
          />
        </div>
      </Container>
    </section>
  );
};

export default Lawyers;
