import { Container, CustomTable } from'@mohamy/shared-ui';
import { useEffect, useState } from"react";
import { useAppDispatch, useAppSelector } from"../../redux/hooks";
import HeadTitle from"../../components/public/headTitle/HeadTitle";
import SubTitle from"../../components/public/subTitle/SubTitle";

import fetchSubscriptionsReport from"../../redux/subscriptions/thunk/fetchSubscriptionsReport";
import SkeletonTable from"../../components/skeleton/SkeletonTable";
import AdminFilterToolbar from"../../components/adminFilters/AdminFilterToolbar";
import { recordMatchesAdminSearch } from"../../components/adminFilters/adminFilterUtils";

const columns = [
 { key:"lawyerName", label:"اسم المستخدم" },
 { key:"planName", label:"الخطة" },
 { key:"startDate", label:"تاريخ البداية" },
 { key:"endDate", label:"تاريخ الانتهاء" },
 { key:"isActiveLabel", label:"الحالة" },
];

const SubscriptionReports = () => {
 const dispatch = useAppDispatch();
 const { records, isLoading } = useAppSelector(
 (state) => state.subscriptions
 );
 const [statusFilter, setStatusFilter] = useState<string>("");
 const [planFilter, setPlanFilter] = useState<string>("");
 const [subscriptionTypeFilter, setSubscriptionTypeFilter] = useState<string>("");
 const [searchQuery, setSearchQuery] = useState<string>("");

 useEffect(() => {
 const isActive =
 statusFilter ==="نشط" ? true : statusFilter ==="غير نشط" ? false : undefined;
 const isPaid =
 subscriptionTypeFilter ==="paid" ? true : subscriptionTypeFilter ==="trial" ? false : undefined;
 const params = {
 ...(isActive !== undefined ? { isActive } : {}),
 ...(isPaid !== undefined ? { isPaid } : {}),
 };
 dispatch(fetchSubscriptionsReport(Object.keys(params).length ? params : undefined));
 }, [dispatch, statusFilter, subscriptionTypeFilter]);

 const filteredRecords = records.filter((r) => {
 const matchesPlan = planFilter ? r.planName === planFilter : true;
 const matchesSearch = recordMatchesAdminSearch(searchQuery, [
 r.lawyerName,
 r.planName,
 r.isActive ?"نشطة" :"منتهية",
 r.isTrial ?"تجريبية" :"مدفوعة",
 ]);
 return matchesPlan && matchesSearch;
 });

 const tableData = filteredRecords.map((r) => ({
 key: r.lawyerId,
 lawyerName: r.lawyerName ||"-",
 planName: r.isTrial ? (
    <div className="flex items-center gap-1.5 justify-start">
      <span>{r.planName}</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--main-color)]/10 text-[var(--main-color)] font-medium">تجريبية</span>
    </div>
  ) : r.planName ||"-",
 startDate: r.startDate ? new Date(r.startDate).toLocaleDateString("ar-EG") :"-",
 endDate: r.endDate ? new Date(r.endDate).toLocaleDateString("ar-EG") :"-",
 isActiveLabel: r.isActive ?"نشطة" :"منتهية",
 }));

 const uniquePlans = [...new Set(records.map((r) => r.planName).filter(Boolean))];
 const isFiltering = Boolean(searchQuery.trim() || statusFilter || planFilter || subscriptionTypeFilter);

 return (
 <section>
 <Container>
 <HeadTitle title="إدارة الاشتراكات" />

 <SubTitle title="تقارير تفصيلية :" />
 <AdminFilterToolbar
 searchValue={searchQuery}
 onSearchChange={setSearchQuery}
 searchPlaceholder="ابحث باسم المستخدم أو الخطة..."
 totalCount={records.length}
 filteredCount={filteredRecords.length}
 isFiltering={isFiltering}
 onReset={() => {
 setSearchQuery("");
 setStatusFilter("");
 setSubscriptionTypeFilter("");
 setPlanFilter("");
 }}
 filters={[
 {
 key:"status",
 label:"الحالة",
 value: statusFilter,
 onChange: setStatusFilter,
 options: [
 { value:"", label:"الكل" },
 { value:"نشط", label:"نشط" },
 { value:"غير نشط", label:"غير نشط" },
 ],
 },
 {
 key:"type",
 label:"نوع الاشتراك",
 value: subscriptionTypeFilter,
 onChange: setSubscriptionTypeFilter,
 options: [
 { value:"", label:"الكل" },
 { value:"paid", label:"مدفوعة فقط" },
 { value:"trial", label:"تجريبية فقط" },
 ],
 },
 {
 key:"plan",
 label:"الخطة",
 value: planFilter,
 onChange: setPlanFilter,
 options: [
 { value:"", label:"الكل" },
 ...uniquePlans.map(p => ({ value: p, label: p })),
 ],
 },
 ]}
 />
  {isLoading ? (
  <div className="w-full">
  <SkeletonTable rows={8} cols={5} />
  </div>
  ) : (
 <div className="w-full">
 {tableData.length ? (
 <CustomTable data={tableData} columns={columns} />
 ) : (
 <div className="w-full rounded-xl border border-[var(--border-color,#1B1B1B15)] bg-[var(--card-bg,#FBFAE8)] p-6 text-center text-sm text-[var(--text-secondary)]">
 لا توجد اشتراكات مطابقة للفلاتر الحالية
 </div>
 )}
 </div>
 )}
 </Container>
 </section>
 );
};

export default SubscriptionReports;
