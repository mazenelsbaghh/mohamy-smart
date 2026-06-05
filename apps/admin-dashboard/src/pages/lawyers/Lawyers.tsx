import { Container } from '@mohamy/shared-ui';
import { useEffect, useState } from "react";
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

const Lawyers = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  const { list, isLoading, totalPages, totalCount, isUpdatingStatus } = useAppSelector(
    (state) => state.lawyers
  );
  const { lawyersReport } = useAppSelector(
    (state) => state.reports
  );
  const lawyersList = Array.isArray(list) ? list : [];

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

  useEffect(() => {
    dispatch(fetchLawyersReport());
  }, [dispatch]);

  useEffect(() => {
    const trimmedSearch = searchQuery.trim();
    dispatch(fetchLawyers({
      pageNumber: page,
      search: trimmedSearch || undefined,
      isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      subscriptionIsActive: subscriptionFilter === "active" ? true : subscriptionFilter === "inactive" ? false : undefined,
    }));
  }, [dispatch, page, searchQuery, statusFilter, subscriptionFilter]);

  const handleToggleStatus = (id: string, currentIsActive: boolean) => {
    dispatch(updateLawyerStatus({ id, isActive: !currentIsActive }));
  };

  const isFiltering = Boolean(searchQuery.trim() || statusFilter || subscriptionFilter);

  const tableData = lawyersList.map((l) => ({
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

        <SubTitle title="تقارير تفصيلية :" />
        <AdminFilterToolbar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="ابحث بالاسم، المكتب، البريد، الهاتف، رقم النقابة..."
          totalCount={totalCount}
          filteredCount={totalCount}
          isFiltering={isFiltering}
          onReset={() => {
            setSearchQuery("");
            setStatusFilter("");
            setSubscriptionFilter("");
            setPage(1);
          }}
          filters={[
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
          ]}
        />
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
